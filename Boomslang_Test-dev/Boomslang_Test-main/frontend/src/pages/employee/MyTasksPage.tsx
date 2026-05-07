import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { taskApi, projectApi } from '../../api/pmApi'
import { useAuthStore } from '../../store/authStore'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionLabel } from '../../utils/optionSet'
import { Task, TaskStatus, TaskPriority } from '../../types/hr'
import { employeeApi } from '../../api/hrApi'

type TaskEditFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string
  storyPoints: string
}

const EMPTY_TASK_FORM: TaskEditFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
  storyPoints: '',
}

const MyTasksPage: React.FC = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [projectFilter, setProjectFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState<TaskEditFormState>(EMPTY_TASK_FORM)

  const { options: taskStatusOptions } = useOptionSet({
    module: 'PM',
    entity: 'TASK',
    field: 'status',
    fallbackValues: ['TODO', 'IN_PROGRESS', 'BACKLOG', 'REVIEW', 'DONE'],
  })
  const { options: taskPriorityOptions } = useOptionSet({
    module: 'PM',
    entity: 'TASK',
    field: 'priority',
    fallbackValues: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  })

  // Fetch all tasks for the current user
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['pm-my-tasks', user?.id],
    queryFn: () => taskApi.getAll(0, 500, { assigneeId: user?.id }),
    enabled: !!user?.id,
  })

  // Fetch all projects to use for project filtering and names
  const { data: projectsData } = useQuery({
    queryKey: ['pm-projects-all'],
    queryFn: () => projectApi.getAll(0, 500),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) => taskApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-my-tasks', user?.id] })
      toast.success('Task updated successfully')
      setShowEditModal(false)
      setEditingTaskId(null)
      setTaskForm(EMPTY_TASK_FORM)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task')
    },
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-my-tasks', user?.id] })
      toast.success('Task status updated')
    },
  })

  const allTasks = tasksData?.data?.data?.content || []
  const allProjects = projectsData?.data?.data?.content || []
  const projectLookup = new Map(allProjects.map((p) => [p.id, p]))

  const myTasks = allTasks
    .filter((task) => (statusFilter === 'ALL' ? true : task.status === statusFilter))
    .filter((task) => (projectFilter === 'ALL' ? true : task.projectId === projectFilter))
    .filter((task) => (priorityFilter === 'ALL' ? true : task.priority === priorityFilter))
    .filter((task) => {
      const normalizedQuery = query.trim().toLowerCase()
      if (!normalizedQuery) return true
      return `${task.title} ${task.description || ''}`.toLowerCase().includes(normalizedQuery)
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))

  const editingTask = editingTaskId ? allTasks.find((t) => t.id === editingTaskId) : null

  const { data: editingProjectData } = useQuery({
    queryKey: ['pm-project', 'for-task-edit', editingTask?.projectId],
    queryFn: () => projectApi.getById(editingTask!.projectId!),
    enabled: Boolean(editingTask?.projectId),
    retry: false,
  })

  const editingProjectMembers = editingProjectData?.data?.data?.members || []

  const { data: editingMemberEmployeesData } = useQuery({
    queryKey: ['pm-project', editingTask?.projectId, 'member-employees'],
    queryFn: async () => {
      const memberEmployeeIds = editingProjectMembers.map((m: any) => m.employeeId).filter(Boolean)
      const results = await Promise.allSettled(memberEmployeeIds.map((employeeId: string) => employeeApi.getById(employeeId)))
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value.data.data)
        .filter(Boolean)
    },
    enabled: editingProjectMembers.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const assigneeOptions = useMemo(() => {
    const employees = editingMemberEmployeesData || []
    return employees
      .filter((emp: any) => Boolean(emp?.userId))
      .map((emp: any) => ({
        userId: emp.userId as string,
        label: `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || emp.email || emp.id,
      }))
  }, [editingMemberEmployeesData])

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'MEDIUM',
      assigneeId: task.assigneeId || user?.id || '',
      dueDate: task.dueDate || '',
      storyPoints: task.storyPoints ? String(task.storyPoints) : '',
    })
    setShowEditModal(true)
  }

  const handleSaveTask = () => {
    if (!editingTask) return
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    updateTaskMutation.mutate({
      taskId: editingTask.id,
      data: {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        assigneeId: taskForm.assigneeId || undefined,
        dueDate: taskForm.dueDate || undefined,
        storyPoints: taskForm.storyPoints ? Number(taskForm.storyPoints) : undefined,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Project Management</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="mt-2 text-sm text-slate-600">Manage your assigned tasks across all projects.</p>
          </div>
          <Link to="/pm/projects" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View Projects
          </Link>
        </div>
      </div>

      <div className="shell-card p-4">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'ALL')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All statuses</option>
            {taskStatusOptions.map((option) => (
              <option key={option.id} value={option.value}>{option.label || option.value}</option>
            ))}
          </select>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All projects</option>
            {allProjects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | 'ALL')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="ALL">All priorities</option>
            {taskPriorityOptions.map((option) => (
              <option key={option.id} value={option.value}>{option.label || option.value}</option>
            ))}
          </select>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
            {myTasks.length} task{myTasks.length === 1 ? '' : 's'}
          </div>
        </div>
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
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingTasks ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading your tasks...</td>
                </tr>
              ) : myTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No tasks match the current filters.</td>
                </tr>
              ) : (
                myTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      {task.description && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{task.description}</p>}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{projectLookup.get(task.projectId || '')?.projectName || 'Project'}</td>
                    <td className="px-4 py-4">
                      <select
                        value={task.status}
                        onChange={(event) => updateTaskStatusMutation.mutate({ taskId: task.id, status: event.target.value as TaskStatus })}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      >
                        {taskStatusOptions.map((option) => (
                          <option key={option.id} value={option.value}>{option.label || option.value}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{getOptionLabel(taskPriorityOptions, task.priority || 'MEDIUM')}</td>
                    <td className="px-4 py-4 text-slate-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => openEditTask(task)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                        <Link to={`/pm/projects/${task.projectId}`} className="text-sm font-semibold text-slate-600 hover:text-slate-800">View Project</Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Edit Task</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Task Title</label>
                <input value={taskForm.title} onChange={(event) => setTaskForm((state) => ({ ...state, title: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={taskForm.description} onChange={(event) => setTaskForm((state) => ({ ...state, description: event.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={taskForm.status} onChange={(event) => setTaskForm((state) => ({ ...state, status: event.target.value as TaskStatus }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {taskStatusOptions.map((option) => (
                    <option key={option.id} value={option.value}>{option.label || option.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={taskForm.priority} onChange={(event) => setTaskForm((state) => ({ ...state, priority: event.target.value as TaskPriority }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {taskPriorityOptions.map((option) => (
                    <option key={option.id} value={option.value}>{option.label || option.value}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assignee</label>
                <select
                  value={taskForm.assigneeId}
                  onChange={(event) => setTaskForm((state) => ({ ...state, assigneeId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  <option value={user?.id || ''}>Me</option>
                  {assigneeOptions.map((opt) => (
                    <option key={opt.userId} value={opt.userId}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Assignment is limited to members of the project.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((state) => ({ ...state, dueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Estimate Hours</label>
                <input type="number" min="0" step="0.25" value={taskForm.storyPoints} onChange={(event) => setTaskForm((state) => ({ ...state, storyPoints: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowEditModal(false); setEditingTaskId(null); setTaskForm(EMPTY_TASK_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={updateTaskMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTasksPage