import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { dashboardApi } from '../../api/dashboardApi'

// ─── Component ─────────────────────────────────────────────────────────────────
const HRDashboardPage: React.FC = () => {
  const { hasAnyPermission } = usePermissions()
  const [isLoading, setIsLoading] = useState(true)

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHiresThisMonth: 0,
    attritionRate: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    upcomingLeaves: 0,
    pendingTimesheets: 0,
    complianceRate: 0,
    openPositions: 0,
    trainingCompleted: 0,
    pendingReimbursements: 0,
  })

  useEffect(() => {
    const loadHRData = async () => {
      try {
        setIsLoading(true)
        const response = await dashboardApi.getHRMetrics()
        setMetrics(response.data.data)
      } catch (error) {
        console.error('Failed to load HR metrics', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHRData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading HR dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
              People management
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              HR Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Team headcount, leave management, attendance compliance, and payroll status overview.
            </p>
          </div>
          <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            HR view
          </div>
        </div>
      </div>

      {/* Team Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          iconBg="bg-blue-50" iconColor="text-blue-600"
          title="Total Employees" value={metrics.totalEmployees}
        />
        <KPICard
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          title="New This Month" value={metrics.newHiresThisMonth}
        />
        <KPICard
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          iconBg="bg-cyan-50" iconColor="text-cyan-700"
          title="Compliance Rate" value={`${metrics.complianceRate}%`}
        />
        <KPICard
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          iconBg="bg-rose-50" iconColor="text-rose-600"
          title="Attrition Rate" value={`${metrics.attritionRate}%`}
        />
      </div>

      {/* Leave & Attendance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Management */}
        <div className="shell-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Leave Management</h3>
            <Link to="/hr/leave-requests" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <InsightTile label="Pending" value={metrics.pendingLeaves} tone="amber" hint="Awaiting approval" />
            <InsightTile label="Approved" value={metrics.approvedLeaves} tone="emerald" hint="This month" />
            <InsightTile label="Upcoming" value={metrics.upcomingLeaves} tone="blue" hint="Next 30 days" />
          </div>
          {metrics.pendingLeaves > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mt-2">
              <p className="text-xs text-amber-800 font-medium">
                ⚠ {metrics.pendingLeaves} leave request{metrics.pendingLeaves !== 1 ? 's' : ''} pending your approval
              </p>
            </div>
          )}
        </div>

        {/* Timesheets & Payroll */}
        <div className="shell-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Timesheets & Payroll</h3>
            <Link to="/hr/timesheets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <InsightTile label="Pending Sheets" value={metrics.pendingTimesheets} tone="amber" hint="Not submitted" />
            <InsightTile label="Reimbursements" value={metrics.pendingReimbursements} tone="rose" hint="Pending review" />
            <InsightTile label="Training %" value={`${metrics.trainingCompleted}%`} tone="indigo" hint="Completed" />
          </div>
        </div>
      </div>

      {/* Positions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <div className="shell-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Open Positions</h3>
            <Link to="/hr/positions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Manage →
            </Link>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center">
            <p className="text-3xl font-bold text-indigo-900">{metrics.openPositions}</p>
            <p className="text-xs text-indigo-700 mt-1">positions currently open</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shell-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {hasAnyPermission('HR_CREATE') && (
              <QuickAction to="/hr/employees/new" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" label="Add Employee" />
            )}
            <QuickAction to="/hr/leave-requests" icon="M8 7V3m8 4V3m-9 8h10m-10 4h6" label="Leave Requests" />
            <QuickAction to="/hr/payroll-runs" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" label="Payroll Runs" />
            <QuickAction to="/hr/departments" icon="M3 7h18M3 12h18M3 17h18" label="Departments" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const KPICard = ({ icon, iconBg, iconColor, title, value }: { icon: string; iconBg: string; iconColor: string; title: string; value: string | number }) => (
  <div className="shell-card p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  </div>
)

const InsightTile = ({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' }) => {
  const toneClasses: Record<typeof tone, string> = {
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  }
  return (
    <div className={`rounded-xl border p-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-lg font-bold mt-1 leading-tight">{value}</p>
      <p className="text-[11px] opacity-80 mt-1">{hint}</p>
    </div>
  )
}

const QuickAction = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <Link to={to} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className="text-sm text-slate-700 font-medium">{label}</span>
  </Link>
)

export default HRDashboardPage
