import React, { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { employeeApi, performanceReviewApi, PerformanceReview } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee } from '../../types/hr'
import { toast } from 'sonner'

const performanceReviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  reviewPeriod: z.string().min(1, 'Review period is required').max(20, 'Review period must be under 20 characters'),
  overallRating: z.number().int().min(1, 'Rating must be between 1-5').max(5, 'Rating must be between 1-5').optional(),
  goalsRating: z.number().int().min(1, 'Rating must be between 1-5').max(5, 'Rating must be between 1-5').optional(),
  skillsRating: z.number().int().min(1, 'Rating must be between 1-5').max(5, 'Rating must be between 1-5').optional(),
  reviewDate: z.string().optional(),
  comments: z.string().optional(),
})

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
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [showNewReviewForm, setShowNewReviewForm] = useState(false)
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    reviewPeriod: '',
    status: 'DRAFT',
    overallRating: undefined,
    goalsRating: undefined,
    skillsRating: undefined,
    comments: '',
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [savingReview, setSavingReview] = useState(false)
  const [reviewFieldErrors, setReviewFieldErrors] = useState<Partial<Record<string, string>>>({})
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

  useEffect(() => {
    let active = true
    const loadReviews = async () => {
      try {
        setLoadingReviews(true)
        const [reviewRes, empRes] = await Promise.all([
          performanceReviewApi.getAll(0, 50),
          employeeApi.getAll(0, 300),
        ])
        if (!active) return
        setReviews(reviewRes.data.data?.content || [])
        setEmployees(empRes.data.data?.content || [])
      } catch {
        // silently ignore
      } finally {
        if (active) setLoadingReviews(false)
      }
    }
    loadReviews()
    return () => { active = false }
  }, [])

  const handleCreateReview = async () => {
    const result = performanceReviewSchema.safeParse(newReview)
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {}
      for (const issue of result.error.errors) {
        const key = issue.path[0] as string
        if (key && !errs[key]) errs[key] = issue.message
      }
      setReviewFieldErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setReviewFieldErrors({})
    try {
      setSavingReview(true)
      const res = await performanceReviewApi.create(newReview)
      if (res.data.data) setReviews(prev => [res.data.data!, ...prev])
      setShowNewReviewForm(false)
      setNewReview({ reviewPeriod: '', status: 'DRAFT', comments: '' })
      toast.success('Performance review created')
    } catch {
      toast.error('Failed to create review')
    } finally {
      setSavingReview(false)
    }
  }

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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewReviewForm(true)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              + New Appraisal
            </button>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 self-center">
              Phase 2
            </span>
          </div>
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
        <div className="space-y-4">
          {loadingReviews ? (
            <div className="shell-card p-8 text-center text-slate-500 text-sm">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="shell-card p-8 text-center">
              <p className="text-slate-500 text-sm">No performance reviews yet.</p>
              <button
                onClick={() => setShowNewReviewForm(true)}
                className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Create first review
              </button>
            </div>
          ) : (
            <div className="shell-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Employee</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Period</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Rating</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Review Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map(r => {
                    const emp = employees.find(e => e.id === r.employeeId)
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-800">{empName}</td>
                        <td className="px-4 py-3 text-slate-600">{r.reviewPeriod}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.status === 'ACKNOWLEDGED' ? 'bg-green-100 text-green-700' :
                            r.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                            r.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.overallRating != null ? `${r.overallRating}/5` : '—'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{r.reviewDate || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
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

      {/* New Appraisal Modal */}
      {showNewReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-base font-semibold text-slate-900 mb-4">New Performance Appraisal</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Employee *</label>
                <select
                  value={newReview.employeeId || ''}
                  onChange={e => { setNewReview(p => ({ ...p, employeeId: e.target.value })); if (reviewFieldErrors.employeeId) setReviewFieldErrors(p => ({...p, employeeId: undefined})) }}
                  className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${reviewFieldErrors.employeeId ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">Select employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
                {reviewFieldErrors.employeeId && <p className="mt-1 text-xs text-red-600">{reviewFieldErrors.employeeId}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Review Period * (e.g. 2024-H1)</label>
                <input
                  type="text"
                  value={newReview.reviewPeriod || ''}
                  onChange={e => { setNewReview(p => ({ ...p, reviewPeriod: e.target.value })); if (reviewFieldErrors.reviewPeriod) setReviewFieldErrors(p => ({...p, reviewPeriod: undefined})) }}
                  className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${reviewFieldErrors.reviewPeriod ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="2024-H2"
                />
                {reviewFieldErrors.reviewPeriod && <p className="mt-1 text-xs text-red-600">{reviewFieldErrors.reviewPeriod}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Overall (1-5)</label>
                  <input type="number" min={1} max={5} value={newReview.overallRating ?? ''}
                    onChange={e => setNewReview(p => ({ ...p, overallRating: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Goals (1-5)</label>
                  <input type="number" min={1} max={5} value={newReview.goalsRating ?? ''}
                    onChange={e => setNewReview(p => ({ ...p, goalsRating: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Skills (1-5)</label>
                  <input type="number" min={1} max={5} value={newReview.skillsRating ?? ''}
                    onChange={e => setNewReview(p => ({ ...p, skillsRating: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Review Date</label>
                <input type="date" value={newReview.reviewDate || ''}
                  onChange={e => setNewReview(p => ({ ...p, reviewDate: e.target.value }))}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Comments</label>
                <textarea
                  value={newReview.comments || ''}
                  onChange={e => setNewReview(p => ({ ...p, comments: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNewReviewForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleCreateReview} disabled={savingReview}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {savingReview ? 'Saving...' : 'Create Appraisal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRPerformancePage
