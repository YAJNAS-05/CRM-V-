import type { User } from '../types'

const ADMIN_SETTINGS_PERMISSIONS = new Set([
  'SETTINGS_ADMIN_VIEW',
  'SETTINGS_ADMIN_EDIT',
])

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN'])

export const hasAdminSettingsAccess = (user: User | null | undefined): boolean => {
  if (!user) {
    return false
  }

  if ((user.permissions || []).some((permission) => ADMIN_SETTINGS_PERMISSIONS.has(permission))) {
    return true
  }

  const roles = user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []
  return roles.some((role) => ADMIN_ROLES.has(role))
}