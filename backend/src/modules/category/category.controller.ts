import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.string().uuid('id không hợp lệ')
});

const categorySchema = z.object({
    name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(50, 'Tên danh mục tối đa 50 ký tự').trim()
});
export const categoryController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const data = await categoryService.getAllCategories(page, limit);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const category = await categoryService.getCategoryById(id);
            if (!category) {
                throw { statusCode: 404, message: "Không tìm thấy danh mục" } as AppError;
            }
            res.status(200).json({ status: 'success', data: category });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = categorySchema.parse(req.body);

            const newCategory = await categoryService.createCategory(validatedData);

            res.status(201).json({ status: 'success', data: newCategory });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const validatedData = categorySchema.parse(req.body);

            const updatedCategory = await categoryService.updateCategory(id, validatedData);
            res.status(200).json({ status: 'success', data: updatedCategory });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await categoryService.deleteCategory(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa danh mục thành công' });
        } catch (error) {
            next(error);
        }
    }
};
