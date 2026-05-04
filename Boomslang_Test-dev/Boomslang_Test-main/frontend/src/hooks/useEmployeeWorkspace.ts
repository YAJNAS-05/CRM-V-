import { useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useEmployeeWorkspaceStore, type WorkspaceUserProfile } from '../store/employeeWorkspaceStore'

const resolveRoles = (roles?: string[], role?: string | null) => {
  if (roles && roles.length > 0) return roles
  if (role) return [role]
  return []
}

const WORKSPACE_ACCESS_ROLES = new Set(['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'])

export const useEmployeeWorkspace = () => {
  const user = useAuthStore((state) => state.user)
  const ensureEmployeeWorkspace = useEmployeeWorkspaceStore((state) => state.ensureEmployeeWorkspace)

  const workspaceUser = useMemo<WorkspaceUserProfile | null>(() => {
    if (!user) return null
    return {
      id: user.id,
      fullName: user.fullName || 'Employee',
      email: user.email,
    }
  }, [user])

  const isEmployee = useMemo(() => {
    const roles = resolveRoles(user?.roles, user?.role)
    return roles.includes('EMPLOYEE')
  }, [user?.role, user?.roles])

  const canAccessWorkspace = useMemo(() => {
    const roles = resolveRoles(user?.roles, user?.role)
    return roles.some((role) => WORKSPACE_ACCESS_ROLES.has(role))
  }, [user?.role, user?.roles])

  useEffect(() => {
    if (!workspaceUser || !canAccessWorkspace) {
      return
    }

    ensureEmployeeWorkspace(workspaceUser)
  }, [canAccessWorkspace, ensureEmployeeWorkspace, workspaceUser])

  return {
    user,
    workspaceUser,
    isEmployee,
    canAccessWorkspace,
  }
}

export default useEmployeeWorkspace