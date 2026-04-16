import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { purchaseOrderApi, supplierApi } from '../../api/erpApi'
import { Supplier } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const PO_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']
const PAYMENT_METHODS = ['TT_30', 'TT_60', 'LC', 'INSTALLMENT', 'TT', 'CREDIT_CARD']
const PO_TYPES = ['EQUIPMENT_ACQUISITION', 'SPARE_PARTS', 'CONSUMABLES']

interface FormData {
  poNumber: string
  supplierId: string
  poType: string
  status: string
  orderDate: string
  expectedDelivery: string
  currency: string
  totalAmount: string
  paymentMethod: string
  notes: string
}

const defaultForm: FormData = {
  poNumber: '',
  supplierId: '',
  poType: 'EQUIPMENT_ACQUISITION',
  status: 'DRAFT',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDelivery: '',
  currency: 'USD',
  totalAmount: '',
  paymentMethod: '',
  notes: '',
}

export default function PurchaseOrderForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id, isEdit])

  const loadSuppliers = async () => {
    try {
      setLookupLoading(true)
      const response = await supplierApi.getAll(0, 200)
      setSuppliers(response.data?.data?.content || [])
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrderApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        const rawNotes = e.notes || ''
        const poTypeMatch = rawNotes.match(/PO Type:\s*([A-Z_]+)/)
        const cleanedNotes = rawNotes.replace(/PO Type:\s*[A-Z_]+\n?/g, '').trim()
        setForm({
          poNumber: e.poNumber || '',
          supplierId: e.supplierId || '',
          poType: poTypeMatch?.[1] || 'EQUIPMENT_ACQUISITION',
          status: e.status || 'DRAFT',
          orderDate: e.orderDate || '',
          expectedDelivery: e.expectedDelivery || '',
          currency: e.currency || 'USD',
          totalAmount: e.totalAmount?.toString() || '',
          paymentMethod: e.paymentMethod || '',
          notes: cleanedNotes,
        })
      }
    } catch { toast.error('Failed to load purchase order') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name !== 'supplierId') {
      setForm((prev) => ({ ...prev, [name]: value }))
      return
    }

    const selectedSupplier = suppliers.find((supplier) => supplier.id === value)
    setForm((prev) => ({
      ...prev,
      supplierId: value,
      paymentMethod: selectedSupplier?.paymentTerms || prev.paymentMethod,
      currency: selectedSupplier?.currency || prev.currency,
    }))
  }

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.companyName,
        meta: [supplier.country, supplier.paymentTerms].filter(Boolean).join(' | ') || undefined,
      })),
    [suppliers]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.poNumber || !form.supplierId || !form.status) {
      toast.error('PO Number, Supplier, and Status are required')
      return
    }

    if (form.orderDate && form.expectedDelivery && form.expectedDelivery < form.orderDate) {
      toast.error('Expected delivery cannot be before order date')
      return
    }

    try {
      setSaving(true)
      const notesWithType = [form.notes?.trim() || null, `PO Type: ${form.poType}`]
        .filter(Boolean)
        .join('\n')

      const payload = {
        poNumber: form.poNumber,
        supplierId: form.supplierId,
        status: form.status,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        orderDate: form.orderDate || null,
        expectedDelivery: form.expectedDelivery || null,
        currency: form.currency,
        paymentMethod: form.paymentMethod || null,
        notes: notesWithType || null,
      }

      if (isEdit) {
        const response = await purchaseOrderApi.update(id!, payload)
        if (response.data.success) { toast.success('Purchase order updated'); navigate('/erp/purchase-orders') }
      } else {
        const response = await purchaseOrderApi.create(payload)
        if (response.data.success) { toast.success('Purchase order created'); navigate('/erp/purchase-orders') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save purchase order') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/purchase-orders')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Purchase Orders
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number *</label>
                <input type="text" name="poNumber" value={form.poNumber} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <SearchableLookupSelect
                label="Supplier"
                name="supplierId"
                value={form.supplierId}
                options={supplierOptions}
                onChange={handleLookupChange}
                required
                disabled={lookupLoading}
                placeholder="Search supplier by company name"
                helperText="Selecting a supplier auto-fills payment terms when available"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {PO_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Type</label>
                <select name="poType" value={form.poType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {PO_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates & Payment</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Payment Method</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" name="totalAmount" value={form.totalAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/purchase-orders')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update PO' : 'Create PO'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
