import api from './api';
import { Project } from '../types';

export interface CreateProjectDto {
  name: string;
  description?: string;
  teamId: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  teamId: string;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/status`, { status });
    return response.data;
  },
};

