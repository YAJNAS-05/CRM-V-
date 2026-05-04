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
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Project management</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Projects</h1>
            <p className="mt-2 text-sm text-slate-600">Track your active projects, status, owners, and task health without leaving the employee workspace.</p>
          </div>
          <button
            type="button"
            onClick={openNewProject}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Project
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="shell-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Live punch</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Check in from the project module</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Start or end your shift without leaving the workspace. The header punch and attendance page stay in sync.
              </p>
            </div>
            <Link to="/employee/attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Open attendance
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <LiveStat title="Status" value={currentPunch ? 'Checked in' : 'Checked out'} tone={currentPunch ? 'text-emerald-600' : 'text-slate-900'} />
            <LiveStat title="Records" value={workspaceUser ? attendanceRecords.filter((record) => record.employeeId === workspaceUser.id).length : 0} />
            <LiveStat title="Today" value={currentPunch ? new Date(currentPunch.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'Ready'} />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={punchNote}
              onChange={(event) => setPunchNote(event.target.value)}
              placeholder="Optional note: client visit, WFH, deployment window..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {currentPunch ? (
              <button
                type="button"
                onClick={() => {
                  if (!workspaceUser) return
                  punchOut(workspaceUser.id)
                  toast.success('Checked out successfully')
                }}
                className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
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
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Punch In
              </button>
            )}
          </div>
        </div>

        <div className="shell-card p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Workspace focus</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Project + attendance</h2>
          <p className="mt-2 text-sm text-slate-600">
            Projects, tasks, and punch state stay visible in one place so the workspace behaves like a live operations console.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">What to do here</p>
            <ul className="mt-2 space-y-1">
              <li>• Create and manage projects</li>
              <li>• Log time against tasks</li>
              <li>• Punch in or out when your shift changes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="shell-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as WorkspaceProjectStatus | 'ALL')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <div className="inline-flex rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              List
            </button>
          </div>
          <p className="text-xs text-slate-500">Tap a project to open details or use Edit to update it.</p>
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
            <div className="shell-card p-12 text-center text-sm text-slate-500 lg:col-span-2">No projects match the current filters.</div>
          )}
        </div>
      ) : (
        <div className="shell-card overflow-hidden">
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
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        <Link to={`/employee/projects/${project.id}`} className="hover:text-blue-700">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{project.code}</td>
                      <td className="px-4 py-4 text-slate-600">{project.client}</td>
                      <td className="px-4 py-4 text-slate-600">{project.status.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-4 text-slate-600">{project.priority}</td>
                      <td className="px-4 py-4 text-slate-600">{project.progress}%</td>
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
                <input value={form.name} onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Client</label>
                <input value={form.client} onChange={(event) => setForm((state) => ({ ...state, client: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Product</label>
                <input value={form.product} onChange={(event) => setForm((state) => ({ ...state, product: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value as WorkspaceProjectStatus }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority</label>
                <select value={form.priority} onChange={(event) => setForm((state) => ({ ...state, priority: event.target.value as WorkspacePriority }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Target date</label>
                <input type="date" value={form.dueDate} onChange={(event) => setForm((state) => ({ ...state, dueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
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
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
    <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
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
    <Link to={`/employee/projects/${project.id}`} className="shell-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{project.code}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{project.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{project.client} · {project.product || 'General delivery'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{project.status.replace(/_/g, ' ')}</span>
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
      <p className="mt-4 text-sm text-slate-600">{project.description}</p>
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