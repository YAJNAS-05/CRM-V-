import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import {
  useEmployeeWorkspaceStore,
  type WorkspacePriority,
  type WorkspaceProject,
  type WorkspaceProjectStatus,
} from '../../store/employeeWorkspaceStore'

const STATUS_OPTIONS: WorkspaceProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE']
const PRIORITY_OPTIONS: WorkspacePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const PROJECT_STATUS_STYLES: Record<WorkspaceProjectStatus, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  ON_HOLD: 'bg-amber-50 text-amber-700',
  IN_REVIEW: 'bg-violet-50 text-violet-700',
  DONE: 'bg-emerald-50 text-emerald-700',
}

const PROJECT_PRIORITY_STYLES: Record<WorkspacePriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-sky-50 text-sky-700',
  HIGH: 'bg-amber-50 text-amber-700',
  CRITICAL: 'bg-rose-50 text-rose-700',
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

const EMPTY_FORM: ProjectFormState = {
  name: '',
  client: '',
  product: '',
  description: '',
  status: 'PLANNING',
  priority: 'MEDIUM',
  dueDate: '',
}

const ProjectsPage: React.FC = () => {
  const { workspaceUser } = useEmployeeWorkspace()
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const tasks = useEmployeeWorkspaceStore((state) => state.tasks)
  const attendanceRecords = useEmployeeWorkspaceStore((state) => state.attendanceRecords)
  const getCurrentPunch = useEmployeeWorkspaceStore((state) => state.getCurrentPunch)
  const punchIn = useEmployeeWorkspaceStore((state) => state.punchIn)
  const punchOut = useEmployeeWorkspaceStore((state) => state.punchOut)
  const saveProject = useEmployeeWorkspaceStore((state) => state.saveProject)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkspaceProjectStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [showModal, setShowModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM)
  const [punchNote, setPunchNote] = useState('')

  const currentPunch = workspaceUser ? getCurrentPunch(workspaceUser.id) : null
  const editingProject = useMemo(
    () => (editingProjectId ? projects.find((project) => project.id === editingProjectId) : null),
    [editingProjectId, projects],
  )

  const canEditProject = (project: WorkspaceProject) => workspaceUser?.id === project.ownerId

  const visibleProjects = useMemo(() => {
    if (!workspaceUser) return []

    return projects
      .filter((project) => project.ownerId === workspaceUser.id || project.team.includes(workspaceUser.fullName))
      .filter((project) => (statusFilter === 'ALL' ? true : project.status === statusFilter))
      .filter((project) => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return true
        return [project.name, project.code, project.client, project.product || '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
  }, [projects, query, statusFilter, workspaceUser])

  const taskStats = useMemo(() => {
    const stats = new Map<string, { total: number; done: number }>()
    tasks.forEach((task) => {
      const current = stats.get(task.projectId) || { total: 0, done: 0 }
      current.total += 1
      if (task.status === 'DONE') current.done += 1
      stats.set(task.projectId, current)
    })
    return stats
  }, [tasks])

  const summary = useMemo(() => {
    const totalProjects = visibleProjects.length
    const inFlightProjects = visibleProjects.filter((project) => project.status === 'IN_PROGRESS').length
    const overdueProjects = visibleProjects.filter((project) => project.dueDate && project.status !== 'DONE' && new Date(project.dueDate) < new Date()).length
    const avgProgress = totalProjects === 0
      ? 0
      : Math.round(visibleProjects.reduce((total, project) => total + project.progress, 0) / totalProjects)

    return {
      totalProjects,
      inFlightProjects,
      overdueProjects,
      avgProgress,
    }
  }, [visibleProjects])

  const openNewProject = () => {
    setEditingProjectId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEditProject = (project: WorkspaceProject) => {
    if (!canEditProject(project)) {
      toast.error('Only the project manager can edit this project')
      return
    }
    setEditingProjectId(project.id)
    setForm({
      name: project.name,
      client: project.client,
      product: project.product || '',
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate || '',
    })
    setShowModal(true)
  }

  const handleSaveProject = () => {
    if (!workspaceUser || !form.name.trim() || !form.client.trim()) {
      toast.error('Project name and client are required')
      return
    }

    const sourceProject = editingProject || null

    saveProject({
      id: sourceProject?.id,
      code: sourceProject?.code,
      name: form.name,
      client: form.client,
      product: form.product,
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || undefined,
      startDate: sourceProject?.startDate || new Date().toISOString().split('T')[0],
      ownerId: sourceProject?.ownerId || workspaceUser.id,
      ownerName: sourceProject?.ownerName || workspaceUser.fullName,
      team: sourceProject?.team || [workspaceUser.fullName],
      source: sourceProject?.source,
      linkedFieldJobId: sourceProject?.linkedFieldJobId,
    })

    toast.success(sourceProject ? 'Project updated' : 'Project created')
    setShowModal(false)
    setEditingProjectId(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="space-y-6">
      <div className="pm-hero p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="pm-section-title">Project management</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Projects command center</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-[15px]">
              Manage delivery health, client commitments, team ownership, and daily execution from one clean workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{summary.totalProjects} active views</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{summary.inFlightProjects} in flight</span>
              <span className="pm-badge bg-white/80 text-slate-700 ring-1 ring-slate-200">{summary.avgProgress}% avg completion</span>
            </div>
          </div>
          <button
            type="button"
            onClick={openNewProject}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            + New Project
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Visible projects" value={summary.totalProjects} detail="Projects matching your ownership and filters" />
          <MetricCard label="In progress" value={summary.inFlightProjects} detail="Workstreams currently moving" accent="text-blue-700" />
          <MetricCard label="Average progress" value={`${summary.avgProgress}%`} detail="Across the current portfolio view" accent="text-emerald-700" />
          <MetricCard label="Overdue" value={summary.overdueProjects} detail="Projects past target date and not completed" accent={summary.overdueProjects > 0 ? 'text-rose-700' : 'text-slate-900'} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="pm-grid-card p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="pm-section-title">Live attendance</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Stay on shift without leaving projects</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Attendance stays attached to project execution, so engineers and coordinators can punch in, review activity, and continue delivery planning from one place.
              </p>
            </div>
            <Link to="/employee/attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Open attendance
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <LiveStat title="Status" value={currentPunch ? 'Checked in' : 'Checked out'} tone={currentPunch ? 'text-emerald-600' : 'text-slate-900'} />
            <LiveStat title="Records" value={workspaceUser ? attendanceRecords.filter((record) => record.employeeId === workspaceUser.id).length : 0} />
            <LiveStat title="Started" value={currentPunch ? new Date(currentPunch.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'Ready'} />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={punchNote}
              onChange={(event) => setPunchNote(event.target.value)}
              placeholder="Optional note: client visit, WFH, deployment window..."
              className="pm-input min-w-0 flex-1 text-sm"
            />
            {currentPunch ? (
              <button
                type="button"
                onClick={() => {
                  if (!workspaceUser) return
                  punchOut(workspaceUser.id)
                  toast.success('Checked out successfully')
                }}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Punch Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!workspaceUser) return
                  punchIn(workspaceUser.id, workspaceUser.fullName, punchNote)
                  setPunchNote('')
                  toast.success('Checked in successfully')
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Punch In
              </button>
            )}
          </div>
        </div>

        <div className="pm-grid-card p-5 md:p-6">
          <p className="pm-section-title">Workspace focus</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Enterprise-ready operating view</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This module keeps portfolio status, execution workload, and attendance context visible together so day-to-day delivery decisions stay fast and low-friction.
          </p>
          <div className="mt-5 space-y-3">
            <FocusRow title="Portfolio visibility" detail="Search, review, and update live projects with clearer health signals." />
            <FocusRow title="Team accountability" detail="See owner, client, task completion, and schedule commitments at a glance." />
            <FocusRow title="Operational continuity" detail="Punch state and project work remain synchronized across the workspace." />
          </div>
        </div>
      </div>

      <div className="pm-toolbar p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="pm-input min-w-[220px] flex-1 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as WorkspaceProjectStatus | 'ALL')}
            className="pm-select text-sm"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${viewMode === 'cards' ? 'pm-tab-active' : 'pm-tab-idle'}`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${viewMode === 'list' ? 'pm-tab-active' : 'pm-tab-idle'}`}
            >
              List
            </button>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-slate-900">{visibleProjects.length} projects</p>
            <p className="text-xs text-slate-500">Open a project for delivery board, members, and timesheets.</p>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskStats={taskStats.get(project.id)}
              canEdit={canEditProject(project)}
              onEdit={() => openEditProject(project)}
            />
          ))}
          {visibleProjects.length === 0 && (
            <div className="pm-grid-card p-12 text-center text-sm text-slate-500 lg:col-span-2">No projects match the current filters.</div>
          )}
        </div>
      ) : (
        <div className="pm-grid-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleProjects.map((project) => {
                  const stats = taskStats.get(project.id) || { total: 0, done: 0 }
                  return (
                    <tr key={project.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        <Link to={`/employee/projects/${project.id}`} className="hover:text-blue-700">
                          {project.name}
                        </Link>
                        <p className="mt-1 text-xs font-normal text-slate-500">{project.product || 'General delivery'}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{project.code}</td>
                      <td className="px-4 py-4 text-slate-600">{project.client}</td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PROJECT_STATUS_STYLES[project.status]}`}>{project.status.replace(/_/g, ' ')}</span></td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PROJECT_PRIORITY_STYLES[project.priority]}`}>{project.priority}</span></td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="min-w-[120px]">
                          <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
                          </div>
                          <p className="mt-1 text-xs font-semibold text-slate-700">{project.progress}%</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{project.ownerName}</td>
                      <td className="px-4 py-4 text-slate-600">{stats.done}/{stats.total}</td>
                      <td className="px-4 py-4">
                        {canEditProject(project) ? (
                          <button
                            type="button"
                            onClick={() => openEditProject(project)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Manager only</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editingProjectId ? 'Edit project' : 'Create project'}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Project name</label>
                <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Client</label>
                <input value={form.client} onChange={(event) => setForm((state) => ({ ...state, client: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Product</label>
                <input value={form.product} onChange={(event) => setForm((state) => ({ ...state, product: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value as WorkspaceProjectStatus }))} className="pm-select mt-1 text-sm">
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={form.priority} onChange={(event) => setForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="pm-select mt-1 text-sm">
                  {PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Target date</label>
                <input type="date" value={form.dueDate} onChange={(event) => setForm((state) => ({ ...state, dueDate: event.target.value }))} className="pm-input mt-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} rows={4} className="pm-textarea mt-1 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingProjectId(null)
                  setForm(EMPTY_FORM)
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button type="button" onClick={handleSaveProject} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {editingProjectId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LiveStat = ({ title, value, tone = 'text-slate-900' }: { title: string; value: string | number; tone?: string }) => (
  <div className="pm-stat-card p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
  </div>
)

const MetricCard = ({
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

const FocusRow = ({ title, detail }: { title: string; detail: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/75 px-4 py-3">
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
  </div>
)

const ProjectCard = ({
  project,
  taskStats,
  onEdit,
  canEdit,
}: {
  project: WorkspaceProject
  taskStats?: { total: number; done: number }
  onEdit: () => void
  canEdit: boolean
}) => {
  const stats = taskStats || { total: 0, done: 0 }
  return (
    <Link to={`/employee/projects/${project.id}`} className="pm-grid-card p-5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{project.code}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">{project.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{project.client} · {project.product || 'General delivery'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PROJECT_STATUS_STYLES[project.status]}`}>{project.status.replace(/_/g, ' ')}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PROJECT_PRIORITY_STYLES[project.priority]}`}>{project.priority}</span>
          {canEdit ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onEdit()
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Project Manager</span>
          )}
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{project.description || 'No project description yet. Open the project to add scope, client context, and delivery notes.'}</p>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
        <div>
          <p className="uppercase tracking-[0.12em]">Progress</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{project.progress}%</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.12em]">Tasks</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{stats.done}/{stats.total}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.12em]">Owner</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{project.ownerName}</p>
        </div>
      </div>
    </Link>
  )
}

export default ProjectsPage