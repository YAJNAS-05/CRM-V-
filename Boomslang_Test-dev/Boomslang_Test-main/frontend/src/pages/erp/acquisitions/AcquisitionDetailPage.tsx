import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { acquisitionApi, equipmentAssessmentApi } from '../../api/erpApi'
import { EquipmentAcquisition, EquipmentAssessment } from '../../types/erp'
import { toast } from 'sonner'

const STAGE_COLORS: Record<string, string> = {
  SOURCING: 'bg-blue-100 text-blue-700',
  ASSESSED: 'bg-yellow-100 text-yellow-700',
  PO_RAISED: 'bg-orange-100 text-orange-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  IN_WAREHOUSE: 'bg-indigo-100 text-indigo-700',
  REFURBISHING: 'bg-pink-100 text-pink-700',
  QC_PASSED: 'bg-green-100 text-green-700',
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
}

function formatDate(val?: string) {
  if (!val) return '—'
  try { return new Date(val).toLocaleDateString() } catch { return val }
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 grid grid-cols-2 gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  )
}

export default function AcquisitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [acquisition, setAcquisition] = useState<EquipmentAcquisition | null>(null)
  const [assessments, setAssessments] = useState<EquipmentAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await acquisitionApi.getById(id)
        const data = res.data?.data ?? res.data
        setAcquisition(data)
        // Fetch related assessments
        const assessRes = await equipmentAssessmentApi.getByAcquisition(id)
        const aList = assessRes.data?.data?.content ?? assessRes.data?.content ?? assessRes.data?.data ?? []
        setAssessments(Array.isArray(aList) ? aList : [])
      } catch {
        toast.error('Failed to load acquisition')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this acquisition? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await acquisitionApi.delete(id!)
      toast.success('Acquisition deleted')
      navigate('/erp/acquisitions')
    } catch {
      toast.error('Failed to delete acquisition')
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading acquisition...</div>
  if (!acquisition) return <div className="p-8 text-center text-red-500">Acquisition not found</div>

  const stageBadge = STAGE_COLORS[acquisition.stage] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/erp/acquisitions')}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Back to list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{acquisition.acquisitionNumber}</h1>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${stageBadge}`}>
              {acquisition.stage}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/erp/acquisitions/${id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Acquisition Details</h2>
          <dl>
            <DetailRow label="Acquisition #" value={acquisition.acquisitionNumber} />
            <DetailRow label="Equipment Source" value={acquisition.equipmentSource} />
            <DetailRow label="Seller Name" value={acquisition.sellerName} />
            <DetailRow label="Stage" value={acquisition.stage} />
            <DetailRow label="Warehouse Location" value={acquisition.warehouseLocation} />
            <DetailRow label="Shipment Tracking" value={acquisition.shipmentTracking} />
            {acquisition.refurbCost != null && (
              <DetailRow label="Refurb Cost" value={`$${acquisition.refurbCost.toLocaleString()}`} />
            )}
          </dl>
        </div>

        {/* Timeline Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Timeline</h2>
          <dl>
            <DetailRow label="Sourced Date" value={formatDate(acquisition.sourcedDate)} />
            <DetailRow label="Assessed Date" value={formatDate(acquisition.assessedDate)} />
            <DetailRow label="PO Raised Date" value={formatDate(acquisition.poRaisedDate)} />
            <DetailRow label="Deinstalled Date" value={formatDate(acquisition.deinstalledDate)} />
            <DetailRow label="Arrived Warehouse" value={formatDate(acquisition.arrivedWarehouseDate)} />
            <DetailRow label="Refurbished Date" value={formatDate(acquisition.refurbishedDate)} />
            <DetailRow label="QC Passed Date" value={formatDate(acquisition.qcPassedDate)} />
            <DetailRow label="Available Date" value={formatDate(acquisition.availableDate)} />
          </dl>
        </div>
      </div>

      {/* Notes */}
      {acquisition.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{acquisition.notes}</p>
        </div>
      )}

      {/* Related Assessments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Equipment Assessments</h2>
          <button
            onClick={() => navigate('/erp/equipment-assessments/new')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            + New Assessment
          </button>
        </div>
        {assessments.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No assessments linked to this acquisition.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-500 uppercase">Assessment #</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-500 uppercase">Outcome</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="py-2 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{a.assessmentNumber}</td>
                    <td className="py-2.5 pr-4 text-gray-700">{a.assessmentType}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.outcome === 'PASS' ? 'bg-green-100 text-green-700' : a.outcome === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {a.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{a.conditionGrade ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{formatDate(a.inspectionDate)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => navigate(`/erp/equipment-assessments/${a.id}/edit`)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-400 flex gap-6">
        <span>Created: {formatDate(acquisition.createdAt)}</span>
        <span>Updated: {formatDate(acquisition.updatedAt)}</span>
      </div>
    </div>
  )
}
