import { Router } from 'express';
import { orderController } from './order.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { orderLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Cho quản trị
router.get('/', authenticate, orderController.getAll);
router.patch('/:id/status', authenticate, orderController.updateStatus);

// Public rate limt 
router.post('/', orderLimiter, orderController.create);
router.get('/:id', orderController.getOne);

export default router;
