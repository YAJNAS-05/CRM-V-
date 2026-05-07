import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectApi, taskApi } from '../../api/pmApi'
import { useAuthStore } from '../../store/authStore'

const PMDashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)

  const projectsQuery = useQuery({
    queryKey: ['pm', 'projects', 'dashboard'],
    queryFn: async () => {
      const res = await projectApi.getAll(0, 200)
      return res.data.data
    },
  })

  const myTasksQuery = useQuery({
    enabled: Boolean(user?.id),
    queryKey: ['pm', 'tasks', 'dashboard', 'assignee', user?.id],
    queryFn: async () => {
      const res = await taskApi.getAll(0, 200, { assigneeId: user?.id })
      return res.data.data
    },
  })

  const totals = useMemo(() => {
    const projectTotal = projectsQuery.data?.totalElements ?? 0
    const myTaskTotal = myTasksQuery.data?.totalElements ?? 0
    const openMyTasks =
      myTasksQuery.data?.content?.filter((task) => task.status !== 'DONE').length ?? 0
    return { projectTotal, myTaskTotal, openMyTasks }
  }, [myTasksQuery.data, projectsQuery.data])

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Project management</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">PM dashboard</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl">
          Track your projects and tasks at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Projects</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {projectsQuery.isLoading ? '—' : totals.projectTotal}
          </p>
          <p className="mt-2 text-sm text-slate-600">Projects you can access.</p>
          <Link to="/pm/projects" className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
            Open projects
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">My tasks</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {myTasksQuery.isLoading ? '—' : totals.openMyTasks}
          </p>
          <p className="mt-2 text-sm text-slate-600">Open tasks assigned to you.</p>
          <Link to="/pm/tasks" className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
            Open tasks
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Shortcuts</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link to="/pm/projects" className="block text-slate-700 hover:text-slate-900">
              View projects
            </Link>
            <Link to="/pm/tasks" className="block text-slate-700 hover:text-slate-900">
              View tasks
            </Link>
            <Link to="/employee/timesheets" className="block text-slate-700 hover:text-slate-900">
              Log time (timesheets)
            </Link>
          </div>
        </div>
      </div>

      {(projectsQuery.isError || myTasksQuery.isError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Unable to load PM dashboard data. Please try again.
        </div>
      )}
    </div>
  )
}

export default PMDashboardPage

