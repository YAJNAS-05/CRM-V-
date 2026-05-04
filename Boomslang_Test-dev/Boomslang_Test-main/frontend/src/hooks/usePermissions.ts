import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

// ─── Role Constants ────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_REP: 'SALES_REP',
  FINANCE: 'FINANCE',
  SERVICE_TECH: 'SERVICE_TECH',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
  VIEWER: 'VIEWER',
  READ_ONLY: 'READ_ONLY',
} as const

export type RoleName = typeof ROLES[keyof typeof ROLES]

// ─── Permission Constants ──────────────────────────────────────────────────────
export const PERMISSIONS = {
  // CRM
  CRM_VIEW: 'CRM_VIEW',
  CRM_CREATE: 'CRM_CREATE',
  CRM_EDIT: 'CRM_EDIT',
  CRM_DELETE: 'CRM_DELETE',

  // ERP
  ERP_VIEW: 'ERP_VIEW',
  ERP_CREATE: 'ERP_CREATE',
  ERP_EDIT: 'ERP_EDIT',
  ERP_DELETE: 'ERP_DELETE',

  // Finance
  FINANCE_VIEW: 'FINANCE_VIEW',
  FINANCE_CREATE: 'FINANCE_CREATE',
  FINANCE_EDIT: 'FINANCE_EDIT',
  FINANCE_DELETE: 'FINANCE_DELETE',

  // HR
  HR_VIEW: 'HR_VIEW',
  HR_CREATE: 'HR_CREATE',
  HR_EDIT: 'HR_EDIT',
  HR_DELETE: 'HR_DELETE',
  HR_EMPLOYEE_VIEW: 'HR_EMPLOYEE_VIEW',
  HR_EMPLOYEE_CREATE: 'HR_EMPLOYEE_CREATE',
  HR_EMPLOYEE_EDIT: 'HR_EMPLOYEE_EDIT',
  HR_EMPLOYEE_DELETE: 'HR_EMPLOYEE_DELETE',
  HR_DEPARTMENT_VIEW: 'HR_DEPARTMENT_VIEW',
  HR_DEPARTMENT_CREATE: 'HR_DEPARTMENT_CREATE',
  HR_DEPARTMENT_EDIT: 'HR_DEPARTMENT_EDIT',
  HR_DEPARTMENT_DELETE: 'HR_DEPARTMENT_DELETE',
  HR_POSITION_VIEW: 'HR_POSITION_VIEW',
  HR_POSITION_CREATE: 'HR_POSITION_CREATE',
  HR_POSITION_EDIT: 'HR_POSITION_EDIT',
  HR_POSITION_DELETE: 'HR_POSITION_DELETE',
  HR_LEAVE_REQUEST_VIEW: 'HR_LEAVE_REQUEST_VIEW',
  HR_LEAVE_REQUEST_CREATE: 'HR_LEAVE_REQUEST_CREATE',
  HR_LEAVE_REQUEST_APPROVE: 'HR_LEAVE_REQUEST_APPROVE',
  HR_TIMESHEET_VIEW: 'HR_TIMESHEET_VIEW',
  HR_TIMESHEET_CREATE: 'HR_TIMESHEET_CREATE',
  HR_TIMESHEET_APPROVE: 'HR_TIMESHEET_APPROVE',
  HR_REIMBURSEMENT_VIEW: 'HR_REIMBURSEMENT_VIEW',
  HR_REIMBURSEMENT_CREATE: 'HR_REIMBURSEMENT_CREATE',
  HR_REIMBURSEMENT_APPROVE: 'HR_REIMBURSEMENT_APPROVE',
  HR_PAYROLL_RUN_VIEW: 'HR_PAYROLL_RUN_VIEW',
  HR_PAYROLL_RUN_CREATE: 'HR_PAYROLL_RUN_CREATE',
  HR_PAYROLL_RUN_EDIT: 'HR_PAYROLL_RUN_EDIT',
  HR_PAYROLL_RUN_DELETE: 'HR_PAYROLL_RUN_DELETE',
  HR_PAYROLL_PROFILE_VIEW: 'HR_PAYROLL_PROFILE_VIEW',
  HR_PAYROLL_PROFILE_CREATE: 'HR_PAYROLL_PROFILE_CREATE',
  HR_PAYROLL_PROFILE_EDIT: 'HR_PAYROLL_PROFILE_EDIT',
  HR_PAYROLL_PROFILE_DELETE: 'HR_PAYROLL_PROFILE_DELETE',

  // Fieldwork
  FIELDWORK_VIEW: 'FIELDWORK_VIEW',
  FIELDWORK_CREATE: 'FIELDWORK_CREATE',
  FIELDWORK_EDIT: 'FIELDWORK_EDIT',

  // Reports
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_EXPORT: 'REPORT_EXPORT',
  REPORT_TEAM_VIEW: 'REPORT_TEAM_VIEW',
  REPORT_PERSONAL_VIEW: 'REPORT_PERSONAL_VIEW',

  // Insights
  INSIGHTS_VIEW: 'INSIGHTS_VIEW',

  // Dashboards
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  DASHBOARD_SELF_VIEW: 'DASHBOARD_SELF_VIEW',
  DASHBOARD_TEAM_VIEW: 'DASHBOARD_TEAM_VIEW',
  DASHBOARD_FINANCE_VIEW: 'DASHBOARD_FINANCE_VIEW',
  DASHBOARD_HR_VIEW: 'DASHBOARD_HR_VIEW',
  DASHBOARD_TECH_VIEW: 'DASHBOARD_TECH_VIEW',
  DASHBOARD_OPERATIONS_VIEW: 'DASHBOARD_OPERATIONS_VIEW',

  // Data scope
  DATA_SCOPE_OWN: 'DATA_SCOPE_OWN',
  DATA_SCOPE_TEAM: 'DATA_SCOPE_TEAM',
  DATA_SCOPE_ORG: 'DATA_SCOPE_ORG',

  // Admin
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',
  USER_ASSIGN_ROLE: 'USER_ASSIGN_ROLE',
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_EDIT: 'ROLE_EDIT',
  ROLE_DELETE: 'ROLE_DELETE',
  ROLE_ASSIGN_PERMISSION: 'ROLE_ASSIGN_PERMISSION',
} as const

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// ─── Data scope levels ─────────────────────────────────────────────────────────
export type DataScope = 'OWN' | 'TEAM' | 'ORG'

