import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure we use the current origin (Vite dev server) and not absolute URLs
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    // Ensure we're using a relative URL (Vite proxy will handle it)
    if (config.url && !config.url.startsWith('http')) {
      // Already relative, good
    } else if (config.url && config.url.startsWith('http')) {
      // If somehow an absolute URL got in, extract the path
      try {
        const url = new URL(config.url);
        config.url = url.pathname + url.search;
      } catch (e) {
        // Invalid URL, keep as is
      }
    }
    
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

