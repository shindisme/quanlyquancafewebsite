import { z } from 'zod';
import { UserRole } from '../generated/prisma/index.js';


export const roleSchema = z.enum(['ADMIN', 'STAFF']);
export type Role = UserRole | z.infer<typeof roleSchema>;

export const jwtAuthPayloadSchema = z.object({
  id: z.string().min(1, 'ID người dùng không được để trống'),
  username: z.string().min(1, 'Username không được để trống'),
  role: roleSchema,
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JwtAuthPayload = z.infer<typeof jwtAuthPayloadSchema>;

export type AuthUser = Pick<JwtAuthPayload, 'id' | 'username' | 'role'>;
