import api from './api';
import { Team } from '../types';

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name: string;
  description?: string;
}

export interface AddTeamMemberDto {
  userId: string;
}

export const teamService = {
  async getAllTeams(): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  async getTeamById(id: string): Promise<Team> {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  async createTeam(data: CreateTeamDto): Promise<Team> {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  async updateTeam(id: string, data: UpdateTeamDto): Promise<Team> {
    const response = await api.put<Team>(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async addMember(teamId: string, userId: string): Promise<void> {
    await api.post(`/teams/${teamId}/members`, { userId });
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};

