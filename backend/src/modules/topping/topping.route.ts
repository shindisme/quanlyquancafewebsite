import { Router } from 'express';
import { toppingController } from './topping.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Khach hang va nguoi dung xem danh sach topping
router.get('/', toppingController.getAll);
router.get('/:id', toppingController.getById);

// Quan tri vien va nhan vien quan ly topping
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), toppingController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), toppingController.update);

// Quan tri vien xoa topping
router.delete('/:id', authenticate, authorize('ADMIN'), toppingController.remove);

export default router;
