import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { siteAssessmentApi } from '../../api/erpApi'
import { SiteAssessment } from '../../types/erp'

export default function SiteAssessmentsListPage() {
  const [items, setItems] = useState<SiteAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await siteAssessmentApi.getAll(0, 100)
      if (response.data.success) {
        setItems(response.data.data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch site assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading site assessments...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Assessments</h1>
        <button
          onClick={() => navigate('/erp/site-assessments/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Site Assessment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Readiness</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Power</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/erp/site-assessments/${item.id}/edit`)}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.assessmentNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.salesOrderId || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.overallReadiness}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.assessmentMethod || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.powerCompliant == null ? '-' : item.powerCompliant ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-12 text-gray-500">No site assessments found</div>}
      </div>
    </div>
  )
}
