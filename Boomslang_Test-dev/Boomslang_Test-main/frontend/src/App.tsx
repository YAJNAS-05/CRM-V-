import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/authApi'
import useEmployeeWorkspaceSync from './hooks/useEmployeeWorkspaceSync'
import { useFieldworkPendingSync } from './hooks/useFieldworkPendingSync'
import useNotificationPolling from './hooks/useNotificationPolling'
import LoginPage from './pages/auth/LoginPage'
import UserProfilePage from './pages/profile/UserProfilePage'
import UnauthorizedPage from './pages/auth/UnauthorizedPage'
import NotificationPanel from './components/NotificationPanel'

// CRM Pages
import AccountListPage from './pages/crm/AccountListPage'
import AccountDetailPage from './pages/crm/AccountDetailPage'
import ContactListPage from './pages/crm/ContactListPage'
import ContactDetailPage from './pages/crm/ContactDetailPage'
import ProjectsPage from './pages/pm/ProjectsPage'
import ProjectDetailPage from './pages/pm/ProjectDetailPage'
import MyTasksPage from './pages/pm/TasksPage'
import LeadListPage from './pages/crm/LeadListPage'
import LeadDetailPage from './pages/crm/LeadDetailPage'
import DealListPage from './pages/crm/DealListPage'
import DealDetailPage from './pages/crm/DealDetailPage'
import DealKanbanPage from './pages/crm/DealKanbanPage'
import QuoteListPage from './pages/crm/QuoteListPage'
import QuoteDetailPage from './pages/crm/QuoteDetailPage'
import ActivityListPage from './pages/crm/ActivityListPage'

// ERP Pages
import EquipmentListPage from './pages/erp/equipment/EquipmentListPage'
import EquipmentDetailPage from './pages/erp/equipment/EquipmentDetailPage'
import EquipmentForm from './pages/erp/equipment/EquipmentForm'
import SparePartsListPage from './pages/erp/spareparts/SparePartsListPage'
import SparePartDetailPage from './pages/erp/spareparts/SparePartDetailPage'
import SuppliersListPage from './pages/erp/suppliers/SuppliersListPage'
import SupplierDetailPage from './pages/erp/suppliers/SupplierDetailPage'
import PurchaseOrdersListPage from './pages/erp/purchaseorders/PurchaseOrdersListPage'
import PurchaseOrderDetailPage from './pages/erp/purchaseorders/PurchaseOrderDetailPage'
import SalesOrdersListPage from './pages/erp/salesorders/SalesOrdersListPage'
import SalesOrderDetailPage from './pages/erp/salesorders/SalesOrderDetailPage'
import WarrantiesListPage from './pages/erp/warranties/WarrantiesListPage'
import WarrantyDetailPage from './pages/erp/warranties/WarrantyDetailPage'
import ShipmentsListPage from './pages/erp/shipments/ShipmentsListPage'
import ShipmentDetailPage from './pages/erp/shipments/ShipmentDetailPage'
import SubcontractorsListPage from './pages/erp/subcontractors/SubcontractorsListPage'
import SubcontractorDetailPage from './pages/erp/subcontractors/SubcontractorDetailPage'
import SparePartForm from './pages/erp/spareparts/SparePartForm'
import SupplierForm from './pages/erp/suppliers/SupplierForm'
import PurchaseOrderForm from './pages/erp/purchaseorders/PurchaseOrderForm'
import SalesOrderForm from './pages/erp/salesorders/SalesOrderForm'
import ShipmentForm from './pages/erp/shipments/ShipmentForm'
import WarrantyForm from './pages/erp/warranties/WarrantyForm'
import SubcontractorForm from './pages/erp/subcontractors/SubcontractorForm'
import AcquisitionsListPage from './pages/erp/acquisitions/AcquisitionsListPage'
import AcquisitionForm from './pages/erp/acquisitions/AcquisitionForm'
import AcquisitionDetailPage from './pages/erp/acquisitions/AcquisitionDetailPage'
import EquipmentAssessmentsListPage from './pages/erp/equipmentassessments/EquipmentAssessmentsListPage'
import EquipmentAssessmentForm from './pages/erp/equipmentassessments/EquipmentAssessmentForm'
import SiteAssessmentsListPage from './pages/erp/siteassessments/SiteAssessmentsListPage'
import SiteAssessmentForm from './pages/erp/siteassessments/SiteAssessmentForm'
import EquipmentQCListPage from './pages/erp/equipmentqc/EquipmentQCListPage'
import EquipmentQCForm from './pages/erp/equipmentqc/EquipmentQCForm'
import ServiceTicketsListPage from './pages/erp/servicetickets/ServiceTicketsListPage'
import ServiceTicketForm from './pages/erp/servicetickets/ServiceTicketForm'
import ServiceTicketDetailPage from './pages/erp/servicetickets/ServiceTicketDetailPage'

