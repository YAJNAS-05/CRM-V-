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
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Project management</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="mt-2 text-sm text-slate-600">Stay on top of your assigned work, update progress, and log time without switching back to HR.</p>
          </div>
          <Link to="/employee/projects" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Open projects
          </Link>
        </div>
      </div>

      <div className="shell-card p-4">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as WorkspaceTaskStatus | 'ALL')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All statuses</option>
            {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as WorkspacePriority | 'ALL')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All priorities</option>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
            {myTasks.length} task{myTasks.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="shell-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Quick time log</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr,1fr,0.7fr,1.2fr]">
          <select value={taskId} onChange={(event) => setTaskId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select task</option>
            {myTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
          <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" min="0" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Hours" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button type="button" onClick={handleLogTime} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Log Time</button>
        </div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Optional note for the logged work" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>

      <div className="shell-card overflow-hidden">
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
                <tr key={task.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">Task Creator: {task.creatorName || task.assigneeName}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{projectLookup.get(task.projectId)?.name || 'Project'}</td>
                  <td className="px-4 py-4">
                    {canEditTask(task.id) ? (
                      <select value={task.status} onChange={(event) => { moveTask(task.id, event.target.value as WorkspaceTaskStatus); toast.success('Task status updated') }} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                        {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">{task.status.replace(/_/g, ' ')}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{task.priority}</td>
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
                <input value={taskForm.title} onChange={(event) => setTaskForm((state) => ({ ...state, title: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={taskForm.description} onChange={(event) => setTaskForm((state) => ({ ...state, description: event.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={taskForm.status} onChange={(event) => setTaskForm((state) => ({ ...state, status: event.target.value as WorkspaceTaskStatus }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {(['TODO', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE'] as WorkspaceTaskStatus[]).map((status) => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={taskForm.priority} onChange={(event) => setTaskForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due date</label>
                <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((state) => ({ ...state, dueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Estimate (hours)</label>
                <input type="number" min="0" step="0.25" value={taskForm.estimateHours} onChange={(event) => setTaskForm((state) => ({ ...state, estimateHours: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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

export default MyTasksPage