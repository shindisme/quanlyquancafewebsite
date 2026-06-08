import { Request, Response, NextFunction } from 'express';
import { toppingService } from './topping.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.string().uuid('id không hợp lệ')
});

const createToppingSchema = z.object({
    name: z.string().min(1, 'Tên topping không được để trống').max(50, 'Tên topping tối đa 50 ký tự').trim(),
    price: z.number().int('Giá phải là số nguyên').min(1, 'Giá topping phải lớn hơn 0').max(1000000, 'Giá topping tối đa 1.000.000đ'),
    categoryId: z.string().uuid('Danh mục không hợp lệ')
});

const updateToppingSchema = z.object({
    name: z.string().min(1, 'Tên topping không được để trống').max(50, 'Tên topping tối đa 50 ký tự').trim().optional(),
    price: z.number().int('Giá phải là số nguyên').min(1, 'Giá topping phải lớn hơn 0').max(1000000, 'Giá topping tối đa 1.000.000đ').optional(),
    categoryId: z.string().uuid('Danh mục không hợp lệ').optional()
});


export const toppingController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tables = await toppingService.getAll();
            res.status(200).json({ status: 'success', data: tables });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const table = await toppingService.getById(id);
            if (!table) throw { statusCode: 404, message: 'Không tìm thấy topping' } as AppError;
            res.status(200).json({ status: 'success', data: table });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createToppingSchema.parse(req.body);
            const newTable = await toppingService.create(data);
            res.status(201).json({ status: 'success', data: newTable });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const data = updateToppingSchema.parse(req.body);
            const updated = await toppingService.update(id, data);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await toppingService.remove(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa topping thành công' });
        } catch (error) {
            next(error);
        }
    }
};
