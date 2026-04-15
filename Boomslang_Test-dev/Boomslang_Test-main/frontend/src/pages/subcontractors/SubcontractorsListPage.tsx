import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subcontractorApi } from '../../api/erpApi'
import { Subcontractor } from '../../types/erp'

export default function SubcontractorsListPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSubcontractors()
  }, [])

  const fetchSubcontractors = async () => {
    try {
      setLoading(true)
      const response = await subcontractorApi.getAll(0, 100)
      if (response.data.success) {
        setSubcontractors(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch subcontractors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading subcontractors...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subcontractors</h1>
        <button onClick={() => navigate('/erp/subcontractors/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Subcontractor</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialisations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hourly Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subcontractors.map((subcontractor) => (
              <tr key={subcontractor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{subcontractor.companyName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{subcontractor.country}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{subcontractor.contactName}</div>
                  <div className="text-xs text-gray-400">{subcontractor.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {subcontractor.specialisations?.join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {subcontractor.hourlyRate ? `${subcontractor.currency} ${subcontractor.hourlyRate}/hr` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subcontractors.length === 0 && <div className="text-center py-12 text-gray-500">No subcontractors found</div>}
      </div>
    </div>
  )
}
