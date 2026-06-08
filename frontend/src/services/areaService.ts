import api from '../api/axios';

const areaService = {
  async getAll() {
    const res = await api.get('/areas');
    return res.data.data;
  },

  async create(data: { name: string }) {
    const res = await api.post('/areas', data);
    return res.data.data;
  },

  async update(id: string, data: { name: string }) {
    const res = await api.put(`/areas/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/areas/${id}`);
  },
};

export default areaService;