// Finance Pages
import InvoiceListPage from './pages/finance/InvoiceListPage'
import InvoiceDetailPage from './pages/finance/InvoiceDetailPage'
import InvoiceForm from './pages/finance/InvoiceForm'
import PaymentListPage from './pages/finance/PaymentListPage'
import CurrencyRatePage from './pages/finance/CurrencyRatePage'
import ReportPage from './pages/finance/ReportPage'
import FinancialClosePage from './pages/finance/FinancialClosePage'
import PaymentReconciliationPage from './pages/finance/PaymentReconciliationPage'

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
import PMDashboardPage from './pages/dashboard/PMDashboardPage'
import { CustomReportBuilderPage } from './pages/reports/CustomReportBuilderPage'
import { ReportListPage } from './pages/reports/ReportListPage'
import { TemplateReportPage } from './pages/reports/TemplateReportPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import RoleManagementPage from './pages/admin/RoleManagementPage'
import ConfigStudioPage from './pages/admin/ConfigStudioPage'
import TenantWorkspacePage from './pages/admin/TenantWorkspacePage'
import BackupRestorePage from './pages/admin/BackupRestorePage'
import ModuleLicensingPage from './pages/admin/ModuleLicensingPage'

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
import BenefitEnrollmentPage from './pages/hr/BenefitEnrollmentPage'
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
import AuditLogPage from './pages/settings/AuditLogPage'

// Enterprise Pages (Recently Implemented)
import PipelineForecastPage from './pages/crm/PipelineForecastPage'
import OkrsPage from './pages/hr/OkrsPage'
import GpsTrackingPage from './pages/fieldwork/GpsTrackingPage'
import ArAgingReportPage from './pages/finance/ArAgingReportPage'
import WarrantyManagementPage from './pages/erp/WarrantyManagementPage'
import MfaSetupPage from './pages/settings/MfaSetupPage'
import QueryBuilderPage from './pages/admin/QueryBuilderPage'
import DashboardWidgetsPage from './pages/admin/DashboardWidgetsPage'

// Role Management Pages
import EnhancedUserManagementPage from './pages/admin/EnhancedUserManagementPage'
import RoleManagementDemoPage from './pages/admin/RoleManagementDemoPage'

// Security Pages
import TwoFactorAuthPage from './pages/security/TwoFactorAuthPage'
import SSOConfigPage from './pages/security/SSOConfigPage'
import SecuritySessionsPage from './pages/security/SecuritySessionsPage'
import SecurityEventsPage from './pages/security/SecurityEventsPage'
import SecurityPoliciesPage from './pages/security/SecurityPoliciesPage'
import SecurityAnalyticsPage from './pages/security/SecurityAnalyticsPage'
import SecuritySettingsPage from './pages/security/SecuritySettingsPage'
import SecurityAuditPage from './pages/security/SecurityAuditPage'
import SecurityAlertsPage from './pages/security/SecurityAlertsPage'
import SecurityReportsPage from './pages/security/SecurityReportsPage'
import SecurityCompliancePage from './pages/security/SecurityCompliancePage'
import SecurityIncidentsPage from './pages/security/SecurityIncidentsPage'
import SecurityRolesPage from './pages/security/SecurityRolesPage'
import ThreatDetectionPage from './pages/security/ThreatDetectionPage'

