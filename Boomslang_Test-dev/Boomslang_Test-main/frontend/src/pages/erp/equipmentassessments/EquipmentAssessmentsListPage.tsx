import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { equipmentAssessmentApi } from '../../api/erpApi'
import { EquipmentAssessment } from '../../types/erp'

export default function EquipmentAssessmentsListPage() {
  const [items, setItems] = useState<EquipmentAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await equipmentAssessmentApi.getAll(0, 100)
      if (response.data.success) {
        setItems(response.data.data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch equipment assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading equipment assessments...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Assessments</h1>
        <button
          onClick={() => navigate('/erp/equipment-assessments/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Assessment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/erp/equipment-assessments/${item.id}/edit`)}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.assessmentNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.assessmentType}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.outcome}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.conditionGrade || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.imageQualityRating ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-12 text-gray-500">No assessments found</div>}
      </div>
    </div>
  )
}
