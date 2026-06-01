import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/authApi'
import useEmployeeWorkspaceSync from './hooks/useEmployeeWorkspaceSync'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import OrganizationSetupPage from './pages/onboarding/OrganizationSetupPage'
import UserProfilePage from './pages/profile/UserProfilePage'
import NotificationPanel from './components/NotificationPanel'

// CRM Pages
import AccountListPage from './pages/accounts/AccountListPage'
import AccountDetailPage from './pages/accounts/AccountDetailPage'
import ContactListPage from './pages/contacts/ContactListPage'
import ContactDetailPage from './pages/contacts/ContactDetailPage'
import LeadListPage from './pages/leads/LeadListPage'
import LeadDetailPage from './pages/leads/LeadDetailPage'
import DealListPage from './pages/deals/DealListPage'
import DealDetailPage from './pages/deals/DealDetailPage'
import DealKanbanPage from './pages/deals/DealKanbanPage'
import QuoteListPage from './pages/quotes/QuoteListPage'
import QuoteDetailPage from './pages/quotes/QuoteDetailPage'
import ActivityListPage from './pages/activities/ActivityListPage'

// ERP Pages
import EquipmentListPage from './pages/equipment/EquipmentListPage'
import EquipmentDetailPage from './pages/equipment/EquipmentDetailPage'
import EquipmentForm from './pages/equipment/EquipmentForm'
import SparePartsListPage from './pages/spareparts/SparePartsListPage'
import SparePartDetailPage from './pages/spareparts/SparePartDetailPage'
import SuppliersListPage from './pages/suppliers/SuppliersListPage'
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage'
import PurchaseOrdersListPage from './pages/purchaseorders/PurchaseOrdersListPage'
import PurchaseOrderDetailPage from './pages/purchaseorders/PurchaseOrderDetailPage'
import SalesOrdersListPage from './pages/salesorders/SalesOrdersListPage'
import SalesOrderDetailPage from './pages/salesorders/SalesOrderDetailPage'
import WarrantiesListPage from './pages/warranties/WarrantiesListPage'
import WarrantyDetailPage from './pages/warranties/WarrantyDetailPage'
import ShipmentsListPage from './pages/shipments/ShipmentsListPage'
import ShipmentDetailPage from './pages/shipments/ShipmentDetailPage'
import SubcontractorsListPage from './pages/subcontractors/SubcontractorsListPage'
import SubcontractorDetailPage from './pages/subcontractors/SubcontractorDetailPage'
import SparePartForm from './pages/spareparts/SparePartForm'
import SupplierForm from './pages/suppliers/SupplierForm'
import PurchaseOrderForm from './pages/purchaseorders/PurchaseOrderForm'
import SalesOrderForm from './pages/salesorders/SalesOrderForm'
import ShipmentForm from './pages/shipments/ShipmentForm'
import WarrantyForm from './pages/warranties/WarrantyForm'
import SubcontractorForm from './pages/subcontractors/SubcontractorForm'
import AcquisitionsListPage from './pages/acquisitions/AcquisitionsListPage'
import AcquisitionForm from './pages/acquisitions/AcquisitionForm'
import EquipmentAssessmentsListPage from './pages/equipmentassessments/EquipmentAssessmentsListPage'
import EquipmentAssessmentForm from './pages/equipmentassessments/EquipmentAssessmentForm'
import SiteAssessmentsListPage from './pages/siteassessments/SiteAssessmentsListPage'
import SiteAssessmentForm from './pages/siteassessments/SiteAssessmentForm'
import EquipmentQCListPage from './pages/equipmentqc/EquipmentQCListPage'
import EquipmentQCForm from './pages/equipmentqc/EquipmentQCForm'
import ServiceTicketsListPage from './pages/servicetickets/ServiceTicketsListPage'
import ServiceTicketForm from './pages/servicetickets/ServiceTicketForm'
import ServiceTicketDetailPage from './pages/servicetickets/ServiceTicketDetailPage'

// Finance Pages
import InvoiceListPage from './pages/finance/InvoiceListPage'
import InvoiceDetailPage from './pages/finance/InvoiceDetailPage'
import InvoiceForm from './pages/finance/InvoiceForm'
import PaymentListPage from './pages/finance/PaymentListPage'
import CurrencyRatePage from './pages/finance/CurrencyRatePage'
import ReportPage from './pages/finance/ReportPage'
import FinancialClosePage from './pages/finance/FinancialClosePage'

// Field Work Pages
import { FieldWorkListPage } from './pages/fieldwork/FieldWorkListPage'
import { FieldWorkDetailPage } from './pages/fieldwork/FieldWorkDetailPage'

