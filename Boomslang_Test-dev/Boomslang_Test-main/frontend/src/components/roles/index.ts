export { default as RoleCheckboxContainer } from './RoleCheckboxContainer';
export { default as RoleCategoryGroup } from './RoleCategoryGroup';
export { default as RoleCheckboxItem } from './RoleCheckboxItem';
export { default as RoleDetailsPanel } from './RoleDetailsPanel';
export { default as BulkAssignment } from './BulkAssignment';

export type {
  Role,
  RoleCategory,
  RoleHierarchy,
  RoleMetadata,
  Permission,
  PermissionCategory,
  RoleConflict,
  RoleAnalytics,
  PermissionSummary,
  ModulePermissionBreakdown,
  BulkOperation,
  BulkOperationResult,
  User,
  RoleCheckboxContainerProps,
  RoleCategoryGroupProps,
  RoleCheckboxItemProps,
  RoleDetailsPanelProps,
  BulkAssignmentProps,
  RoleSearchProps,
  RoleConflictAlertProps,
  PermissionPreviewProps,
  RoleManagementState,
  RoleManagementActions
} from '@/types/roles';

export { ROLE_CATEGORIES, DEFAULT_ROLES } from '@/types/roles';
