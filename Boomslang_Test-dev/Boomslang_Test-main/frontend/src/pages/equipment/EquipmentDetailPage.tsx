import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { equipmentApi } from '../../api/erpApi'
import { Equipment } from '../../types/erp'

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchEquipment()
    }
  }, [id])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await equipmentApi.getById(id!)
      if (response.success) {
        setEquipment(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading equipment details...</div>
  }

  if (!equipment) {
    return <div className="p-6">Equipment not found</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/erp/equipment')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Equipment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{equipment.internalCode}</h1>
            <p className="text-gray-600">{equipment.make} {equipment.model}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/erp/equipment/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              equipment.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {equipment.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Equipment Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                <dd className="text-sm text-gray-900">{equipment.serialNumber || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{equipment.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Condition Grade</dt>
                <dd className="text-sm text-gray-900">{equipment.conditionGrade}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Year of Manufacture</dt>
                <dd className="text-sm text-gray-900">{equipment.yearOfManufacture || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Hours of Use</dt>
                <dd className="text-sm text-gray-900">{equipment.hoursOfUse || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Pricing & Location</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Acquisition Cost</dt>
                <dd className="text-sm text-gray-900">
                  {equipment.acquisitionCost ? `${equipment.acquisitionCurrency} ${equipment.acquisitionCost.toLocaleString()}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Asking Price</dt>
                <dd className="text-sm text-gray-900 font-semibold">
                  {equipment.askingPrice ? `${equipment.askingCurrency} ${equipment.askingPrice.toLocaleString()}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Warehouse Location</dt>
                <dd className="text-sm text-gray-900">{equipment.warehouseLocation}</dd>
              </div>
            </dl>

            <h2 className="text-lg font-semibold mt-6 mb-4">Compliance</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${equipment.tgaCompliant ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm">TGA Compliant</span>
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${equipment.ceMarked ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm">CE Marked</span>
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${equipment.fdaCleared ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="text-sm">FDA Cleared</span>
              </div>
            </div>
          </div>
        </div>

        {equipment.notes && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{equipment.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
