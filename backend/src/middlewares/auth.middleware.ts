import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';
import { JWT_SECRET } from '../config/jwt.js';
import { jwtAuthPayloadSchema, type Role } from '../types/auth.type.js';

// Middleware xác thực người dùng qua JWT
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError(401, 'Vui lòng đăng nhập để tiếp tục'));
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return next(new AppError(401, 'Token không đúng định dạng Bearer'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = jwtAuthPayloadSchema.safeParse(decoded);

    if (!result.success) {
      return next(new AppError(401, 'Token không hợp lệ hoặc cấu trúc dữ liệu không đúng'));
    }

    req.user = {
      id: result.data.id,
      username: result.data.username,
      role: result.data.role,
    };
    next();
  } catch (error) {
    return next(new AppError(401, 'Token không hợp lệ hoặc đã hết hạn'));
  }
};

// Middleware phân quyền người dùng
// Ho tro cac cach truyen authorize ADMIN STAFF hoac mang
export const authorize = (...roles: (Role | Role[])[]) => {
  const allowedRoles = roles.flat();

  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new AppError(403, 'Bạn không có quyền thực hiện hành động này'));
    }
    next();
  };
};
