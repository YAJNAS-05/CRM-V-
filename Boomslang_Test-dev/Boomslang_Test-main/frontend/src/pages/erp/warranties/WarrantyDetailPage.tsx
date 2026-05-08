import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { warrantyApi, serviceTicketApi } from '../../api/erpApi'
import { ServiceTicket } from '../../types/erp'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'

export default function WarrantyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [warranty, setWarranty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [claims, setClaims] = useState<ServiceTicket[]>([])
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimForm, setClaimForm] = useState({ claimType: 'PARTS_FAILURE', description: '', estimatedCost: '', priority: 'MEDIUM' })
  const [filingClaim, setFilingClaim] = useState(false)

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const response = await warrantyApi.getById(id!)
          if (response.data?.data) {
            setWarranty(response.data.data)
            setFormData(response.data.data)
          }
        } catch (err) {
          console.error('Error:', err)
        } finally {
          setLoading(false)
        }
      })()
      fetchClaims()
    }
  }, [id])

  const fetchClaims = async () => {
    try {
      const res = await serviceTicketApi.getAll(0, 200)
      const all: ServiceTicket[] = res?.data?.data?.content ?? res?.data?.content ?? []
      setClaims(all.filter(t => t.type === 'WARRANTY_CLAIM' && t.description?.includes(`[WARRANTY:${id}]`)))
    } catch (err) {
      // non-critical
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    try {
      await warrantyApi.update(id!, formData)
      setWarranty(formData)
      setEditMode(false)
      toast.success('Warranty updated successfully')
    } catch (err) {
      toast.error('Error saving warranty')
    }
  }

  const handleFileClaim = async () => {
    if (!claimForm.description.trim()) {
      toast.error('Please provide a claim description')
      return
    }
    setFilingClaim(true)
    try {
      const ticketData = {
        title: `Warranty Claim — ${claimForm.claimType.replace(/_/g, ' ')}`,
        description: `[WARRANTY:${id}]\n${claimForm.description}`,
        type: 'WARRANTY_CLAIM',
        priority: claimForm.priority,
        status: 'OPEN',
        equipmentId: warranty?.equipmentId,
        customerId: warranty?.accountId,
        accountId: warranty?.accountId,
        cost: claimForm.estimatedCost ? parseFloat(claimForm.estimatedCost) : undefined,
        reportedDate: new Date().toISOString().split('T')[0],
      }
      const res = await serviceTicketApi.create(ticketData)
      const created: ServiceTicket = res?.data?.data ?? res?.data
      if (created) {
        setClaims(prev => [created, ...prev])
      }
      setClaimForm({ claimType: 'PARTS_FAILURE', description: '', estimatedCost: '', priority: 'MEDIUM' })
      setShowClaimModal(false)
      toast.success('Warranty claim filed successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to file claim')
    } finally {
      setFilingClaim(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : warranty

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Warranty Details</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </FeatureGate>
              <button onClick={() => { setEditMode(false); setFormData(warranty) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              </FeatureGate>
              <button onClick={() => navigate('/erp/warranties')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Warranty Coverage</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Coverage Type</label>
              <select name="type" value={displayData?.type || 'PARTS_AND_LABOUR'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="PARTS_ONLY">Parts Only</option>
                <option value="LABOUR_ONLY">Labour Only</option>
                <option value="PARTS_AND_LABOUR">Parts & Labour</option>
                <option value="REMOTE_SUPPORT">Remote Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input type="date" name="startDate" value={displayData?.startDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input type="date" name="endDate" value={displayData?.endDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Support & Maintenance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Response SLA (Hours)</label>
              <input type="number" name="responseSlaHours" value={displayData?.responseSlaHours || '24'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">PPM Schedule</label>
              <select name="ppmSchedule" value={displayData?.ppmSchedule || 'ANNUAL'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="ANNUAL">Annual</option>
                <option value="BI_ANNUAL">Bi-Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Next PPM Due</label>
              <input type="date" name="nextPpmDue" value={displayData?.nextPpmDue || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Status & References</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select name="status" value={displayData?.status || 'ACTIVE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="VOID">Void</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Equipment SKU</label>
            <input type="text" name="equipmentId" value={displayData?.equipmentId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium">Sales Order ID</label>
            <input type="text" name="soId" value={displayData?.soId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>

      {/* Warranty Claims Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Warranty Claims</h2>
          <FeatureGate requiredPermission="ERP_EDIT">
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              + File Claim
            </button>
          </FeatureGate>
        </div>

        {claims.length === 0 ? (
          <p className="text-sm text-gray-500">No claims have been filed against this warranty.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Ticket #</th>
                <th className="pb-2">Claim Type</th>
                <th className="pb-2">Priority</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Reported</th>
                <th className="pb-2">Cost</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{c.ticketNumber}</td>
                  <td className="py-2">{c.title.replace('Warranty Claim — ', '')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      c.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}>{c.priority}</span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'CLOSED' || c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      c.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>{c.status}</span>
                  </td>
                  <td className="py-2">{c.reportedDate ?? c.createdAt?.split('T')[0]}</td>
                  <td className="py-2">{c.cost ? c.cost.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* File Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">File Warranty Claim</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                <select
                  value={claimForm.claimType}
                  onChange={e => setClaimForm(f => ({ ...f, claimType: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="PARTS_FAILURE">Parts Failure</option>
                  <option value="SOFTWARE_DEFECT">Software Defect</option>
                  <option value="LABOUR_REQUEST">Labour Request</option>
                  <option value="PPM_SERVICE">PPM Service</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={claimForm.priority}
                  onChange={e => setClaimForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={claimForm.description}
                  onChange={e => setClaimForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the issue or fault in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={claimForm.estimatedCost}
                  onChange={e => setClaimForm(f => ({ ...f, estimatedCost: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleFileClaim}
                disabled={filingClaim}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {filingClaim ? 'Filing...' : 'Submit Claim'}
              </button>
              <button
                onClick={() => { setShowClaimModal(false); setClaimForm({ claimType: 'PARTS_FAILURE', description: '', estimatedCost: '', priority: 'MEDIUM' }) }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
