import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';
import { AppError } from '../../middlewares/error.middleware.js';

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
        // Kiem tra ban co hoa don chua thanh toan hay khong
        const unpaidCount = await prisma.invoice.count({ where: { tableId: id, status: 'UNPAID' } });
        if (unpaidCount > 0) {
            throw new AppError(400, 'Không thể xoá bàn đang có hoá đơn chưa thanh toán');
        }

        // Kiem tra ban co lien ket voi hoa don nao khong
        const invoiceCount = await prisma.invoice.count({ where: { tableId: id } });
        if (invoiceCount === 0) {
            // Khong co hoa don thi xoa vinh vien an toan
            return await prisma.table.delete({ where: { id } });
        } else {
            // Co hoa don thi xoa mem de giu lich su
            return await prisma.table.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
