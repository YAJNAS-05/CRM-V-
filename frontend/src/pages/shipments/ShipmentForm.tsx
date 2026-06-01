import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  shipmentApi,
  salesOrderApi,
  purchaseOrderApi,
  subcontractorApi,
  equipmentApi,
  supplierApi,
} from '../../api/erpApi'
import { Equipment, PurchaseOrder, SalesOrder, Subcontractor, Supplier } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const SHIPMENT_STATUSES = ['PREPARING', 'BOOKED', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'RETURNED', 'CANCELLED']
const SHIPMENT_TYPES = ['SEA', 'AIR', 'ROAD']
const CARRIERS = ['DHL', 'FEDEX', 'TNT', 'MAERSK', 'MSC', 'HAPAG_LLOYD', 'AIR_FREIGHT', 'ROAD', 'OTHER']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']

interface FormData {
  trackingNumber: string
  carrier: string
  shipmentType: string
  originCountry: string
  destinationCountry: string
  status: string
  shippedDate: string
  estimatedArrival: string
  actualArrival: string
  freightCost: string
  currency: string
  soId: string
  poId: string
  equipmentId: string
  subcontractorId: string
  conditionOnDelivery: string
  notes: string
}

const defaultForm: FormData = {
  trackingNumber: '',
  carrier: '',
  shipmentType: 'SEA',
  originCountry: '',
  destinationCountry: '',
  status: 'PREPARING',
  shippedDate: '',
  estimatedArrival: '',
  actualArrival: '',
  freightCost: '',
  currency: 'USD',
  soId: '',
  poId: '',
  equipmentId: '',
  subcontractorId: '',
  conditionOnDelivery: '',
  notes: '',
}

