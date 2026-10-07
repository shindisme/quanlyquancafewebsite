import { Router } from 'express';
import { tableController } from './table.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Khach hang quet ma QR ban
router.get('/code/:code', tableController.getByCode);

// Quan tri vien va nhan vien xem danh sach ban
router.get('/', authenticate, tableController.getAll);
router.get('/:id', authenticate, tableController.getById);

// Quan tri vien va nhan vien quan ly thong tin ban
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), tableController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), tableController.update);
router.patch('/:id/booking', authenticate, authorize('ADMIN', 'STAFF'), tableController.updateBooking);

// Quan tri vien xoa ban
router.delete('/:id', authenticate, authorize('ADMIN'), tableController.remove);

export default router;
