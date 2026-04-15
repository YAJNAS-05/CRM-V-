import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { activityApi } from '../../api/crmApi'
import { Activity } from '../../types/crm'

const TopHeader: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [dueActivities, setDueActivities] = useState<Activity[]>([])
  const quickRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

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

  // Fetch activities due soon (overdue or due within 1 day)
  useEffect(() => {
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
        })
        setDueActivities(due)
      } catch { /* ignore */ }
    }
    fetchDue()
    const interval = setInterval(fetchDue, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [])

  const quickCreateItems = [
    { label: 'Lead', icon: '👤', href: '/crm/leads/new' },
    { label: 'Contact', icon: '📇', href: '/crm/contacts/new' },
    { label: 'Deal', icon: '💰', href: '/crm/deals/new' },
    { label: 'Account', icon: '🏢', href: '/crm/accounts/new' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user ? `${(user.fullName || 'U')[0]}` : 'U'

  return (
    <header className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 flex items-center px-4 shadow-sm">
      {/* Left: Hamburger + Logo */}
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 mr-3 text-gray-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center mr-6 cursor-pointer" onClick={() => navigate('/crm/dashboard')}>
        <span className="text-xl font-black text-indigo-600 tracking-tight">EVERX</span>
        <span className="text-xl font-light text-gray-400 ml-1">- CRM Bslang</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Quick Create + Notifications + Avatar */}
      <div className="flex items-center space-x-2 ml-6">
        {/* Quick Create — only on dashboard */}
        {isDashboard && (
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            {showQuickCreate && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {quickCreateItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.href); setShowQuickCreate(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative"
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
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-400">{dueActivities.length} activity reminder{dueActivities.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {dueActivities.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">No upcoming reminders</p>
                  </div>
                ) : (
                  dueActivities.map((act) => {
                    const isOverdue = new Date(act.dueDate!).getTime() < Date.now()
                    return (
                      <button
                        key={act.id}
                        onClick={() => { setShowNotifications(false); navigate('/crm/activities') }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 transition"
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-amber-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{act.subject || act.type}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
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
                <div className="px-4 py-2.5 border-t border-gray-100">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/crm/activities') }}
                    className="w-full text-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    View all activities →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar Menu */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setShowAvatar(!showAvatar)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAvatar && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{user?.role}</span>
              </div>
              <button onClick={() => { navigate('/profile'); setShowAvatar(false) }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Profile</button>
              <button onClick={() => { navigate('/profile'); setShowAvatar(false) }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Settings</button>
              <hr className="my-1 border-gray-100" />
              <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopHeader
