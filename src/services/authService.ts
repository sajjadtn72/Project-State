import api from './api';

export const authService = {
  register: async (fullName: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { fullName, email, password });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};