// Dashboard, Reports & Admin
import DashboardPage from './pages/dashboard/DashboardPage'
import FinanceDashboardPage from './pages/dashboard/FinanceDashboardPage'
import FieldworkDashboardPage from './pages/dashboard/FieldworkDashboardPage'
import HrDashboardPage from './pages/dashboard/HRDashboardPage'
import HRManagerDashboardPage from './pages/dashboard/HRManagerDashboardPage'
import OperationsDashboardPage from './pages/dashboard/OperationsDashboardPage'
import TechnicianDashboardPage from './pages/fieldwork/TechnicianDashboardPage'
import { CustomReportBuilderPage } from './pages/reports/CustomReportBuilderPage'
import { ReportListPage } from './pages/reports/ReportListPage'
import { TemplateReportPage } from './pages/reports/TemplateReportPage'
import AdminUsersPage from './pages/admin/users'
import AdminRolesPage from './pages/admin/roles'
import RoleCreatePage from './pages/admin/roles/create'
import RoleDetailPage from './pages/admin/roles/[id]'
import { usePermissions as useLocalRBAC } from './hooks/useRBAC'

// Inventory Pages
import InventoryList from './pages/erp/inventory/InventoryList'
import InventoryDetail from './pages/erp/inventory/InventoryDetail'
import InventoryForm from './pages/erp/inventory/InventoryForm'
import InventoryLedger from './pages/erp/inventory/InventoryLedger'
import InventoryTransfers from './pages/erp/inventory/InventoryTransfers'

// HR Pages
import HRLandingPage from './pages/hr/HRLandingPage'
import HRPeoplePage from './pages/hr/HRPeoplePage'
import HRPayrollPage from './pages/hr/HRPayrollPage'
import HRPayrollWizardPage from './pages/hr/HRPayrollWizardPage'
import HRLeavePage from './pages/hr/HRLeavePage'
import HRTimePage from './pages/hr/HRTimePage'
import HRRecruitmentPage from './pages/hr/HRRecruitmentPage'
import HROnboardingPage from './pages/hr/HROnboardingPage'
import HRPerformancePage from './pages/hr/HRPerformancePage'
import HRCompliancePage from './pages/hr/HRCompliancePage'
import HRAnalyticsPage from './pages/hr/HRAnalyticsPage'
import EmployeeListPage from './pages/hr/EmployeeListPage'
import EmployeeDetailPage from './pages/hr/EmployeeDetailPage'
import EmployeeFormPage from './pages/hr/EmployeeFormPage'
import DepartmentListPage from './pages/hr/DepartmentListPage'
import DepartmentDetailPage from './pages/hr/DepartmentDetailPage'
import DepartmentFormPage from './pages/hr/DepartmentFormPage'
import PositionListPage from './pages/hr/PositionListPage'
import PositionDetailPage from './pages/hr/PositionDetailPage'
import PositionFormPage from './pages/hr/PositionFormPage'
import LeaveRequestListPage from './pages/hr/LeaveRequestListPage'
import LeaveRequestDetailPage from './pages/hr/LeaveRequestDetailPage'
import LeaveRequestFormPage from './pages/hr/LeaveRequestFormPage'
import LeavePoliciesPage from './pages/hr/LeavePoliciesPage'
import LeaveBalancesPage from './pages/hr/LeaveBalancesPage'
import HolidayListPage from './pages/hr/HolidayListPage'
import TimesheetListPage from './pages/hr/TimesheetListPage'
import TimesheetDetailPage from './pages/hr/TimesheetDetailPage'
import TimesheetFormPage from './pages/hr/TimesheetFormPage'
import PayrollRunListPage from './pages/hr/PayrollRunListPage'
import PayrollRunDetailPage from './pages/hr/PayrollRunDetailPage'
import PayrollRunFormPage from './pages/hr/PayrollRunFormPage'
import PayrollProfilePage from './pages/hr/PayrollProfilePage'
import ReimbursementRequestPage from './pages/hr/ReimbursementRequestPage'
import ReimbursementListPage from './pages/hr/ReimbursementListPage'
import ReimbursementDetailPage from './pages/hr/ReimbursementDetailPage'
import OrgChartPage from './pages/hr/OrgChartPage'
import TrainingListPage from './pages/hr/TrainingListPage'
import TrainingDetailPage from './pages/hr/TrainingDetailPage'
import TrainingFormPage from './pages/hr/TrainingFormPage'
import DocumentListPage from './pages/hr/DocumentListPage'
import DocumentUploadPage from './pages/hr/DocumentUploadPage'
import OfferLetterListPage from './pages/hr/OfferLetterListPage'
import OfferLetterFormPage from './pages/hr/OfferLetterFormPage'
import PayslipListPage from './pages/hr/PayslipListPage'
import PayslipCreatePage from './pages/hr/PayslipCreatePage'
import PayslipDetailPage from './pages/hr/PayslipDetailPage'
import MyPayslipsPage from './pages/hr/MyPayslipsPage'
import MyAppraisalPage from './pages/hr/MyAppraisalPage'
import CandidatePipelinePage from './pages/hr/CandidatePipelinePage'
import InterviewScorecardPage from './pages/hr/InterviewScorecardPage'
import AttendancePage from './pages/hr/AttendancePage'
import OnboardingTasksPage from './pages/hr/OnboardingTasksPage'
import ExitFnFPage from './pages/hr/ExitFnFPage'
import TaskKanbanPage from './pages/hr/TaskKanbanPage'
import MyAssetsPage from './pages/hr/MyAssetsPage'
import AuditLogPage from './pages/admin/AuditLogPage'

