import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes.js'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'

const app = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/v1', routes)

// Middleware bắt các route không tồn tại (404)
app.use(notFoundHandler)

// Middleware xử lý lỗi chung (Luôn phải đặt ở cuối cùng sau tất cả các routes)
app.use(errorHandler)

export default app
