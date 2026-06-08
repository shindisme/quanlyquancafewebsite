import api from '../api/axios';

export interface UserInput {
  username: string;
  email: string;
  name: string;
  role?: 'ADMIN' | 'STAFF';
}

const userService = {
  async getAll() {
    const res = await api.get('/users');
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  async create(data: UserInput) {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  async update(id: string, data: { name?: string; role?: 'ADMIN' | 'STAFF' }) {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },

  async changePassword(id: string, newPassword: string, oldPassword?: string) {
    await api.patch(`/users/${id}/password`, { newPassword, oldPassword });
  },

  async remove(id: string) {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
