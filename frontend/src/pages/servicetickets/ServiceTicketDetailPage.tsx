import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serviceTicketApi } from '../../api/erpApi'
import { FeatureGate } from '../../components/rbac'

const SERVICE_TYPES = ['PREVENTIVE_MAINTENANCE', 'CORRECTIVE_MAINTENANCE', 'INSTALLATION', 'DEINSTALLATION', 'EMERGENCY_REPAIR', 'SOFTWARE_UPDATE', 'CONSULTATION', 'OTHER']
const SERVICE_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED']
const SERVICE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']

interface ServiceTicketFormData {
  accountId: string
  equipmentId: string
  type: string
  status: string
  priority: string
  reportedDate: string
  resolvedDate: string
  assignedTo: string
  subcontractorId: string
  description: string
  resolutionNotes: string
  cost: string
  scheduledDate: string
  currency: string
  warrantyRef: string
  isUnderWarranty: boolean
  isBillable: boolean
  partsUsed: string[]
}

function parseResolutionMetadata(rawResolutionNotes: string | null | undefined) {
  const source = rawResolutionNotes || ''
  const scheduledDate = source.match(/Scheduled Date:\s*([^\n]+)/)?.[1]?.trim() || ''
  const currency = source.match(/Currency:\s*([^\n]+)/)?.[1]?.trim() || 'USD'
  const warrantyRef = source.match(/Warranty Ref:\s*([^\n]+)/)?.[1]?.trim() || ''
  const isUnderWarranty = (source.match(/Is Under Warranty:\s*([^\n]+)/)?.[1] || '').trim().toUpperCase() === 'YES'
  const isBillable = (source.match(/Is Billable:\s*([^\n]+)/)?.[1] || '').trim().toUpperCase() === 'YES'
  const partsUsedCsv = source.match(/Parts Used:\s*([^\n]+)/)?.[1]?.trim() || ''
  const partsUsed = partsUsedCsv ? partsUsedCsv.split(',').map((item) => item.trim()).filter(Boolean) : []

  const cleanedResolutionNotes = source
    .replace(/Scheduled Date:\s*[^\n]+\n?/g, '')
    .replace(/Currency:\s*[^\n]+\n?/g, '')
    .replace(/Warranty Ref:\s*[^\n]+\n?/g, '')
    .replace(/Is Under Warranty:\s*[^\n]+\n?/g, '')
    .replace(/Is Billable:\s*[^\n]+\n?/g, '')
    .replace(/Parts Used:\s*[^\n]+\n?/g, '')
    .trim()

  return {
    scheduledDate,
    currency,
    warrantyRef,
    isUnderWarranty,
    isBillable,
    partsUsed,
    cleanedResolutionNotes,
  }
}

function toServiceTicketFormData(ticket: any): ServiceTicketFormData {
  const metadata = parseResolutionMetadata(ticket?.resolutionNotes)

  return {
    accountId: ticket?.accountId || '',
    equipmentId: ticket?.equipmentId || '',
    type: ticket?.type || 'CORRECTIVE_MAINTENANCE',
    status: ticket?.status || 'OPEN',
    priority: ticket?.priority || 'MEDIUM',
    reportedDate: ticket?.reportedDate || '',
    resolvedDate: ticket?.resolvedDate || '',
    assignedTo: ticket?.assignedTo || '',
    subcontractorId: ticket?.subcontractorId || '',
    description: ticket?.description || '',
    resolutionNotes: metadata.cleanedResolutionNotes,
    cost: ticket?.cost?.toString() || '',
    scheduledDate: metadata.scheduledDate,
    currency: metadata.currency,
    warrantyRef: metadata.warrantyRef,
    isUnderWarranty: metadata.isUnderWarranty,
    isBillable: metadata.isBillable,
    partsUsed: metadata.partsUsed,
  }
}

