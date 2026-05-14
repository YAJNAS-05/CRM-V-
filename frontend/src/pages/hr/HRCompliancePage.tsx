import React, { useEffect, useMemo, useState } from 'react'
import { employeeApi, leaveRequestApi, timesheetApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee, LeaveRequest, Timesheet } from '../../types/hr'

const statusStyles: Record<string, string> = {
  'On track': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Action needed': 'border-amber-200 bg-amber-50 text-amber-700',
}

const HRCompliancePage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([])
  const [loadingQueues, setLoadingQueues] = useState(true)
  const pendingApprovals = (metrics.pendingLeaves || 0) + (metrics.pendingTimesheets || 0)
  const complianceRate = metrics.complianceRate || 0

  useEffect(() => {
    let active = true

    const loadQueues = async () => {
      try {
        setLoadingQueues(true)
        const [employeeRes, leaveRes, timesheetRes] = await Promise.all([
          employeeApi.getAll(0, 200, { sort: 'lastName,asc' }),
          leaveRequestApi.getAll(0, 3, { status: 'REQUESTED', sort: 'startDate,asc' }),
          timesheetApi.getAll(0, 3, { status: 'SUBMITTED', sort: 'workDate,desc' }),
        ])

        if (!active) return

        setEmployees(employeeRes.data.data?.content || [])
        setPendingLeaves(leaveRes.data.data?.content || [])
        setPendingTimesheets(timesheetRes.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load compliance queues', error)
      } finally {
        if (active) {
          setLoadingQueues(false)
        }
      }
    }

    loadQueues()

    return () => {
      active = false
    }
  }, [])

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => map.set(employee.id, employee))
    return map
  }, [employees])

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Employee'
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'
  }

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date TBD'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }
  const complianceChecks = [
    { label: 'Award wage checker', status: 'On track', detail: 'Weekly audits running' },
    { label: 'Fair Work alerts', status: 'On track', detail: 'No escalations' },
    {
      label: 'Visa expiry',
      status: metrics.visasExpiring > 0 ? 'Action needed' : 'On track',
      detail: loading ? 'Loading...' : `${metrics.visasExpiring} visas within 30 days`,
    },
    {
      label: 'Approvals backlog',
      status: pendingApprovals > 0 ? 'Action needed' : 'On track',
      detail: loading ? 'Loading...' : `${pendingApprovals} approvals pending`,
    },
    {
      label: 'Policy acknowledgements',
      status: complianceRate < 90 ? 'Action needed' : 'On track',
      detail: loading ? 'Loading...' : `${Math.round(complianceRate)}% completion`,
    },
    { label: 'WGEA readiness', status: 'On track', detail: 'Data set prepared' },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Compliance</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Compliance and risk</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Keep awards, visas, and policy acknowledgements aligned with Fair Work requirements.
            </p>
          </div>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            Compliance pulse
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {complianceChecks.map((check) => (
          <div key={check.label} className="shell-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{check.label}</p>
                <p className="mt-2 text-sm text-slate-600">{check.detail}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[check.status]}`}>
                {check.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Approvals requiring action</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {loadingQueues && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Loading approvals...
              </div>
            )}
            {!loadingQueues && pendingLeaves.length === 0 && pendingTimesheets.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                No approvals pending right now.
              </div>
            )}
            {!loadingQueues && pendingLeaves.map((leave) => (
              <div key={leave.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                Leave approval · {getEmployeeName(leave.employeeId)}
                <div className="text-xs text-slate-400">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</div>
              </div>
            ))}
            {!loadingQueues && pendingTimesheets.map((sheet) => (
              <div key={sheet.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                Timesheet approval · {getEmployeeName(sheet.employeeId)}
                <div className="text-xs text-slate-400">Work date: {formatDate(sheet.workDate)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Policy tracker</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Compliance rate · {loading ? '—' : `${complianceRate.toFixed(1)}%`}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Training completion · {loading ? '—' : `${metrics.trainingCompleted}%`}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              Pending reimbursements · {loading ? '—' : metrics.pendingReimbursements}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRCompliancePage
