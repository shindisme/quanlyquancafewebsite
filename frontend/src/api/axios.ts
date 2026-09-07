import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || '/api/v1').trim();
const baseURL = rawUrl.endsWith('/api/v1')
  ? rawUrl
  : `${rawUrl.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/auth/me') && !requestUrl.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
