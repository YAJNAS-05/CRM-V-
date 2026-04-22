import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fieldworkApi } from '../../api/fieldworkApi'
import { useAuthStore } from '../../store/authStore'
import { FieldJobDto } from '../../types/fieldwork'

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'TBD')

const FieldworkDashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const canCreate = permissions.includes('FIELDWORK_CREATE')

  const [jobs, setJobs] = useState<FieldJobDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadJobs = async () => {
      try {
        setLoading(true)
        const page = await fieldworkApi.getFieldJobs(0, 50)
        if (isActive) setJobs(page.content || [])
      } catch {
        if (isActive) setJobs([])
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadJobs()

    return () => {
      isActive = false
    }
  }, [])

  const stats = useMemo(() => {
    const scheduled = jobs.filter((job) => job.jobStatus === 'SCHEDULED').length
    const inProgress = jobs.filter((job) => job.jobStatus === 'IN_PROGRESS').length
    const pendingSignOff = jobs.filter((job) => job.jobStatus === 'PENDING_SIGN_OFF').length
    const completed = jobs.filter((job) => job.jobStatus === 'COMPLETED').length

    return { scheduled, inProgress, pendingSignOff, completed }
  }, [jobs])

  const upcomingJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const aTime = a.scheduledStartDate ? new Date(a.scheduledStartDate).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.scheduledStartDate ? new Date(b.scheduledStartDate).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })
      .slice(0, 6)
  }, [jobs])

  const quickActions = [
    { label: 'Open work orders', href: '/fieldwork', show: true },
    { label: 'New work order', href: '/fieldwork/new', show: canCreate },
  ].filter((action) => action.show)

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Field work</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Field work dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track dispatch status, upcoming jobs, and in-progress field activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Scheduled</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.scheduled}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">In progress</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pending sign-off</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingSignOff}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.completed}</p>
        </div>
      </div>

      <div className="shell-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Upcoming</p>
            <h2 className="text-lg font-semibold text-slate-900 mt-1">Next field jobs</h2>
          </div>
          <Link to="/fieldwork" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all jobs
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading field jobs...</div>
        ) : upcomingJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No upcoming jobs scheduled yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {upcomingJobs.map((job) => (
              <div
                key={String(job.fieldJobId ?? job.jobNumber)}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {job.jobNumber || job.jobType || 'Work order'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.clientOrSellerName || job.siteCity || 'Location pending'}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {job.jobStatus?.replace(/_/g, ' ') || 'SCHEDULED'}
                </div>
                <div className="text-xs text-slate-500">{formatDate(job.scheduledStartDate)}</div>
                <Link
                  to={`/fieldwork/${job.fieldJobId || job.jobNumber}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldworkDashboardPage
