export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  role: string
  roles: string[]
  permissions: string[]
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
  role?: string
  roles: string[]
  officeLocation: string
  isActive: boolean
}

export interface UpdateUserRequest {
  email?: string
  fullName?: string
  phone?: string
  role?: string
  roles?: string[]
  officeLocation?: string
  isActive?: boolean
}

export interface PermissionDefinition {
  id: string
  permissionKey: string
  module: string
  action: string
  description?: string
  isActive: boolean
}

export interface RoleDefinition {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  permissionKeys: string[]
  permissions?: PermissionDefinition[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  isActive?: boolean
  permissionKeys: string[]
}

export interface UpdateRoleRequest {
  description?: string
  isActive?: boolean
}

export interface UpdateRolePermissionsRequest {
  permissionKeys: string[]
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