import { Router } from 'express'
import { TableController } from './table.controller.js'

const router = Router()

router.get('/', TableController.getAll)
router.post('/', TableController.create)

export default router