// Components
import Layout from './components/layout/Layout'

const EmployeeWorkspaceDashboardPage = lazy(() => import('./pages/employee/EmployeeWorkspaceDashboardPage'))
const ProjectsPage = lazy(() => import('./pages/employee/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/employee/ProjectDetailPage'))
const MyTasksPage = lazy(() => import('./pages/employee/MyTasksPage'))
const EmployeeTimesheetsPage = lazy(() => import('./pages/employee/EmployeeTimesheetsPage'))
const EmployeeAttendancePage = lazy(() => import('./pages/employee/EmployeeAttendancePage'))

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
}

const HR_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR']
const HR_MANAGER_ROLES = ['MANAGER', ...HR_ADMIN_ROLES]
const HR_RECRUITER_ROLES = ['RECRUITER', ...HR_ADMIN_ROLES]
const HR_PAYROLL_ROLES = ['PAYROLL', ...HR_ADMIN_ROLES]
const HR_EXECUTIVE_ROLES = ['EXECUTIVE', ...HR_ADMIN_ROLES]
const HR_SELF_SERVICE_ROLES = ['EMPLOYEE', ...HR_MANAGER_ROLES]
const WORKSPACE_MODULE_ROLES = ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']

const resolveUserRoles = (user?: { roles?: string[]; role?: string } | null) => {
  if (!user) return []
  if (user.roles && user.roles.length > 0) return user.roles
  if (user.role) return [user.role]
  return []
}

const inferRoutePermissions = (pathname: string): string[] => {
  if (pathname === '/dashboard') return [
    'DASHBOARD_SELF_VIEW',
    'DASHBOARD_TEAM_VIEW',
    'DASHBOARD_FINANCE_VIEW',
    'DASHBOARD_HR_VIEW',
    'DASHBOARD_TECH_VIEW',
    'DASHBOARD_OPERATIONS_VIEW',
    'FIELDWORK_VIEW',
    'HR_VIEW'
  ]
  if (pathname === '/dashboard/crm/team') return ['DASHBOARD_TEAM_VIEW']
  if (pathname === '/dashboard/crm/user') return ['DASHBOARD_SELF_VIEW']
  if (pathname === '/dashboard/crm') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (pathname === '/dashboard/operations') return ['DASHBOARD_OPERATIONS_VIEW']
  if (pathname === '/dashboard/finance') return ['DASHBOARD_FINANCE_VIEW']
  if (pathname === '/dashboard/hr') return ['DASHBOARD_HR_VIEW']
  if (pathname === '/dashboard/hr/manager' || pathname === '/dashboard/manager') return ['DASHBOARD_HR_VIEW', 'HR_VIEW']
  if (pathname === '/dashboard/technician') return ['DASHBOARD_TECH_VIEW']
  if (pathname === '/dashboard/fieldwork') return ['FIELDWORK_VIEW']
  if (pathname === '/dashboard/employee') return ['HR_VIEW']
  if (pathname === '/employee/projects' || pathname.startsWith('/employee/projects/') || pathname === '/employee/tasks') return ['PM_VIEW']
  if (pathname === '/employee/timesheets' || pathname === '/employee/attendance') return ['HR_VIEW']
  if (pathname === '/employee' || pathname.startsWith('/employee/')) return ['PM_VIEW', 'HR_VIEW']
  if (pathname === '/crm/dashboard/team') return ['DASHBOARD_TEAM_VIEW']
  if (pathname === '/crm/dashboard/user') return ['DASHBOARD_SELF_VIEW']
  if (pathname === '/crm/dashboard') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (pathname.startsWith('/crm/')) return ['CRM_VIEW']
  if (pathname.startsWith('/erp/')) return ['ERP_VIEW']
  if (pathname === '/hr' || pathname.startsWith('/hr/')) return ['HR_VIEW']
  if (pathname.startsWith('/finance/')) return ['FINANCE_VIEW']
  if (pathname.startsWith('/fieldwork')) return ['FIELDWORK_VIEW']
  if (pathname.startsWith('/reports')) return ['REPORT_VIEW']
  return []
}

