import { Router } from 'express';
import { toppingController } from './topping.controller.js';

const router = Router();

router.get('/', toppingController.getAll);
router.post('/', toppingController.create);
router.get('/:id', toppingController.getById);
router.put('/:id', toppingController.update);
router.delete('/:id', toppingController.remove);

export default router;
