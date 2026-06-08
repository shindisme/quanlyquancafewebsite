import api from '../api/axios';

export interface PaymentInput {
  orderId: string;
  method: 'CASH' | 'VNPAY';
  amount: number;
  transactionId?: string;
}

const paymentService = {
  async process(data: PaymentInput) {
    const res = await api.post('/payments', data);
    return res.data.data;
  },

  async getByOrderId(orderId: string) {
    const res = await api.get(`/payments/order/${orderId}`);
    return res.data.data;
  },
};

export default paymentService;
