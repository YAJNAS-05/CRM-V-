import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredPermissions?: string[]
  requiredRole?: string
  requiredRoles?: string[]
  requireAll?: boolean
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requiredRoles = [],
  requireAll = false,
  fallbackPath = '/unauthorized'
}) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissions()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based permissions
  if (requiredRole && !hasAnyRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? hasAllRoles(...requiredRoles)
      : hasAnyRole(...requiredRoles)
    
    if (!hasRequiredRoles) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasAnyPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(...requiredPermissions)
      : hasAnyPermission(...requiredPermissions)
    
    if (!hasRequiredPermissions) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <>{children}</>
}

// Specialized components for common use cases
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredRoles={['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMINISTRATOR']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredRoles={['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER', 'SALES_MANAGER']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const SecurityRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['SECURITY_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const AnalyticsRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['ANALYTICS_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const PerformanceRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['PERFORMANCE_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const IntegrationRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['INTEGRATION_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const FinanceRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['FINANCE_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const HRRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['HR_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const CRMRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['CRM_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}

export const ERPRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredPermissions={['ERP_VIEW']}
      fallbackPath="/dashboard"
    >
      {children}
    </ProtectedRoute>
  )
}
