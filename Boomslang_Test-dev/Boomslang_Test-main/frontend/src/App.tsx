import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
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
import TradeShowListPage from './pages/tradeshows/TradeShowListPage'
import TradeShowDetailPage from './pages/tradeshows/TradeShowDetailPage'

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
import ReportsPage from './pages/reports/ReportsPage'
import { ReportListPage } from './pages/reports/ReportListPage'
import { ReportDetailPage } from './pages/reports/ReportDetailPage'
import { ReportBuilderPage } from './pages/reports/ReportBuilderPage'
import { CustomReportPage } from './pages/reports/CustomReportPage'
import { TemplateReportPage } from './pages/reports/TemplateReportPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import AuditLogPage from './pages/admin/AuditLogPage'
import ERPFieldMappingPage from './pages/admin/ERPFieldMappingPage'

// Inventory Pages
import InventoryList from './pages/erp/inventory/InventoryList'
import InventoryDetail from './pages/erp/inventory/InventoryDetail'
import InventoryForm from './pages/erp/inventory/InventoryForm'

// Components
import Layout from './components/layout/Layout'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      {children}
    </Layout>
  )
}

function App() {
  const queryClient = new QueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NotificationPanel />
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
            <ProtectedRoute>
              <DashboardPage />
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
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

        {/* CRM Activities Routes */}
        <Route
          path="/crm/activities"
          element={
            <ProtectedRoute>
              <ActivityListPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Reports Route */}
        <Route
          path="/crm/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* CRM Trade Shows Routes */}
        <Route
          path="/crm/tradeshows"
          element={
            <ProtectedRoute>
              <TradeShowListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/tradeshows/:id"
          element={
            <ProtectedRoute>
              <TradeShowDetailPage />
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
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/erp-mappings"
          element={
            <ProtectedRoute>
              <ERPFieldMappingPage />
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
              <ReportBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/custom"
          element={
            <ProtectedRoute>
              <CustomReportPage />
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
              <CustomReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <ProtectedRoute>
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/crm/dashboard" replace />} />
      </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
