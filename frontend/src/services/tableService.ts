import api from '../api/axios';

export interface TableInput {
  name: string;
  areaId: string;
}

const tableService = {
  async getAll() {
    const res = await api.get('/tables');
    return res.data.data;
  },

  async create(data: TableInput) {
    const res = await api.post('/tables', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<TableInput>) {
    const res = await api.put(`/tables/${id}`, data);
    return res.data.data;
  },

  async updateBooking(id: string, isBooked: boolean) {
    const res = await api.patch(`/tables/${id}/booking`, { isBooked });
    return res.data.data;
  },

  async remove(id: string) {
    await api.delete(`/tables/${id}`);
  },
};

export default tableService;
