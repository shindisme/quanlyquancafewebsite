import { Router } from 'express';
import { couponController } from './coupon.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { couponLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Public
router.post('/apply', couponLimiter, couponController.apply);

// Staff,Admin
router.get('/', authenticate, couponController.getAll);
router.post('/', authenticate, authorize(['ADMIN']), couponController.create);
router.get('/:id', authenticate, couponController.getOne);
router.put('/:id', authenticate, authorize(['ADMIN']), couponController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), couponController.delete);

export default router;
