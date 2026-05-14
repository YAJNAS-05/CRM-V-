import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import useEmployeeTimeLogger from '../../hooks/useEmployeeTimeLogger'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import {
  useEmployeeWorkspaceStore,
  type WorkspacePriority,
  type WorkspaceTaskStatus,
} from '../../store/employeeWorkspaceStore'

const TASK_STATUS_STYLES: Record<WorkspaceTaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  ON_HOLD: 'bg-amber-50 text-amber-700',
  IN_REVIEW: 'bg-violet-50 text-violet-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

const TASK_PRIORITY_STYLES: Record<WorkspacePriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-sky-50 text-sky-700',
  HIGH: 'bg-amber-50 text-amber-700',
  CRITICAL: 'bg-rose-50 text-rose-700',
}

type TaskEditFormState = {
  title: string
  description: string
  status: WorkspaceTaskStatus
  priority: WorkspacePriority
  dueDate: string
  estimateHours: string
}

const EMPTY_TASK_FORM: TaskEditFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  estimateHours: '',
}

const MyTasksPage: React.FC = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const tasks = useEmployeeWorkspaceStore((state) => state.tasks)
  const moveTask = useEmployeeWorkspaceStore((state) => state.moveTask)
  const saveTask = useEmployeeWorkspaceStore((state) => state.saveTask)
  const { logEmployeeTime } = useEmployeeTimeLogger()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkspaceTaskStatus | 'ALL'>('ALL')
  const [projectFilter, setProjectFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState<WorkspacePriority | 'ALL'>('ALL')
  const [taskId, setTaskId] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState<TaskEditFormState>(EMPTY_TASK_FORM)

  const editingTask = useMemo(
    () => (editingTaskId ? tasks.find((task) => task.id === editingTaskId) : null),
    [editingTaskId, tasks],
  )

  const projectLookup = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])

  const myTasks = useMemo(() => {
    if (!workspaceUser) return []
    return tasks
      .filter((task) => task.assigneeId === workspaceUser.id)
      .filter((task) => (statusFilter === 'ALL' ? true : task.status === statusFilter))
      .filter((task) => (projectFilter === 'ALL' ? true : task.projectId === projectFilter))
      .filter((task) => (priorityFilter === 'ALL' ? true : task.priority === priorityFilter))
      .filter((task) => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return true
        return `${task.title} ${task.description || ''}`.toLowerCase().includes(normalizedQuery)
      })
      .sort((left, right) => (left.dueDate || '').localeCompare(right.dueDate || ''))
  }, [priorityFilter, projectFilter, query, statusFilter, tasks, workspaceUser])

  const summary = useMemo(() => {
    const active = myTasks.filter((task) => task.status === 'IN_PROGRESS').length
    const overdue = myTasks.filter((task) => task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()).length
    const logged = myTasks.reduce((total, task) => total + task.loggedHours, 0)
    const completion = myTasks.length === 0 ? 0 : Math.round((myTasks.filter((task) => task.status === 'DONE').length / myTasks.length) * 100)

    return { active, overdue, logged, completion }
  }, [myTasks])

  const canEditTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task || !workspaceUser) return false
    return workspaceUser.id === (task.creatorId || task.assigneeId)
  }

  const handleLogTime = async () => {
    if (!workspaceUser || !taskId || !workDate || !hours) {
      toast.error('Choose a task, date, and hours first')
      return
    }

    const selectedTask = myTasks.find((task) => task.id === taskId) || tasks.find((task) => task.id === taskId)
    if (!selectedTask) {
      toast.error('Task not found')
      return
    }

    const parsedHours = Number(hours)
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      toast.error('Hours must be greater than zero')
      return
    }

    const project = projectLookup.get(selectedTask.projectId)
    if (!project) {
      toast.error('Project not found')
      return
    }

    const result = await logEmployeeTime({
      project,
      taskId: selectedTask.id,
      workDate,
      hours: parsedHours,
      note,
    })

    if (result.error) {
      if (result.localLogged) {
        toast.error('Time logged locally, but HR timesheet sync failed')
      } else {
        toast.error('Failed to log time')
      }
      return
    }

    if (result.apiSynced) {
      toast.success(`Logged ${parsedHours}h to ${selectedTask.title} and synced to HR timesheets`)
    } else {
      toast.success(`Logged ${parsedHours}h to ${selectedTask.title}`)
    }

    setHours('')
    setNote('')
  }

  const openEditTask = (id: string) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    if (!canEditTask(id)) {
      toast.error('Only the task creator can edit this task')
      return
    }
    setEditingTaskId(id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      estimateHours: task.estimateHours ? String(task.estimateHours) : '',
    })
    setShowEditModal(true)
  }

  const handleSaveTask = () => {
    if (!editingTask || !workspaceUser) return
    if (!canEditTask(editingTask.id)) {
      toast.error('Only the task creator can edit this task')
      return
    }
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    saveTask({
      id: editingTask.id,
      projectId: editingTask.projectId,
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      assigneeId: editingTask.assigneeId,
      assigneeName: editingTask.assigneeName,
      creatorId: editingTask.creatorId || editingTask.assigneeId,
      creatorName: editingTask.creatorName || editingTask.assigneeName,
      dueDate: taskForm.dueDate || undefined,
      estimateHours: taskForm.estimateHours ? Number(taskForm.estimateHours) : undefined,
    })

    toast.success('Task updated')
    setShowEditModal(false)
    setEditingTaskId(null)
    setTaskForm(EMPTY_TASK_FORM)
  }

  return (
    <div className="space-y-6">
      <div className="pm-hero p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="pm-section-title">Project management</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">My work queue</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-[15px]">Review assigned work, update status, and log delivery effort from one focused task workspace.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{myTasks.length} assigned tasks</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{summary.active} active now</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{summary.completion}% completion</span>
            </div>
          </div>
          <Link to="/employee/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Open projects
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <TaskMetricCard label="Assigned" value={myTasks.length} detail="Tasks currently visible in your queue" />
          <TaskMetricCard label="In progress" value={summary.active} detail="Execution underway" accent="text-blue-700" />
          <TaskMetricCard label="Logged hours" value={`${summary.logged.toFixed(1)}h`} detail="Captured against your tasks" accent="text-emerald-700" />
          <TaskMetricCard label="Overdue" value={summary.overdue} detail="Tasks past target date and not done" accent={summary.overdue > 0 ? 'text-rose-700' : 'text-slate-900'} />
        </div>
      </div>

      <div className="pm-toolbar p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="pm-input text-sm" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as WorkspaceTaskStatus | 'ALL')} className="pm-select text-sm">
            <option value="ALL">All statuses</option>
            {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="pm-select text-sm">
            <option value="ALL">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as WorkspacePriority | 'ALL')} className="pm-select text-sm">
            <option value="ALL">All priorities</option>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            {myTasks.length} task{myTasks.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="pm-grid-card p-5 md:p-6">
        <p className="pm-section-title">Quick time log</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Capture effort without leaving your queue</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr,1fr,0.7fr,1.2fr]">
          <select value={taskId} onChange={(event) => setTaskId(event.target.value)} className="pm-select text-sm">
            <option value="">Select task</option>
            {myTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
          <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="pm-input text-sm" />
          <input type="number" min="0" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Hours" className="pm-input text-sm" />
          <button type="button" onClick={handleLogTime} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Log Time</button>
        </div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Optional note for the logged work" className="pm-textarea mt-3 text-sm" />
      </div>

      <div className="pm-grid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Logged</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">Task Creator: {task.creatorName || task.assigneeName}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{projectLookup.get(task.projectId)?.name || 'Project'}</td>
                  <td className="px-4 py-4">
                    {canEditTask(task.id) ? (
                      <select value={task.status} onChange={(event) => { moveTask(task.id, event.target.value as WorkspaceTaskStatus); toast.success('Task status updated') }} className={`rounded-lg border border-transparent px-2 py-1 text-xs font-semibold ${TASK_STATUS_STYLES[task.status]}`}>
                        {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                      </select>
                    ) : (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TASK_STATUS_STYLES[task.status]}`}>{task.status.replace(/_/g, ' ')}</span>
                    )}
                  </td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TASK_PRIORITY_STYLES[task.priority]}`}>{task.priority}</span></td>
                  <td className="px-4 py-4 text-slate-600">{task.dueDate || 'TBD'}</td>
                  <td className="px-4 py-4 text-slate-600">{task.loggedHours.toFixed(1)}h / {task.estimateHours || 0}h</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-3">
                      {canEditTask(task.id) ? (
                        <button type="button" onClick={() => openEditTask(task.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                      ) : (
                        <span className="text-xs text-slate-400">Creator only</span>
                      )}
                      <Link to={`/employee/projects/${task.projectId}`} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Open project</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {myTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No tasks match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Edit task</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Title</label>
                <input value={taskForm.title} onChange={(event) => setTaskForm((state) => ({ ...state, title: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={taskForm.description} onChange={(event) => setTaskForm((state) => ({ ...state, description: event.target.value }))} rows={3} className="pm-textarea mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={taskForm.status} onChange={(event) => setTaskForm((state) => ({ ...state, status: event.target.value as WorkspaceTaskStatus }))} className="pm-select mt-1 text-sm">
                  {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={taskForm.priority} onChange={(event) => setTaskForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="pm-select mt-1 text-sm">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due date</label>
                <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((state) => ({ ...state, dueDate: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Estimate (hours)</label>
                <input type="number" min="0" step="0.25" value={taskForm.estimateHours} onChange={(event) => setTaskForm((state) => ({ ...state, estimateHours: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowEditModal(false); setEditingTaskId(null); setTaskForm(EMPTY_TASK_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSaveTask} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TaskMetricCard = ({
  label,
  value,
  detail,
  accent = 'text-slate-900',
}: {
  label: string
  value: string | number
  detail: string
  accent?: string
}) => (
  <div className="pm-stat-card p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className={`pm-metric-value mt-3 ${accent}`}>{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </div>
)

export default MyTasksPage