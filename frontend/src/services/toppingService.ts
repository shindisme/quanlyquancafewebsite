import api from '../api/axios';

export interface ToppingInput {
  name: string;
  price: number;
  isActive?: boolean;
  groupIds?: string[];
}

export interface ToppingItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  groups?: { id: string; name: string }[];
}

const toppingService = {
  async getAll(): Promise<ToppingItem[]> {
    const res = await api.get('/toppings');
    return res.data.data;
  },

  async create(data: ToppingInput): Promise<ToppingItem> {
    const res = await api.post('/toppings', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<ToppingInput>): Promise<ToppingItem> {
    const res = await api.put(`/toppings/${id}`, data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/toppings/${id}`);
  },
};

export default toppingService;
