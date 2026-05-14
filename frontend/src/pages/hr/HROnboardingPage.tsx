import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee } from '../../types/hr'

const HROnboardingPage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [recentHires, setRecentHires] = useState<Employee[]>([])
  const [loadingHires, setLoadingHires] = useState(true)

  useEffect(() => {
    let active = true

    const loadRecentHires = async () => {
      try {
        const response = await employeeApi.getAll(0, 3, { sort: 'hireDate,desc' })
        const hires = response.data?.data?.content ?? []
        if (active) {
          setRecentHires(hires)
        }
      } catch (error) {
        console.error('Failed to load recent hires', error)
      } finally {
        if (active) {
          setLoadingHires(false)
        }
      }
    }

    loadRecentHires()

    return () => {
      active = false
    }
  }, [])

  const summaryStats = [
    {
      label: 'Onboarding in progress',
      value: loading ? '—' : metrics.onboardingInProgress,
    },
    {
      label: 'New hires this month',
      value: loading ? '—' : metrics.newHiresThisMonth,
    },
    {
      label: 'Active employees',
      value: loading ? '—' : metrics.activeEmployees,
    },
  ]

  const formatHireDate = (date?: string | null) => {
    if (!date) return 'Date TBD'
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Onboarding</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">New hire journeys</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Deliver a guided onboarding experience with templates, tasks, and 90-day tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/people"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              People records
            </Link>
            <Link
              to="/hr/employees/new"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Start onboarding
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="shell-card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {loadingHires && (
          <div className="shell-card p-5 text-sm text-slate-500">Loading recent hires...</div>
        )}
        {!loadingHires && recentHires.length === 0 && (
          <div className="shell-card p-5 text-sm text-slate-500">No recent hires yet.</div>
        )}
        {recentHires.map((hire) => (
          <div key={hire.id} className="shell-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {hire.firstName} {hire.lastName}
                </p>
                <p className="text-xs text-slate-500">{hire.employmentType.replace(/_/g, ' ')}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Start {formatHireDate(hire.hireDate)}</span>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Record status: {hire.status ?? 'PENDING'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Checklist templates</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Operations new hire template</div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Finance and payroll starter kit</div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Remote worker onboarding</div>
          </div>
        </div>
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">90-day tracker</h2>
          <p className="mt-2 text-sm text-slate-600">
            Align managers, buddies, and HR on milestones during the first three months.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Week 1: Access, payroll, and safety</div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Week 4: Role training and reviews</div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Week 12: Performance check-in</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HROnboardingPage
