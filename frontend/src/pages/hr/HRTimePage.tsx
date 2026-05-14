import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee, Timesheet } from '../../types/hr'

const HRTimePage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingTimesheets, setLoadingTimesheets] = useState(true)

  useEffect(() => {
    let active = true

    const loadTimesheetData = async () => {
      try {
        setLoadingTimesheets(true)
        const [timesheetRes, employeeRes] = await Promise.all([
          timesheetApi.getAll(0, 50, { sort: 'workDate,desc' }),
          employeeApi.getAll(0, 200, { sort: 'lastName,asc' }),
        ])

        if (!active) return

        setTimesheets(timesheetRes.data.data?.content || [])
        setEmployees(employeeRes.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load timesheets', error)
      } finally {
        if (active) {
          setLoadingTimesheets(false)
        }
      }
    }

    loadTimesheetData()

    return () => {
      active = false
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => map.set(employee.id, employee))
    return map
  }, [employees])

  const statusCounts = useMemo(() => {
    return timesheets.reduce(
      (acc, sheet) => {
        acc[sheet.status] = (acc[sheet.status] || 0) + 1
        return acc
      },
      { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0 } as Record<string, number>,
    )
  }, [timesheets])

  const approvedHours = useMemo(() => {
    return timesheets
      .filter((sheet) => sheet.status === 'APPROVED')
      .reduce((total, sheet) => total + (sheet.hoursWorked || 0), 0)
  }, [timesheets])

  const pendingApprovals = metrics.pendingTimesheets || 0

  const summaryCards = [
    { label: 'Pending approvals', value: statusCounts.SUBMITTED, description: 'Submitted timesheets' },
    { label: 'Draft timesheets', value: statusCounts.DRAFT, description: 'Not yet submitted' },
    { label: 'Approved hours', value: Math.round(approvedHours), description: 'Hours approved' },
    { label: 'Compliance rate', value: `${Math.round(metrics.complianceRate)}%`, description: 'Overall compliance' },
  ]

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date TBD'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Employee'
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Time and attendance</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Timesheets and rosters</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Capture time, approve attendance, and keep payroll aligned with real hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/timesheets"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View timesheets
            </Link>
            <Link
              to="/hr/timesheets/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New timesheet
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {summaryCards.map((card) => (
          <div key={card.label} className="shell-card p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loadingTimesheets || loading ? '—' : card.value}
            </p>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="shell-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Approval queue</h2>
          <span className="text-xs text-slate-500">
            {loading ? 'Loading...' : `${pendingApprovals} pending approvals`}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {loadingTimesheets && (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
              Loading approval queue...
            </div>
          )}
          {!loadingTimesheets && timesheets.filter((sheet) => sheet.status === 'SUBMITTED').length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
              No pending timesheets right now.
            </div>
          )}
          {!loadingTimesheets && timesheets
            .filter((sheet) => sheet.status === 'SUBMITTED')
            .slice(0, 3)
            .map((sheet) => (
              <div key={sheet.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>{getEmployeeName(sheet.employeeId)}</span>
                  <span className="text-xs text-slate-400">{formatDate(sheet.workDate)}</span>
                </div>
                <div className="text-xs text-slate-500">{sheet.hoursWorked || 0} hrs · Pending approval</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default HRTimePage
