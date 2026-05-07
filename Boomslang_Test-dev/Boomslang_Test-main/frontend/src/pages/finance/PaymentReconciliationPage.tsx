import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { invoiceApi, paymentApi } from '../../api/financeApi'
import { Invoice, InvoiceStatus, Payment } from '../../types/finance'
import { toast } from 'sonner'

const fmt = (value?: number | null) =>
  value == null ? '—' : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const statusColor: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
  SENT: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
}

export default function PaymentReconciliationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('UNRECONCILED')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [invResp, payResp] = await Promise.all([
        invoiceApi.getAll(0, 500),
        paymentApi.getAll(0, 500),
      ])
      const invData = invResp.data.data
      const payData = payResp.data.data
      setInvoices(Array.isArray(invData) ? invData : (invData?.content ?? []))
      setPayments(Array.isArray(payData) ? payData : (payData?.content ?? []))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Group payments by invoiceId
  const paymentsByInvoice = useMemo(() => {
    const map: Record<string, Payment[]> = {}
    for (const p of payments) {
      if (p.invoiceId) {
        if (!map[p.invoiceId]) map[p.invoiceId] = []
        map[p.invoiceId].push(p)
      }
    }
    return map
  }, [payments])

  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'UNRECONCILED') {
      return invoices.filter(
        inv => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED
      )
    }
    if (filterStatus === 'ALL') return invoices
    return invoices.filter(inv => inv.status === filterStatus)
  }, [invoices, filterStatus])

  const totals = useMemo(() => {
    const unreconciled = invoices.filter(
      inv => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED
    )
    const totalOutstanding = unreconciled.reduce(
      (sum, inv) => sum + Math.max((inv.totalAmount || 0) - (inv.paidAmount || 0), 0),
      0
    )
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)
    return { totalOutstanding, totalPaid, unreconciledCount: unreconciled.length }
  }, [invoices])

  if (loading) return <div className="p-6 text-slate-500">Loading reconciliation data…</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="shell-card p-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment Reconciliation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Match payments to invoices and track outstanding balances.
        </p>

        {/* Summary KPIs */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unreconciled Invoices</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{totals.unreconciledCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{fmt(totals.totalOutstanding)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Paid (All Time)</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{fmt(totals.totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="shell-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Invoice Reconciliation Status</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
            >
              <option value="UNRECONCILED">Unreconciled</option>
              <option value="ALL">All Invoices</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="SENT">Sent</option>
            </select>
            <Link
              to="/finance/payments"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Record Payment
            </Link>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            No invoices match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                  <th className="px-4 py-3">Payments</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const outstanding = Math.max((inv.totalAmount || 0) - (inv.paidAmount || 0), 0)
                  const linkedPayments = paymentsByInvoice[inv.id] || []
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link to={`/finance/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{inv.dueDate || '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{fmt(inv.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-700">{fmt(inv.paidAmount)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {outstanding > 0 ? fmt(outstanding) : '✓ Cleared'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {linkedPayments.length === 0 ? (
                          <span className="text-xs text-slate-400">None</span>
                        ) : (
                          <span className="text-xs">{linkedPayments.length} payment{linkedPayments.length > 1 ? 's' : ''}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {outstanding > 0 && (
                          <Link
                            to={`/finance/payments?invoiceId=${inv.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Apply Payment
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
