import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middlewares/error.middleware.js';

export const authService = {
  async login(usernameOrEmail: string, pass: string) {
    // Tìm user username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ],
        deletedAt: null
      }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Sai tài khoản hoặc mật khẩu' } as AppError;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Sai tài khoản hoặc mật khẩu' } as AppError;
    }

    // Sign JWT
    const secret = process.env.JWT_SECRET || 'secretkey@2004';
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      secret,
      { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: token
    };
  }
};
