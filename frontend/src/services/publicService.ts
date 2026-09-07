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
