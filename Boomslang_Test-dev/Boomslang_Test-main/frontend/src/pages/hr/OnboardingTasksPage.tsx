import React, { useState } from 'react'
import { toast } from 'sonner'
import { OnboardingTask, OnboardingTaskStatus } from '../../types/hr'

const CATEGORIES = ['IT Setup', 'HR Paperwork', 'Training', 'Access', 'Equipment', 'Compliance', 'Buddy/Mentor']

const STATUS_COLORS: Record<OnboardingTaskStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

const INITIAL_TASKS: OnboardingTask[] = [
  { id: '1', employeeId: 'emp1', title: 'Send welcome email', category: 'HR Paperwork', status: 'DONE', dueDate: '2026-05-01', completedAt: '2026-05-01T09:00:00Z', createdAt: '2026-04-28T00:00:00Z' },
  { id: '2', employeeId: 'emp1', title: 'Set up laptop and accounts', category: 'IT Setup', status: 'DONE', dueDate: '2026-05-01', completedAt: '2026-05-01T14:00:00Z', createdAt: '2026-04-28T00:00:00Z' },
  { id: '3', employeeId: 'emp1', title: 'Assign buddy / mentor', category: 'Buddy/Mentor', status: 'IN_PROGRESS', dueDate: '2026-05-02', createdAt: '2026-04-28T00:00:00Z' },
  { id: '4', employeeId: 'emp1', title: 'Complete WHS induction', category: 'Compliance', status: 'PENDING', dueDate: '2026-05-03', createdAt: '2026-04-28T00:00:00Z' },
  { id: '5', employeeId: 'emp1', title: 'Provision security access badge', category: 'Access', status: 'PENDING', dueDate: '2026-05-02', createdAt: '2026-04-28T00:00:00Z' },
  { id: '6', employeeId: 'emp1', title: 'Enrol in mandatory training', category: 'Training', status: 'PENDING', dueDate: '2026-05-05', createdAt: '2026-04-28T00:00:00Z' },
  { id: '7', employeeId: 'emp1', title: 'Sign employment contract & NDA', category: 'HR Paperwork', status: 'DONE', dueDate: '2026-04-30', completedAt: '2026-04-29T11:00:00Z', createdAt: '2026-04-28T00:00:00Z' },
  { id: '8', employeeId: 'emp1', title: 'Issue equipment (laptop, phone)', category: 'Equipment', status: 'IN_PROGRESS', dueDate: '2026-05-01', createdAt: '2026-04-28T00:00:00Z' },
]

type TaskForm = { title: string; category: string; dueDate: string; description: string; assignedTo: string }
const EMPTY_FORM: TaskForm = { title: '', category: CATEGORIES[0], dueDate: '', description: '', assignedTo: '' }

const OnboardingTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<OnboardingTask[]>(INITIAL_TASKS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState<OnboardingTaskStatus | 'ALL'>('ALL')
  const [filterCat, setFilterCat] = useState<string>('ALL')

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus
    const matchCat = filterCat === 'ALL' || t.category === filterCat
    return matchStatus && matchCat
  })

  const done = tasks.filter((t) => t.status === 'DONE').length
  const completion = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const updateStatus = (id: string, status: OnboardingTaskStatus) => {
    setTasks((prev) => prev.map((t) =>
      t.id === id
        ? { ...t, status, completedAt: status === 'DONE' ? new Date().toISOString() : undefined }
        : t,
    ))
    toast.success(`Task marked as ${status.replace(/_/g, ' ')}`)
  }

  const handleAdd = () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return }
    const newTask: OnboardingTask = {
      id: String(Date.now()),
      employeeId: 'emp1',
      title: form.title,
      description: form.description || null,
      category: form.category,
      dueDate: form.dueDate || null,
      status: 'PENDING',
      assignedTo: form.assignedTo || null,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    toast.success('Task added')
    setShowAddModal(false)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Onboarding</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Onboarding Checklist</h1>
            <p className="text-sm text-slate-600 mt-1">Track tasks for new hire onboarding journeys.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Progress summary */}
      <div className="shell-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Overall Completion</p>
          <p className="text-sm font-bold text-slate-900">{done}/{tasks.length} tasks complete</p>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{completion}% complete</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {(['PENDING', 'IN_PROGRESS', 'DONE'] as OnboardingTaskStatus[]).map((s) => (
          <div key={s} className="shell-card p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{tasks.filter((t) => t.status === s).length}</p>
            <p className="text-xs text-slate-500 mt-1">{s.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OnboardingTaskStatus | 'ALL')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All Statuses</option>
          {(['PENDING', 'IN_PROGRESS', 'DONE'] as OnboardingTaskStatus[]).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className="shell-card p-4 flex items-center gap-4">
            <input
              type="checkbox"
              checked={task.status === 'DONE'}
              onChange={(e) => updateStatus(task.id, e.target.checked ? 'DONE' : 'PENDING')}
              className="h-5 w-5 accent-indigo-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-slate-500">{task.category}</span>
                {task.dueDate && <span className="text-xs text-slate-400">Due {task.dueDate}</span>}
                {task.assignedTo && <span className="text-xs text-slate-400">→ {task.assignedTo}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[task.status]}`}>
                {task.status.replace(/_/g, ' ')}
              </span>
              {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                <button
                  type="button"
                  onClick={() => updateStatus(task.id, 'IN_PROGRESS')}
                  className="rounded px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="shell-card p-12 text-center text-slate-400">No tasks match the filters.</div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Add Onboarding Task</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Title *</label>
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Category</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Due Date</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Assigned To</label>
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Name or team" value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Notes</label>
                <textarea rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleAdd} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingTasksPage
