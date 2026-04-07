import { Router } from 'express'
import tableRoutes from './modules/table/table.route.js'
import authRoutes from './modules/auth/auth.route.js'
import categoryRoutes from './modules/category/category.route.js'

const router = Router()

// main router
router.get('/', (req, res) => {
    res.send('Hello world!!!')
})

// other router
// /api/v1
router.use('/tables', tableRoutes)
router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)

export default router
