import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const areaService = {
    async getAllAreas() {
        return await prisma.area.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: { tables: { where: { deletedAt: null } } }
        });
    },

    async getAreaById(id: string) {
        return await prisma.area.findUnique({
            where: { id, deletedAt: null },
            include: { tables: { where: { deletedAt: null } } }
        });
    },

    async createArea(name: string) {
        return await prisma.area.create({
            data: {
                id: uuidv7(),
                name
            }
        });
    },

    async updateArea(id: string, name: string) {
        return await prisma.area.update({
            where: { id },
            data: { name }
        });
    },

    async deleteArea(id: string) {
        const activeTableCount = await prisma.table.count({ where: { areaId: id, deletedAt: null } });

        if (activeTableCount > 0) {
            throw { statusCode: 400, message: `Không thể xoá khu vực đang có ${activeTableCount} bàn hoạt động` };
        }

        // Kiểm tra có bàn đã soft delete hay không
        const totalTableCount = await prisma.table.count({ where: { areaId: id } });
        if (totalTableCount === 0) {
            return await prisma.area.delete({ where: { id } });
        } else {
            return await prisma.area.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
