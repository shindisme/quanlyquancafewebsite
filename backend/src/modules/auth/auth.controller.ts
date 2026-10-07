import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.username, data.password);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Không tìm thấy thông tin người dùng');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: { id: true, username: true, email: true, name: true, role: true, createdAt: true }
      });

      if (!user) {
        throw new AppError(404, 'Người dùng không tồn tại');
      }

      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }
};
