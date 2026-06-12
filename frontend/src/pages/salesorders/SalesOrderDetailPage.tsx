import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesOrderApi } from '../../api/erpApi'
import axiosInstance from '../../api/axiosInstance'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'

const SO_STATUSES = ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_ORDER = ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'INSTALLED']

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-yellow-100 text-yellow-700',
  READY_TO_SHIP: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  INSTALLED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [so, setSo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [editItems, setEditItems] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'shipments' | 'invoices'>('details')
  const [shipments, setShipments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  useEffect(() => {
    if (id) void fetchSalesOrder()
  }, [id])

  useEffect(() => {
    if (so && !editMode) void fetchRelated()
  }, [so?.id, editMode])

  const fetchSalesOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await salesOrderApi.getById(id!)
      if (response.data?.success && response.data?.data) {
        setSo(response.data.data)
        setFormData(response.data.data)
        setEditItems(response.data.data.items || [])
      } else {
        setError('Failed to fetch sales order')
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchRelated = async () => {
    if (!id) return
    setRelatedLoading(true)
    try {
      const [shipRes, invRes] = await Promise.allSettled([
        axiosInstance.get(`/v1/erp/shipments?salesOrderId=${id}`),
        axiosInstance.get(`/v1/finance/invoices?salesOrderId=${id}`),
      ])
      if (shipRes.status === 'fulfilled') {
        const d = shipRes.value?.data?.data
        setShipments(d?.content ?? (Array.isArray(d) ? d : []))
      }
      if (invRes.status === 'fulfilled') {
        const d = invRes.value?.data?.data
        setInvoices(d?.content ?? (Array.isArray(d) ? d : []))
      }
    } finally {
      setRelatedLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    setEditItems((prev) => prev.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0
        const price = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0
        updated.lineTotal = (qty * price).toFixed(2)
      }
      return updated
    }))
  }

  const handleSave = async () => {
    if (!formData) return
    try {
      const response = await salesOrderApi.update(id!, {
        soNumber: formData.soNumber || null,
        dealId: formData.dealId || null,
        accountId: formData.accountId,
        status: formData.status,
        orderDate: formData.orderDate || null,
        expectedDelivery: formData.expectedDelivery || null,
        actualDelivery: formData.actualDelivery || null,
        currency: formData.currency || null,
        totalAmount: formData.totalAmount ?? null,
        incoterms: formData.incoterms || null,
        destinationCountry: formData.destinationCountry || null,
        notes: formData.notes || null,
        items: editItems.map((item: any) => ({
          equipmentId: item.equipmentId || null,
          quantity: Number(item.quantity),
          unitPrice: item.unitPrice != null ? Number(item.unitPrice) : null,
          lineTotal: item.lineTotal != null ? Number(item.lineTotal) : null,
        })),
      })
      if (response.data?.success) {
        setSo(response.data.data)
        setFormData(response.data.data)
        setEditItems(response.data.data.items || [])
        setEditMode(false)
        toast.success('Sales order updated successfully')
      }
    } catch (err) {
      toast.error('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this sales order?')) return
    try {
      await salesOrderApi.delete(id!)
      toast.success('Sales order deleted')
      navigate('/erp/sales-orders')
    } catch (err) {
      toast.error('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleConfirm = async () => {
    if (!confirm(`Confirm SO ${so?.soNumber}? This will RESERVE all linked equipment and create a shipment + deposit invoice.`)) return
    try {
      const response = await salesOrderApi.confirm(id!)
      if (response.data?.success) {
        setSo(response.data.data)
        setFormData(response.data.data)
        setEditItems(response.data.data.items || [])
        toast.success('Sales order confirmed. Equipment reserved, shipment created.')
      }
    } catch (err: any) {
      toast.error('Error: ' + (err?.response?.data?.message || err.message || 'Unknown error'))
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm(`Cancel SO ${so?.soNumber}? This will release reserved equipment back to warehouse and cancel the shipment.`)) return
    try {
      const response = await salesOrderApi.cancel(id!)
      if (response.data?.success) {
        setSo(response.data.data)
        setFormData(response.data.data)
        setEditItems(response.data.data.items || [])
        toast.success('Sales order cancelled. Equipment released.')
      }
    } catch (err: any) {
      toast.error('Error: ' + (err?.response?.data?.message || err.message || 'Unknown error'))
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded">{error}</div>
  if (!so) return <div className="p-6 bg-yellow-50 text-yellow-700 rounded">Sales order not found</div>

  const displayData = editMode ? formData : so
  const items: any[] = editMode ? editItems : (so.items || [])
  const currentStatusIndex = STATUS_ORDER.indexOf(displayData?.status)

  const TABS = [
    { key: 'details', label: 'Details' },
    { key: 'items', label: `Line Items (${items.length})` },
    { key: 'shipments', label: `Shipments (${shipments.length})` },
    { key: 'invoices', label: `Invoices (${invoices.length})` },
  ] as const

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <button onClick={() => navigate('/erp/sales-orders')} className="text-sm text-slate-500 hover:text-slate-700 mb-1">← Back to Sales Orders</button>
          <h1 className="text-2xl font-bold">SO #{displayData?.soNumber || 'N/A'}</h1>
          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLOR[displayData?.status] || 'bg-gray-100 text-gray-700'}`}>
            {displayData?.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => void handleSave()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Save</button>
              </FeatureGate>
              <button onClick={() => { setEditMode(false); setFormData(so); setEditItems(so.items || []) }} className="px-4 py-2 bg-gray-500 text-white rounded text-sm">Cancel</button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Edit</button>
              </FeatureGate>
              {so?.status === 'DRAFT' && (
                <FeatureGate requiredPermission="ERP_EDIT">
                  <button onClick={() => void handleConfirm()} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">Confirm SO</button>
                </FeatureGate>
              )}
              {(so?.status === 'DRAFT' || so?.status === 'CONFIRMED') && (
                <FeatureGate requiredPermission="ERP_EDIT">
                  <button onClick={() => void handleCancelOrder()} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm">Cancel SO</button>
                </FeatureGate>
              )}
              <FeatureGate requiredPermission="ERP_DELETE">
                <button onClick={() => void handleDelete()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
              </FeatureGate>
            </>
          )}
        </div>
      </div>

      {/* Status progression bar */}
      {displayData?.status !== 'CANCELLED' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-1">
            {STATUS_ORDER.map((status, index) => (
              <div key={status} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-2 w-full rounded-full ${index <= currentStatusIndex ? 'bg-sky-500' : 'bg-gray-200'}`} />
                <span className={`text-[9px] font-medium text-center leading-tight ${index === currentStatusIndex ? 'text-sky-700 font-bold' : 'text-gray-400'}`}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Details Card */}
      {displayData?.customerDetails && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
              <p className="text-sm font-semibold text-gray-800">{displayData.customerDetails.name}</p>
              {displayData.customerDetails.industry && (
                <p className="text-xs text-gray-600">{displayData.customerDetails.industry}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <p className="text-sm text-gray-700">
                {displayData.customerDetails.email && (
                  <>
                    <a href={`mailto:${displayData.customerDetails.email}`} className="text-blue-600 hover:underline">{displayData.customerDetails.email}</a>
                    <br />
                  </>
                )}
                {displayData.customerDetails.phone && <span>{displayData.customerDetails.phone}</span>}
              </p>
              {displayData.customerDetails.website && (
                <p className="text-xs">
                  <a href={displayData.customerDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {displayData.customerDetails.website}
                  </a>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Billing Address</label>
              <p className="text-xs text-gray-700">
                {[
                  displayData.customerDetails.billingStreet,
                  displayData.customerDetails.billingCity,
                  displayData.customerDetails.billingState,
                  displayData.customerDetails.billingZip,
                  displayData.customerDetails.billingCountry,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-base font-semibold">Order Information</h2>
            {[
              { label: 'SO Number', name: 'soNumber', type: 'text' },
              { label: 'Order Date', name: 'orderDate', type: 'date' },
              { label: 'Expected Delivery', name: 'expectedDelivery', type: 'date' },
              { label: 'Actual Delivery', name: 'actualDelivery', type: 'date' },
              { label: 'Destination Country', name: 'destinationCountry', type: 'text' },
              { label: 'Incoterms', name: 'incoterms', type: 'text' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={(displayData?.[name] as string) || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-700"
                />
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-base font-semibold">Financial</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount</label>
              <input type="number" name="totalAmount" value={displayData?.totalAmount || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
              <select name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-700">
                {['AUD', 'USD', 'JPY', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select name="status" value={displayData?.status || 'DRAFT'} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-700">
                {SO_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-700" rows={3} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Line Items */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Line Items</h2>
              {editMode && (
                <button
                  onClick={() => setEditItems((prev) => [...prev, { equipmentId: '', quantity: 1, unitPrice: '', lineTotal: '' }])}
                  className="px-3 py-1.5 bg-sky-600 text-white text-xs rounded hover:bg-sky-700"
                >
                  + Add Item
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400">No line items on this sales order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Equipment ID', 'Qty', 'Unit Price', 'Line Total', editMode ? 'Action' : ''].filter(Boolean).map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          {editMode ? (
                            <input value={item.equipmentId || ''} onChange={(e) => handleItemChange(index, 'equipmentId', e.target.value)} className="border rounded px-2 py-1 text-xs w-52" placeholder="Equipment UUID" />
                          ) : (
                            <span className="text-xs font-mono text-gray-600">{item.equipmentId || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editMode ? (
                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="border rounded px-2 py-1 text-xs w-20" />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editMode ? (
                            <input type="number" step="0.01" value={item.unitPrice || ''} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="border rounded px-2 py-1 text-xs w-28" />
                          ) : (
                            item.unitPrice != null ? `${so.currency || ''} ${Number(item.unitPrice).toLocaleString()}` : '—'
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {item.lineTotal != null ? `${so.currency || ''} ${Number(item.lineTotal).toLocaleString()}` : '—'}
                        </td>
                        {editMode && (
                          <td className="px-4 py-2">
                            <button onClick={() => setEditItems((prev) => prev.filter((_, i) => i !== index))} className="text-xs text-red-600 hover:underline">Remove</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Line Items Summary/Totals */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Item Count</h3>
                <p className="text-3xl font-bold text-gray-900">{items.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Quantity</h3>
                <p className="text-3xl font-bold text-gray-900">{items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 0), 0)}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Line Items Subtotal</h3>
                <p className="text-3xl font-bold text-green-700">
                  {so.currency} {items.reduce((sum: number, i: any) => sum + (Number(i.lineTotal) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {so.totalAmount && (
                  <div className="mt-3 pt-3 border-t border-green-200 text-xs text-gray-600">
                    <p>SO Total Amount: <strong className="text-green-700">{so.currency} {Number(so.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Shipments */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold mb-4">Shipments</h2>
          {relatedLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : shipments.length === 0 ? (
            <p className="text-sm text-gray-400">No shipments linked to this sales order. Confirm the SO to auto-generate a shipment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Shipment #', 'Status', 'Origin', 'Destination', 'Ship Date', 'ETA'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipments.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/erp/shipments/${s.id}`)}>
                      <td className="px-4 py-2 font-medium text-sky-700">{s.shipmentNumber || s.id?.slice(0, 8)}</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{s.status}</span></td>
                      <td className="px-4 py-2 text-gray-500">{s.originCountry || '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{s.destinationCountry || '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{s.shipDate ? new Date(s.shipDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold mb-4">Invoices</h2>
          {relatedLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-gray-400">No invoices linked to this sales order. Invoices are auto-generated on SO confirmation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Invoice #', 'Type', 'Status', 'Issue Date', 'Due Date', 'Amount'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/finance/invoices/${inv.id}`)}>
                      <td className="px-4 py-2 font-medium text-sky-700">{inv.invoiceNumber || inv.id?.slice(0, 8)}</td>
                      <td className="px-4 py-2 text-gray-600">{inv.invoiceType || '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 font-medium">{inv.currency} {inv.totalAmount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
