import { Router } from 'express';
import { toppingGroupController } from './topping-group.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Quan tri vien va nhan vien xem danh sach nhom topping
router.get('/', authenticate, toppingGroupController.getAll);
router.get('/:id', authenticate, toppingGroupController.getById);

// Quan tri vien va nhan vien quan ly nhom topping
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), toppingGroupController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), toppingGroupController.update);

// Quan tri vien xoa nhom topping
router.delete('/:id', authenticate, authorize('ADMIN'), toppingGroupController.remove);

export default router;
