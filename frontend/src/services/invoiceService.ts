import api from '../api/axios';

export interface InvoicePaymentInput {
  method: 'CASH' | 'VNPAY';
  couponCode?: string;
}

const invoiceService = {
  async getAll(status?: string) {
    const params = status ? { status } : {};
    const res = await api.get('/invoices', { params });
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get(`/invoices/${id}`);
    return res.data.data;
  },

  async getByTable(tableId: string) {
    const res = await api.get(`/invoices/table/${tableId}`);
    return res.data.data;
  },

  async create(tableId: string) {
    const res = await api.post('/invoices', { tableId });
    return res.data.data;
  },

  async processPayment(id: string, data: InvoicePaymentInput) {
    const res = await api.post(`/invoices/${id}/pay`, data);
    return res.data.data;
  },

  async cancel(id: string) {
    const res = await api.patch(`/invoices/${id}/cancel`);
    return res.data.data;
  },
};

export default invoiceService;
