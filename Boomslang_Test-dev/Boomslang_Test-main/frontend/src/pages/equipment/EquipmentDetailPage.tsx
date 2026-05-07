import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { equipmentApi, warrantyApi, sparePartApi, equipmentQcApi } from '../../api/erpApi'
import { Equipment, Warranty, SparePart, EquipmentQCRecord } from '../../types/erp'
import { FeatureGate } from '../../components/rbac'

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [spareParts, setSpareParts] = useState<SparePart[]>([])
  const [qcRecords, setQcRecords] = useState<EquipmentQCRecord[]>([])

  useEffect(() => {
    if (id) {
      loadAll()
    }
  }, [id])

  const loadAll = async () => {
    try {
      setLoading(true)
      const response = await equipmentApi.getById(id!)
      if (response.success && response.data) {
        const eq: Equipment = response.data
        setEquipment(eq)
        fetchRelated(eq)
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelated = async (eq: Equipment) => {
    try {
      const [wRes, qcRes, spRes] = await Promise.allSettled([
        warrantyApi.getByEquipment(id!),
        equipmentQcApi.getByEquipment(id!),
        sparePartApi.getAll(0, 200),
      ])
      if (wRes.status === 'fulfilled') {
        const d = wRes.value?.data?.data ?? wRes.value?.data ?? []
        setWarranties(Array.isArray(d) ? d : (d.content ?? []))
      }
      if (qcRes.status === 'fulfilled') {
        const d = qcRes.value?.data?.data ?? qcRes.value?.data ?? []
        setQcRecords(Array.isArray(d) ? d : (d.content ?? []))
      }
      if (spRes.status === 'fulfilled') {
        const all: SparePart[] = spRes.value?.data?.data?.content ?? spRes.value?.data?.content ?? []
        const model = eq.model?.toLowerCase() ?? ''
        const make = eq.make?.toLowerCase() ?? ''
        if (model || make) {
          setSpareParts(all.filter(p =>
            p.compatibleModels?.some(m => {
              const ml = m.toLowerCase()
              return (model && ml.includes(model)) || (make && ml.includes(make))
            })
          ))
        }
      }
    } catch (err) {
      console.error('Failed to fetch related data:', err)
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
            <FeatureGate requiredPermission="ERP_EDIT">
              <button
                onClick={() => navigate(`/erp/equipment/${id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
            </FeatureGate>
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

      {/* Warranties */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Warranties</h2>
        {warranties.length === 0 ? (
          <p className="text-sm text-gray-500">No warranty records linked to this equipment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Start Date</th>
                <th className="pb-2">End Date</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {warranties.map(w => (
                <tr key={w.id} className="border-b last:border-0">
                  <td className="py-2">{w.type?.replace(/_/g, ' ')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${w.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2">{w.startDate}</td>
                  <td className="py-2">{w.endDate}</td>
                  <td className="py-2">
                    <button onClick={() => navigate(`/erp/warranties/${w.id}`)} className="text-blue-600 hover:underline text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* QC Records */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">QC Records</h2>
        {qcRecords.length === 0 ? (
          <p className="text-sm text-gray-500">No QC records for this equipment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">QC Number</th>
                <th className="pb-2">QC Date</th>
                <th className="pb-2">Outcome</th>
                <th className="pb-2">Inspector</th>
              </tr>
            </thead>
            <tbody>
              {qcRecords.map(q => (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="py-2">{q.qcNumber}</td>
                  <td className="py-2">{q.qcDate}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.overallResult === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {q.overallResult}
                    </span>
                  </td>
                  <td className="py-2">{(q as any).inspectedBy || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compatible Spare Parts */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Compatible Spare Parts</h2>
        {spareParts.length === 0 ? (
          <p className="text-sm text-gray-500">No compatible spare parts found for this equipment model.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Part Number</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Stock Qty</th>
                <th className="pb-2">Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {spareParts.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{p.partNumber}</td>
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.category || 'N/A'}</td>
                  <td className="py-2">
                    <span className={`font-semibold ${p.stockQty <= (p.reorderPoint ?? 0) ? 'text-red-600' : 'text-green-700'}`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="py-2">{p.unitCost ? `${p.currency ?? ''} ${p.unitCost.toLocaleString()}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
