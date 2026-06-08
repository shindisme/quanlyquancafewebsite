import prisma from '../../config/prisma.js';

export const dashboardService = {
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Doanh thu & số hoá đơn
    const [todayInvoices, weekInvoices, monthInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: 'PAID', paidAt: { gte: todayStart } }
      }),
      prisma.invoice.findMany({
        where: { status: 'PAID', paidAt: { gte: sevenDaysAgo } }
      }),
      prisma.invoice.findMany({
        where: { status: 'PAID', paidAt: { gte: thirtyDaysAgo } }
      }),
    ]);

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const weekRevenue = weekInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

    // Số đơn hàng hôm nay
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: todayStart } }
    });

    // Bàn đang dùng
    const activeTables = await prisma.table.count({
      where: { isBooked: true, deletedAt: null }
    });

    const totalTables = await prisma.table.count({
      where: { deletedAt: null }
    });

    // Hoá đơn chưa thanh toán
    const unpaidInvoices = await prisma.invoice.count({
      where: { status: 'UNPAID' }
    });

    // Top 5 sản phẩm bán chạy (30 ngày)
    const topProducts = await prisma.orderDetail.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'CANCELLED' }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    // Lấy tên sản phẩm
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price: true }
    });

    const topProductsWithNames = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId);
      return {
        ...product,
        totalSold: tp._sum.quantity || 0
      };
    });

    // Doanh thu 7 ngày gần nhất (cho biểu đồ)
    const revenueByDay: { date: string; revenue: number; invoiceCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayInvoices = weekInvoices.filter(inv => {
        const paidAt = inv.paidAt;
        return paidAt && paidAt >= dayStart && paidAt < dayEnd;
      });

      revenueByDay.push({
        date: dayStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0),
        invoiceCount: dayInvoices.length
      });
    }

    return {
      today: {
        revenue: todayRevenue,
        invoiceCount: todayInvoices.length,
        orderCount: todayOrders,
      },
      week: { revenue: weekRevenue, invoiceCount: weekInvoices.length },
      month: { revenue: monthRevenue, invoiceCount: monthInvoices.length },
      activeTables,
      totalTables,
      unpaidInvoices,
      topProducts: topProductsWithNames,
      revenueByDay,
    };
  }
};
