import { Request, Response } from 'express'
import { TableService } from './table.service.js'

export const TableController = {
  // Xử lý GET: Lấy danh sách bàn
  getAll: async (req: Request, res: Response) => {
    try {
      const tables = await TableService.getAllTables()
      res.json({ success: true, data: tables })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' })
    }
  },

  // Xử lý POST: Tạo bàn mới
  create: async (req: Request, res: Response) => {
    try {
      // Nhận tên bàn từ body (VD: { "name": "Bàn vip 1" })
      const { name } = req.body
      if (!name) {
        res.status(400).json({ success: false, message: 'Thiếu tên bàn' })
        return
      }

      const newTable = await TableService.createTable(name)
      res.status(201).json({ success: true, data: newTable })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' })
    }
  }
}
