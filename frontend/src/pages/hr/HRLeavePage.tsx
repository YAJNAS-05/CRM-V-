import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, holidayApi, leavePolicyApi, leaveRequestApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee, LeaveRequest } from '../../types/hr'

const HRLeavePage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [policyCount, setPolicyCount] = useState(0)
  const [holidayCount, setHolidayCount] = useState(0)
  const [loadingAdmin, setLoadingAdmin] = useState(true)

  useEffect(() => {
    let active = true

    const loadLeaveData = async () => {
      try {
        setLoadingLeaves(true)
        const [leaveRes, employeeRes, policyRes, holidayRes] = await Promise.all([
          leaveRequestApi.getAll(0, 50, { sort: 'startDate,desc' }),
          employeeApi.getAll(0, 200, { sort: 'lastName,asc' }),
          leavePolicyApi.getAll(0, 200),
          holidayApi.getAll(0, 200),
        ])

        if (!active) return

        setLeaveRequests(leaveRes.data.data?.content || [])
        setEmployees(employeeRes.data.data?.content || [])
        setPolicyCount(policyRes.data.data?.totalElements || policyRes.data.data?.content?.length || 0)
        setHolidayCount(holidayRes.data.data?.totalElements || holidayRes.data.data?.content?.length || 0)
      } catch (error) {
        console.error('Failed to load leave data', error)
      } finally {
        if (active) {
          setLoadingLeaves(false)
          setLoadingAdmin(false)
        }
      }
    }

    loadLeaveData()

    return () => {
      active = false
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => map.set(employee.id, employee))
    return map
  }, [employees])

  const pendingRequests = useMemo(
    () => leaveRequests.filter((request) => request.status === 'REQUESTED').slice(0, 4),
    [leaveRequests],
  )

  const upcomingRequests = useMemo(() => {
    const today = new Date()
    return leaveRequests
      .filter((request) => request.status === 'APPROVED' && new Date(request.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 4)
  }, [leaveRequests])

  const leaveTypeSummary = useMemo(() => {
    const counts = leaveRequests.reduce<Record<string, number>>((acc, request) => {
      acc[request.leaveType] = (acc[request.leaveType] || 0) + 1
      return acc
    }, {})

    const total = leaveRequests.length || 1
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({
        label: type.replace(/_/g, ' '),
        count,
        percentage: Math.round((count / total) * 100),
      }))
  }, [leaveRequests])

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Employee'
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'
  }

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Dates pending'
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 'Dates pending'
    const startLabel = startDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
    const endLabel = endDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
    return `${startLabel} - ${endLabel}`
  }

  const leaveStats = [
    { label: 'Open requests', value: loading ? '—' : metrics.pendingLeaves },
    { label: 'Approved requests', value: loading ? '—' : metrics.approvedLeaves },
    { label: 'Upcoming leave', value: loading ? '—' : metrics.upcomingLeaves },
  ]

  const adminStats = [
    { label: 'Policies', value: loadingAdmin ? '—' : policyCount, href: '/hr/leave-policies' },
    { label: 'Balances', value: loadingAdmin ? '—' : employees.length, href: '/hr/leave-balances' },
    { label: 'Holidays', value: loadingAdmin ? '—' : holidayCount, href: '/hr/holidays' },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Leave management</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Leave requests</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage leave types, balances, approvals, and coverage planning with clarity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/leave-requests"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View requests
            </Link>
            <Link
              to="/hr/leave-requests/new"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              New request
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {leaveStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="shell-card p-5">
        <h2 className="text-sm font-semibold text-slate-900">Leave governance</h2>
        <p className="text-sm text-slate-600 mt-1">Maintain policies, balances, and holiday calendars.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {adminStats.map((stat) => (
            <Link key={stat.label} to={stat.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">Manage →</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Leave coverage</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {loadingLeaves && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Loading leave mix...
              </div>
            )}
            {!loadingLeaves && leaveTypeSummary.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                No leave requests yet.
              </div>
            )}
            {!loadingLeaves && leaveTypeSummary.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.count} request(s)</p>
                <p className="mt-2 text-xs text-slate-400">{item.percentage}% of recent requests</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Upcoming leave</h3>
            <div className="mt-3 space-y-2">
              {loadingLeaves && (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  Loading upcoming leave...
                </div>
              )}
              {!loadingLeaves && upcomingRequests.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  No upcoming approved leave.
                </div>
              )}
              {!loadingLeaves && upcomingRequests.map((request) => (
                <div key={request.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  {getEmployeeName(request.employeeId)} · {formatDateRange(request.startDate, request.endDate)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Pending approvals</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {loadingLeaves && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">
                Loading approvals...
              </div>
            )}
            {!loadingLeaves && pendingRequests.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500">
                No pending approvals.
              </div>
            )}
            {!loadingLeaves && pendingRequests.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>{getEmployeeName(request.employeeId)}</span>
                  <span className="text-xs text-slate-400">{request.leaveType.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-xs text-slate-500">{formatDateRange(request.startDate, request.endDate)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRLeavePage
