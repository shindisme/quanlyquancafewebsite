import { Router } from 'express';
import { orderController } from './order.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { orderLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/', orderLimiter, orderController.create);
router.get('/:id', orderController.getOne);

router.get('/', authenticate, authorize('ADMIN', 'STAFF'), orderController.getAll);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), orderController.updateStatus);

export default router;
