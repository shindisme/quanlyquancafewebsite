import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service.js';
import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';

const paramSchema = z.object({ id: z.string().uuid() });

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  sizeId: z.string().uuid().optional(),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0').max(99, 'Số lượng tối đa 99'),
  price: z.number().nonnegative('Giá không được âm').max(10000000, 'Giá tối đa 10.000.000đ'),
  note: z.string().max(200, 'Ghi chú tối đa 200 ký tự').optional(),
  toppings: z.array(z.object({
    toppingId: z.string().uuid(),
    price: z.number().nonnegative().max(1000000)
  })).max(10, 'Tối đa 10 topping').default([])
});

const createOrderSchema = z.object({
  tableId: z.string().uuid('Bàn không hợp lệ'),
  items: z.array(orderItemSchema).min(1, 'Phải có ít nhất 1 món').max(50, 'Tối đa 50 món mỗi đơn')
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
});

export const orderController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderService.getAll();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const data = await orderService.getById(id);
      if (!data) throw { statusCode: 404, message: 'Không tìm thấy đơn hàng' } as AppError;
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createOrderSchema.parse(req.body);
      const result = await orderService.create(parsedData);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const { status } = updateStatusSchema.parse(req.body);
      const updatedOrder = await orderService.updateStatus(id, status);
      res.status(200).json({ status: 'success', data: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
};
