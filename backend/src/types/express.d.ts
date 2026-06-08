/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Mở rộng Express Request để thêm property `user`
 * (được gán bởi auth middleware sau khi verify JWT)
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: 'ADMIN' | 'STAFF';
      };
    }
  }
}

export {};
