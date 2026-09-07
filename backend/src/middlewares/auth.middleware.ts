import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next({ statusCode: 401, message: 'Vui lòng đăng nhập để tiếp tục' } as AppError);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next({ statusCode: 401, message: 'Token không hợp lệ' } as AppError);
  }

  const secret = process.env.JWT_SECRET || 'secretkey@2004';

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload as any;
    next();
  } catch (error) {
    return next({ statusCode: 401, message: 'Token không hợp lệ hoặc đã hết hạn' } as AppError);
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return next({ statusCode: 403, message: 'Bạn không có quyền thực hiện hành động này' } as AppError);
    }
    next();
  };
};
