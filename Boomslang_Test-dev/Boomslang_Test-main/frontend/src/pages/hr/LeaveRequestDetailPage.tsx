import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, leaveRequestApi } from '../../api/hrApi'
import { Employee, LeaveRequest, LeaveStatus } from '../../types/hr'
import { FeatureGate } from '../../components/rbac'

const LeaveRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [approverId, setApproverId] = useState('')
  const [decisionNote, setDecisionNote] = useState('')

  useEffect(() => {
    if (id) {
      fetchLeaveRequest(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (leaveRequest?.approvedBy) {
      setApproverId(leaveRequest.approvedBy)
    }
    if (leaveRequest?.notes) {
      setDecisionNote(leaveRequest.notes)
    }
  }, [leaveRequest?.approvedBy, leaveRequest?.notes])

  const fetchLeaveRequest = async (requestId: string) => {
    try {
      setLoading(true)
      const response = await leaveRequestApi.getById(requestId)
      setLeaveRequest(response.data.data || null)
    } catch (error) {
      console.error('Failed to load leave request:', error)
      toast.error('Failed to load leave request')
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

  const handleApprove = async () => {
    if (!id) return
    if (!approverId) {
      toast.error('Approver ID is required')
      return
    }

    try {
      const response = await leaveRequestApi.approve(id, approverId)
      setLeaveRequest(response.data.data || null)
      toast.success('Leave request approved')
    } catch (error) {
      console.error('Failed to approve leave request:', error)
      toast.error('Failed to approve leave request')
    }
  }

  const handleReject = async () => {
    if (!id) return
    try {
      const response = await leaveRequestApi.update(id, {
        status: 'REJECTED',
        notes: decisionNote || leaveRequest?.notes || undefined,
      })
      setLeaveRequest(response.data.data || null)
      toast.success('Leave request rejected')
    } catch (error) {
      console.error('Failed to reject leave request:', error)
      toast.error('Failed to reject leave request')
    }
  }

  const employeeRecord = leaveRequest
    ? employees.find((employee) => employee.id === leaveRequest.employeeId)
    : null
  const approverRecord = leaveRequest?.approvedBy
    ? employees.find((employee) => employee.id === leaveRequest.approvedBy)
    : null
  const employeeName = employeeRecord
    ? `${employeeRecord.firstName} ${employeeRecord.lastName}`
    : leaveRequest?.employeeId

  const statusSteps: LeaveStatus[] = ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED']
  const stepIndex = leaveRequest ? statusSteps.indexOf(leaveRequest.status) : 0
  const isRejected = leaveRequest?.status === 'REJECTED'

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!leaveRequest) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Leave request not found.</div>
        <Link to="/hr/leave-requests" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Leave Requests
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Leave approval</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Leave request</h1>
            <p className="text-sm text-slate-600 mt-2">
              Status: <span className="font-semibold text-slate-900">{leaveRequest.status}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FeatureGate requiredPermission="HR_EDIT">
              <Link
                to={`/hr/leave-requests/${leaveRequest.id}/edit`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Edit request
              </Link>
            </FeatureGate>
            <Link
              to="/hr/leave-requests"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Request details</h2>
          <div className="mt-4 flex flex-wrap gap-2">
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Employee</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{employeeName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Leave type</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{leaveRequest.leaveType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Start date</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {new Date(leaveRequest.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">End date</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {new Date(leaveRequest.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Notes</p>
              <p className="mt-2 text-sm text-slate-700">{leaveRequest.notes || '—'}</p>
            </div>
          </div>
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Approval decision</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
                Approver
              </label>
              <select
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                disabled={leaveRequest.status !== 'REQUESTED'}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select approver</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
                Decision notes
              </label>
              <textarea
                value={decisionNote}
                onChange={(event) => setDecisionNote(event.target.value)}
                disabled={leaveRequest.status !== 'REQUESTED'}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Add context for approval or rejection"
              />
            </div>
            {approverRecord && (
              <p className="text-xs text-slate-500">Approved by {approverRecord.firstName} {approverRecord.lastName}</p>
            )}
            <FeatureGate requiredPermission="HR_EDIT">
              <button
                onClick={handleApprove}
                disabled={leaveRequest.status !== 'REQUESTED'}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve leave
              </button>
            </FeatureGate>
            <FeatureGate requiredPermission="HR_EDIT">
              <button
                onClick={handleReject}
                disabled={leaveRequest.status !== 'REQUESTED'}
                className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
              >
                Reject leave
              </button>
            </FeatureGate>
          </div>
        </div>
      </div>

      <div className="shell-card p-5">
        <h2 className="text-sm font-semibold text-slate-900">Approval timeline</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
            Requested on {leaveRequest.createdAt ? new Date(leaveRequest.createdAt).toLocaleDateString() : '—'}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
            Approved by {approverRecord ? `${approverRecord.firstName} ${approverRecord.lastName}` : leaveRequest.approvedBy || 'Pending'}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
            Approval date {leaveRequest.approvedAt ? new Date(leaveRequest.approvedAt).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveRequestDetailPage
