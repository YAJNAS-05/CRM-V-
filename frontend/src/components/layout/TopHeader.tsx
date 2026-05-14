import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import useEmployeeWorkspace from '../../hooks/useEmployeeWorkspace'
import { useEmployeeWorkspaceStore } from '../../store/employeeWorkspaceStore'
import { useNotificationStore } from '../../store/notificationStore'
import { notificationApi } from '../../api/notificationApi'

const getPageContext = (pathname: string) => {
  if (pathname === '/dashboard') return { title: 'Dashboards', subtitle: 'Role-based views and priorities' }
  if (pathname.startsWith('/dashboard/crm')) return { title: 'CRM Dashboard', subtitle: 'Pipeline and activity performance' }
  if (pathname.startsWith('/dashboard/operations')) return { title: 'Operations Dashboard', subtitle: 'Cross-team execution and risk' }
  if (pathname.startsWith('/dashboard/finance')) return { title: 'Finance Dashboard', subtitle: 'Cash flow, invoices, and collections' }
  if (pathname.startsWith('/dashboard/hr/manager') || pathname === '/dashboard/manager') return { title: 'Manager Dashboard', subtitle: 'Approvals, coverage, and onboarding' }
  if (pathname.startsWith('/dashboard/hr')) return { title: 'HR Dashboard', subtitle: 'People health, leave, and payroll' }
  if (pathname.startsWith('/dashboard/technician')) return { title: 'Technician Dashboard', subtitle: 'Assigned work orders and schedule' }
  if (pathname.startsWith('/dashboard/fieldwork')) return { title: 'Field Work Dashboard', subtitle: 'Execution status and schedules' }
  if (pathname.startsWith('/dashboard/employee')) return { title: 'My Work', subtitle: 'Projects, tasks, time, and attendance' }
  if (pathname === '/employee') return { title: 'My Work', subtitle: 'Projects, tasks, time, and attendance' }
  if (pathname.startsWith('/employee/projects/')) return { title: 'Project Workspace', subtitle: 'Board, task flow, and linked time entries' }
  if (pathname.startsWith('/employee/projects')) return { title: 'Projects', subtitle: 'Project status, progress, and ownership' }
  if (pathname.startsWith('/employee/tasks')) return { title: 'My Tasks', subtitle: 'Assigned work, status, and quick time logging' }
  if (pathname.startsWith('/employee/timesheets')) return { title: 'Timesheets', subtitle: 'Log time against real tasks' }
  if (pathname.startsWith('/employee/attendance')) return { title: 'Attendance', subtitle: 'Punch in and out from your workspace' }
  if (pathname.startsWith('/crm/dashboard')) return { title: 'CRM Dashboard', subtitle: 'Pipeline and activity performance' }
  if (pathname.startsWith('/crm/leads')) return { title: 'Leads', subtitle: 'Capture and qualify demand' }
  if (pathname.startsWith('/crm/contacts')) return { title: 'Contacts', subtitle: 'Customer and prospect network' }
  if (pathname.startsWith('/crm/deals')) return { title: 'Deals', subtitle: 'Move opportunities to close' }
  if (pathname.startsWith('/crm/accounts')) return { title: 'Accounts', subtitle: 'Customer companies and relationships' }
  if (pathname.startsWith('/crm/activities')) return { title: 'Activities', subtitle: 'Plan and track customer follow-ups' }
  if (pathname.startsWith('/crm/quotes')) return { title: 'Quotes', subtitle: 'Proposals, pricing, and approvals' }
  if (pathname.startsWith('/finance/close')) return { title: 'Financial Close', subtitle: 'Month-end controls and exception resolution' }
  if (pathname === '/hr') return { title: 'HR Home', subtitle: 'People operations command center' }
  if (pathname.startsWith('/hr/people')) return { title: 'People', subtitle: 'Employee records and profiles' }
  if (pathname.startsWith('/hr/payroll/wizard')) return { title: 'Payroll Wizard', subtitle: 'Run payroll in three steps' }
  if (pathname.startsWith('/hr/payroll')) return { title: 'Payroll', subtitle: 'Pay runs and compliance' }
  if (pathname.startsWith('/hr/leave')) return { title: 'Leave', subtitle: 'Requests, approvals, and balances' }
  if (pathname.startsWith('/hr/time')) return { title: 'Time & Attendance', subtitle: 'Timesheets and rosters' }
  if (pathname.startsWith('/hr/recruit')) return { title: 'Recruitment', subtitle: 'Hiring pipeline and offers' }
  if (pathname.startsWith('/hr/onboard')) return { title: 'Onboarding', subtitle: 'New hire journeys' }
  if (pathname.startsWith('/hr/performance')) return { title: 'Performance', subtitle: 'Reviews, goals, and feedback' }
  if (pathname.startsWith('/hr/compliance')) return { title: 'Compliance', subtitle: 'Awards, visas, and policies' }
  if (pathname.startsWith('/hr/analytics')) return { title: 'HR Analytics', subtitle: 'People insights and trends' }
  if (pathname.startsWith('/hr/reimbursements')) return { title: 'Reimbursements', subtitle: 'Expense approvals and payouts' }
  if (pathname.startsWith('/hr/')) return { title: 'HR', subtitle: 'People operations and compliance' }
  if (pathname.startsWith('/erp')) return { title: 'ERP', subtitle: 'Operations and fulfillment workflows' }
  if (pathname.startsWith('/finance')) return { title: 'Finance', subtitle: 'Billing, payments, and controls' }
  if (pathname.startsWith('/fieldwork')) return { title: 'Field Work', subtitle: 'Service execution and dispatch' }
  if (pathname.startsWith('/reports')) return { title: 'Reports', subtitle: 'Insights for every team' }
  if (pathname.startsWith('/admin')) return { title: 'Administration', subtitle: 'Roles, users, and governance' }
  return { title: 'Dashboard', subtitle: 'Unified workspace' }
}

