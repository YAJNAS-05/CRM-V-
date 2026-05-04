import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shipmentApi } from '../../api/erpApi'
import { FeatureGate } from '../../components/rbac'

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          setLoading(true)
          const response = await shipmentApi.getById(id!)
          if (response.data?.data) {
            setShipment(response.data.data)
            setFormData(response.data.data)
          }
        } catch (err) {
          console.error('Failed to fetch:', err)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    try {
      await shipmentApi.update(id!, formData)
      setShipment(formData)
      setEditMode(false)
      alert('Saved successfully')
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
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
              <button onClick={() => { setEditMode(false); setFormData(shipment) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
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
              <label className="block text-sm font-medium">Destination</label>
              <input type="text" name="destinationCountry" value={displayData?.destinationCountry || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select name="status" value={displayData?.status || 'PREPARING'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="PREPARING">Preparing</option>
                <option value="BOOKED">Booked</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="CUSTOMS_CLEARANCE">Customs Clearance</option>
                <option value="DELIVERED">Delivered</option>
                <option value="RETURNED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">ETD</label>
              <input type="date" name="etd" value={displayData?.etd || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tracking</h2>
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
              <label className="block text-sm font-medium">ETA</label>
              <input type="date" name="eta" value={displayData?.eta || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
