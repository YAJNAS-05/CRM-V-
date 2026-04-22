import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'

const REIMBURSEMENT_STORAGE_KEY = 'everx_reimbursement_requests'

type ReimbursementRequest = {
  id: string
  userId?: string
  userEmail?: string
  amount: number
  category: string
  requestDate: string
  description: string
  status: string
  createdAt: string
}

const readLocalReimbursements = (): ReimbursementRequest[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(REIMBURSEMENT_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ReimbursementRequest[]) : []
  } catch {
    return []
  }
}

const writeLocalReimbursements = (requests: ReimbursementRequest[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REIMBURSEMENT_STORAGE_KEY, JSON.stringify(requests))
}

const reimbursementCategories = ['Travel', 'Meals', 'Supplies', 'Lodging', 'Other']

const ReimbursementRequestPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(reimbursementCategories[0])
  const [requestDate, setRequestDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedAmount = Number(amount)
    if (!requestDate || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Provide a date and a valid amount.')
      return
    }

    setSubmitting(true)

    const entry: ReimbursementRequest = {
      id: `RMB-${Date.now()}`,
      userId: user?.id ? String(user.id) : undefined,
      userEmail: user?.email || undefined,
      amount: parsedAmount,
      category,
      requestDate,
      description: description.trim(),
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    }

    const existing = readLocalReimbursements()
    writeLocalReimbursements([entry, ...existing])

    setAmount('')
    setRequestDate('')
    setDescription('')
    setSubmitting(false)

    toast.success('Reimbursement request submitted.')
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Employee</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Apply for reimbursement</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Submit expense reimbursements for approval. Requests are stored locally until the backend is connected.
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

        <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  )
}

export default ReimbursementRequestPage
