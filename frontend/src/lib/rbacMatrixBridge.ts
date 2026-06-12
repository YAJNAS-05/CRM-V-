/**
 * Maps UI matrix module/action pairs to backend permission keys (MODULE_ACTION).
 * useRBAC parses keys into {module, action}; admin/user/role keys need explicit bridges.
 */
export const MATRIX_LEGACY_KEYS: Record<string, Partial<Record<string, string[]>>> = {
  admin: {
    view: [
      'USER_VIEW',
      'ROLE_VIEW',
      'SETTINGS_ADMIN_VIEW',
      'SETTINGS_VIEW',
      'ADMIN_VIEW',
    ],
    create: ['USER_CREATE', 'ROLE_CREATE', 'SETTINGS_ADMIN_EDIT'],
    edit: ['USER_EDIT', 'ROLE_EDIT', 'SETTINGS_ADMIN_EDIT', 'SETTINGS_EDIT'],
    delete: ['USER_DELETE', 'ROLE_DELETE'],
  },
  crm: {
    view: ['CRM_VIEW'],
    create: ['CRM_CREATE'],
    edit: ['CRM_EDIT'],
    delete: ['CRM_DELETE'],
    assign: ['CRM_ASSIGN'],
    export: ['CRM_EXPORT'],
  },
  pm: {
    view: ['ERP_VIEW', 'PM_VIEW'],
    create: ['ERP_CREATE', 'PM_CREATE'],
    edit: ['ERP_EDIT', 'PM_EDIT'],
    delete: ['ERP_DELETE', 'PM_DELETE'],
    assign: ['PM_ASSIGN'],
    export: ['PM_EXPORT'],
  },
  erp: {
    view: ['ERP_VIEW'],
    create: ['ERP_CREATE'],
    edit: ['ERP_EDIT'],
    delete: ['ERP_DELETE'],
  },
  finance: {
    view: ['FINANCE_VIEW'],
    create: ['FINANCE_CREATE'],
    edit: ['FINANCE_EDIT'],
    delete: ['FINANCE_DELETE'],
    approve: ['FINANCE_APPROVE'],
    export: ['FINANCE_EXPORT'],
  },
  hr: {
    view: ['HR_VIEW'],
    create: ['HR_CREATE'],
    edit: ['HR_EDIT'],
    delete: ['HR_DELETE'],
    approve: ['HR_LEAVE_REQUEST_APPROVE', 'HR_TIMESHEET_APPROVE'],
    export: ['HR_EXPORT'],
  },
  fieldwork: {
    view: ['FIELDWORK_VIEW'],
    create: ['FIELDWORK_CREATE'],
    edit: ['FIELDWORK_EDIT'],
    delete: ['FIELDWORK_DELETE'],
    assign: ['FIELDWORK_ASSIGN'],
  },
  report: {
    view: ['REPORT_VIEW'],
    export: ['REPORT_EXPORT'],
  },
}

export function legacyKeysForMatrix(module: string, action: string): string[] {
  const mod = module.toLowerCase()
  const act = action.toLowerCase()
  const fromMap = MATRIX_LEGACY_KEYS[mod]?.[act] ?? []
  const direct = `${mod.toUpperCase()}_${act.toUpperCase()}`
  const erpAlias = mod === 'pm' ? `ERP_${act.toUpperCase()}` : null
  return [...new Set([...fromMap, direct, ...(erpAlias ? [erpAlias] : [])])]
}

export function hasMatrixPermission(
  rawPermissions: string[],
  module: string,
  action: string,
): boolean {
  const normalized = new Set(rawPermissions.map((p) => p.toUpperCase()))
  return legacyKeysForMatrix(module, action).some((key) => normalized.has(key))
}
