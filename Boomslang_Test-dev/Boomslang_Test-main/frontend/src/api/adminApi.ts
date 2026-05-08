import api from './axiosInstance'
import {
  CreateRoleRequest,
  CreateUserRequest,
  UpdateRolePermissionsRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
} from '../types/auth'

// Admin & Dashboard API
export const adminApi = {
  getAnalytics: () =>
    api.get('/v1/admin/dashboard/analytics'),
    
  getAuditLogs: (page = 0, size = 20) =>
    api.get(`/v1/admin/audit/logs?page=${page}&size=${size}`),
    
  // User Management APIs
  getUsers: (page = 0, size = 20) =>
    api.get(`/v1/admin/users?page=${page}&size=${size}`),
    
  getUserById: (userId: string) =>
    api.get(`/v1/admin/users/${userId}`),
    
  getUsersByRole: (role: string, page = 0, size = 20) =>
    api.get(`/v1/admin/users/role/${role}?page=${page}&size=${size}`),
    
  createUser: (data: CreateUserRequest) =>
    api.post('/v1/admin/users', data),
    
  updateUser: (userId: string, data: UpdateUserRequest) =>
    api.put(`/v1/admin/users/${userId}`, data),
    
  deleteUser: (userId: string) =>
    api.delete(`/v1/admin/users/${userId}`),
    
  toggleUserStatus: (userId: string) =>
    api.patch(`/v1/admin/users/${userId}/toggle-status`),

  // Role & Permission APIs
  getRoles: () =>
    api.get('/v1/admin/roles'),

  getPermissions: () =>
    api.get('/v1/admin/roles/permissions'),

  getLocations: () =>
    api.get('/v1/admin/roles/locations'),

  createRole: (data: CreateRoleRequest) =>
    api.post('/v1/admin/roles', data),

  updateRole: (roleId: string, data: UpdateRoleRequest) =>
    api.put(`/v1/admin/roles/${roleId}`, data),

  updateRolePermissions: (roleId: string, data: UpdateRolePermissionsRequest) =>
    api.put(`/v1/admin/roles/${roleId}/permissions`, data),

  deleteRole: (roleId: string) =>
    api.delete(`/v1/admin/roles/${roleId}`),

  // Query Builder APIs
  executeQuery: (sql: string) =>
    api.post('/v1/admin/query/execute', { sql }),
  
  validateQuery: (sql: string) =>
    api.post('/v1/admin/query/validate', { sql }),
  
  getTableSchema: (tableName: string) =>
    api.get(`/v1/admin/query/schema/${tableName}`),
  
  getSavedQueries: () =>
    api.get('/v1/admin/query/saved'),
  
  saveQuery: (name: string, description: string, sql: string) =>
    api.post('/v1/admin/query/save', { name, description, sql }),
  
  deleteSavedQuery: (queryId: string) =>
    api.delete(`/v1/admin/query/saved/${queryId}`),
};

export default api;
