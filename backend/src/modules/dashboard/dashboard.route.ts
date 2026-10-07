import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Quan tri vien xem thong ke bao cao doanh thu
router.get('/stats', authenticate, authorize('ADMIN'), dashboardController.getStats);

export default router;