function buildServiceTicketPayload(formData: ServiceTicketFormData) {
  const metadataLines = [
    formData.scheduledDate ? `Scheduled Date: ${formData.scheduledDate}` : null,
    formData.currency ? `Currency: ${formData.currency}` : null,
    formData.warrantyRef ? `Warranty Ref: ${formData.warrantyRef}` : null,
    `Is Under Warranty: ${formData.isUnderWarranty ? 'YES' : 'NO'}`,
    `Is Billable: ${formData.isBillable ? 'YES' : 'NO'}`,
    formData.partsUsed.length ? `Parts Used: ${formData.partsUsed.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    accountId: formData.accountId,
    equipmentId: formData.equipmentId || null,
    type: formData.type,
    status: formData.status,
    priority: formData.priority,
    reportedDate: formData.reportedDate || null,
    resolvedDate: formData.resolvedDate || null,
    assignedTo: formData.assignedTo || null,
    subcontractorId: formData.subcontractorId || null,
    description: formData.description || null,
    resolutionNotes: [formData.resolutionNotes.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
    cost: formData.cost ? parseFloat(formData.cost) : null,
  }
}

export default function ServiceTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<ServiceTicketFormData | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await serviceTicketApi.getById(id)
        const envelope = response.data
        if (envelope?.success && envelope.data) {
          setTicket(envelope.data)
          setFormData(toServiceTicketFormData(envelope.data))
        }
      } catch (err) {
        console.error('Error loading service ticket:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: checked } : null))
  }

  const handleSave = async () => {
    if (!id || !formData?.accountId || !formData.type || !formData.status || !formData.priority) {
      alert('Account, type, status, and priority are required')
      return
    }

    try {
      const response = await serviceTicketApi.update(id, buildServiceTicketPayload(formData))
      const envelope = response.data
      if (envelope?.success && envelope.data) {
        setTicket(envelope.data)
        setFormData(toServiceTicketFormData(envelope.data))
      }
      setEditMode(false)
      alert('Saved successfully')
    } catch {
      alert('Error saving service ticket')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : ticket

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Ticket</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </FeatureGate>
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(ticket ? toServiceTicketFormData(ticket) : null)
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
              <button onClick={() => navigate('/erp/service-tickets')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Account ID</label>
              <input type="text" name="accountId" value={displayData?.accountId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Service Type</label>
              <select name="type" value={displayData?.type || 'CORRECTIVE_MAINTENANCE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select name="priority" value={displayData?.priority || 'MEDIUM'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {SERVICE_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select name="status" value={displayData?.status || 'OPEN'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {SERVICE_STATUSES.map((status) => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Equipment & Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Equipment ID</label>
              <input type="text" name="equipmentId" value={displayData?.equipmentId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Assigned To</label>
              <input type="text" name="assignedTo" value={displayData?.assignedTo || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Subcontractor ID</label>
              <input type="text" name="subcontractorId" value={displayData?.subcontractorId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isBillable" checked={Boolean(displayData?.isBillable)} onChange={handleCheckboxChange} disabled={!editMode} className="mt-1" />
              <label className="block text-sm font-medium">Billable</label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Dates & Cost</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Reported Date</label>
              <input type="date" name="reportedDate" value={displayData?.reportedDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Scheduled Date</label>
              <input type="date" name="scheduledDate" value={displayData?.scheduledDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Resolved Date</label>
              <input type="date" name="resolvedDate" value={displayData?.resolvedDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Cost</label>
              <input type="number" name="cost" value={displayData?.cost || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <select name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <textarea name="description" value={displayData?.description || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />

          <h2 className="text-xl font-semibold mt-6 mb-4">Resolution Notes</h2>
          <textarea name="resolutionNotes" value={displayData?.resolutionNotes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium">Warranty Reference</label>
              <input type="text" name="warrantyRef" value={displayData?.warrantyRef || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" name="isUnderWarranty" checked={Boolean(displayData?.isUnderWarranty)} onChange={handleCheckboxChange} disabled={!editMode} className="mt-1" />
              <label className="block text-sm font-medium">Under Warranty</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
