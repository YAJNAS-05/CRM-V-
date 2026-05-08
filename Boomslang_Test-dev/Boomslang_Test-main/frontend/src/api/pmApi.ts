import axiosInstance from './axiosInstance'
import { ApiResponse, Page } from '../types'
import { Task, TaskStatus } from '../types/hr'
import {
  Project,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddProjectMemberRequest,
  ProjectCost,
  CreateProjectCostRequest
} from '../types/pm'

const pmApi = {
  projectApi: {
    getAll: (page = 0, size = 20, params?: { status?: string; ownerId?: string }) =>
      axiosInstance.get<ApiResponse<Page<Project>>>(
        `/v1/pm/projects?${buildQueryString(page, size, params)}`,
      ),
    getById: (id: string) =>
      axiosInstance.get<ApiResponse<ProjectDetail>>(`/v1/pm/projects/${id}`),
    create: (data: CreateProjectRequest) =>
      axiosInstance.post<ApiResponse<Project>>('/v1/pm/projects', data),
    update: (id: string, data: UpdateProjectRequest) =>
      axiosInstance.put<ApiResponse<Project>>(`/v1/pm/projects/${id}`, data),
    delete: (id: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${id}`),
    addMember: (id: string, data: AddProjectMemberRequest) =>
      axiosInstance.post<ApiResponse<ProjectMember>>(`/v1/pm/projects/${id}/members`, data),
    removeMember: (id: string, employeeId: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${id}/members/${employeeId}`),
    addCost: (id: string, data: CreateProjectCostRequest) =>
      axiosInstance.post<ApiResponse<ProjectCost>>(`/v1/pm/projects/${id}/costs`, data),
  },
  taskApi: {
    getAll: (
      page = 0,
      size = 50,
      params?: {
        projectId?: string
        assigneeId?: string
        status?: TaskStatus
      },
    ) =>
      axiosInstance.get<ApiResponse<Page<Task>>>(
        `/v1/pm/tasks?${buildQueryString(page, size, params)}`,
      ),
    getById: (id: string) =>
      axiosInstance.get<ApiResponse<Task>>(`/v1/pm/tasks/${id}`),
    create: (data: Partial<Task>) =>
      axiosInstance.post<ApiResponse<Task>>('/v1/pm/tasks', data),
    update: (id: string, data: Partial<Task>) =>
      axiosInstance.put<ApiResponse<Task>>(`/v1/pm/tasks/${id}`, data),
    updateStatus: (id: string, status: TaskStatus) =>
      axiosInstance.patch<ApiResponse<Task>>(`/v1/pm/tasks/${id}/status?status=${status}`),
    delete: (id: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/tasks/${id}`),
  },
  sprintApi: {
    getAll: (projectId: string, page = 0, size = 20) =>
      axiosInstance.get<ApiResponse<Page<any>>>(
        `/v1/pm/projects/${projectId}/sprints?page=${page}&size=${size}`,
      ),
    getById: (projectId: string, sprintId: string) =>
      axiosInstance.get<ApiResponse<any>>(`/v1/pm/projects/${projectId}/sprints/${sprintId}`),
    create: (projectId: string, data: any) =>
      axiosInstance.post<ApiResponse<any>>(`/v1/pm/projects/${projectId}/sprints`, data),
    update: (projectId: string, sprintId: string, data: any) =>
      axiosInstance.put<ApiResponse<any>>(`/v1/pm/projects/${projectId}/sprints/${sprintId}`, data),
    delete: (projectId: string, sprintId: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${projectId}/sprints/${sprintId}`),
  },
  milestoneApi: {
    getAll: (projectId: string, page = 0, size = 20) =>
      axiosInstance.get<ApiResponse<Page<any>>>(
        `/v1/pm/projects/${projectId}/milestones?page=${page}&size=${size}`,
      ),
    getById: (projectId: string, milestoneId: string) =>
      axiosInstance.get<ApiResponse<any>>(`/v1/pm/projects/${projectId}/milestones/${milestoneId}`),
    create: (projectId: string, data: any) =>
      axiosInstance.post<ApiResponse<any>>(`/v1/pm/projects/${projectId}/milestones`, data),
    update: (projectId: string, milestoneId: string, data: any) =>
      axiosInstance.put<ApiResponse<any>>(`/v1/pm/projects/${projectId}/milestones/${milestoneId}`, data),
    delete: (projectId: string, milestoneId: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${projectId}/milestones/${milestoneId}`),
  },
  issueApi: {
    getAll: (projectId: string, page = 0, size = 20) =>
      axiosInstance.get<ApiResponse<Page<any>>>(
        `/v1/pm/projects/${projectId}/issues?page=${page}&size=${size}`,
      ),
    getById: (projectId: string, issueId: string) =>
      axiosInstance.get<ApiResponse<any>>(`/v1/pm/projects/${projectId}/issues/${issueId}`),
    create: (projectId: string, data: any) =>
      axiosInstance.post<ApiResponse<any>>(`/v1/pm/projects/${projectId}/issues`, data),
    update: (projectId: string, issueId: string, data: any) =>
      axiosInstance.put<ApiResponse<any>>(`/v1/pm/projects/${projectId}/issues/${issueId}`, data),
    delete: (projectId: string, issueId: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${projectId}/issues/${issueId}`),
  },
  riskApi: {
    getAll: (projectId: string, page = 0, size = 20) =>
      axiosInstance.get<ApiResponse<Page<any>>>(
        `/v1/pm/projects/${projectId}/risks?page=${page}&size=${size}`,
      ),
    getById: (projectId: string, riskId: string) =>
      axiosInstance.get<ApiResponse<any>>(`/v1/pm/projects/${projectId}/risks/${riskId}`),
    create: (projectId: string, data: any) =>
      axiosInstance.post<ApiResponse<any>>(`/v1/pm/projects/${projectId}/risks`, data),
    update: (projectId: string, riskId: string, data: any) =>
      axiosInstance.put<ApiResponse<any>>(`/v1/pm/projects/${projectId}/risks/${riskId}`, data),
    delete: (projectId: string, riskId: string) =>
      axiosInstance.delete<ApiResponse<void>>(`/v1/pm/projects/${projectId}/risks/${riskId}`),
  },
}

const buildQueryString = (
  page: number,
  size: number,
  params?: Record<string, string | number | boolean | undefined | null>,
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(page))
  searchParams.set('size', String(size))

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

export { pmApi }
export const projectApi = pmApi.projectApi
export const taskApi = pmApi.taskApi
export const sprintApi = pmApi.sprintApi
export const milestoneApi = pmApi.milestoneApi
export const issueApi = pmApi.issueApi
export const riskApi = pmApi.riskApi
