import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), userController.getAll);
router.post('/', authenticate, authorize(['ADMIN']), userController.create);
router.get('/:id', authenticate, userController.getOne);
router.put('/:id', authenticate, userController.update);
router.patch('/:id/password', authenticate, userController.changePassword);
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.remove);

export default router;
