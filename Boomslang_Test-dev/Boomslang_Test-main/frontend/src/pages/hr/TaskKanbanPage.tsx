import React, { useState } from 'react'
import { toast } from 'sonner'
import { Task, TaskStatus, TaskPriority } from '../../types/hr'

const COLUMNS: { key: TaskStatus; label: string; headerColor: string }[] = [
  { key: 'BACKLOG', label: 'Backlog', headerColor: 'bg-slate-100 text-slate-600' },
  { key: 'TODO', label: 'To Do', headerColor: 'bg-blue-50 text-blue-700' },
  { key: 'IN_PROGRESS', label: 'In Progress', headerColor: 'bg-amber-50 text-amber-700' },
  { key: 'REVIEW', label: 'Review', headerColor: 'bg-purple-50 text-purple-700' },
  { key: 'DONE', label: 'Done', headerColor: 'bg-emerald-50 text-emerald-700' },
]

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-amber-50 text-amber-600',
  CRITICAL: 'bg-red-50 text-red-600',
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Define Q2 OKRs', status: 'DONE', priority: 'HIGH', assigneeName: 'Anita Singh', dueDate: '2026-04-01', storyPoints: 3 },
  { id: '2', title: 'Update employee handbook', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeName: 'Bob Chen', dueDate: '2026-04-20', storyPoints: 5 },
  { id: '3', title: 'Set up onboarding workflow', status: 'IN_PROGRESS', priority: 'HIGH', assigneeName: 'Carol Kim', dueDate: '2026-04-18', storyPoints: 8 },
  { id: '4', title: 'Payroll audit for Q1', status: 'REVIEW', priority: 'CRITICAL', assigneeName: 'David Osei', dueDate: '2026-04-15', storyPoints: 5 },
  { id: '5', title: 'HR tech vendor evaluation', status: 'TODO', priority: 'MEDIUM', assigneeName: 'Eva Santos', dueDate: '2026-04-30', storyPoints: 13 },
  { id: '6', title: 'Policy compliance training', status: 'BACKLOG', priority: 'LOW', storyPoints: 8 },
  { id: '7', title: 'Revise leave policy document', status: 'TODO', priority: 'MEDIUM', assigneeName: 'Anita Singh', dueDate: '2026-05-01', storyPoints: 3 },
  { id: '8', title: 'Recruitment pipeline review', status: 'BACKLOG', priority: 'HIGH', storyPoints: 5 },
]

type TaskForm = { title: string; priority: TaskPriority; assigneeName: string; dueDate: string; storyPoints: number; status: TaskStatus }
const EMPTY_FORM: TaskForm = { title: '', priority: 'MEDIUM', assigneeName: '', dueDate: '', storyPoints: 1, status: 'TODO' }

const TaskKanbanPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (status: TaskStatus) => {
    if (!draggedId) return
    const task = tasks.find((t) => t.id === draggedId)
    if (task && task.status !== status) {
      setTasks((prev) => prev.map((t) => t.id === draggedId ? { ...t, status } : t))
      toast.success(`Task moved to ${status.replace(/_/g, ' ')}`)
    }
    setDraggedId(null)
  }

  const openAdd = (defaultStatus: TaskStatus = 'TODO') => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, status: defaultStatus })
    setShowModal(true)
  }

  const openEdit = (t: Task) => {
    setEditingId(t.id)
    setForm({ title: t.title, priority: t.priority, assigneeName: t.assigneeName || '', dueDate: t.dueDate || '', storyPoints: t.storyPoints || 1, status: t.status })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return }
    if (editingId) {
      setTasks((prev) => prev.map((t) => t.id === editingId ? { ...t, ...form } : t))
      toast.success('Task updated')
    } else {
      setTasks((prev) => [{ id: String(Date.now()), ...form, createdAt: new Date().toISOString() }, ...prev])
      toast.success('Task created')
    }
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast.success('Task deleted')
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Project</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Task Board</h1>
            <p className="text-sm text-slate-600 mt-1">Drag tasks between columns to update status.</p>
          </div>
          <button
            type="button"
            onClick={() => openAdd()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => (
          <div key={col.key} className="shell-card p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{byStatus(col.key).length}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{col.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
              className="w-64 rounded-xl border border-slate-200 bg-slate-50 flex flex-col"
            >
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${col.headerColor}`}>
                <span className="text-xs font-semibold">{col.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-70">{byStatus(col.key).length}</span>
                  <button
                    type="button"
                    onClick={() => openAdd(col.key)}
                    className="ml-1 text-lg leading-none opacity-60 hover:opacity-100"
                    title="Add task here"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 flex-1">
                {byStatus(col.key).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing select-none"
                  >
                    <p className="text-xs font-semibold text-slate-900 mb-2 leading-tight">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.storyPoints != null && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5">{task.storyPoints}pt</span>
                      )}
                    </div>
                    {task.assigneeName && <p className="text-[10px] text-slate-500 mt-1.5">👤 {task.assigneeName}</p>}
                    {task.dueDate && <p className="text-[10px] text-slate-400">📅 {task.dueDate}</p>}
                    <div className="flex gap-1 mt-2 pt-1 border-t border-slate-50">
                      <button type="button" onClick={() => openEdit(task)} className="text-[10px] text-slate-400 hover:text-slate-700">Edit</button>
                      <span className="text-slate-200">·</span>
                      <button type="button" onClick={() => handleDelete(task.id)} className="text-[10px] text-red-400 hover:text-red-600">Del</button>
                    </div>
                  </div>
                ))}
                {byStatus(col.key).length === 0 && (
                  <p className="text-center text-xs text-slate-300 py-8">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Task' : 'New Task'}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Title *</label>
                <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Priority</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}>
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Status</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}>
                    {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Assignee</label>
                  <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.assigneeName} onChange={(e) => setForm((p) => ({ ...p, assigneeName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Due Date</label>
                  <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Story Points</label>
                  <input type="number" min={1} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={form.storyPoints} onChange={(e) => setForm((p) => ({ ...p, storyPoints: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskKanbanPage
