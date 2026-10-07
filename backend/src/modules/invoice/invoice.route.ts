import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Khach hang xem hoa don theo ban va tao hoa don khi goi mon
router.get('/table/:tableId', invoiceController.getByTable);
router.post('/', invoiceController.create);

// Quan tri vien va nhan vien quan ly hoa don
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), invoiceController.getAll);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), invoiceController.getById);
router.post('/:id/pay', authenticate, authorize('ADMIN', 'STAFF'), invoiceController.processPayment);
router.patch('/:id/cancel', authenticate, authorize('ADMIN', 'STAFF'), invoiceController.cancel);

export default router;
