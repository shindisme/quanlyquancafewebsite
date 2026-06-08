import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/invoice/:invoiceId', paymentController.getByInvoiceId);

export default router;
