import { Router } from 'express'

const router = Router()

// API: /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'Chức năng đăng nhập đang xây dựng...' })
})

export default router
