import { Router } from 'express';
import { productController } from './product.controller.js';

const router = Router();

router.get('/', productController.getAll);
router.post('/', productController.create);
router.get('/:id', productController.getById);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

export default router;
