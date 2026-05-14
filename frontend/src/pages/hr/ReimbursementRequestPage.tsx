import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { reimbursementApi } from '../../api/hrApi'
import { useAuthStore } from '../../store/authStore'
import { ReimbursementRequest, ReimbursementStatus } from '../../types/hr'

const reimbursementCategories = ['Travel', 'Meals', 'Supplies', 'Lodging', 'Other']
const currencyOptions = ['AUD', 'USD', 'EUR', 'GBP']

const formatCurrency = (amount: number, currency?: string | null) => {
  const safeCurrency = currency || 'AUD'
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: safeCurrency }).format(amount)
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Date TBD'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Date TBD'
    : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusTone = (status: ReimbursementStatus) => {
  switch (status) {
    case 'APPROVED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'REJECTED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'PAID':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

const ReimbursementRequestPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [requests, setRequests] = useState<ReimbursementRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(reimbursementCategories[0])
  const [currency, setCurrency] = useState(currencyOptions[0])
  const [requestDate, setRequestDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadRequests = useCallback(async () => {
    if (!user?.id) {
      setLoadingRequests(false)
      return
    }

    try {
      setLoadingRequests(true)
      const response = await reimbursementApi.getAll(0, 10, {
        requestedBy: user.id,
        sort: 'requestDate,desc',
      })
      setRequests(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load reimbursements:', error)
      toast.error('Failed to load reimbursements')
    } finally {
      setLoadingRequests(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user?.id) {
      toast.error('Sign in to submit a reimbursement request.')
      return
    }

    const parsedAmount = Number(amount)
    if (!requestDate || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Provide a date and a valid amount.')
      return
    }

    setSubmitting(true)

    try {
      await reimbursementApi.create({
        requestedBy: user.id,
        requesterEmail: user.email || undefined,
        amount: parsedAmount,
        currency,
        category,
        requestDate,
        description: description.trim() || undefined,
      })

      setAmount('')
      setRequestDate('')
      setDescription('')

      toast.success('Reimbursement request submitted.')
      await loadRequests()
    } catch (error) {
      console.error('Failed to submit reimbursement:', error)
      toast.error('Failed to submit reimbursement request')
    } finally {
      setSubmitting(false)
    }
  }

  const hasRequests = useMemo(() => requests.length > 0, [requests])

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Employee</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Apply for reimbursement</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Submit expense reimbursements for approval. Status updates appear once HR reviews the request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="shell-card p-5 sm:p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Request date</label>
            <input
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              {reimbursementCategories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Taxi fare from client site"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
          <Link
            to="/dashboard/employee"
            className="text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Back to employee dashboard
          </Link>
        </div>
      </form>

      <div className="shell-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent requests</h2>
          <button
            type="button"
            onClick={loadRequests}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {loadingRequests && <div className="text-sm text-slate-500">Loading reimbursements...</div>}
          {!loadingRequests && !hasRequests && (
            <div className="text-sm text-slate-500">No reimbursement requests submitted yet.</div>
          )}
          {!loadingRequests && hasRequests &&
            requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{request.category}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(request.requestDate)} · {request.description || 'No description'}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusTone(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(request.amount, request.currency)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ReimbursementRequestPage
