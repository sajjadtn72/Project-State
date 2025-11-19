import api from './api';
import { User } from '../types';

export interface CreatePersonnelDto {
  fullName: string;
  jobRole: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createPersonnel(data: CreatePersonnelDto): Promise<User> {
    const response = await api.post<User>('/users/personnel', data);
    return response.data;
  },
};

