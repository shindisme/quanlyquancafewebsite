import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middlewares/error.middleware.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/jwt.js';

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

    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(pass, user.password);
    } else {
      isMatch = pass === user.password;
      if (isMatch) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      }
    }

    if (!isMatch) {
      throw { statusCode: 401, message: 'Sai tài khoản hoặc mật khẩu' } as AppError;
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: token
    };
  }
};
