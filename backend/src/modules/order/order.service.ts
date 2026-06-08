import prisma from '../../config/prisma.js';
import { OrderStatus } from '../../generated/prisma/index.js';
import { generateCode } from '../invoice/invoice.service.js';
import { invoiceService } from '../invoice/invoice.service.js';

export const orderService = {
  async getAll() {
    return await prisma.order.findMany({
      include: {
        invoice: {
          select: {
            code: true,
            table: { select: { name: true } }
          }
        },
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
      orderBy: { createdAt: 'desc' }
    });
  },

  async getById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            code: true,
            table: { select: { name: true } },
            status: true
          }
        },
        orderDetails: {
          include: {
            product: { select: { name: true, image: true } },
            size: { select: { sizeName: true } },
            orderDetailsToppings: {
              include: { topping: { select: { name: true } } }
            }
          }
        }
      }
    });
  },

  async create(data: {
    tableId: string;
    items: {
      productId: string;
      sizeId?: string;
      quantity: number;
      price: number;
      note?: string;
      toppings: { toppingId: string; price: number }[];
    }[];
  }) {
    // Tìm hoặc tạo Invoice cho bàn
    const invoice = await invoiceService.create(data.tableId);

    // tính subTotal
    const subTotal = data.items.reduce((sum, item) => {
      const toppingTotal = item.toppings.reduce((s, t) => s + t.price, 0);
      return sum + (item.price + toppingTotal) * item.quantity;
    }, 0);

    // Tạo Order + OrderDetails
    const order = await prisma.order.create({
      data: {
        code: generateCode('ORD'),
        invoiceId: invoice.id,
        subTotal,
        status: 'PENDING',
        orderDetails: {
          create: data.items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            note: item.note || null,
            product: { connect: { id: item.productId } },
            size: item.sizeId ? { connect: { id: item.sizeId } } : undefined,
            orderDetailsToppings: {
              create: item.toppings.map(tp => ({
                topping: { connect: { id: tp.toppingId } },
                price: tp.price
              }))
            }
          }))
        }
      },
      include: {
        orderDetails: {
          include: {
            product: { select: { name: true } },
            orderDetailsToppings: true
          }
        }
      }
    });

    // Cập nhật tổng tiền Invoice
    await invoiceService.recalculate(invoice.id);

    return { order, invoiceId: invoice.id, invoiceCode: invoice.code };
  },

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    if (status === 'CANCELLED') {
      await invoiceService.recalculate(order.invoiceId);
    }

    return order;
  }
};