const resolveRoles = (roles?: string[], role?: string | null) => {
  if (roles && roles.length > 0) return roles
  if (role) return [role]
  return []
}

const formatAttendanceDuration = (startedAt: string, nowMs: number) => {
  const totalSeconds = Math.max(0, Math.floor((nowMs - new Date(startedAt).getTime()) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatTaskTimerDuration = (startedAt: number, nowMs: number) => {
  const totalSeconds = Math.max(0, Math.floor((nowMs - startedAt) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const TopHeader: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { workspaceUser, isEmployee } = useEmployeeWorkspace()
  const { unreadCount, markAllRead, notifications, setNotifications } = useNotificationStore()
  const attendanceRecords = useEmployeeWorkspaceStore((state) => state.attendanceRecords)
  const punchIn = useEmployeeWorkspaceStore((state) => state.punchIn)
  const punchOut = useEmployeeWorkspaceStore((state) => state.punchOut)
  const taskTimer = useEmployeeWorkspaceStore((state) => state.taskTimer)
  const tasks = useEmployeeWorkspaceStore((state) => state.tasks)
  const projects = useEmployeeWorkspaceStore((state) => state.projects)
  const canCreate = user?.permissions?.includes('CRM_CREATE') ?? false
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAttendancePanel, setShowAttendancePanel] = useState(false)
  const [attendanceNote, setAttendanceNote] = useState('')
  const [attendanceNow, setAttendanceNow] = useState(Date.now())
  const [taskTimerNow, setTaskTimerNow] = useState(Date.now())
  const quickRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const attendanceRef = useRef<HTMLDivElement>(null)
  const pageContext = useMemo(() => getPageContext(location.pathname), [location.pathname])
  const userRoles = useMemo(() => resolveRoles(user?.roles, user?.role), [user?.role, user?.roles])
  const showEmployeeAttendance = isEmployee && userRoles.includes('EMPLOYEE') && !!workspaceUser
  const currentPunch = useMemo(
    () =>
      workspaceUser
        ? attendanceRecords.find((record) => record.employeeId === workspaceUser.id && !record.punchOut) || null
        : null,
    [attendanceRecords, workspaceUser],
  )
  const attendanceDuration = useMemo(
    () => (currentPunch ? formatAttendanceDuration(currentPunch.punchIn, attendanceNow) : null),
    [attendanceNow, currentPunch],
  )
  const activeTask = useMemo(
    () => (taskTimer ? tasks.find((task) => task.id === taskTimer.taskId) || null : null),
    [taskTimer, tasks],
  )
  const activeProject = useMemo(
    () => (taskTimer ? projects.find((project) => project.id === taskTimer.projectId) || null : null),
    [projects, taskTimer],
  )
  const taskTimerDuration = useMemo(
    () => (taskTimer ? formatTaskTimerDuration(taskTimer.startedAt, taskTimerNow) : null),
    [taskTimer, taskTimerNow],
  )

  const isDashboard =
    location.pathname.startsWith('/dashboard/crm') ||
    location.pathname.startsWith('/dashboard/operations') ||
    location.pathname.startsWith('/dashboard/finance') ||
    location.pathname.startsWith('/dashboard/hr') ||
    location.pathname.startsWith('/dashboard/manager') ||
    location.pathname.startsWith('/dashboard/hr/manager') ||
    location.pathname.startsWith('/dashboard/technician') ||
    location.pathname.startsWith('/dashboard/fieldwork') ||
    location.pathname.startsWith('/dashboard/employee') ||
    location.pathname.startsWith('/employee') ||
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/crm/dashboard') ||
    location.pathname === '/'

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) setShowQuickCreate(false)
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) setShowAvatar(false)
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) setShowNotifications(false)
      if (attendanceRef.current && !attendanceRef.current.contains(event.target as Node)) setShowAttendancePanel(false)
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const closeMenusOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setShowQuickCreate(false)
      setShowAvatar(false)
      setShowNotifications(false)
      setShowAttendancePanel(false)
    }

    document.addEventListener('keydown', closeMenusOnEscape)
    return () => document.removeEventListener('keydown', closeMenusOnEscape)
  }, [])

  useEffect(() => {
    if (!user?.email) {
      setNotifications([])
      return
    }

    notificationApi.listMyNotifications()
      .then((response) => {
        const backendNotifications = response.data.data ?? []
        setNotifications(
          backendNotifications.map((notification) => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            dedupeKey: notification.dedupeKey,
            timestamp: new Date(notification.timestamp).getTime(),
            read: notification.isRead,
            duration: 0,
          }))
        )
      })
      .catch(() => {
        // Ignore hydrate errors to avoid blocking page rendering.
      })
  }, [setNotifications, user?.email])

  useEffect(() => {
    setAttendanceNow(Date.now())

    if (!currentPunch) {
      return
    }

    const interval = window.setInterval(() => setAttendanceNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [currentPunch])

  useEffect(() => {
    setTaskTimerNow(Date.now())

    if (!taskTimer) {
      return
    }

    const interval = window.setInterval(() => setTaskTimerNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [taskTimer])

  const quickCreateItems = [
    { label: 'Lead', href: '/crm/leads/new', iconPath: 'M15 7a3 3 0 11-6 0 3 3 0 016 0zM5 20a7 7 0 0114 0' },
    { label: 'Contact', href: '/crm/contacts/new', iconPath: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Deal', href: '/crm/deals/new', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Account', href: '/crm/accounts/new', iconPath: 'M3 21h18M5 21V7l8-4 8 4v14M9 9h2m4 0h2m-8 4h2m4 0h2' },
    { label: 'Quote', href: '/crm/quotes/new', iconPath: 'M7 7h10M7 11h10M7 15h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H7l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePunchIn = () => {
    if (!workspaceUser) return
    punchIn(workspaceUser.id, workspaceUser.fullName, attendanceNote)
    setAttendanceNote('')
    setShowAttendancePanel(false)
    toast.success('Checked in successfully')
  }

  const handlePunchOut = () => {
    if (!workspaceUser) return
    punchOut(workspaceUser.id)
    setShowAttendancePanel(false)
    toast.success('Checked out successfully')
  }

  const initials = user ? `${(user.fullName || 'U')[0]}` : 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white px-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex h-full max-w-[1920px] items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-extrabold text-white">E</span>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-bold tracking-[0.03em] text-slate-900">EVERX CRM</p>
            <p className="truncate text-[11px] text-slate-500">Enterprise Operations</p>
          </div>
        </button>

        <div className="hidden min-w-0 flex-1 px-3 lg:block">
          <p className="truncate text-sm font-semibold text-slate-900">{pageContext.title}</p>
          <p className="truncate text-xs text-slate-500">{pageContext.subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {taskTimer && activeTask && activeProject && (
            <button
              type="button"
              onClick={() => navigate(`/employee/projects/${activeProject.id}`)}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:text-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="hidden max-w-[160px] truncate sm:inline">{activeTask.title}</span>
              <span className="sm:hidden">Task</span>
              {taskTimerDuration && <span className="text-xs font-semibold">{taskTimerDuration}</span>}
            </button>
          )}
          {showEmployeeAttendance && (
            <div className="relative" ref={attendanceRef}>
              <button
                type="button"
                aria-expanded={showAttendancePanel}
                aria-haspopup="dialog"
                onClick={() => setShowAttendancePanel((value) => !value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${currentPunch ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${currentPunch ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="hidden md:inline">{currentPunch ? `On duty ${attendanceDuration}` : 'Punch In'}</span>
                <span className="md:hidden">{currentPunch ? 'IN' : 'OUT'}</span>
              </button>
              {showAttendancePanel && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-lg z-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Attendance</p>
                      <p className="mt-1 text-xs text-slate-500">Visible only for employee users.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/employee/attendance')
                        setShowAttendancePanel(false)
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Open page
                    </button>
                  </div>

                  <div className={`mt-4 rounded-xl border px-3 py-3 ${currentPunch ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{currentPunch ? 'Checked in' : 'Ready to start'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currentPunch
                        ? `Started at ${new Date(currentPunch.punchIn).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Use this control to capture punch in and punch out without leaving the page.'}
                    </p>
                    {currentPunch && attendanceDuration && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Session {attendanceDuration}</p>
                    )}
                  </div>

                  {currentPunch?.note ? (
                    <p className="mt-3 text-xs text-slate-500">Note: {currentPunch.note}</p>
                  ) : !currentPunch ? (
                    <textarea
                      value={attendanceNote}
                      onChange={(event) => setAttendanceNote(event.target.value)}
                      rows={3}
                      placeholder="Optional note for today"
                      className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  ) : null}

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAttendancePanel(false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Close
                    </button>
                    {currentPunch ? (
                      <button
                        type="button"
                        onClick={handlePunchOut}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        Punch Out
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePunchIn}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Punch In
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isDashboard && canCreate && (
            <div className="relative" ref={quickRef}>
              <button
                type="button"
                aria-expanded={showQuickCreate}
                aria-haspopup="menu"
                aria-label="Open quick create menu"
                onClick={() => setShowQuickCreate(!showQuickCreate)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create</span>
              </button>
              {showQuickCreate && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
                  {quickCreateItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.href)
                        setShowQuickCreate(false)
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications) {
                  markAllRead()
                  notificationApi.markAllRead().catch(() => {
                    // Do not block UI if backend mark-read fails.
                  })
                }
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <span className="text-xs text-slate-400">{notifications.length} items</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.slice().reverse().map((notification) => (
                      <div key={notification.id} className={`border-b border-slate-50 px-4 py-3 ${notification.read ? '' : 'bg-blue-50/40'}`}>
                        <p className="text-xs font-semibold text-slate-800">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={avatarRef}>
            <button
              type="button"
              aria-expanded={showAvatar}
              aria-haspopup="menu"
              aria-label="Open account menu"
              onClick={() => setShowAvatar(!showAvatar)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-1 pr-2 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAvatar && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    {user?.roles && user.roles.length > 0 ? user.roles[0] : user?.role}
                  </span>
                </div>
                <button onClick={() => { navigate('/profile'); setShowAvatar(false) }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Profile</button>
                <button onClick={() => { navigate('/profile'); setShowAvatar(false) }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">Settings</button>
                <hr className="my-1 border-slate-100" />
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopHeader
