import prisma from '../../config/prisma.js'

export const TableService = {
  // Lấy danh sách tất cả các bàn
  getAllTables: async () => {
    return await prisma.table.findMany({
      orderBy: { id: 'asc' }
    })
  },

  // Tạo thêm bàn mới
  createTable: async (name: string) => {
    return await prisma.table.create({
      data: {
        name,
        isBooked: false
      }
    })
  },

  // Khách ngồi vào bàn (chuyển đổi isBooked -> true)
  bookTable: async (id: number) => {
    return await prisma.table.update({
      where: { id },
      data: { isBooked: true }
    })
  }
}
