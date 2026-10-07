import { Router } from 'express';
import { productController } from './product.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Khach hang va nguoi dung xem danh sach thuc don
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Quan tri vien va nhan vien quan ly san pham
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), productController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), productController.update);

// Quan tri vien xoa san pham
router.delete('/:id', authenticate, authorize('ADMIN'), productController.remove);

export default router;
