import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { shipmentApi } from '../../api/erpApi'
import { Shipment } from '../../types/erp'

export default function ShipmentsListPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const response = await shipmentApi.getAll(0, 100)
      if (response.data.success) {
        setShipments(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      BOOKED: 'bg-gray-100 text-gray-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      CUSTOMS: 'bg-yellow-100 text-yellow-800',
      DELIVERED: 'bg-green-100 text-green-800',
      DELAYED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="p-6">Loading shipments...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipments & Logistics</h1>
        <button onClick={() => navigate('/erp/shipments/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Shipment</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{shipment.trackingNumber || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{shipment.carrier}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{shipment.originCountry}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{shipment.destinationCountry}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && <div className="text-center py-12 text-gray-500">No shipments found</div>}
      </div>
    </div>
  )
}
