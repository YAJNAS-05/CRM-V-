import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { warrantyApi } from '../../api/erpApi'
import { FeatureGate } from '../../components/rbac'

const WARRANTY_TYPES = ['STANDARD', 'EXTENDED', 'LIMITED', 'COMPREHENSIVE', 'PARTS_ONLY', 'LABOR_ONLY', 'AMC']
const WARRANTY_STATUSES = ['ACTIVE', 'EXPIRED', 'VOIDED', 'PENDING', 'CLAIMED']
const PPM_SCHEDULES = ['ANNUAL', 'BI_ANNUAL', 'NONE']
const COMPLIANCE_STANDARDS = ['TGA', 'FDA', 'CE', 'IEC', 'NONE']

interface WarrantyFormData {
  accountId: string
  equipmentId: string
  soId: string
  type: string
  status: string
  startDate: string
  endDate: string
  durationMonths: string
  slaResponseHours: string
  ppmSchedule: string
  nextPpmDueDate: string
  complianceStandard: string
  notes: string
}

function parseWarrantyMetadata(rawNotes: string | null | undefined) {
  const source = rawNotes || ''

  const durationMonths = source.match(/Duration Months:\s*([^\n]+)/)?.[1]?.trim() || '12'
  const slaResponseHours = source.match(/SLA Response Hours:\s*([^\n]+)/)?.[1]?.trim() || '48'
  const ppmSchedule = source.match(/PPM Schedule:\s*([^\n]+)/)?.[1]?.trim() || 'ANNUAL'
  const nextPpmDueDate = source.match(/Next PPM Due Date:\s*([^\n]+)/)?.[1]?.trim() || ''
  const complianceStandard = source.match(/Compliance Standard:\s*([^\n]+)/)?.[1]?.trim() || 'NONE'

  const cleanedNotes = source
    .replace(/Duration Months:\s*[^\n]+\n?/g, '')
    .replace(/SLA Response Hours:\s*[^\n]+\n?/g, '')
    .replace(/PPM Schedule:\s*[^\n]+\n?/g, '')
    .replace(/Next PPM Due Date:\s*[^\n]+\n?/g, '')
    .replace(/Compliance Standard:\s*[^\n]+\n?/g, '')
    .trim()

  return {
    durationMonths,
    slaResponseHours,
    ppmSchedule,
    nextPpmDueDate,
    complianceStandard,
    cleanedNotes,
  }
}

function toWarrantyFormData(warranty: any): WarrantyFormData {
  const metadata = parseWarrantyMetadata(warranty?.notes)

  return {
    accountId: warranty?.accountId || '',
    equipmentId: warranty?.equipmentId || '',
    soId: warranty?.soId || '',
    type: warranty?.type || 'STANDARD',
    status: warranty?.status || 'ACTIVE',
    startDate: warranty?.startDate || '',
    endDate: warranty?.endDate || '',
    durationMonths: metadata.durationMonths,
    slaResponseHours: metadata.slaResponseHours,
    ppmSchedule: metadata.ppmSchedule,
    nextPpmDueDate: metadata.nextPpmDueDate,
    complianceStandard: metadata.complianceStandard,
    notes: metadata.cleanedNotes,
  }
}

function buildWarrantyPayload(formData: WarrantyFormData) {
  const metadataLines = [
    `Duration Months: ${formData.durationMonths || '12'}`,
    `SLA Response Hours: ${formData.slaResponseHours || '48'}`,
    `PPM Schedule: ${formData.ppmSchedule || 'NONE'}`,
    formData.nextPpmDueDate ? `Next PPM Due Date: ${formData.nextPpmDueDate}` : null,
    `Compliance Standard: ${formData.complianceStandard || 'NONE'}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    accountId: formData.accountId,
    equipmentId: formData.equipmentId || null,
    soId: formData.soId || null,
    type: formData.type,
    status: formData.status,
    startDate: formData.startDate,
    endDate: formData.endDate,
    notes: [formData.notes.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
  }
}

export default function WarrantyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [warranty, setWarranty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<WarrantyFormData | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await warrantyApi.getById(id)
        const envelope = response.data
        if (envelope?.success && envelope.data) {
          setWarranty(envelope.data)
          setFormData(toWarrantyFormData(envelope.data))
        }
      } catch (err) {
        console.error('Error loading warranty:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!id || !formData?.accountId || !formData.startDate || !formData.endDate) {
      alert('Account, start date, and end date are required')
      return
    }

    try {
      const response = await warrantyApi.update(id, buildWarrantyPayload(formData))
      const envelope = response.data
      if (envelope?.success && envelope.data) {
        setWarranty(envelope.data)
        setFormData(toWarrantyFormData(envelope.data))
      }
      setEditMode(false)
      alert('Warranty updated successfully')
    } catch {
      alert('Error saving warranty')
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
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(warranty ? toWarrantyFormData(warranty) : null)
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
              <select name="type" value={displayData?.type || 'STANDARD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {WARRANTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
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
            <div>
              <label className="block text-sm font-medium">Duration Months</label>
              <input type="number" name="durationMonths" value={displayData?.durationMonths || '12'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Support & Maintenance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Response SLA (Hours)</label>
              <input type="number" name="slaResponseHours" value={displayData?.slaResponseHours || '48'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">PPM Schedule</label>
              <select name="ppmSchedule" value={displayData?.ppmSchedule || 'ANNUAL'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {PPM_SCHEDULES.map((schedule) => (
                  <option key={schedule} value={schedule}>{schedule.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Next PPM Due</label>
              <input type="date" name="nextPpmDueDate" value={displayData?.nextPpmDueDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Compliance Standard</label>
              <select name="complianceStandard" value={displayData?.complianceStandard || 'NONE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {COMPLIANCE_STANDARDS.map((standard) => (
                  <option key={standard} value={standard}>{standard}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Status & References</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select name="status" value={displayData?.status || 'ACTIVE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
              {WARRANTY_STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Account ID</label>
            <input type="text" name="accountId" value={displayData?.accountId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium">Equipment ID</label>
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
