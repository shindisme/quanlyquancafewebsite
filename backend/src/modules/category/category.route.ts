import { Router } from 'express';
import { categoryController } from './category.controller.js';

const router = Router();

// LỄ TÂN (ROUTE): Chia đường nối vào các bộ phận của Controller

// GET /api/v1/categories - Lấy danh sách
router.get('/', categoryController.getAll);

// POST /api/v1/categories - Tạo mới danh mục
router.post('/', categoryController.create);

// GET /api/v1/categories/:id - Xem chi tiết 1 danh mục
router.get('/:id', categoryController.getOne);

// PUT /api/v1/categories/:id - Sửa 1 danh mục
router.put('/:id', categoryController.update);

// DELETE /api/v1/categories/:id - Xóa 1 danh mục
router.delete('/:id', categoryController.remove);

export default router;
