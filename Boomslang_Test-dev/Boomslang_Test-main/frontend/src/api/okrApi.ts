import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

import { Objective, OkrCycle, CreateObjectiveRequest, UpdateKeyResultProgressRequest, OkrDashboardDto } from '../types/hr'
import { ApiResponse } from '../types/common'

// OKR Cycles
export const okrCycleApi = {
  getAll: () => axiosInstance.get<ApiResponse<OkrCycle[]>>('/v1/hr/okr/cycles'),
  getById: (id: string) => axiosInstance.get<ApiResponse<OkrCycle>>(`/v1/hr/okr/cycles/${id}`),
  create: (data: Partial<OkrCycle>) => axiosInstance.post<ApiResponse<OkrCycle>>('/v1/hr/okr/cycles', data),
  update: (id: string, data: Partial<OkrCycle>) => axiosInstance.put<ApiResponse<OkrCycle>>(`/v1/hr/okr/cycles/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/v1/hr/okr/cycles/${id}`),
}

// Objectives
export const objectiveApi = {
  getAll: (cycleId?: string, employeeId?: string) => {
    const params = new URLSearchParams()
    if (cycleId) params.append('cycleId', cycleId)
    if (employeeId) params.append('employeeId', employeeId)
    return axiosInstance.get<ApiResponse<Objective[]>>(`/v1/hr/okr/objectives?${params}`)
  },
  getMyObjectives: () => axiosInstance.get<ApiResponse<Objective[]>>('/v1/hr/okr/objectives/my'),
  getById: (id: string) => axiosInstance.get<ApiResponse<Objective>>(`/v1/hr/okr/objectives/${id}`),
  create: (data: CreateObjectiveRequest) => axiosInstance.post<ApiResponse<Objective>>('/v1/hr/okr/objectives', data),
  update: (id: string, data: Partial<Objective>) => axiosInstance.put<ApiResponse<Objective>>(`/v1/hr/okr/objectives/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/v1/hr/okr/objectives/${id}`),
  updateStatus: (id: string, status: string) => axiosInstance.patch(`/v1/hr/okr/objectives/${id}/status`, { status }),
}

// Key Results
export const keyResultApi = {
  updateProgress: (id: string, data: UpdateKeyResultProgressRequest) =>
    axiosInstance.patch(`/v1/hr/okr/key-results/${id}/progress`, data),
  updateStatus: (id: string, status: string) =>
    axiosInstance.patch(`/v1/hr/okr/key-results/${id}/status`, { status }),
}

// Dashboard
export const okrDashboardApi = {
  getDashboard: () => axiosInstance.get<ApiResponse<OkrDashboardDto>>('/v1/hr/okr/dashboard'),
}
