import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { acquisitionApi, equipmentApi, purchaseOrderApi, supplierApi } from '../../api/erpApi'
import { Equipment, PurchaseOrder, Supplier } from '../../types/erp'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const STAGES = [
  'SOURCED',
  'ASSESSED',
  'PO_RAISED',
  'DEINSTALLED',
  'IN_TRANSIT',
  'ARRIVED_WAREHOUSE',
  'REFURBISHED',
  'QC_PASSED',
  'AVAILABLE',
]

const SOURCES = ['HOSPITAL', 'DEALER', 'BROKER', 'AUCTION', 'DIRECT_SELLER']

interface FormData {
  acquisitionNumber: string
  equipmentId: string
  supplierId: string
  purchaseOrderId: string
  equipmentSource: string
  sellerName: string
  stage: string
  warehouseLocation: string
  refurbCost: string
  shipmentTracking: string
  notes: string
}

const defaultForm: FormData = {
  acquisitionNumber: '',
  equipmentId: '',
  supplierId: '',
  purchaseOrderId: '',
  equipmentSource: 'HOSPITAL',
  sellerName: '',
  stage: 'SOURCED',
  warehouseLocation: '',
  refurbCost: '',
  shipmentTracking: '',
  notes: '',
}

export default function AcquisitionForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadItem(id)
    }
  }, [id, isEdit])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [equipmentResponse, supplierResponse, purchaseOrderResponse] = await Promise.all([
        equipmentApi.getAll(0, 300),
        supplierApi.getAll(0, 300),
        purchaseOrderApi.getAll(0, 300),
      ])

      setEquipment(equipmentResponse.data?.content || [])
      setSuppliers(supplierResponse.data?.data?.content || [])
      setPurchaseOrders(purchaseOrderResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load lookup data')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await acquisitionApi.getById(itemId)
      if (response.data.success && response.data.data) {
        const data = response.data.data
        setForm({
          acquisitionNumber: data.acquisitionNumber || '',
          equipmentId: data.equipmentId || '',
          supplierId: data.supplierId || '',
          purchaseOrderId: data.purchaseOrderId || '',
          equipmentSource: data.equipmentSource || 'HOSPITAL',
          sellerName: data.sellerName || '',
          stage: data.stage || 'SOURCED',
          warehouseLocation: data.warehouseLocation || '',
          refurbCost: data.refurbCost != null ? String(data.refurbCost) : '',
          shipmentTracking: data.shipmentTracking || '',
          notes: data.notes || '',
        })
      }
    } catch {
      toast.error('Failed to load acquisition')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const equipmentOptions = useMemo(
    () =>
      equipment.map((item) => ({
        value: item.id,
        label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
        meta: item.status,
      })),
    [equipment]
  )

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.companyName,
        meta: supplier.country || supplier.email || undefined,
      })),
    [suppliers]
  )

  const purchaseOrderOptions = useMemo(
    () =>
      purchaseOrders.map((order) => ({
        value: order.id,
        label: order.poNumber,
        meta: order.status,
      })),
    [purchaseOrders]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const payload = {
        equipmentSource: form.equipmentSource,
        sellerName: form.sellerName,
        stage: form.stage,
        warehouseLocation: form.warehouseLocation,
        shipmentTracking: form.shipmentTracking,
        notes: form.notes,
        equipmentId: form.equipmentId || undefined,
        supplierId: form.supplierId || undefined,
        purchaseOrderId: form.purchaseOrderId || undefined,
        refurbCost: form.refurbCost ? Number(form.refurbCost) : undefined,
      }

      if (isEdit && id) {
        const response = await acquisitionApi.update(id, payload)
        if (response.data.success) {
          toast.success('Acquisition updated')
          navigate('/erp/acquisitions')
        }
      } else {
        const response = await acquisitionApi.create(payload)
        if (response.data.success) {
          toast.success('Acquisition created')
          navigate('/erp/acquisitions')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save acquisition')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading acquisition...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/acquisitions')} className="text-blue-600 hover:text-blue-800">
          Back to Acquisitions
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Acquisition' : 'Add Acquisition'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {isEdit
              ? `Acquisition Number: ${form.acquisitionNumber || '-'}`
              : 'Acquisition Number will be auto-generated when you save this record.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Equipment Source *</label>
              <select name="equipmentSource" value={form.equipmentSource} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seller Name</label>
              <input name="sellerName" value={form.sellerName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stage *</label>
              <select name="stage" value={form.stage} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </div>

            <SearchableLookupSelect
              label="Equipment"
              name="equipmentId"
              value={form.equipmentId}
              options={equipmentOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search equipment"
            />

            <SearchableLookupSelect
              label="Supplier"
              name="supplierId"
              value={form.supplierId}
              options={supplierOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search supplier"
            />

            <SearchableLookupSelect
              label="Purchase Order"
              name="purchaseOrderId"
              value={form.purchaseOrderId}
              options={purchaseOrderOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search purchase order"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Location</label>
              <input name="warehouseLocation" value={form.warehouseLocation} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Refurb Cost</label>
              <input name="refurbCost" type="number" value={form.refurbCost} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shipment Tracking</label>
              <input name="shipmentTracking" value={form.shipmentTracking} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/acquisitions')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update Acquisition' : 'Create Acquisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
