import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { payrollApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { PayrollRun } from '../../types/hr'

const HRPayrollPage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [recentRuns, setRecentRuns] = useState<PayrollRun[]>([])
  const [loadingRuns, setLoadingRuns] = useState(true)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value)

  useEffect(() => {
    let active = true

    const loadRuns = async () => {
      try {
        setLoadingRuns(true)
        const response = await payrollApi.getRuns(0, 4, { sort: 'periodEnd,desc' })
        if (!active) return
        setRecentRuns(response.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load payroll runs', error)
      } finally {
        if (active) {
          setLoadingRuns(false)
        }
      }
    }

    loadRuns()

    return () => {
      active = false
    }
  }, [])

  const complianceSignals = [
    {
      label: 'Pending timesheets',
      value: loading ? '—' : `${metrics.pendingTimesheets} pending`,
      tone: metrics.pendingTimesheets > 0 ? 'text-amber-700' : 'text-emerald-700',
    },
    {
      label: 'Pending reimbursements',
      value: loading ? '—' : `${metrics.pendingReimbursements} pending`,
      tone: metrics.pendingReimbursements > 0 ? 'text-amber-700' : 'text-emerald-700',
    },
    {
      label: 'Compliance rate',
      value: loading ? '—' : `${Math.round(metrics.complianceRate)}%`,
      tone: metrics.complianceRate < 90 ? 'text-amber-700' : 'text-emerald-700',
    },
    {
      label: 'Open positions',
      value: loading ? '—' : `${metrics.openPositions} open`,
      tone: metrics.openPositions > 0 ? 'text-amber-700' : 'text-emerald-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Payroll engine</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Payroll and compliance</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Run compliant payrolls, interpret awards, and deliver payslips with less manual effort.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/payroll/wizard"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Start payroll wizard
            </Link>
            <Link
              to="/hr/payroll-runs"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View pay runs
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="shell-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next payroll</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? '—' : formatCurrency(metrics.nextPayrollAmount || 0)}
          </p>
          <p className="mt-1 text-sm text-slate-600">Estimated gross for next pay run</p>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {loading ? 'Loading next run...' : `${metrics.daysToNextPayRun} days to next pay run`}
          </div>
        </div>

        <div className="shell-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Recent payroll runs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {loadingRuns && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Loading pay runs...
              </div>
            )}
            {!loadingRuns && recentRuns.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                No payroll runs created yet.
              </div>
            )}
            {!loadingRuns && recentRuns.map((run) => (
              <div key={run.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{run.status}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {run.periodStart} - {run.periodEnd}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Compliance signals</h2>
          <div className="mt-4 space-y-2">
            {complianceSignals.map((signal) => (
              <div key={signal.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">{signal.label}</span>
                <span className={`text-xs font-semibold ${signal.tone}`}>{signal.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Payroll actions</h2>
            <Link to="/hr/payroll-profiles" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Payroll profiles
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/hr/payroll/wizard"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Run payroll wizard
            </Link>
            <Link
              to="/hr/payroll-runs"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review pay runs
            </Link>
            <Link
              to="/hr/payroll-runs/new"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quick pay run
            </Link>
            <Link
              to="/hr/payroll-profiles"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage pay profiles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRPayrollPage
