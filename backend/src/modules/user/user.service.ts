import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import { UserRole } from '../../generated/prisma/index.js';
import { emailService } from '../email/email.service.js';
export const userService = {
    async getAllUsers() {
        return await prisma.user.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            select: { id: true, username: true, email: true, name: true, role: true, createdAt: true }
        });
    },

    async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id, deletedAt: null },
            select: { id: true, username: true, email: true, name: true, role: true, createdAt: true }
        });
    },

    async createUser(data: { username: string; email: string; name: string; role?: UserRole }) {
        const defaultPassword = '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const user = await prisma.user.create({
            data: { ...data, password: hashedPassword },
            select: { id: true, username: true, email: true, name: true, role: true, createdAt: true }
        });

        emailService.sendNewAccountEmail(data.email, data.name, data.username, defaultPassword).catch(console.error);

        return user;
    },

    async updateUser(id: string, data: { name?: string; role?: string }) {
        return await prisma.user.update({
            where: { id },
            data: JSON.parse(JSON.stringify(data)),
            select: { id: true, username: true, email: true, name: true, role: true, createdAt: true }
        });
    },

    async changePassword(id: string, newPassword: string, oldPassword?: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw { statusCode: 404, message: 'Người dùng không tồn tại' };

        if (oldPassword) {
            const isValid = await bcrypt.compare(oldPassword, user.password);
            if (!isValid) throw { statusCode: 400, message: 'Mật khẩu hiện tại không đúng' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: { id: true, username: true, name: true, role: true }
        });
    },

    async deleteUser(id: string) {
        const invoiceCount = await prisma.invoice.count({ where: { userId: id } });

        if (invoiceCount === 0) {
            return await prisma.user.delete({ where: { id } });
        } else {
            return await prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        }
    }
};
