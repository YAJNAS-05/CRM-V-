import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceApi } from '../../api/financeApi'
import { Invoice, InvoiceStatus, InvoiceEntity } from '../../types/finance'
import { toast } from 'sonner'

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
      setInvoices(response.data.data?.content || [])
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

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <button
          onClick={() => navigate('/finance/invoices/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          New Invoice
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
          className="border rounded px-3 py-2 bg-white"
        >
          <option value="">All Statuses</option>
          {Object.values(InvoiceStatus).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value as InvoiceEntity | '')}
          className="border rounded px-3 py-2 bg-white"
        >
          <option value="">All Entities</option>
          {Object.values(InvoiceEntity).map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
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

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="bg-white border hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition duration-150"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 font-medium">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={invoices.length < pageSize}
          className="bg-white border hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition duration-150"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default InvoiceListPage
