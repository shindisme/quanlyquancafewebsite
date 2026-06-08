import api from '../api/axios';

export interface ToppingInput {
  name: string;
  price: number;
  categoryId: string;
}

const toppingService = {
  async getAll() {
    const res = await api.get('/toppings');
    return res.data.data;
  },

  async create(data: ToppingInput) {
    const res = await api.post('/toppings', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<ToppingInput>) {
    const res = await api.put(`/toppings/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/toppings/${id}`);
  },
};

export default toppingService;
