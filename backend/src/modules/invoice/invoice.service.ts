import prisma from '../../config/prisma.js';
import { InvoiceStatus } from '../../generated/prisma/index.js';

function generateCode(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export const invoiceService = {
  async getAll(status?: InvoiceStatus) {
    return await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      include: {
        table: { select: { name: true, area: { select: { name: true } } } },
        user: { select: { name: true } },
        coupon: { select: { code: true, discountType: true, discountValue: true } },
        orders: {
          select: { id: true, code: true, subTotal: true, status: true, createdAt: true },
          orderBy: { createdAt: 'asc' }
        },
        payments: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getById(id: string) {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        table: { select: { name: true, area: { select: { name: true } } } },
        user: { select: { name: true } },
        coupon: true,
        orders: {
          include: {
            orderDetails: {
              include: {
                product: { select: { name: true, image: true } },
                size: { select: { sizeName: true } },
                orderDetailsToppings: {
                  include: { topping: { select: { name: true } } }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        payments: true
      }
    });
  },

  async getUnpaidByTable(tableId: string) {
    return await prisma.invoice.findFirst({
      where: { tableId, status: 'UNPAID' },
      include: {
        table: { select: { name: true, code: true, area: { select: { name: true } } } },
        orders: {
          include: {
            orderDetails: {
              include: {
                product: { select: { name: true, image: true, price: true } },
                size: { select: { sizeName: true, extraPrice: true } },
                orderDetailsToppings: {
                  include: { topping: { select: { name: true } } }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  },

  async create(tableId: string) {
    return await prisma.$transaction(async (tx) => {
      // Kiểm tra bàn đã có hoá đơn chưa thanh toán chưa
      const existing = await tx.invoice.findFirst({
        where: { tableId, status: 'UNPAID' }
      });
      if (existing) return existing;

      const invoice = await tx.invoice.create({
        data: {
          code: generateCode('INV'),
          tableId,
          status: 'UNPAID'
        },
        include: {
          table: { select: { name: true, code: true } }
        }
      });

      // Tự động chuyển bàn thành "Đang dùng"
      await tx.table.update({
        where: { id: tableId },
        data: { isBooked: true }
      });

      return invoice;
    });
  },

  async recalculate(invoiceId: string) {
    const orders = await prisma.order.findMany({
      where: {
        invoiceId,
        status: { not: 'CANCELLED' }
      }
    });
    const totalAmount = orders.reduce((sum, o) => sum + o.subTotal, 0);

    return await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        totalAmount,
        finalAmount: totalAmount // Sẽ trừ discount khi thanh toán
      }
    });
  },

  async processPayment(invoiceId: string, data: {
    method: 'CASH' | 'VNPAY';
    couponCode?: string;
    userId?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { orders: true }
      });

      if (!invoice) throw { statusCode: 404, message: 'Không tìm thấy hoá đơn' };
      if (invoice.status !== 'UNPAID') throw { statusCode: 400, message: 'Hoá đơn đã được xử lý' };

      // Tính tổng tiền từ các Order chưa huỷ
      const totalAmount = invoice.orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.subTotal, 0);

      let discountAmount = 0;
      let couponId: string | null = null;

      // Apply coupon 
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode }
        });

        if (coupon && !coupon.deletedAt && coupon.isActive) {
          const now = new Date();
          const isDateValid = now >= coupon.startDate && (!coupon.endDate || now <= coupon.endDate);
          const isLimitOk = !coupon.limit || coupon.usedCount < coupon.limit;
          const isMinOk = totalAmount >= coupon.minValue;

          if (isDateValid && isLimitOk && isMinOk) {
            if (coupon.discountType === 'PERCENT') {
              discountAmount = Math.floor((totalAmount * coupon.discountValue) / 100);
              if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            discountAmount = Math.min(discountAmount, totalAmount);
            couponId = coupon.id;

            // Tăng usedCount
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } }
            });
          }
        }
      }

      const finalAmount = totalAmount - discountAmount;

      // Tạo Payment
      await tx.payment.create({
        data: {
          invoiceId,
          method: data.method,
          amount: finalAmount,
          status: 'SUCCESS'
        }
      });

      // Cập nhật Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          totalAmount,
          discountAmount,
          finalAmount,
          couponId,
          userId: data.userId || null,
          status: 'PAID',
          paidAt: new Date()
        },
        include: {
          table: { select: { name: true } },
          orders: {
            select: { code: true, subTotal: true, status: true }
          },
          payments: true
        }
      });

      //Chuyển bàn thành trống
      if (invoice.tableId) {
        await tx.table.update({
          where: { id: invoice.tableId },
          data: { isBooked: false }
        });
      }

      return updatedInvoice;
    });
  },

  async cancel(invoiceId: string) {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw { statusCode: 404, message: 'Không tìm thấy hoá đơn' };
      if (invoice.status !== 'UNPAID') throw { statusCode: 400, message: 'Chỉ huỷ được hoá đơn chưa thanh toán' };

      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'CANCELLED' }
      });

      // Huỷ tất cả order chưa xong
      await tx.order.updateMany({
        where: { invoiceId, status: { in: ['PENDING', 'CONFIRMED'] } },
        data: { status: 'CANCELLED' }
      });

      //Chuyển bàn thành trống
      if (invoice.tableId) {
        await tx.table.update({
          where: { id: invoice.tableId },
          data: { isBooked: false }
        });
      }

      return updated;
    });
  }
};

export { generateCode };
