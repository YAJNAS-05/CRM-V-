import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { trainingApi } from '../../api/hrApi'
import { Training, TrainingStatus } from '../../types/hr'
import { toast } from 'sonner'

const STATUS_COLORS: Record<TrainingStatus, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const TrainingListPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['trainings', page, search, statusFilter],
    queryFn: () =>
      trainingApi.getAll(page, 20, {
        search: search || undefined,
        status: (statusFilter as TrainingStatus) || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: trainingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      toast.success('Training deleted')
    },
    onError: () => toast.error('Failed to delete training'),
  })

  const trainings = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training Sessions</h1>
          <p className="text-sm text-slate-500">Manage and track all employee training</p>
        </div>
        <Link
          to="/hr/trainings/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Training
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search trainings..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as TrainingStatus | ''); setPage(0) }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No training sessions found
                  </td>
                </tr>
              ) : (
                trainings.map((t: Training) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link to={`/hr/trainings/${t.id}`} className="font-semibold text-blue-600 hover:underline">
                        {t.title}
                      </Link>
                      {t.location && <p className="text-xs text-slate-400">{t.location}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{t.trainerName ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {t.startDate ?? '—'} {t.endDate && t.startDate !== t.endDate ? `→ ${t.endDate}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{t.maxParticipants ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/hr/trainings/${t.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Delete this training?')) deleteMutation.mutate(t.id)
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

export default TrainingListPage
