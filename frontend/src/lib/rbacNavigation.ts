const HR_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR']

export const getFirstDashboardPath = (permissions: string[], roles: string[] = []): string => {
  const hasAdminAccess = roles.some((role) => HR_ADMIN_ROLES.includes(role))
  if (!hasAdminAccess && roles.includes('MANAGER')) return '/dashboard/manager'
  if (!hasAdminAccess && roles.includes('EMPLOYEE')) return '/employee'
  if (permissions.includes('DASHBOARD_OPERATIONS_VIEW')) return '/dashboard/operations'
  if (permissions.includes('DASHBOARD_FINANCE_VIEW')) return '/dashboard/finance'
  if (permissions.includes('DASHBOARD_HR_VIEW')) return '/dashboard/hr'
  if (permissions.includes('DASHBOARD_TECH_VIEW')) return '/dashboard/technician'
  if (permissions.includes('DASHBOARD_TEAM_VIEW') || permissions.includes('DASHBOARD_SELF_VIEW')) {
    return '/dashboard/crm'
  }
  if (permissions.includes('FIELDWORK_VIEW')) return '/dashboard/fieldwork'
  if (permissions.includes('HR_VIEW')) return '/dashboard/employee'
  return '/profile'
}

/** First module path the user can open after login or a denied route. */
export function getFirstAuthorizedPath(permissions: string[], roles: string[] = []): string {
  if (
    permissions.some((permission) =>
      [
        'DASHBOARD_TEAM_VIEW',
        'DASHBOARD_SELF_VIEW',
        'DASHBOARD_FINANCE_VIEW',
        'DASHBOARD_HR_VIEW',
        'DASHBOARD_TECH_VIEW',
        'DASHBOARD_OPERATIONS_VIEW',
        'FIELDWORK_VIEW',
        'HR_VIEW',
      ].includes(permission),
    )
  ) {
    return getFirstDashboardPath(permissions, roles)
  }
  if (permissions.includes('CRM_VIEW')) return '/crm/accounts'
  if (permissions.includes('ERP_VIEW')) return '/erp/equipment'
  if (permissions.includes('HR_VIEW')) return '/hr'
  if (permissions.includes('FINANCE_VIEW')) return '/finance/invoices'
  if (permissions.includes('FIELDWORK_VIEW')) return '/fieldwork'
  if (permissions.includes('REPORT_VIEW')) return '/reports'
  return '/profile'
}
