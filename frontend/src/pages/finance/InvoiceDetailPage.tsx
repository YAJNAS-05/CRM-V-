import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoiceApi, paymentApi } from '../../api/financeApi'
import { Invoice, Payment, InvoiceStatus, PaymentMethod } from '../../types/finance'
import { toast } from 'sonner'
import { format } from 'date-fns'
import FinanceModuleHeader from '../../components/finance/FinanceModuleHeader'

const extractEntity = <T,>(payload: unknown): T | null => {
  if (payload === null || payload === undefined) return null
  if (typeof payload !== 'object') return payload as T
  const wrapped = payload as { data?: unknown }
  const data = wrapped.data
  return (data ?? payload) as T
}

const extractList = <T,>(payload: unknown): T[] => {
  const data = extractEntity<unknown>(payload)
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (typeof data === 'object') {
    const content = (data as { content?: unknown }).content
    return Array.isArray(content) ? (content as T[]) : []
  }
  return []
}

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.WIRE_TRANSFER)
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const invRes = await invoiceApi.getById(id!)
      setInvoice(extractEntity<Invoice>(invRes.data))
      
      const payRes = await paymentApi.getByInvoice(id!)
      setPayments(extractList<Payment>(payRes.data))
    } catch (error) {
      toast.error('Failed to load invoice details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return

    const amount = Number(paymentAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    try {
      await paymentApi.create({
        invoiceId: invoice.id,
        amount,
        paymentDate,
        method: paymentMethod,
        currency: invoice.currency
      })
      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      setPaymentAmount('')
      fetchData()
    } catch (error) {
      toast.error('Failed to record payment')
    }
  }

  const handleUpdateStatus = async (status: InvoiceStatus) => {
    try {
      await invoiceApi.updateStatus(invoice!.id, status)
      toast.success('Status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading details...</div>
  if (!invoice) return <div className="p-8 text-center text-red-600">Invoice not found</div>

  return (
    <div className="space-y-6">
      <FinanceModuleHeader
        eyebrow="Invoice Detail"
        title={invoice.invoiceNumber}
        subtitle={`Issued ${invoice.issueDate || 'pending issue date'} · Entity ${invoice.entity}`}
        actions={
          <>
            <button onClick={() => navigate('/finance/invoices')} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Back to Invoices
            </button>
            <button onClick={() => setShowPaymentModal(true)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Record Payment
            </button>
            <select value={invoice.status} onChange={(e) => handleUpdateStatus(e.target.value as InvoiceStatus)} className="pm-select w-[180px] text-sm">
              {Object.values(InvoiceStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        }
        metrics={[
          { label: 'Total', value: `${invoice.totalAmount || 0} ${invoice.currency || ''}` },
          { label: 'Paid', value: `${invoice.paidAmount || 0} ${invoice.currency || ''}`, accentClassName: 'text-emerald-700' },
          { label: 'Outstanding', value: `${Math.max((invoice.totalAmount || 0) - (invoice.paidAmount || 0), 0)} ${invoice.currency || ''}` },
          { label: 'Status', value: invoice.status, accentClassName: 'text-sky-700' },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Card */}
          <div className="shell-card p-6">
            <h2 className="text-xl font-semibold mb-6 border-b pb-2">Invoice Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Entity</p>
                <p className="font-medium">{invoice.entity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                <p className="font-bold text-lg">{invoice.totalAmount} {invoice.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Paid Amount</p>
                <p className="font-medium text-green-600">{invoice.paidAmount} {invoice.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Due Date</p>
                <p className={`font-medium ${new Date(invoice.dueDate!) < new Date() ? 'text-red-600' : ''}`}>
                  {invoice.dueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Payments History */}
          <div className="finance-table-shell p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Method</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400 italic">No payments recorded</td></tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">{p.paymentDate}</td>
                      <td className="px-4 py-3">{p.method}</td>
                      <td className="px-4 py-3 font-semibold">{p.amount} {p.currency}</td>
                      <td className="px-4 py-3 text-gray-500">{p.reference || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: PDF Preview Placeholder */}
        <div className="space-y-6">
          <div className="aspect-[1/1.4] rounded-lg border-2 border-dashed border-slate-300 bg-gray-100 p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">PDF Preview</p>
            <p className="text-xs text-gray-400 mt-2 italic">PDF generation is not available in this environment yet.</p>
            <button disabled className="mt-6 cursor-not-allowed bg-white border text-sm px-4 py-2 rounded text-gray-400 opacity-70">PDF Unavailable</button>
          </div>

          <div className="shell-card p-4">
             <h3 className="text-sm font-semibold mb-2">Notes</h3>
             <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{invoice.notes || 'No notes added.'}</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({invoice.currency})</label>
                <input 
                  type="number" step="0.01" required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pm-input text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="pm-select text-sm"
                >
                  {Object.values(PaymentMethod).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="pm-input text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceDetailPage
