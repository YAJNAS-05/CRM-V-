export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  role: string
  officeLocation: string
  isActive: boolean
  lastLogin: string | null
  avatarUrl: string | null
}

export interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  phone: string
  role: string
  officeLocation: string
  isActive: boolean
}

export interface UpdateUserRequest {
  email?: string
  fullName?: string
  phone?: string
  role?: string
  officeLocation?: string
  isActive?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}