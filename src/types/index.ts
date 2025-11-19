export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Member';
  jobRole?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: User[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'NotStarted' | 'InProgress' | 'Review' | 'Completed';
  startDate?: string;
  endDate?: string;
  teamId: string;
  teamName: string;
  taskCount: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  status: 'Todo' | 'Doing' | 'Done';
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
}

export interface DashboardData {
  totalTeams: number;
  totalProjects: number;
  projectsNotStarted: number;
  projectsInProgress: number;
  projectsInReview: number;
  projectsCompleted: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  type: string;
  description: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