export default function ShipmentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id, isEdit])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [salesOrderResponse, purchaseOrderResponse, subcontractorResponse, equipmentResponse, supplierResponse] = await Promise.all([
        salesOrderApi.getAll(0, 200),
        purchaseOrderApi.getAll(0, 200),
        subcontractorApi.getAll(0, 200),
        equipmentApi.getAll(0, 200),
        supplierApi.getAll(0, 200),
      ])

      setSalesOrders(salesOrderResponse.data?.data?.content || [])
      setPurchaseOrders(purchaseOrderResponse.data?.data?.content || [])
      setSubcontractors(subcontractorResponse.data?.data?.content || [])
      setEquipment(equipmentResponse.data?.content || [])
      setSuppliers(supplierResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load shipment lookups')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await shipmentApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        const rawNotes = e.notes || ''
        const shipmentType = rawNotes.match(/Shipment Type:\s*([A-Z_]+)/)?.[1] || 'SEA'
        const equipmentId = rawNotes.match(/Equipment ID:\s*([A-Za-z0-9-]+)/)?.[1] || ''
        const subcontractorId = rawNotes.match(/Subcontractor ID:\s*([A-Za-z0-9-]+)/)?.[1] || ''
        const cleanedNotes = rawNotes
          .replace(/Shipment Type:\s*[A-Z_]+\n?/g, '')
          .replace(/Equipment ID:\s*[A-Za-z0-9-]+\n?/g, '')
          .replace(/Subcontractor ID:\s*[A-Za-z0-9-]+\n?/g, '')
          .trim()

        setForm({
          trackingNumber: e.trackingNumber || '',
          carrier: e.carrier || '',
          shipmentType,
          originCountry: e.originCountry || '',
          destinationCountry: e.destinationCountry || '',
          status: e.status || 'PREPARING',
          shippedDate: e.shippedDate || '',
          estimatedArrival: e.estimatedArrival || '',
          actualArrival: e.actualArrival || '',
          freightCost: e.freightCost?.toString() || '',
          currency: e.currency || 'USD',
          soId: e.soId || '',
          poId: e.poId || '',
          equipmentId,
          subcontractorId,
          conditionOnDelivery: '',
          notes: cleanedNotes,
        })
      }
    } catch { toast.error('Failed to load shipment') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name === 'soId') {
      const selectedSo = salesOrders.find((order) => order.id === value)
      const firstEquipmentId = selectedSo?.items?.[0]?.equipmentId || ''
      const shouldKeepEquipment = !form.equipmentId || selectedSo?.items?.some((item) => item.equipmentId === form.equipmentId)

      setForm((prev) => ({
        ...prev,
        soId: value,
        poId: value ? '' : prev.poId,
        destinationCountry: selectedSo?.destinationCountry || prev.destinationCountry,
        equipmentId: shouldKeepEquipment ? (prev.equipmentId || firstEquipmentId) : firstEquipmentId,
      }))
      return
    }

    if (name === 'poId') {
      const selectedPo = purchaseOrders.find((order) => order.id === value)
      const supplier = suppliers.find((item) => item.id === selectedPo?.supplierId)
      const firstEquipmentId = selectedPo?.items?.[0]?.equipmentId || ''
      const shouldKeepEquipment = !form.equipmentId || selectedPo?.items?.some((item) => item.equipmentId === form.equipmentId)

      setForm((prev) => ({
        ...prev,
        poId: value,
        soId: value ? '' : prev.soId,
        originCountry: supplier?.country || prev.originCountry,
        equipmentId: shouldKeepEquipment ? (prev.equipmentId || firstEquipmentId) : firstEquipmentId,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const salesOrderOptions = useMemo(
    () =>
      salesOrders.map((order) => ({
        value: order.id,
        label: order.soNumber,
        meta: order.destinationCountry || order.status,
      })),
    [salesOrders]
  )

  const purchaseOrderOptions = useMemo(
    () =>
      purchaseOrders.map((order) => {
        const supplier = suppliers.find((item) => item.id === order.supplierId)
        return {
          value: order.id,
          label: order.poNumber,
          meta: supplier?.companyName || order.status,
        }
      }),
    [purchaseOrders, suppliers]
  )

  const linkedEquipmentIds = useMemo(() => {
    const ids = new Set<string>()

    if (form.soId) {
      const selectedSalesOrder = salesOrders.find((order) => order.id === form.soId)
      selectedSalesOrder?.items?.forEach((item) => {
        if (item.equipmentId) ids.add(item.equipmentId)
      })
    }

    if (form.poId) {
      const selectedPurchaseOrder = purchaseOrders.find((order) => order.id === form.poId)
      selectedPurchaseOrder?.items?.forEach((item) => {
        if (item.equipmentId) ids.add(item.equipmentId)
      })
    }

    return ids
  }, [form.poId, form.soId, purchaseOrders, salesOrders])

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter((item) => linkedEquipmentIds.size === 0 || linkedEquipmentIds.has(item.id) || item.id === form.equipmentId)
        .map((item) => ({
          value: item.id,
          label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
          meta: item.status,
        })),
    [equipment, form.equipmentId, linkedEquipmentIds]
  )

  const subcontractorOptions = useMemo(
    () =>
      subcontractors.map((item) => ({
        value: item.id,
        label: item.companyName,
        meta: [item.country, item.currency].filter(Boolean).join(' | ') || undefined,
      })),
    [subcontractors]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.status) {
      toast.error('Status is required')
      return
    }

    if (!form.soId && !form.poId) {
      toast.error('Select either a Sales Order or a Purchase Order')
      return
    }

    if (form.shippedDate && form.estimatedArrival && form.estimatedArrival < form.shippedDate) {
      toast.error('Estimated arrival must be on or after shipped date')
      return
    }

    if (form.shippedDate && form.actualArrival && form.actualArrival < form.shippedDate) {
      toast.error('Actual arrival must be on or after shipped date')
      return
    }

    try {
      setSaving(true)
      const notesWithWorkflowFields = [
        form.notes?.trim() || null,
        `Shipment Type: ${form.shipmentType}`,
        form.equipmentId ? `Equipment ID: ${form.equipmentId}` : null,
        form.subcontractorId ? `Subcontractor ID: ${form.subcontractorId}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      const payload = {
        trackingNumber: form.trackingNumber,
        carrier: form.carrier || null,
        originCountry: form.originCountry || null,
        destinationCountry: form.destinationCountry || null,
        status: form.status,
        shippedDate: form.shippedDate || null,
        estimatedArrival: form.estimatedArrival || null,
        actualArrival: form.actualArrival || null,
        freightCost: form.freightCost ? parseFloat(form.freightCost) : null,
        currency: form.currency,
        soId: form.soId || null,
        poId: form.poId || null,
        conditionOnDelivery: form.status === 'DELIVERED' ? (form.conditionOnDelivery || 'GOOD') : null,
        notes: notesWithWorkflowFields || null,
      }

      if (isEdit) {
        const response = await shipmentApi.update(id!, payload)
        if (response.data.success) { toast.success('Shipment updated'); navigate('/erp/shipments') }
      } else {
        const response = await shipmentApi.create(payload)
        if (response.data.success) { toast.success('Shipment created'); navigate('/erp/shipments') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save shipment') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/shipments')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Shipments
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Shipment' : 'Create Shipment'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Shipment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <select name="carrier" value={form.carrier} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Carrier</option>
                  {CARRIERS.map((carrier) => (
                    <option key={carrier} value={carrier}>{carrier.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              {form.status === 'DELIVERED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Delivery *</label>
                  <select name="conditionOnDelivery" value={form.conditionOnDelivery} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="GOOD">GOOD — equipment → Installed</option>
                    <option value="DAMAGED">DAMAGED — equipment → Under Maintenance</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Type</label>
                <select name="shipmentType" value={form.shipmentType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SHIPMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Route & Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
                <input type="text" name="originCountry" value={form.originCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                <input type="text" name="destinationCountry" value={form.destinationCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipped Date</label>
                <input type="date" name="shippedDate" value={form.shippedDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival</label>
                <input type="date" name="estimatedArrival" value={form.estimatedArrival} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Arrival</label>
                <input type="date" name="actualArrival" value={form.actualArrival} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freight Cost</label>
                <input type="number" step="0.01" name="freightCost" value={form.freightCost} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Linked Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableLookupSelect
                label="Sales Order"
                name="soId"
                value={form.soId}
                options={salesOrderOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search sales orders by SO number"
              />
              <SearchableLookupSelect
                label="Purchase Order"
                name="poId"
                value={form.poId}
                options={purchaseOrderOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search purchase orders by PO number"
              />
              <SearchableLookupSelect
                label="Equipment"
                name="equipmentId"
                value={form.equipmentId}
                options={equipmentOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Equipment auto-fills from SO/PO selection"
                helperText={form.soId || form.poId ? 'Showing equipment from selected order' : 'Select SO or PO to narrow equipment'}
              />
              <SearchableLookupSelect
                label="Subcontractor / Delivery Agent"
                name="subcontractorId"
                value={form.subcontractorId}
                options={subcontractorOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search subcontractor"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/shipments')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Shipment' : 'Create Shipment'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
