import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { warrantyApi } from '../../api/erpApi'
import { Warranty } from '../../types/erp'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'
import { FeatureGate } from '../../components/rbac'

export default function WarrantiesListPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      const response = await warrantyApi.getAll(0, 100)
      if (response.data.success) {
        setWarranties(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch warranties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const rows = warranties.map((warranty) => {
      const daysRemaining = Math.ceil((new Date(warranty.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        Type: warranty.type,
        Status: warranty.status,
        StartDate: warranty.startDate,
        EndDate: warranty.endDate,
        DaysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        EquipmentId: warranty.equipmentId || '',
        SalesOrderId: warranty.soId || '',
        AccountId: warranty.accountId,
        Notes: warranty.notes || '',
      }
    })

    exportToExcel(rows, {
      fileName: `EVERX_Warranties_${getExportDateStamp()}.xlsx`,
      sheetName: 'Warranties',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CLAIMED: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="p-6">Loading warranties...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warranties</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={warranties.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <FeatureGate requiredPermission="ERP_CREATE">
            <button onClick={() => navigate('/erp/warranties/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Warranty</button>
          </FeatureGate>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Remaining</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warranties.map((warranty) => {
              const daysRemaining = Math.ceil((new Date(warranty.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <tr key={warranty.id} onClick={() => navigate(`/erp/warranties/${warranty.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline">{warranty.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(warranty.status)}`}>
                      {warranty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(warranty.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(warranty.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={daysRemaining < 30 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {warranties.length === 0 && <div className="text-center py-12 text-gray-500">No warranties found</div>}
      </div>
    </div>
  )
}
