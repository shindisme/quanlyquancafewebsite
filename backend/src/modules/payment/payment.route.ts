import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Quan tri vien va nhan vien xem thong tin thanh toan
router.use(authenticate, authorize('ADMIN', 'STAFF'));

router.get('/invoice/:invoiceId', paymentController.getByInvoiceId);

export default router;
