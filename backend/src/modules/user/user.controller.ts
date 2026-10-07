import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
});

const createUserSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(30, 'Tên đăng nhập tối đa 30 ký tự').trim(),
    email: z.email('Email không hợp lệ').max(100, 'Email tối đa 100 ký tự'),
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên tối đa 50 ký tự').trim(),
    role: z.enum(['ADMIN', 'STAFF']).optional()
});

const updateUserSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên tối đa 50 ký tự').trim().optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional()
});

const changePasswordSchema = z.object({
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(50, 'Mật khẩu tối đa 50 ký tự'),
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại').optional()
});

export const userController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({ status: 'success', data: users });
        } catch (error) {
            next(error);
        }
    },

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const user = await userService.getUserById(id);
            if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
            res.status(200).json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createUserSchema.parse(req.body);
            const newUser = await userService.createUser(data);
            res.status(201).json({ status: 'success', data: newUser });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const data = updateUserSchema.parse(req.body);
            const updated = await userService.updateUser(id, data);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const { newPassword, oldPassword } = changePasswordSchema.parse(req.body);
            await userService.changePassword(id, newPassword, oldPassword);
            res.status(200).json({ status: 'success', message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await userService.deleteUser(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa người dùng thành công' });
        } catch (error) {
            next(error);
        }
    }
};
