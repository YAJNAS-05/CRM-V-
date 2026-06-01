import api from './axiosInstance'
import { ApiResponse } from '../types'

export interface ApiProject {
  id: string
  workspaceId?: string | null
  portfolioId?: string | null
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
  category?: string | null
  projectType: string
  visibility: string
  status: string
  startDate?: string | null
  endDate?: string | null
  ownerId?: string | null
  settings?: string | null
  metadata?: string | null
  tags?: string[] | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string | null
}

export interface ApiTask {
  id: string
  projectId: string
  taskNumber: string
  parentTaskId?: string | null
  epicId?: string | null
  sprintId?: string | null
  milestoneId?: string | null
  title: string
  description?: string | null
  taskType: string
  priority: string
  status: string
  statusOrder: number
  startDate?: string | null
  dueDate?: string | null
  completedAt?: string | null
  timeEstimate?: number | null
  timeSpent: number
  assigneeId?: string | null
  storyPoints?: number | null
  isRecurring: boolean
  recurringPattern?: string | null
  coverImage?: string | null
  isPrivate: boolean
  metadata?: string | null
  tags?: string[] | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  version?: number
}

export const projectApi = {
  // Projects
  getAllProjects: () =>
    api.get<ApiProject[]>('/pm/projects'),

  getProjectById: (id: string) =>
    api.get<ApiProject>(`/pm/projects/${id}`),

  getProjectsByWorkspace: (workspaceId: string) =>
    api.get<ApiProject[]>(`/pm/projects/workspace/${workspaceId}`),

  createProject: (data: Partial<ApiProject>) =>
    api.post<ApiProject>('/pm/projects', data),

  updateProject: (id: string, data: Partial<ApiProject>) =>
    api.put<ApiProject>(`/pm/projects/${id}`, data),

  deleteProject: (id: string) =>
    api.delete<void>(`/pm/projects/${id}`),

  archiveProject: (id: string) =>
    api.post<ApiProject>(`/pm/projects/${id}/archive`),

  // Tasks
  getTasksByProject: (projectId: string) =>
    api.get<ApiTask[]>(`/pm/tasks/project/${projectId}`),

  getTasksByAssignee: (assigneeId: string) =>
    api.get<ApiTask[]>(`/pm/tasks/assignee/${assigneeId}`),

  createTask: (data: Partial<ApiTask>) =>
    api.post<ApiTask>('/pm/tasks', data),

  updateTask: (id: string, data: Partial<ApiTask>) =>
    api.put<ApiTask>(`/pm/tasks/${id}`, data),

  moveTask: (id: string, status: string, statusOrder = 0) =>
    api.put<ApiTask>(`/pm/tasks/${id}/move`, { status, statusOrder }),

  deleteTask: (id: string) =>
    api.delete<void>(`/pm/tasks/${id}`),
}

export default projectApi
