import prisma from '../../config/prisma.js';

export const categoryService = {
    async getAllCategories() {
        return await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
    },

    async getCategoryById(id: string) {
        return await prisma.category.findUnique({
            where: { id }
        });
    },

    async createCategory(name: string) {
        return await prisma.category.create({
            data: { name }
        });
    },

    async updateCategory(id: string, name: string) {
        return await prisma.category.update({
            where: { id },
            data: { name }
        });
    },


    async deleteCategory(id: string) {
        return await prisma.category.delete({
            where: { id }
        });
    }
};
