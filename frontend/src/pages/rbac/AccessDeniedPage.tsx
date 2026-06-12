import React, { useMemo } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getAccessibleModules, humanizePermissionKey } from '@/lib/accessibleModules'
import { getFirstAuthorizedPath } from '@/lib/rbacNavigation'

type AccessDeniedState = {
  from?: string
  required?: string[]
}

const AccessDeniedPage: React.FC = () => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const state = (location.state as AccessDeniedState | null) ?? {}

  const permissions = user?.permissions ?? []
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : []
  const accessible = useMemo(() => getAccessibleModules(permissions), [permissions])
  const homePath = useMemo(
    () => getFirstAuthorizedPath(permissions, roles),
    [permissions, roles],
  )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Access restricted
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                You don&apos;t have permission to view this page
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your account is signed in, but your role does not include the permissions needed
                for this area. Contact an administrator if you believe this is a mistake.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {state.from && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Requested path:</span>{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">{state.from}</code>
            </div>
          )}

          {state.required && state.required.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Required (any one)
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {state.required.map((key) => (
                  <li
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                  >
                    <Lock className="h-3 w-3" aria-hidden />
                    {humanizePermissionKey(key)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your roles
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.length === 0 ? (
                <span className="text-sm text-slate-500">No roles assigned</span>
              ) : (
                roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"
                  >
                    {role.replace(/_/g, ' ')}
                  </span>
                ))
              )}
            </div>
          </div>

          {accessible.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                You can access
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {accessible.map((module) => (
                  <li key={module.id}>
                    <Link
                      to={module.path}
                      className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/50"
                    >
                      <p className="font-semibold text-slate-900">{module.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{module.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
            <Link
              to={homePath}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Go to your workspace
            </Link>
            <Link
              to="/profile/access"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View my access
            </Link>
            <Link
              to="/profile"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Profile settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedPage
