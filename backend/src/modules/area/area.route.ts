import { Router } from 'express';
import { areaController } from './area.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, areaController.getAll);
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), areaController.create);
router.get('/:id', authenticate, areaController.getById);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), areaController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), areaController.remove);

export default router;
