import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApi, taskApi } from '../../api/pmApi'
import { employeeApi } from '../../api/hrApi'
import { useAuthStore } from '../../store/authStore'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionLabel } from '../../utils/optionSet'
import { ProjectStatus } from '../../types/pm'
import { Task, TaskStatus, TaskPriority } from '../../types/hr'

const FALLBACK_TASK_STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'BACKLOG', 'REVIEW', 'DONE']
const FALLBACK_PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE']
const FALLBACK_PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const TASK_STATUS_TONES: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  BACKLOG: 'bg-amber-50 text-amber-700',
  REVIEW: 'bg-purple-50 text-purple-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-amber-50 text-amber-700',
  CRITICAL: 'bg-rose-50 text-rose-700',
}

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string
  storyPoints: string
}

const EMPTY_TASK_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
  storyPoints: '',
}

type MemberFormState = {
  employeeId: string
  role: string
}

const EMPTY_MEMBER_FORM: MemberFormState = {
  employeeId: '',
  role: 'MEMBER',
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'members'>('board')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormState>(EMPTY_TASK_FORM)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [memberForm, setMemberForm] = useState<MemberFormState>(EMPTY_MEMBER_FORM)
  const [employeeSearch, setEmployeeSearch] = useState('')

  const { options: taskStatusOptions } = useOptionSet({
    module: 'PM',
    entity: 'TASK',
    field: 'status',
    fallbackValues: FALLBACK_TASK_STATUS_OPTIONS,
  })

  const { options: taskPriorityOptions } = useOptionSet({
    module: 'PM',
    entity: 'TASK',
    field: 'priority',
    fallbackValues: FALLBACK_PRIORITY_OPTIONS,
  })

  const { options: projectStatusOptions } = useOptionSet({
    module: 'PM',
    entity: 'PROJECT',
    field: 'status',
    fallbackValues: FALLBACK_PROJECT_STATUS_OPTIONS,
  })

  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    queryKey: ['pm-project', id],
    queryFn: () => projectApi.getById(id!),
    enabled: !!id,
  })

  const { data: tasksData } = useQuery({
    queryKey: ['pm-tasks', id],
    queryFn: () => taskApi.getAll(0, 500, { projectId: id }),
    enabled: !!id,
  })

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['hr-employees', 'pm-member-search', employeeSearch],
    queryFn: () => employeeApi.getAll(0, 20, { search: employeeSearch }),
    enabled: showMemberModal,
    retry: false,
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => taskApi.create({ ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-tasks', id] })
      toast.success('Task created successfully')
      setShowTaskModal(false)
      setTaskForm(EMPTY_TASK_FORM)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) => taskApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-tasks', id] })
      toast.success('Task updated successfully')
      setShowTaskModal(false)
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
      queryClient.invalidateQueries({ queryKey: ['pm-tasks', id] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-tasks', id] })
      toast.success('Task deleted')
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: (payload: MemberFormState) => projectApi.addMember(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-project', id] })
      toast.success('Member added')
      setShowMemberModal(false)
      setEmployeeSearch('')
      setMemberForm(EMPTY_MEMBER_FORM)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add member')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (employeeId: string) => projectApi.removeMember(id!, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-project', id] })
      toast.success('Member removed')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member')
    },
  })

  const projectDetail = projectData?.data?.data
  const project = projectDetail?.project
  const projectTasks = tasksData?.data?.data?.content || []
  const teamMembers = projectDetail?.members || []

  const { data: memberEmployeesData } = useQuery({
    queryKey: ['pm-project', id, 'member-employees', teamMembers.map((m) => m.employeeId).join(',')],
    queryFn: async () => {
      const memberEmployeeIds = teamMembers.map((m) => m.employeeId).filter(Boolean)
      const results = await Promise.allSettled(memberEmployeeIds.map((employeeId) => employeeApi.getById(employeeId)))
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value.data.data)
        .filter(Boolean)
    },
    enabled: teamMembers.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const memberUserOptions = useMemo(() => {
    const employees = memberEmployeesData || []
    return employees
      .filter((emp: any) => Boolean(emp?.userId))
      .map((emp: any) => ({
        userId: emp.userId as string,
        label: `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || emp.email || emp.id,
      }))
  }, [memberEmployeesData])

  const userNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const opt of memberUserOptions) {
      map.set(opt.userId, opt.label)
    }
    return map
  }, [memberUserOptions])

  const taskColumns = useMemo(
    () => taskStatusOptions.map((option) => ({
      key: option.value as TaskStatus,
      label: option.label || option.value,
      tone: TASK_STATUS_TONES[option.value] || 'bg-slate-100 text-slate-700',
    })),
    [taskStatusOptions],
  )

  if (isLoadingProject) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading project details...</div>
  }

  if (!project) {
    return <div className="shell-card p-8 text-sm text-slate-500">Project not found.</div>
  }

  const projectStatusLabel = getOptionLabel(projectStatusOptions, project.status)

  const openNewTask = (status: TaskStatus = 'TODO') => {
    setEditingTaskId(null)
    setTaskForm({ ...EMPTY_TASK_FORM, status, assigneeId: user?.id || '' })
    setShowTaskModal(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'MEDIUM',
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
      storyPoints: task.storyPoints ? String(task.storyPoints) : '',
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskPayload: Partial<Task> = {
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      assigneeId: taskForm.assigneeId || undefined,
      dueDate: taskForm.dueDate || undefined,
      storyPoints: taskForm.storyPoints ? Number(taskForm.storyPoints) : undefined,
    }

    if (editingTaskId) {
      updateTaskMutation.mutate({ taskId: editingTaskId, data: taskPayload })
    } else {
      createTaskMutation.mutate(taskPayload)
    }
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/pm/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Projects</Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.projectName}</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{project.projectCode}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{projectStatusLabel}</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{project.description || 'No description provided.'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => openNewTask()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Add Task</button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Stat label="Total Tasks" value={projectTasks.length} />
          <Stat label="Team Members" value={teamMembers.length} />
          <Stat label="Budget" value={project.budget ? `${project.currency} ${project.budget.toLocaleString()}` : 'N/A'} />
          <Stat label="Costs" value={projectDetail?.actualCost ? `${project.currency} ${projectDetail.actualCost.toLocaleString()}` : '0'} />
        </div>
      </div>

      <div className="shell-card p-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'board', label: 'Board' },
            { key: 'members', label: 'Members' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'overview' | 'board' | 'members')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Upcoming Tasks</h2>
            <div className="mt-4 space-y-3">
              {projectTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks yet. Start by adding your first task.</p>
              ) : (
                projectTasks.slice().sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {task.assigneeId ? (userNameById.get(task.assigneeId) || task.assigneeId) : 'Unassigned'} · Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      {task.priority && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{getOptionLabel(taskPriorityOptions, task.priority)}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Project Details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">DATES</p>
                <p className="mt-1 text-sm text-slate-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">PROFITABILITY</p>
                <p className="mt-1 text-sm text-slate-900">{projectDetail?.profitMargin ? `${projectDetail.profitMargin.toFixed(1)}%` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="shell-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Team Members</h2>
            <button
              type="button"
              onClick={() => setShowMemberModal(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Add member
            </button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-900 font-semibold">{member.employeeId}</td>
                      <td className="px-4 py-4 text-slate-600">{member.role}</td>
                      <td className="px-4 py-4 text-slate-600">{new Date(member.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Remove this member from the project?')) {
                              removeMemberMutation.mutate(member.employeeId)
                            }
                          }}
                          disabled={removeMemberMutation.isPending}
                          className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No members assigned to this project yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {taskColumns.map((column) => (
              <div
                key={column.key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData('taskId')
                  if (taskId) {
                    const task = projectTasks.find(t => t.id === taskId)
                    if (task && task.status !== column.key) {
                      updateTaskStatusMutation.mutate({ taskId, status: column.key })
                      toast.success(`Task moved to ${column.label}`)
                    }
                  }
                }}
                className="w-80 rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 text-sm font-semibold ${column.tone}`}>
                  <span>{column.label}</span>
                  <button type="button" onClick={() => openNewTask(column.key)} className="text-lg leading-none">+</button>
                </div>
                <div className="space-y-3 p-3">
                  {projectTasks.filter((task) => task.status === column.key).map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id)
                      }}
                      onClick={() => openEditTask(task)}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {task.assigneeId ? (userNameById.get(task.assigneeId) || task.assigneeId) : 'Unassigned'}
                          </p>
                        </div>
                        {task.priority && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{getOptionLabel(taskPriorityOptions, task.priority)}</span>}
                      </div>
                      {task.description && <p className="mt-3 text-sm text-slate-600 line-clamp-2">{task.description}</p>}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}</span>
                        {task.storyPoints ? <span>{task.storyPoints} pts</span> : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            if (confirm('Are you sure you want to delete this task?')) {
                              deleteTaskMutation.mutate(task.id)
                            }
                          }}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {projectTasks.filter((task) => task.status === column.key).length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editingTaskId ? 'Edit Task' : 'Create Task'}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Task Title</label>
                <input value={taskForm.title} onChange={(event) => setTaskForm((state) => ({ ...state, title: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((state) => ({ ...state, dueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Story Points</label>
                <input type="number" value={taskForm.storyPoints} onChange={(event) => setTaskForm((state) => ({ ...state, storyPoints: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
                  {memberUserOptions.map((opt) => (
                    <option key={opt.userId} value={opt.userId}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Assignment is limited to project members with linked user accounts.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={taskForm.description} onChange={(event) => setTaskForm((state) => ({ ...state, description: event.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false)
                  setEditingTaskId(null)
                  setTaskForm(EMPTY_TASK_FORM)
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createTaskMutation.isPending || updateTaskMutation.isPending ? 'Saving...' : editingTaskId ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Add project member</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add an employee to this project using their employee id.
            </p>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Search employees (optional)</label>
                <input
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                  placeholder="Type name, email, or employee id"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
                  {isLoadingEmployees ? (
                    <div>Searching...</div>
                  ) : employeesData?.data?.data?.content?.length ? (
                    <div className="max-h-40 overflow-y-auto">
                      {employeesData.data.data.content.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setMemberForm((state) => ({ ...state, employeeId: emp.id }))}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-white"
                        >
                          <span className="font-semibold text-slate-800">{`${emp.firstName} ${emp.lastName}`.trim() || emp.id}</span>
                          <span className="text-slate-500">{emp.id}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>Type to search employees.</div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Employee ID</label>
                  <input
                    value={memberForm.employeeId}
                    onChange={(event) => setMemberForm((state) => ({ ...state, employeeId: event.target.value }))}
                    placeholder="e.g. EMP-0001"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Project role</label>
                  <select
                    value={memberForm.role}
                    onChange={(event) => setMemberForm((state) => ({ ...state, role: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LEAD">Lead</option>
                    <option value="MANAGER">Manager</option>
                    <option value="OBSERVER">Observer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMemberModal(false)
                  setEmployeeSearch('')
                  setMemberForm(EMPTY_MEMBER_FORM)
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!memberForm.employeeId.trim()) {
                    toast.error('Employee ID is required')
                    return
                  }
                  if (teamMembers.some((m) => m.employeeId === memberForm.employeeId.trim())) {
                    toast.error('This employee is already a member of the project')
                    return
                  }
                  addMemberMutation.mutate({ employeeId: memberForm.employeeId.trim(), role: memberForm.role })
                }}
                disabled={addMemberMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
)

export default ProjectDetailPage
