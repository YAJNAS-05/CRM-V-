import axiosInstance from './axiosInstance'
import { LoginRequest, LoginResponse, ApiResponse } from '../types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials)
    return response.data?.data || null
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse | null> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/v1/auth/refresh', {
      refreshToken,
    })
    return response.data?.data || null
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/v1/auth/logout', { refreshToken })
  },
}
