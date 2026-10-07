import { Request, Response, NextFunction } from 'express';
import { toppingService } from './topping.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
});

const createToppingSchema = z.object({
    name: z.string().min(1, 'Tên topping không được để trống').max(50, 'Tên topping tối đa 50 ký tự').trim(),
    price: z.number().int('Giá phải là số nguyên').min(1, 'Giá topping phải lớn hơn 0').max(1000000, 'Giá topping tối đa 1.000.000đ'),
    isActive: z.boolean().optional(),
    groupIds: z.array(z.uuid('Group ID không hợp lệ')).optional()
});

const updateToppingSchema = z.object({
    name: z.string().min(1, 'Tên topping không được để trống').max(50, 'Tên topping tối đa 50 ký tự').trim().optional(),
    price: z.number().int('Giá phải là số nguyên').min(1, 'Giá topping phải lớn hơn 0').max(1000000, 'Giá topping tối đa 1.000.000đ').optional(),
    isActive: z.boolean().optional(),
    groupIds: z.array(z.uuid('Group ID không hợp lệ')).optional()
});

export const toppingController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const toppings = await toppingService.getAll();
            res.status(200).json({ status: 'success', data: toppings });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const topping = await toppingService.getById(id);
            if (!topping) throw new AppError(404, 'Không tìm thấy topping');
            res.status(200).json({ status: 'success', data: topping });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createToppingSchema.parse(req.body);
            const newTopping = await toppingService.create(data);
            res.status(201).json({ status: 'success', data: newTopping });
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
