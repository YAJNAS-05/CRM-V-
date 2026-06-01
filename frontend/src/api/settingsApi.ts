import axiosInstance from './axiosInstance'
import type { ApiResponse, SettingsResponse, UserSettings } from '../types'

export interface UpdateSettingsRequest extends UserSettings {}

const unwrap = <T>(payload: ApiResponse<T> | T | null | undefined): T | null => {
  if (!payload) {
    return null
  }

  if (typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }

  return payload as T
}

export const settingsApi = {
  getMySettings: async (): Promise<SettingsResponse | null> => {
    const response = await axiosInstance.get<ApiResponse<SettingsResponse>>('/v1/admin/settings/me')
    return unwrap(response.data)
  },

  updateMySettings: async (request: UpdateSettingsRequest): Promise<SettingsResponse | null> => {
    const response = await axiosInstance.put<ApiResponse<SettingsResponse>>('/v1/admin/settings/me', request)
    return unwrap(response.data)
  },

  getRoleSettings: async (roleName: string): Promise<SettingsResponse | null> => {
    const response = await axiosInstance.get<ApiResponse<SettingsResponse>>(`/v1/admin/settings/roles/${encodeURIComponent(roleName)}`)
    return unwrap(response.data)
  },

  updateRoleSettings: async (roleName: string, request: UpdateSettingsRequest): Promise<SettingsResponse | null> => {
    const response = await axiosInstance.put<ApiResponse<SettingsResponse>>(`/v1/admin/settings/roles/${encodeURIComponent(roleName)}`, request)
    return unwrap(response.data)
  },
}