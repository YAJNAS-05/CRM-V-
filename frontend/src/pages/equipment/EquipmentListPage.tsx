import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { equipmentApi } from '../../api/erpApi'
import { Equipment } from '../../types/erp'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'
import { FeatureGate } from '../../components/rbac'

type LoadState = 'idle' | 'loading' | 'error'

export default function EquipmentListPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    void fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoadState('loading')
      setErrorMessage('')
      const response = await equipmentApi.getAll(0, 200)
      const rows = response?.data?.content || []
      setEquipment(Array.isArray(rows) ? rows : [])
      setLoadState('idle')
    } catch (error: any) {
      console.error('Failed to fetch equipment:', error)
      setErrorMessage(error?.message || 'Failed to load equipment')
      setLoadState('error')
    }
  }

  const handleExport = () => {
    const rows = filteredEquipment.map((item) => ({
      Code: item.internalCode,
      Make: item.make,
      Model: item.model,
      SerialNumber: item.serialNumber || '',
      Category: item.category,
      Status: item.status,
      Warehouse: item.warehouseLocation,
      Currency: item.askingCurrency || '',
      AskingPrice: item.askingPrice || 0,
      Notes: item.notes || '',
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Equipment_${getExportDateStamp()}.xlsx`,
      sheetName: 'Equipment',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_STOCK: 'bg-green-100 text-green-800',
      IN_WAREHOUSE: 'bg-green-100 text-green-800',
      SOLD: 'bg-blue-100 text-blue-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      IN_MAINTENANCE: 'bg-orange-100 text-orange-800',
      UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800',
      IN_REFURBISHMENT: 'bg-cyan-100 text-cyan-800',
      DECOMMISSIONED: 'bg-slate-200 text-slate-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const statuses = useMemo(() => {
    const values = Array.from(new Set(equipment.map((item) => item.status).filter(Boolean)))
    return values.sort()
  }, [equipment])

  const filteredEquipment = useMemo(() => {
    const q = query.trim().toLowerCase()
    return equipment
      .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!q) return true
        const content = [item.internalCode, item.make, item.model, item.serialNumber, item.category, item.warehouseLocation]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return content.includes(q)
      })
  }, [equipment, query, statusFilter])

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">Equipment Inventory</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={filteredEquipment.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <FeatureGate requiredPermission="ERP_CREATE">
            <button
              onClick={() => navigate('/erp/equipment/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Equipment
            </button>
          </FeatureGate>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search code, make, model, serial..."
          className="rounded border px-3 py-2"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="ALL">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <div className="rounded border px-3 py-2 text-sm text-slate-600 bg-slate-50">
          Showing {filteredEquipment.length} of {equipment.length}
        </div>
      </div>

      {loadState === 'loading' && <div className="p-6 rounded border bg-white">Loading equipment...</div>}

      {loadState === 'error' && (
        <div className="p-6 rounded border border-rose-200 bg-rose-50 text-rose-700">
          <p>{errorMessage || 'Failed to load equipment.'}</p>
          <button className="mt-2 px-3 py-1 rounded border border-rose-300" onClick={() => void fetchEquipment()}>
            Retry
          </button>
        </div>
      )}

      {loadState === 'idle' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asking Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/erp/equipment/${item.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                    {item.internalCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.make} {item.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.warehouseLocation || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.askingPrice ? `${item.askingCurrency || ''} ${item.askingPrice.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(event) => event.stopPropagation()}>
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => navigate(`/erp/equipment/${item.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No equipment found for the selected filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
