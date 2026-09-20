import { Request, Response, NextFunction } from 'express';
import { toppingGroupService } from './topping-group.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
});

const createToppingGroupSchema = z.object({
    name: z.string().min(1, 'Tên nhóm không được để trống').max(100, 'Tên nhóm tối đa 100 ký tự').trim(),
    description: z.string().max(255, 'Mô tả tối đa 255 ký tự').optional(),
    toppingIds: z.array(z.string().uuid('Topping ID không hợp lệ')).default([])
});

const updateToppingGroupSchema = z.object({
    name: z.string().min(1, 'Tên nhóm không được để trống').max(100, 'Tên nhóm tối đa 100 ký tự').trim().optional(),
    description: z.string().max(255, 'Mô tả tối đa 255 ký tự').optional(),
    toppingIds: z.array(z.string().uuid('Topping ID không hợp lệ')).optional()
});

export const toppingGroupController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const groups = await toppingGroupService.getAll();
            res.status(200).json({ status: 'success', data: groups });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const group = await toppingGroupService.getById(id);
            if (!group) throw { statusCode: 404, message: 'Không tìm thấy nhóm topping' } as AppError;
            res.status(200).json({ status: 'success', data: group });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createToppingGroupSchema.parse(req.body);
            const newGroup = await toppingGroupService.create(data);
            res.status(201).json({ status: 'success', data: newGroup });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const data = updateToppingGroupSchema.parse(req.body);
            const updated = await toppingGroupService.update(id, data);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await toppingGroupService.remove(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa nhóm topping thành công' });
        } catch (error) {
            next(error);
        }
    }
};
