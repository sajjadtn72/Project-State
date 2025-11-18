import api from './api';
import { ProjectTask } from '../types';

export interface CreateTaskDto {
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
}

export const taskService = {
  async getAllTasks(): Promise<ProjectTask[]> {
    const response = await api.get<ProjectTask[]>('/tasks');
    return response.data;
  },

  async getTasksByProjectId(projectId: string): Promise<ProjectTask[]> {
    const response = await api.get<ProjectTask[]>(`/tasks/project/${projectId}`);
    return response.data;
  },

  async getTaskById(id: string): Promise<ProjectTask> {
    const response = await api.get<ProjectTask>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskDto): Promise<ProjectTask> {
    const response = await api.post<ProjectTask>('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: UpdateTaskDto): Promise<ProjectTask> {
    const response = await api.put<ProjectTask>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateTaskStatus(id: string, status: string): Promise<ProjectTask> {
    const response = await api.patch<ProjectTask>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async assignTaskToUser(taskId: string, userId: string): Promise<ProjectTask> {
    const response = await api.patch<ProjectTask>(`/tasks/${taskId}/assign/${userId}`);
    return response.data;
  },
};

