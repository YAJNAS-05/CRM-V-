import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { shipmentApi } from '../../api/erpApi'
import { FeatureGate } from '../../components/rbac'

const SHIPMENT_STATUSES = ['PREPARING', 'BOOKED', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'RETURNED', 'CANCELLED']
const SHIPMENT_TYPES = ['SEA', 'AIR', 'ROAD']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']

interface ShipmentFormData {
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
  conditionOnDelivery: string
  equipmentId: string
  subcontractorId: string
  notes: string
}

function parseShipmentMetadata(rawNotes: string | null | undefined) {
  const source = rawNotes || ''
  const shipmentType = source.match(/Shipment Type:\s*([A-Z_]+)/)?.[1] || 'SEA'
  const equipmentId = source.match(/Equipment ID:\s*([A-Za-z0-9-]+)/)?.[1] || ''
  const subcontractorId = source.match(/Subcontractor ID:\s*([A-Za-z0-9-]+)/)?.[1] || ''

  const cleanedNotes = source
    .replace(/Shipment Type:\s*[A-Z_]+\n?/g, '')
    .replace(/Equipment ID:\s*[A-Za-z0-9-]+\n?/g, '')
    .replace(/Subcontractor ID:\s*[A-Za-z0-9-]+\n?/g, '')
    .trim()

  return {
    shipmentType,
    equipmentId,
    subcontractorId,
    cleanedNotes,
  }
}

function toShipmentFormData(shipment: any): ShipmentFormData {
  const metadata = parseShipmentMetadata(shipment?.notes)

  return {
    trackingNumber: shipment?.trackingNumber || '',
    carrier: shipment?.carrier || '',
    shipmentType: metadata.shipmentType,
    originCountry: shipment?.originCountry || '',
    destinationCountry: shipment?.destinationCountry || '',
    status: shipment?.status || 'PREPARING',
    shippedDate: shipment?.shippedDate || '',
    estimatedArrival: shipment?.estimatedArrival || '',
    actualArrival: shipment?.actualArrival || '',
    freightCost: shipment?.freightCost?.toString() || '',
    currency: shipment?.currency || 'USD',
    soId: shipment?.soId || '',
    poId: shipment?.poId || '',
    conditionOnDelivery: shipment?.conditionOnDelivery || '',
    equipmentId: metadata.equipmentId,
    subcontractorId: metadata.subcontractorId,
    notes: metadata.cleanedNotes,
  }
}

function buildShipmentPayload(formData: ShipmentFormData) {
  const notesWithWorkflowFields = [
    formData.notes.trim() || null,
    `Shipment Type: ${formData.shipmentType}`,
    formData.equipmentId ? `Equipment ID: ${formData.equipmentId}` : null,
    formData.subcontractorId ? `Subcontractor ID: ${formData.subcontractorId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    trackingNumber: formData.trackingNumber || null,
    carrier: formData.carrier || null,
    originCountry: formData.originCountry || null,
    destinationCountry: formData.destinationCountry || null,
    status: formData.status,
    shippedDate: formData.shippedDate || null,
    estimatedArrival: formData.estimatedArrival || null,
    actualArrival: formData.actualArrival || null,
    freightCost: formData.freightCost ? parseFloat(formData.freightCost) : null,
    currency: formData.currency || null,
    soId: formData.soId || null,
    poId: formData.poId || null,
    conditionOnDelivery: formData.status === 'DELIVERED' ? (formData.conditionOnDelivery || 'GOOD') : null,
    notes: notesWithWorkflowFields || null,
  }
}

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<ShipmentFormData | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await shipmentApi.getById(id)
        const envelope = response.data
        if (envelope?.success && envelope.data) {
          setShipment(envelope.data)
          setFormData(toShipmentFormData(envelope.data))
        }
      } catch (err) {
        console.error('Failed to fetch shipment:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!id || !formData?.status) {
      alert('Status is required')
      return
    }

    try {
      const response = await shipmentApi.update(id, buildShipmentPayload(formData))
      const envelope = response.data
      if (envelope?.success && envelope.data) {
        setShipment(envelope.data)
        setFormData(toShipmentFormData(envelope.data))
      }
      setEditMode(false)
      alert('Saved successfully')
    } catch {
      alert('Error saving shipment')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : shipment

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipment Details</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </FeatureGate>
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(shipment ? toShipmentFormData(shipment) : null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              </FeatureGate>
              <button onClick={() => navigate('/erp/shipments')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Shipment Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Origin Country</label>
              <input type="text" name="originCountry" value={displayData?.originCountry || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Destination Country</label>
              <input type="text" name="destinationCountry" value={displayData?.destinationCountry || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select name="status" value={displayData?.status || 'PREPARING'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {SHIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Shipment Type</label>
              <select name="shipmentType" value={displayData?.shipmentType || 'SEA'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {SHIPMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tracking & Dates</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Tracking Number</label>
              <input type="text" name="trackingNumber" value={displayData?.trackingNumber || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Carrier</label>
              <input type="text" name="carrier" value={displayData?.carrier || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Shipped Date</label>
              <input type="date" name="shippedDate" value={displayData?.shippedDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Estimated Arrival</label>
              <input type="date" name="estimatedArrival" value={displayData?.estimatedArrival || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Actual Arrival</label>
              <input type="date" name="actualArrival" value={displayData?.actualArrival || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Commercial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Freight Cost</label>
            <input type="number" name="freightCost" value={displayData?.freightCost || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <select name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          {displayData?.status === 'DELIVERED' && (
            <div>
              <label className="block text-sm font-medium">Condition on Delivery</label>
              <select name="conditionOnDelivery" value={displayData?.conditionOnDelivery || 'GOOD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="GOOD">GOOD</option>
                <option value="DAMAGED">DAMAGED</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">References & Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Sales Order ID</label>
            <input type="text" name="soId" value={displayData?.soId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium">Purchase Order ID</label>
            <input type="text" name="poId" value={displayData?.poId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium">Equipment ID</label>
            <input type="text" name="equipmentId" value={displayData?.equipmentId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium">Subcontractor ID</label>
            <input type="text" name="subcontractorId" value={displayData?.subcontractorId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
        </div>
        <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>
    </div>
  )
}
