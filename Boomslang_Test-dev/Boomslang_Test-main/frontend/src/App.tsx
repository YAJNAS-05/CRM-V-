import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/authApi'
import LoginPage from './pages/auth/LoginPage'
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
import ServiceTicketsListPage from './pages/servicetickets/ServiceTicketsListPage'
import ServiceTicketDetailPage from './pages/servicetickets/ServiceTicketDetailPage'
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
import ServiceTicketForm from './pages/servicetickets/ServiceTicketForm'
import WarrantyForm from './pages/warranties/WarrantyForm'
import SubcontractorForm from './pages/subcontractors/SubcontractorForm'

// Finance Pages
import InvoiceListPage from './pages/finance/InvoiceListPage'
import InvoiceDetailPage from './pages/finance/InvoiceDetailPage'
import InvoiceForm from './pages/finance/InvoiceForm'
import PaymentListPage from './pages/finance/PaymentListPage'
import CurrencyRatePage from './pages/finance/CurrencyRatePage'
import ReportPage from './pages/finance/ReportPage'

// Field Work Pages
import { FieldWorkListPage } from './pages/fieldwork/FieldWorkListPage'
import { FieldWorkDetailPage } from './pages/fieldwork/FieldWorkDetailPage'

// Dashboard, Reports & Admin
import DashboardPage from './pages/dashboard/DashboardPage'
import { CustomReportBuilderPage } from './pages/reports/CustomReportBuilderPage'
import { ReportListPage } from './pages/reports/ReportListPage'
import { TemplateReportPage } from './pages/reports/TemplateReportPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import RoleManagementPage from './pages/admin/RoleManagementPage'

// Inventory Pages
import InventoryList from './pages/erp/inventory/InventoryList'
import InventoryDetail from './pages/erp/inventory/InventoryDetail'
import InventoryForm from './pages/erp/inventory/InventoryForm'

// Components
import Layout from './components/layout/Layout'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

const inferRoutePermissions = (pathname: string): string[] => {
  if (pathname === '/crm/dashboard/team') return ['DASHBOARD_TEAM_VIEW']
  if (pathname === '/crm/dashboard/user') return ['DASHBOARD_SELF_VIEW']
  if (pathname === '/crm/dashboard') return ['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']
  if (pathname.startsWith('/crm/')) return ['CRM_VIEW']
  if (pathname.startsWith('/erp/')) return ['ERP_VIEW']
  if (pathname.startsWith('/finance/')) return ['FINANCE_VIEW']
  if (pathname.startsWith('/fieldwork')) return ['FIELDWORK_VIEW']
  if (pathname.startsWith('/reports')) return ['REPORT_VIEW']
  return []
}

const getFirstAuthorizedPath = (permissions: string[]): string => {
  if (permissions.includes('DASHBOARD_TEAM_VIEW')) return '/crm/dashboard/team'
  if (permissions.includes('DASHBOARD_SELF_VIEW')) return '/crm/dashboard/user'
  if (permissions.includes('CRM_VIEW')) return '/crm/accounts'
  if (permissions.includes('ERP_VIEW')) return '/erp/equipment'
  if (permissions.includes('FINANCE_VIEW')) return '/finance/invoices'
  if (permissions.includes('FIELDWORK_VIEW')) return '/fieldwork'
  if (permissions.includes('REPORT_VIEW')) return '/reports'
  return '/profile'
}

const DashboardRouteResolver: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions || []

  if (permissions.includes('DASHBOARD_TEAM_VIEW')) {
    return <Navigate to="/crm/dashboard/team" replace />
  }

  if (permissions.includes('DASHBOARD_SELF_VIEW') || permissions.includes('DASHBOARD_VIEW')) {
    return <Navigate to="/crm/dashboard/user" replace />
  }

  return <Navigate to={getFirstAuthorizedPath(permissions)} replace />
}

const AuthSessionSync: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return
    }

    let isMounted = true

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

    syncCurrentUser()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, accessToken, setUser])

  return null
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermissions }) => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userPermissions = user?.permissions || []

  const inferredPermissions = inferRoutePermissions(location.pathname)
  const effectiveRequiredPermissions =
    requiredPermissions && requiredPermissions.length > 0 ? requiredPermissions : inferredPermissions

  if (effectiveRequiredPermissions.length > 0) {
    const hasPermissionAccess =
      effectiveRequiredPermissions.length > 0
        ? userPermissions.some((permission) => effectiveRequiredPermissions.includes(permission))
        : false

    if (!hasPermissionAccess) {
      return <Navigate to={getFirstAuthorizedPath(userPermissions)} replace />
    }
  }

  return (
    <Layout>
      {children}
    </Layout>
  )
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
          to="/crm/dashboard"
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
  const queryClient = new QueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationPanel />
        <AuthSessionSync />
        <Toaster richColors position="top-right" />
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        

        
        <Route
          path="/crm/dashboard"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW']}>
              <DashboardRouteResolver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard/user"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_SELF_VIEW']}>
              <DashboardPage mode="SELF" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/dashboard/team"
          element={
            <ProtectedRoute requiredPermissions={['DASHBOARD_TEAM_VIEW']}>
              <DashboardPage mode="TEAM" />
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
            <ProtectedRoute requiredPermissions={['USER_VIEW']}>
              <UserManagementPage />
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
          path="/admin/audit"
          element={
            <ProtectedRoute>
              <Navigate to="/admin/users" replace />
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

        <Route path="/" element={<Navigate to="/crm/dashboard" replace />} />
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
