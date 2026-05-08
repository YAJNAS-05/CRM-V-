export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: RoleCategory;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  isSystem: boolean;
  prerequisites?: string[];
  conflicts?: string[];
  hierarchy: RoleHierarchy;
  metadata: RoleMetadata;
  icon?: string;
  color?: string;
}

export interface RoleCategory {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface RoleHierarchy {
  level: number;
  parent?: string;
  children?: string[];
  inheritsFrom?: string[];
}

export interface RoleMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  usageCount: number;
  satisfactionScore?: number;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  module: string;
  category: PermissionCategory;
  isGranted: boolean;
}

export type PermissionCategory = 
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'APPROVE'
  | 'ADMIN';

export interface RoleConflict {
  type: 'HIERARCHY' | 'PERMISSION' | 'PREREQUISITE';
  conflictingRoles: string[];
  description: string;
  severity: 'WARNING' | 'ERROR' | 'INFO';
  resolution?: string;
}

export interface RoleAnalytics {
  assignedUsers: number;
  usageFrequency: number;
  avgSessionDuration: number;
  lastModified: Date;
  satisfactionScore: number;
  commonCombinations: string[][];
}

export interface PermissionSummary {
  totalPermissions: number;
  moduleBreakdown: ModulePermissionBreakdown[];
  hasAdminAccess: boolean;
  permissions: string[];
}

export interface ModulePermissionBreakdown {
  module: string;
  count: number;
  permissions: string[];
}

export interface BulkOperation {
  type: 'ASSIGN' | 'REMOVE' | 'COPY';
  targetUsers: string[];
  targetRoles: string[];
  sourceUser?: string;
  dryRun?: boolean;
}

export interface BulkOperationResult {
  success: string[];
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  roles: string[];
  lastLogin?: Date;
}

export interface RoleCheckboxContainerProps {
  availableRoles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string, checked: boolean) => void;
  onBulkSelection?: (roleIds: string[]) => void;
  showPermissions?: boolean;
  enableBulkActions?: boolean;
  conflictDetection?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface RoleCategoryGroupProps {
  category: RoleCategory;
  roles: Role[];
  selectedRoles: string[];
  onRoleToggle: (roleId: string, checked: boolean) => void;
  expanded?: boolean;
  showRoleCount?: boolean;
  disabled?: boolean;
  onToggleExpanded?: (categoryId: string) => void;
}

export interface RoleCheckboxItemProps {
  role: Role;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  showPermissions?: boolean;
  showUserCount?: boolean;
  disabled?: boolean;
  conflictWarning?: string;
  showDescription?: boolean;
  compact?: boolean;
}

export interface RoleDetailsPanelProps {
  role: Role;
  users: User[];
  permissions: Permission[];
  conflicts?: RoleConflict[];
  analytics?: RoleAnalytics;
  onEditRole?: () => void;
  onViewUsers?: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export interface BulkAssignmentProps {
  users: User[];
  roles: Role[];
  selectedUsers: string[];
  selectedRoles: string[];
  onUserSelectionChange: (userIds: string[]) => void;
  onRoleSelectionChange: (roleIds: string[]) => void;
  onExecuteBulkOperation: (operation: BulkOperation) => Promise<BulkOperationResult>;
  loading?: boolean;
  disabled?: boolean;
}

export interface RoleSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFilterByCategory?: (categoryId: string) => void;
  onFilterByPermission?: (permission: string) => void;
  categories: RoleCategory[];
  permissions: Permission[];
  loading?: boolean;
  placeholder?: string;
}

export interface RoleConflictAlertProps {
  conflicts: RoleConflict[];
  onResolveConflict?: (conflictId: string) => void;
  onIgnoreConflict?: (conflictId: string) => void;
  dismissible?: boolean;
}

export interface PermissionPreviewProps {
  roleIds: string[];
  roles: Role[];
  showModuleBreakdown?: boolean;
  showPermissionList?: boolean;
  compact?: boolean;
}

