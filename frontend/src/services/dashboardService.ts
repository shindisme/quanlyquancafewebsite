import api from '../api/axios';

const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data.data;
  },
};

export default dashboardService;
