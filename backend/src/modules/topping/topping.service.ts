import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const toppingService = {
    async getAll() {
        return await prisma.topping.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: { category: true }
        });
    },

    async getById(id: string) {
        return await prisma.topping.findUnique({
            where: { id, deletedAt: null },
            include: { category: true }
        });
    },

    async create(data: { name: string; price: number; categoryId: string }) {
        return await prisma.topping.create({
            data: {
                id: uuidv7(),
                ...data
            },
        });
    },

    async update(id: string, data: {
        name?: string | undefined;
        price?: number | undefined;
        categoryId?: string | undefined
    }) {
        return await prisma.topping.update({
            where: { id },
            data: JSON.parse(JSON.stringify(data)),
            include: { category: true }
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
