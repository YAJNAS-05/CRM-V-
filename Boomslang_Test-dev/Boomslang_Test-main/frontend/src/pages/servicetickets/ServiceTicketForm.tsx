import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serviceTicketApi, equipmentApi, subcontractorApi, sparePartApi, warrantyApi } from '../../api/erpApi'
import { accountApi } from '../../api/crmApi'
import { adminApi } from '../../api/adminApi'
import { Account } from '../../types/crm'
import { Equipment, SparePart, Subcontractor, Warranty } from '../../types/erp'
import { User } from '../../types'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const SERVICE_TYPES = [
  'PREVENTIVE_MAINTENANCE',
  'CORRECTIVE_MAINTENANCE',
  'INSTALLATION',
  'DEINSTALLATION',
  'EMERGENCY_REPAIR',
  'SOFTWARE_UPDATE',
  'CONSULTATION',
  'OTHER',
]
const SERVICE_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED']
const SERVICE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']

interface FormData {
  ticketNumber: string
  accountId: string
  equipmentId: string
  type: string
  status: string
  priority: string
  reportedDate: string
  scheduledDate: string
  resolvedDate: string
  description: string
  cost: string
  currency: string
  warrantyRef: string
  isUnderWarranty: boolean
  isBillable: boolean
  assignedTo: string
  subcontractorId: string
  partsUsed: string[]
  resolutionNotes: string
}

