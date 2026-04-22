import React from 'react'
import { usePermissions, type RoleName } from '../../hooks/usePermissions'

// ─── FeatureGate ───────────────────────────────────────────────────────────────
// Renders children only when the current user holds at least ONE of the
// required permissions.  Use this to hide individual buttons, form fields,
// table columns, etc.
//
// Usage:
//   <FeatureGate permission="CRM_CREATE">
//     <button>New Account</button>
//   </FeatureGate>
//
//   <FeatureGate permissions={['REPORT_VIEW', 'REPORT_EXPORT']}>
//     <ExportButton />
//   </FeatureGate>

interface FeatureGateProps {
  /** Single permission key */
  permission?: string
  /** Multiple permission keys – user needs at least ONE */
  permissions?: string[]
  /** If true, user must have ALL permissions instead of any */
  requireAll?: boolean
  /** Content to render when user lacks the permission */
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  const effectivePermissions = permissions ?? (permission ? [permission] : [])

  if (effectivePermissions.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll
    ? hasAllPermissions(...effectivePermissions)
    : hasAnyPermission(...effectivePermissions)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// ─── RoleBasedView ─────────────────────────────────────────────────────────────
// Renders children only when the current user has at least ONE of the
// specified roles.
//
// Usage:
//   <RoleBasedView roles={['SALES_MANAGER', 'MANAGER']}>
//     <TeamMetricsCard />
//   </RoleBasedView>

interface RoleBasedViewProps {
  /** Roles that are allowed – user needs at least ONE */
  roles: RoleName[]
  /** If true, user must have ALL roles */
  requireAll?: boolean
  /** Content to render when role doesn't match */
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const RoleBasedView: React.FC<RoleBasedViewProps> = ({
  roles,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasAnyRole, hasAllRoles } = usePermissions()

  if (roles.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll
    ? hasAllRoles(...roles)
    : hasAnyRole(...roles)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// ─── PermissionView ────────────────────────────────────────────────────────────
// Same as FeatureGate but named for semantic clarity when used around
// larger view sections (cards, panels, page sections).
//
// Usage:
//   <PermissionView permissions={['REPORT_EXPORT']}>
//     <ExportPanel />
//   </PermissionView>

interface PermissionViewProps {
  permissions: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const PermissionView: React.FC<PermissionViewProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  if (permissions.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll
    ? hasAllPermissions(...permissions)
    : hasAnyPermission(...permissions)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// ─── AdminOnly ─────────────────────────────────────────────────────────────────
// Convenience wrapper that only renders for SUPER_ADMIN or ADMIN.

interface AdminOnlyProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({
  fallback = null,
  children,
}) => {
  const { isAdmin } = usePermissions()
  return isAdmin ? <>{children}</> : <>{fallback}</>
}

// ─── ManagerOnly ───────────────────────────────────────────────────────────────
// Convenience wrapper that only renders for MANAGER, SALES_MANAGER, ADMIN,
// or SUPER_ADMIN.

interface ManagerOnlyProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const ManagerOnly: React.FC<ManagerOnlyProps> = ({
  fallback = null,
  children,
}) => {
  const { isManager } = usePermissions()
  return isManager ? <>{children}</> : <>{fallback}</>
}

export default FeatureGate
