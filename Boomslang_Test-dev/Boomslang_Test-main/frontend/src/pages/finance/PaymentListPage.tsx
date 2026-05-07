import React, { useEffect, useMemo, useState } from 'react'
import { invoiceApi, paymentApi } from '../../api/financeApi'
import { Invoice, InvoiceStatus, Payment, PaymentMethod } from '../../types/finance'
import { toast } from 'sonner'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'

const extractPayload = <T,>(payload: unknown): T | null => {
  if (payload === null || payload === undefined) return null
  if (typeof payload !== 'object') return payload as T
  const wrapped = payload as { data?: unknown }
  return (wrapped.data ?? payload) as T
}

const extractList = <T,>(payload: unknown): T[] => {
  const data = extractPayload<unknown>(payload)
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (typeof data === 'object') {
    const content = (data as { content?: unknown }).content
    return Array.isArray(content) ? (content as T[]) : []
  }
  return []
}

const defaultPaymentDate = new Date().toISOString().split('T')[0]

const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [form, setForm] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: defaultPaymentDate,
    method: PaymentMethod.WIRE_TRANSFER,
    reference: '',
    notes: '',
  })

  const invoiceLookup = useMemo(() => {
    return invoices.reduce<Record<string, Invoice>>((acc, invoice) => {
      acc[invoice.id] = invoice
      return acc
    }, {})
  }, [invoices])

  const selectedInvoice = form.invoiceId ? invoiceLookup[form.invoiceId] : null
  const selectedOutstanding = selectedInvoice
    ? Math.max((selectedInvoice.totalAmount || 0) - (selectedInvoice.paidAmount || 0), 0)
    : 0

  useEffect(() => {
    fetchPayments()
  }, [page])

  useEffect(() => {
    if (showCreateModal) {
      fetchOpenInvoices()
    }
  }, [showCreateModal])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const response = await paymentApi.getAll(page, pageSize)
      setPayments(extractList<Payment>(response.data))
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOpenInvoices = async () => {
    try {
      const response = await invoiceApi.getAll(0, 200)
      const allInvoices = extractList<Invoice>(response.data)
      const payableInvoices = allInvoices.filter((invoice) => {
        const outstanding = (invoice.totalAmount || 0) - (invoice.paidAmount || 0)
        return outstanding > 0 && invoice.status !== InvoiceStatus.CANCELLED
      })
      setInvoices(payableInvoices)
    } catch (error) {
      toast.error('Failed to load invoices for payment')
      setInvoices([])
    }
  }

  const resetCreateForm = () => {
    setForm({
      invoiceId: '',
      amount: '',
      paymentDate: defaultPaymentDate,
      method: PaymentMethod.WIRE_TRANSFER,
      reference: '',
      notes: '',
    })
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetCreateForm()
  }

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Delete this payment record? This cannot be undone.')) return
    try {
      setDeletingId(id)
      await paymentApi.delete(id)
      toast.success('Payment deleted')
      setPayments((prev) => prev.filter((p) => p.id !== id))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete payment')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.invoiceId) {
      toast.error('Select an invoice')
      return
    }

    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount')
      return
    }

    if (selectedOutstanding > 0 && amount > selectedOutstanding) {
      toast.error('Payment cannot exceed outstanding amount')
      return
    }

    try {
      setIsSaving(true)
      await paymentApi.create({
        invoiceId: form.invoiceId,
        amount,
        paymentDate: form.paymentDate,
        method: form.method,
        currency: selectedInvoice?.currency,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      })
      toast.success('Payment recorded successfully')
      closeCreateModal()
      fetchPayments()
      fetchOpenInvoices()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create payment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const rows = payments.map((payment) => ({
      InvoiceNumber: invoiceLookup[payment.invoiceId]?.invoiceNumber || payment.invoiceId,
      InvoiceId: payment.invoiceId,
      PaymentDate: payment.paymentDate,
      Method: payment.method || '',
      Reference: payment.reference || '',
      Amount: payment.amount,
      Currency: payment.currency || '',
      ExchangeRate: payment.exchangeRate || 0,
      AudEquivalent: payment.audEquivalent || 0,
      Notes: payment.notes || '',
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Payments_${getExportDateStamp()}.xlsx`,
      sheetName: 'Payments',
    })
  }

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display">Transaction History</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">Total Records: {payments.length}</div>
          <button
            onClick={handleExport}
            disabled={payments.length === 0}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Record Payment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Invoice</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">AUD Equiv.</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                  <p className="text-lg">No payments recorded yet.</p>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {invoiceLookup[payment.invoiceId]?.invoiceNumber || `${payment.invoiceId.slice(0, 8)}...`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{payment.paymentDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 border text-[10px] font-bold uppercase">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic truncate max-w-[200px]">
                    {payment.reference || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-gray-900">
                      {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="ml-1 text-[10px] font-bold text-gray-400">{payment.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="group relative inline-block">
                      <span className="text-sm font-medium text-indigo-600 border-b border-dotted border-indigo-300">
                        ${payment.audEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded -left-1/2 -top-8 whitespace-nowrap z-10 shadow-lg">
                        Rate: {payment.exchangeRate} AUD/{payment.currency}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={deletingId === payment.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium transition disabled:opacity-40"
                      title="Delete payment"
                    >
                      {deletingId === payment.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 flex items-center gap-1 font-medium text-sm transition"
        >
          &larr; Earlier
        </button>
        <div className="bg-indigo-50 text-indigo-700 text-xs font-bold py-1 px-3 rounded-full border border-indigo-100">
          Page {page + 1}
        </div>
        <button
          onClick={() => setPage(page + 1)}
          disabled={payments.length < pageSize}
          className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 flex items-center gap-1 font-medium text-sm transition"
        >
          Later &rarr;
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-5">Record Payment</h2>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
                <select
                  required
                  value={form.invoiceId}
                  onChange={(e) => setForm((prev) => ({ ...prev, invoiceId: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select invoice</option>
                  {invoices.map((invoice) => {
                    const outstanding = Math.max((invoice.totalAmount || 0) - (invoice.paidAmount || 0), 0)
                    return (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - Outstanding {outstanding.toFixed(2)} {invoice.currency || ''}
                      </option>
                    )
                  })}
                </select>
                {invoices.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No open invoices available for payment.</p>
                )}
              </div>

              {selectedInvoice && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800">
                  Outstanding: {selectedOutstanding.toFixed(2)} {selectedInvoice.currency || ''}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value as PaymentMethod }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.values(PaymentMethod).map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Bank ref / transaction id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || invoices.length === 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {isSaving ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentListPage
