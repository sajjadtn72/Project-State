import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        const errorMessage = error.response.data?.message || 'An error occurred';
        message.error(errorMessage);
      }
    } else {
      message.error('Network error. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;

