import axiosInstance from './axiosInstance'
import { LoginRequest, LoginResponse, ApiResponse, User } from '../types'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse | null> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials)
    return response.data?.data || null
  },

  me: async (): Promise<User | null> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/v1/auth/me')
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

  // MFA Methods
  getMfaMethods: async () =>
    axiosInstance.get('/v1/auth/mfa/methods'),

  setupTotp: async () =>
    axiosInstance.post('/v1/auth/mfa/totp/setup'),

  verifyAndEnableTotp: async (code: string, secret: string) =>
    axiosInstance.post('/v1/auth/mfa/totp/verify', { code, secret }),

  sendSmsVerification: async (phoneNumber: string) =>
    axiosInstance.post('/v1/auth/mfa/sms/send', { phoneNumber }),

  verifyAndEnableSms: async (phoneNumber: string, code: string) =>
    axiosInstance.post('/v1/auth/mfa/sms/verify', { phoneNumber, code }),

  generateBackupCodes: async () =>
    axiosInstance.post('/v1/auth/mfa/backup-codes/generate'),

  disableMfaMethod: async (methodId: string) =>
    axiosInstance.delete(`/v1/auth/mfa/methods/${methodId}`),
}
