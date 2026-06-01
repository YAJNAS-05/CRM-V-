import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesOrderApi, equipmentApi } from '../../api/erpApi'
import { accountApi, dealApi } from '../../api/crmApi'
import { Account, Deal } from '../../types/crm'
import { Equipment } from '../../types/erp'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../components/form/SearchableLookupSelect'

const SO_STATUSES = ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']
const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP', 'CFR', 'FCA']
const SELLABLE_EQUIPMENT_STATUSES = new Set(['IN_STOCK', 'IN_WAREHOUSE', 'AVAILABLE', 'RESERVED'])

interface FormData {
  soNumber: string
  accountId: string
  dealId: string
  equipmentId: string
  status: string
  orderDate: string
  expectedDelivery: string
  currency: string
  totalAmount: string
  depositPercent: string
  depositAmount: string
  incoterms: string
  destinationCountry: string
  notes: string
}

const defaultForm: FormData = {
  soNumber: '',
  accountId: '',
  dealId: '',
  equipmentId: '',
  status: 'DRAFT',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDelivery: '',
  currency: 'USD',
  totalAmount: '',
  depositPercent: '30',
  depositAmount: '',
  incoterms: '',
  destinationCountry: '',
  notes: '',
}

export default function SalesOrderForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id, isEdit])

  useEffect(() => {
    const total = parseFloat(form.totalAmount)
    const percent = parseFloat(form.depositPercent)

    if (!Number.isNaN(total) && !Number.isNaN(percent)) {
      setForm((prev) => ({ ...prev, depositAmount: ((total * percent) / 100).toFixed(2) }))
      return
    }

    setForm((prev) => ({ ...prev, depositAmount: '' }))
  }, [form.totalAmount, form.depositPercent])

  const loadLookups = async () => {
    try {
      setLookupLoading(true)

      const [accountsResult, dealsResult, equipmentResult] = await Promise.allSettled([
        accountApi.getAll(0, 500),
        dealApi.getAll(0, 500),
        equipmentApi.getAll(0, 500),
      ])

      if (accountsResult.status === 'fulfilled') {
        setAccounts(accountsResult.value.data?.data?.content || [])
      }
      if (dealsResult.status === 'fulfilled') {
        setDeals(dealsResult.value.data?.data?.content || [])
      }
      if (equipmentResult.status === 'fulfilled') {
        setEquipment(equipmentResult.value.data?.content || [])
      }
    } catch {
      // non-fatal
    } finally {
      setLookupLoading(false)
    }
  }

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await salesOrderApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        const firstItem = e.items?.[0]
        setForm({
          soNumber: e.soNumber || '',
          accountId: e.accountId || '',
          dealId: e.dealId || '',
          equipmentId: firstItem?.equipmentId || '',
          status: e.status || 'DRAFT',
          orderDate: e.orderDate || '',
          expectedDelivery: e.expectedDelivery || '',
          currency: e.currency || 'USD',
          totalAmount: e.totalAmount?.toString() || firstItem?.lineTotal?.toString() || '',
          depositPercent: '30',
          depositAmount: '',
          incoterms: e.incoterms || '',
          destinationCountry: e.destinationCountry || '',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load sales order') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLookupChange = (name: string, value: string) => {
    if (name === 'accountId') {
      const selectedAccount = accounts.find((account) => account.id === value)
      const shouldClearDeal = Boolean(form.dealId) && !deals.some((deal) => deal.id === form.dealId && deal.accountId === value)
      setForm((prev) => ({
        ...prev,
        accountId: value,
        dealId: shouldClearDeal ? '' : prev.dealId,
        destinationCountry: selectedAccount?.billingCountry || prev.destinationCountry,
      }))
      return
    }

    if (name === 'dealId') {
      const selectedDeal = deals.find((deal) => deal.id === value)
      const selectedAccount = accounts.find((account) => account.id === selectedDeal?.accountId)
      setForm((prev) => ({
        ...prev,
        dealId: value,
        accountId: selectedDeal?.accountId || prev.accountId,
        destinationCountry: selectedAccount?.billingCountry || prev.destinationCountry,
      }))
      return
    }

    if (name === 'equipmentId') {
      const selectedEquipment = equipment.find((item) => item.id === value)
      setForm((prev) => ({
        ...prev,
        equipmentId: value,
        totalAmount: selectedEquipment?.askingPrice?.toString() || prev.totalAmount,
        currency: selectedEquipment?.askingCurrency || prev.currency,
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

  const dealOptions = useMemo(
    () =>
      deals
        .filter((deal) => !form.accountId || deal.accountId === form.accountId || deal.id === form.dealId)
        .map((deal) => {
        const linkedAccount = accounts.find((account) => account.id === deal.accountId)
        return {
          value: deal.id,
          label: deal.name,
          meta: linkedAccount ? `${linkedAccount.name} | ${deal.stage || 'Stage not set'}` : deal.stage || undefined,
        }
      }),
    [accounts, deals, form.accountId, form.dealId]
  )

  const equipmentOptions = useMemo(
    () =>
      equipment
        .filter(
          (item) =>
            SELLABLE_EQUIPMENT_STATUSES.has(item.status) || item.id === form.equipmentId
        )
        .map((item) => ({
          value: item.id,
          label: `${item.internalCode} | ${item.make || ''} ${item.model || ''}`.trim(),
          meta: [item.status, item.askingPrice ? `${item.askingCurrency || 'USD'} ${item.askingPrice}` : 'No asking price']
            .filter(Boolean)
            .join(' | '),
        })),
    [equipment, form.equipmentId]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const missing: string[] = []
    if (!form.accountId) missing.push('Account (create one in CRM → Accounts first)')
    if (!form.equipmentId) missing.push('Equipment')
    if (!form.status) missing.push('Status')
    if (missing.length > 0) {
      toast.error(`Required: ${missing.join(', ')}`)
      return
    }

    if (form.orderDate && form.expectedDelivery && form.expectedDelivery < form.orderDate) {
      toast.error('Expected delivery cannot be before order date')
      return
    }

    const depositPercent = parseFloat(form.depositPercent)
    if (!Number.isNaN(depositPercent) && (depositPercent < 0 || depositPercent > 100)) {
      toast.error('Deposit percentage must be between 0 and 100')
      return
    }

    try {
      setSaving(true)
      const parsedTotal = form.totalAmount ? parseFloat(form.totalAmount) : null
      const notesWithDeposit = [
        form.notes?.trim() || null,
        !Number.isNaN(depositPercent) ? `Deposit ${depositPercent}% (${form.depositAmount || '0.00'})` : null,
      ]
        .filter(Boolean)
        .join('\n')

      const payload = {
        ...(isEdit && form.soNumber ? { soNumber: form.soNumber } : {}),
        accountId: form.accountId,
        dealId: form.dealId || null,
        status: form.status,
        orderDate: form.orderDate || null,
        expectedDelivery: form.expectedDelivery || null,
        currency: form.currency,
        totalAmount: parsedTotal,
        incoterms: form.incoterms || null,
        destinationCountry: form.destinationCountry || null,
        notes: notesWithDeposit || null,
        items: [
          {
            equipmentId: form.equipmentId,
            quantity: 1,
            unitPrice: parsedTotal,
            lineTotal: parsedTotal,
          },
        ],
      }

      if (isEdit) {
        const response = await salesOrderApi.update(id!, payload)
        if (response.data.success) {
          toast.success('Sales order updated')
          navigate('/erp/sales-orders')
        } else {
          toast.error(response.data.message || 'Failed to update sales order')
        }
      } else {
        const response = await salesOrderApi.create(payload)
        if (response.data.success) {
          toast.success('Sales order created')
          navigate('/erp/sales-orders')
        } else {
          toast.error(response.data.message || 'Failed to create sales order')
        }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || error?.message || 'Failed to save sales order') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/sales-orders')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Sales Orders
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Sales Order' : 'Create Sales Order'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Order Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SO Number</label>
                <input
                  type="text"
                  name="soNumber"
                  value={form.soNumber}
                  onChange={handleChange}
                  readOnly={!isEdit}
                  placeholder={isEdit ? '' : 'Auto-generated on save'}
                  className={`w-full rounded-lg px-3 py-2 ${
                    isEdit
                      ? 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      : 'border border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                />
                {!isEdit && (
                  <p className="text-xs text-gray-500 mt-1">SO number is generated by backend after create.</p>
                )}
              </div>
              <SearchableLookupSelect
                label="Customer / Account"
                name="accountId"
                value={form.accountId}
                options={accountOptions}
                onChange={handleLookupChange}
                required
                disabled={lookupLoading}
                placeholder="Search account by company name"
                helperText={accounts.length === 0 ? '⚠ No accounts found — create one in CRM → Accounts first' : undefined}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SO_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <SearchableLookupSelect
                label="Deal / Opportunity"
                name="dealId"
                value={form.dealId}
                options={dealOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                placeholder="Search deal by name"
                helperText={form.accountId ? 'Showing deals for selected account' : 'Select account first to narrow deals'}
              />
              <SearchableLookupSelect
                label="Equipment"
                name="equipmentId"
                value={form.equipmentId}
                options={equipmentOptions}
                onChange={handleLookupChange}
                disabled={lookupLoading}
                required
                placeholder="Search available equipment by SKU, make, or model"
                helperText="On selection, total amount and currency auto-fill from asking price"
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Dates & Shipping</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input type="date" name="orderDate" value={form.orderDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                <input type="date" name="expectedDelivery" value={form.expectedDelivery} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incoterms</label>
                <select name="incoterms" value={form.incoterms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Incoterm</option>
                  {INCOTERMS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                <input type="text" name="destinationCountry" value={form.destinationCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input type="number" step="0.01" name="totalAmount" value={form.totalAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {CURRENCIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit %</label>
                <input type="number" min="0" max="100" step="0.01" name="depositPercent" value={form.depositPercent} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                <input type="text" value={form.depositAmount} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/sales-orders')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update SO' : 'Create SO'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
