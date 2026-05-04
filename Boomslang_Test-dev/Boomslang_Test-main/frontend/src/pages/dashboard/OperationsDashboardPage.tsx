import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { dashboardApi } from '../../api/dashboardApi'

// ─── Component ─────────────────────────────────────────────────────────────────
const OperationsDashboardPage: React.FC = () => {
  const { user, hasAnyPermission, isManager } = usePermissions()
  const [isLoading, setIsLoading] = useState(true)

  // Cross-functional summary KPIs (placeholder – will connect to real APIs)
  const [metrics, setMetrics] = useState({
    salesPipeline: 0,
    openDeals: 0,
    winRate: 0,
    fieldJobsPending: 0,
    fieldJobsCompleted: 0,
    slaCompliance: 0,
    cashPosition: 0,
    arOutstanding: 0,
    headcount: 0,
    openPositions: 0,
    pendingLeaves: 0,
    activeAlerts: 0,
    capacities: [] as any[],
  })

  useEffect(() => {
    const loadOpsData = async () => {
      try {
        setIsLoading(true)
        const response = await dashboardApi.getOperationsMetrics()
        setMetrics(response.data.data)
      } catch (error) {
        console.error('Failed to load operations metrics', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadOpsData()
  }, [])

  const formatCurrency = (v: number) => {
    if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`
    return `₹${v.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading operations dashboard...</p>
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
              Cross-functional overview
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Operations Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Executive summary across Sales, Service, Finance, and HR modules with real-time capacity and risk indicators.
            </p>
          </div>
          <div className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            Operations view
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {metrics.activeAlerts > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {metrics.activeAlerts} active alert{metrics.activeAlerts !== 1 ? 's' : ''} require attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Review escalations, SLA breaches, or overdue items below.
            </p>
          </div>
        </div>
      )}

      {/* Department Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Sales */}
        <DepartmentCard
          title="Sales"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          borderColor="border-blue-200"
          metrics={[
            { label: 'Pipeline', value: formatCurrency(metrics.salesPipeline) },
            { label: 'Open Deals', value: metrics.openDeals },
            { label: 'Win Rate', value: `${metrics.winRate}%` },
          ]}
          link="/dashboard/crm"
          linkLabel="CRM Dashboard →"
          accessible={hasAnyPermission('CRM_VIEW', 'DASHBOARD_TEAM_VIEW', 'DASHBOARD_SELF_VIEW')}
        />

        {/* Service */}
        <DepartmentCard
          title="Service"
          icon="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1"
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          borderColor="border-orange-200"
          metrics={[
            { label: 'Pending Jobs', value: metrics.fieldJobsPending },
            { label: 'Completed', value: metrics.fieldJobsCompleted },
            { label: 'SLA %', value: `${metrics.slaCompliance}%` },
          ]}
          link="/dashboard/fieldwork"
          linkLabel="Fieldwork Dashboard →"
          accessible={hasAnyPermission('FIELDWORK_VIEW')}
        />

        {/* Finance */}
        <DepartmentCard
          title="Finance"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          borderColor="border-emerald-200"
          metrics={[
            { label: 'Cash Position', value: formatCurrency(metrics.cashPosition) },
            { label: 'AR Outstanding', value: formatCurrency(metrics.arOutstanding) },
          ]}
          link="/dashboard/finance"
          linkLabel="Finance Dashboard →"
          accessible={hasAnyPermission('FINANCE_VIEW', 'DASHBOARD_FINANCE_VIEW')}
        />

        {/* HR */}
        <DepartmentCard
          title="HR"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          borderColor="border-indigo-200"
          metrics={[
            { label: 'Headcount', value: metrics.headcount },
            { label: 'Open Positions', value: metrics.openPositions },
            { label: 'Pending Leaves', value: metrics.pendingLeaves },
          ]}
          link="/dashboard/hr"
          linkLabel="HR Dashboard →"
          accessible={hasAnyPermission('HR_VIEW', 'DASHBOARD_HR_VIEW')}
        />
      </div>

      {/* Cross-functional Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Capacity */}
        <div className="shell-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Resource Capacity
          </h3>
          <div className="space-y-3">
            {metrics.capacities.map((cap) => (
              <CapacityBar
                key={cap.label}
                label={cap.label}
                used={cap.usedPercentage}
                color={cap.color}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Capacity % based on active tasks vs. available resource hours
          </p>
        </div>

        {/* Escalations & Actions */}
        <div className="shell-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Escalations & Actions
          </h3>
          <div className="space-y-2">
            <EscalationItem
              type="warning"
              text="3 deals stalled for 7+ days with no activity"
              action="/crm/deals"
              actionLabel="View"
            />
            <EscalationItem
              type="error"
              text="2 service SLA breaches in last 24h"
              action="/fieldwork"
              actionLabel="View"
            />
            <EscalationItem
              type="info"
              text="6 leave requests awaiting approval"
              action="/hr/leave-requests"
              actionLabel="Review"
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <div className="shell-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hasAnyPermission('CRM_VIEW') && (
            <QuickNav to="/crm/deals" label="Deals" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          )}
          {hasAnyPermission('FIELDWORK_VIEW') && (
            <QuickNav to="/fieldwork" label="Work Orders" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          )}
          {hasAnyPermission('FINANCE_VIEW') && (
            <QuickNav to="/finance/invoices" label="Invoices" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" />
          )}
          {hasAnyPermission('HR_VIEW') && (
            <QuickNav to="/hr/employees" label="Employees" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          )}
          {hasAnyPermission('REPORT_VIEW') && (
            <QuickNav to="/reports" label="Reports" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
          )}
          {hasAnyPermission('ERP_VIEW') && (
            <QuickNav to="/erp/equipment" label="Equipment" icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          )}
          <QuickNav to="/reports/custom" label="Custom Reports" icon="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" />
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const DepartmentCard = ({
  title,
  icon,
  iconColor,
  iconBg,
  borderColor,
  metrics,
  link,
  linkLabel,
  accessible,
}: {
  title: string
  icon: string
  iconColor: string
  iconBg: string
  borderColor: string
  metrics: { label: string; value: string | number }[]
  link: string
  linkLabel: string
  accessible: boolean
}) => (
  <div className={`shell-card p-4 border-l-4 ${borderColor}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`h-8 w-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-2">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{m.label}</span>
          <span className="font-semibold text-slate-800">{m.value}</span>
        </div>
      ))}
    </div>
    {accessible && (
      <Link to={link} className="mt-3 block text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
        {linkLabel}
      </Link>
    )}
  </div>
)

const CapacityBar = ({
  label,
  used,
  color,
}: {
  label: string
  used: number
  color: string
}) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{used}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(used, 100)}%` }}
      />
    </div>
  </div>
)

const EscalationItem = ({
  type,
  text,
  action,
  actionLabel,
}: {
  type: 'warning' | 'error' | 'info'
  text: string
  action: string
  actionLabel: string
}) => {
  const styles = {
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-rose-200 bg-rose-50',
    info: 'border-blue-200 bg-blue-50',
  }
  const textColors = {
    warning: 'text-amber-800',
    error: 'text-rose-800',
    info: 'text-blue-800',
  }

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${styles[type]}`}>
      <p className={`text-xs ${textColors[type]}`}>{text}</p>
      <Link
        to={action}
        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 shrink-0 ml-3"
      >
        {actionLabel}
      </Link>
    </div>
  )
}

const QuickNav = ({
  to,
  label,
  icon,
}: {
  to: string
  label: string
  icon: string
}) => (
  <Link
    to={to}
    className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50 transition-colors"
  >
    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className="text-sm text-slate-700 font-medium">{label}</span>
  </Link>
)

export default OperationsDashboardPage
