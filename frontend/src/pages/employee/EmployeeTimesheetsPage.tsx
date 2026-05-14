import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import useEmployeeTimeLogger from '../../hooks/useEmployeeTimeLogger'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import useEmployeeWorkspaceSync from '../../hooks/useEmployeeWorkspaceSync'
import { useEmployeeWorkspaceStore } from '../../store/employeeWorkspaceStore'

const EmployeeTimesheetsPage: React.FC = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const { currentEmployee, employeesQuery } = useEmployeeWorkspaceSync()
  const { logEmployeeTime } = useEmployeeTimeLogger()
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const tasks = useEmployeeWorkspaceStore((state) => state.tasks)
  const timeEntries = useEmployeeWorkspaceStore((state) => state.timeEntries)

  const [projectId, setProjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')

  const projectLookup = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const taskLookup = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks])
  const employeeIdentityIds = useMemo(
    () => new Set([workspaceUser?.id, currentEmployee?.id].filter(Boolean)),
    [currentEmployee?.id, workspaceUser?.id],
  )

  const myTasks = useMemo(() => {
    if (!workspaceUser) return []
    return tasks.filter((task) => task.assigneeId === workspaceUser.id)
  }, [tasks, workspaceUser])

  const visibleProjects = useMemo(() => {
    if (!workspaceUser) return []
    return projects.filter(
      (project) => project.ownerId === workspaceUser.id || project.team.includes(workspaceUser.fullName),
    )
  }, [projects, workspaceUser])

  const visibleTasks = useMemo(
    () => myTasks.filter((task) => (projectId ? task.projectId === projectId : true)),
    [myTasks, projectId],
  )

  const myEntries = useMemo(() => {
    if (employeeIdentityIds.size === 0) return []
    return timeEntries
      .filter((entry) => employeeIdentityIds.has(entry.employeeId))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }, [employeeIdentityIds, timeEntries])

  const weeklyHours = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return myEntries
      .filter((entry) => new Date(entry.workDate) >= start)
      .reduce((total, entry) => total + entry.hours, 0)
  }, [myEntries])

  const linkedProjects = useMemo(() => visibleProjects.filter((project) => project.linkedFieldJobId).length, [visibleProjects])
  const thisMonthHours = useMemo(() => {
    const now = new Date()
    return myEntries
      .filter((entry) => {
        const entryDate = new Date(entry.workDate)
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
      })
      .reduce((total, entry) => total + entry.hours, 0)
  }, [myEntries])

  const handleSubmit = async () => {
    if (!workspaceUser || !projectId || !workDate || !hours) {
      toast.error('Project, work date, and hours are required')
      return
    }

    const project = projectLookup.get(projectId)
    if (!project) {
      toast.error('Selected project is no longer available')
      return
    }

    if (!taskId && !project.linkedFieldJobId) {
      toast.error('Choose a task or select a field-job linked project')
      return
    }

    if (!taskId && project.linkedFieldJobId && !currentEmployee) {
      toast.error('Your login is not linked to an employee record yet')
      return
    }

    const parsedHours = Number(hours)
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      toast.error('Hours must be greater than zero')
      return
    }

    const result = await logEmployeeTime({
      project,
      taskId: taskId || undefined,
      workDate,
      hours: parsedHours,
      note,
    })

    if (result.error) {
      if (result.localLogged) {
        toast.error('Time logged locally, but HR timesheet sync failed')
      } else {
        toast.error('Failed to create timesheet entry')
      }
      return
    }

    if (result.apiSynced && result.localLogged) {
      toast.success('Time entry logged and synced to HR timesheets')
    } else if (result.apiSynced) {
      toast.success('HR timesheet entry created')
    } else if (result.localLogged) {
      toast.success('Time entry logged')
    } else if (result.backendUnavailable) {
      toast.error('Your login is not linked to an employee record yet')
      return
    }

    if (!project.linkedFieldJobId) {
      setTaskId('')
    }
    setHours('')
    setNote('')
  }

  return (
    <div className="space-y-6">
      <div className="pm-hero p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="pm-section-title">Project management</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Timesheets workspace</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-[15px]">Create clean time entries for project execution while keeping HR sync and reporting context visible.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{myEntries.length} captured entries</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{weeklyHours.toFixed(1)}h this week</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{linkedProjects} sync-enabled projects</span>
            </div>
          </div>
          <Link to="/employee/tasks" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Open tasks</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Entries" value={myEntries.length} detail="Logged time records visible in your workspace" />
          <Metric title="This week" value={`${weeklyHours.toFixed(1)}h`} detail="Hours captured across the last 7 days" accent="text-blue-700" />
          <Metric title="This month" value={`${thisMonthHours.toFixed(1)}h`} detail="Monthly delivery effort" accent="text-emerald-700" />
          <Metric title="Projects" value={visibleProjects.length} detail="Projects available for time capture" />
        </div>
      </div>

      <div className="pm-grid-card px-5 py-4 text-sm text-slate-600">
        {employeesQuery.isLoading
          ? 'Checking your employee profile for HR timesheet sync.'
          : currentEmployee
            ? 'Real HR timesheet sync is active for linked field-job projects.'
            : 'Your login is not linked to an employee record yet. Local task time logging still works, but direct HR timesheet sync is unavailable.'}
      </div>

      <div className="pm-grid-card p-5 md:p-6">
        <p className="pm-section-title">New time entry</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Create and sync time entries</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select value={projectId} onChange={(event) => { setProjectId(event.target.value); setTaskId('') }} className="pm-select text-sm">
            <option value="">Select project</option>
            {visibleProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select value={taskId} onChange={(event) => setTaskId(event.target.value)} className="pm-select text-sm">
            <option value="">Select task</option>
            {visibleTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
          <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="pm-input text-sm" />
          <input type="number" min="0" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Hours worked" className="pm-input text-sm" />
        </div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="What did you work on?" className="pm-textarea mt-4 text-sm" />
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleSubmit} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">Save time entry</button>
        </div>
      </div>

      <div className="pm-grid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Work Date</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-900">{projectLookup.get(entry.projectId)?.name || 'HR timesheet'}</td>
                  <td className="px-4 py-4 text-slate-600">{taskLookup.get(entry.taskId)?.title || 'HR timesheet'}</td>
                  <td className="px-4 py-4 text-slate-600">{entry.workDate}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{entry.hours}h</td>
                  <td className="px-4 py-4 text-slate-600">{entry.note || '—'}</td>
                </tr>
              ))}
              {myEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No time entries yet. Log against a task or directly against a linked field job.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const Metric = ({
  title,
  value,
  detail,
  accent = 'text-slate-900',
}: {
  title: string
  value: string | number
  detail: string
  accent?: string
}) => (
  <div className="pm-stat-card p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
    <p className={`pm-metric-value mt-3 ${accent}`}>{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </div>
)

export default EmployeeTimesheetsPage