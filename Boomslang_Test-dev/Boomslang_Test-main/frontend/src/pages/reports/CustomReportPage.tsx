import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { reportApi } from '@/api/reportApi'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ReportDefinition {
  title: string
  module: 'CRM' | 'ERP' | 'FINANCE'
  description: string
  primaryTable: string
  columns: Array<{
    field: string
    label: string
    dataType: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'BOOLEAN' | 'ENUM'
    visible: boolean
    sortable: boolean
  }>
  filters: Array<{
    field: string
    label: string
    operator: string
    inputType: 'DATE_RANGE' | 'SELECT' | 'MULTISELECT' | 'TEXT' | 'NUMBER_RANGE'
  }>
}

const MODULE_TABLES = {
  CRM: [
    { value: 'everx_crm.leads', label: 'Leads' },
    { value: 'everx_crm.business_partners', label: 'Contacts/Accounts' },
    { value: 'everx_crm.deals', label: 'Deals' },
    { value: 'everx_crm.quotes', label: 'Quotes' },
    { value: 'everx_crm.activities', label: 'Activities' }
  ],
  ERP: [
    { value: 'everx_erp.equipment', label: 'Equipment' },
    { value: 'everx_erp.purchase_orders', label: 'Purchase Orders' },
    { value: 'everx_erp.sales_orders', label: 'Sales Orders' },
    { value: 'everx_erp.shipments', label: 'Shipments' },
    { value: 'everx_erp.spare_parts', label: 'Spare Parts' },
    { value: 'everx_erp.service_tickets', label: 'Service Tickets' },
    { value: 'everx_erp.warranties', label: 'Warranties' }
  ],
  FINANCE: [
    { value: 'everx_finance.invoices', label: 'Invoices' },
    { value: 'everx_finance.payments', label: 'Payments' }
  ]
}

