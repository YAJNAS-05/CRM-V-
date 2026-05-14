import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { InterviewScorecard } from '../../types/hr'

const RECOMMENDATION_OPTIONS = [
  { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'HIRE', label: 'Hire', color: 'bg-green-100 text-green-800' },
  { value: 'NEUTRAL', label: 'Neutral', color: 'bg-amber-100 text-amber-800' },
  { value: 'NO_HIRE', label: 'No Hire', color: 'bg-red-100 text-red-800' },
  { value: 'STRONG_NO_HIRE', label: 'Strong No Hire', color: 'bg-rose-100 text-rose-800' },
]

const StarRating: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({ value, onChange, label }) => (
  <div>
    <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${star <= value ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-xs text-slate-500 self-center">{value}/5</span>
    </div>
  </div>
)

const InterviewScorecardPage: React.FC = () => {
  const { id: candidateId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [scorecard, setScorecard] = useState<Partial<InterviewScorecard>>({
    candidateId: candidateId || '',
    interviewDate: new Date().toISOString().split('T')[0],
    overallRating: 3,
    technicalScore: 3,
    communicationScore: 3,
    cultureFitScore: 3,
    recommendation: 'NEUTRAL',
    strengths: '',
    weaknesses: '',
    notes: '',
  })

  const update = <K extends keyof InterviewScorecard>(key: K, value: InterviewScorecard[K]) =>
    setScorecard((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (!scorecard.interviewDate || !scorecard.overallRating) {
      toast.error('Please fill in required fields')
      return
    }
    // In production this would call an API
    toast.success('Scorecard submitted successfully')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="shell-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Scorecard Submitted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Interview scorecard for Candidate #{candidateId?.slice(0, 8)} has been saved.
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          Recommendation: {scorecard.recommendation?.replace(/_/g, ' ')}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/hr/candidates')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Pipeline
          </button>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Scorecard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Recruitment</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Interview Scorecard</h1>
            <p className="text-sm text-slate-500">Candidate #{candidateId?.slice(0, 8)}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/hr/candidates')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Pipeline
          </button>
        </div>
      </div>

      <div className="shell-card p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Interview Date *</label>
            <input
              type="date"
              value={scorecard.interviewDate || ''}
              onChange={(e) => update('interviewDate', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Interviewer ID</label>
            <input
              type="text"
              value={scorecard.interviewerId || ''}
              onChange={(e) => update('interviewerId', e.target.value)}
              placeholder="Your employee ID"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StarRating label="Overall Rating *" value={scorecard.overallRating || 3} onChange={(v) => update('overallRating', v)} />
          <StarRating label="Technical Skills" value={scorecard.technicalScore || 3} onChange={(v) => update('technicalScore', v)} />
          <StarRating label="Communication" value={scorecard.communicationScore || 3} onChange={(v) => update('communicationScore', v)} />
          <StarRating label="Culture Fit" value={scorecard.cultureFitScore || 3} onChange={(v) => update('cultureFitScore', v)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-2">Recommendation *</label>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('recommendation', opt.value as InterviewScorecard['recommendation'])}
                className={`rounded-full px-3 py-1 text-sm font-semibold border-2 transition ${
                  scorecard.recommendation === opt.value
                    ? `${opt.color} border-current`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Key Strengths</label>
            <textarea
              rows={4}
              value={scorecard.strengths || ''}
              onChange={(e) => update('strengths', e.target.value)}
              placeholder="What stood out positively..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Development Areas</label>
            <textarea
              rows={4}
              value={scorecard.weaknesses || ''}
              onChange={(e) => update('weaknesses', e.target.value)}
              placeholder="Areas of concern or growth..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">Additional Notes</label>
          <textarea
            rows={3}
            value={scorecard.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Any additional context for the hiring committee..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/hr/candidates')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Submit Scorecard
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterviewScorecardPage
