import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Simple in-memory session cache to prevent redundant API calls
const cache = new Map();

export const getCached = async (url, ttl = 60000) => {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  const res = await api.get(url);
  cache.set(url, { data: res.data, timestamp: Date.now() });
  return res.data;
};

// Clear cache (useful for logout or force refresh)
export const clearCache = () => cache.clear();

export default api;
