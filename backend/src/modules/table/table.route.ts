import { Router } from 'express';
import { tableController } from './table.controller.js';

const router = Router();

router.get('/', tableController.getAll);
router.post('/', tableController.create);
router.get('/code/:code', tableController.getByCode);
router.get('/:id', tableController.getById);
router.put('/:id', tableController.update);
router.patch('/:id/booking', tableController.updateBooking);
router.delete('/:id', tableController.remove);

export default router;
