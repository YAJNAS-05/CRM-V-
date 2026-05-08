import { apiClient } from './apiClient';
import { 
  Role, 
  User, 
  RoleConflict, 
  BulkOperation, 
  BulkOperationResult,
  RoleAnalytics,
  Permission,
  RoleCategory
} from '@/types/roles';

export interface RoleManagementApi {
  // Role CRUD operations
  getRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role>;
  createRole(role: Omit<Role, 'id' | 'metadata' | 'userCount'>): Promise<Role>;
  updateRole(id: string, role: Partial<Role>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  
  // User role assignments
  getUserRoles(userId: string): Promise<string[]>;
  assignRoles(userId: string, roleIds: string[]): Promise<void>;
  removeRoles(userId: string, roleIds: string[]): Promise<void>;
  updateUserRoles(userId: string, roleIds: string[]): Promise<void>;
  
  // Bulk operations
  bulkAssignRoles(operation: BulkOperation): Promise<BulkOperationResult>;
  bulkRemoveRoles(operation: BulkOperation): Promise<BulkOperationResult>;
  bulkCopyRoles(operation: BulkOperation): Promise<BulkOperationResult>;
  
  // Search and filtering
  searchRoles(query: string, filters?: RoleSearchFilters): Promise<Role[]>;
  filterRolesByCategory(categoryId: string): Promise<Role[]>;
  filterRolesByPermission(permission: string): Promise<Role[]>;
  
  // Conflict detection
  detectRoleConflicts(roleIds: string[]): Promise<RoleConflict[]>;
  validateRoleAssignment(userId: string, roleIds: string[]): Promise<RoleConflict[]>;
  
  // Analytics and reporting
  getRoleAnalytics(roleId: string): Promise<RoleAnalytics>;
  getRoleUsageStats(): Promise<RoleUsageStats>;
  getRoleAssignmentHistory(userId: string): Promise<RoleAssignmentRecord[]>;
  
  // Permissions
  getPermissions(): Promise<Permission[]>;
  getRolePermissions(roleId: string): Promise<Permission[]>;
  
  // Categories
  getRoleCategories(): Promise<RoleCategory[]>;
  
  // Users
  getUsers(): Promise<User[]>;
  getUsersWithRole(roleId: string): Promise<User[]>;
  getUser(userId: string): Promise<User>;
}

export interface RoleSearchFilters {
  categoryId?: string;
  isActive?: boolean;
  isSystem?: boolean;
  permission?: string;
  userCount?: {
    min?: number;
    max?: number;
  };
}

export interface RoleUsageStats {
  totalRoles: number;
  activeRoles: number;
  totalAssignments: number;
  averageRolesPerUser: number;
  mostUsedRoles: Array<{
    roleId: string;
    roleName: string;
    userCount: number;
  }>;
  leastUsedRoles: Array<{
    roleId: string;
    roleName: string;
    userCount: number;
  }>;
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    roleCount: number;
    userCount: number;
  }>;
}

export interface RoleAssignmentRecord {
  id: string;
  userId: string;
  roleId: string;
  action: 'ASSIGNED' | 'REMOVED';
  assignedBy: string;
  assignedAt: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

class RoleManagementApiImpl implements RoleManagementApi {
  // Role CRUD operations
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/api/v1/roles');
    return response.data;
  }

  async getRole(id: string): Promise<Role> {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    return response.data;
  }

  async createRole(role: Omit<Role, 'id' | 'metadata' | 'userCount'>): Promise<Role> {
    const response = await apiClient.post('/api/v1/roles', role);
    return response.data;
  }

