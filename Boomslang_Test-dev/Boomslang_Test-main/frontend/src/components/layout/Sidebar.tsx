import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}

interface MenuItem {
  name: string
  path: string
  icon: string
  requiredPermission?: string
  disabled?: boolean
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const isItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || (itemPath !== '/crm/dashboard' && pathname.startsWith(`${itemPath}/`))

const inferRequiredPermissionsForPath = (path: string): string[] => {
  if (path === '/crm/dashboard') return ['DASHBOARD_VIEW']
  if (path.startsWith('/crm/')) return ['CRM_VIEW']
  if (path.startsWith('/erp/')) return ['ERP_VIEW']
  if (path.startsWith('/finance/')) return ['FINANCE_VIEW']
  if (path.startsWith('/fieldwork')) return ['FIELDWORK_VIEW']
  if (path.startsWith('/reports')) return ['REPORT_VIEW']
  return []
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onClose }) => {
  const location = useLocation()
  const asideRef = useRef<HTMLElement>(null)
  const showCollapsed = collapsed && !mobileOpen
  const user = useAuthStore((state) => state.user)
  const userPermissions = user?.permissions || []
  const [menuQuery, setMenuQuery] = useState('')
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    CRM: false,
    ERP: false,
    FINANCE: false,
    FIELDWORK: false,
    REPORTING: false,
    SETTINGS: false,
  })

  const moduleViewPermissions: Record<string, string[]> = {
    CRM: ['CRM_VIEW', 'DASHBOARD_VIEW'],
    ERP: ['ERP_VIEW'],
    FINANCE: ['FINANCE_VIEW'],
    FIELDWORK: ['FIELDWORK_VIEW'],
    REPORTING: ['REPORT_VIEW'],
  }

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const groupIcons: Record<string, string> = {
    CRM: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    ERP: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    FINANCE: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    FIELDWORK: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    REPORTING: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    SETTINGS: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  }

  const menuGroups: MenuGroup[] = [
    {
      title: 'CRM',
      items: [
        { name: 'Dashboard', path: '/crm/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Leads', path: '/crm/leads', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { name: 'Contacts', path: '/crm/contacts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'Deals', path: '/crm/deals', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Accounts', path: '/crm/accounts', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { name: 'Activities', path: '/crm/activities', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      ]
    },
    {
      title: 'ERP',
      items: [
        { name: 'Equipment', path: '/erp/equipment', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
        { name: 'Inventory', path: '/erp/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Spare Parts', path: '/erp/spareparts', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { name: 'Suppliers', path: '/erp/suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Purchase Orders', path: '/erp/purchase-orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
        { name: 'Sales Orders', path: '/erp/sales-orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Shipments', path: '/erp/shipments', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
        { name: 'Service Tickets', path: '/erp/service-tickets', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Warranties', path: '/erp/warranties', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Subcontractors', path: '/erp/subcontractors', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Invoices', path: '/finance/invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Payments', path: '/finance/payments', icon: 'M3 10h18M7 15h1m4 0h1m4 0h1M7 11h1m4 0h1m4 0h1m-10-7a2 2 0 012-2h4a2 2 0 012 2v2H7v-2z' },
        { name: 'Currency Rates', path: '/finance/currency', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Reports', path: '/finance/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ]
    },
    {
      title: 'FIELDWORK',
      items: [
        { name: 'Work Orders', path: '/fieldwork', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
      ]
    },
    {
      title: 'REPORTING',
      items: [
        { name: 'Reports', path: '/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'Custom Reports', path: '/reports/custom', icon: 'M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-8 0h8m-8 0H7a2 2 0 01-2-2V7a2 2 0 012-2h2m8 0h-2m2 0a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-8h.01M12 11h.01M16 11h.01M8 7h8' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { name: 'Roles & Permissions', path: '/admin/roles', icon: 'M9 12h6m-6 4h6M7 7h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z', requiredPermission: 'ROLE_VIEW' },
        { name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', requiredPermission: 'USER_VIEW' },
        { name: 'Audit Logs', path: '/admin/audit', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', requiredPermission: 'AUDIT_VIEW' },
        { name: 'ERP Mappings', path: '/admin/erp-mappings', icon: 'M13 10V3L4 14h7v7l9-11h-7z', requiredPermission: 'ERP_MAPPING_VIEW' },
      ]
    }
  ]

  const visibleMenuGroups = useMemo(
    () =>
      menuGroups
        .filter((group) => {
          if (group.title === 'SETTINGS') {
            return true
          }

          const requiredModulePermissions = moduleViewPermissions[group.title]
          if (!requiredModulePermissions || requiredModulePermissions.length === 0) {
            return true
          }

          return requiredModulePermissions.some((permission) =>
            userPermissions.includes(permission)
          )
        })
        .map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.requiredPermission) {
              return userPermissions.includes(item.requiredPermission)
            }

            const inferredPermissions = inferRequiredPermissionsForPath(item.path)
            if (inferredPermissions.length === 0) {
              return true
            }

            return inferredPermissions.some((permission) =>
              userPermissions.includes(permission)
            )
          })

          return {
            ...group,
            items: visibleItems,
          }
        })
        .filter((group) => group.items.length > 0),
    [menuGroups, userPermissions]
  )

  const filteredMenuGroups = useMemo(() => {
    const query = menuQuery.trim().toLowerCase()

    if (!query) {
      return visibleMenuGroups
    }

    return visibleMenuGroups
      .map((group) => {
        const groupMatches = group.title.toLowerCase().includes(query)
        const items = groupMatches
          ? group.items
          : group.items.filter(
              (item) =>
                item.name.toLowerCase().includes(query) ||
                item.path.toLowerCase().includes(query)
            )

        return {
          ...group,
          items,
        }
      })
      .filter((group) => group.items.length > 0)
  }, [menuQuery, visibleMenuGroups])

  useEffect(() => {
    if (showCollapsed) {
      setMenuQuery('')
    }
  }, [showCollapsed])

  useEffect(() => {
    setActiveFlyout(null)
  }, [location.pathname, showCollapsed])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!asideRef.current?.contains(event.target as Node)) {
        setActiveFlyout(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const desktopWidthClass = showCollapsed ? 'md:w-16' : 'md:w-64'

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 top-16 z-30 bg-slate-900/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        ref={asideRef}
        aria-label="Primary navigation"
        className={`fixed left-0 top-16 bottom-0 z-40 w-72 ${desktopWidthClass} border-r border-slate-200 bg-white flex flex-col transition-all duration-200 ${mobileOpen ? 'translate-x-0 shadow-xl shadow-slate-900/10' : '-translate-x-full'} md:translate-x-0 ${showCollapsed ? 'overflow-visible' : 'overflow-hidden'}`}
      >
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || 'User'}</p>
          <p className="text-xs text-slate-500 truncate">Quick navigation</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!showCollapsed && (
        <div className="px-3 py-3 border-b border-slate-100">
          <label htmlFor="sidebar-menu-search" className="sr-only">
            Search navigation menu
          </label>
          <input
            id="sidebar-menu-search"
            value={menuQuery}
            onChange={(event) => setMenuQuery(event.target.value)}
            placeholder="Search menu"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      <nav className={`flex-1 py-3 ${showCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'} overscroll-contain`}>
        {filteredMenuGroups.length === 0 ? (
          <div className="px-4 py-8 text-sm text-slate-500">No menu items match your search.</div>
        ) : (
          filteredMenuGroups.map((group) => {
          const isGroupActive = group.items.some((item) => isItemActive(location.pathname, item.path))
          const isFlyoutOpen = activeFlyout === group.title
          return (
          <div key={group.title} className="mb-1">
            {showCollapsed ? (
              <div className="relative">
                <button
                  type="button"
                  title={group.title}
                  aria-label={`Open ${group.title} section`}
                  aria-expanded={isFlyoutOpen}
                  onClick={() => {
                    setActiveFlyout((prev) => (prev === group.title ? null : group.title))
                  }}
                  className={`w-full flex items-center justify-center py-3 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
                    isGroupActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isGroupActive ? 2.5 : 2} d={groupIcons[group.title]} />
                  </svg>
                </button>
                <div className={`absolute left-full top-0 ml-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-2 transition-all duration-150 z-50 ${isFlyoutOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const isActive = isItemActive(location.pathname, item.path)
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => {
                          setActiveFlyout(null)
                          onClose()
                        }}
                        className={`flex items-center px-3 py-2 mx-1.5 rounded-md text-sm transition-colors duration-150 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <svg className={`w-4 h-4 mr-2.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                        </svg>
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
              <button
                type="button"
                aria-expanded={expandedSections[group.title]}
                onClick={() => toggleSection(group.title)}
                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
              >
                {group.title}
                <svg className={`w-3 h-3 transition-transform ${expandedSections[group.title] ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections[group.title] && group.items.map((item) => {
              const isActive = isItemActive(location.pathname, item.path)
              const isDisabled = 'disabled' in item && item.disabled
              return (
                <Link
                  key={item.name}
                  to={isDisabled ? '#' : item.path}
                  onClick={isDisabled ? (e) => e.preventDefault() : onClose}
                  className={`flex items-center px-4 py-2 mx-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 ${
                    isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <svg className={`w-[18px] h-[18px] mr-3 shrink-0 ${isActive ? 'text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                  </svg>
                  <span>{item.name}</span>
                  {isDisabled ? <span className="ml-auto text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">Soon</span> : null}
                </Link>
              )
            })}
            </>
            )}
          </div>
        )})
      )}
      </nav>
      </aside>
    </>
  )
}

export default Sidebar
