import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subcontractorApi } from '../../api/erpApi'
import { toast } from 'sonner'
import { FeatureGate } from '../../components/rbac'

export default function SubcontractorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [subcontractor, setSubcontractor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const response = await subcontractorApi.getById(id)
          if (response.data) {
            setSubcontractor(response.data)
            setFormData(response.data)
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
      await subcontractorApi.update(id!, formData)
      setSubcontractor(formData)
      setEditMode(false)
      toast.success('Subcontractor updated successfully')
    } catch (err) {
      toast.error('Error saving')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : subcontractor

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subcontractor Details</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </FeatureGate>
              <button onClick={() => { setEditMode(false); setFormData(subcontractor) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              </FeatureGate>
              <button onClick={() => navigate('/erp/subcontractors')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input type="text" name="companyName" value={displayData?.companyName || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Contact Person</label>
              <input type="text" name="contactPerson" value={displayData?.contactPerson || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" name="email" value={displayData?.email || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" name="phone" value={displayData?.phone || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Address & Registration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Address</label>
              <textarea name="address" value={displayData?.address || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium">Tax ID</label>
              <input type="text" name="taxId" value={displayData?.taxId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Registration Number</label>
              <input type="text" name="registrationNumber" value={displayData?.registrationNumber || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Services & Capabilities</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Service Type</label>
              <select name="serviceType" value={displayData?.serviceType || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="">Select Service</option>
                <option value="REPAIR">Repair & Maintenance</option>
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="ASSEMBLY">Assembly</option>
                <option value="LOGISTICS">Logistics</option>
                <option value="TESTING">Testing & Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Specialization</label>
              <input type="text" name="specialization" value={displayData?.specialization || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance & Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select name="status" value={displayData?.status || 'ACTIVE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Rating (out of 5)</label>
              <input type="number" name="rating" value={displayData?.rating || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" min="0" max="5" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Last 12 Month Value (₹)</label>
              <input type="number" name="lastYearValue" value={displayData?.lastYearValue || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
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
