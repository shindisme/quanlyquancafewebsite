import { Request, Response, NextFunction } from 'express';
import { invoiceService } from './invoice.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramSchema = z.object({ id: z.string().uuid() });

export const invoiceController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as any;
      const data = await invoiceService.getAll(status || undefined);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const data = await invoiceService.getById(id);
      if (!data) throw { statusCode: 404, message: 'Không tìm thấy hoá đơn' } as AppError;
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getByTable(req: Request, res: Response, next: NextFunction) {
    try {
      const tableId = req.params.tableId as string;
      if (!tableId) {
        return res.status(400).json({ status: 'error', message: 'Thiếu tableId' });
      }
      const data = await invoiceService.getUnpaidByTable(tableId);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = z.object({ tableId: z.string().uuid() }).parse(req.body);
      const data = await invoiceService.create(tableId);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const body = z.object({
        method: z.enum(['CASH', 'VNPAY']),
        couponCode: z.string().optional()
      }).parse(req.body);

      const userId = req.user?.id;

      const data = await invoiceService.processPayment(id, {
        ...body,
        userId
      });

      res.status(200).json({ status: 'success', data, message: 'Thanh toán thành công' });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const data = await invoiceService.cancel(id);
      res.status(200).json({ status: 'success', data, message: 'Đã huỷ hoá đơn' });
    } catch (error) {
      next(error);
    }
  }
};