const getFirstDashboardPath = (permissions: string[], roles: string[] = []): string => {
  const hasAdminAccess = roles.some((role) => HR_ADMIN_ROLES.includes(role))
  if (!hasAdminAccess && roles.includes('MANAGER')) return '/dashboard/manager'
  if (!hasAdminAccess && roles.includes('EMPLOYEE')) return '/employee'
  if (permissions.includes('DASHBOARD_OPERATIONS_VIEW')) return '/dashboard/operations'
  if (permissions.includes('DASHBOARD_FINANCE_VIEW')) return '/dashboard/finance'
  if (permissions.includes('DASHBOARD_HR_VIEW')) return '/dashboard/hr'
  if (permissions.includes('DASHBOARD_TECH_VIEW')) return '/dashboard/technician'
  if (permissions.includes('DASHBOARD_TEAM_VIEW') || permissions.includes('DASHBOARD_SELF_VIEW')) return '/dashboard/crm'
  if (permissions.includes('FIELDWORK_VIEW')) return '/dashboard/fieldwork'
  if (permissions.includes('HR_VIEW')) return '/dashboard/employee'
  return '/profile'
}

const getFirstAuthorizedPath = (permissions: string[], roles: string[] = []): string => {
  if (
    permissions.some((permission) =>
      [
        'DASHBOARD_TEAM_VIEW',
        'DASHBOARD_SELF_VIEW',
        'DASHBOARD_FINANCE_VIEW',
        'DASHBOARD_HR_VIEW',
        'DASHBOARD_TECH_VIEW',
        'DASHBOARD_OPERATIONS_VIEW',
        'FIELDWORK_VIEW',
        'HR_VIEW'
      ].includes(permission)
    )
  ) {
    return getFirstDashboardPath(permissions, roles)
  }
  if (permissions.includes('CRM_VIEW')) return '/crm/accounts'
  if (permissions.includes('ERP_VIEW')) return '/erp/equipment'
  if (permissions.includes('HR_VIEW')) return '/hr'
  if (permissions.includes('FINANCE_VIEW')) return '/finance/invoices'
  if (permissions.includes('FIELDWORK_VIEW')) return '/fieldwork'
  if (permissions.includes('REPORT_VIEW')) return '/reports'
  return '/profile'
}

interface DashboardRouteResolverProps {
  basePath?: string
}

const DashboardRouteResolver: React.FC<DashboardRouteResolverProps> = ({ basePath = '/dashboard/crm' }) => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const userRoles = resolveUserRoles(user)

  if (permissions.includes('DASHBOARD_TEAM_VIEW')) {
    return <Navigate to={`${basePath}/team`} replace />
  }

  if (permissions.includes('DASHBOARD_SELF_VIEW') || permissions.includes('DASHBOARD_VIEW')) {
    return <Navigate to={`${basePath}/user`} replace />
  }

  return <Navigate to={getFirstAuthorizedPath(permissions, userRoles)} replace />
}

const DashboardLandingRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []
  const userRoles = resolveUserRoles(user)
  return <Navigate to={getFirstDashboardPath(permissions, userRoles)} replace />
}

interface EmployeeSelfServiceRouteProps {
  employeePath: string
  children: React.ReactNode
}

const EmployeeSelfServiceRoute: React.FC<EmployeeSelfServiceRouteProps> = ({ employeePath, children }) => {
  const user = useAuthStore((state) => state.user)
  const roles = resolveUserRoles(user)
  const isEmployeeOnly = roles.includes('EMPLOYEE') && !roles.some((role) => HR_MANAGER_ROLES.includes(role))

  if (isEmployeeOnly) {
    return <Navigate to={employeePath} replace />
  }

  return <>{children}</>
}

const EmployeeModuleFallback: React.FC = () => (
  <div className="shell-card p-8 text-sm text-slate-500">Loading employee workspace...</div>
)

const EmployeeModuleBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEmployeeWorkspaceSync()

  return <Suspense fallback={<EmployeeModuleFallback />}>{children}</Suspense>
}