export interface RoleManagementState {
  roles: Role[];
  selectedRoles: string[];
  conflicts: RoleConflict[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  expandedCategories: string[];
  selectedRole: Role | null;
  showDetails: boolean;
}

export interface RoleManagementActions {
  loadRoles: () => Promise<void>;
  toggleRole: (roleId: string) => void;
  selectMultipleRoles: (roleIds: string[]) => void;
  clearSelection: () => void;
  searchRoles: (query: string) => void;
  filterByCategory: (categoryId: string) => void;
  detectConflicts: () => void;
  toggleCategoryExpanded: (categoryId: string) => void;
  selectRole: (role: Role) => void;
  showRoleDetails: (show: boolean) => void;
}

// Role Categories Constants
export const ROLE_CATEGORIES: Record<string, RoleCategory> = {
  EXECUTIVE: {
    id: 'EXECUTIVE',
    name: 'EXECUTIVE',
    displayName: 'Executive Roles',
    description: 'C-level and strategic leadership positions',
    icon: '👔',
    color: '#8B5CF6',
    order: 1
  },
  MANAGEMENT: {
    id: 'MANAGEMENT',
    name: 'MANAGEMENT',
    displayName: 'Management Roles',
    description: 'Department and team leadership positions',
    icon: '👥',
    color: '#3B82F6',
    order: 2
  },
  OPERATIONAL: {
    id: 'OPERATIONAL',
    name: 'OPERATIONAL',
    displayName: 'Operational Roles',
    description: 'Day-to-day operational and functional roles',
    icon: '💼',
    color: '#10B981',
    order: 3
  },
  SUPPORT: {
    id: 'SUPPORT',
    name: 'SUPPORT',
    displayName: 'Support Roles',
    description: 'Support and access-level positions',
    icon: '🔐',
    color: '#6B7280',
    order: 4
  }
};

// Default Roles Data
export const DEFAULT_ROLES: Role[] = [
  // Executive Roles
  {
    id: 'CEO',
    name: 'CEO',
    displayName: 'Chief Executive Officer',
    description: 'Strategic oversight and company leadership',
    category: ROLE_CATEGORIES.EXECUTIVE,
    permissions: ['ADMIN', 'VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'],
    userCount: 1,
    isActive: true,
    isSystem: true,
    hierarchy: { level: 1 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastModifiedBy: 'system',
      usageCount: 0
    },
    icon: '👔',
    color: '#8B5CF6'
  },
  {
    id: 'CFO',
    name: 'CFO',
    displayName: 'Chief Financial Officer',
    description: 'Financial management and oversight',
    category: ROLE_CATEGORIES.EXECUTIVE,
    permissions: ['FINANCE_ADMIN', 'FINANCE_VIEW', 'FINANCE_CREATE', 'FINANCE_EDIT', 'FINANCE_APPROVE'],
    userCount: 1,
    isActive: true,
    isSystem: true,
    hierarchy: { level: 1 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastModifiedBy: 'system',
      usageCount: 0
    },
    icon: '💰',
    color: '#8B5CF6'
  },
  // Management Roles
  {
    id: 'SALES_MANAGER',
    name: 'SALES_MANAGER',
    displayName: 'Sales Manager',
    description: 'Sales team leadership and pipeline management',
    category: ROLE_CATEGORIES.MANAGEMENT,
    permissions: ['CRM_VIEW', 'CRM_CREATE', 'CRM_EDIT', 'SALES_REPORTS_VIEW', 'TEAM_MANAGEMENT'],
    userCount: 3,
    isActive: true,
    isSystem: false,
    hierarchy: { level: 2 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      usageCount: 0
    },
    icon: '📈',
    color: '#3B82F6'
  },
  {
    id: 'HR_MANAGER',
    name: 'HR_MANAGER',
    displayName: 'HR Manager',
    description: 'Human resources and employee management',
    category: ROLE_CATEGORIES.MANAGEMENT,
    permissions: ['HR_VIEW', 'HR_CREATE', 'HR_EDIT', 'HR_ADMIN', 'EMPLOYEE_MANAGEMENT'],
    userCount: 2,
    isActive: true,
    isSystem: false,
    hierarchy: { level: 2 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      usageCount: 0
    },
    icon: '👤',
    color: '#3B82F6'
  },
  // Operational Roles
  {
    id: 'SALES_REP',
    name: 'SALES_REP',
    displayName: 'Sales Representative',
    description: 'Lead generation and customer relationship management',
    category: ROLE_CATEGORIES.OPERATIONAL,
    permissions: ['CRM_VIEW', 'CRM_CREATE', 'CRM_EDIT'],
    userCount: 12,
    isActive: true,
    isSystem: false,
    hierarchy: { level: 3 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      usageCount: 0
    },
    icon: '🎯',
    color: '#10B981'
  },
  {
    id: 'FINANCE_ANALYST',
    name: 'FINANCE_ANALYST',
    displayName: 'Finance Analyst',
    description: 'Financial analysis and reporting',
    category: ROLE_CATEGORIES.OPERATIONAL,
    permissions: ['FINANCE_VIEW', 'FINANCE_CREATE', 'REPORTS_VIEW'],
    userCount: 5,
    isActive: true,
    isSystem: false,
    hierarchy: { level: 3 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      lastModifiedBy: 'admin',
      usageCount: 0
    },
    icon: '📊',
    color: '#10B981'
  },
  // Support Roles
  {
    id: 'EMPLOYEE',
    name: 'EMPLOYEE',
    displayName: 'Employee',
    description: 'Basic employee self-service access',
    category: ROLE_CATEGORIES.SUPPORT,
    permissions: ['SELF_SERVICE_VIEW', 'SELF_SERVICE_EDIT'],
    userCount: 150,
    isActive: true,
    isSystem: true,
    hierarchy: { level: 4 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastModifiedBy: 'system',
      usageCount: 0
    },
    icon: '👤',
    color: '#6B7280'
  },
  {
    id: 'VIEWER',
    name: 'VIEWER',
    displayName: 'Viewer',
    description: 'Read-only access to basic information',
    category: ROLE_CATEGORIES.SUPPORT,
    permissions: ['VIEW'],
    userCount: 8,
    isActive: true,
    isSystem: true,
    hierarchy: { level: 4 },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      lastModifiedBy: 'system',
      usageCount: 0
    },
    icon: '👁️',
    color: '#6B7280'
  }
];
