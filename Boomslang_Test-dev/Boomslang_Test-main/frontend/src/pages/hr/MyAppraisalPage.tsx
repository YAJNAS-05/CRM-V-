import React, { useState } from 'react'
import { toast } from 'sonner'
import { AppraisalGoal } from '../../types/hr'

type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED'

const STATUS_COLORS: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  MISSED: 'bg-red-100 text-red-700',
}

const DEPT_GOALS: { id: string; title: string }[] = [
  { id: 'dg1', title: 'Reduce time-to-hire by 20%' },
  { id: 'dg2', title: 'Achieve 90% onboarding completion rate' },
  { id: 'dg3', title: 'Improve team NPS to 65' },
  { id: 'dg4', title: 'Launch performance review cycle Q2' },
]

const INITIAL_GOALS: AppraisalGoal[] = [
  { id: '1', title: 'Complete React Advanced Course', description: 'Finish internal React advanced course', targetDate: '2026-06-30', status: 'IN_PROGRESS', progress: 60, parentGoalId: 'dg3', parentGoalTitle: 'Improve team NPS to 65' },
  { id: '2', title: 'Raise Team NPS', description: 'Contribute to raising NPS from 45 to 60 this quarter', targetDate: '2026-03-31', status: 'COMPLETED', progress: 100, parentGoalId: 'dg3', parentGoalTitle: 'Improve team NPS to 65' },
  { id: '3', title: 'Obtain AWS Certification', description: 'Pass the AWS Cloud Practitioner exam', targetDate: '2026-09-30', status: 'NOT_STARTED', progress: 0 },
  { id: '4', title: 'Lead Sprint Retrospectives', description: 'Facilitate 8 sprint retrospectives and introduce action tracking', targetDate: '2026-12-31', status: 'IN_PROGRESS', progress: 37 },
]

type GoalForm = {
  title: string
  description: string
  targetDate: string
  status: GoalStatus
  progress: number
  parentGoalId: string
}

const EMPTY_FORM: GoalForm = { title: '', description: '', targetDate: '', status: 'NOT_STARTED', progress: 0, parentGoalId: '' }

const GoalCard: React.FC<{
  goal: AppraisalGoal
  onEdit: (g: AppraisalGoal) => void
  onDelete: (id: string) => void
}> = ({ goal, onEdit, onDelete }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 truncate">{goal.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
        {goal.parentGoalTitle && (
          <p className="text-[10px] text-indigo-600 mt-1">↑ {goal.parentGoalTitle}</p>
        )}
      </div>
      <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[goal.status as GoalStatus]}`}>
        {goal.status.replace(/_/g, ' ')}
      </span>
    </div>

    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Progress</span>
        <span>{goal.progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all ${
            goal.status === 'COMPLETED' ? 'bg-emerald-500' : goal.status === 'MISSED' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${goal.progress}%` }}
        />
      </div>
    </div>

    {goal.targetDate && <p className="text-xs text-slate-400">Target: {goal.targetDate}</p>}

    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={() => onEdit(goal)}
        className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(goal.id)}
        className="rounded px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100"
      >
        Delete
      </button>
    </div>
  </div>
)

const MyAppraisalPage: React.FC = () => {
  const [goals, setGoals] = useState<AppraisalGoal[]>(INITIAL_GOALS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM)
  const period = 'Q2 2026'

  const completed = goals.filter((g) => g.status === 'COMPLETED').length
  const inProgress = goals.filter((g) => g.status === 'IN_PROGRESS').length
  const overall = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (g: AppraisalGoal) => {
    setEditingId(g.id)
    setForm({ title: g.title, description: g.description || '', targetDate: g.targetDate || '', status: g.status as GoalStatus, progress: g.progress, parentGoalId: g.parentGoalId || '' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Goal title is required'); return }
    const parentGoal = DEPT_GOALS.find((d) => d.id === form.parentGoalId)
    if (editingId) {
      setGoals((prev) => prev.map((g) => g.id === editingId
        ? { ...g, ...form, parentGoalTitle: parentGoal?.title || undefined }
        : g))
      toast.success('Goal updated')
    } else {
      const newGoal: AppraisalGoal = {
        id: String(Date.now()),
        ...form,
        parentGoalTitle: parentGoal?.title || undefined,
      }
      setGoals((prev) => [newGoal, ...prev])
      toast.success('Goal added')
    }
    setShowModal(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    toast.success('Goal deleted')
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Performance</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">My Appraisal</h1>
            <p className="text-sm text-slate-500 mt-1">Goals and progress for {period}</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Goals', value: goals.length, color: 'text-slate-800' },
          { label: 'Completed', value: completed, color: 'text-emerald-600' },
          { label: 'In Progress', value: inProgress, color: 'text-blue-600' },
          { label: 'Overall', value: `${overall}%`, color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="shell-card p-5 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Dept goals for context */}
      <div className="shell-card p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Department Goals (This Quarter)</h2>
        <div className="flex flex-wrap gap-2">
          {DEPT_GOALS.map((dg) => (
            <span key={dg.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {dg.title}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} />)}
        {goals.length === 0 && (
          <div className="col-span-2 shell-card p-12 text-center">
            <p className="text-slate-500">No goals yet. Click &quot;New Goal&quot; to add one.</p>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Goal' : 'New Goal'}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Title *</label>
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Description</label>
                <textarea rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Target Date</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.targetDate} onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Status</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as GoalStatus }))}>
                    {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED'] as GoalStatus[]).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Progress ({form.progress}%)</label>
                <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm((p) => ({ ...p, progress: Number(e.target.value) }))} className="w-full mt-1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Link to Department Goal</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.parentGoalId} onChange={(e) => setForm((p) => ({ ...p, parentGoalId: e.target.value }))}>
                  <option value="">— No parent goal —</option>
                  {DEPT_GOALS.map((dg) => <option key={dg.id} value={dg.id}>{dg.title}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppraisalPage
