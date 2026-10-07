import { Request, Response, NextFunction } from 'express';
import { tableService } from './table.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
});

const createTableSchema = z.object({
    name: z.string().min(1, 'Tên bàn không được để trống').max(30, 'Tên bàn tối đa 30 ký tự').trim(),
    areaId: z.uuid('Khu vực không hợp lệ')
});

const updateTableSchema = z.object({
    name: z.string().min(1, 'Tên bàn không được để trống').max(30, 'Tên bàn tối đa 30 ký tự').trim().optional(),
    areaId: z.uuid('Khu vực không hợp lệ').optional()
});

const bookingSchema = z.object({
    isBooked: z.boolean()
});

export const tableController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tables = await tableService.getAll();
            res.status(200).json({ status: 'success', data: tables });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const table = await tableService.getById(id);
            if (!table) throw new AppError(404, 'Không tìm thấy bàn');
            res.status(200).json({ status: 'success', data: table });
        } catch (error) {
            next(error);
        }
    },

    async getByCode(req: Request, res: Response, next: NextFunction) {
        try {
            const code = z.string().min(1, 'Mã bàn không được để trống').parse(req.params.code);
            const table = await tableService.getByCode(code);
            if (!table) throw new AppError(404, 'Không tìm thấy bàn với mã này');
            res.status(200).json({ status: 'success', data: table });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createTableSchema.parse(req.body);
            const newTable = await tableService.create(data);
            res.status(201).json({ status: 'success', data: newTable });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const data = updateTableSchema.parse(req.body);
            const updated = await tableService.update(id, data);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async updateBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const { isBooked } = bookingSchema.parse(req.body);
            const updated = await tableService.setBookingStatus(id, isBooked);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await tableService.remove(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa bàn thành công' });
        } catch (error) {
            next(error);
        }
    }
};
