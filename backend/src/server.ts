import 'dotenv/config'
import app from './app.js'
import prisma from './config/prisma.js'

const PORT = process.env.PORT || 3000

async function startServer() {
    try {
        await prisma.$connect()
        console.log('Kết nối thành công tới Database')

        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`Server đang chạy tại http://localhost:${PORT}`);
            })
        }
    } catch (error) {
        console.error('Lỗi kết nối Database:', error);
        if (!process.env.VERCEL) {
            process.exit(1)
        }
    }
}

startServer();

export default app;
