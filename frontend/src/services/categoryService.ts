import api from '../api/axios';

const categoryService = {
  async getAll(params?: { page?: number; limit?: number }) {
    const res = await api.get('/categories', { params });
    return res.data.data;
  },

  async create(data: { name: string }) {
    const res = await api.post('/categories', data);
    return res.data.data;
  },

  async update(id: string, data: { name: string }) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
