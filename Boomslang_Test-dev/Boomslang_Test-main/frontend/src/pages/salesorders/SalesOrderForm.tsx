import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesOrderApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

const SO_STATUSES = ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED']

interface FormData {
  soNumber: string
  accountId: string
  dealId: string
  status: string
  orderDate: string
  expectedDelivery: string
  currency: string
  totalAmount: string
  incoterms: string
  destinationCountry: string
  notes: string
}

const defaultForm: FormData = {
  soNumber: '',
  accountId: '',
  dealId: '',
  status: 'DRAFT',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDelivery: '',
  currency: 'USD',
  totalAmount: '',
  incoterms: '',
  destinationCountry: '',
  notes: '',
}

export default function SalesOrderForm() {
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
      const response = await salesOrderApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          soNumber: e.soNumber || '',
          accountId: e.accountId || '',
          dealId: e.dealId || '',
          status: e.status || 'DRAFT',
          orderDate: e.orderDate || '',
          expectedDelivery: e.expectedDelivery || '',
          currency: e.currency || 'USD',
          totalAmount: e.totalAmount?.toString() || '',
          incoterms: e.incoterms || '',
          destinationCountry: e.destinationCountry || '',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load sales order') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.soNumber || !form.accountId || !form.status) { toast.error('SO Number, Account ID, and Status are required'); return }
    try {
      setSaving(true)
      const payload = {
        ...form,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        orderDate: form.orderDate || null,
        expectedDelivery: form.expectedDelivery || null,
        dealId: form.dealId || null,
      }
      if (isEdit) {
        const response = await salesOrderApi.update(id!, payload)
        if (response.data.success) { toast.success('Sales order updated'); navigate('/erp/sales-orders') }
      } else {
        const response = await salesOrderApi.create(payload)
        if (response.data.success) { toast.success('Sales order created'); navigate('/erp/sales-orders') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save sales order') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/sales-orders')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Sales Orders
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Sales Order' : 'Create Sales Order'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SO Number *</label>
                <input type="text" name="soNumber" value={form.soNumber} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID *</label>
                <input type="text" name="accountId" value={form.accountId} onChange={handleChange} required placeholder="UUID" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SO_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal ID</label>
                <input type="text" name="dealId" value={form.dealId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates & Shipping</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input type="date" name="orderDate" value={form.orderDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                <input type="date" name="expectedDelivery" value={form.expectedDelivery} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incoterms</label>
                <input type="text" name="incoterms" value={form.incoterms} onChange={handleChange} maxLength={50} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                <input type="text" name="destinationCountry" value={form.destinationCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
            <button type="button" onClick={() => navigate('/erp/sales-orders')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update SO' : 'Create SO'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
