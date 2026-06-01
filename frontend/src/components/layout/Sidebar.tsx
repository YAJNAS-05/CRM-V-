import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'
import { usePermissions as useLocalRBAC } from '../../hooks/useRBAC'
import { hasAdminSettingsAccess } from '../../lib/settingsAccess'

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
  requiredRoles?: string[]
  disabled?: boolean
}

interface SubGroup {
  title: string
  items: MenuItem[]
  requiredRoles?: string[]
}

interface MenuGroup {
  title: string
  items: MenuItem[]
  subGroups?: SubGroup[]
  requiredRoles?: string[]
}

const HR_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR']
const HR_MANAGER_ROLES = ['MANAGER', ...HR_ADMIN_ROLES]
const HR_RECRUITER_ROLES = ['RECRUITER', ...HR_ADMIN_ROLES]
const HR_PAYROLL_ROLES = ['PAYROLL', ...HR_ADMIN_ROLES]
const HR_EXECUTIVE_ROLES = ['EXECUTIVE', ...HR_ADMIN_ROLES]
const HR_SELF_SERVICE_ROLES = ['EMPLOYEE', ...HR_MANAGER_ROLES]
const HR_ACCESS_ROLES = ['EMPLOYEE', 'MANAGER', 'RECRUITER', 'PAYROLL', 'EXECUTIVE', ...HR_ADMIN_ROLES]
const WORKSPACE_ACCESS_ROLES = ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']

const isItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`)

const inferRequiredPermissionsForPath = (path: string): string[] => {
  if (path === '/dashboard') return [
    'DASHBOARD_SELF_VIEW',
    'DASHBOARD_TEAM_VIEW',
    'DASHBOARD_FINANCE_VIEW',
    'DASHBOARD_HR_VIEW',
    'DASHBOARD_TECH_VIEW',
    'DASHBOARD_OPERATIONS_VIEW',
    'FIELDWORK_VIEW',
    'HR_VIEW'
  ]
  if (path === '/dashboard/crm/team') return ['DASHBOARD_TEAM_VIEW']
  if (path === '/dashboard/crm/user') return ['DASHBOARD_SELF_VIEW']
  if (path === '/dashboard/crm') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (path === '/dashboard/operations') return ['DASHBOARD_OPERATIONS_VIEW']
  if (path === '/dashboard/finance') return ['DASHBOARD_FINANCE_VIEW']
  if (path === '/dashboard/hr') return ['DASHBOARD_HR_VIEW']
  if (path === '/dashboard/technician') return ['DASHBOARD_TECH_VIEW']
  if (path === '/dashboard/fieldwork') return ['FIELDWORK_VIEW']
  if (path === '/dashboard/employee') return ['HR_VIEW']
  if (path === '/employee' || path.startsWith('/employee/')) return ['HR_VIEW']
  if (path === '/crm/dashboard/team') return ['DASHBOARD_TEAM_VIEW']
  if (path === '/crm/dashboard/user') return ['DASHBOARD_SELF_VIEW']
  if (path === '/crm/dashboard') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (path.startsWith('/crm/')) return ['CRM_VIEW']
  if (path.startsWith('/erp/')) return ['ERP_VIEW']
  if (path === '/hr' || path.startsWith('/hr/')) return ['HR_VIEW']
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
  const { hasAnyRole } = usePermissions()
  const { can: canModuleView } = useLocalRBAC()
  const userPermissions = user?.permissions || []
  const [menuQuery, setMenuQuery] = useState('')
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    DASHBOARDS: true,
    'MY WORK': true,
    CRM: true,
    ERP: false,
    HR: false,
    FINANCE: false,
    FIELDWORK: false,
    REPORTING: false,
    SETTINGS: false,
  })
  const [expandedSubSections, setExpandedSubSections] = useState<Record<string, boolean>>({})
  const toggleSubSection = (key: string) => {
    setExpandedSubSections((prev) => ({ ...prev, [key]: !(prev[key] !== false) }))
  }

  const moduleViewPermissions: Record<string, string[]> = {
    DASHBOARDS: [
      'DASHBOARD_SELF_VIEW',
      'DASHBOARD_TEAM_VIEW',
      'DASHBOARD_FINANCE_VIEW',
      'DASHBOARD_HR_VIEW',
      'DASHBOARD_TECH_VIEW',
      'DASHBOARD_OPERATIONS_VIEW',
      'FIELDWORK_VIEW',
      'HR_VIEW'
    ],
    CRM: ['CRM_VIEW'],
    ERP: ['ERP_VIEW'],
    HR: ['HR_VIEW'],
    FINANCE: ['FINANCE_VIEW'],
    FIELDWORK: ['FIELDWORK_VIEW'],
    REPORTING: ['REPORT_VIEW'],
  }

  const moduleKeyMap: Record<string, string> = {
    CRM: 'crm',
    ERP: 'pm',
    HR: 'hr',
    FINANCE: 'finance',
    FIELDWORK: 'fieldwork',
    SETTINGS: 'admin',
  }

  const itemModuleActionMap: Record<string, { module: string; action: string }> = {
    '/admin/users': { module: 'admin', action: 'view' },
    '/admin/roles': { module: 'admin', action: 'view' },
    '/admin/invite': { module: 'admin', action: 'create' },
    '/admin/audit': { module: 'admin', action: 'view' },
  }

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const groupIcons: Record<string, string> = {
    DASHBOARDS: 'M3 3h18v18H3V3zm4 4h4v4H7V7zm6 0h4v10h-4V7zm-6 6h4v4H7v-4z',
    'MY WORK': 'M3 5h18M3 12h12M3 19h18',
    CRM: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    ERP: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    HR: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    FINANCE: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    FIELDWORK: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    REPORTING: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    SETTINGS: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  }

  const menuGroups: MenuGroup[] = [
    {
      title: 'DASHBOARDS',
      items: [
        { name: 'Operations Dashboard', path: '/dashboard/operations', icon: 'M3 3h18v18H3V3zm4 4h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z' },
        { name: 'CRM Dashboard', path: '/dashboard/crm', icon: 'M3 3v18h18M7 14l3-3 3 2 4-5' },
        { name: 'Finance Dashboard', path: '/dashboard/finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'HR Dashboard', path: '/dashboard/hr', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Field Work Dashboard', path: '/dashboard/fieldwork', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
        { name: 'Technician Dashboard', path: '/dashboard/technician', icon: 'M9 11l3 3L22 4M2 20h20M7 20V9m10 11V9' },
      ]
    },
    {
      title: 'MY WORK',
      requiredRoles: WORKSPACE_ACCESS_ROLES,
      items: [
        { name: 'Workspace', path: '/employee', icon: 'M3 4h18v5H3V4zm0 7h11v9H3v-9zm13 0h5v9h-5v-9', requiredRoles: WORKSPACE_ACCESS_ROLES },
        { name: 'Projects', path: '/employee/projects', icon: 'M4 7h16M4 12h10M4 17h16', requiredRoles: WORKSPACE_ACCESS_ROLES },
        { name: 'My Tasks', path: '/employee/tasks', icon: 'M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01', requiredRoles: WORKSPACE_ACCESS_ROLES },
        { name: 'Timesheets', path: '/employee/timesheets', icon: 'M8 7V3m8 4V3m-9 8h10m-10 4h6m5 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z', requiredRoles: WORKSPACE_ACCESS_ROLES },
        { name: 'Attendance', path: '/employee/attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', requiredRoles: WORKSPACE_ACCESS_ROLES },
      ],
    },
    {
      title: 'CRM',
      items: [
        { name: 'Leads', path: '/crm/leads', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { name: 'Contacts', path: '/crm/contacts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'Deals', path: '/crm/deals', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Activities', path: '/crm/activities', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Quotes', path: '/crm/quotes', icon: 'M7 7h10M7 11h10M7 15h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H7l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
        { name: 'Accounts', path: '/crm/accounts', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      ]
    },
    {
      title: 'ERP',
      items: [
        { name: 'Suppliers', path: '/erp/suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Purchase Orders', path: '/erp/purchase-orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
        { name: 'Acquisitions', path: '/erp/acquisitions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2m-7-6h2m10 0h2M5 5l2 2m10 10l2 2M19 5l-2 2M7 17l-2 2' },
        { name: 'Equipment Assessments', path: '/erp/equipment-assessments', icon: 'M9 12h6m-6 4h6M7 7h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
        { name: 'Equipment', path: '/erp/equipment', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
        { name: 'Inventory', path: '/erp/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Equipment QC', path: '/erp/equipment-qc', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Sales Orders', path: '/erp/sales-orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Site Assessments', path: '/erp/site-assessments', icon: 'M8 11a4 4 0 118 0 4 4 0 01-8 0zm-5 9a9 9 0 1118 0H3z' },
        { name: 'Shipments', path: '/erp/shipments', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
        { name: 'Subcontractors', path: '/erp/subcontractors', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M3 11a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z' },
        { name: 'Warranties', path: '/erp/warranties', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Field Jobs', path: '/erp/field-jobs', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Service Tickets', path: '/erp/service-tickets', icon: 'M7 8h10M7 12h6m-8 8h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Spare Parts', path: '/erp/spareparts', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      ]
    },
    {
      title: 'HR',
      requiredRoles: HR_ACCESS_ROLES,
      items: [],
      subGroups: [
        {
          title: 'PEOPLE',
          requiredRoles: HR_ADMIN_ROLES,
          items: [
            { name: 'Employees', path: '/hr/employees', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { name: 'Departments', path: '/hr/departments', icon: 'M3 7h18M3 12h18M3 17h18' },
            { name: 'Positions & Grades', path: '/hr/positions', icon: 'M9 12h6m-6 4h6M7 7h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
            { name: 'Org Chart', path: '/hr/org-chart', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          ],
        },
        {
          title: 'PAYROLL',
          requiredRoles: HR_PAYROLL_ROLES,
          items: [
            { name: 'Payroll Runs', path: '/hr/payroll-runs', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Payroll Profiles', path: '/hr/payroll-profiles', icon: 'M9 12h6m-6 4h6M7 7h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
            { name: 'Payslips', path: '/hr/payslips', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { name: 'Reimbursements', path: '/hr/reimbursements', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', requiredRoles: HR_SELF_SERVICE_ROLES },
          ],
        },
        {
          title: 'LEAVE',
          requiredRoles: HR_SELF_SERVICE_ROLES,
          items: [
            { name: 'Leave Dashboard', path: '/hr/leave', icon: 'M8 7V3m8 4V3m-9 8h10M4 21h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z', requiredRoles: HR_ADMIN_ROLES },
            { name: 'Leave Policies', path: '/hr/leave-policies', icon: 'M9 12h6m-6 4h6M7 7h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5a2 2 0 012-2z', requiredRoles: HR_ADMIN_ROLES },
            { name: 'Leave Balances', path: '/hr/leave-balances', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', requiredRoles: HR_ADMIN_ROLES },
            { name: 'Holidays', path: '/hr/holidays', icon: 'M12 8V4m0 0L9 7m3-3l3 3m-9 5h12m-12 5h8m-8 4h12', requiredRoles: HR_ADMIN_ROLES },
            { name: 'Leave Requests', path: '/hr/leave-requests', icon: 'M8 7V3m8 4V3m-9 8h10m-10 4h6m-1 6h-7a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v5' },
          ],
        },
        {
          title: 'TIME & ATTENDANCE',
          requiredRoles: HR_MANAGER_ROLES,
          items: [
            { name: 'Time Dashboard', path: '/hr/time', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', requiredRoles: HR_ADMIN_ROLES },
            { name: 'Timesheets', path: '/hr/timesheets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { name: 'Attendance', path: '/hr/attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          ],
        },
        {
          title: 'RECRUITMENT',
          requiredRoles: HR_RECRUITER_ROLES,
          items: [
            { name: 'Pipeline', path: '/hr/recruit', icon: 'M6 7V6a3 3 0 013-3h6a3 3 0 013 3v1h2a1 1 0 011 1v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h2z' },
            { name: 'Candidates', path: '/hr/candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { name: 'Offer Letters', path: '/hr/offer-letters', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          ],
        },
        {
          title: 'ONBOARDING',
          requiredRoles: HR_ADMIN_ROLES,
          items: [
            { name: 'Onboarding', path: '/hr/onboard', icon: 'M5 13l4 4L19 7' },
            { name: 'Onboarding Tasks', path: '/hr/onboarding-tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { name: 'Exit F&F', path: '/hr/exit-fnf', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
          ],
        },
        {
          title: 'PERFORMANCE',
          requiredRoles: HR_ADMIN_ROLES,
          items: [
            { name: 'Overview', path: '/hr/performance', icon: 'M3 3v18h18M7 14l3-3 3 2 4-5' },
            { name: 'Analytics', path: '/hr/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', requiredRoles: HR_EXECUTIVE_ROLES },
            { name: 'Task Board', path: '/hr/tasks', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
          ],
        },
        {
          title: 'COMPLIANCE',
          requiredRoles: HR_ADMIN_ROLES,
          items: [
            { name: 'Compliance', path: '/hr/compliance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          ],
        },
        {
          title: 'TRAINING',
          requiredRoles: HR_ADMIN_ROLES,
          items: [
            { name: 'Training Catalog', path: '/hr/trainings', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { name: 'Documents', path: '/hr/documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          ],
        },
        {
          title: 'MY SPACE',
          requiredRoles: HR_SELF_SERVICE_ROLES,
          items: [
            { name: 'My Payslips', path: '/hr/my-payslips', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { name: 'My Appraisal', path: '/hr/my-appraisal', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
            { name: 'My Assets', path: '/hr/my-assets', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
          ],
        },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Invoices', path: '/finance/invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Payments', path: '/finance/payments', icon: 'M3 10h18M7 15h1m4 0h1m4 0h1M7 11h1m4 0h1m4 0h1m-10-7a2 2 0 012-2h4a2 2 0 012 2v2H7v-2z' },
        { name: 'Currency Rates', path: '/finance/currency', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Reports', path: '/finance/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'Financial Close', path: '/finance/close', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
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
        { name: 'Invite User', path: '/admin/invite', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', requiredRoles: ['SUPER_ADMIN', 'ADMIN'] },
      ]
    }
  ]

  const visibleMenuGroups = useMemo(
    () =>
      menuGroups
        .filter((group) => {
          if (group.requiredRoles && group.requiredRoles.length > 0) {
            if (!hasAnyRole(...group.requiredRoles)) {
              return false
            }
          }

          if (group.title === 'SETTINGS') {
            return hasAdminSettingsAccess(user)
          }

          const requiredModulePermissions = moduleViewPermissions[group.title]
          const moduleKey = moduleKeyMap[group.title]
          const hasModuleAccess = moduleKey ? canModuleView(moduleKey, 'view') : false
          if (!requiredModulePermissions || requiredModulePermissions.length === 0) {
            return true
          }

          return hasModuleAccess || requiredModulePermissions.some((permission) =>
            userPermissions.includes(permission)
          )
        })
        .map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.requiredRoles && item.requiredRoles.length > 0) {
              if (!hasAnyRole(...item.requiredRoles)) {
                return false
              }
            }

            if (item.requiredPermission) {
              const mappedPermission = itemModuleActionMap[item.path]
              const hasItemAccess = mappedPermission
                ? canModuleView(mappedPermission.module, mappedPermission.action)
                : false

              return hasItemAccess || userPermissions.includes(item.requiredPermission)
            }

            const inferredPermissions = inferRequiredPermissionsForPath(item.path)
            if (inferredPermissions.length === 0) {
              return true
            }

            return inferredPermissions.some((permission) =>
              userPermissions.includes(permission)
            )
          })

          const visibleSubGroups = group.subGroups
            ?.filter((sg) => {
              if (sg.requiredRoles && sg.requiredRoles.length > 0) {
                return hasAnyRole(...sg.requiredRoles)
              }
              return true
            })
            .map((sg) => ({
              ...sg,
              items: sg.items.filter((item) => {
                if (item.requiredRoles && item.requiredRoles.length > 0) {
                  return hasAnyRole(...item.requiredRoles)
                }
                return true
              }),
            }))
            .filter((sg) => sg.items.length > 0)

          return {
            ...group,
            items: visibleItems,
            subGroups: visibleSubGroups,
          }
        })
        .filter((group) => group.items.length > 0 || (group.subGroups && group.subGroups.length > 0)),
        [canModuleView, hasAnyRole, menuGroups, user, userPermissions]
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

        const subGroups = groupMatches
          ? group.subGroups
          : group.subGroups
              ?.map((sg) => {
                const sgMatches = sg.title.toLowerCase().includes(query)
                return {
                  ...sg,
                  items: sgMatches
                    ? sg.items
                    : sg.items.filter(
                        (item) =>
                          item.name.toLowerCase().includes(query) ||
                          item.path.toLowerCase().includes(query)
                      ),
                }
              })
              .filter((sg) => sg.items.length > 0)

        return {
          ...group,
          items,
          subGroups,
        }
      })
      .filter((group) => group.items.length > 0 || (group.subGroups && group.subGroups.length > 0))
  }, [menuQuery, visibleMenuGroups])

  useEffect(() => {
    if (showCollapsed) {
      setMenuQuery('')
    }
  }, [showCollapsed])

  useEffect(() => {
    if (showCollapsed) {
      return
    }

    const activeGroup = visibleMenuGroups.find(
      (group) =>
        group.items.some((item) => isItemActive(location.pathname, item.path)) ||
        group.subGroups?.some((sg) =>
          sg.items.some((item) => isItemActive(location.pathname, item.path))
        )
    )

    if (!activeGroup) {
      return
    }

    setExpandedSections((prev) =>
      prev[activeGroup.title] ? prev : { ...prev, [activeGroup.title]: true }
    )

    const activeSubGroup = activeGroup.subGroups?.find((sg) =>
      sg.items.some((item) => isItemActive(location.pathname, item.path))
    )
    if (activeSubGroup) {
      const subKey = `${activeGroup.title}:${activeSubGroup.title}`
      setExpandedSubSections((prev) =>
        prev[subKey] !== false ? prev : { ...prev, [subKey]: true }
      )
    }
  }, [location.pathname, showCollapsed, visibleMenuGroups])

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
          const isGroupActive =
            group.items.some((item) => isItemActive(location.pathname, item.path)) ||
            group.subGroups?.some((sg) =>
              sg.items.some((item) => isItemActive(location.pathname, item.path))
            ) === true
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
                <div className={`absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 transition-all duration-150 z-50 max-h-[80vh] overflow-y-auto ${isFlyoutOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
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
                  {group.subGroups && group.subGroups.map((sg) => (
                    <React.Fragment key={sg.title}>
                      <div className="px-3 pt-2 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 mt-1">
                        {sg.title}
                      </div>
                      {sg.items.map((item) => {
                        const isActive = isItemActive(location.pathname, item.path)
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => { setActiveFlyout(null); onClose() }}
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
                    </React.Fragment>
                  ))}
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
              {expandedSections[group.title] && group.subGroups && group.subGroups.map((subGroup) => {
                const subKey = `${group.title}:${subGroup.title}`
                const isSubExpanded = expandedSubSections[subKey] !== false
                return (
                  <div key={subGroup.title}>
                    <button
                      type="button"
                      onClick={() => toggleSubSection(subKey)}
                      className="w-full flex items-center justify-between pl-5 pr-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 focus:outline-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-px bg-slate-200 inline-block" />
                        {subGroup.title}
                      </span>
                      <svg className={`w-2.5 h-2.5 shrink-0 transition-transform ${isSubExpanded ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isSubExpanded && subGroup.items.map((item) => {
                      const isActive = isItemActive(location.pathname, item.path)
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={onClose}
                          className={`flex items-center pl-8 pr-4 py-[7px] mx-2 rounded-md text-[13px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <svg className={`w-[15px] h-[15px] mr-2.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                          </svg>
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
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
