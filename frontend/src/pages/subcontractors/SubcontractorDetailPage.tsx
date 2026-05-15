import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { subcontractorApi } from '../../api/erpApi'
import { toast } from 'sonner'
import { FeatureGate } from '../../components/rbac'

interface SubcontractorFormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  country: string
  coverageRegions: string
  specialisations: string
  hourlyRate: string
  currency: string
  subcontractorType: string
  certifications: string
  isActive: boolean
  notes: string
}

function parseMetadata(rawNotes: string | null | undefined) {
  const source = rawNotes || ''

  const subcontractorType = source.match(/Subcontractor Type:\s*([^\n]+)/)?.[1]?.trim() || 'ALL'
  const certificationsCsv = source.match(/Certifications:\s*([^\n]+)/)?.[1]?.trim() || ''
  const certifications = certificationsCsv
    ? certificationsCsv.split(',').map((item) => item.trim()).filter(Boolean)
    : []
  const isActive = (source.match(/Is Active:\s*([^\n]+)/)?.[1] || 'YES').trim().toUpperCase() === 'YES'

  const cleanedNotes = source
    .replace(/Subcontractor Type:\s*[^\n]+\n?/g, '')
    .replace(/Certifications:\s*[^\n]+\n?/g, '')
    .replace(/Is Active:\s*[^\n]+\n?/g, '')
    .trim()

  return {
    subcontractorType,
    certifications,
    isActive,
    cleanedNotes,
  }
}

function toSubcontractorFormData(subcontractor: any): SubcontractorFormData {
  const metadata = parseMetadata(subcontractor?.notes)

  return {
    companyName: subcontractor?.companyName || '',
    contactName: subcontractor?.contactName || '',
    email: subcontractor?.email || '',
    phone: subcontractor?.phone || '',
    country: subcontractor?.country || '',
    coverageRegions: subcontractor?.coverageRegions?.join(', ') || '',
    specialisations: subcontractor?.specialisations?.join(', ') || '',
    hourlyRate: subcontractor?.hourlyRate?.toString() || '',
    currency: subcontractor?.currency || 'USD',
    subcontractorType: metadata.subcontractorType,
    certifications: metadata.certifications.join(', '),
    isActive: metadata.isActive,
    notes: metadata.cleanedNotes,
  }
}

function buildSubcontractorPayload(formData: SubcontractorFormData) {
  const metadataLines = [
    `Subcontractor Type: ${formData.subcontractorType || 'ALL'}`,
    `Certifications: ${formData.certifications || 'NONE'}`,
    `Is Active: ${formData.isActive ? 'YES' : 'NO'}`,
  ].join('\n')

  return {
    companyName: formData.companyName,
    contactName: formData.contactName || null,
    email: formData.email || null,
    phone: formData.phone || null,
    country: formData.country || null,
    coverageRegions: formData.coverageRegions ? formData.coverageRegions.split(',').map((item) => item.trim()).filter(Boolean) : [],
    specialisations: formData.specialisations ? formData.specialisations.split(',').map((item) => item.trim()).filter(Boolean) : [],
    hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
    currency: formData.currency || null,
    notes: [formData.notes.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
  }
}

export default function SubcontractorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [subcontractor, setSubcontractor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<SubcontractorFormData | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await subcontractorApi.getById(id)
        const envelope = response.data
        if (envelope?.success && envelope.data) {
          setSubcontractor(envelope.data)
          setFormData(toSubcontractorFormData(envelope.data))
        }
      } catch (err) {
        console.error('Error loading subcontractor:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => (prev ? { ...prev, [name]: (e.target as HTMLInputElement).checked } : null))
      return
    }

    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!id || !formData?.companyName) {
      toast.error('Company Name is required')
      return
    }

    try {
      const response = await subcontractorApi.update(id, buildSubcontractorPayload(formData))
      const envelope = response.data
      if (envelope?.success && envelope.data) {
        setSubcontractor(envelope.data)
        setFormData(toSubcontractorFormData(envelope.data))
      }
      setEditMode(false)
      toast.success('Subcontractor updated successfully')
    } catch {
      toast.error('Error saving subcontractor')
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
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(subcontractor ? toSubcontractorFormData(subcontractor) : null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
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
              <label className="block text-sm font-medium">Contact Name</label>
              <input type="text" name="contactName" value={displayData?.contactName || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
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
          <h2 className="text-xl font-semibold mb-4">Coverage & Capabilities</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Country</label>
              <input type="text" name="country" value={displayData?.country || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Coverage Regions (comma separated)</label>
              <textarea name="coverageRegions" value={displayData?.coverageRegions || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium">Specialisations (comma separated)</label>
              <textarea name="specialisations" value={displayData?.specialisations || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Commercial & Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Hourly Rate</label>
            <input type="number" name="hourlyRate" value={displayData?.hourlyRate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input type="text" name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div className="flex items-center gap-2 mt-7">
            <input type="checkbox" name="isActive" checked={Boolean(displayData?.isActive)} onChange={handleInputChange} disabled={!editMode} className="mt-1" />
            <label className="block text-sm font-medium">Is Active</label>
          </div>
          <div>
            <label className="block text-sm font-medium">Subcontractor Type</label>
            <input type="text" name="subcontractorType" value={displayData?.subcontractorType || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Certifications (comma separated)</label>
            <input type="text" name="certifications" value={displayData?.certifications || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
        </div>
      </div>
    </div>
  )
}