  async updateRole(id: string, role: Partial<Role>): Promise<Role> {
    const response = await apiClient.put(`/api/v1/roles/${id}`, role);
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/${id}`);
  }

  // User role assignments
  async getUserRoles(userId: string): Promise<string[]> {
    const response = await apiClient.get(`/api/v1/users/${userId}/roles`);
    return response.data;
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await apiClient.post(`/api/v1/users/${userId}/roles/assign`, { roleIds });
  }

  async removeRoles(userId: string, roleIds: string[]): Promise<void> {
    await apiClient.post(`/api/v1/users/${userId}/roles/remove`, { roleIds });
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    await apiClient.put(`/api/v1/users/${userId}/roles`, { roleIds });
  }

  // Bulk operations
  async bulkAssignRoles(operation: BulkOperation): Promise<BulkOperationResult> {
    const response = await apiClient.post('/api/v1/roles/bulk/assign', operation);
    return response.data;
  }

  async bulkRemoveRoles(operation: BulkOperation): Promise<BulkOperationResult> {
    const response = await apiClient.post('/api/v1/roles/bulk/remove', operation);
    return response.data;
  }

  async bulkCopyRoles(operation: BulkOperation): Promise<BulkOperationResult> {
    const response = await apiClient.post('/api/v1/roles/bulk/copy', operation);
    return response.data;
  }

  // Search and filtering
  async searchRoles(query: string, filters?: RoleSearchFilters): Promise<Role[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.isSystem !== undefined) params.append('isSystem', filters.isSystem.toString());
      if (filters.permission) params.append('permission', filters.permission);
      if (filters.userCount?.min) params.append('userCountMin', filters.userCount.min.toString());
      if (filters.userCount?.max) params.append('userCountMax', filters.userCount.max.toString());
    }

    const response = await apiClient.get(`/api/v1/roles/search?${params}`);
    return response.data;
  }

  async filterRolesByCategory(categoryId: string): Promise<Role[]> {
    const response = await apiClient.get(`/api/v1/roles/category/${categoryId}`);
    return response.data;
  }

  async filterRolesByPermission(permission: string): Promise<Role[]> {
    const response = await apiClient.get(`/api/v1/roles/permission/${permission}`);
    return response.data;
  }

  // Conflict detection
  async detectRoleConflicts(roleIds: string[]): Promise<RoleConflict[]> {
    const response = await apiClient.post('/api/v1/roles/conflicts/detect', { roleIds });
    return response.data;
  }

  async validateRoleAssignment(userId: string, roleIds: string[]): Promise<RoleConflict[]> {
    const response = await apiClient.post(`/api/v1/users/${userId}/roles/validate`, { roleIds });
    return response.data;
  }

  // Analytics and reporting
  async getRoleAnalytics(roleId: string): Promise<RoleAnalytics> {
    const response = await apiClient.get(`/api/v1/roles/${roleId}/analytics`);
    return response.data;
  }

  async getRoleUsageStats(): Promise<RoleUsageStats> {
    const response = await apiClient.get('/api/v1/roles/stats');
    return response.data;
  }

  async getRoleAssignmentHistory(userId: string): Promise<RoleAssignmentRecord[]> {
    const response = await apiClient.get(`/api/v1/users/${userId}/roles/history`);
    return response.data;
  }

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/api/v1/permissions');
    return response.data;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await apiClient.get(`/api/v1/roles/${roleId}/permissions`);
    return response.data;
  }

  // Categories
  async getRoleCategories(): Promise<RoleCategory[]> {
    const response = await apiClient.get('/api/v1/roles/categories');
    return response.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/v1/users');
    return response.data;
  }

  async getUsersWithRole(roleId: string): Promise<User[]> {
    const response = await apiClient.get(`/api/v1/roles/${roleId}/users`);
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    return response.data;
  }
}

// Create and export the API instance
export const roleApi: RoleManagementApi = new RoleManagementApiImpl();

// Export types for use in components
export type { 
  RoleManagementApi, 
  RoleSearchFilters, 
  RoleUsageStats, 
  RoleAssignmentRecord 
};

// Utility functions for common operations
export const roleUtils = {
  // Check if a user has a specific role
  async userHasRole(userId: string, roleId: string): Promise<boolean> {
    const userRoles = await roleApi.getUserRoles(userId);
    return userRoles.includes(roleId);
  },

  // Check if a user has any of the specified roles
  async userHasAnyRole(userId: string, roleIds: string[]): Promise<boolean> {
    const userRoles = await roleApi.getUserRoles(userId);
    return roleIds.some(roleId => userRoles.includes(roleId));
  },

  // Check if a user has all of the specified roles
  async userHasAllRoles(userId: string, roleIds: string[]): Promise<boolean> {
    const userRoles = await roleApi.getUserRoles(userId);
    return roleIds.every(roleId => userRoles.includes(roleId));
  },

  // Get all users with a specific role category
  async getUsersWithRoleCategory(categoryId: string): Promise<User[]> {
    const roles = await roleApi.filterRolesByCategory(categoryId);
    const usersWithCategory: User[] = [];
    
    for (const role of roles) {
      const users = await roleApi.getUsersWithRole(role.id);
      usersWithCategory.push(...users);
    }
    
    // Remove duplicates
    const uniqueUsers = usersWithCategory.filter((user, index, self) =>
      index === self.findIndex(u => u.id === user.id)
    );
    
    return uniqueUsers;
  },

  // Get role hierarchy information
  async getRoleHierarchy(roleId: string): Promise<{
    role: Role;
    parent?: Role;
    children: Role[];
    ancestors: Role[];
    descendants: Role[];
  }> {
    const role = await roleApi.getRole(roleId);
    const allRoles = await roleApi.getRoles();
    
    const parent = role.hierarchy.parent 
      ? allRoles.find(r => r.id === role.hierarchy.parent)
      : undefined;
    
    const children = allRoles.filter(r => 
      r.hierarchy.parent === roleId
    );
    
    const ancestors = allRoles.filter(r => 
      role.hierarchy.inheritsFrom?.includes(r.id)
    );
    
    const descendants = allRoles.filter(r => 
      r.hierarchy.inheritsFrom?.includes(roleId)
    );
    
    return {
      role,
      parent,
      children,
      ancestors,
      descendants
    };
  },

  // Validate role assignment before execution
  async validateBulkAssignment(operation: BulkOperation): Promise<{
    isValid: boolean;
    conflicts: RoleConflict[];
    warnings: string[];
  }> {
    const conflicts: RoleConflict[] = [];
    const warnings: string[] = [];
    
    // Check each user for conflicts
    for (const userId of operation.targetUsers) {
      const userConflicts = await roleApi.validateRoleAssignment(
        userId, 
        operation.targetRoles
      );
      conflicts.push(...userConflicts);
    }
    
    // Check if source user exists for copy operations
    if (operation.type === 'COPY' && operation.sourceUser) {
      try {
        await roleApi.getUser(operation.sourceUser);
      } catch {
        warnings.push(`Source user ${operation.sourceUser} not found`);
      }
    }
    
    const isValid = conflicts.length === 0 && warnings.length === 0;
    
    return {
      isValid,
      conflicts,
      warnings
    };
  },

  // Format role assignment history for display
  formatAssignmentHistory(records: RoleAssignmentRecord[]): Array<{
    date: Date;
    action: string;
    roleName: string;
    assignedBy: string;
    reason?: string;
  }> {
    return records.map(record => ({
      date: record.assignedAt,
      action: record.action,
      roleName: record.roleId, // In real implementation, fetch role name
      assignedBy: record.assignedBy,
      reason: record.reason
    }));
  },

  // Get role suggestions based on user's current roles
  async getRoleSuggestions(userId: string): Promise<{
    recommended: Role[];
    compatible: Role[];
    conflicting: Role[];
  }> {
    const userRoles = await roleApi.getUserRoles(userId);
    const allRoles = await roleApi.getRoles();
    const currentRoleIds = new Set(userRoles);
    
    const recommended: Role[] = [];
    const compatible: Role[] = [];
    const conflicting: Role[] = [];
    
    for (const role of allRoles) {
      if (currentRoleIds.has(role.id)) continue;
      
      const conflicts = await roleApi.detectRoleConflicts([...userRoles, role.id]);
      
      if (conflicts.length > 0) {
        conflicting.push(role);
      } else if (role.prerequisites && role.prerequisites.some(prereq => !currentRoleIds.has(prereq))) {
        compatible.push(role);
      } else {
        recommended.push(role);
      }
    }
    
    return {
      recommended,
      compatible,
      conflicting
    };
  }
};
