import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceApi } from '../../api/financeApi'
import { Invoice, InvoiceStatus, InvoiceEntity } from '../../types/finance'
import { toast } from 'sonner'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'
import FinanceModuleHeader from '../../components/finance/FinanceModuleHeader'

const extractPageContent = <T,>(payload: unknown): T[] => {
  if (!payload || typeof payload !== 'object') return []
  const wrapped = payload as { data?: unknown; content?: unknown }
  const data = wrapped.data ?? payload
  if (!data || typeof data !== 'object') return []
  const content = (data as { content?: unknown }).content
  return Array.isArray(content) ? (content as T[]) : []
}

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const [entityFilter, setEntityFilter] = useState<InvoiceEntity | ''>('')
  const pageSize = 20

  useEffect(() => {
    fetchInvoices()
  }, [page, statusFilter, entityFilter])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      let response
      if (statusFilter) {
        response = await invoiceApi.getByStatus(statusFilter, page, pageSize)
      } else if (entityFilter) {
        response = await invoiceApi.getByEntity(entityFilter, page, pageSize)
      } else {
        response = await invoiceApi.getAll(page, pageSize)
      }
      setInvoices(extractPageContent<Invoice>(response.data))
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800'
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-800'
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-800'
      case InvoiceStatus.PARTIALLY_PAID: return 'bg-yellow-100 text-yellow-800'
      case InvoiceStatus.CANCELLED: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExport = () => {
    const rows = invoices.map((invoice) => ({
      InvoiceNumber: invoice.invoiceNumber,
      Entity: invoice.entity,
      Type: invoice.type,
      Status: invoice.status,
      IssueDate: invoice.issueDate || '',
      DueDate: invoice.dueDate || '',
      AccountId: invoice.accountId,
      SalesOrderId: invoice.soId || '',
      Currency: invoice.currency || '',
      Subtotal: invoice.subtotal || 0,
      TaxAmount: invoice.taxAmount || 0,
      TotalAmount: invoice.totalAmount || 0,
      PaidAmount: invoice.paidAmount || 0,
      Notes: invoice.notes || '',
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Invoices_${getExportDateStamp()}.xlsx`,
      sheetName: 'Invoices',
    })
  }

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FinanceModuleHeader
        eyebrow="Receivables"
        title="Invoice operations"
        subtitle="Track invoicing status, entity exposure, and collections with cleaner controls and faster scanning."
        actions={
          <>
            <button
              onClick={handleExport}
              disabled={invoices.length === 0}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export
            </button>
            <button
              onClick={() => navigate('/finance/invoices/new')}
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              New Invoice
            </button>
          </>
        }
        metrics={[
          { label: 'Loaded Invoices', value: invoices.length },
          { label: 'Current Page', value: page + 1 },
          { label: 'Status Filter', value: statusFilter || 'All' },
          { label: 'Entity Filter', value: entityFilter || 'All' },
        ]}
      />

      <div className="finance-toolbar flex flex-wrap gap-4 p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
          className="pm-select max-w-[220px] text-sm"
        >
          <option value="">All Statuses</option>
          {Object.values(InvoiceStatus).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value as InvoiceEntity | '')}
          className="pm-select max-w-[220px] text-sm"
        >
          <option value="">All Entities</option>
          {Object.values(InvoiceEntity).map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="finance-table-shell">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No invoices found matching criteria
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/finance/invoices/${invoice.id}`)}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.entity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {invoice.totalAmount} <span className="text-xs text-gray-400">{invoice.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.paidAmount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button
                      onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="finance-toolbar flex items-center justify-between p-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-semibold text-slate-600">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={invoices.length < pageSize}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default InvoiceListPage
