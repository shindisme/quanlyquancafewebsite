import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';

export interface AppError extends Error {
    statusCode?: number;
}

// Middleware xử lý lỗi chung 
export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    // Log lỗi ra console để debug
    console.error(`[Error] ${req.method} ${req.url} >> ${err.message}`);

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

    // Các lỗi HTTP custom mà mình tự throw (vd: throw new AppError(401, 'Unauthorized'))
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // Nếu không thuộc các loại trên, trả về lỗi 500 (Lỗi hệ thống)
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error (Lỗi máy chủ nội bộ)',
        // Gắn thêm stack trace nếu đang ở môi trường development để dễ fix bug
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

// Middleware bắt lỗi 404 (Không tìm thấy route)
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): any => {
    return res.status(404).json({
        status: 'error',
        message: `Không tìm thấy đường dẫn: ${req.originalUrl}`
    });
};
