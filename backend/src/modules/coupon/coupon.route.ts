import { Router } from 'express';
import { couponController } from './coupon.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { couponLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Khach hang ap dung ma giam gia
router.post('/apply', couponLimiter, couponController.apply);

// Quan tri vien va nhan vien xem danh sach ma giam gia
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), couponController.getAll);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), couponController.getOne);

// Quan tri vien quan ly ma giam gia
router.post('/', authenticate, authorize('ADMIN'), couponController.create);
router.put('/:id', authenticate, authorize('ADMIN'), couponController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), couponController.delete);

export default router;
