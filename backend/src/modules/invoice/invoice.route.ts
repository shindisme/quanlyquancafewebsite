import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/table/:tableId', invoiceController.getByTable);
router.post('/', invoiceController.create); // Tạo hoá đơn khi đặt món đầu tiên

// staff
router.get('/', authenticate, invoiceController.getAll);
router.get('/:id', authenticate, invoiceController.getById);
router.post('/:id/pay', authenticate, invoiceController.processPayment);
router.patch('/:id/cancel', authenticate, invoiceController.cancel);

export default router;
