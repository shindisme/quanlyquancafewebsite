/**
 * publicService — API cho khách hàng (Public layout)
 *
 * THAY ĐỔI:
 * - createOrder giờ chỉ gửi tableId + items (không coupon, không totalAmount)
 * - Server tự tính toán + tự tạo/gắn Invoice
 * - Thêm getInvoiceByTable để xem hoá đơn bàn
 */

import api from '../api/axios';

const publicService = {
  async getProducts(params?: { page?: number; limit?: number }) {
    const res = await api.get('/products', { params: { ...params, limit: params?.limit || 100 } });
    const d = res.data.data;
    return d?.items || d || [];
  },

  async getCategories() {
    const res = await api.get('/categories', { params: { limit: 100 } });
    const d = res.data.data;
    return Array.isArray(d) ? d : d?.items || d?.data || [];
  },

  async getToppings() {
    const res = await api.get('/toppings');
    const d = res.data.data;
    return Array.isArray(d) ? d : d?.items || d?.data || [];
  },

  async getTableByCode(code: string) {
    const res = await api.get(`/tables/code/${code}`);
    return res.data.data;
  },

  /**
   * Đặt món — gửi tableId + items.
   * Server tự tạo Invoice nếu chưa có, tự tính subTotal.
   * Trả về { order, invoiceId, invoiceCode }
   */
  async createOrder(data: {
    tableId: string;
    items: {
      productId: string;
      sizeId?: string;
      quantity: number;
      price: number;
      note?: string;
      toppings: { toppingId: string; price: number }[];
    }[];
  }) {
    const res = await api.post('/orders', data);
    return res.data.data;
  },

  async getOrder(id: string) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  /** Lấy hoá đơn UNPAID đang mở của bàn */
  async getInvoiceByTable(tableId: string) {
    const res = await api.get(`/invoices/table/${tableId}`);
    return res.data.data;
  },

  async applyCoupon(code: string) {
    const res = await api.post('/coupons/apply', { code });
    return res.data.data;
  },
};

export default publicService;
