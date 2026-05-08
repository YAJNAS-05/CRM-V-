import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectApi } from '../../api/pmApi'
import { useAuthStore } from '../../store/authStore'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionLabel } from '../../utils/optionSet'
import { Project, ProjectStatus, CreateProjectRequest, UpdateProjectRequest } from '../../types/pm'

const FALLBACK_STATUS_OPTIONS: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'IN_REVIEW', 'DONE']

const EMPTY_FORM: CreateProjectRequest = {
  projectName: '',
  projectCode: '',
  description: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  budget: 0,
  currency: 'USD',
}

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [showModal, setShowModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateProjectRequest>(EMPTY_FORM)

  const { options: projectStatusOptions } = useOptionSet({
    module: 'PM',
    entity: 'PROJECT',
    field: 'status',
    fallbackValues: FALLBACK_STATUS_OPTIONS,
  })

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['pm-projects'],
    queryFn: () => projectApi.getAll(0, 100),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-projects'] })
      toast.success('Project created successfully')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) => projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-projects'] })
      toast.success('Project updated successfully')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project')
    },
  })

  const projects = projectsData?.data?.data?.content || []

  const visibleProjects = useMemo(() => {
    return projects
      .filter((project) => (statusFilter === 'ALL' ? true : project.status === statusFilter))
      .filter((project) => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return true
        return [project.projectName, project.projectCode, project.description || '']
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
  }, [projects, query, statusFilter])

  const openNewProject = () => {
    setEditingProjectId(null)
    setForm({
      ...EMPTY_FORM,
      ownerId: user?.id,
    })
    setShowModal(true)
  }

  const openEditProject = (project: Project) => {
    setEditingProjectId(project.id)
    setForm({
      projectName: project.projectName,
      projectCode: project.projectCode,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      budget: project.budget || 0,
      currency: project.currency || 'USD',
      ownerId: project.ownerId,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProjectId(null)
    setForm(EMPTY_FORM)
  }

  const handleSaveProject = () => {
    if (!form.projectName.trim()) {
      toast.error('Project name is required')
      return
    }

    if (editingProjectId) {
      updateMutation.mutate({ id: editingProjectId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Project Management</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Projects Directory</h1>
            <p className="mt-2 text-sm text-slate-600">Track and manage all enterprise projects and deliverables.</p>
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
            onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | 'ALL')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            {projectStatusOptions.map((option) => (
              <option key={option.id} value={option.value}>{option.label || option.value}</option>
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
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading projects...</div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              statusLabel={getOptionLabel(projectStatusOptions, project.status)}
              onEdit={() => openEditProject(project)}
            />
          ))}
          {visibleProjects.length === 0 && (
            <div className="shell-card p-12 text-center text-sm text-slate-500 lg:col-span-2 xl:col-span-3">No projects match the current filters.</div>
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      <Link to={`/pm/projects/${project.id}`} className="hover:text-blue-700">
                        {project.projectName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{project.projectCode}</td>
                    <td className="px-4 py-4 text-slate-600">{getOptionLabel(projectStatusOptions, project.status)}</td>
                    <td className="px-4 py-4 text-slate-600">{project.budget ? `${project.currency} ${project.budget}` : '-'}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openEditProject(project)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editingProjectId ? 'Edit Project' : 'Create Project'}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Project Name</label>
                <input value={form.projectName} onChange={(event) => setForm((state) => ({ ...state, projectName: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Project Code</label>
                <input value={form.projectCode} onChange={(event) => setForm((state) => ({ ...state, projectCode: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
                <select value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {projectStatusOptions.map((option) => (
                    <option key={option.id} value={option.value}>{option.label || option.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Start Date</label>
                <input type="date" value={form.startDate} onChange={(event) => setForm((state) => ({ ...state, startDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">End Date</label>
                <input type="date" value={form.endDate} onChange={(event) => setForm((state) => ({ ...state, endDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Budget</label>
                <input type="number" value={form.budget} onChange={(event) => setForm((state) => ({ ...state, budget: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                <textarea value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingProjectId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ProjectCard = ({
  project,
  statusLabel,
  onEdit,
}: {
  project: Project
  statusLabel: string
  onEdit: () => void
}) => {
  return (
    <Link to={`/pm/projects/${project.id}`} className="shell-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{project.projectCode}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{project.projectName}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 whitespace-nowrap">{statusLabel}</span>
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
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600 line-clamp-2">{project.description || 'No description provided.'}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div>
          <p className="uppercase tracking-[0.12em]">Dates</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-[0.12em]">Budget</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {project.budget ? `${project.currency} ${project.budget.toLocaleString()}` : 'Not set'}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ProjectsPage