// Predictive Analytics Pages
import ModelManagementPage from './pages/analytics/ModelManagementPage'
import ForecastingPage from './pages/analytics/ForecastingPage'
import AnomalyDetectionPage from './pages/analytics/AnomalyDetectionPage'
import ModelExperimentsPage from './pages/analytics/ModelExperimentsPage'
import ModelMonitoringPage from './pages/analytics/ModelMonitoringPage'
import PredictiveModelsPage from './pages/analytics/PredictiveModelsPage'
import ModelTrainingPage from './pages/analytics/ModelTrainingPage'
import ForecastGenerationPage from './pages/analytics/ForecastGenerationPage'
import PredictionsPage from './pages/analytics/PredictionsPage'
import PredictiveAnalyticsPage from './pages/analytics/PredictiveAnalyticsPage'
import TrendAnalysisPage from './pages/analytics/TrendAnalysisPage'
import MLInsightsPage from './pages/analytics/MLInsightsPage'

// AI Pages
import AIDashboardPage from './pages/ai/AIDashboardPage'
import AIInsightsPage from './pages/ai/AIInsightsPage'
import AIModelsPage from './pages/ai/AIModelsPage'
import AIPredictionsPage from './pages/ai/AIPredictionsPage'
import AIDataProcessingPage from './pages/ai/AIDataProcessingPage'

// SaaS/Subscription Pages
import SubscriptionPlansPage from './pages/saas/SubscriptionPlansPage'
import SubscriptionManagementPage from './pages/saas/SubscriptionManagementPage'
import BillingManagementPage from './pages/saas/BillingManagementPage'
import UsageAnalyticsPage from './pages/saas/UsageAnalyticsPage'

// Integration Pages
import IntegrationDashboardPage from './pages/integrations/IntegrationDashboardPage'
import IntegrationManagementPage from './pages/integrations/IntegrationManagementPage'
import WebhookManagementPage from './pages/integrations/WebhookManagementPage'
import APIIntegrationPage from './pages/integrations/APIIntegrationPage'
import DataMappingPage from './pages/integrations/DataMappingPage'
import IntegrationAnalyticsPage from './pages/integrations/IntegrationAnalyticsPage'
import IntegrationAuditPage from './pages/integrations/IntegrationAuditPage'
import IntegrationBackupPage from './pages/integrations/IntegrationBackupPage'
import IntegrationConfigurationPage from './pages/integrations/IntegrationConfigurationPage'
import IntegrationDocumentationPage from './pages/integrations/IntegrationDocumentationPage'
import IntegrationLogsPage from './pages/integrations/IntegrationLogsPage'
import IntegrationMonitoringPage from './pages/integrations/IntegrationMonitoringPage'
import IntegrationSecurityPage from './pages/integrations/IntegrationSecurityPage'
import IntegrationTestingPage from './pages/integrations/IntegrationTestingPage'
import IntegrationTroubleshootingPage from './pages/integrations/IntegrationTroubleshootingPage'

// Performance Pages
import PerformanceDashboardPage from './pages/performance/PerformanceDashboardPage'
import PerformanceAlertsPage from './pages/performance/PerformanceAlertsPage'
import PerformanceAnalyticsPage from './pages/performance/PerformanceAnalyticsPage'
import PerformanceBenchmarkingPage from './pages/performance/PerformanceBenchmarkingPage'
import PerformanceComparisonPage from './pages/performance/PerformanceComparisonPage'
import PerformanceMonitoringPage from './pages/performance/PerformanceMonitoringPage'
import PerformanceOptimizationPage from './pages/performance/PerformanceOptimizationPage'
import PerformanceProfilingPage from './pages/performance/PerformanceProfilingPage'
import PerformanceReportingPage from './pages/performance/PerformanceReportingPage'
import PerformanceSLAPage from './pages/performance/PerformanceSLAPage'
import PerformanceThresholdsPage from './pages/performance/PerformanceThresholdsPage'
import PerformanceTrendsPage from './pages/performance/PerformanceTrendsPage'

// Customer Success Pages
import CustomerDashboardPage from './pages/customer-success/CustomerDashboardPage'
import CustomerHealthScorePage from './pages/customer-success/CustomerHealthScorePage'

// Workflow & Automation Pages
import WorkflowDashboardPage from './pages/workflow/WorkflowDashboardPage'
import WorkflowDesignerPage from './pages/workflow/WorkflowDesignerPage'

// Advanced Features Pages
import AdvancedFeaturesDashboardPage from './pages/advanced-features/AdvancedFeaturesDashboardPage'

// UX Enhancement Pages
import UXEnhancementSettingsPage from './pages/ux-enhancement/UXEnhancementSettingsPage'
import UXEnhancementAnalyticsPage from './pages/ux-enhancement/UXEnhancementAnalyticsPage'
import UXEnhancementFeedbackPage from './pages/ux-enhancement/UXEnhancementFeedbackPage'
import UXEnhancementHelpPage from './pages/ux-enhancement/UXEnhancementHelpPage'
import UXEnhancementInternationalizationPage from './pages/ux-enhancement/UXEnhancementInternationalizationPage'
import UXEnhancementMobilePage from './pages/ux-enhancement/UXEnhancementMobilePage'
import UXEnhancementNotificationsPage from './pages/ux-enhancement/UXEnhancementNotificationsPage'
import UXEnhancementOnboardingPage from './pages/ux-enhancement/UXEnhancementOnboardingPage'
import UXEnhancementPerformancePage from './pages/ux-enhancement/UXEnhancementPerformancePage'
import UXEnhancementPersonalizationPage from './pages/ux-enhancement/UXEnhancementPersonalizationPage'
import UXEnhancementReportsPage from './pages/ux-enhancement/UXEnhancementReportsPage'
import UXEnhancementShortcutsPage from './pages/ux-enhancement/UXEnhancementShortcutsPage'
import UXEnhancementTestingPage from './pages/ux-enhancement/UXEnhancementTestingPage'
import UXEnhancementThemesPage from './pages/ux-enhancement/UXEnhancementThemesPage'
import UXEnhancementWidgetsPage from './pages/ux-enhancement/UXEnhancementWidgetsPage'
import UXEnhancementA11yPage from './pages/ux-enhancement/UXEnhancementA11yPage'

// Components
import Layout from './components/layout/Layout'

const EmployeeWorkspaceDashboardPage = lazy(() => import('./pages/dashboard/EmployeeWorkspaceDashboardPage'))
const EmployeeTimesheetsPage = lazy(() => import('./pages/hr/EmployeeTimesheetsPage'))
const EmployeeAttendancePage = lazy(() => import('./pages/hr/EmployeeAttendancePage'))

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
  requireAll?: boolean
  fallbackPath?: string
}

