import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Khach hang va nguoi dung xem danh muc thuc don
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Quan tri vien va nhan vien quan ly danh muc
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), categoryController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), categoryController.update);

// Quan tri vien xoa danh muc
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.remove);

export default router;
