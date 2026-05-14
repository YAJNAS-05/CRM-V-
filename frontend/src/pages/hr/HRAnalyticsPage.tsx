import React from 'react'
import { useHRMetrics } from '../../hooks/useHRMetrics'

const HRAnalyticsPage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const totalEmployees = metrics.totalEmployees || 0
  const pendingApprovals = (metrics.pendingLeaves || 0) + (metrics.pendingTimesheets || 0)

  const formatNumber = (value: number) => (loading ? '—' : value.toLocaleString())
  const formatPercent = (value: number) => (loading ? '—' : `${value.toFixed(1)}%`)
  const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
  const pendingTimesheetRate = totalEmployees > 0
    ? clampPercent((metrics.pendingTimesheets / totalEmployees) * 100)
    : 0

  const kpis = [
    {
      label: 'Headcount',
      value: formatNumber(metrics.totalEmployees),
      trend: loading ? 'Loading' : `${metrics.newHiresThisMonth} new hires MTD`,
      tone: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Attrition rate',
      value: formatPercent(metrics.attritionRate),
      trend: loading ? 'Loading' : 'Monthly trend',
      tone: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      label: 'Compliance rate',
      value: formatPercent(metrics.complianceRate),
      trend: loading ? 'Loading' : `${pendingApprovals} items pending`,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Open positions',
      value: formatNumber(metrics.openPositions),
      trend: loading ? 'Loading' : 'Hiring pipeline',
      tone: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ]

  const trends = [
    { label: 'Compliance rate', value: clampPercent(metrics.complianceRate) },
    { label: 'Training completion', value: clampPercent(metrics.trainingCompleted) },
    { label: 'Timesheet backlog', value: pendingTimesheetRate },
    { label: 'Attrition risk', value: clampPercent(metrics.attritionRate) },
  ]

  const insights = loading
    ? ['Loading HR insights...']
    : [
        `Headcount is ${metrics.totalEmployees} with ${metrics.newHiresThisMonth} new hires this month.`,
        `${metrics.pendingLeaves} leave requests and ${metrics.pendingTimesheets} timesheets awaiting approval.`,
        `Compliance rate is ${metrics.complianceRate.toFixed(1)}% with ${metrics.openPositions} open roles.`,
      ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">HR analytics</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">People insights</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Monitor headcount, costs, turnover, and compliance performance with actionable insights.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Phase 2
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="shell-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{kpi.label}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${kpi.tone}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Trend signals</h2>
          <div className="mt-4 space-y-3">
            {trends.map((trend) => (
              <div key={trend.label} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{trend.label}</span>
                  <span>{loading ? '—' : `${trend.value}%`}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${trend.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Insight summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {insights.map((insight) => (
              <div key={insight} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRAnalyticsPage
