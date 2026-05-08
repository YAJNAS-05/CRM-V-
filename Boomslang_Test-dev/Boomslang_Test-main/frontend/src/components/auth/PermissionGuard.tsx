import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredPermissions?: string[]
  requiredRole?: string
  requiredRoles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requiredRoles = [],
  requireAll = false,
  fallback = null
}) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissions()

  // Check role-based permissions
  if (requiredRole && !hasAnyRole(requiredRole)) {
    return <>{fallback}</>
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? hasAllRoles(...requiredRoles)
      : hasAnyRole(...requiredRoles)
    
    if (!hasRequiredRoles) {
      return <>{fallback}</>
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasAnyPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(...requiredPermissions)
      : hasAnyPermission(...requiredPermissions)
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Specialized components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredRoles={['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMINISTRATOR']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const ManagerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredRoles={['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER', 'SALES_MANAGER']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const SecurityOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['SECURITY_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const AnalyticsOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['ANALYTICS_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const PerformanceOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['PERFORMANCE_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const IntegrationOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['INTEGRATION_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const FinanceOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['FINANCE_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const HROnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['HR_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const CRMOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['CRM_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const ERPOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <PermissionGuard 
      requiredPermissions={['ERP_VIEW']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

// CRUD operation guards
export const CanCreate: React.FC<{ 
  module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK' | 'PERFORMANCE' | 'SECURITY' | 'ANALYTICS' | 'INTEGRATION' | 'CUSTOMER_SUCCESS' | 'WORKFLOW' | 'ADVANCED_FEATURES' | 'UX_ENHANCEMENT'
  children: React.ReactNode 
  fallback?: React.ReactNode 
}> = ({ module, children, fallback = null }) => {
  return (
    <PermissionGuard 
      requiredPermissions={[`${module}_CREATE`]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const CanEdit: React.FC<{ 
  module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK' | 'PERFORMANCE' | 'SECURITY' | 'ANALYTICS' | 'INTEGRATION' | 'CUSTOMER_SUCCESS' | 'WORKFLOW' | 'ADVANCED_FEATURES' | 'UX_ENHANCEMENT'
  children: React.ReactNode 
  fallback?: React.ReactNode 
}> = ({ module, children, fallback = null }) => {
  return (
    <PermissionGuard 
      requiredPermissions={[`${module}_EDIT`]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export const CanDelete: React.FC<{ 
  module: 'CRM' | 'ERP' | 'FINANCE' | 'HR' | 'FIELDWORK' | 'PERFORMANCE' | 'SECURITY' | 'ANALYTICS' | 'INTEGRATION' | 'CUSTOMER_SUCCESS' | 'WORKFLOW' | 'ADVANCED_FEATURES' | 'UX_ENHANCEMENT'
  children: React.ReactNode 
  fallback?: React.ReactNode 
}> = ({ module, children, fallback = null }) => {
  return (
    <PermissionGuard 
      requiredPermissions={[`${module}_DELETE`]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}
