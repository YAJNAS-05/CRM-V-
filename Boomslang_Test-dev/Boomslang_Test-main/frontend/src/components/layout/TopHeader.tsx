import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { activityApi } from '../../api/crmApi'
import { Activity } from '../../types/crm'

const getPageContext = (pathname: string) => {
  if (pathname.startsWith('/crm/leads')) return { title: 'Leads', subtitle: 'Capture and qualify demand' }
  if (pathname.startsWith('/crm/contacts')) return { title: 'Contacts', subtitle: 'Customer and prospect network' }
  if (pathname.startsWith('/crm/deals')) return { title: 'Deals', subtitle: 'Move opportunities to close' }
  if (pathname.startsWith('/crm/accounts')) return { title: 'Accounts', subtitle: 'Customer companies and relationships' }
  if (pathname.startsWith('/crm/activities')) return { title: 'Activities', subtitle: 'Tasks, calls, and follow-ups' }
  if (pathname.startsWith('/erp')) return { title: 'ERP', subtitle: 'Operations and fulfillment workflows' }
  if (pathname.startsWith('/finance')) return { title: 'Finance', subtitle: 'Billing, payments, and controls' }
  if (pathname.startsWith('/fieldwork')) return { title: 'Field Work', subtitle: 'Service execution and dispatch' }
  if (pathname.startsWith('/reports')) return { title: 'Reports', subtitle: 'Insights for every team' }
  if (pathname.startsWith('/admin')) return { title: 'Administration', subtitle: 'Roles, users, and governance' }
  return { title: 'Dashboard', subtitle: 'Unified workspace' }
}

const TopHeader: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, accessToken } = useAuthStore()
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [dueActivities, setDueActivities] = useState<Activity[]>([])
  const quickRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const pageContext = useMemo(() => getPageContext(location.pathname), [location.pathname])

  const userPermissions = user?.permissions || []
  const canReadActivities = userPermissions.includes('CRM_VIEW') || userPermissions.includes('REPORT_VIEW') || userPermissions.includes('DASHBOARD_VIEW')

  const isDashboard = location.pathname === '/crm/dashboard' || location.pathname === '/'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuickCreate(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setShowAvatar(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
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
    }

    document.addEventListener('keydown', closeMenusOnEscape)
    return () => document.removeEventListener('keydown', closeMenusOnEscape)
  }, [])

  // Fetch activities due soon (overdue or due within 1 day)
  useEffect(() => {
    if (!accessToken || !canReadActivities) {
      setDueActivities([])
      return
    }

    let canPoll = true

    const fetchDue = async () => {
      try {
        const resp = await activityApi.getAll(0, 100)
        const all: Activity[] = resp.data.data?.content || resp.data.data || []
        const now = new Date()
        const oneDayMs = 24 * 60 * 60 * 1000
        const due = all.filter((a: Activity) => {
          if (!a.dueDate || a.status === 'COMPLETED') return false
          const dueTime = new Date(a.dueDate).getTime()
          return dueTime - now.getTime() <= oneDayMs
        }).sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
        setDueActivities(due)
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401 || status === 403) {
          canPoll = false
          setDueActivities([])
        }
      }
    }

    fetchDue()

    const interval = setInterval(() => {
      if (canPoll) {
        void fetchDue()
      }
    }, 60000) // refresh every minute

    return () => clearInterval(interval)
  }, [accessToken, canReadActivities])

  const quickCreateItems = [
    { label: 'Lead', href: '/crm/leads/new', iconPath: 'M15 7a3 3 0 11-6 0 3 3 0 016 0zM5 20a7 7 0 0114 0' },
    { label: 'Contact', href: '/crm/contacts/new', iconPath: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Deal', href: '/crm/deals/new', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Account', href: '/crm/accounts/new', iconPath: 'M3 21h18M5 21V7l8-4 8 4v14M9 9h2m4 0h2m-8 4h2m4 0h2' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
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
          onClick={() => navigate('/crm/dashboard')}
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
        {isDashboard && (
          <div className="relative" ref={quickRef}>
            <button
              type="button"
              aria-expanded={showQuickCreate}
              aria-haspopup="menu"
              aria-label="Open quick create menu"
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Create</span>
            </button>
            {showQuickCreate && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
                {quickCreateItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.href); setShowQuickCreate(false) }}
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

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-expanded={showNotifications}
            aria-haspopup="menu"
            aria-label="Open notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {dueActivities.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {dueActivities.length > 9 ? '9+' : dueActivities.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[20rem] rounded-lg border border-slate-200 bg-white shadow-lg z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-400">{dueActivities.length} activity reminder{dueActivities.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {dueActivities.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400">No upcoming reminders</p>
                  </div>
                ) : (
                  dueActivities.map((act) => {
                    const isOverdue = new Date(act.dueDate!).getTime() < Date.now()
                    return (
                      <button
                        key={act.id}
                        onClick={() => { setShowNotifications(false); navigate('/crm/activities') }}
                        className="w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-amber-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{act.subject || act.type}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {act.type} &middot; Due {new Date(act.dueDate!).toLocaleDateString()}
                            </p>
                            <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isOverdue ? 'Overdue' : 'Due Soon'}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
              {dueActivities.length > 0 && (
                  <div className="border-t border-slate-100 px-4 py-2.5">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/crm/activities') }}
                      className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View all activities →
                  </button>
                </div>
              )}
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
