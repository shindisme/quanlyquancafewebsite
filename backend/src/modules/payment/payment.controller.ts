import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { z } from 'zod';

export const paymentController = {
  async getByInvoiceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = z.object({ invoiceId: z.uuid() }).parse(req.params);
      const data = await paymentService.getPaymentsByInvoiceId(invoiceId);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }
};
