import { Router } from 'express';
import { toppingGroupController } from './topping-group.controller.js';

const router = Router();

router.get('/', toppingGroupController.getAll);
router.post('/', toppingGroupController.create);
router.get('/:id', toppingGroupController.getById);
router.put('/:id', toppingGroupController.update);
router.delete('/:id', toppingGroupController.remove);

export default router;
