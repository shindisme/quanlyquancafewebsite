import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const tableService = {
    async getAll() {
        return await prisma.table.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: { area: true }
        });
    },

    async getById(id: string) {
        return await prisma.table.findUnique({
            where: { id, deletedAt: null },
            include: { area: true }
        });
    },

    async getByCode(code: string) {
        return await prisma.table.findUnique({
            where: { code, deletedAt: null },
            include: { area: true }
        });
    },

    async create(data: { name: string; areaId: string }) {
        return await prisma.table.create({
            data: {
                id: uuidv7(),
                code: 'TB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase(),
                ...(JSON.parse(JSON.stringify(data)))
            },
            include: { area: true }
        });
    },

    async update(id: string, data: { name?: string | undefined; areaId?: string | undefined }) {
        return await prisma.table.update({
            where: { id },
            data: JSON.parse(JSON.stringify(data)),
            include: { area: true }
        });
    },

    async setBookingStatus(id: string, isBooked: boolean) {
        return await prisma.table.update({
            where: { id },
            data: { isBooked }
        });
    },

    async remove(id: string) {
        // Kiểm tra bàn có hoá đơn UNPAID không
        const unpaidCount = await prisma.invoice.count({ where: { tableId: id, status: 'UNPAID' } });
        if (unpaidCount > 0) {
            throw { statusCode: 400, message: 'Không thể xoá bàn đang có hoá đơn chưa thanh toán' };
        }

        // Kiểm tra bàn có liên kết với Invoice nào không
        const invoiceCount = await prisma.invoice.count({ where: { tableId: id } });
        if (invoiceCount === 0) {
            // Không có Invoice → hard delete an toàn
            return await prisma.table.delete({ where: { id } });
        } else {
            // Có Invoice → soft delete để giữ tham chiếu lịch sử
            return await prisma.table.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
