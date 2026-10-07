import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Dang nhap he thong
router.post('/login', authController.login);

// Lay thong tin tai khoan hien tai
router.get('/me', authenticate, authController.me);

export default router;
