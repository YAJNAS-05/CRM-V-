import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offerLetterApi } from '../../api/hrApi'
import { OfferLetter, OfferLetterStatus } from '../../types/hr'
import { toast } from 'sonner'

const STATUS_COLORS: Record<OfferLetterStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

const OfferLetterListPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OfferLetterStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['offer-letters', page, search, statusFilter],
    queryFn: () =>
      offerLetterApi.getAll(page, 20, {
        search: search || undefined,
        status: (statusFilter as OfferLetterStatus) || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: offerLetterApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer-letters'] })
      toast.success('Offer letter deleted')
    },
    onError: () => toast.error('Failed to delete offer letter'),
  })

  const letters = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offer Letters</h1>
          <p className="text-sm text-slate-500">Manage candidate offer letters</p>
        </div>
        <Link
          to="/hr/offer-letters/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Offer Letter
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by candidate name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as OfferLetterStatus | ''); setPage(0) }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Offer Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {letters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No offer letters found
                  </td>
                </tr>
              ) : (
                letters.map((letter: OfferLetter) => (
                  <tr key={letter.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{letter.candidateName}</p>
                      <p className="text-xs text-slate-400">{letter.candidateEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{letter.offerDate ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{letter.expiryDate ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {letter.salary != null ? `${letter.currency ?? 'USD'} ${Number(letter.salary).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[letter.status]}`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/hr/offer-letters/${letter.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Delete this offer letter?')) deleteMutation.mutate(letter.id)
                          }}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default OfferLetterListPage
