import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';

export class AppError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace?.(this, this.constructor);
    }
}

// Middleware xử lý lỗi chung 
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    // Ghi log lỗi ra console
    console.error(`[Error] ${req.method} ${req.url} : ${err.message || err}`);

    // Xử lý lỗi validation từ Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: err.issues.map((issue: ZodIssue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    // Các lỗi HTTP tùy biến từ AppError
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // Trường hợp còn lại trả về lỗi hệ thống 500
    return res.status(500).json({
        status: 'error',
        message: 'Lỗi máy chủ nội bộ',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

// Middleware xử lý khi không tìm thấy route
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): any => {
    return res.status(404).json({
        status: 'error',
        message: `Không tìm thấy đường dẫn: ${req.originalUrl}`
    });
};