const defaultForm: FormData = {
  ticketNumber: '',
  accountId: '',
  equipmentId: '',
  type: 'CORRECTIVE_MAINTENANCE',
  status: 'OPEN',
  priority: 'MEDIUM',
  reportedDate: new Date().toISOString().split('T')[0],
  scheduledDate: '',
  resolvedDate: '',
  description: '',
  cost: '',
  currency: 'USD',
  warrantyRef: '',
  isUnderWarranty: false,
  isBillable: true,
  assignedTo: '',
  subcontractorId: '',
  partsUsed: [],
  resolutionNotes: '',
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

export default function ServiceTicketForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [spareParts, setSpareParts] = useState<SparePart[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadItem()
    }
  }, [id, isEdit])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)

      const [accountsResponse, equipmentResponse, subcontractorResponse, usersResponse, sparePartsResponse] = await Promise.all([
        accountApi.getAll(0, 200),
        equipmentApi.getAll(0, 200),
        subcontractorApi.getAll(0, 200),
        adminApi.getUsers(0, 200),
        sparePartApi.getAll(0, 200),
      ])

      setAccounts(accountsResponse.data?.data?.content || [])
      setEquipment(equipmentResponse.data?.content || [])
      setSubcontractors(subcontractorResponse.data?.data?.content || [])
      setUsers(usersResponse.data?.data?.content || [])
      setSpareParts(sparePartsResponse.data?.data?.content || [])
    } catch {
      toast.error('Some lookup data could not be loaded')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadWarrantyContext = async (equipmentId: string) => {
    if (!equipmentId) {
      setForm((prev) => ({
        ...prev,
        warrantyRef: '',
        isUnderWarranty: false,
        isBillable: true,
      }))
      return
    }

    try {
      const response = await warrantyApi.getByEquipment(equipmentId)
      const warranties: Warranty[] = response.data?.data || []
      const today = new Date()

      const activeWarranty = warranties.find((warranty) => {
        if (warranty.status !== 'ACTIVE') {
          return false
        }

        if (!warranty.endDate) {
          return true
        }

        return new Date(warranty.endDate) >= today
      })

      setForm((prev) => ({
        ...prev,
        warrantyRef: activeWarranty
          ? `${activeWarranty.id} | expires ${activeWarranty.endDate}`
          : 'No active warranty',
        isUnderWarranty: Boolean(activeWarranty),
        isBillable: !activeWarranty,
      }))
    } catch {
      setForm((prev) => ({
        ...prev,
        warrantyRef: 'Warranty lookup failed',
        isUnderWarranty: false,
        isBillable: true,
      }))
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await serviceTicketApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        const metadata = parseResolutionMetadata(e.resolutionNotes)

        setForm({
          ticketNumber: e.ticketNumber || '',
          accountId: e.accountId || '',
          equipmentId: e.equipmentId || '',
          type: e.type || 'CORRECTIVE_MAINTENANCE',
          status: e.status || 'OPEN',
          priority: e.priority || 'MEDIUM',
          reportedDate: e.reportedDate || '',
          scheduledDate: metadata.scheduledDate,
          resolvedDate: e.resolvedDate || '',
          description: e.description || '',
          cost: e.cost?.toString() || '',
          currency: metadata.currency,
          warrantyRef: metadata.warrantyRef,
          isUnderWarranty: metadata.isUnderWarranty,
          isBillable: metadata.isBillable,
          assignedTo: e.assignedTo || '',
          subcontractorId: e.subcontractorId || '',
          partsUsed: metadata.partsUsed,
          resolutionNotes: metadata.cleanedResolutionNotes,
        })

        if (e.equipmentId && !metadata.warrantyRef) {
          loadWarrantyContext(e.equipmentId)
        }
      }
    } catch {
      toast.error('Failed to load service ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name === 'equipmentId') {
      setForm((prev) => ({ ...prev, equipmentId: value }))
      loadWarrantyContext(value)
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePartsUsedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions).map((option) => option.value)
    setForm((prev) => ({ ...prev, partsUsed: selectedIds }))
  }

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: account.name,
        meta: account.billingCountry || account.billingCity || undefined,
      })),
    [accounts]
  )

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter((item) => item.status === 'INSTALLED' || item.id === form.equipmentId)
        .map((item) => ({
          value: item.id,
          label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
          meta: item.status,
        })),
    [equipment, form.equipmentId]
  )

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: user.fullName,
        meta: user.roles && user.roles.length > 0 ? user.roles.join(', ') : user.role,
      })),
    [users]
  )

  const subcontractorOptions = useMemo(
    () =>
      subcontractors.map((subcontractor) => ({
        value: subcontractor.id,
        label: subcontractor.companyName,
        meta: [subcontractor.country, subcontractor.currency].filter(Boolean).join(' | ') || undefined,
      })),
    [subcontractors]
  )

  const partsUsedLabels = useMemo(() => {
    const partsMap = new Map(spareParts.map((part) => [part.id, `${part.partNumber} | ${part.name}`]))
    return form.partsUsed.map((partId) => partsMap.get(partId)).filter(Boolean).join(', ')
  }, [form.partsUsed, spareParts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ticketNumber || !form.accountId || !form.type || !form.status || !form.priority) {
      toast.error('Ticket Number, Account, Type, Status, and Priority are required')
      return
    }

    if (form.reportedDate && form.scheduledDate && form.scheduledDate < form.reportedDate) {
      toast.error('Scheduled date cannot be before reported date')
      return
    }

    if (form.scheduledDate && form.resolvedDate && form.resolvedDate < form.scheduledDate) {
      toast.error('Resolved date cannot be before scheduled date')
      return
    }

    try {
      setSaving(true)

      const metadataLines = [
        form.scheduledDate ? `Scheduled Date: ${form.scheduledDate}` : null,
        form.currency ? `Currency: ${form.currency}` : null,
        form.warrantyRef ? `Warranty Ref: ${form.warrantyRef}` : null,
        `Is Under Warranty: ${form.isUnderWarranty ? 'YES' : 'NO'}`,
        `Is Billable: ${form.isBillable ? 'YES' : 'NO'}`,
        form.partsUsed.length ? `Parts Used: ${form.partsUsed.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      const payload = {
        ticketNumber: form.ticketNumber,
        accountId: form.accountId,
        equipmentId: form.equipmentId || null,
        type: form.type,
        status: form.status,
        priority: form.priority,
        reportedDate: form.reportedDate || null,
        resolvedDate: form.resolvedDate || null,
        assignedTo: form.assignedTo || null,
        subcontractorId: form.subcontractorId || null,
        description: form.description || null,
        resolutionNotes: [form.resolutionNotes?.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
        cost: form.cost ? parseFloat(form.cost) : null,
      }

      if (isEdit) {
        const response = await serviceTicketApi.update(id!, payload)
        if (response.data.success) {
          toast.success('Service ticket updated')
          navigate('/erp/service-tickets')
        }
      } else {
        const response = await serviceTicketApi.create(payload)
        if (response.data.success) {
          toast.success('Service ticket created')
          navigate('/erp/service-tickets')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save service ticket')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/service-tickets')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Service Tickets
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Service Ticket' : 'Create Service Ticket'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Ticket Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Number *</label>
                <input
                  type="text"
                  name="ticketNumber"
                  value={form.ticketNumber}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <SearchableLookupSelect
                label="Customer / Account"
                name="accountId"
                value={form.accountId}
                options={accountOptions}
                onChange={handleLookupChange}
                required
                disabled={lookupLoading}
                placeholder="Search account"
              />

              <SearchableLookupSelect
                label="Equipment"
                name="equipmentId"
                value={form.equipmentId}
                options={equipmentOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search installed equipment"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
              <input
                type="text"
                value={form.warrantyRef}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Under Warranty</label>
              <input
                type="text"
                value={form.isUnderWarranty ? 'YES' : 'NO'}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Billable</label>
              <input
                type="text"
                value={form.isBillable ? 'YES' : 'NO'}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_TYPES.map((item) => (
                    <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_STATUSES.map((item) => (
                    <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select name="priority" value={form.priority} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_PRIORITIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Assignment & Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                <input type="date" name="reportedDate" value={form.reportedDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Date</label>
                <input type="date" name="resolvedDate" value={form.resolvedDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {CURRENCIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <SearchableLookupSelect
                label="Assigned To"
                name="assignedTo"
                value={form.assignedTo}
                options={userOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search users"
              />

              <SearchableLookupSelect
                label="Subcontractor"
                name="subcontractorId"
                value={form.subcontractorId}
                options={subcontractorOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search subcontractor"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used (multi-select)</label>
                <select
                  multiple
                  value={form.partsUsed}
                  onChange={handlePartsUsedChange}
                  className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {spareParts.map((part) => (
                    <option key={part.id} value={part.id}>{`${part.partNumber} | ${part.name}`}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selected: {partsUsedLabels || 'None'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
            <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/service-tickets')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Ticket' : 'Create Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
