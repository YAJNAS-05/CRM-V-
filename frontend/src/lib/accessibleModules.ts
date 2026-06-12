export type AccessibleModule = {
  id: string
  label: string
  description: string
  path: string
  viewPermission: string
}

export const MODULE_CATALOG: AccessibleModule[] = [
  {
    id: 'crm',
    label: 'CRM',
    description: 'Accounts, contacts, deals, and activities',
    path: '/crm/accounts',
    viewPermission: 'CRM_VIEW',
  },
  {
    id: 'erp',
    label: 'ERP / Projects',
    description: 'Equipment, inventory, and project delivery',
    path: '/erp/equipment',
    viewPermission: 'ERP_VIEW',
  },
  {
    id: 'hr',
    label: 'Human Resources',
    description: 'People, leave, payroll, and performance',
    path: '/hr',
    viewPermission: 'HR_VIEW',
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Invoices, payments, and financial close',
    path: '/finance/invoices',
    viewPermission: 'FINANCE_VIEW',
  },
  {
    id: 'fieldwork',
    label: 'Fieldwork',
    description: 'Work orders and on-site service',
    path: '/fieldwork',
    viewPermission: 'FIELDWORK_VIEW',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Standard and custom analytics',
    path: '/reports',
    viewPermission: 'REPORT_VIEW',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    description: 'Role-based operational dashboards',
    path: '/dashboard',
    viewPermission: 'DASHBOARD_SELF_VIEW',
  },
]

const DASHBOARD_VIEW_KEYS = [
  'DASHBOARD_SELF_VIEW',
  'DASHBOARD_TEAM_VIEW',
  'DASHBOARD_FINANCE_VIEW',
  'DASHBOARD_HR_VIEW',
  'DASHBOARD_TECH_VIEW',
  'DASHBOARD_OPERATIONS_VIEW',
]

export function getAccessibleModules(permissions: string[]): AccessibleModule[] {
  const set = new Set(permissions)
  return MODULE_CATALOG.filter((module) => {
    if (module.id === 'dashboards') {
      return DASHBOARD_VIEW_KEYS.some((key) => set.has(key))
    }
    return set.has(module.viewPermission)
  })
}

export function humanizePermissionKey(key: string): string {
  return key
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' · ')
}

export function groupPermissionsByPrefix(permissions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const key of [...permissions].sort()) {
    const idx = key.indexOf('_')
    const prefix = idx > 0 ? key.slice(0, idx) : 'OTHER'
    if (!groups[prefix]) {
      groups[prefix] = []
    }
    groups[prefix].push(key)
  }
  return groups
}
