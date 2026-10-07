import { Request, Response, NextFunction } from 'express';
import { areaService } from './area.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const paramsSchema = z.object({
    id: z.uuid('id không hợp lệ')
});

const areaSchema = z.object({
    name: z.string().trim().min(1, 'Tên khu vực không được để trống').max(50, 'Tên khu vực tối đa 50 ký tự')
});

export const areaController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const areas = await areaService.getAllAreas();
            res.status(200).json({ status: 'success', data: areas });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const area = await areaService.getAreaById(id);
            if (!area) {
                throw new AppError(404, 'Không tìm thấy khu vực');
            }
            res.status(200).json({ status: 'success', data: area });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = areaSchema.parse(req.body);
            const newArea = await areaService.createArea(name);
            res.status(201).json({ status: 'success', data: newArea });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            const { name } = areaSchema.parse(req.body);
            const updated = await areaService.updateArea(id, name);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = paramsSchema.parse(req.params);
            await areaService.deleteArea(id);
            res.status(200).json({ status: 'success', message: 'Đã xóa khu vực thành công' });
        } catch (error) {
            next(error);
        }
    }
};
