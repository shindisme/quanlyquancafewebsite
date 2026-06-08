import { Router } from 'express';
import { uploadController } from './upload.controller.js';
import { uploadMiddleware } from '../../middlewares/upload.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Endpoint: POST /api/v1/upload
// "image" is the field name expected in form-data
router.post('/', authenticate, uploadMiddleware.single('image'), uploadController.uploadImage);

export default router;
