import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { timeEntryApi } from '../../api/hrApi'
import useEmployeeTimeLogger from '../../hooks/useEmployeeTimeLogger'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import {
  useEmployeeWorkspaceStore,
  type WorkspacePriority,
  type WorkspaceProjectStatus,
  type WorkspaceTask,
  type WorkspaceTaskDraft,
  type WorkspaceTaskStatus,
} from '../../store/employeeWorkspaceStore'

const COLUMNS: { key: WorkspaceTaskStatus; label: string; tone: string }[] = [
  { key: 'TODO', label: 'To Do', tone: 'bg-slate-100 text-slate-700' },
  { key: 'IN_PROGRESS', label: 'In Progress', tone: 'bg-blue-50 text-blue-700' },
  { key: 'ON_HOLD', label: 'On Hold', tone: 'bg-amber-50 text-amber-700' },
  { key: 'IN_REVIEW', label: 'In Review', tone: 'bg-purple-50 text-purple-700' },
  { key: 'DONE', label: 'Done', tone: 'bg-emerald-50 text-emerald-700' },
]

const PROJECT_STATUS_OPTIONS: WorkspaceProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE']

const PRIORITY_COLORS: Record<WorkspacePriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-amber-50 text-amber-700',
  CRITICAL: 'bg-rose-50 text-rose-700',
}

const PROJECT_STATUS_COLORS: Record<WorkspaceProjectStatus, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  ON_HOLD: 'bg-amber-50 text-amber-700',
  IN_REVIEW: 'bg-violet-50 text-violet-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

type TaskFormState = {
  title: string
  description: string
  status: WorkspaceTaskStatus
  priority: WorkspacePriority
  assigneeName: string
  dueDate: string
  estimateHours: string
}

type ProjectFormState = {
  name: string
  client: string
  product: string
  description: string
  status: WorkspaceProjectStatus
  priority: WorkspacePriority
  dueDate: string
}

type TimeLogState = {
  taskId: string
  workDate: string
  hours: string
  note: string
}

const EMPTY_TASK_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeName: '',
  dueDate: '',
  estimateHours: '',
}

const EMPTY_TIME_LOG: TimeLogState = {
  taskId: '',
  workDate: new Date().toISOString().split('T')[0],
  hours: '',
  note: '',
}

const EMPTY_PROJECT_FORM: ProjectFormState = {
  name: '',
  client: '',
  product: '',
  description: '',
  status: 'PLANNING',
  priority: 'MEDIUM',
  dueDate: '',
}

