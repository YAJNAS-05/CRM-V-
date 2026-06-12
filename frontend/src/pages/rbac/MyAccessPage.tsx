import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, ChevronRight, Database, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { ACTIONS, MODULES, isActionSupported } from '@/components/rbac/permissionMatrix'
import { hasMatrixPermission } from '@/lib/rbacMatrixBridge'
import {
  getAccessibleModules,
  groupPermissionsByPrefix,
  humanizePermissionKey,
} from '@/lib/accessibleModules'
import { hasAdminSettingsAccess } from '@/lib/settingsAccess'

const MODULE_LABELS: Record<string, string> = {
  pm: 'ERP / Projects',
  finance: 'Finance',
  hr: 'Human Resources',
  fieldwork: 'Fieldwork',
  crm: 'CRM',
  admin: 'Administration',
}

const MyAccessPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const { dataScope, primaryRole, hasAnyPermission } = usePermissions()
  const permissions = user?.permissions ?? []
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : []
  const accessible = useMemo(() => getAccessibleModules(permissions), [permissions])
  const grouped = useMemo(() => groupPermissionsByPrefix(permissions), [permissions])
  const canManageRoles = hasAnyPermission('ROLE_VIEW', 'USER_VIEW', 'SETTINGS_ADMIN_VIEW')

  const scopeLabel =
    dataScope === 'ORG' ? 'Organization-wide' : dataScope === 'TEAM' ? 'Team scope' : 'Own records only'

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                My access
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {user?.fullName || user?.email || 'Your permissions'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
            </div>
          </div>
          {canManageRoles && (
            <Link
              to="/admin/roles"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage roles
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Primary role</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {primaryRole?.replace(/_/g, ' ') ?? '—'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Assigned roles</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {roles.length > 0 ? roles.join(', ') : 'None'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
              <Database className="h-3.5 w-3.5" aria-hidden />
              Data scope
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{scopeLabel}</p>
          </div>
        </div>
      </header>

      {accessible.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Modules you can open</h2>
          <p className="mt-1 text-sm text-slate-600">
            Shortcuts based on your current permissions.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {accessible.map((module) => (
              <li key={module.id}>
                <Link
                  to={module.path}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{module.label}</p>
                    <p className="text-xs text-slate-500">{module.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Capability matrix</h2>
        <p className="mt-1 text-sm text-slate-600">
          What your account can do in each product area (view, create, edit, and more).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-semibold">Module</th>
                {ACTIONS.map((action) => (
                  <th key={action} className="px-3 py-2 font-semibold capitalize">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((module) => (
                <tr key={module} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {MODULE_LABELS[module] ?? module}
                  </td>
                  {ACTIONS.map((action) => {
                    const supported = isActionSupported(module, action)
                    const allowed =
                      supported && hasMatrixPermission(permissions, module, action)
                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        {!supported ? (
                          <span className="text-slate-300">—</span>
                        ) : allowed ? (
                          <BadgeCheck className="mx-auto h-5 w-5 text-emerald-600" aria-label="Allowed" />
                        ) : (
                          <span className="text-slate-300" aria-label="Not allowed">
                            ·
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-900">Reports</td>
                {ACTIONS.map((action) => {
                  const supported = action === 'view' || action === 'export'
                  const allowed =
                    supported && hasMatrixPermission(permissions, 'report', action)
                  return (
                    <td key={action} className="px-3 py-3 text-center">
                      {!supported ? (
                        <span className="text-slate-300">—</span>
                      ) : allowed ? (
                        <BadgeCheck className="mx-auto h-5 w-5 text-emerald-600" aria-label="Allowed" />
                      ) : (
                        <span className="text-slate-300">·</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">All permissions ({permissions.length})</h2>
        <p className="mt-1 text-sm text-slate-600">
          Granular keys assigned through your roles.
        </p>
        {permissions.length === 0 ? (
          <p className="mt-4 text-sm text-amber-700">
            No permissions are attached to your account. Ask an administrator to assign a role.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {Object.entries(grouped).map(([prefix, keys]) => (
              <div key={prefix}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {prefix}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {keys.map((key) => (
                    <li
                      key={key}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                      title={key}
                    >
                      {humanizePermissionKey(key)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {hasAdminSettingsAccess(user) && (
        <p className="text-center text-xs text-slate-500">
          You have administration access. Use{' '}
          <Link to="/admin/roles" className="font-medium text-blue-600 hover:underline">
            Roles &amp; Permissions
          </Link>{' '}
          to change access for other users.
        </p>
      )}
    </div>
  )
}

export default MyAccessPage
