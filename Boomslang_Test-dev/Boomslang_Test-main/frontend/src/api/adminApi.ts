import api from './axiosInstance'
import { CreateUserRequest, UpdateUserRequest } from '../types/auth'

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
};

export default api;
