import { Request, Response, NextFunction } from 'express';
import { couponService } from './coupon.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramSchema = z.object({ id: z.string().uuid() });

const baseCouponSchema = z.object({
  code: z.string().min(3, 'Mã coupon phải có ít nhất 3 ký tự').max(20, 'Mã coupon tối đa 20 ký tự').trim().toUpperCase(),
  discountType: z.enum(['PERCENT', 'VALUE']),
  discountValue: z.number().positive('Giá trị giảm phải lớn hơn 0').max(10000000, 'Giá trị giảm tối đa 10.000.000đ'),
  minValue: z.number().nonnegative('Đơn tối thiểu không được âm').max(100000000, 'Đơn tối thiểu tối đa 100.000.000đ').optional(),
  maxDiscount: z.number().positive('Giảm tối đa phải lớn hơn 0').max(10000000, 'Giảm tối đa tối đa 10.000.000đ').optional(),
  limit: z.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải lớn hơn 0').max(100000, 'Giới hạn tối đa 100.000 lượt').optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().nullable().optional().transform((str) => str ? new Date(str) : undefined)
});

const createCouponSchema = baseCouponSchema
  .refine(data => {
    if (data.discountType === 'PERCENT' && data.discountValue > 100) return false;
    return true;
  }, { message: 'Phần trăm giảm giá không được vượt quá 100%' })
  .refine(data => {
    if (data.endDate && data.endDate <= data.startDate) return false;
    return true;
  }, { message: 'Ngày kết thúc phải sau ngày bắt đầu' });

const updateCouponSchema = baseCouponSchema.partial().refine(data => {
  if (data.discountType === 'PERCENT' && data.discountValue && data.discountValue > 100) return false;
  return true;
}, { message: 'Phần trăm giảm giá không được vượt quá 100%' });

export const couponController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await couponService.getAll();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const data = await couponService.getValidCoupon(id);
      if (!data) throw { statusCode: 404, message: 'Coupon not found or invalid' } as AppError;
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.body.code || req.query.code;
      if (!code) throw { statusCode: 400, message: 'Vui lòng nhập mã giảm giá' } as AppError;
      const data = await couponService.getValidCoupon(code as string);
      if (!data) throw { statusCode: 404, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' } as AppError;
      res.status(200).json({ status: 'success', data, message: 'Áp dụng mã thành công' });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createCouponSchema.parse(req.body);
      const data = await couponService.create(parsedData);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      const parsedData = updateCouponSchema.parse(req.body);
      const data = await couponService.update(id, parsedData);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = paramSchema.parse(req.params);
      await couponService.delete(id);
      res.status(200).json({ status: 'success', message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};
