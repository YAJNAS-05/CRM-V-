import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, reimbursementApi } from '../../api/hrApi'
import { Employee, ReimbursementRequest, ReimbursementStatus } from '../../types/hr'
import { useAuthStore } from '../../store/authStore'

const STATUS_STEPS: ReimbursementStatus[] = ['SUBMITTED', 'APPROVED', 'PAID']

const ReimbursementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [request, setRequest] = useState<ReimbursementRequest | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [decisionNote, setDecisionNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      loadRequest(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadRequest = async (requestId: string) => {
    try {
      setLoading(true)
      const response = await reimbursementApi.getById(requestId)
      setRequest(response.data.data)
    } catch (error) {
      console.error('Failed to load reimbursement:', error)
      toast.error('Failed to load reimbursement')
      navigate('/hr/reimbursements')
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

  const employeeByUserId = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => {
      if (employee.userId) {
        map.set(employee.userId, employee)
      }
    })
    return map
  }, [employees])

  const formatCurrency = (value: number, currency?: string | null) => {
    const v = Number(value || 0)
    return `${currency || 'AUD'} ${v.toLocaleString()}`
  }

  const resolveEmployee = (userId?: string | null) => {
    if (!userId) return undefined
    return employeeByUserId.get(userId)
  }

  const handleApprove = async () => {
    if (!request || !id) return
    if (!user?.id) {
      toast.error('Missing approver identity')
      return
    }
    try {
      setSaving(true)
      const response = await reimbursementApi.approve(id, user.id)
      setRequest(response.data.data)
      toast.success('Reimbursement approved')
    } catch (error) {
      console.error('Failed to approve reimbursement:', error)
      toast.error('Failed to approve reimbursement')
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!request || !id) return
    try {
      setSaving(true)
      const response = await reimbursementApi.update(id, {
        status: 'REJECTED',
        notes: decisionNote || request.notes || undefined,
      })
      setRequest(response.data.data)
      toast.success('Reimbursement rejected')
    } catch (error) {
      console.error('Failed to reject reimbursement:', error)
      toast.error('Failed to reject reimbursement')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!request || !id) return
    try {
      setSaving(true)
      const response = await reimbursementApi.update(id, {
        status: 'PAID',
        notes: decisionNote || request.notes || undefined,
      })
      setRequest(response.data.data)
      toast.success('Marked as paid')
    } catch (error) {
      console.error('Failed to mark reimbursement paid:', error)
      toast.error('Failed to mark reimbursement paid')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!request) {
    return null
  }

  const requester = resolveEmployee(request.requestedBy)
  const approver = resolveEmployee(request.approvedBy)
  const isRejected = request.status === 'REJECTED'
  const stepIndex = STATUS_STEPS.indexOf(request.status)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/hr/reimbursements" className="text-xs text-indigo-600 hover:text-indigo-700">
            ← Back to reimbursements
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Reimbursement request</h1>
          <p className="text-sm text-gray-500">{request.category}</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
          {request.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Lifecycle</h2>
            <div className="flex flex-wrap items-center gap-3">
              {STATUS_STEPS.map((step, index) => {
                const isComplete = !isRejected && stepIndex >= index
                const tone = isRejected
                  ? 'border-gray-200 text-gray-400'
                  : isComplete
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-500'
                return (
                  <div
                    key={step}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
                  >
                    {step}
                  </div>
                )
              })}
              {isRejected && (
                <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  REJECTED
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Requested</span>
                <span>{new Date(request.requestDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Approved</span>
                <span>{request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Request details</h2>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Amount</dt>
                <dd className="text-gray-900 font-semibold">
                  {formatCurrency(request.amount, request.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900 font-semibold">{request.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Requester</dt>
                <dd className="text-gray-900">
                  {requester ? (
                    <Link to={`/hr/employees/${requester.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {requester.firstName} {requester.lastName}
                    </Link>
                  ) : (
                    request.requesterEmail || request.requestedBy
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Requester email</dt>
                <dd className="text-gray-900">{request.requesterEmail || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Description</dt>
                <dd className="text-gray-900">{request.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Approver</dt>
                <dd className="text-gray-900">
                  {approver ? `${approver.firstName} ${approver.lastName}` : request.approvedBy || '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Decision notes</h2>
            <textarea
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              rows={3}
              placeholder="Add context for approval or rejection"
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={saving || request.status !== 'SUBMITTED'}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={saving || request.status !== 'SUBMITTED'}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={saving || request.status !== 'APPROVED'}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Mark Paid
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">Audit trail</p>
            <div className="flex items-center justify-between">
              <span>Created</span>
              <span>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Updated</span>
              <span>{request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReimbursementDetailPage
