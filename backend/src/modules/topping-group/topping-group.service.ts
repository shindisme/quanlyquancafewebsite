import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const toppingGroupService = {
    async getAll() {
        return await prisma.toppingGroup.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: {
                toppings: {
                    where: { deletedAt: null },
                    orderBy: { name: 'asc' }
                },
                _count: {
                    select: { products: true, toppings: true }
                }
            }
        });
    },

    async getById(id: string) {
        return await prisma.toppingGroup.findUnique({
            where: { id, deletedAt: null },
            include: {
                toppings: {
                    where: { deletedAt: null },
                    orderBy: { name: 'asc' }
                },
                products: {
                    where: { deletedAt: null },
                    select: { id: true, name: true, price: true }
                }
            }
        });
    },

    async create(data: { name: string; description?: string; toppingIds?: string[] }) {
        const { toppingIds, ...rest } = data;
        return await prisma.toppingGroup.create({
            data: {
                id: uuidv7(),
                name: rest.name,
                description: rest.description || null,
                toppings: toppingIds && toppingIds.length > 0 ? {
                    connect: toppingIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                toppings: {
                    where: { deletedAt: null }
                }
            }
        });
    },

    async update(id: string, data: { name?: string; description?: string; toppingIds?: string[] }) {
        const { toppingIds, ...rest } = data;
        return await prisma.toppingGroup.update({
            where: { id },
            data: {
                name: rest.name,
                description: rest.description === undefined ? undefined : (rest.description || null),
                toppings: toppingIds ? {
                    set: toppingIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                toppings: {
                    where: { deletedAt: null }
                }
            }
        });
    },

    async remove(id: string) {
        const productCount = await prisma.product.count({
            where: { toppingGroupId: id, deletedAt: null }
        });

        if (productCount > 0) {
            // Dang co san pham su dung thi go toppingGroupId khoi cac san pham do
            await prisma.product.updateMany({
                where: { toppingGroupId: id },
                data: { toppingGroupId: null }
            });
        }

        return await prisma.toppingGroup.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
