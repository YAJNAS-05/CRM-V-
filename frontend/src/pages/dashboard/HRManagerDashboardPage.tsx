import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, leaveRequestApi, positionApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee, LeaveRequest, Position } from '../../types/hr'

const HRManagerDashboardPage: React.FC = () => {
  const { metrics, loading: metricsLoading } = useHRMetrics()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveCalendar, setLeaveCalendar] = useState<LeaveRequest[]>([])
  const [openPositions, setOpenPositions] = useState<Position[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    let active = true

    const loadDashboardData = async () => {
      try {
        setLoadingData(true)
        const today = new Date().toISOString().slice(0, 10)
        const [employeeRes, leaveRes, positionRes] = await Promise.all([
          employeeApi.getAll(0, 200, { sort: 'lastName,asc' }),
          leaveRequestApi.getAll(0, 3, { status: 'APPROVED', startDate: today, sort: 'startDate,asc' }),
          positionApi.getAll(0, 3, { sort: 'createdAt,desc' }),
        ])

        if (!active) return

        setEmployees(employeeRes.data.data?.content || [])
        setLeaveCalendar(leaveRes.data.data?.content || [])
        setOpenPositions(positionRes.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load manager dashboard data', error)
      } finally {
        if (active) {
          setLoadingData(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      active = false
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => {
      map.set(employee.id, employee)
    })
    return map
  }, [employees])

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Dates pending'
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'Dates pending'
    const startLabel = startDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
    const endLabel = endDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
    return `${startLabel} - ${endLabel}`
  }

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Employee'
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'
  }

  const kpis = [
    { label: 'Team headcount', value: metrics.activeEmployees, hint: 'Active employees' },
    { label: 'Leave approvals', value: metrics.pendingLeaves, hint: 'Pending today' },
    { label: 'Timesheets', value: metrics.pendingTimesheets, hint: 'Awaiting review' },
    { label: 'Open roles', value: metrics.openPositions, hint: 'Hiring in progress' },
  ]

  const priorities = [
    {
      label: `${metrics.visasExpiring} visas expiring within 30 days`,
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      label: `Payroll run due in ${metrics.daysToNextPayRun} days`,
      tone: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
      label: `${metrics.onboardingInProgress} onboarding journeys active`,
      tone: 'border-rose-200 bg-rose-50 text-rose-700',
    },
  ]

  const isLoading = metricsLoading || loadingData

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Manager view</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">HR manager dashboard</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Prioritize approvals, monitor team coverage, and stay ahead of hiring and onboarding.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/leave-requests"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Review leave
            </Link>
            <Link
              to="/hr/timesheets"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Approve timesheets
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{isLoading ? '—' : kpi.value}</p>
            <p className="mt-1 text-xs text-slate-500">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Priority alerts</h2>
          <div className="mt-4 space-y-2">
            {priorities.map((item) => (
              <div key={item.label} className={`rounded-lg border px-3 py-2 text-sm ${item.tone}`}>
                {isLoading ? 'Loading...' : item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/hr/leave"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Leave approvals
            </Link>
            <Link
              to="/hr/time"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Time approvals
            </Link>
            <Link
              to="/hr/onboard"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Onboarding tasks
            </Link>
            <Link
              to="/hr/recruit"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hiring pipeline
            </Link>
            <Link
              to="/hr/reimbursements"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reimbursements
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Team calendar</h2>
            <Link to="/hr/leave-requests" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View leave
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {isLoading && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                Loading leave calendar...
              </div>
            )}
            {!isLoading && leaveCalendar.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                No upcoming leave requests.
              </div>
            )}
            {!isLoading && leaveCalendar.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                {getEmployeeName(item.employeeId)} · {item.leaveType.replace(/_/g, ' ')}
                <div className="text-xs text-slate-400">{formatDateRange(item.startDate, item.endDate)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Recruitment snapshot</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {isLoading && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Loading open roles...</div>
            )}
            {!isLoading && openPositions.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">No open roles yet.</div>
            )}
            {!isLoading && openPositions.map((position) => (
              <div key={position.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                {position.title}
                {position.grade ? ` · ${position.grade}` : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRManagerDashboardPage
