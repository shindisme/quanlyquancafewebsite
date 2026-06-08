import api from '../api/axios';

const authService = {
  async login(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password });
    return res.data.data;
  },

  async getProfile() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
  },
};

export default authService;