const AuthSessionSync: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const setUser = useAuthStore((state) => state.setUser)
  const login = useAuthStore((state) => state.login)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return
    }

    let isMounted = true
    let refreshIntervalId: number | undefined

    const refreshSession = async () => {
      if (!refreshToken) {
        return false
      }

      try {
        const refreshed = await authApi.refreshToken(refreshToken)
        if (isMounted && refreshed?.user) {
          login(refreshed.user, refreshed.accessToken, refreshed.refreshToken)
          return true
        }
      } catch {
        // Ignore token refresh failures; the interceptor handles auth errors.
      }

      return false
    }

    const syncCurrentUser = async () => {
      try {
        const currentUser = await authApi.me()
        if (isMounted && currentUser) {
          setUser(currentUser)
        }
      } catch {
        // 401/403 are handled by the axios interceptor; ignore transient errors here.
      }
    }

    const initializeSession = async () => {
      const refreshed = await refreshSession()
      if (!refreshed) {
        await syncCurrentUser()
      }
    }

    const handleFocus = () => {
      void refreshSession()
    }

    void initializeSession()

    window.addEventListener('focus', handleFocus)
    refreshIntervalId = window.setInterval(() => {
      void refreshSession()
    }, 5 * 60 * 1000)

    return () => {
      isMounted = false
      if (refreshIntervalId) {
        window.clearInterval(refreshIntervalId)
      }
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, accessToken, refreshToken, setUser, login])

  return null
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  requiredRoles,
}) => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userPermissions = user?.permissions || []
  const userRoles = resolveUserRoles(user)

  const inferredPermissions = inferRoutePermissions(location.pathname)
  const effectiveRequiredPermissions =
    requiredPermissions && requiredPermissions.length > 0 ? requiredPermissions : inferredPermissions

  if (effectiveRequiredPermissions.length > 0) {
    const hasPermissionAccess =
      effectiveRequiredPermissions.length > 0
        ? userPermissions.some((permission) => effectiveRequiredPermissions.includes(permission))
        : false

    if (!hasPermissionAccess) {
      return <Navigate to={getFirstAuthorizedPath(userPermissions, userRoles)} replace />
    }
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRoleAccess = requiredRoles.some((role) => userRoles.includes(role))
    if (!hasRoleAccess) {
      return <Navigate to={getFirstAuthorizedPath(userPermissions, userRoles)} replace />
    }
  }

  return (
    <Layout>
      {children}
    </Layout>
  )
}

const AdminAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  const { can, loading } = useLocalRBAC()
  const legacyPermissions = user?.permissions || []
  const hasLegacyAdminAccess = ['ADMIN_VIEW', 'USER_VIEW', 'ROLE_VIEW'].some((permission) =>
    legacyPermissions.includes(permission)
  )

  if (loading && !hasLegacyAdminAccess) {
    return null
  }

  if (can('admin', 'view') || hasLegacyAdminAccess) {
    return <>{children}</>
  }

  return <Navigate to="/unauthorized" replace />
}

const NotFoundPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you requested does not exist or may have been moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to dashboard
        </Link>
        <Link
          to="/reports"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open reports
        </Link>
      </div>
    </div>
  )
}

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">403</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Unauthorized</h1>
      <p className="mt-2 text-sm text-slate-600">
        You do not have permission to view this page.
      </p>
      <div className="mt-6">
        <Link
          to="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationPanel />
        <AuthSessionSync />
        <Toaster richColors position="top-right" />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/admin/rbac/users"
          element={<Navigate to="/admin/users" replace />}
        />
        <Route
          path="/admin/rbac/roles"
          element={<Navigate to="/admin/roles" replace />}
        />
        <Route
          path="/admin/rbac/roles/:id"
          element={<Navigate to="/admin/roles" replace />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/org/setup"
          element={
            <ProtectedRoute>
              <OrganizationSetupPage />
            </ProtectedRoute>
          }
        />
        

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              requiredPermissions={[
                'DASHBOARD_SELF_VIEW',
                'DASHBOARD_TEAM_VIEW',
                'DASHBOARD_FINANCE_VIEW',
                'DASHBOARD_HR_VIEW',
                'DASHBOARD_TECH_VIEW',
                'DASHBOARD_OPERATIONS_VIEW',
                'FIELDWORK_VIEW',
                'HR_VIEW'
              ]}
            >
              <DashboardLandingRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/operations"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_OPERATIONS_VIEW']}>
              <OperationsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/finance"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_FINANCE_VIEW']}>
              <FinanceDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hr"
          element={
            <ProtectedRoute
              requiredPermissions={['DASHBOARD_HR_VIEW']}
              requiredRoles={HR_ADMIN_ROLES}
            >
              <HrDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/hr/manager"
          element={
            <ProtectedRoute
              requiredPermissions={['HR_VIEW', 'DASHBOARD_HR_VIEW']}
              requiredRoles={HR_MANAGER_ROLES}
            >
              <HRManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute
              requiredPermissions={['HR_VIEW', 'DASHBOARD_HR_VIEW']}
              requiredRoles={HR_MANAGER_ROLES}
            >
              <HRManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/technician"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_TECH_VIEW']}>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/crm"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']}>
              <DashboardRouteResolver basePath="/dashboard/crm" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/crm/user"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW']}>
              <DashboardPage mode="SELF" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/crm/team"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_TEAM_VIEW']}>
              <DashboardPage mode="TEAM" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/fieldwork"
          element={
            <ProtectedRoute requiredPermissions={['FIELDWORK_VIEW']}>
              <FieldworkDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employee"
          element={
            <ProtectedRoute
              requiredPermissions={['HR_VIEW']}
              requiredRoles={WORKSPACE_MODULE_ROLES}
            >
              <Navigate to="/employee" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW', 'HR_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <EmployeeWorkspaceDashboardPage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/projects"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <ProjectsPage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/projects/:id"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <ProjectDetailPage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/tasks"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <MyTasksPage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/timesheets"
          element={
            <ProtectedRoute requiredPermissions={['HR_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <EmployeeTimesheetsPage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute requiredPermissions={['HR_VIEW']} requiredRoles={WORKSPACE_MODULE_ROLES}>
              <EmployeeModuleBoundary>
                <EmployeeAttendancePage />
              </EmployeeModuleBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']}>
              <Navigate to="/dashboard/crm" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard/user"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW']}>
              <Navigate to="/dashboard/crm/user" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard/team"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_TEAM_VIEW']}>
              <Navigate to="/dashboard/crm/team" replace />
            </ProtectedRoute>
          }
        />

        {/* CRM Accounts Routes */}
        <Route
          path="/crm/accounts"
          element={
            <ProtectedRoute>
              <AccountListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/accounts/new"
          element={
            <ProtectedRoute requiredPermissions={['CRM_CREATE']}>
              <AccountDetailPage isNew={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/accounts/:id"
          element={
            <ProtectedRoute>
              <AccountDetailPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Contacts Routes */}
        <Route
          path="/crm/contacts"
          element={
            <ProtectedRoute>
              <ContactListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/contacts/new"
          element={
            <ProtectedRoute requiredPermissions={['CRM_CREATE']}>
              <ContactDetailPage isNew={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/contacts/:id"
          element={
            <ProtectedRoute>
              <ContactDetailPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Leads Routes */}
        <Route
          path="/crm/leads"
          element={
            <ProtectedRoute>
              <LeadListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads/new"
          element={
            <ProtectedRoute requiredPermissions={['CRM_CREATE']}>
              <LeadDetailPage isNew={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads/:id"
          element={
            <ProtectedRoute>
              <LeadDetailPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Deals Routes */}
        <Route
          path="/crm/deals"
          element={
            <ProtectedRoute>
              <DealListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/deals/kanban"
          element={
            <ProtectedRoute>
              <DealKanbanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/deals/new"
          element={
            <ProtectedRoute requiredPermissions={['CRM_CREATE']}>
              <DealDetailPage isNew={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/deals/:id"
          element={
            <ProtectedRoute>
              <DealDetailPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Quotes Routes */}
        <Route
          path="/crm/quotes"
          element={
            <ProtectedRoute>
              <QuoteListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/quotes/new"
          element={
            <ProtectedRoute requiredPermissions={['CRM_CREATE']}>
              <QuoteDetailPage isNew={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/quotes/:id"
          element={
            <ProtectedRoute>
              <QuoteDetailPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Reports Route (legacy redirect) */}
        <Route
          path="/crm/reports"
          element={
            <ProtectedRoute>
              <Navigate to="/reports" replace />
            </ProtectedRoute>
          }
        />

        {/* CRM Activities Route */}
        <Route
          path="/crm/activities"
          element={
            <ProtectedRoute>
              <ActivityListPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Equipment Routes */}
        <Route
          path="/erp/equipment"
          element={
            <ProtectedRoute>
              <EquipmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment/new"
          element={
            <ProtectedRoute>
              <EquipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment/:id/edit"
          element={
            <ProtectedRoute>
              <EquipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment/:id"
          element={
            <ProtectedRoute>
              <EquipmentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Spare Parts Routes */}
        <Route
          path="/erp/spareparts"
          element={
            <ProtectedRoute>
              <SparePartsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/spareparts/new"
          element={
            <ProtectedRoute>
              <SparePartForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/spareparts/:id/edit"
          element={
            <ProtectedRoute>
              <SparePartForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/spareparts/:id"
          element={
            <ProtectedRoute>
              <SparePartDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Suppliers Routes */}
        <Route
          path="/erp/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/suppliers/new"
          element={
            <ProtectedRoute>
              <SupplierForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/suppliers/:id/edit"
          element={
            <ProtectedRoute>
              <SupplierForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/suppliers/:id"
          element={
            <ProtectedRoute>
              <SupplierDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Acquisitions Routes */}
        <Route
          path="/erp/acquisitions"
          element={
            <ProtectedRoute>
              <AcquisitionsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/acquisitions/new"
          element={
            <ProtectedRoute>
              <AcquisitionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/acquisitions/:id/edit"
          element={
            <ProtectedRoute>
              <AcquisitionForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Equipment Assessments Routes */}
        <Route
          path="/erp/equipment-assessments"
          element={
            <ProtectedRoute>
              <EquipmentAssessmentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment-assessments/new"
          element={
            <ProtectedRoute>
              <EquipmentAssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment-assessments/:id/edit"
          element={
            <ProtectedRoute>
              <EquipmentAssessmentForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Equipment QC Routes */}
        <Route
          path="/erp/equipment-qc"
          element={
            <ProtectedRoute>
              <EquipmentQCListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment-qc/new"
          element={
            <ProtectedRoute>
              <EquipmentQCForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/equipment-qc/:id/edit"
          element={
            <ProtectedRoute>
              <EquipmentQCForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Site Assessments Routes */}
        <Route
          path="/erp/site-assessments"
          element={
            <ProtectedRoute>
              <SiteAssessmentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/site-assessments/new"
          element={
            <ProtectedRoute>
              <SiteAssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/site-assessments/:id/edit"
          element={
            <ProtectedRoute>
              <SiteAssessmentForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Purchase Orders Routes */}
        <Route
          path="/erp/purchase-orders"
          element={
            <ProtectedRoute>
              <PurchaseOrdersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/purchase-orders/new"
          element={
            <ProtectedRoute>
              <PurchaseOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/purchase-orders/:id/edit"
          element={
            <ProtectedRoute>
              <PurchaseOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/purchase-orders/:id"
          element={
            <ProtectedRoute>
              <PurchaseOrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Sales Orders Routes */}
        <Route
          path="/erp/sales-orders"
          element={
            <ProtectedRoute>
              <SalesOrdersListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/sales-orders/new"
          element={
            <ProtectedRoute>
              <SalesOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/sales-orders/:id/edit"
          element={
            <ProtectedRoute>
              <SalesOrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/sales-orders/:id"
          element={
            <ProtectedRoute>
              <SalesOrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Field Jobs Routes */}
        <Route
          path="/erp/field-jobs"
          element={
            <ProtectedRoute>
              <FieldWorkListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/field-jobs/new"
          element={
            <ProtectedRoute>
              <FieldWorkDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/field-jobs/:id"
          element={
            <ProtectedRoute>
              <FieldWorkDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Warranties Routes */}
        <Route
          path="/erp/warranties"
          element={
            <ProtectedRoute>
              <WarrantiesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/warranties/new"
          element={
            <ProtectedRoute>
              <WarrantyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/warranties/:id/edit"
          element={
            <ProtectedRoute>
              <WarrantyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/warranties/:id"
          element={
            <ProtectedRoute>
              <WarrantyDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Shipments Routes */}
        <Route
          path="/erp/shipments"
          element={
            <ProtectedRoute>
              <ShipmentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/shipments/new"
          element={
            <ProtectedRoute>
              <ShipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/shipments/:id/edit"
          element={
            <ProtectedRoute>
              <ShipmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/shipments/:id"
          element={
            <ProtectedRoute>
              <ShipmentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Subcontractors Routes */}
        <Route
          path="/erp/subcontractors"
          element={
            <ProtectedRoute>
              <SubcontractorsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/subcontractors/new"
          element={
            <ProtectedRoute>
              <SubcontractorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/subcontractors/:id/edit"
          element={
            <ProtectedRoute>
              <SubcontractorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/subcontractors/:id"
          element={
            <ProtectedRoute>
              <SubcontractorDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ERP Inventory Routes */}
        <Route
          path="/erp/inventory"
          element={
            <ProtectedRoute>
              <InventoryList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/inventory/ledger"
          element={
            <ProtectedRoute>
              <InventoryLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/inventory/transfers"
          element={
            <ProtectedRoute>
              <InventoryTransfers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/inventory/new"
          element={
            <ProtectedRoute>
              <InventoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/inventory/:id"
          element={
            <ProtectedRoute>
              <InventoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/inventory/:id/edit"
          element={
            <ProtectedRoute>
              <InventoryForm />
            </ProtectedRoute>
          }
        />

        {/* ERP Service Tickets Routes */}
        <Route
          path="/erp/service-tickets"
          element={
            <ProtectedRoute>
              <ServiceTicketsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/service-tickets/new"
          element={
            <ProtectedRoute>
              <ServiceTicketForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/service-tickets/:id/edit"
          element={
            <ProtectedRoute>
              <ServiceTicketForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/service-tickets/:id"
          element={
            <ProtectedRoute>
              <ServiceTicketDetailPage />
            </ProtectedRoute>
          }
        />

        {/* HR Routes */}
        <Route
          path="/hr"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRLandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/people"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRPeoplePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payroll"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <HRPayrollPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payroll/wizard"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <HRPayrollWizardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRLeavePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave-policies"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <LeavePoliciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave-balances"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <LeaveBalancesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/holidays"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HolidayListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/time"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRTimePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/recruit"
          element={
            <ProtectedRoute requiredRoles={HR_RECRUITER_ROLES}>
              <HRRecruitmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/onboard"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HROnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/performance"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRPerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/compliance"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <HRCompliancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/analytics"
          element={
            <ProtectedRoute requiredRoles={HR_EXECUTIVE_ROLES}>
              <HRAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/employees"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/employees/new"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/employees/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/employees/:id"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/departments"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DepartmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/departments/new"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DepartmentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/departments/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DepartmentFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/departments/:id"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DepartmentDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/positions"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <PositionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/positions/new"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <PositionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/positions/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <PositionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/positions/:id"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <PositionDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/leave-requests"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <LeaveRequestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave-requests/new"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <LeaveRequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave-requests/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <LeaveRequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/leave-requests/:id"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <LeaveRequestDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/timesheets"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/timesheets">
                <TimesheetListPage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/timesheets/new"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/timesheets">
                <TimesheetFormPage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/timesheets/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/timesheets">
                <TimesheetFormPage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/timesheets/:id"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/timesheets">
                <TimesheetDetailPage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/reimbursements/new"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <ReimbursementRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/reimbursements"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <ReimbursementListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/reimbursements/:id"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <ReimbursementDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/payroll-runs"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayrollRunListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payroll-runs/new"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayrollRunFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payroll-runs/:id"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayrollRunDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/payroll-profiles"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayrollProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Org Chart */}
        <Route
          path="/hr/org-chart"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <OrgChartPage />
            </ProtectedRoute>
          }
        />

        {/* Training Routes */}
        <Route
          path="/hr/trainings"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <TrainingListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/trainings/new"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <TrainingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/trainings/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <TrainingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/trainings/:id"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <TrainingDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Document Routes */}
        <Route
          path="/hr/documents"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DocumentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/documents/upload"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <DocumentUploadPage />
            </ProtectedRoute>
          }
        />

        {/* Offer Letter Routes */}
        <Route
          path="/hr/offer-letters"
          element={
            <ProtectedRoute requiredRoles={HR_RECRUITER_ROLES}>
              <OfferLetterListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/offer-letters/new"
          element={
            <ProtectedRoute requiredRoles={HR_RECRUITER_ROLES}>
              <OfferLetterFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/offer-letters/:id/edit"
          element={
            <ProtectedRoute requiredRoles={HR_RECRUITER_ROLES}>
              <OfferLetterFormPage />
            </ProtectedRoute>
          }
        />

        {/* Payslip Routes (Admin) */}
        <Route
          path="/hr/payslips"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayslipListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payslips/:id"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayslipDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/payslips/new"
          element={
            <ProtectedRoute requiredRoles={HR_PAYROLL_ROLES}>
              <PayslipCreatePage />
            </ProtectedRoute>
          }
        />

        {/* Employee Self-Service Routes */}
        <Route
          path="/hr/my-payslips"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <MyPayslipsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/my-payslips/:id"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <PayslipDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/my-appraisal"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <MyAppraisalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/candidates"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <CandidatePipelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/candidates/:id/scorecard"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <InterviewScorecardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/attendance"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/attendance">
                <AttendancePage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/onboarding-tasks"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <OnboardingTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/exit-fnf"
          element={
            <ProtectedRoute requiredRoles={HR_ADMIN_ROLES}>
              <ExitFnFPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/tasks"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <EmployeeSelfServiceRoute employeePath="/employee/tasks">
                <TaskKanbanPage />
              </EmployeeSelfServiceRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/my-assets"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <MyAssetsPage />
            </ProtectedRoute>
          }
        />

        {/* Finance Routes */}
        <Route
          path="/finance/invoices"
          element={
            <ProtectedRoute>
              <InvoiceListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/invoices/new"
          element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/invoices/:id/edit"
          element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/payments"
          element={
            <ProtectedRoute>
              <PaymentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/currency"
          element={
            <ProtectedRoute>
              <CurrencyRatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/reports"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/close"
          element={
            <ProtectedRoute>
              <FinancialClosePage />
            </ProtectedRoute>
          }
        />

        {/* Field Work Routes */}
        <Route
          path="/fieldwork"
          element={
            <ProtectedRoute>
              <FieldWorkListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fieldwork/new"
          element={
            <ProtectedRoute>
              <FieldWorkDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fieldwork/:id"
          element={
            <ProtectedRoute>
              <FieldWorkDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminAccessGate>
                <AdminUsersPage />
              </AdminAccessGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute>
              <AdminAccessGate>
                <AdminRolesPage />
              </AdminAccessGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/create"
          element={
            <ProtectedRoute>
              <AdminAccessGate>
                <RoleCreatePage />
              </AdminAccessGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/:id"
          element={
            <ProtectedRoute>
              <AdminAccessGate>
                <RoleDetailPage />
              </AdminAccessGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invite"
          element={
            <ProtectedRoute>
              <AdminAccessGate>
                <Navigate to="/admin/users" replace />
              </AdminAccessGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/erp-mappings"
          element={
            <ProtectedRoute>
              <Navigate to="/admin/users" replace />
            </ProtectedRoute>
          }
        />

        {/* Enterprise Reporting Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/builder"
          element={
            <ProtectedRoute>
              <Navigate to="/reports/custom" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/custom"
          element={
            <ProtectedRoute>
              <CustomReportBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/custom/:reportId"
          element={
            <ProtectedRoute>
              <CustomReportBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/templates"
          element={
            <ProtectedRoute>
              <TemplateReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId/edit"
          element={
            <ProtectedRoute>
              <Navigate to="/reports" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <ProtectedRoute>
              <Navigate to="/reports" replace />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
