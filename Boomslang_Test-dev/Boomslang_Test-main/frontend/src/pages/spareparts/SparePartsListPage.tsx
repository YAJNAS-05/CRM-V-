import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sparePartApi } from '../../api/erpApi'
import { SparePart } from '../../types/erp'

export default function SparePartsListPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSpareParts()
  }, [])

  const fetchSpareParts = async () => {
    try {
      setLoading(true)
      const response = await sparePartApi.getAll(0, 100)
      if (response.data.success) {
        setSpareParts(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch spare parts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading spare parts...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Spare Parts</h1>
        <button onClick={() => navigate('/erp/spareparts/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add Spare Part
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {spareParts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.partNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{part.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={part.reorderPoint && part.stockQty <= part.reorderPoint ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {part.stockQty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {part.unitCost ? `${part.currency} ${part.unitCost.toLocaleString()}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.warehouseLocation}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {spareParts.length === 0 && (
          <div className="text-center py-12 text-gray-500">No spare parts found</div>
        )}
      </div>
    </div>
  )
}
