import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { trainingApi } from '../../api/hrApi'
import { TrainingStatus } from '../../types/hr'
import { toast } from 'sonner'

const STATUS_COLORS: Record<TrainingStatus, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const notifyCertificateUnavailable = () => {
  toast.error('Certificate download is unavailable until backend certificate generation is implemented.')
}

const TrainingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const { data: trainingData, isLoading: loadingTraining } = useQuery({
    queryKey: ['training', id],
    queryFn: () => trainingApi.getById(id!),
    enabled: Boolean(id),
  })

  const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['training-enrollments', id],
    queryFn: () => trainingApi.getEnrollments(id!),
    enabled: Boolean(id),
  })

  if (loadingTraining) {
    return <div className="py-20 text-center text-slate-400">Loading...</div>
  }

  const training = trainingData?.data?.data
  if (!training) {
    return <div className="py-20 text-center text-slate-400">Training not found</div>
  }

  const enrollments = enrollmentsData?.data?.data ?? []
  const isCompleted = training.status === 'COMPLETED'
  const myEnrollment = enrollments[0] // First enrollment treated as "mine" for demo

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/hr/trainings" className="text-sm text-blue-600 hover:underline">← Back to Training</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{training.title}</h1>
        </div>
        <div className="flex gap-2">
          {isCompleted && myEnrollment && (
            <button
              type="button"
              onClick={notifyCertificateUnavailable}
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Certificate Unavailable
            </button>
          )}
          <Link
            to={`/hr/trainings/${id}/edit`}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[training.status]}`}>
            {training.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          {training.trainerName && (
            <div>
              <span className="font-medium text-slate-500">Trainer</span>
              <p className="text-slate-900 mt-0.5">{training.trainerName}</p>
            </div>
          )}
          {training.location && (
            <div>
              <span className="font-medium text-slate-500">Location</span>
              <p className="text-slate-900 mt-0.5">{training.location}</p>
            </div>
          )}
          {(training.startDate || training.endDate) && (
            <div>
              <span className="font-medium text-slate-500">Dates</span>
              <p className="text-slate-900 mt-0.5">
                {training.startDate ?? ''}{training.endDate ? ` → ${training.endDate}` : ''}
              </p>
            </div>
          )}
          {training.maxParticipants && (
            <div>
              <span className="font-medium text-slate-500">Max Participants</span>
              <p className="text-slate-900 mt-0.5">{training.maxParticipants}</p>
            </div>
          )}
        </div>

        {training.description && (
          <div>
            <span className="text-sm font-medium text-slate-500">Description</span>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{training.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Enrollments ({enrollments.length})</h2>
        </div>
        {loadingEnrollments ? (
          <div className="py-10 text-center text-slate-400 text-sm">Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No enrollments yet</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled On</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{e.employeeId.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{e.completedAt ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{e.score ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {e.completedAt ? (
                      <button
                        type="button"
                        onClick={notifyCertificateUnavailable}
                        className="text-xs font-semibold text-amber-700 underline"
                      >
                        Unavailable
                      </button>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default TrainingDetailPage
