import axios from 'axios';
import BASE_URL from '../config';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;