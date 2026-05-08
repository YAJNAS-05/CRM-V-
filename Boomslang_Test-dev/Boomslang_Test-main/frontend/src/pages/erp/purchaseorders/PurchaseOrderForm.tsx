import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { purchaseOrderApi, supplierApi, equipmentApi } from '../../api/erpApi'
import { Supplier, Equipment } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'
import { z } from 'zod'

const poSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  status: z.string().min(1, 'Status is required'),
  poType: z.string().min(1, 'PO Type is required'),
  orderDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
  currency: z.string().optional(),
  totalAmount: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.orderDate && data.expectedDelivery && data.expectedDelivery < data.orderDate) return false
  return true
}, { message: 'Expected delivery cannot be before order date', path: ['expectedDelivery'] })

const PO_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']
const PAYMENT_METHODS = ['TT_30', 'TT_60', 'LC', 'INSTALLMENT', 'TT', 'CREDIT_CARD']
const PO_TYPES = ['EQUIPMENT_ACQUISITION', 'SPARE_PARTS', 'CONSUMABLES']

interface LineItem {
  equipmentId: string
  description: string
  quantity: string
  unitPrice: string
  lineTotal: string
}

const defaultLineItem = (): LineItem => ({
  equipmentId: '',
  description: '',
  quantity: '1',
  unitPrice: '',
  lineTotal: '',
})

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
  items: LineItem[]
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
  items: [defaultLineItem()],
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
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])

  useEffect(() => {
    loadSuppliers()
    loadEquipment()
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

  const loadEquipment = async () => {
    try {
      const response = await equipmentApi.getAll(0, 500)
      setEquipmentList(response.data?.content || [])
    } catch {
      // non-fatal
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
        const existingItems: LineItem[] = (e.items || []).map((item: any) => ({
          equipmentId: item.equipmentId || '',
          description: item.description || '',
          quantity: item.quantity?.toString() || '1',
          unitPrice: item.unitPrice?.toString() || '',
          lineTotal: item.lineTotal?.toString() || '',
        }))
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
          items: existingItems.length > 0 ? existingItems : [defaultLineItem()],
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

  // Line item helpers
  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setForm(prev => {
      const items = prev.items.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }
        // Auto-fill description when equipment selected
        if (field === 'equipmentId' && value) {
          const eq = equipmentList.find(e => e.id === value)
          if (eq) {
            updated.description = `${eq.make || ''} ${eq.model || ''} (${eq.internalCode || eq.id})`.trim()
            if (!updated.unitPrice && eq.acquisitionCost) {
              updated.unitPrice = eq.acquisitionCost.toString()
            }
          }
        }
        // Auto-calc line total
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0
          const price = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0
          updated.lineTotal = qty > 0 && price > 0 ? (qty * price).toFixed(2) : ''
        }
        return updated
      })
      // Auto-calc total amount from items
      const total = items.reduce((sum, item) => sum + (parseFloat(item.lineTotal) || 0), 0)
      return { ...prev, items, totalAmount: total > 0 ? total.toFixed(2) : prev.totalAmount }
    })
  }

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, defaultLineItem()] }))

  const removeItem = (index: number) => {
    setForm(prev => {
      const items = prev.items.filter((_, i) => i !== index)
      const remaining = items.length > 0 ? items : [defaultLineItem()]
      const total = remaining.reduce((sum, item) => sum + (parseFloat(item.lineTotal) || 0), 0)
      return { ...prev, items: remaining, totalAmount: total > 0 ? total.toFixed(2) : prev.totalAmount }
    })
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

  const equipmentOptions = useMemo(
    () => [
      { value: '', label: '— Manual entry (no equipment link) —' },
      ...equipmentList.map(eq => ({
        value: eq.id,
        label: `${eq.internalCode || eq.id} — ${eq.make || ''} ${eq.model || ''}`.trim(),
        meta: eq.status || undefined,
      }))
    ],
    [equipmentList]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = poSchema.safeParse(form)
    if (!result.success) {
      toast.error(result.error.errors[0]?.message || 'Please fix validation errors')
      return
    }

    try {
      setSaving(true)
      const notesWithType = [form.notes?.trim() || null, `PO Type: ${form.poType}`]
        .filter(Boolean)
        .join('\n')

      const validItems = form.items.filter(item => item.description.trim())
      const payload = {
        ...(isEdit && form.poNumber ? { poNumber: form.poNumber } : {}),
        supplierId: form.supplierId,
        status: form.status,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        orderDate: form.orderDate || null,
        expectedDelivery: form.expectedDelivery || null,
        currency: form.currency,
        paymentMethod: form.paymentMethod || null,
        notes: notesWithType || null,
        items: validItems.map(item => ({
          equipmentId: item.equipmentId || null,
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
          lineTotal: item.lineTotal ? parseFloat(item.lineTotal) : null,
        })),
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  name="poNumber"
                  value={form.poNumber}
                  onChange={handleChange}
                  readOnly={!isEdit}
                  placeholder={isEdit ? '' : 'Auto-generated on save'}
                  className={`w-full rounded-lg px-3 py-2 ${
                    isEdit
                      ? 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      : 'border border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
                {!isEdit && (
                  <p className="text-xs text-gray-500 mt-1">PO number is generated by backend after create.</p>
                )}
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

          {/* Line Items — Machines / Equipment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Line Items — Machines &amp; Parts</h2>
                <p className="text-sm text-gray-500 mt-0.5">Select existing equipment or enter a description manually for new stock being ordered.</p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Item
              </button>
            </div>

            <table className="w-full border border-gray-200 rounded-lg text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-3 py-2 text-left border-b border-gray-200 rounded-tl-lg w-72">Equipment / Machine</th>
                  <th className="px-3 py-2 text-left border-b border-gray-200">Description</th>
                  <th className="px-3 py-2 text-center border-b border-gray-200 w-16">Qty</th>
                  <th className="px-3 py-2 text-right border-b border-gray-200 w-28">Unit Price</th>
                  <th className="px-3 py-2 text-right border-b border-gray-200 w-24">Total</th>
                  <th className="px-3 py-2 border-b border-gray-200 rounded-tr-lg w-10"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => {
                  const linkedEq = item.equipmentId ? equipmentList.find(e => e.id === item.equipmentId) : null
                  return (
                    <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 py-2 border-b border-gray-100">
                        <select
                          value={item.equipmentId}
                          onChange={e => updateItem(index, 'equipmentId', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">— Manual entry —</option>
                          {equipmentList.map(eq => (
                            <option key={eq.id} value={eq.id}>
                              {eq.internalCode ? `[${eq.internalCode}] ` : ''}{eq.make} {eq.model}
                            </option>
                          ))}
                        </select>
                        {linkedEq && (
                          <span className={`text-xs mt-1 inline-block px-1.5 py-0.5 rounded font-medium ${
                            linkedEq.status === 'IN_STOCK' || linkedEq.status === 'IN_WAREHOUSE' ? 'bg-green-100 text-green-700' :
                            linkedEq.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {linkedEq.status?.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100 text-right font-medium text-gray-700 whitespace-nowrap">
                        {item.lineTotal ? parseFloat(item.lineTotal).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-100 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {form.items.some(i => i.lineTotal) && (
                <tfoot>
                  <tr className="bg-blue-50">
                    <td colSpan={4} className="px-3 py-2 text-right text-sm font-semibold text-blue-800 rounded-bl-lg">
                      Subtotal ({form.currency})
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-semibold text-blue-800 whitespace-nowrap">
                      {form.items.reduce((s, i) => s + (parseFloat(i.lineTotal) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="rounded-br-lg"></td>
                  </tr>
                </tfoot>
              )}
            </table>
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
