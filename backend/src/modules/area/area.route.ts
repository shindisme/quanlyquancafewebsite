import { Router } from 'express';
import { areaController } from './area.controller.js';

const router = Router();

router.get('/', areaController.getAll);
router.post('/', areaController.create);
router.get('/:id', areaController.getById);
router.put('/:id', areaController.update);
router.delete('/:id', areaController.remove);

export default router;