const slugName = (value: string) => `member-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { workspaceUser, isEmployee } = useEmployeeWorkspace()
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const tasks = useEmployeeWorkspaceStore((state) => state.tasks)
  const timeEntries = useEmployeeWorkspaceStore((state) => state.timeEntries)
  const taskTimer = useEmployeeWorkspaceStore((state) => state.taskTimer)
  const startTaskTimer = useEmployeeWorkspaceStore((state) => state.startTaskTimer)
  const stopTaskTimer = useEmployeeWorkspaceStore((state) => state.stopTaskTimer)
  const setTaskTimerNote = useEmployeeWorkspaceStore((state) => state.setTaskTimerNote)
  const logTime = useEmployeeWorkspaceStore((state) => state.logTime)
  const saveProject = useEmployeeWorkspaceStore((state) => state.saveProject)
  const saveTask = useEmployeeWorkspaceStore((state) => state.saveTask)
  const deleteTask = useEmployeeWorkspaceStore((state) => state.deleteTask)
  const moveTask = useEmployeeWorkspaceStore((state) => state.moveTask)
  const { logEmployeeTime } = useEmployeeTimeLogger()

  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'timesheets' | 'members'>('board')
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormState>(EMPTY_TASK_FORM)
  const [timeForm, setTimeForm] = useState<TimeLogState>(EMPTY_TIME_LOG)
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM)
  const [timerNow, setTimerNow] = useState(Date.now())
  const [memberName, setMemberName] = useState('')

  const project = useMemo(() => projects.find((item) => item.id === id), [id, projects])
  const projectTasks = useMemo(() => tasks.filter((task) => task.projectId === id), [id, tasks])
  const projectEntries = useMemo(
    () => timeEntries.filter((entry) => entry.projectId === id).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [id, timeEntries],
  )

  const teamMembers = useMemo(() => {
    if (!project) return []
    return Array.from(new Set([...(project.team || []), project.ownerName]))
  }, [project])

  const taskLookup = useMemo(() => new Map(projectTasks.map((task) => [task.id, task])), [projectTasks])
  const hoursLogged = useMemo(() => projectEntries.reduce((total, entry) => total + entry.hours, 0), [projectEntries])
  const completedTasks = useMemo(() => projectTasks.filter((task) => task.status === 'DONE').length, [projectTasks])
  const overdueTasks = useMemo(
    () => projectTasks.filter((task) => task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()).length,
    [projectTasks],
  )
  const upcomingTasks = useMemo(
    () => projectTasks.slice().sort((left, right) => (left.dueDate || '9999-12-31').localeCompare(right.dueDate || '9999-12-31')).slice(0, 5),
    [projectTasks],
  )

  if (!project || !workspaceUser) {
    return <div className="shell-card p-8 text-sm text-slate-500">Project not found.</div>
  }

  const canEditProject = workspaceUser.id === project.ownerId
  const canEditTask = (task: WorkspaceTask) => workspaceUser.id === (task.creatorId || task.assigneeId)
  const isProjectMember = project.ownerId === workspaceUser.id || project.team.includes(workspaceUser.fullName)
  useEffect(() => {
    if (!taskTimer) {
      return
    }

    setTimerNow(Date.now())
    const interval = window.setInterval(() => setTimerNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [taskTimer])

  const timerSeconds = taskTimer ? Math.max(0, Math.floor((timerNow - taskTimer.startedAt) / 1000)) : 0


  if (!isProjectMember) {
    return (
      <div className="shell-card p-8 text-sm text-slate-500">
        You are not a member of this project.
        <div className="mt-3">
          <Link to="/employee/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Return to projects</Link>
        </div>
      </div>
    )
  }

  const openEditProject = () => {
    if (!canEditProject) {
      toast.error('Only the project manager can edit this project')
      return
    }
    setProjectForm({
      name: project.name,
      client: project.client,
      product: project.product || '',
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate || '',
    })
    setShowProjectModal(true)
  }

  const openNewTask = (status: WorkspaceTaskStatus = 'TODO') => {
    setEditingTaskId(null)
    setTaskForm({ ...EMPTY_TASK_FORM, status, assigneeName: workspaceUser.fullName })
    setShowTaskModal(true)
  }

  const openEditTask = (task: WorkspaceTask) => {
    if (!canEditTask(task)) {
      toast.error('Only the task creator can edit this task')
      return
    }
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeName: task.assigneeName,
      dueDate: task.dueDate || '',
      estimateHours: task.estimateHours ? String(task.estimateHours) : '',
    })
    setShowTaskModal(true)
  }

  const openTimeLog = (taskId: string) => {
    setTimeForm({ ...EMPTY_TIME_LOG, taskId })
    setShowTimeModal(true)
  }

  const handleSaveTask = () => {
    if (!taskForm.title.trim() || !taskForm.assigneeName.trim()) {
      toast.error('Task title and assignee are required')
      return
    }

    const assigneeId = taskForm.assigneeName === workspaceUser.fullName ? workspaceUser.id : slugName(taskForm.assigneeName)
    const currentTask = editingTaskId ? taskLookup.get(editingTaskId) : null
    const draft: WorkspaceTaskDraft = {
      id: editingTaskId || undefined,
      projectId: project.id,
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      assigneeId,
      assigneeName: taskForm.assigneeName,
      creatorId: currentTask?.creatorId || workspaceUser.id,
      creatorName: currentTask?.creatorName || workspaceUser.fullName,
      dueDate: taskForm.dueDate || undefined,
      estimateHours: taskForm.estimateHours ? Number(taskForm.estimateHours) : undefined,
    }

    saveTask(draft)
    toast.success(editingTaskId ? 'Task updated' : 'Task created')
    setShowTaskModal(false)
    setEditingTaskId(null)
    setTaskForm(EMPTY_TASK_FORM)
  }

  const handleSaveProject = () => {
    if (!canEditProject) {
      toast.error('Only the project manager can edit this project')
      return
    }
    if (!projectForm.name.trim() || !projectForm.client.trim()) {
      toast.error('Project name and client are required')
      return
    }

    saveProject({
      id: project.id,
      code: project.code,
      name: projectForm.name,
      client: projectForm.client,
      product: projectForm.product,
      description: projectForm.description,
      status: projectForm.status,
      priority: projectForm.priority,
      dueDate: projectForm.dueDate || undefined,
      startDate: project.startDate,
      ownerId: project.ownerId,
      ownerName: project.ownerName,
      team: project.team,
      source: project.source,
      linkedFieldJobId: project.linkedFieldJobId,
    })

    toast.success('Project updated')
    setShowProjectModal(false)
  }

  const handleAddMember = () => {
    if (!canEditProject) {
      toast.error('Only the project manager can manage members')
      return
    }
    const nextName = memberName.trim()
    if (!nextName) {
      toast.error('Enter a member name to add')
      return
    }
    if (project.team.includes(nextName) || project.ownerName === nextName) {
      toast.error('Member already added')
      return
    }

    saveProject({
      id: project.id,
      code: project.code,
      name: project.name,
      client: project.client,
      product: project.product,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      startDate: project.startDate,
      ownerId: project.ownerId,
      ownerName: project.ownerName,
      team: [...project.team, nextName],
      source: project.source,
      linkedFieldJobId: project.linkedFieldJobId,
    })

    toast.success('Member added')
    setMemberName('')
  }

  const handleRemoveMember = (member: string) => {
    if (!canEditProject) {
      toast.error('Only the project manager can manage members')
      return
    }
    if (member === project.ownerName) {
      toast.error('Project manager cannot be removed')
      return
    }

    saveProject({
      id: project.id,
      code: project.code,
      name: project.name,
      client: project.client,
      product: project.product,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      startDate: project.startDate,
      ownerId: project.ownerId,
      ownerName: project.ownerName,
      team: project.team.filter((item) => item !== member),
      source: project.source,
      linkedFieldJobId: project.linkedFieldJobId,
    })

    toast.success('Member removed')
  }

  const handleLogTime = async () => {
    const hours = Number(timeForm.hours)
    if (!timeForm.taskId || !timeForm.workDate || !Number.isFinite(hours) || hours <= 0) {
      toast.error('Task, work date, and hours are required')
      return
    }

    const task = taskLookup.get(timeForm.taskId)
    if (!task) {
      toast.error('Selected task no longer exists')
      return
    }

    const result = await logEmployeeTime({
      project,
      taskId: timeForm.taskId,
      workDate: timeForm.workDate,
      hours,
      note: timeForm.note,
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
      toast.success(`Logged ${hours}h to ${task.title} and synced to HR timesheets`)
    } else {
      toast.success(`Logged ${hours}h to ${task.title}`)
    }

    setShowTimeModal(false)
    setTimeForm(EMPTY_TIME_LOG)
  }

  const stopTimerAndLog = async (task: WorkspaceTask, timerProjectId: string) => {
    if (!taskTimer || taskTimer.taskId !== task.id) return false

    const note = taskTimer.note?.trim() || 'Timer session'
    const seconds = Math.max(0, Math.floor((Date.now() - taskTimer.startedAt) / 1000))
    const fallbackHours = Math.max(0.01, Math.round((seconds / 3600) * 100) / 100)
    const fallbackWorkDate = new Date().toISOString().split('T')[0]

    if (!taskTimer.timeEntryId) {
      logTime({
        projectId: timerProjectId,
        taskId: task.id,
        employeeId: workspaceUser.id,
        employeeName: workspaceUser.fullName,
        workDate: fallbackWorkDate,
        hours: fallbackHours,
        note,
      })
      toast.success(`Logged ${fallbackHours}h from timer`)
      stopTaskTimer()
      return true
    }

    try {
      const response = await timeEntryApi.stop(taskTimer.timeEntryId)
      const entry = response.data.data
      const durationMinutes = entry?.durationMinutes
      const durationHours = durationMinutes !== null && durationMinutes !== undefined
        ? Math.max(0.01, Math.round((durationMinutes / 60) * 100) / 100)
        : fallbackHours

      logTime({
        projectId: timerProjectId,
        taskId: task.id,
        employeeId: workspaceUser.id,
        employeeName: workspaceUser.fullName,
        workDate: entry?.workDate || fallbackWorkDate,
        hours: durationHours,
        note,
      })

      toast.success(`Logged ${durationHours}h from timer`)
      stopTaskTimer()
      return true
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to stop timer')
      return false
    }
  }

  const handleStartTimer = async (task: WorkspaceTask) => {
    if (taskTimer && taskTimer.taskId !== task.id) {
      const confirmStop = window.confirm('A timer is already running on another task. Stop it first?')
      if (!confirmStop) return

      const activeTask = tasks.find((item) => item.id === taskTimer.taskId)
      const activeProject = projects.find((item) => item.id === taskTimer.projectId)
      if (!activeTask || !activeProject) {
        toast.error('Active timer task no longer exists')
        return
      }

      const stopped = await stopTimerAndLog(activeTask, activeProject.id)
      if (!stopped) {
        return
      }
    }

    if (!isUuid(project.id)) {
      startTaskTimer(task.id, project.id)
      setTaskTimerNote('')
      toast.success('Timer started locally (project not synced yet)')
      return
    }

    try {
      const apiTaskId = isUuid(task.id) ? task.id : undefined
      const response = await timeEntryApi.start({
        projectId: project.id,
        taskId: apiTaskId,
        description: task.title,
      })

      startTaskTimer(task.id, project.id, response.data.data?.id)
      setTaskTimerNote('')
      toast.success('Timer started')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start timer')
    }
  }

  const handleStopTimer = async (task: WorkspaceTask) => {
    if (!taskTimer || taskTimer.taskId !== task.id) return
    await stopTimerAndLog(task, project.id)
  }

  return (
    <div className="space-y-6">
      <div className="pm-hero p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Link to="/employee/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to projects</Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{project.name}</h1>
              <span className="pm-badge bg-white/85 text-blue-700 ring-1 ring-blue-100">{project.code}</span>
              <span className={`pm-badge ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status.replace(/_/g, ' ')}</span>
              <span className={`pm-badge ${PRIORITY_COLORS[project.priority]}`}>{project.priority} priority</span>
              {canEditProject && (
                <span className="pm-badge bg-emerald-50 text-emerald-700">Project Manager</span>
              )}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">{project.description || 'No description available yet. Capture scope, client context, and delivery notes here.'}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">Client {project.client}</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">Owner {project.ownerName}</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{teamMembers.length} team members</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEditProject ? (
              <button type="button" onClick={openEditProject} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Edit Project</button>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Only the project manager can edit</span>
            )}
            <button type="button" onClick={() => openNewTask()} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">+ Add Task</button>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Stat label="Progress" value={`${project.progress}%`} detail={`${completedTasks}/${projectTasks.length || 0} tasks completed`} />
          <Stat label="Open tasks" value={projectTasks.length - completedTasks} detail={`${overdueTasks} overdue requiring attention`} accent={overdueTasks > 0 ? 'text-rose-700' : 'text-slate-900'} />
          <Stat label="Team" value={teamMembers.length} detail={`Owner plus assigned contributors`} />
          <Stat label="Hours logged" value={`${hoursLogged.toFixed(1)}h`} detail={taskTimer ? 'A timer is currently running' : 'All logged time across this project'} accent={taskTimer ? 'text-emerald-700' : 'text-slate-900'} />
        </div>
        {project.linkedFieldJobId && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-700">
            Linked field job: {project.linkedFieldJobId}. Time logged on this project also syncs to HR timesheets.
          </div>
        )}
      </div>

      <div className="pm-toolbar p-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'board', label: 'Board' },
            { key: 'timesheets', label: 'Timesheets' },
            { key: 'members', label: 'Members' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as 'overview' | 'board' | 'timesheets' | 'members')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? 'pm-tab-active' : 'pm-tab-idle'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="pm-grid-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="pm-section-title">Execution outlook</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Upcoming work and delivery focus</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{projectTasks.length} total tasks</span>
            </div>
            <div className="mt-4 space-y-3">
              {projectTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks yet. Start by adding your first task.</p>
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{task.assigneeName} · Due {task.dueDate || 'TBD'}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{task.description || 'No task notes yet.'}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${COLUMNS.find((column) => column.key === task.status)?.tone || 'bg-slate-100 text-slate-700'}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">{task.loggedHours.toFixed(1)}h logged</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="pm-grid-card p-5 md:p-6">
              <p className="pm-section-title">Project health</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Delivery signals</h2>
              <div className="mt-4 space-y-3">
                <InsightRow label="Completion rate" value={`${project.progress}%`} helper="Measured from overall project progress" />
                <InsightRow label="Completed tasks" value={`${completedTasks}/${projectTasks.length || 0}`} helper="Tasks in done status" />
                <InsightRow label="Overdue tasks" value={overdueTasks} helper="Tasks past due and not complete" danger={overdueTasks > 0} />
                <InsightRow label="Time capture" value={`${hoursLogged.toFixed(1)}h`} helper="Logged to project tasks and timesheets" />
              </div>
            </div>
            <div className="pm-grid-card p-5 md:p-6">
              <p className="pm-section-title">Team members</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">People on this project</h2>
              <div className="mt-4 space-y-3">
              {isEmployee ? (
                teamMembers.map((member) => (
                  <div key={member} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {member.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member}</p>
                      <p className="text-xs text-slate-500">Project contributor</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Members are visible only to employees.</p>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {COLUMNS.map((column) => (
              <div
                key={column.key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedTaskId) {
                    const draggedTask = taskLookup.get(draggedTaskId)
                    if (!draggedTask || !canEditTask(draggedTask)) {
                      toast.error('Only the task creator can update this task')
                      setDraggedTaskId(null)
                      return
                    }
                    moveTask(draggedTaskId, column.key)
                    setDraggedTaskId(null)
                    toast.success(`Task moved to ${column.label}`)
                  }
                }}
                className="w-[22rem] rounded-[22px] border border-slate-200 bg-white/90 shadow-sm backdrop-blur"
              >
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${column.tone}`}>{column.label}</div>
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">{projectTasks.filter((task) => task.status === column.key).length} items</p>
                    </div>
                    <button type="button" onClick={() => openNewTask(column.key)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">+ Add</button>
                  </div>
                </div>
                <div className="space-y-3 p-3">
                  {projectTasks.filter((task) => task.status === column.key).map((task) => (
                    <div
                      key={task.id}
                      draggable={canEditTask(task)}
                      onClick={() => {
                        if (canEditTask(task)) {
                          openEditTask(task)
                        }
                      }}
                      onDragStart={() => {
                        if (canEditTask(task)) {
                          setDraggedTaskId(task.id)
                        }
                      }}
                      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${canEditTask(task) ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{task.assigneeName}</p>
                          <p className="mt-1 text-[11px] text-slate-400">Task Creator: {task.creatorName || task.assigneeName}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      </div>
                      {task.description && <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p>}
                      {taskTimer?.taskId === task.id && (
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                          Timer running: {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>Due {task.dueDate || 'TBD'}</span>
                        <span>{task.loggedHours.toFixed(1)}h / {task.estimateHours || 0}h</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs font-semibold">
                        {canEditTask(task) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openEditTask(task)
                            }}
                            className="text-slate-500 hover:text-slate-900"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            openTimeLog(task.id)
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Log time
                        </button>
                        {taskTimer?.taskId === task.id ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleStopTimer(task)
                            }}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            Stop Timer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleStartTimer(task)
                            }}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            Start Timer
                          </button>
                        )}
                        {canEditTask(task) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteTask(task.id)
                              toast.success('Task deleted')
                            }}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      {taskTimer?.taskId === task.id && (
                        <input
                          value={taskTimer.note || ''}
                          onChange={(event) => setTaskTimerNote(event.target.value)}
                          placeholder="Timer note (optional)"
                          className="pm-input mt-3 py-2 text-xs"
                        />
                      )}
                    </div>
                  ))}
                  {projectTasks.filter((task) => task.status === column.key).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">No tasks in this column</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="pm-grid-card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="pm-section-title">Project timesheets</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Logged time and audit trail</h2>
          </div>
          {projectEntries.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No time entries yet. Log time from the board to build a project history.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Work Date</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-4 text-slate-900">{taskLookup.get(entry.taskId)?.title || 'Task'}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.employeeName}</td>
                      <td className="px-4 py-4 text-slate-600">{entry.workDate}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{entry.hours}h</td>
                      <td className="px-4 py-4 text-slate-600">{entry.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="pm-grid-card p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="pm-section-title">Members</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Project access and contributors</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">{teamMembers.length} members</span>
          </div>
          {canEditProject ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                placeholder="Add member name"
                className="pm-input min-w-[220px] flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Add Member
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Only the project manager can add or remove members.</p>
          )}
          <div className="mt-4 space-y-3">
            {teamMembers.map((member) => (
              <div key={member} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {member.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{member}</p>
                    <p className="text-xs text-slate-500">{member === project.ownerName ? 'Project Manager' : 'Project Member'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member === project.ownerName && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Manager</span>
                  )}
                  {canEditProject && member !== project.ownerName && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editingTaskId ? 'Edit task' : 'Add task'}</h2>
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
                  {COLUMNS.map((column) => <option key={column.key} value={column.key}>{column.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={taskForm.priority} onChange={(event) => setTaskForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="pm-select mt-1 text-sm">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Assignee</label>
                {isEmployee ? (
                  <select value={taskForm.assigneeName} onChange={(event) => setTaskForm((state) => ({ ...state, assigneeName: event.target.value }))} className="pm-select mt-1 text-sm">
                    {teamMembers.map((member) => <option key={member} value={member}>{member}</option>)}
                  </select>
                ) : (
                  <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {taskForm.assigneeName || project.ownerName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Due date</label>
                <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((state) => ({ ...state, dueDate: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Estimated hours</label>
                <input type="number" min="0" step="0.5" value={taskForm.estimateHours} onChange={(event) => setTaskForm((state) => ({ ...state, estimateHours: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowTaskModal(false); setEditingTaskId(null); setTaskForm(EMPTY_TASK_FORM) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSaveTask} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save task</button>
            </div>
          </div>
        </div>
      )}

      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Log time</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Task</label>
                <select value={timeForm.taskId} onChange={(event) => setTimeForm((state) => ({ ...state, taskId: event.target.value }))} className="pm-select mt-1 text-sm">
                  <option value="">Select a task</option>
                  {projectTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Work date</label>
                  <input type="date" value={timeForm.workDate} onChange={(event) => setTimeForm((state) => ({ ...state, workDate: event.target.value }))} className="pm-input mt-1 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Hours</label>
                  <input type="number" min="0" step="0.25" value={timeForm.hours} onChange={(event) => setTimeForm((state) => ({ ...state, hours: event.target.value }))} className="pm-input mt-1 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Note</label>
                <textarea value={timeForm.note} onChange={(event) => setTimeForm((state) => ({ ...state, note: event.target.value }))} rows={3} className="pm-textarea mt-1 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowTimeModal(false); setTimeForm(EMPTY_TIME_LOG) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleLogTime} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save time</button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Edit project</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Project name</label>
                <input value={projectForm.name} onChange={(event) => setProjectForm((state) => ({ ...state, name: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Client</label>
                <input value={projectForm.client} onChange={(event) => setProjectForm((state) => ({ ...state, client: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Product</label>
                <input value={projectForm.product} onChange={(event) => setProjectForm((state) => ({ ...state, product: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={projectForm.status} onChange={(event) => setProjectForm((state) => ({ ...state, status: event.target.value as WorkspaceProjectStatus }))} className="pm-select mt-1 text-sm">
                  {PROJECT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={projectForm.priority} onChange={(event) => setProjectForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="pm-select mt-1 text-sm">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as WorkspacePriority[]).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Target date</label>
                <input type="date" value={projectForm.dueDate} onChange={(event) => setProjectForm((state) => ({ ...state, dueDate: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={projectForm.description} onChange={(event) => setProjectForm((state) => ({ ...state, description: event.target.value }))} rows={4} className="pm-textarea mt-1 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowProjectModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSaveProject} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Stat = ({
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
    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className={`pm-metric-value mt-3 ${accent}`}>{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </div>
)

const InsightRow = ({
  label,
  value,
  helper,
  danger = false,
}: {
  label: string
  value: string | number
  helper: string
  danger?: boolean
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className={`text-sm font-bold ${danger ? 'text-rose-700' : 'text-slate-900'}`}>{value}</p>
    </div>
    <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
  </div>
)

export default ProjectDetailPage