import api from '../api/axios';

export interface CouponInput {
  code: string;
  discountType: 'PERCENT' | 'VALUE';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  limit?: number;
  isActive?: boolean;
  startDate: string;
  endDate?: string;
}

const couponService = {
  async getAll() {
    const res = await api.get('/coupons');
    return res.data.data;
  },

  async apply(code: string) {
    const res = await api.post('/coupons/apply', { code });
    return res.data;
  },

  async create(data: CouponInput) {
    const res = await api.post('/coupons', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<CouponInput>) {
    const res = await api.put(`/coupons/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/coupons/${id}`);
  },
};

export default couponService;
