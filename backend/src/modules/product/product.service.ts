import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const productService = {
    async getAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: { deletedAt: null },
                orderBy: { name: 'asc' },
                include: {
                    category: true,
                    sizes: true,
                    toppingGroup: {
                        include: {
                            toppings: {
                                where: { deletedAt: null, isActive: true },
                                orderBy: { name: 'asc' }
                            }
                        }
                    }
                },
                skip,
                take: limit
            }),
            prisma.product.count({ where: { deletedAt: null } })
        ]);

        return {
            items: products,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };
    },

    async getById(id: string) {
        return await prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                category: true,
                sizes: true,
                toppingGroup: {
                    include: {
                        toppings: {
                            where: { deletedAt: null, isActive: true },
                            orderBy: { name: 'asc' }
                        }
                    }
                }
            }
        });
    },

    async create(
        data: {
            categoryId: string;
            toppingGroupId?: string | null;
            name: string;
            price: number;
            description?: string;
            image?: string;
            isActive?: boolean;
            sizes?: { sizeName: string; extraPrice: number }[];
        }) {
        const { sizes, ...rest } = data;
        return await prisma.product.create({
            data: {
                id: uuidv7(),
                name: rest.name,
                price: rest.price,
                description: rest.description || null,
                image: rest.image || null,
                isAvailable: rest.isActive ?? true,
                categoryId: rest.categoryId,
                toppingGroupId: rest.toppingGroupId || null,
                sizes: sizes ? {
                    create: sizes.map(s => ({
                        sizeName: s.sizeName,
                        extraPrice: s.extraPrice
                    }))
                } : undefined
            },
            include: {
                category: true,
                sizes: true,
                toppingGroup: {
                    include: {
                        toppings: {
                            where: { deletedAt: null, isActive: true }
                        }
                    }
                }
            }
        });
    },

    async update(id: string, data: {
        name?: string;
        categoryId?: string;
        toppingGroupId?: string | null;
        price?: number;
        description?: string;
        image?: string;
        isActive?: boolean;
        sizes?: { sizeName: string; extraPrice: number }[];
    }) {
        const { sizes, ...rest } = data;
        
        return await prisma.$transaction(async (tx) => {
            if (sizes) {
                // For simplicity, we replace all sizes
                await tx.size.deleteMany({ where: { productId: id } });
                await tx.size.createMany({
                    data: sizes.map(s => ({
                        id: uuidv7(),
                        productId: id,
                        sizeName: s.sizeName,
                        extraPrice: s.extraPrice
                    }))
                });
            }

            return await tx.product.update({
                where: { id },
                data: {
                    name: rest.name,
                    price: rest.price,
                    description: rest.description === undefined ? undefined : (rest.description || null),
                    image: rest.image === undefined ? undefined : (rest.image || null),
                    isAvailable: rest.isActive,
                    categoryId: rest.categoryId,
                    toppingGroupId: rest.toppingGroupId === undefined ? undefined : (rest.toppingGroupId || null)
                },
                include: {
                    category: true,
                    sizes: true,
                    toppingGroup: {
                        include: {
                            toppings: {
                                where: { deletedAt: null, isActive: true }
                            }
                        }
                    }
                }
            });
        });
    },

    async remove(id: string) {
        const orderCount = await prisma.orderDetail.count({ where: { productId: id } });

        if (orderCount === 0) {
            await prisma.size.deleteMany({ where: { productId: id } });
            return await prisma.product.delete({ where: { id } });
        } else {
            return await prisma.product.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
