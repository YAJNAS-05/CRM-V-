import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { siteAssessmentApi, salesOrderApi } from '../../api/erpApi'
import { accountApi } from '../../api/crmApi'
import { Account } from '../../types/crm'
import { SalesOrder } from '../../types/erp'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const READINESS_VALUES = ['PENDING', 'READY', 'REMEDIATION_REQUIRED', 'FAILED']
const ASSESSMENT_METHODS = ['ON_SITE_VISIT', 'VIDEO_CALL', 'DOCUMENT_REVIEW']
const SHIELDING_TYPES = ['LEAD', 'RF_CAGE', 'LEAD_AND_RF', 'NONE', 'PENDING']

interface FormData {
  assessmentNumber: string
  salesOrderId: string
  accountId: string
  assessmentMethod: string
  roomDimensions: string
  powerCompliant: string
  shieldingType: string
  coolingCapacity: string
  networkReadiness: string
  overallReadiness: string
  remediationRequired: string
  assessedDate: string
  roomSignOffDate: string
  notes: string
}

const defaultForm: FormData = {
  assessmentNumber: '',
  salesOrderId: '',
  accountId: '',
  assessmentMethod: 'ON_SITE_VISIT',
  roomDimensions: '',
  powerCompliant: 'YES',
  shieldingType: 'PENDING',
  coolingCapacity: '',
  networkReadiness: '',
  overallReadiness: 'PENDING',
  remediationRequired: '',
  assessedDate: '',
  roomSignOffDate: '',
  notes: '',
}

export default function SiteAssessmentForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadItem(id)
    }
  }, [id, isEdit])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [accountResponse, salesOrderResponse] = await Promise.all([
        accountApi.getAll(0, 300),
        salesOrderApi.getAll(0, 300),
      ])

      setAccounts(accountResponse.data?.data?.content || [])
      setSalesOrders(salesOrderResponse.data?.data?.content || [])
    } catch {
      toast.error('Failed to load lookup data')
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await siteAssessmentApi.getById(itemId)
      if (response.data.success && response.data.data) {
        const data = response.data.data
        setForm({
          assessmentNumber: data.assessmentNumber || '',
          salesOrderId: data.salesOrderId || '',
          accountId: data.accountId || '',
          assessmentMethod: data.assessmentMethod || 'ON_SITE_VISIT',
          roomDimensions: data.roomDimensions || '',
          powerCompliant: data.powerCompliant == null ? 'YES' : data.powerCompliant ? 'YES' : 'NO',
          shieldingType: data.shieldingType || 'PENDING',
          coolingCapacity: data.coolingCapacity || '',
          networkReadiness: data.networkReadiness || '',
          overallReadiness: data.overallReadiness || 'PENDING',
          remediationRequired: data.remediationRequired || '',
          assessedDate: data.assessedDate || '',
          roomSignOffDate: data.roomSignOffDate || '',
          notes: data.notes || '',
        })
      }
    } catch {
      toast.error('Failed to load site assessment')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name === 'salesOrderId') {
      const selectedSalesOrder = salesOrders.find((item) => item.id === value)
      setForm((prev) => ({
        ...prev,
        salesOrderId: value,
        accountId: selectedSalesOrder?.accountId || prev.accountId,
      }))
      return
    }

    if (name === 'accountId') {
      const shouldClearSalesOrder = Boolean(form.salesOrderId) && !salesOrders.some(
        (item) => item.id === form.salesOrderId && item.accountId === value
      )
      setForm((prev) => ({
        ...prev,
        accountId: value,
        salesOrderId: shouldClearSalesOrder ? '' : prev.salesOrderId,
      }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const filteredSalesOrders = useMemo(
    () => salesOrders.filter((order) => !form.accountId || order.accountId === form.accountId || order.id === form.salesOrderId),
    [salesOrders, form.accountId, form.salesOrderId]
  )

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: account.name,
        meta: account.billingCountry || account.billingCity || undefined,
      })),
    [accounts]
  )

  const salesOrderOptions = useMemo(
    () =>
      filteredSalesOrders.map((order) => ({
        value: order.id,
        label: order.soNumber,
        meta: order.status,
      })),
    [filteredSalesOrders]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.accountId.trim() && !form.salesOrderId.trim()) {
      toast.error('Select a Sales Order or an Account')
      return
    }

    try {
      setSaving(true)
      const payload = {
        assessmentMethod: form.assessmentMethod,
        roomDimensions: form.roomDimensions,
        shieldingType: form.shieldingType,
        coolingCapacity: form.coolingCapacity,
        networkReadiness: form.networkReadiness,
        overallReadiness: form.overallReadiness,
        remediationRequired: form.remediationRequired,
        assessedDate: form.assessedDate || undefined,
        roomSignOffDate: form.roomSignOffDate || undefined,
        notes: form.notes,
        salesOrderId: form.salesOrderId || undefined,
        accountId: form.accountId || undefined,
        powerCompliant: form.powerCompliant === 'YES',
      }

      if (isEdit && id) {
        const response = await siteAssessmentApi.update(id, payload)
        if (response.data.success) {
          toast.success('Site assessment updated')
          navigate('/erp/site-assessments')
        }
      } else {
        const response = await siteAssessmentApi.create(payload)
        if (response.data.success) {
          toast.success('Site assessment created')
          navigate('/erp/site-assessments')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save site assessment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading site assessment...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/site-assessments')} className="text-blue-600 hover:text-blue-800">
          Back to Site Assessments
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Site Assessment' : 'Add Site Assessment'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {isEdit
              ? `Assessment Number: ${form.assessmentNumber || '-'}`
              : 'Assessment Number will be auto-generated when you save this record.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SearchableLookupSelect
              label="Sales Order"
              name="salesOrderId"
              value={form.salesOrderId}
              options={salesOrderOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              placeholder="Search sales order"
              helperText={form.accountId ? 'Showing sales orders for selected account' : undefined}
            />

            <SearchableLookupSelect
              label="Account"
              name="accountId"
              value={form.accountId}
              options={accountOptions}
              onChange={handleLookupChange}
              disabled={lookupLoading}
              required={!form.salesOrderId}
              placeholder="Search account"
              helperText={form.salesOrderId ? 'Auto-filled from selected sales order' : undefined}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Assessment Method</label>
              <select name="assessmentMethod" value={form.assessmentMethod} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {ASSESSMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Dimensions</label>
              <input name="roomDimensions" value={form.roomDimensions} onChange={handleChange} placeholder="e.g. 7x8x4m" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Power Compliant</label>
              <select name="powerCompliant" value={form.powerCompliant} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shielding Type</label>
              <select name="shieldingType" value={form.shieldingType} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {SHIELDING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cooling Capacity</label>
              <input name="coolingCapacity" value={form.coolingCapacity} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Network Readiness</label>
              <input name="networkReadiness" value={form.networkReadiness} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overall Readiness</label>
              <select name="overallReadiness" value={form.overallReadiness} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {READINESS_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assessed Date</label>
              <input type="date" name="assessedDate" value={form.assessedDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Sign Off Date</label>
              <input type="date" name="roomSignOffDate" value={form.roomSignOffDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remediation Required</label>
            <textarea name="remediationRequired" value={form.remediationRequired} onChange={handleChange} rows={2} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/site-assessments')} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update Site Assessment' : 'Create Site Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
