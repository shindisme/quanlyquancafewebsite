import prisma from '../../config/prisma.js';

export const paymentService = {
  async getPaymentsByInvoiceId(invoiceId: string) {
    return await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' }
    });
  }
};
