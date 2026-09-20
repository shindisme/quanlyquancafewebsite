import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
})

const createProductSchema = z.object({
    name: z.string().min(1, 'Tên sản phẩm không được để trống').max(100, 'Tên sản phẩm tối đa 100 ký tự').trim(),
    categoryId: z.uuid('Danh mục không hợp lệ'),
    toppingGroupId: z.uuid('Nhóm Topping không hợp lệ').nullable().optional(),
    price: z.number().int('Giá phải là số nguyên').positive('Giá phải là số nguyên dương').max(10000000, 'Giá không được vượt quá 10.000.000đ'),
    description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
    image: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    sizes: z.array(z.object({
        sizeName: z.string().min(1, 'Tên size không được để trống').max(20, 'Tên size tối đa 20 ký tự'),
        extraPrice: z.number().int('Giá phụ phải là số nguyên').nonnegative('Giá phụ không được âm').max(5000000, 'Giá phụ tối đa 5.000.000đ')
    })).max(10, 'Tối đa 10 size').optional()
});

const updateProductSchema = createProductSchema.partial();

export const productController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const data = await productService.getAll(page, limit);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const product = await productService.getById(id);
            if (!product) throw { statusCode: 404, message: 'Không tìm thấy sản phẩm' } as AppError;
            res.status(200).json({ status: 'success', data: product });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createProductSchema.parse(req.body);
            const newProduct = await productService.create(data);
            res.status(201).json({ status: 'success', data: newProduct });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const data = updateProductSchema.parse(req.body);
            const updated = await productService.update(id, data);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await productService.remove(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa sản phẩm thành công' });
        } catch (error) {
            next(error);
        }
    }
};
