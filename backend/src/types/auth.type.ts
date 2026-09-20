import { UserRole } from '../generated/prisma/index.js';

/**
 * Union type kết hợp Enum từ Prisma: 'ADMIN' | 'STAFF'
 * Giúp autocomplete chuẩn xác và tránh lỗi chính tả
 */
export type Role = UserRole | 'ADMIN' | 'STAFF';

/**
 * Thông tin người dùng được lưu trong req.user sau khi xác thực
 */
export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

/**
 * Payload chứa trong JWT Token
 */
export interface JwtAuthPayload extends AuthUser {
  iat?: number;
  exp?: number;
}