export const CustomReportPage = () => {
  const navigate = useNavigate()
  const { reportId } = useParams<{ reportId?: string }>()
  const queryClient = useQueryClient()
  const isEditing = !!reportId
  
  const [loading, setLoading] = useState(false)
  const [reportDef, setReportDef] = useState<ReportDefinition>({
    title: '',
    module: 'CRM',
    description: '',
    primaryTable: 'everx_crm.leads',
    columns: [],
    filters: []
  })

  const [availableFields, setAvailableFields] = useState<Record<string, any[]>>({})

  useEffect(() => {
    // Fetch available fields for field picker
    reportApi.getAvailableFields().then(res => {
      if (res.data?.data) {
        setAvailableFields(res.data.data)
      }
    }).catch(err => {
      console.warn('Failed to fetch available fields, using defaults', err)
      // Set default mock fields per table for development
      setAvailableFields({
        // CRM Fields
        'everx_crm.leads': [
          { dbField: 'lead_id', label: 'Lead ID', type: 'STRING' },
          { dbField: 'company_name', label: 'Company', type: 'STRING' },
          { dbField: 'first_name', label: 'First Name', type: 'STRING' },
          { dbField: 'last_name', label: 'Last Name', type: 'STRING' },
          { dbField: 'email', label: 'Email', type: 'STRING' },
          { dbField: 'phone', label: 'Phone', type: 'STRING' },
          { dbField: 'lead_status', label: 'Status', type: 'ENUM' },
          { dbField: 'lead_source', label: 'Lead Source', type: 'STRING' },
          { dbField: 'industry', label: 'Industry', type: 'STRING' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'qualified_date', label: 'Qualified Date', type: 'DATE' },
          { dbField: 'projected_value', label: 'Projected Value', type: 'CURRENCY' },
          { dbField: 'assigned_to', label: 'Assigned To', type: 'STRING' }
        ],
        'everx_crm.business_partners': [
          { dbField: 'bp_id', label: 'Contact ID', type: 'STRING' },
          { dbField: 'contact_name', label: 'Name', type: 'STRING' },
          { dbField: 'contact_email', label: 'Email', type: 'STRING' },
          { dbField: 'phone', label: 'Phone', type: 'STRING' },
          { dbField: 'mobile', label: 'Mobile', type: 'STRING' },
          { dbField: 'company', label: 'Company', type: 'STRING' },
          { dbField: 'title', label: 'Job Title', type: 'STRING' },
          { dbField: 'industry', label: 'Industry', type: 'STRING' },
          { dbField: 'contact_type', label: 'Contact Type', type: 'ENUM' },
          { dbField: 'status', label: 'Status', type: 'ENUM' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'last_contacted', label: 'Last Contacted', type: 'DATE' }
        ],
        'everx_crm.deals': [
          { dbField: 'deal_id', label: 'Deal ID', type: 'STRING' },
          { dbField: 'deal_name', label: 'Deal Name', type: 'STRING' },
          { dbField: 'account_id', label: 'Account', type: 'STRING' },
          { dbField: 'deal_amount', label: 'Amount', type: 'CURRENCY' },
          { dbField: 'deal_stage', label: 'Stage', type: 'ENUM' },
          { dbField: 'probability', label: 'Probability %', type: 'NUMBER' },
          { dbField: 'close_date', label: 'Expected Close Date', type: 'DATE' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'owner', label: 'Owner', type: 'STRING' },
          { dbField: 'description', label: 'Description', type: 'STRING' }
        ],
        'everx_crm.quotes': [
          { dbField: 'quote_id', label: 'Quote ID', type: 'STRING' },
          { dbField: 'quote_number', label: 'Quote Number', type: 'STRING' },
          { dbField: 'account_id', label: 'Account', type: 'STRING' },
          { dbField: 'quote_amount', label: 'Amount', type: 'CURRENCY' },
          { dbField: 'quote_status', label: 'Status', type: 'ENUM' },
          { dbField: 'valid_until', label: 'Valid Until', type: 'DATE' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'expires_date', label: 'Expires Date', type: 'DATE' },
          { dbField: 'line_items_count', label: 'Line Items', type: 'NUMBER' }
        ],
        'everx_crm.activities': [
          { dbField: 'activity_id', label: 'Activity ID', type: 'STRING' },
          { dbField: 'activity_type', label: 'Type', type: 'ENUM' },
          { dbField: 'subject', label: 'Subject', type: 'STRING' },
          { dbField: 'related_to', label: 'Related To', type: 'STRING' },
          { dbField: 'assigned_to', label: 'Assigned To', type: 'STRING' },
          { dbField: 'due_date', label: 'Due Date', type: 'DATE' },
          { dbField: 'status', label: 'Status', type: 'ENUM' },
          { dbField: 'priority', label: 'Priority', type: 'ENUM' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'description', label: 'Description', type: 'STRING' }
        ],
        // ERP Fields
        'everx_erp.equipment': [
          { dbField: 'equipment_id', label: 'Equipment ID', type: 'STRING' },
          { dbField: 'equipment_name', label: 'Equipment Name', type: 'STRING' },
          { dbField: 'equipment_type', label: 'Type', type: 'ENUM' },
          { dbField: 'serial_number', label: 'Serial Number', type: 'STRING' },
          { dbField: 'model', label: 'Model', type: 'STRING' },
          { dbField: 'manufacturer', label: 'Manufacturer', type: 'STRING' },
          { dbField: 'purchase_date', label: 'Purchase Date', type: 'DATE' },
          { dbField: 'warranty_expiry', label: 'Warranty Expiry', type: 'DATE' },
          { dbField: 'purchase_cost', label: 'Purchase Cost', type: 'CURRENCY' },
          { dbField: 'current_status', label: 'Status', type: 'ENUM' },
          { dbField: 'location', label: 'Location', type: 'STRING' },
          { dbField: 'last_maintenance', label: 'Last Maintenance', type: 'DATE' }
        ],
        'everx_erp.purchase_orders': [
          { dbField: 'po_id', label: 'PO ID', type: 'STRING' },
          { dbField: 'po_number', label: 'PO Number', type: 'STRING' },
          { dbField: 'supplier_id', label: 'Supplier', type: 'STRING' },
          { dbField: 'po_date', label: 'PO Date', type: 'DATE' },
          { dbField: 'delivery_date', label: 'Delivery Date', type: 'DATE' },
          { dbField: 'po_amount', label: 'PO Amount', type: 'CURRENCY' },
          { dbField: 'po_status', label: 'Status', type: 'ENUM' },
          { dbField: 'line_items', label: 'Line Items', type: 'NUMBER' },
          { dbField: 'received_date', label: 'Received Date', type: 'DATE' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' }
        ],
        'everx_erp.sales_orders': [
          { dbField: 'so_id', label: 'Sales Order ID', type: 'STRING' },
          { dbField: 'so_number', label: 'Order Number', type: 'STRING' },
          { dbField: 'customer_id', label: 'Customer', type: 'STRING' },
          { dbField: 'so_date', label: 'Order Date', type: 'DATE' },
          { dbField: 'delivery_date', label: 'Delivery Date', type: 'DATE' },
          { dbField: 'order_amount', label: 'Order Amount', type: 'CURRENCY' },
          { dbField: 'order_status', label: 'Status', type: 'ENUM' },
          { dbField: 'line_items', label: 'Line Items', type: 'NUMBER' },
          { dbField: 'shipped_date', label: 'Shipped Date', type: 'DATE' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' }
        ],
        'everx_erp.shipments': [
          { dbField: 'shipment_id', label: 'Shipment ID', type: 'STRING' },
          { dbField: 'shipment_number', label: 'Shipment Number', type: 'STRING' },
          { dbField: 'so_id', label: 'Sales Order', type: 'STRING' },
          { dbField: 'shipment_date', label: 'Shipment Date', type: 'DATE' },
          { dbField: 'estimated_delivery', label: 'Estimated Delivery', type: 'DATE' },
          { dbField: 'actual_delivery', label: 'Actual Delivery', type: 'DATE' },
          { dbField: 'carrier', label: 'Carrier', type: 'STRING' },
          { dbField: 'tracking_number', label: 'Tracking Number', type: 'STRING' },
          { dbField: 'shipment_status', label: 'Status', type: 'ENUM' },
          { dbField: 'weight', label: 'Weight', type: 'NUMBER' },
          { dbField: 'cost', label: 'Cost', type: 'CURRENCY' }
        ],
        'everx_erp.spare_parts': [
          { dbField: 'part_id', label: 'Part ID', type: 'STRING' },
          { dbField: 'part_name', label: 'Part Name', type: 'STRING' },
          { dbField: 'part_number', label: 'Part Number', type: 'STRING' },
          { dbField: 'category', label: 'Category', type: 'STRING' },
          { dbField: 'supplier_id', label: 'Supplier', type: 'STRING' },
          { dbField: 'unit_cost', label: 'Unit Cost', type: 'CURRENCY' },
          { dbField: 'quantity_in_stock', label: 'Quantity in Stock', type: 'NUMBER' },
          { dbField: 'reorder_level', label: 'Reorder Level', type: 'NUMBER' },
          { dbField: 'equipment_type', label: 'Equipment Type', type: 'STRING' },
          { dbField: 'last_ordered', label: 'Last Ordered', type: 'DATE' }
        ],
        'everx_erp.service_tickets': [
          { dbField: 'ticket_id', label: 'Ticket ID', type: 'STRING' },
          { dbField: 'ticket_number', label: 'Ticket Number', type: 'STRING' },
          { dbField: 'equipment_id', label: 'Equipment', type: 'STRING' },
          { dbField: 'customer_id', label: 'Customer', type: 'STRING' },
          { dbField: 'issue_description', label: 'Issue Description', type: 'STRING' },
          { dbField: 'ticket_status', label: 'Status', type: 'ENUM' },
          { dbField: 'priority', label: 'Priority', type: 'ENUM' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'assigned_to', label: 'Assigned To', type: 'STRING' },
          { dbField: 'service_cost', label: 'Service Cost', type: 'CURRENCY' },
          { dbField: 'completion_date', label: 'Completion Date', type: 'DATE' }
        ],
        'everx_erp.warranties': [
          { dbField: 'warranty_id', label: 'Warranty ID', type: 'STRING' },
          { dbField: 'equipment_id', label: 'Equipment', type: 'STRING' },
          { dbField: 'warranty_type', label: 'Warranty Type', type: 'ENUM' },
          { dbField: 'start_date', label: 'Start Date', type: 'DATE' },
          { dbField: 'end_date', label: 'End Date', type: 'DATE' },
          { dbField: 'coverage_amount', label: 'Coverage Amount', type: 'CURRENCY' },
          { dbField: 'terms', label: 'Terms', type: 'STRING' },
          { dbField: 'status', label: 'Status', type: 'ENUM' },
          { dbField: 'provider', label: 'Provider', type: 'STRING' }
        ],
        // FINANCE Fields
        'everx_finance.invoices': [
          { dbField: 'invoice_id', label: 'Invoice ID', type: 'STRING' },
          { dbField: 'invoice_number', label: 'Invoice Number', type: 'STRING' },
          { dbField: 'customer_id', label: 'Customer', type: 'STRING' },
          { dbField: 'invoice_date', label: 'Invoice Date', type: 'DATE' },
          { dbField: 'due_date', label: 'Due Date', type: 'DATE' },
          { dbField: 'invoice_amount', label: 'Invoice Amount', type: 'CURRENCY' },
          { dbField: 'tax_amount', label: 'Tax Amount', type: 'CURRENCY' },
          { dbField: 'total_amount', label: 'Total Amount', type: 'CURRENCY' },
          { dbField: 'invoice_status', label: 'Status', type: 'ENUM' },
          { dbField: 'payment_terms', label: 'Payment Terms', type: 'STRING' },
          { dbField: 'line_items', label: 'Line Items', type: 'NUMBER' },
          { dbField: 'paid_amount', label: 'Paid Amount', type: 'CURRENCY' },
          { dbField: 'balance_due', label: 'Balance Due', type: 'CURRENCY' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'notes', label: 'Notes', type: 'STRING' }
        ],
        'everx_finance.payments': [
          { dbField: 'payment_id', label: 'Payment ID', type: 'STRING' },
          { dbField: 'payment_number', label: 'Payment Number', type: 'STRING' },
          { dbField: 'invoice_id', label: 'Invoice', type: 'STRING' },
          { dbField: 'customer_id', label: 'Customer', type: 'STRING' },
          { dbField: 'payment_date', label: 'Payment Date', type: 'DATE' },
          { dbField: 'payment_amount', label: 'Payment Amount', type: 'CURRENCY' },
          { dbField: 'payment_method', label: 'Payment Method', type: 'ENUM' },
          { dbField: 'reference_number', label: 'Reference Number', type: 'STRING' },
          { dbField: 'payment_status', label: 'Status', type: 'ENUM' },
          { dbField: 'applied_date', label: 'Applied Date', type: 'DATE' },
          { dbField: 'created_date', label: 'Created Date', type: 'DATE' },
          { dbField: 'notes', label: 'Notes', type: 'STRING' }
        ]
      })
    })

    // If editing, fetch existing report
    if (isEditing && reportId) {
      reportApi.getReport(Number(reportId))
        .then(res => {
          const report = res.data?.data
          if (report?.definition && typeof report.definition === 'object') {
            const def = report.definition as ReportDefinition
            setReportDef(def)
          }
        })
        .catch(err => {
          toast.error('Failed to load report')
        })
    }
  }, [reportId, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setReportDef(prev => ({ ...prev, [name]: value }))
  }

  const handleAddColumn = () => {
    setReportDef(prev => ({
      ...prev,
      columns: [
        ...prev.columns,
        { field: '', label: '', dataType: 'STRING' as const, visible: true, sortable: true }
      ]
    }))
  }

  const handleUpdateColumn = (idx: number, updates: Partial<typeof reportDef.columns[0]>) => {
    setReportDef(prev => {
      const newColumns = [...prev.columns]
      newColumns[idx] = { ...newColumns[idx], ...updates }
      return { ...prev, columns: newColumns }
    })
  }

  const handleRemoveColumn = (idx: number) => {
    setReportDef(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== idx)
    }))
  }

  const handleAddFilter = () => {
    setReportDef(prev => ({
      ...prev,
      filters: [
        ...prev.filters,
        { field: '', label: '', operator: 'EQ', inputType: 'TEXT' as const }
      ]
    }))
  }

  const handleUpdateFilter = (idx: number, updates: Partial<typeof reportDef.filters[0]>) => {
    setReportDef(prev => {
      const newFilters = [...prev.filters]
      newFilters[idx] = { ...newFilters[idx], ...updates }
      return { ...prev, filters: newFilters }
    })
  }

  const handleRemoveFilter = (idx: number) => {
    setReportDef(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== idx)
    }))
  }

  const handleSave = async () => {
    try {
      if (!reportDef.title.trim()) {
        toast.error('Please enter a report name')
        return
      }
      if (reportDef.columns.length === 0) {
        toast.error('Please add at least one column')
        return
      }

      setLoading(true)

      if (isEditing && reportId) {
        await reportApi.updateReport(Number(reportId), { definition: reportDef })
        toast.success('Report updated successfully')
      } else {
        const response = await reportApi.createReport({
          reportName: reportDef.title,
          description: reportDef.description,
          module: reportDef.module,
          reportType: 'CUSTOM',
          definition: reportDef
        })
        toast.success('Report created successfully')
        // Invalidate reports list to refresh
        await queryClient.invalidateQueries({ queryKey: ['reports'] })
        navigate(`/reports/${response.data?.data?.reportId}`)
        return
      }

      // After update, refresh and stay on page
      await queryClient.invalidateQueries({ queryKey: ['reports'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  const tableFields = availableFields[reportDef.primaryTable] || []

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(isEditing ? '/reports' : '/reports/builder')}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </button>
      
      <div className="bg-card border border-border rounded-lg p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Report' : 'Create Custom Report'}
        </h1>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="border-b border-border pb-6">
            <h2 className="text-lg font-semibold mb-4">Report Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={reportDef.title}
                  onChange={handleChange}
                  placeholder="e.g., Monthly Sales Pipeline"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Module
                </label>
                <select
                  name="module"
                  value={reportDef.module}
                  onChange={(e) => {
                    handleChange(e)
                    // Reset table when module changes
                    setReportDef(prev => ({
                      ...prev,
                      primaryTable: MODULE_TABLES[e.target.value as keyof typeof MODULE_TABLES][0].value
                    }))
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CRM">CRM</option>
                  <option value="ERP">ERP</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Table
              </label>
              <select
                value={reportDef.primaryTable}
                onChange={(e) => setReportDef(prev => ({ ...prev, primaryTable: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MODULE_TABLES[reportDef.module].map(table => (
                  <option key={table.value} value={table.value}>{table.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={reportDef.description}
                onChange={handleChange as any}
                placeholder="Describe what this report shows"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Columns Section */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Columns</h2>
              <button
                onClick={handleAddColumn}
                className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                + Add Column
              </button>
            </div>

            {reportDef.columns.length === 0 ? (
              <p className="text-muted-foreground">No columns added yet. Click "+ Add Column" to get started.</p>
            ) : (
              <div className="space-y-3">
                {reportDef.columns.map((col, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Field</label>
                      <select
                        value={col.field}
                        onChange={(e) => handleUpdateColumn(idx, { field: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      >
                        <option value="">Select field...</option>
                        {tableFields.map(field => (
                          <option key={field.dbField} value={field.dbField}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Label</label>
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => handleUpdateColumn(idx, { label: e.target.value })}
                        placeholder="Column label"
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Type</label>
                      <select
                        value={col.dataType}
                        onChange={(e) => handleUpdateColumn(idx, { dataType: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      >
                        <option value="STRING">Text</option>
                        <option value="NUMBER">Number</option>
                        <option value="DATE">Date</option>
                        <option value="CURRENCY">Currency</option>
                        <option value="BOOLEAN">Yes/No</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={(e) => handleUpdateColumn(idx, { visible: e.target.checked })}
                          className="mr-1"
                        />
                        Visible
                      </label>
                      <label className="text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={col.sortable}
                          onChange={(e) => handleUpdateColumn(idx, { sortable: e.target.checked })}
                          className="mr-1"
                        />
                        Sortable
                      </label>
                      <button
                        onClick={() => handleRemoveColumn(idx)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters Section */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters (Optional)</h2>
              <button
                onClick={handleAddFilter}
                className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                + Add Filter
              </button>
            </div>

            {reportDef.filters.length === 0 ? (
              <p className="text-muted-foreground">No filters yet. Add filters to allow users to narrow down results.</p>
            ) : (
              <div className="space-y-3">
                {reportDef.filters.map((filter, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Field</label>
                      <select
                        value={filter.field}
                        onChange={(e) => handleUpdateFilter(idx, { field: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      >
                        <option value="">Select field...</option>
                        {tableFields.map(field => (
                          <option key={field.dbField} value={field.dbField}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Label</label>
                      <input
                        type="text"
                        value={filter.label}
                        onChange={(e) => handleUpdateFilter(idx, { label: e.target.value })}
                        placeholder="Filter label"
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Type</label>
                      <select
                        value={filter.inputType}
                        onChange={(e) => handleUpdateFilter(idx, { inputType: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      >
                        <option value="DATE_RANGE">Date Range</option>
                        <option value="TEXT">Text</option>
                        <option value="NUMBER_RANGE">Number Range</option>
                        <option value="SELECT">Single Select</option>
                        <option value="MULTISELECT">Multi Select</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleRemoveFilter(idx)}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => navigate(isEditing ? '/reports' : '/reports/builder')}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Report' : 'Create Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

