import api from '../api/axios';

export interface ToppingGroupItem {
  id: string;
  name: string;
  price: number;
  isActive?: boolean;
}

export interface ToppingGroup {
  id: string;
  name: string;
  description?: string | null;
  toppings: ToppingGroupItem[];
  _count?: {
    products: number;
    toppings: number;
  };
}

export interface ToppingGroupInput {
  name: string;
  description?: string;
  toppingIds?: string[];
}

const toppingGroupService = {
  async getAll(): Promise<ToppingGroup[]> {
    const res = await api.get('/topping-groups');
    return res.data.data;
  },

  async getById(id: string): Promise<ToppingGroup> {
    const res = await api.get(`/topping-groups/${id}`);
    return res.data.data;
  },

  async create(data: ToppingGroupInput): Promise<ToppingGroup> {
    const res = await api.post('/topping-groups', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<ToppingGroupInput>): Promise<ToppingGroup> {
    const res = await api.put(`/topping-groups/${id}`, data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/topping-groups/${id}`);
  },
};

export default toppingGroupService;