const inferRoutePermissions = (pathname: string): string[] => {
  if (pathname === '/dashboard') return [
    'DASHBOARD_SELF_VIEW',
    'DASHBOARD_TEAM_VIEW',
    'DASHBOARD_FINANCE_VIEW',
    'DASHBOARD_HR_VIEW',
    'DASHBOARD_TECH_VIEW',
    'DASHBOARD_OPERATIONS_VIEW',
    'DASHBOARD_PM_VIEW',
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
  if (pathname === '/dashboard/pm') return ['DASHBOARD_PM_VIEW']
  if (pathname === '/dashboard/fieldwork') return ['FIELDWORK_VIEW']
  if (pathname === '/dashboard/employee') return ['HR_VIEW']
  if (pathname === '/employee' || pathname.startsWith('/employee/')) return ['HR_VIEW']
  if (pathname === '/employee/attendance') return ['ATTENDANCE_SELF_VIEW', 'HR_VIEW']
  if (pathname === '/crm/dashboard/team') return ['DASHBOARD_TEAM_VIEW']
  if (pathname === '/crm/dashboard/user') return ['DASHBOARD_SELF_VIEW']
  if (pathname === '/crm/dashboard') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (pathname.startsWith('/crm/')) return ['CRM_VIEW']
  if (pathname.startsWith('/erp/')) return ['ERP_VIEW']
  if (pathname === '/hr/attendance') return ['ATTENDANCE_MANAGE_VIEW', 'HR_VIEW']
  if (pathname === '/hr' || pathname.startsWith('/hr/')) return ['HR_VIEW']
  if (pathname === '/pm' || pathname.startsWith('/pm/')) return ['PM_VIEW']
  if (pathname.startsWith('/finance/')) return ['FINANCE_VIEW']
  if (pathname.startsWith('/fieldwork')) return ['FIELDWORK_VIEW']
  if (pathname.startsWith('/reports')) return ['REPORT_VIEW']
  if (pathname.startsWith('/analytics')) return ['ANALYTICS_VIEW']
  if (pathname.startsWith('/ai')) {
    if (pathname.includes('/models') || pathname.includes('/data-processing')) return ['AI_ADMIN']
    return ['AI_VIEW']
  }
  if (pathname.startsWith('/saas')) {
    if (pathname.includes('/billing')) return ['SAAS_ADMIN']
    return ['SAAS_VIEW']
  }
  if (pathname.startsWith('/ux-enhancement')) {
    if (pathname.includes('/analytics')) return ['UX_ANALYTICS_VIEW']
    if (pathname.includes('/feedback')) return ['UX_FEEDBACK_VIEW']
    return ['UX_SETTINGS_VIEW']
  }
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
  if (permissions.includes('DASHBOARD_PM_VIEW')) return '/dashboard/pm'
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
  if (permissions.includes('PM_VIEW')) return '/pm/projects'
  if (permissions.includes('HR_VIEW')) return '/hr'
  if (permissions.includes('FINANCE_VIEW')) return '/finance/invoices'
  if (permissions.includes('FIELDWORK_VIEW')) return '/fieldwork'
  if (permissions.includes('REPORT_VIEW')) return '/reports'
  if (permissions.includes('ANALYTICS_VIEW')) return '/analytics'
  if (permissions.includes('AI_VIEW')) return '/ai'
  if (permissions.includes('SAAS_VIEW')) return '/saas'
  if (permissions.includes('UX_SETTINGS_VIEW')) return '/ux-enhancement'
  if (permissions.includes('UX_ANALYTICS_VIEW')) return '/ux-enhancement/analytics'
  if (permissions.includes('UX_FEEDBACK_VIEW')) return '/ux-enhancement/feedback'
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

const FieldworkSyncProvider: React.FC = () => {
  useFieldworkPendingSync()
  return null
}

const NotificationPoller: React.FC = () => {
  useNotificationPolling(30_000)
  return null
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
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  fallbackPath = '/unauthorized'
}) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Get user permissions and roles from auth store
  const user = useAuthStore(state => state.user)
  const userPermissions = new Set(user?.permissions || [])
  const userRoles = new Set(user?.roles || [])

  // Check role-based permissions
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? requiredRoles.every(role => userRoles.has(role))
      : requiredRoles.some(role => userRoles.has(role))
    
    if (!hasRequiredRoles) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? requiredPermissions.every(permission => userPermissions.has(permission))
      : requiredPermissions.some(permission => userPermissions.has(permission))
    
    if (!hasRequiredPermissions) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <>{children}</>
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

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationPanel />
        <AuthSessionSync />
        {isAuthenticated && <FieldworkSyncProvider />}
        {isAuthenticated && <NotificationPoller />}
        <Toaster richColors position="top-right" />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
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
                'DASHBOARD_PM_VIEW',
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
          path="/dashboard/pm"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_PM_VIEW']}>
              <PMDashboardPage />
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
            >
              <Navigate to="/employee" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={<Navigate to="/dashboard/employee" replace />}
        />
        <Route
          path="/employee/projects"
          element={<Navigate to="/pm/projects" replace />}
        />
        <Route
          path="/employee/projects/:id"
          element={<Navigate to="/pm/projects" replace />}
        />
        <Route
          path="/employee/tasks"
          element={<Navigate to="/pm/tasks" replace />}
        />
        <Route
          path="/pm/projects"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pm/projects/:id"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']}>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pm/tasks"
          element={
            <ProtectedRoute requiredPermissions={['PM_VIEW']}>
              <MyTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/timesheets"
          element={<Navigate to="/hr/timesheets" replace />}
        />
        <Route
          path="/employee/attendance"
          element={<Navigate to="/hr/attendance" replace />}
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
          path="/erp/acquisitions/:id"
          element={
            <ProtectedRoute>
              <AcquisitionDetailPage />
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
          path="/hr/benefits"
          element={
            <ProtectedRoute requiredRoles={HR_SELF_SERVICE_ROLES}>
              <BenefitEnrollmentPage />
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
        <Route
          path="/finance/reconciliation"
          element={
            <ProtectedRoute>
              <PaymentReconciliationPage />
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
          path="/admin/config"
          element={
            <ProtectedRoute requiredPermissions={['ROLE_VIEW']}>
              <ConfigStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredPermissions={['USER_VIEW']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/enhanced"
          element={
            <ProtectedRoute requiredPermissions={['USER_VIEW']}>
              <EnhancedUserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute requiredPermissions={['ROLE_VIEW']}>
              <RoleManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/demo"
          element={
            <ProtectedRoute requiredPermissions={['ROLE_VIEW']}>
              <RoleManagementDemoPage />
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
        <Route
          path="/admin/workspaces"
          element={
            <ProtectedRoute>
              <TenantWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/backup"
          element={
            <ProtectedRoute>
              <BackupRestorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules"
          element={
            <ProtectedRoute>
              <ModuleLicensingPage />
            </ProtectedRoute>
          }
        />

        {/* Security Routes */}
        <Route
          path="/security/2fa"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <TwoFactorAuthPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/sso"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_ADMIN']}>
              <SSOConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/sessions"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecuritySessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/events"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecurityEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/policies"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_ADMIN']}>
              <SecurityPoliciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/analytics"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecurityAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/settings"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_ADMIN']}>
              <SecuritySettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/audit"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_AUDIT']}>
              <SecurityAuditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/alerts"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecurityAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/reports"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecurityReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/compliance"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <SecurityCompliancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/incidents"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_ADMIN']}>
              <SecurityIncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/roles"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_ADMIN']}>
              <SecurityRolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/threat-detection"
          element={
            <ProtectedRoute requiredPermissions={['SECURITY_VIEW']}>
              <ThreatDetectionPage />
            </ProtectedRoute>
          }
        />

        {/* Predictive Analytics Routes */}
        <Route
          path="/analytics/models"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <ModelManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/forecasting"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <ForecastingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/anomaly-detection"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <AnomalyDetectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/experiments"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_ADMIN']}>
              <ModelExperimentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/monitoring"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <ModelMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/predictive-models"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <PredictiveModelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/model-training"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_ADMIN']}>
              <ModelTrainingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/forecast-generation"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <ForecastGenerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/predictions"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <PredictionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/predictive-analytics"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <PredictiveAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/trend-analysis"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <TrendAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/ml-insights"
          element={
            <ProtectedRoute requiredPermissions={['ANALYTICS_VIEW']}>
              <MLInsightsPage />
            </ProtectedRoute>
          }
        />

        {/* AI Routes */}
        <Route
          path="/ai"
          element={
            <ProtectedRoute requiredPermissions={['AI_VIEW']}>
              <AIDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/insights"
          element={
            <ProtectedRoute requiredPermissions={['AI_VIEW']}>
              <AIInsightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/models"
          element={
            <ProtectedRoute requiredPermissions={['AI_ADMIN']}>
              <AIModelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/predictions"
          element={
            <ProtectedRoute requiredPermissions={['AI_VIEW']}>
              <AIPredictionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/data-processing"
          element={
            <ProtectedRoute requiredPermissions={['AI_ADMIN']}>
              <AIDataProcessingPage />
            </ProtectedRoute>
          }
        />

        {/* SaaS/Subscription Routes */}
        <Route
          path="/saas/plans"
          element={
            <ProtectedRoute requiredPermissions={['SAAS_VIEW']}>
              <SubscriptionPlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saas/subscription"
          element={
            <ProtectedRoute requiredPermissions={['SAAS_VIEW']}>
              <SubscriptionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saas/billing"
          element={
            <ProtectedRoute requiredPermissions={['SAAS_ADMIN']}>
              <BillingManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saas/usage"
          element={
            <ProtectedRoute requiredPermissions={['SAAS_VIEW']}>
              <UsageAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Integration Routes */}
        <Route
          path="/integrations/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/management"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <IntegrationManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/webhooks"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <WebhookManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/api-integration"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <APIIntegrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/data-mapping"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <DataMappingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/analytics"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/audit"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationAuditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/backup"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <IntegrationBackupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/configuration"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <IntegrationConfigurationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/documentation"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationDocumentationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/logs"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/monitoring"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/security"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <IntegrationSecurityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/testing"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_ADMIN']}>
              <IntegrationTestingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations/troubleshooting"
          element={
            <ProtectedRoute requiredPermissions={['INTEGRATION_VIEW']}>
              <IntegrationTroubleshootingPage />
            </ProtectedRoute>
          }
        />

        {/* Performance Routes */}
        <Route
          path="/performance/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/alerts"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_ADMIN']}>
              <PerformanceAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/analytics"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/benchmarking"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceBenchmarkingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/comparison"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceComparisonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/monitoring"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/optimization"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_ADMIN']}>
              <PerformanceOptimizationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/profiling"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_ADMIN']}>
              <PerformanceProfilingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/reporting"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceReportingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/sla"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceSLAPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/thresholds"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_ADMIN']}>
              <PerformanceThresholdsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance/trends"
          element={
            <ProtectedRoute requiredPermissions={['PERFORMANCE_VIEW']}>
              <PerformanceTrendsPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Success Routes */}
        <Route
          path="/customer-success/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['CUSTOMER_SUCCESS_VIEW']}>
              <CustomerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-success/health-scores"
          element={
            <ProtectedRoute requiredPermissions={['CUSTOMER_SUCCESS_ADMIN']}>
              <CustomerHealthScorePage />
            </ProtectedRoute>
          }
        />

        {/* Workflow & Automation Routes */}
        <Route
          path="/workflow/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['WORKFLOW_VIEW']}>
              <WorkflowDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflow/designer"
          element={
            <ProtectedRoute requiredPermissions={['WORKFLOW_ADMIN']}>
              <WorkflowDesignerPage />
            </ProtectedRoute>
          }
        />

        {/* Advanced Features Routes */}
        <Route
          path="/advanced-features/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['ADVANCED_FEATURES_VIEW']}>
              <AdvancedFeaturesDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Enterprise Feature Routes */}
        <Route
          path="/crm/forecast"
          element={
            <ProtectedRoute requiredPermissions={['CRM_VIEW']}>
              <PipelineForecastPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/okrs"
          element={
            <ProtectedRoute requiredPermissions={['HR_VIEW']}>
              <OkrsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fieldwork/gps"
          element={
            <ProtectedRoute requiredPermissions={['FIELDWORK_VIEW']}>
              <GpsTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/ar-aging"
          element={
            <ProtectedRoute requiredPermissions={['FINANCE_VIEW']}>
              <ArAgingReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/warranty"
          element={
            <ProtectedRoute requiredPermissions={['ERP_VIEW']}>
              <WarrantyManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <MfaSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/query"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
              <QueryBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard-widgets"
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
              <DashboardWidgetsPage />
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

        {/* UX Enhancement Routes */}
        <Route
          path="/ux-enhancement"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/settings"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/analytics"
          element={
            <ProtectedRoute requiredPermissions={['UX_ANALYTICS_VIEW']}>
              <UXEnhancementAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/feedback"
          element={
            <ProtectedRoute requiredPermissions={['UX_FEEDBACK_VIEW']}>
              <UXEnhancementFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/help"
          element={
            <ProtectedRoute>
              <UXEnhancementHelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/internationalization"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementInternationalizationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/mobile"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementMobilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/notifications"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/onboarding"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/performance"
          element={
            <ProtectedRoute requiredPermissions={['UX_ANALYTICS_VIEW']}>
              <UXEnhancementPerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/personalization"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementPersonalizationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/reports"
          element={
            <ProtectedRoute requiredPermissions={['UX_ANALYTICS_VIEW']}>
              <UXEnhancementReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/shortcuts"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementShortcutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/testing"
          element={
            <ProtectedRoute requiredPermissions={['UX_ANALYTICS_VIEW']}>
              <UXEnhancementTestingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/themes"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementThemesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/widgets"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementWidgetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ux-enhancement/accessibility"
          element={
            <ProtectedRoute requiredPermissions={['UX_SETTINGS_VIEW']}>
              <UXEnhancementA11yPage />
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
