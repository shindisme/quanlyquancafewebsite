import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const toppingService = {
    async getAll() {
        return await prisma.topping.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: { groups: true }
        });
    },

    async getById(id: string) {
        return await prisma.topping.findUnique({
            where: { id, deletedAt: null },
            include: { groups: true }
        });
    },

    async create(data: { name: string; price: number; isActive?: boolean; groupIds?: string[] }) {
        const { groupIds, ...rest } = data;
        return await prisma.topping.create({
            data: {
                id: uuidv7(),
                name: rest.name,
                price: rest.price,
                isActive: rest.isActive ?? true,
                groups: groupIds && groupIds.length > 0 ? {
                    connect: groupIds.map(gid => ({ id: gid }))
                } : undefined
            },
            include: { groups: true }
        });
    },

    async update(id: string, data: {
        name?: string;
        price?: number;
        isActive?: boolean;
        groupIds?: string[];
    }) {
        const { groupIds, ...rest } = data;
        return await prisma.topping.update({
            where: { id },
            data: {
                name: rest.name,
                price: rest.price,
                isActive: rest.isActive,
                groups: groupIds ? {
                    set: groupIds.map(gid => ({ id: gid }))
                } : undefined
            },
            include: { groups: true }
        });
    },

    async remove(id: string) {
        const orderCount = await prisma.orderDetailTopping.count({ where: { toppingId: id } });

        if (orderCount === 0) {
            return await prisma.topping.delete({ where: { id } });
        } else {
            return await prisma.topping.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
