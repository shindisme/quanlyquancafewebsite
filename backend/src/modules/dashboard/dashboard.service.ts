import prisma from '../../config/prisma.js';

// Múi giờ Việt Nam (UTC+7, không có quy ước giờ mùa hè DST)
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export const dashboardService = {
  async getStats() {
    const now = new Date();
    // Chuyển mốc thời gian hiện tại về góc nhìn múi giờ Việt Nam (UTC+7)
    const vnNow = new Date(now.getTime() + VN_OFFSET_MS);

    const vnYear = vnNow.getUTCFullYear();
    const vnMonth = vnNow.getUTCMonth();
    const vnDate = vnNow.getUTCDate();

    // Đầu ngày hôm nay (00:00:00 VN) và đầu ngày mai (00:00:00 VN) tính theo UTC
    const todayStart = new Date(Date.UTC(vnYear, vnMonth, vnDate) - VN_OFFSET_MS);
    const tomorrowStart = new Date(Date.UTC(vnYear, vnMonth, vnDate + 1) - VN_OFFSET_MS);

    // 7 ngày gần nhất (bao gồm hôm nay: từ hôm nay lùi về 6 ngày trước)
    const sevenDaysAgoStart = new Date(Date.UTC(vnYear, vnMonth, vnDate - 6) - VN_OFFSET_MS);

    // 30 ngày gần nhất (bao gồm hôm nay: từ hôm nay lùi về 29 ngày trước)
    const thirtyDaysAgoStart = new Date(Date.UTC(vnYear, vnMonth, vnDate - 29) - VN_OFFSET_MS);

    // Thực hiện song song toàn bộ các truy vấn độc lập
    const [
      todayAgg,
      weekAgg,
      monthAgg,
      todayOrders,
      activeTables,
      totalTables,
      unpaidInvoices,
      topProductsGroup,
      chartInvoices,
    ] = await Promise.all([
      // 1. Doanh thu & số hóa đơn hôm nay
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: todayStart, lt: tomorrowStart },
        },
        _sum: { finalAmount: true },
        _count: { _all: true },
      }),

      // 2. Doanh thu & số hóa đơn 7 ngày gần nhất
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: sevenDaysAgoStart, lt: tomorrowStart },
        },
        _sum: { finalAmount: true },
        _count: { _all: true },
      }),

      // 3. Doanh thu & số hóa đơn 30 ngày gần nhất
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: thirtyDaysAgoStart, lt: tomorrowStart },
        },
        _sum: { finalAmount: true },
        _count: { _all: true },
      }),

      // 4. Số đơn hàng hôm nay
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      }),

      // 5. Bàn đang dùng
      prisma.table.count({
        where: { isBooked: true, deletedAt: null },
      }),

      // 6. Tổng số bàn
      prisma.table.count({
        where: { deletedAt: null },
      }),

      // 7. Hóa đơn chưa thanh toán
      prisma.invoice.count({
        where: { status: 'UNPAID' },
      }),

      // 8. Top 5 sản phẩm bán chạy (30 ngày gần nhất, không tính đơn hủy)
      prisma.orderDetail.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: {
          order: {
            createdAt: { gte: thirtyDaysAgoStart, lt: tomorrowStart },
            status: { not: 'CANCELLED' },
          },
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // 9. Dữ liệu hóa đơn 7 ngày phục vụ biểu đồ (chỉ lấy 2 trường cần thiết)
      prisma.invoice.findMany({
        where: {
          status: 'PAID',
          paidAt: { gte: sevenDaysAgoStart, lt: tomorrowStart },
        },
        select: {
          paidAt: true,
          finalAmount: true,
        },
      }),
    ]);

    // Xử lý thông tin chi tiết Top 5 sản phẩm (tra cứu O(1) bằng Map, an toàn với sản phẩm đã xóa)
    let topProductsWithNames: {
      id: string;
      name: string;
      image?: string;
      price: number;
      totalSold: number;
    }[] = [];

    if (topProductsGroup.length > 0) {
      const productIds = topProductsGroup.map((p) => p.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, image: true, price: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      topProductsWithNames = topProductsGroup
        .map((tp) => {
          const prod = productMap.get(tp.productId);
          if (!prod) return null;
          return {
            id: prod.id,
            name: prod.name,
            image: prod.image ?? undefined,
            price: prod.price,
            totalSold: tp._sum.quantity || 0,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    // Nhóm doanh thu 7 ngày theo từng ngày lịch Việt Nam (định dạng dd/MM)
    const revenueByDay: { date: string; revenue: number; invoiceCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(Date.UTC(vnYear, vnMonth, vnDate - i) - VN_OFFSET_MS);
      const dEnd = new Date(Date.UTC(vnYear, vnMonth, vnDate - i + 1) - VN_OFFSET_MS);

      const dInvoices = chartInvoices.filter((inv) => {
        return inv.paidAt && inv.paidAt >= dStart && inv.paidAt < dEnd;
      });

      const calendarDate = new Date(Date.UTC(vnYear, vnMonth, vnDate - i));
      const dayStr = String(calendarDate.getUTCDate()).padStart(2, '0');
      const monthStr = String(calendarDate.getUTCMonth() + 1).padStart(2, '0');
      const dateLabel = `${dayStr}/${monthStr}`;

      revenueByDay.push({
        date: dateLabel,
        revenue: dInvoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0),
        invoiceCount: dInvoices.length,
      });
    }

    return {
      today: {
        revenue: todayAgg._sum.finalAmount ?? 0,
        invoiceCount: todayAgg._count._all,
        orderCount: todayOrders,
      },
      week: {
        revenue: weekAgg._sum.finalAmount ?? 0,
        invoiceCount: weekAgg._count._all,
      },
      month: {
        revenue: monthAgg._sum.finalAmount ?? 0,
        invoiceCount: monthAgg._count._all,
      },
      activeTables,
      totalTables,
      unpaidInvoices,
      topProducts: topProductsWithNames,
      revenueByDay,
    };
  },
};
