import rateLimit from 'express-rate-limit';


export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 30, // giới hạn 30 req/1p
  message: {
    status: 'error',
    message: 'Thao tác quá nhanh, vui lòng thử lại sau 1 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 10,// giới hạn 10 đơn/5p
  message: {
    status: 'error',
    message: 'Bạn đã đặt quá nhiều đơn, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const couponLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5, // giới hạn 5 lần áp mã/1p
  message: {
    status: 'error',
    message: 'Thử quá nhiều lần, vui lòng đợi 1 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
