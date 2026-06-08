import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

export default router;
