import { Router } from 'express';
import { uploadController } from './upload.controller.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

// Quan tri vien va nhan vien tai len hinh anh
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), uploadMiddleware.single('image'), uploadController.uploadImage);

export default router;
