import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { acquisitionApi } from '../../api/erpApi'
import { EquipmentAcquisition } from '../../types/erp'

export default function AcquisitionsListPage() {
  const [items, setItems] = useState<EquipmentAcquisition[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await acquisitionApi.getAll(0, 100)
      if (response.data.success) {
        setItems(response.data.data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch acquisitions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading acquisitions...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Acquisitions</h1>
        <button
          onClick={() => navigate('/erp/acquisitions/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Acquisition
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acquisition #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/erp/acquisitions/${item.id}`)}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.acquisitionNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.equipmentSource}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.sellerName || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.stage}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.warehouseLocation || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-12 text-gray-500">No acquisitions found</div>}
      </div>
    </div>
  )
}
