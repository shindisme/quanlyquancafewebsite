import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';
import { AppError } from '../../middlewares/error.middleware.js';

export const areaService = {
    async getAllAreas() {
        return await prisma.area.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: {
                tables: {
                    where: { deletedAt: null },
                    select: { id: true, name: true, code: true, isBooked: true }
                }
            }
        });
    },

    async getAreaById(id: string) {
        return await prisma.area.findFirst({
            where: { id, deletedAt: null },
            include: {
                tables: {
                    where: { deletedAt: null }
                }
            }
        });
    },

    async createArea(name: string) {
        const trimmedName = name.trim();

        // 1. Kiểm tra tên khu vực trùng lặp trong các khu vực đang hoạt động
        const existingArea = await prisma.area.findFirst({
            where: {
                name: { equals: trimmedName, mode: 'insensitive' },
                deletedAt: null
            }
        });

        if (existingArea) {
            throw new AppError(400, 'Tên khu vực đã tồn tại');
        }

        return await prisma.area.create({
            data: {
                id: uuidv7(),
                name: trimmedName
            }
        });
    },

    async updateArea(id: string, name: string) {
        const trimmedName = name.trim();

        // 1. Kiểm tra khu vực tồn tại và chưa bị xoá (soft delete)
        const area = await prisma.area.findFirst({
            where: { id, deletedAt: null }
        });

        if (!area) {
            throw new AppError(404, 'Không tìm thấy khu vực');
        }

        // 2. Kiểm tra tên mới có bị trùng với khu vực khác đang hoạt động không
        const duplicateArea = await prisma.area.findFirst({
            where: {
                name: { equals: trimmedName, mode: 'insensitive' },
                id: { not: id },
                deletedAt: null
            }
        });

        if (duplicateArea) {
            throw new AppError(400, 'Tên khu vực đã tồn tại');
        }

        return await prisma.area.update({
            where: { id },
            data: { name: trimmedName }
        });
    },

    async deleteArea(id: string) {
        // 1. Kiểm tra khu vực có tồn tại và chưa bị xoá
        const area = await prisma.area.findFirst({
            where: { id, deletedAt: null }
        });

        if (!area) {
            throw new AppError(404, 'Không tìm thấy khu vực');
        }

        // 2. Kiểm tra có bàn đang hoạt động trong khu vực không
        const activeTableCount = await prisma.table.count({
            where: { areaId: id, deletedAt: null }
        });

        if (activeTableCount > 0) {
            throw new AppError(400, `Không thể xoá khu vực đang có ${activeTableCount} bàn hoạt động`);
        }

        // 3. Kiểm tra tổng số bàn (kể cả đã soft delete) từng thuộc khu vực này
        const totalTableCount = await prisma.table.count({
            where: { areaId: id }
        });

        // Truong hop chua tung co ban nao gan vao thi xoa vinh vien
        if (totalTableCount === 0) {
            return await prisma.area.delete({ where: { id } });
        }

        // Truong hop da tung co du lieu ban thi xoa mem de luu lich su
        return await prisma.area.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
