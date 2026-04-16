import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { warrantyApi, equipmentApi, salesOrderApi } from '../../api/erpApi'
import { accountApi } from '../../api/crmApi'
import { Account } from '../../types/crm'
import { Equipment, SalesOrder } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const WARRANTY_TYPES = ['STANDARD', 'EXTENDED', 'LIMITED', 'COMPREHENSIVE', 'PARTS_ONLY', 'LABOR_ONLY', 'AMC']
const WARRANTY_STATUSES = ['ACTIVE', 'EXPIRED', 'VOIDED', 'PENDING', 'CLAIMED']
const PPM_SCHEDULES = ['ANNUAL', 'BI_ANNUAL', 'NONE']
const COMPLIANCE_STANDARDS = ['TGA', 'FDA', 'CE', 'IEC', 'NONE']

interface FormData {
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

const defaultForm: FormData = {
  accountId: '',
  equipmentId: '',
  soId: '',
  type: 'STANDARD',
  status: 'ACTIVE',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  durationMonths: '12',
  slaResponseHours: '48',
  ppmSchedule: 'ANNUAL',
  nextPpmDueDate: '',
  complianceStandard: 'NONE',
  notes: '',
}

function addMonths(dateString: string, months: number) {
  if (!dateString || Number.isNaN(months)) {
    return ''
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
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

export default function WarrantyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadItem()
    }
  }, [id, isEdit])

  useEffect(() => {
    const duration = parseInt(form.durationMonths)
    if (!form.startDate || Number.isNaN(duration) || duration <= 0) {
      return
    }

    const computedEndDate = addMonths(form.startDate, duration)
    setForm((prev) => ({ ...prev, endDate: computedEndDate }))
  }, [form.startDate, form.durationMonths])

  useEffect(() => {
    if (!form.startDate) {
      return
    }

    if (form.ppmSchedule === 'ANNUAL') {
      setForm((prev) => ({ ...prev, nextPpmDueDate: addMonths(prev.startDate, 12) }))
      return
    }

    if (form.ppmSchedule === 'BI_ANNUAL') {
      setForm((prev) => ({ ...prev, nextPpmDueDate: addMonths(prev.startDate, 6) }))
      return
    }

    setForm((prev) => ({ ...prev, nextPpmDueDate: '' }))
  }, [form.startDate, form.ppmSchedule])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [accountsResponse, equipmentResponse, salesOrdersResponse] = await Promise.all([
        accountApi.getAll(0, 200),
        equipmentApi.getAll(0, 200),
        salesOrderApi.getAll(0, 200),
      ])

      setAccounts(accountsResponse.data?.data?.content || [])
      setEquipment(equipmentResponse.data?.content || [])
      setSalesOrders(salesOrdersResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load warranty lookups')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await warrantyApi.getById(id!)
      const d = response.data

      if (d.success && d.data) {
        const e = d.data
        const metadata = parseWarrantyMetadata(e.notes)

        setForm({
          accountId: e.accountId || '',
          equipmentId: e.equipmentId || '',
          soId: e.soId || '',
          type: e.type || 'STANDARD',
          status: e.status || 'ACTIVE',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          durationMonths: metadata.durationMonths,
          slaResponseHours: metadata.slaResponseHours,
          ppmSchedule: metadata.ppmSchedule,
          nextPpmDueDate: metadata.nextPpmDueDate,
          complianceStandard: metadata.complianceStandard,
          notes: metadata.cleanedNotes,
        })
      }
    } catch {
      toast.error('Failed to load warranty')
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
      const linkedSalesOrder = salesOrders.find((salesOrder) =>
        salesOrder.items?.some((item) => item.equipmentId === value)
      )

      setForm((prev) => ({
        ...prev,
        equipmentId: value,
        soId: linkedSalesOrder?.id || prev.soId,
        accountId: linkedSalesOrder?.accountId || prev.accountId,
      }))
      return
    }

    if (name === 'soId') {
      const selectedSalesOrder = salesOrders.find((salesOrder) => salesOrder.id === value)
      setForm((prev) => ({
        ...prev,
        soId: value,
        accountId: selectedSalesOrder?.accountId || prev.accountId,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
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

  const salesOrderOptions = useMemo(() => {
    const filtered = form.accountId
      ? salesOrders.filter((salesOrder) => salesOrder.accountId === form.accountId)
      : salesOrders

    return filtered.map((salesOrder) => ({
      value: salesOrder.id,
      label: salesOrder.soNumber,
      meta: salesOrder.orderDate || salesOrder.status,
    }))
  }, [form.accountId, salesOrders])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.accountId || !form.type || !form.status || !form.startDate || !form.endDate) {
      toast.error('Account, Type, Status, Start Date, and End Date are required')
      return
    }

    if (form.endDate < form.startDate) {
      toast.error('End date must be on or after start date')
      return
    }

    const metadataLines = [
      `Duration Months: ${form.durationMonths || '12'}`,
      `SLA Response Hours: ${form.slaResponseHours || '48'}`,
      `PPM Schedule: ${form.ppmSchedule || 'NONE'}`,
      form.nextPpmDueDate ? `Next PPM Due Date: ${form.nextPpmDueDate}` : null,
      `Compliance Standard: ${form.complianceStandard || 'NONE'}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      setSaving(true)
      const payload = {
        accountId: form.accountId,
        equipmentId: form.equipmentId || null,
        soId: form.soId || null,
        type: form.type,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: [form.notes?.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
      }

      if (isEdit) {
        const response = await warrantyApi.update(id!, payload)
        if (response.data.success) {
          toast.success('Warranty updated')
          navigate('/erp/warranties')
        }
      } else {
        const response = await warrantyApi.create(payload)
        if (response.data.success) {
          toast.success('Warranty created')
          navigate('/erp/warranties')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save warranty')
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
        <button onClick={() => navigate('/erp/warranties')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Warranties
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Warranty' : 'Add New Warranty'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Warranty Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <SearchableLookupSelect
                label="Sales Order"
                name="soId"
                value={form.soId}
                options={salesOrderOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search sales order"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {WARRANTY_TYPES.map((item) => (
                    <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {WARRANTY_STATUSES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates & SLA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
                <input type="number" min="1" name="durationMonths" value={form.durationMonths} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SLA Response Hours</label>
                <input type="number" min="1" name="slaResponseHours" value={form.slaResponseHours} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PPM Schedule</label>
                <select name="ppmSchedule" value={form.ppmSchedule} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {PPM_SCHEDULES.map((item) => (
                    <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next PPM Due Date</label>
                <input type="date" name="nextPpmDueDate" value={form.nextPpmDueDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Standard</label>
                <select name="complianceStandard" value={form.complianceStandard} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {COMPLIANCE_STANDARDS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/warranties')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Warranty' : 'Create Warranty'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