// ─── Dashboard routing map per role ────────────────────────────────────────────
export const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  SUPER_ADMIN: '/dashboard/admin',
  ADMIN: '/dashboard/admin',
  MANAGER: '/dashboard/manager',
  SALES_MANAGER: '/dashboard/sales',
  SALES_REP: '/dashboard/my-work',
  FINANCE: '/dashboard/finance',
  SERVICE_TECH: '/dashboard/fieldwork',
  HR: '/dashboard/hr',
  EMPLOYEE: '/dashboard/employee',
  VIEWER: '/dashboard',
  READ_ONLY: '/dashboard',
}

// ─── Role landing page map (first page after login based on role) ──────────────
export const ROLE_LANDING_MAP: Record<RoleName, string> = ROLE_DASHBOARD_MAP

// ─── Hook: usePermissions ──────────────────────────────────────────────────────
export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  const userPermissions = useMemo(
    () => new Set(user?.permissions || []),
    [user?.permissions]
  )

  const userRoles = useMemo(() => {
    if (!user) return new Set<string>()
    const roles = user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []
    return new Set(roles)
  }, [user])

  const primaryRole = useMemo((): RoleName | null => {
    if (!user) return null
    if (user.role && Object.values(ROLES).includes(user.role as RoleName)) {
      return user.role as RoleName
    }
    
    if (!user.roles || user.roles.length === 0) return null

    // Determine highest priority role for deterministic behavior
    const rolePriority: RoleName[] = [
      'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE',
      'HR', 'SERVICE_TECH', 'SALES_REP', 'EMPLOYEE', 'VIEWER', 'READ_ONLY'
    ]

    for (const priority of rolePriority) {
      if (user.roles.includes(priority)) {
        return priority
      }
    }

    return null
  }, [user])

  /** Returns true when user has at least ONE of the specified permissions */
  const hasAnyPermission = useMemo(
    () =>
      (...permissions: string[]): boolean =>
        permissions.some((p) => userPermissions.has(p)),
    [userPermissions]
  )

  /** Returns true when user has ALL of the specified permissions */
  const hasAllPermissions = useMemo(
    () =>
      (...permissions: string[]): boolean =>
        permissions.every((p) => userPermissions.has(p)),
    [userPermissions]
  )

  /** Returns true when user has at least ONE of the specified roles */
  const hasAnyRole = useMemo(
    () =>
      (...roles: string[]): boolean =>
        roles.some((r) => userRoles.has(r)),
    [userRoles]
  )

  /** Returns true when user has ALL of the specified roles */
  const hasAllRoles = useMemo(
    () =>
      (...roles: string[]): boolean =>
        roles.every((r) => userRoles.has(r)),
    [userRoles]
  )

  /** Check if user is an admin / super admin */
  const isAdmin = useMemo(
    () => userRoles.has(ROLES.ADMIN) || userRoles.has(ROLES.SUPER_ADMIN),
    [userRoles]
  )

  /** Check if user is a manager-level role */
  const isManager = useMemo(
    () =>
      userRoles.has(ROLES.MANAGER) ||
      userRoles.has(ROLES.SALES_MANAGER) ||
      isAdmin,
    [userRoles, isAdmin]
  )

  /** Resolve the user's effective data scope level */
  const dataScope = useMemo((): DataScope => {
    if (userPermissions.has(PERMISSIONS.DATA_SCOPE_ORG)) return 'ORG'
    if (userPermissions.has(PERMISSIONS.DATA_SCOPE_TEAM)) return 'TEAM'
    return 'OWN'
  }, [userPermissions])

  /** Get the best dashboard route for the current user */
  const dashboardPath = useMemo(() => {
    if (!primaryRole) return '/dashboard/crm'
    return ROLE_DASHBOARD_MAP[primaryRole] || '/dashboard/crm'
  }, [primaryRole])

  /** Get the best landing page for the current user */
  const landingPath = useMemo(() => {
    if (!primaryRole) return '/home'
    return ROLE_LANDING_MAP[primaryRole] || '/home'
  }, [primaryRole])

  /** Can the current user perform a module-level CRUD action? */
  const canView = useMemo(
    () =>
      (module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK'): boolean =>
        userPermissions.has(`${module}_VIEW`),
    [userPermissions]
  )
  const canCreate = useMemo(
    () =>
      (module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK'): boolean =>
        userPermissions.has(`${module}_CREATE`),
    [userPermissions]
  )
  const canEdit = useMemo(
    () =>
      (module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK'): boolean =>
        userPermissions.has(`${module}_EDIT`),
    [userPermissions]
  )
  const canDelete = useMemo(
    () =>
      (module: 'CRM' | 'ERP' | 'FINANCE' | 'HR'): boolean =>
        userPermissions.has(`${module}_DELETE`),
    [userPermissions]
  )

  return {
    user,
    userPermissions,
    userRoles,
    primaryRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isManager,
    dataScope,
    dashboardPath,
    landingPath,
    canView,
    canCreate,
    canEdit,
    canDelete,
  }
}
