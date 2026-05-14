import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeeApi, onboardingTaskApi } from '../../api/hrApi'
import { OnboardingTask, OnboardingTaskStatus } from '../../types/hr'
import { useAuthStore } from '../../store/authStore'

const CATEGORIES = ['IT Setup', 'HR Paperwork', 'Training', 'Access', 'Equipment', 'Compliance', 'Buddy/Mentor']

const STATUS_COLORS: Record<OnboardingTaskStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

type TaskForm = { title: string; category: string; dueDate: string; description: string; assignedTo: string }
const EMPTY_FORM: TaskForm = { title: '', category: CATEGORIES[0], dueDate: '', description: '', assignedTo: '' }

const OnboardingTasksPage: React.FC = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState<OnboardingTaskStatus | 'ALL'>('ALL')
  const [filterCat, setFilterCat] = useState<string>('ALL')

  const { data: employeeData } = useQuery({
    queryKey: ['onboarding-employee', user?.id, user?.email],
    queryFn: () => employeeApi.getAll(0, 1, { search: user?.email }),
    enabled: Boolean(user?.id && user?.email),
  })

  const employeeId = employeeData?.data?.data?.content?.[0]?.id as string | undefined

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-tasks', employeeId],
    queryFn: () => onboardingTaskApi.getAll(0, 200, { employeeId }),
    enabled: Boolean(employeeId),
  })

  const createMutation = useMutation({
    mutationFn: (payload: Omit<OnboardingTask, 'id' | 'createdAt'>) => onboardingTaskApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] })
      toast.success('Task added')
      setShowAddModal(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error('Failed to add onboarding task'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<OnboardingTask> }) => onboardingTaskApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] })
    },
    onError: () => toast.error('Failed to update onboarding task'),
  })

  const tasks = useMemo(() => data?.data?.data?.content ?? [], [data])

  const filtered = tasks.filter((t: OnboardingTask) => {
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus
    const matchCat = filterCat === 'ALL' || t.category === filterCat
    return matchStatus && matchCat
  })

  const done = tasks.filter((t: OnboardingTask) => t.status === 'DONE').length
  const completion = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const updateStatus = (task: OnboardingTask, status: OnboardingTaskStatus) => {
    updateMutation.mutate({
      id: task.id,
      payload: {
        status,
        completedAt: status === 'DONE' ? new Date().toISOString().slice(0, 10) : null,
      },
    })
    toast.success(`Task marked as ${status.replace(/_/g, ' ')}`)
  }

  const handleAdd = () => {
    if (!employeeId) {
      toast.error('No employee profile linked to this account')
      return
    }
    if (!form.title.trim()) {
      toast.error('Task title is required')
      return
    }

    createMutation.mutate({
      employeeId,
      title: form.title,
      description: form.description || null,
      category: form.category,
      dueDate: form.dueDate || null,
      status: 'PENDING',
      assignedTo: form.assignedTo || null,
      completedAt: null,
    })
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

      <div className="grid grid-cols-3 gap-4">
        {(['PENDING', 'IN_PROGRESS', 'DONE'] as OnboardingTaskStatus[]).map((s) => (
          <div key={s} className="shell-card p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{tasks.filter((t: OnboardingTask) => t.status === s).length}</p>
            <p className="text-xs text-slate-500 mt-1">{s.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

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

      {isLoading ? (
        <div className="shell-card p-12 text-center text-slate-400">Loading tasks...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task: OnboardingTask) => (
            <div key={task.id} className="shell-card p-4 flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.status === 'DONE'}
                onChange={(e) => updateStatus(task, e.target.checked ? 'DONE' : 'PENDING')}
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
                    onClick={() => updateStatus(task, 'IN_PROGRESS')}
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
      )}

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
              <button type="button" onClick={handleAdd} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700" disabled={createMutation.isPending}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingTasksPage
