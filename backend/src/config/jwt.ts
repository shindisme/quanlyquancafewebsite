import 'dotenv/config';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('Cấu hình thiếu: Biến môi trường JWT_SECRET chưa được thiết lập!');
}

export const JWT_SECRET = secret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
