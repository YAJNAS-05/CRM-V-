import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, leaveRequestApi, reimbursementApi, timesheetApi } from '../../api/hrApi'
import { usePermissions } from '../../hooks/usePermissions'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee, LeaveRequest, ReimbursementRequest, Timesheet } from '../../types/hr'

// ─── Component ─────────────────────────────────────────────────────────────────
const HRDashboardPage: React.FC = () => {
  const { hasAnyPermission } = usePermissions()
  const { metrics, loading, error, refresh } = useHRMetrics()
  const [queueLoading, setQueueLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([])
  const [pendingReimbursements, setPendingReimbursements] = useState<ReimbursementRequest[]>([])

  useEffect(() => {
    let active = true

    const loadQueues = async () => {
      try {
        setQueueLoading(true)
        const [employeeRes, leaveRes, timesheetRes, reimbursementRes] = await Promise.all([
          employeeApi.getAll(0, 200, { sort: 'lastName,asc' }),
          leaveRequestApi.getAll(0, 5, { status: 'REQUESTED', sort: 'startDate,asc' }),
          timesheetApi.getAll(0, 5, { status: 'SUBMITTED', sort: 'workDate,desc' }),
          reimbursementApi.getAll(0, 5, { status: 'SUBMITTED', sort: 'requestDate,desc' }),
        ])

        if (!active) return

        setEmployees(employeeRes.data.data?.content || [])
        setPendingLeaves(leaveRes.data.data?.content || [])
        setPendingTimesheets(timesheetRes.data.data?.content || [])
        setPendingReimbursements(reimbursementRes.data.data?.content || [])
      } catch (queueError) {
        console.error('Failed to load HR queues', queueError)
      } finally {
        if (active) {
          setQueueLoading(false)
        }
      }
    }

    loadQueues()

    return () => {
      active = false
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => {
      map.set(employee.id, employee)
      if (employee.userId) {
        map.set(employee.userId, employee)
      }
    })
    return map
  }, [employees])

  const formatEmployee = (employeeId?: string | null) => {
    if (!employeeId) return 'Employee'
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading HR dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    const v = Number(value || 0)
    return `AUD ${v.toLocaleString()}`
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Dates pending'
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'Dates pending'
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
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

      {/* People Pulse */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatTile
          label="Active employees"
          value={metrics.activeEmployees}
          hint="Currently active"
          tone="blue"
        />
        <StatTile
          label="Open leave requests"
          value={metrics.pendingLeaves}
          hint="Needs approval"
          tone="amber"
        />
        <StatTile
          label="Visas expiring"
          value={metrics.visasExpiring}
          hint="Next 30 days"
          tone="rose"
        />
        <StatTile
          label="Next payroll"
          value={formatCurrency(metrics.nextPayrollAmount)}
          hint={`${metrics.daysToNextPayRun} days to pay run`}
          tone="emerald"
        />
        <StatTile
          label="Onboarding"
          value={metrics.onboardingInProgress}
          hint="In progress"
          tone="indigo"
        />
        <StatTile
          label="Compliance"
          value={`${metrics.complianceRate}%`}
          hint="Award checks"
          tone="slate"
        />
      </div>

      {/* My Work Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QueueCard
          title="Leave approvals"
          actionLabel="View all"
          actionHref="/hr/leave-requests"
          loading={queueLoading}
          emptyLabel="No leave approvals pending"
          items={pendingLeaves.map((leave) => ({
            id: leave.id,
            title: `${formatEmployee(leave.employeeId)} · ${leave.leaveType.replace(/_/g, ' ')}`,
            meta: formatDateRange(leave.startDate, leave.endDate),
            href: `/hr/leave-requests/${leave.id}`,
          }))}
        />
        <QueueCard
          title="Timesheet approvals"
          actionLabel="View all"
          actionHref="/hr/timesheets"
          loading={queueLoading}
          emptyLabel="No timesheets awaiting approval"
          items={pendingTimesheets.map((timesheet) => ({
            id: timesheet.id,
            title: `${formatEmployee(timesheet.employeeId)} · ${timesheet.hoursWorked ?? 0} hrs`,
            meta: formatDate(timesheet.workDate),
            href: `/hr/timesheets/${timesheet.id}`,
          }))}
        />
        <QueueCard
          title="Reimbursement approvals"
          actionLabel="View all"
          actionHref="/hr/reimbursements"
          loading={queueLoading}
          emptyLabel="No reimbursements awaiting review"
          items={pendingReimbursements.map((request) => ({
            id: request.id,
            title: `${formatEmployee(request.requestedBy)} · ${request.category}`,
            meta: `${formatCurrency(request.amount)} · ${formatDate(request.requestDate)}`,
            href: `/hr/reimbursements/${request.id}`,
          }))}
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
            <QuickAction to="/hr/reimbursements" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" label="Reimbursements" />
            <QuickAction to="/hr/departments" icon="M3 7h18M3 12h18M3 17h18" label="Departments" />
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      <div className="shell-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Priority alerts</h3>
          <Link to="/hr/compliance" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Review →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <AlertTile
            title="Visa expiries"
            detail={`${metrics.visasExpiring} expiring in 30 days`}
            tone="amber"
          />
          <AlertTile
            title="Next payroll"
            detail={`${metrics.daysToNextPayRun} days to run`}
            tone="blue"
          />
          <AlertTile
            title="Onboarding"
            detail={`${metrics.onboardingInProgress} new hires in progress`}
            tone="rose"
          />
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

const StatTile = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string | number
  hint: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo'
}) => (
  <div
    className={`rounded-xl border p-4 ${
      {
        slate: 'border-slate-200 bg-white text-slate-900',
        blue: 'border-blue-200 bg-blue-50/40 text-blue-900',
        emerald: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
        amber: 'border-amber-200 bg-amber-50/40 text-amber-900',
        rose: 'border-rose-200 bg-rose-50/40 text-rose-900',
        indigo: 'border-indigo-200 bg-indigo-50/40 text-indigo-900',
      }[tone]
    }`}
  >
    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
)

const QueueCard = ({
  title,
  actionLabel,
  actionHref,
  items,
  loading,
  emptyLabel,
}: {
  title: string
  actionLabel: string
  actionHref: string
  items: { id: string; title: string; meta: string; href: string }[]
  loading: boolean
  emptyLabel: string
}) => (
  <div className="shell-card p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <Link to={actionHref} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
        {actionLabel} →
      </Link>
    </div>
    <div className="space-y-2 text-sm text-gray-600">
      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
          Loading queue...
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
          {emptyLabel}
        </div>
      )}
      {!loading && items.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          className="block rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          <div className="font-medium text-slate-900">{item.title}</div>
          <div className="text-xs text-slate-500 mt-1">{item.meta}</div>
        </Link>
      ))}
    </div>
  </div>
)

const AlertTile = ({
  title,
  detail,
  tone,
}: {
  title: string
  detail: string
  tone: 'blue' | 'amber' | 'rose'
}) => {
  const toneClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
  }
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.12em] opacity-80">{title}</p>
      <p className="mt-2 text-sm font-semibold">{detail}</p>
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
