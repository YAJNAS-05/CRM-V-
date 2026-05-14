import React, { useEffect, useMemo, useState } from 'react'
import { employeeApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee } from '../../types/hr'

const tabs = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'goals', label: 'Goals' },
  { id: 'feedback', label: '360 Feedback' },
  { id: 'oneonones', label: '1-on-1s' },
  { id: 'calibration', label: 'Calibration' },
]

const HRPerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reviews')
  const { metrics, loading } = useHRMetrics()
  const [recentHires, setRecentHires] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
  const reviewSnapshot = [
    {
      label: 'Employees in cycle',
      value: loading ? '—' : metrics.activeEmployees.toLocaleString(),
    },
    {
      label: 'New hires this month',
      value: loading ? '—' : metrics.newHiresThisMonth.toLocaleString(),
    },
    {
      label: 'Attrition rate',
      value: loading ? '—' : `${metrics.attritionRate.toFixed(1)}%`,
    },
  ]
  const goals = [
    {
      title: 'Increase retention',
      owner: 'People Ops',
      progress: loading ? 0 : clampPercent(100 - metrics.attritionRate),
    },
    {
      title: 'Payroll cycle time',
      owner: 'Payroll',
      progress: loading ? 0 : clampPercent(metrics.complianceRate),
    },
    {
      title: 'Manager 1-on-1s',
      owner: 'HRBP',
      progress: loading ? 0 : clampPercent(metrics.trainingCompleted),
    },
  ]

  useEffect(() => {
    let active = true

    const loadRecentHires = async () => {
      try {
        setLoadingEmployees(true)
        const response = await employeeApi.getAll(0, 5, { sort: 'hireDate,desc' })
        if (!active) return
        setRecentHires(response.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load recent hires', error)
      } finally {
        if (active) {
          setLoadingEmployees(false)
        }
      }
    }

    loadRecentHires()

    return () => {
      active = false
    }
  }, [])

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date TBD'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }

  const milestoneDates = useMemo(() => {
    const today = new Date()
    const addDays = (days: number) => new Date(today.getTime() + days * 86400000)
    return [
      { label: 'Manager review calibration', date: addDays(7) },
      { label: 'Employee self-review cut-off', date: addDays(10) },
      { label: 'Review close and sign-off', date: addDays(14) },
    ]
  }, [])

  const feedbackPulse = [
    {
      label: 'Pending approvals',
      value: loading ? '—' : metrics.pendingLeaves + metrics.pendingTimesheets,
    },
    {
      label: 'Training completion',
      value: loading ? '—' : `${metrics.trainingCompleted}%`,
    },
    {
      label: 'Compliance rate',
      value: loading ? '—' : `${metrics.complianceRate.toFixed(1)}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Performance</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Performance reviews</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Align review cycles, goals, and feedback across teams with a consistent process.
            </p>
          </div>
          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            Phase 2
          </span>
        </div>
      </div>

      <div className="shell-card p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'reviews' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Current review cycle</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Q3 Mid-Year Reviews in progress</div>
              {reviewSnapshot.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span>{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recent hires</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {loadingEmployees && (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">
                    Loading recent hires...
                  </div>
                )}
                {!loadingEmployees && recentHires.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">
                    No recent hires yet.
                  </div>
                )}
                {!loadingEmployees && recentHires.map((employee) => (
                  <div key={employee.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span>{employee.firstName} {employee.lastName}</span>
                      <span className="text-xs text-slate-400">{formatDate(employee.hireDate)}</span>
                    </div>
                    <div className="text-xs text-slate-500">{employee.status || 'Status pending'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming milestones</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {milestoneDates.map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  {item.label} - {item.date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="grid gap-4 md:grid-cols-3">
          {goals.map((goal) => (
            <div key={goal.title} className="shell-card p-5">
              <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
              <p className="text-xs text-slate-500 mt-1">Owner: {goal.owner}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{loading ? '—' : `${goal.progress}%`}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-violet-500" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">Feedback pulse</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {feedbackPulse.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span>{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold text-slate-900">360 feedback readiness</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ensure feedback cycles include peers, managers, and direct reports with balance.
            </p>
            <div className="mt-4 grid gap-2 text-xs text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Peer selection locked</div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Manager feedback due Sep 10</div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Calibration scheduled</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'oneonones' && (
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">1-on-1 focus</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {loadingEmployees && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                Loading focus list...
              </div>
            )}
            {!loadingEmployees && recentHires.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                No recent hires awaiting check-ins.
              </div>
            )}
            {!loadingEmployees && recentHires.map((employee) => (
              <div key={employee.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                Check-in with {employee.firstName} {employee.lastName}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calibration' && (
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Calibration notes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Balance ratings across teams with calibration sessions and transparent notes.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Attrition rate tracking: {loading ? '—' : `${metrics.attritionRate.toFixed(1)}%`}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Training completion: {loading ? '—' : `${metrics.trainingCompleted}%`}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Compliance rate: {loading ? '—' : `${metrics.complianceRate.toFixed(1)}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRPerformancePage
