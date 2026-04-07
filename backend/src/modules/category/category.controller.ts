import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

// Định nghĩa khung kiểm tra dữ liệu bằng Zod (Khách phải nhập 'name' là chuỗi)
const categorySchema = z.object({
    name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự")
});

// BỒI BÀN (CONTROLLER): Nhận yêu cầu từ người dùng và gọi Đầu Bếp (Service)
export const categoryController = {
    // Rót tất cả danh mục ra cho khách
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({ status: 'success', data: categories });
        } catch (error) {
            next(error);
        }
    },

    // Lấy 1 danh mục
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const category = await categoryService.getCategoryById(id);
            if (!category) {
                // Tự quăng lỗi, middleware Error Handler của chúng ta (vừa tạo lúc nãy) sẽ bắt được!
                throw { statusCode: 404, message: "Không tìm thấy danh mục" } as AppError;
            }
            res.status(200).json({ status: 'success', data: category });
        } catch (error) {
            next(error);
        }
    },

    // Tạo danh mục mới
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Kiểm tra khách nhập 'name' có chuẩn không?
            const validatedData = categorySchema.parse(req.body);
            
            // 2. Nhờ đầu bếp tạo trong database
            const newCategory = await categoryService.createCategory(validatedData.name);
            
            // 3. Mang món ra cho khách
            res.status(201).json({ status: 'success', data: newCategory });
        } catch (error) {
            next(error); // Ai dọn dẹp lỗi? Trả cho Error Middleware dọn!
        }
    },

    // Sửa danh mục
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const validatedData = categorySchema.parse(req.body);
            
            const updatedCategory = await categoryService.updateCategory(id, validatedData.name);
            res.status(200).json({ status: 'success', data: updatedCategory });
        } catch (error) {
            next(error);
        }
    },

    // Xóa danh mục
    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await categoryService.deleteCategory(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa danh mục thành công' });
        } catch (error) {
            next(error);
        }
    }
};
