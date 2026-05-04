import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { warrantyApi } from '../../api/erpApi'
import { FeatureGate } from '../../components/rbac'

export default function WarrantyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [warranty, setWarranty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

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
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    try {
      await warrantyApi.update(id!, formData)
      setWarranty(formData)
      setEditMode(false)
      alert('Warranty updated successfully')
    } catch (err) {
      alert('Error saving')
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
    </div>
  )
}
