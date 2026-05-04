import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import { Employee, Timesheet, TimesheetStatus } from '../../types/hr'
import { FeatureGate } from '../../components/rbac'

const TimesheetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [approverId, setApproverId] = useState('')
  const [decisionNote, setDecisionNote] = useState('')

  useEffect(() => {
    if (id) {
      fetchTimesheet(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (timesheet?.approvedBy) {
      setApproverId(timesheet.approvedBy)
    }
    if (timesheet?.notes) {
      setDecisionNote(timesheet.notes)
    }
  }, [timesheet?.approvedBy, timesheet?.notes])

  const fetchTimesheet = async (timesheetId: string) => {
    try {
      setLoading(true)
      const response = await timesheetApi.getById(timesheetId)
      setTimesheet(response.data.data || null)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
      toast.error('Failed to load timesheet')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200)
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const handleSubmit = async () => {
    if (!id) return
    try {
      const response = await timesheetApi.submit(id)
      setTimesheet(response.data.data || null)
      toast.success('Timesheet submitted')
    } catch (error) {
      console.error('Failed to submit timesheet:', error)
      toast.error('Failed to submit timesheet')
    }
  }

  const handleApprove = async () => {
    if (!id) return
    if (!approverId) {
      toast.error('Approver ID is required')
      return
    }

    try {
      const response = await timesheetApi.approve(id, approverId)
      setTimesheet(response.data.data || null)
      toast.success('Timesheet approved')
    } catch (error) {
      console.error('Failed to approve timesheet:', error)
      toast.error('Failed to approve timesheet')
    }
  }

  const handleReject = async () => {
    if (!id) return
    try {
      const response = await timesheetApi.reject(id, decisionNote || timesheet?.notes || undefined)
      setTimesheet(response.data.data || null)
      toast.success('Timesheet rejected')
    } catch (error) {
      console.error('Failed to reject timesheet:', error)
      toast.error('Failed to reject timesheet')
    }
  }

  const employeeName = timesheet
    ? employees.find((employee) => employee.id === timesheet.employeeId)
    : null
  const approverRecord = timesheet?.approvedBy
    ? employees.find((employee) => employee.id === timesheet.approvedBy)
    : null

  const statusSteps: TimesheetStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
  const stepIndex = timesheet ? statusSteps.indexOf(timesheet.status) : 0
  const isRejected = timesheet?.status === 'REJECTED'

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!timesheet) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Timesheet not found.</div>
        <Link to="/hr/timesheets" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Timesheets
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
          <p className="text-sm text-gray-500">Status: {timesheet.status}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusSteps.map((step, index) => {
              const isComplete = !isRejected && stepIndex >= index
              const tone = isRejected
                ? 'border-slate-200 text-slate-400'
                : isComplete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-500'
              return (
                <span
                  key={step}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
                >
                  {step}
                </span>
              )
            })}
          </div>
        </div>
        <FeatureGate requiredPermission="HR_EDIT">
          <Link
            to={`/hr/timesheets/${timesheet.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Edit
          </Link>
        </FeatureGate>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Employee</p>
          <p className="text-gray-900">
            {employeeName ? `${employeeName.firstName} ${employeeName.lastName}` : timesheet.employeeId}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Work Date</p>
          <p className="text-gray-900">{new Date(timesheet.workDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Week Start</p>
          <p className="text-gray-900">
            {timesheet.weekStartDate ? new Date(timesheet.weekStartDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hours Worked</p>
          <p className="text-gray-900">{timesheet.hoursWorked ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-gray-900">{timesheet.totalHours ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Billable Hours</p>
          <p className="text-gray-900">{timesheet.totalBillableHours ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Non-billable Hours</p>
          <p className="text-gray-900">{timesheet.totalNonBillableHours ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Field Job ID</p>
          <p className="text-gray-900">{timesheet.fieldJobId || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-900">{timesheet.notes || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <FeatureGate requiredPermission="HR_EDIT">
            <button
              onClick={handleSubmit}
              disabled={timesheet.status !== 'DRAFT'}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              Submit Timesheet
            </button>
          </FeatureGate>
          <div className="grid gap-3 sm:grid-cols-2 items-center">
            <select
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              disabled={timesheet.status !== 'SUBMITTED'}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select approver</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
            <FeatureGate requiredPermission="HR_EDIT">
              <button
                onClick={handleApprove}
                disabled={timesheet.status !== 'SUBMITTED'}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                Approve Timesheet
              </button>
            </FeatureGate>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">
              Decision notes
            </label>
            <textarea
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              disabled={timesheet.status !== 'SUBMITTED'}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Add context for approval or rejection"
            />
          </div>
          {approverRecord && (
            <p className="text-xs text-gray-500">Approved by {approverRecord.firstName} {approverRecord.lastName}</p>
          )}
          <FeatureGate requiredPermission="HR_EDIT">
            <button
              onClick={handleReject}
              disabled={timesheet.status !== 'SUBMITTED'}
              className="px-4 py-2 text-sm font-medium text-rose-700 border border-rose-200 bg-rose-50 rounded-lg hover:bg-rose-100 disabled:opacity-60"
            >
              Reject Timesheet
            </button>
          </FeatureGate>
        </div>
      </div>

      <Link to="/hr/timesheets" className="text-sm text-gray-600 hover:text-gray-900">
        Back to Timesheets
      </Link>
    </div>
  )
}

export default TimesheetDetailPage
