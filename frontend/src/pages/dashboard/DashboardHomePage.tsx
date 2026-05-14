import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const DashboardHomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []

  const canCrm =
    permissions.includes('DASHBOARD_SELF_VIEW') ||
    permissions.includes('DASHBOARD_TEAM_VIEW')
  const canMyWork = permissions.includes('FIELDWORK_VIEW') || permissions.includes('HR_VIEW')

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Loading dashboards...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Dashboard module</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Dashboards</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Choose the dashboard view that matches your role and daily work.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {canCrm && (
          <Link
            to="/dashboard/crm"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">CRM</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">CRM dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pipeline health, conversion trends, and activity coverage.
            </p>
            <div className="mt-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              Open CRM dashboard
            </div>
          </Link>
        )}

        {canMyWork && (
          <Link
            to="/dashboard/fieldwork"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">My work</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Employee dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your assigned work orders, requests, and personal tasks.
            </p>
            <div className="mt-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              Open my work
            </div>
          </Link>
        )}
      </div>

      {!canCrm && !canMyWork && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No dashboard views are assigned yet. Ask an admin to grant dashboard access.
        </div>
      )}
    </div>
  )
}

export default DashboardHomePage
