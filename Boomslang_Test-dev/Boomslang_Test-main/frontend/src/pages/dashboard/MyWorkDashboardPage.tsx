import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fieldworkApi } from '../../api/fieldworkApi'
import { employeeApi, leaveRequestApi, timesheetApi } from '../../api/hrApi'
import { useAuthStore } from '../../store/authStore'
import { FieldJobDto } from '../../types/fieldwork'
import { Employee, LeaveRequest, Timesheet } from '../../types/hr'

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'TBD')

const normalizeName = (value?: string | null) => (value || '').trim().toLowerCase()

const MyWorkDashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const hasFieldwork = permissions.includes('FIELDWORK_VIEW')
  const hasHR = permissions.includes('HR_VIEW')

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [myJobs, setMyJobs] = useState<FieldJobDto[]>([])
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([])
  const [myTimesheets, setMyTimesheets] = useState<Timesheet[]>([])
  const [loadingWork, setLoadingWork] = useState(false)
  const [loadingHR, setLoadingHR] = useState(false)

  useEffect(() => {
    if (!user || !hasHR) {
      setEmployee(null)
      return
    }

    let isActive = true
    const loadEmployee = async () => {
      try {
        const response = await employeeApi.getAll(0, 200)
        const employees = response.data.data?.content || []
        const match = employees.find((entry) =>
          (entry.userId && entry.userId === user.id) ||
          (entry.email && entry.email.toLowerCase() === user.email?.toLowerCase())
        )
        if (isActive) setEmployee(match || null)
      } catch {
        if (isActive) setEmployee(null)
      }
    }

    loadEmployee()

    return () => {
      isActive = false
    }
  }, [hasHR, user])

  useEffect(() => {
    if (!hasFieldwork || !user) {
      setMyJobs([])
      return
    }

    let isActive = true
    const loadJobs = async () => {
      try {
        setLoadingWork(true)
        const page = await fieldworkApi.getFieldJobs(0, 50)
        const allJobs = page.content || []
        const userName = normalizeName(user.fullName)
        const engineerIds = new Set<string>()
        if (employee?.id) engineerIds.add(String(employee.id))
        if (user.id) engineerIds.add(String(user.id))

        const assignedJobs = allJobs.filter((job) => {
          const jobEngineerId = job.primaryEngineerId ? String(job.primaryEngineerId) : ''
          const matchesId = engineerIds.size > 0 && engineerIds.has(jobEngineerId)
          const matchesName = userName && normalizeName(job.primaryEngineerName).includes(userName)
          return matchesId || matchesName
        })

        if (isActive) setMyJobs(assignedJobs)
      } catch {
        if (isActive) setMyJobs([])
      } finally {
        if (isActive) setLoadingWork(false)
      }
    }

    loadJobs()

    return () => {
      isActive = false
    }
  }, [employee?.id, hasFieldwork, user])

  useEffect(() => {
    if (!hasHR || !user) {
      setMyLeaves([])
      setMyTimesheets([])
      return
    }

    let isActive = true
    const loadHR = async () => {
      try {
        setLoadingHR(true)

        if (employee?.id) {
          const [leaveResp, timesheetResp] = await Promise.allSettled([
            leaveRequestApi.getByEmployee(employee.id),
            timesheetApi.getByEmployee(employee.id),
          ])

          if (leaveResp.status === 'fulfilled' && isActive) {
            setMyLeaves(leaveResp.value.data.data || [])
          }

          if (timesheetResp.status === 'fulfilled' && isActive) {
            setMyTimesheets(timesheetResp.value.data.data || [])
          }
        } else if (isActive) {
          setMyLeaves([])
          setMyTimesheets([])
        }
      } finally {
        if (isActive) setLoadingHR(false)
      }
    }

    loadHR()

    return () => {
      isActive = false
    }
  }, [employee?.id, hasHR, user])

  const jobStats = useMemo(() => {
    const todayLabel = new Date().toDateString()
    const today = myJobs.filter((job) => {
      const scheduled = job.scheduledStartDate ? new Date(job.scheduledStartDate).toDateString() : ''
      return scheduled === todayLabel
    }).length

    const inProgress = myJobs.filter((job) => ['IN_PROGRESS', 'PENDING_SIGN_OFF'].includes(job.jobStatus || '')).length
    const completed = myJobs.filter((job) => job.jobStatus === 'COMPLETED').length
    const pending = myJobs.filter((job) => ['SCHEDULED', 'DRAFT', 'ENGINEER_ASSIGNED'].includes(job.jobStatus || '')).length

    return { today, inProgress, completed, pending }
  }, [myJobs])

  const quickActions = [
    { label: 'Request leave', href: '/hr/leave-requests/new', show: hasHR && permissions.includes('HR_CREATE') },
    { label: 'Submit timesheet', href: '/hr/timesheets/new', show: hasHR && permissions.includes('HR_CREATE') },
    { label: 'New work order', href: '/fieldwork/new', show: hasFieldwork && permissions.includes('FIELDWORK_CREATE') },
  ].filter((action) => action.show)

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Loading your dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">My work</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Employee dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track your assigned work orders and HR requests in one focused view.
            </p>
          </div>
          {quickActions.length > 0 && (
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
          )}
        </div>
      </div>

      {hasFieldwork && (
        <div className="shell-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Field work</p>
              <h2 className="text-lg font-semibold text-slate-900 mt-1">My work orders</h2>
            </div>
            <Link to="/fieldwork" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Open work orders
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{jobStats.today}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">In progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{jobStats.inProgress}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{jobStats.pending}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{jobStats.completed}</p>
            </div>
          </div>

          {loadingWork ? (
            <div className="text-sm text-slate-500">Loading work orders...</div>
          ) : myJobs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No work orders assigned yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {myJobs.slice(0, 6).map((job) => (
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
      )}

      {hasHR && (
        <div className="shell-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">HR</p>
              <h2 className="text-lg font-semibold text-slate-900 mt-1">My requests</h2>
            </div>
            <Link to="/hr/leave-requests" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View HR
            </Link>
          </div>

          {loadingHR ? (
            <div className="text-sm text-slate-500">Loading HR data...</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Leave requests</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{myLeaves.length}</p>
                <Link to="/hr/leave-requests" className="text-xs text-blue-600 font-semibold">
                  Open requests
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Timesheets</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{myTimesheets.length}</p>
                <Link to="/hr/timesheets" className="text-xs text-blue-600 font-semibold">
                  Open timesheets
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MyWorkDashboardPage
