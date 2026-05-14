import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, leaveRequestApi, reimbursementApi, timesheetApi } from '../../api/hrApi'
import { useAuthStore } from '../../store/authStore'
import { Employee, LeaveRequest, ReimbursementRequest, Timesheet } from '../../types/hr'

const EmployeeDashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const hasHR = permissions.includes('HR_VIEW')
  const canSubmitHR = hasHR && permissions.includes('HR_CREATE')

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([])
  const [myTimesheets, setMyTimesheets] = useState<Timesheet[]>([])
  const [myReimbursements, setMyReimbursements] = useState<ReimbursementRequest[]>([])
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
          const reimbursementPromise = employee.userId
            ? reimbursementApi.getAll(0, 50, { requestedBy: employee.userId, sort: 'requestDate,desc' })
            : reimbursementApi.getAll(0, 50, { search: employee.email, sort: 'requestDate,desc' })

          const [leaveResp, timesheetResp, reimbursementResp] = await Promise.allSettled([
            leaveRequestApi.getByEmployee(employee.id),
            timesheetApi.getByEmployee(employee.id),
            reimbursementPromise,
          ])

          if (leaveResp.status === 'fulfilled' && isActive) {
            setMyLeaves(leaveResp.value.data.data || [])
          }

          if (timesheetResp.status === 'fulfilled' && isActive) {
            setMyTimesheets(timesheetResp.value.data.data || [])
          }

          if (reimbursementResp.status === 'fulfilled' && isActive) {
            const data = reimbursementResp.value.data.data
            setMyReimbursements(data?.content || [])
          }
        } else if (isActive) {
          setMyLeaves([])
          setMyTimesheets([])
          setMyReimbursements([])
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

  const reimbursementCount = myReimbursements.length

  const quickActions = [
    { label: 'Request leave', href: '/hr/leave-requests/new', show: canSubmitHR },
    { label: 'Apply reimbursement', href: '/hr/reimbursements/new', show: canSubmitHR },
    { label: 'Submit attendance', href: '/hr/timesheets/new', show: canSubmitHR },
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Employee</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Employee dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage leave, reimbursements, and attendance from one place.
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Leave requests</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{myLeaves.length}</p>
                <Link to="/hr/leave-requests" className="text-xs text-blue-600 font-semibold">
                  Open requests
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Reimbursements</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{reimbursementCount}</p>
                <Link to="/hr/reimbursements/new" className="text-xs text-blue-600 font-semibold">
                  New request
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

      {!hasHR && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Your account does not have HR access yet. Contact an administrator to enable employee requests.
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboardPage
