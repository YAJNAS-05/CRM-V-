import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Candidate, CandidateStage } from '../../types/hr'

const STAGES: { key: CandidateStage; label: string; color: string }[] = [
  { key: 'SOURCED', label: 'Sourced', color: 'bg-slate-100 text-slate-700' },
  { key: 'SCREENING', label: 'Screening', color: 'bg-blue-50 text-blue-700' },
  { key: 'INTERVIEW', label: 'Interview', color: 'bg-purple-50 text-purple-700' },
  { key: 'OFFER', label: 'Offer', color: 'bg-amber-50 text-amber-700' },
  { key: 'HIRED', label: 'Hired', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-50 text-red-700' },
]

const SAMPLE_CANDIDATES: Candidate[] = [
  { id: '1', firstName: 'Alice', lastName: 'Chen', email: 'alice.chen@example.com', stage: 'SCREENING', source: 'LinkedIn', positionTitle: 'Senior Engineer', phone: '+61 400 111 222', createdAt: '2026-04-01T00:00:00Z' },
  { id: '2', firstName: 'Bob', lastName: 'Patel', email: 'bob.patel@example.com', stage: 'INTERVIEW', source: 'Referral', positionTitle: 'Product Manager', phone: '+61 400 333 444', createdAt: '2026-04-05T00:00:00Z' },
  { id: '3', firstName: 'Carol', lastName: 'Kim', email: 'carol.kim@example.com', stage: 'OFFER', source: 'Indeed', positionTitle: 'UX Designer', phone: '+61 400 555 666', createdAt: '2026-04-08T00:00:00Z' },
  { id: '4', firstName: 'David', lastName: 'Osei', email: 'david.osei@example.com', stage: 'SOURCED', source: 'Job Board', positionTitle: 'DevOps Engineer', createdAt: '2026-04-12T00:00:00Z' },
  { id: '5', firstName: 'Eva', lastName: 'Santos', email: 'eva.santos@example.com', stage: 'HIRED', source: 'LinkedIn', positionTitle: 'HR Specialist', createdAt: '2026-03-20T00:00:00Z' },
]

type NewCandidateForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  positionTitle: string
  source: string
}

const EMPTY_FORM: NewCandidateForm = { firstName: '', lastName: '', email: '', phone: '', positionTitle: '', source: '' }

const CandidatePipelinePage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(SAMPLE_CANDIDATES)
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [form, setForm] = useState<NewCandidateForm>(EMPTY_FORM)
  const [selectedStage, setSelectedStage] = useState<CandidateStage | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = candidates.filter((c) => {
    const matchStage = selectedStage === 'ALL' || c.stage === selectedStage
    const matchSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.positionTitle || '').toLowerCase().includes(search.toLowerCase())
    return matchStage && matchSearch
  })

  const byStage = (stage: CandidateStage) => filtered.filter((c) => c.stage === stage)

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (stage: CandidateStage) => {
    if (!draggedId) return
    setCandidates((prev) => prev.map((c) => c.id === draggedId ? { ...c, stage } : c))
    toast.success(`Candidate moved to ${stage}`)
    setDraggedId(null)
  }

  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required')
      return
    }
    const newCandidate: Candidate = {
      id: String(Date.now()),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || null,
      positionTitle: form.positionTitle || null,
      source: form.source || null,
      stage: 'SOURCED',
      createdAt: new Date().toISOString(),
    }
    setCandidates((prev) => [newCandidate, ...prev])
    toast.success('Candidate added')
    setShowAddModal(false)
    setForm(EMPTY_FORM)
  }

  const stageConfig = STAGES.reduce(
    (acc, s) => { acc[s.key] = s; return acc },
    {} as Record<CandidateStage, (typeof STAGES)[0]>,
  )

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Recruitment</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Candidate Pipeline</h1>
            <p className="text-sm text-slate-600 mt-1">Drag cards across stages to advance candidates.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/hr/offer-letters" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Offer Letters</Link>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Add Candidate
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-64"
          />
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as CandidateStage | 'ALL')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All Stages</option>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {STAGES.map((s) => (
          <div key={s.key} className="shell-card p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{candidates.filter((c) => c.stage === s.key).length}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.filter((s) => s.key !== 'REJECTED').map((s) => (
            <div
              key={s.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(s.key)}
              className="w-64 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                <span className="text-xs text-slate-400">{byStage(s.key).length}</span>
              </div>
              <div className="space-y-2">
                {byStage(s.key).map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart(c.id)}
                    className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <p className="text-sm font-semibold text-slate-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.positionTitle || 'Position TBD'}</p>
                    {c.source && <p className="text-[10px] text-slate-400 mt-1">via {c.source}</p>}
                    <div className="mt-2 flex gap-1">
                      <Link
                        to={`/hr/candidates/${c.id}/scorecard`}
                        className="rounded px-2 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-700 hover:bg-purple-100"
                      >
                        Scorecard
                      </Link>
                    </div>
                  </div>
                ))}
                {byStage(s.key).length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">Drop here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Add Candidate</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(['firstName', 'lastName'] as const).map((f) => (
                <div key={f}>
                  <label className="block text-xs font-medium text-slate-700 capitalize">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form[f]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                  />
                </div>
              ))}
              {(['email', 'phone', 'positionTitle', 'source'] as const).map((f) => (
                <div key={f} className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 capitalize">
                    {f === 'positionTitle' ? 'Position Applied' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form[f]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM) }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidatePipelinePage
