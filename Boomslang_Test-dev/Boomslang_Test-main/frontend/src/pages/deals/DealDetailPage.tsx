import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { dealApi, accountApi, contactApi } from '../../api/crmApi'
import { salesOrderApi } from '../../api/erpApi'
import { Deal, Account, Contact } from '../../types/crm'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import CustomFieldsPanel from '../../components/config/CustomFieldsPanel'
import { useCustomFields } from '../../hooks/useCustomFields'
import { useLayoutConfig } from '../../hooks/useLayoutConfig'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionColor, getOptionLabel } from '../../utils/optionSet'

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: 'bg-gray-100 text-gray-800',
  QUALIFICATION: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-yellow-100 text-yellow-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
}
const FALLBACK_STAGES = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']
const FALLBACK_LEAD_SOURCES = ['WEB', 'REFERRAL', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'OTHER']

const dealSchema = z.object({
  accountId: z.string().optional(),
  primaryContactId: z.string().optional(),
  name: z.string().min(1, 'Deal name is required'),
  stage: z.string().min(1, 'Stage is required'),
  amount: z.coerce.number().optional(),
  probability: z.coerce.number().optional(),
  expectedCloseDate: z.string().optional(),
  leadSource: z.string().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
})
type DealFormData = z.infer<typeof dealSchema>

interface DealDetailPageProps { isNew?: boolean }

const DealDetailPage: React.FC<DealDetailPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [isFetching, setIsFetching] = useState(!isNew)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isEditing, setIsEditing] = useState(isNew)
  const [isCreatingSO, setIsCreatingSO] = useState(false)
  const [linkedSalesOrders, setLinkedSalesOrders] = useState<any[]>([])
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: { stage: FALLBACK_STAGES[0] },
  })
  const selectedAccountId = watch('accountId')
  const { options: stageOptions } = useOptionSet({
    module: 'CRM',
    entity: 'DEAL',
    field: 'stage',
    fallbackValues: FALLBACK_STAGES,
  })
  const { options: leadSourceOptions } = useOptionSet({
    module: 'CRM',
    entity: 'DEAL',
    field: 'leadSource',
    fallbackValues: FALLBACK_LEAD_SOURCES,
  })
  const { definitions: customFieldDefinitions, values: customFieldValues, setValue: setCustomFieldValue, save: saveCustomFields, isLoading: customFieldsLoading } = useCustomFields({
    module: 'CRM',
    entity: 'DEAL',
    entityId: id,
  })
  const { layout: dealLayout } = useLayoutConfig({
    module: 'CRM',
    entity: 'DEAL',
  })
  const stageValues = stageOptions.map((option) => option.value)

  useEffect(() => {
    fetchAccounts()
    if (!isNew && id) { fetchDeal() } else { setIsFetching(false) }
  }, [id, isNew])

  useEffect(() => { if (selectedAccountId) fetchContacts(selectedAccountId) }, [selectedAccountId])

  useEffect(() => {
    if (!isNew && id && deal) {
      fetchLinkedSalesOrders()
    }
  }, [id, isNew, deal])

  const fetchAccounts = async () => { try { const r = await accountApi.getAll(0, 100); setAccounts(r.data.data?.content || []) } catch {} }
  const fetchContacts = async (aid: string) => { try { const r = await contactApi.getByAccount(aid, 0, 100); setContacts(r.data.data?.content || []) } catch {} }
  
  const fetchLinkedSalesOrders = async () => {
    try {
      setLoadingSalesOrders(true)
      const resp = await salesOrderApi.getAll(0, 100)
      const allOrders = resp.data?.data?.content || []
      const linked = allOrders.filter((so: any) => so.dealId === id)
      setLinkedSalesOrders(linked)
    } catch (err) {
      console.error('Failed to load linked sales orders:', err)
    } finally {
      setLoadingSalesOrders(false)
    }
  }

  const fetchDeal = async () => {
    try {
      const r = await dealApi.getById(id!)
      const d = r.data.data
      if (!d) { toast.error('Deal not found'); navigate('/crm/deals'); return }
      setDeal(d)
      reset({ accountId: d.accountId, primaryContactId: d.primaryContactId, name: d.name, stage: d.stage, amount: d.amount, probability: d.probability, expectedCloseDate: d.expectedCloseDate, leadSource: d.leadSource, description: d.description, nextStep: d.nextStep })
      if (d.accountId) fetchContacts(d.accountId)
    } catch { toast.error('Failed to load deal'); navigate('/crm/deals') } finally { setIsFetching(false) }
  }

  const onSubmit = async (data: DealFormData) => {
    setIsSaving(true)
    try {
      const response = isNew ? await dealApi.create(data) : await dealApi.update(id!, data)
      const savedDeal = response.data.data
      const resolvedId = isNew ? savedDeal?.id : id
      if (resolvedId) {
        try {
          await saveCustomFields(resolvedId)
        } catch {
          toast.error('Deal saved, but custom fields failed to update')
        }
      }
      toast.success(isNew ? 'Deal created' : 'Deal updated')
      navigate('/crm/deals')
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') } finally { setIsSaving(false) }
  }
  const handleDelete = async () => {
    if (!confirm('Delete this deal?')) return
    try { await dealApi.delete(id!); toast.success('Deleted'); navigate('/crm/deals') } catch { toast.error('Failed') }
  }

  const handleConvertToSO = async () => {
    if (!deal) return
    if (!confirm('Create a Sales Order from this deal?')) return
    try {
      setIsCreatingSO(true)
      const soData = {
        dealId: deal.id,
        accountId: deal.accountId,
        orderDate: new Date().toISOString().split('T')[0],
        totalAmount: deal.amount ?? 0,
        notes: `Created from Deal: ${deal.name}`,
        status: 'DRAFT',
      }
      const resp = await salesOrderApi.create(soData)
      if (resp.data?.data?.id) {
        toast.success('Sales Order created')
        navigate(`/erp/sales-orders/${resp.data.data.id}`)
      } else {
        toast.success('Sales Order created')
        navigate('/erp/sales-orders')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create Sales Order')
    } finally {
      setIsCreatingSO(false)
    }
  }

  const fmt = (value?: number | string | null) => {
    if (value === null || value === undefined) return '—'
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric)) return '—'
    return `$${numeric.toLocaleString()}`
  }

  if (isFetching) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>

  // VIEW MODE
  if (!isEditing && deal) return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/deals" className="hover:text-indigo-600">Deals</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{deal.name}</span>
      </div>

      {/* Stage Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-1">
          {stageValues.map((s, i) => {
            const currentIdx = stageValues.indexOf(deal.stage)
            const isPast = i <= currentIdx
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className={`h-2 w-full rounded-full ${isPast ? (s === 'CLOSED_LOST' ? 'bg-red-400' : 'bg-indigo-500') : 'bg-gray-200'}`}></div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {stageValues.map(s => (
            <span key={s} className={`text-[10px] ${s === deal.stage ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
              {getOptionLabel(stageOptions, s)}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{deal.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {(() => {
                const stageColor = getOptionColor(stageOptions, deal.stage)
                const badgeClass = stageColor ? 'text-slate-900' : (STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800')
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                    style={stageColor ? { backgroundColor: stageColor } : undefined}
                  >
                    {getOptionLabel(stageOptions, deal.stage)}
                  </span>
                )
              })()}
              <span className="text-lg font-bold text-gray-900">{fmt(deal.amount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {deal.stage === 'CLOSED_WON' && (
              <FeatureGate requiredPermission="ERP_CREATE">
                <button
                  onClick={handleConvertToSO}
                  disabled={isCreatingSO}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreatingSO ? 'Creating…' : 'Convert to Sales Order'}
                </button>
              </FeatureGate>
            )}
            <FeatureGate requiredPermission="CRM_EDIT">
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
            </FeatureGate>
            <FeatureGate requiredPermission="CRM_DELETE">
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
            </FeatureGate>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Amount', value: fmt(deal.amount) },
          { label: 'Weighted Revenue', value: fmt(deal.expectedRevenueWeighted) },
          { label: 'Probability', value: `${deal.probability || 0}%` },
          { label: 'Close Date', value: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—' },
          { label: 'Days in Stage', value: deal.daysInStage ?? '—' },
          { label: 'Days in Pipeline', value: deal.daysInPipeline ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            ['Deal Name', deal.name],
            ['Stage', getOptionLabel(stageOptions, deal.stage)],
            ['Amount', fmt(deal.amount)],
            ['Weighted Revenue', fmt(deal.expectedRevenueWeighted)],
            ['Probability', `${deal.probability || 0}%`],
            ['Days in Stage', deal.daysInStage ?? null],
            ['Days in Pipeline', deal.daysInPipeline ?? null],
            ['Expected Close', deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : null],
            ['Lead Source', getOptionLabel(leadSourceOptions, deal.leadSource)],
            ['Next Step', deal.nextStep],
            ['Created', new Date(deal.createdAt).toLocaleDateString()],
          ].map(([l, v]) => (
            <div key={l as string}><dt className="text-xs text-gray-400 mb-0.5">{l}</dt><dd className="text-sm text-gray-900">{(v as string) || '—'}</dd></div>
          ))}
        </div>
        {deal.description && <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3><p className="text-sm text-gray-600">{deal.description}</p></>}
      </div>

      {/* Linked Sales Orders Section (X-03: Cross-module linking) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Linked Sales Orders</h2>
        {loadingSalesOrders ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : linkedSalesOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">SO Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {linkedSalesOrders.map((so: any) => (
                  <tr key={so.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{so.soNumber || so.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        so.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        so.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        so.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">${(so.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{so.orderDate ? new Date(so.orderDate).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => navigate(`/erp/sales-orders/${so.id}`)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No sales orders linked to this deal yet.</p>
            {deal.stage === 'CLOSED_WON' && (
              <p className="text-sm mt-2">Create one using the "Convert to Sales Order" button above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // FORM MODE
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/deals" className="hover:text-indigo-600">Deals</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{isNew ? 'New Deal' : 'Edit Deal'}</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{isNew ? 'New Deal' : 'Edit Deal'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Deal Name *</label>
              <input type="text" {...register('name')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stage *</label>
              <select {...register('stage')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {stageOptions.map((option) => (
                  <option key={option.id} value={option.value}>{option.label || option.value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
              <select {...register('accountId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
              <select {...register('primaryContactId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
              <input type="number" step="0.01" {...register('amount')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Probability (%)</label>
              <input type="number" min="0" max="100" {...register('probability')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expected Close Date</label>
              <input type="date" {...register('expectedCloseDate')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
              <select {...register('leadSource')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>
                {leadSourceOptions.map((option) => (
                  <option key={option.id} value={option.value}>{option.label || option.value}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Next Step</label>
              <input type="text" {...register('nextStep')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <CustomFieldsPanel
            title="Custom Deal Fields"
            definitions={customFieldDefinitions}
            values={customFieldValues}
            onChange={setCustomFieldValue}
            isLoading={customFieldsLoading}
            layout={dealLayout}
          />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/deals') : setIsEditing(false)} className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DealDetailPage
