import prisma from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

export const categoryService = {
    async getAllCategories(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [categories, totalCount] = await Promise.all([
            prisma.category.findMany({
                where: { deletedAt: null },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
                include: { products: { where: { deletedAt: null } } }
            }),
            prisma.category.count({ where: { deletedAt: null } })
        ]);

        return {
            items: categories,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        };
    },

    async getCategoryById(id: string) {
        return await prisma.category.findUnique({
            where: { id, deletedAt: null }
        });
    },

    async createCategory(data: { name: string }) {
        return await prisma.category.create({
            data: {
                id: uuidv7(),
                ...data
            }
        });
    },

    async updateCategory(id: string, data: { name: string }) {
        return await prisma.category.update({
            where: { id },
            data: { ...data }
        });
    },


    async deleteCategory(id: string) {
        const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
        const toppingCount = await prisma.topping.count({ where: { categoryId: id, deletedAt: null } });

        if (productCount > 0 || toppingCount > 0) {
            throw {
                statusCode: 400,
                message: `Không thể xoá danh mục đang có ${productCount > 0 ? productCount + ' sản phẩm' : ''}${productCount > 0 && toppingCount > 0 ? ' và ' : ''}${toppingCount > 0 ? toppingCount + ' topping' : ''} hoạt động`
            };
        }

        // Kiểm tra có sản phẩm/topping đã soft delete
        const totalCount = await prisma.product.count({ where: { categoryId: id } }) +
            await prisma.topping.count({ where: { categoryId: id } });
        if (totalCount === 0) {
            return await prisma.category.delete({ where: { id } });
        } else {
            return await prisma.category.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
