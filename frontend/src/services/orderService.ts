import api from '../api/axios';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const orderService = {
  async getAll() {
    const res = await api.get('/orders');
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data.data;
  },
};

export default orderService;
