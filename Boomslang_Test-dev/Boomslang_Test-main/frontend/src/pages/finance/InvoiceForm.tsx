import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoiceApi } from '../../api/financeApi'
import { InvoiceEntity, InvoiceType, CreateInvoiceRequest } from '../../types/finance'
import { toast } from 'react-hot-toast'

interface FormData {
  invoiceNumber: string
  soId: string
  accountId: string
  entity: string
  type: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: string
  taxAmount: string
  totalAmount: string
  notes: string
}

const defaultForm: FormData = {
  invoiceNumber: '',
  soId: '',
  accountId: '',
  entity: 'AUSTRALIA',
  type: 'TAX_INVOICE',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  subtotal: '',
  taxAmount: '',
  totalAmount: '',
  notes: '',
}

export default function InvoiceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await invoiceApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          invoiceNumber: e.invoiceNumber || '',
          soId: e.soId || '',
          accountId: e.accountId || '',
          entity: e.entity || 'AUSTRALIA',
          type: e.type || 'TAX_INVOICE',
          issueDate: e.issueDate || '',
          dueDate: e.dueDate || '',
          currency: e.currency || 'USD',
          subtotal: e.subtotal?.toString() || '',
          taxAmount: e.taxAmount?.toString() || '',
          totalAmount: e.totalAmount?.toString() || '',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load invoice') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.invoiceNumber || !form.accountId || !form.entity || !form.type) {
      toast.error('Invoice Number, Account ID, Entity, and Type are required'); return
    }
    try {
      setSaving(true)
      const payload: CreateInvoiceRequest = {
        invoiceNumber: form.invoiceNumber,
        accountId: form.accountId,
        entity: form.entity as InvoiceEntity,
        type: form.type as InvoiceType,
        soId: form.soId || undefined,
        issueDate: form.issueDate || undefined,
        dueDate: form.dueDate || undefined,
        currency: form.currency || undefined,
        subtotal: form.subtotal ? parseFloat(form.subtotal) : undefined,
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : undefined,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
        notes: form.notes || undefined,
      }
      if (isEdit) {
        const response = await invoiceApi.update(id!, {
          issueDate: form.issueDate || undefined,
          dueDate: form.dueDate || undefined,
          subtotal: form.subtotal ? parseFloat(form.subtotal) : undefined,
          taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : undefined,
          totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : undefined,
          notes: form.notes || undefined,
        })
        if (response.data.success) { toast.success('Invoice updated'); navigate('/finance/invoices') }
      } else {
        const response = await invoiceApi.create(payload)
        if (response.data.success) { toast.success('Invoice created'); navigate('/finance/invoices') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save invoice') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/finance/invoices')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Invoices
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID *</label>
                <input type="text" name="accountId" value={form.accountId} onChange={handleChange} required placeholder="UUID" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order ID</label>
                <input type="text" name="soId" value={form.soId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
                <select name="entity" value={form.entity} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {Object.values(InvoiceEntity).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {Object.values(InvoiceType).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Amounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="number" step="0.01" name="subtotal" value={form.subtotal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                <input type="number" step="0.01" name="taxAmount" value={form.taxAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" name="totalAmount" value={form.totalAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" name="currency" value={form.currency} onChange={handleChange} maxLength={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/finance/invoices')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
