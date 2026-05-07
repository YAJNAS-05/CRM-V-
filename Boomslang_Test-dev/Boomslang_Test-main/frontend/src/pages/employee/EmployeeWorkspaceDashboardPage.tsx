import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import useEmployeeWorkspaceSync from '../../hooks/useEmployeeWorkspaceSync'
import { projectApi, taskApi } from '../../api/pmApi'
import { attendanceApi, timesheetApi } from '../../api/hrApi'

const formatShortDate = (value?: string) => {
  if (!value) return 'TBD'
  return new Date(value).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
}

const formatHours = (value: number) => `${value.toFixed(1)}h`

const formatRelative = (value: string) => {
  const deltaHours = Math.round((Date.now() - new Date(value).getTime()) / 3600000)
  if (deltaHours <= 1) return 'Just now'
  if (deltaHours < 24) return `${deltaHours}h ago`
  return `${Math.round(deltaHours / 24)}d ago`
}

const EmployeeWorkspaceDashboardPage: React.FC = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const { currentEmployee } = useEmployeeWorkspaceSync()
  const employeeIdentityIds = useMemo(
    () => new Set([workspaceUser?.id, currentEmployee?.id].filter(Boolean)),
    [currentEmployee?.id, workspaceUser?.id],
  )

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['pm-projects-all'],
    queryFn: () => projectApi.getAll(0, 500),
  })

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['pm-tasks-all'],
    queryFn: () => taskApi.getAll(0, 500),
  })

  const { data: timesheetsData } = useQuery({
    queryKey: ['hr-timesheets', currentEmployee?.id],
    queryFn: () => timesheetApi.getByEmployee(currentEmployee!.id),
    enabled: !!currentEmployee?.id,
  })

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', 'me', 'today-widget'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const response = await attendanceApi.getMe({ start: today, end: today })
      return response.data.data || []
    },
    enabled: Boolean(workspaceUser),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const projects = projectsData?.data?.data?.content || []
  const tasks = tasksData?.data?.data?.content || []
  const timesheets = timesheetsData?.data?.data || []
  const todayPunch = attendanceData?.find((record) => !record.punchOut) || null

  const summary = useMemo(() => {
    if (!workspaceUser) {
      return {
        activeProjects: [],
        myTasks: [],
        dueToday: [],
        overdueTasks: 0,
        openTasks: 0,
        timeThisWeek: 0,
        projectStatusCounts: [] as Array<{ label: string; value: number; tone: string }>,
        recentActivity: [] as typeof timesheets,
        weekBlocks: [] as Array<{ label: string; hours: number }>,
        currentPunch: null as any,
      }
    }

    const activeProjects = projects
    const projectIds = new Set(activeProjects.map((project) => project.id))
    const myTasks = tasks.filter(
      (task) => task.assigneeId === workspaceUser.id,
    )
    const today = new Date().toISOString().split('T')[0]
    const dueToday = myTasks.filter((task) => task.dueDate === today && task.status !== 'DONE')
    const overdueTasks = myTasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== 'DONE').length
    const openTasks = myTasks.filter((task) => task.status !== 'DONE').length
    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7))

    const myTimeEntries = timesheets
    const timeThisWeek = myTimeEntries
      .filter((entry) => new Date(entry.workDate) >= startOfWeek)
      .reduce((total, entry) => total + (entry.hoursWorked || 0), 0)

    const statusOrder = [
      { label: 'Planning', key: 'PLANNING', tone: 'bg-slate-400' },
      { label: 'In Progress', key: 'IN_PROGRESS', tone: 'bg-blue-500' },
      { label: 'On Hold', key: 'ON_HOLD', tone: 'bg-amber-500' },
      { label: 'In Review', key: 'IN_REVIEW', tone: 'bg-purple-500' },
      { label: 'Done', key: 'DONE', tone: 'bg-emerald-500' },
    ] as const

    const projectStatusCounts = statusOrder.map((status) => ({
      label: status.label,
      tone: status.tone,
      value: activeProjects.filter((project) => project.status === status.key).length,
    }))

    const recentActivity = myTimeEntries.slice().sort((left, right) =>
      new Date(right.createdAt || '').getTime() - new Date(left.createdAt || '').getTime(),
    ).slice(0, 5)

    const weekBlocks = Array.from({ length: 5 }, (_, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      const key = date.toISOString().split('T')[0]
      const hours = myTimeEntries
        .filter((entry) => entry.workDate === key)
        .reduce((total, entry) => total + (entry.hoursWorked || 0), 0)
      return {
        label: date.toLocaleDateString('en-AU', { weekday: 'short' }),
        hours,
      }
    })

    return {
      activeProjects,
      myTasks,
      dueToday,
      overdueTasks,
      openTasks,
      timeThisWeek,
      projectStatusCounts,
      recentActivity,
      weekBlocks,
      currentPunch: todayPunch,
    }
  }, [projects, tasks, timesheets, todayPunch, workspaceUser])

  const projectLookup = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  )

  if (!workspaceUser || isProjectsLoading || isTasksLoading) {
    return <div className="shell-card p-8 text-sm text-slate-500">Loading your workspace...</div>
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Employee workspace</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Good morning, {workspaceUser.fullName.split(' ')[0]}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage projects, keep your task flow clean, log time against real work, and track attendance from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/employee/projects" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              View Projects
            </Link>
            <Link to="/employee/tasks" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              My Tasks
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Projects" value={summary.activeProjects.length} tone="text-blue-600" />
        <MetricCard title="My Open Tasks" value={summary.openTasks} tone="text-violet-600" />
        <MetricCard title="Overdue Tasks" value={summary.overdueTasks} tone="text-rose-600" />
        <MetricCard title="Time This Week" value={formatHours(summary.timeThisWeek)} tone="text-emerald-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="shell-card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Tasks due today</h2>
          </div>
          {summary.dueToday.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No tasks due today. Great job.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.dueToday.map((task) => (
                <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{projectLookup.get(task.projectId || '')?.projectName || 'Project'} · Due today</p>
                  </div>
                  <Link to={`/employee/projects/${task.projectId}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Open project
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Project status</h2>
          <div className="mt-4 space-y-4">
            {summary.projectStatusCounts.map((item) => {
              const total = Math.max(summary.activeProjects.length, 1)
              const width = (item.value / total) * 100
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${item.tone}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="shell-card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Recent activity</h2>
          </div>
          {summary.recentActivity.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Start logging time to build your recent activity feed.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.recentActivity.map((entry) => {
                const project = Array.from(projectLookup.values()).find(p => p.linkedFieldJobId === entry.fieldJobId)
                return (
                  <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Task time logged</p>
                      <p className="mt-1 text-xs text-slate-500">{project?.projectCode || 'PROJECT'} · {entry.hoursWorked}h · {entry.notes || 'Time recorded'}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatRelative(entry.createdAt || '')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="shell-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Attendance</h2>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.currentPunch ? 'Checked in' : 'Ready to start'}</p>
              </div>
              <Link to="/employee/attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Open attendance
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {summary.currentPunch
                ? `Started at ${new Date(summary.currentPunch.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`
                : 'Use the header punch control to check in and out without leaving your work.'}
            </p>
          </div>

          <div className="shell-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">This week</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {summary.weekBlocks.map((block) => (
                <div key={block.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{block.label}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{block.hours.toFixed(1)}h</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.activeProjects.slice(0, 3).map((project) => (
          <Link key={project.id} to={`/employee/projects/${project.id}`} className="shell-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{project.projectCode}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{project.projectName}</h2>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Due {formatShortDate(project.endDate)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, tone }: { title: string; value: string | number; tone: string }) => (
  <div className="shell-card p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className={`mt-3 text-3xl font-bold ${tone}`}>{value}</p>
  </div>
)

export default EmployeeWorkspaceDashboardPage