import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { dealApi, accountApi, contactApi, activityApi, quoteApi } from '../../api/crmApi'
import { salesOrderApi } from '../../api/erpApi'
import { Deal, Account, Contact, Activity, Quote } from '../../types/crm'
import { SalesOrder } from '../../types/erp'
import { FeatureGate } from '../../components/rbac'
import CrmDetailHero from '../../components/crm/CrmDetailHero'
import { toast } from 'sonner'

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: 'bg-gray-100 text-gray-800',
  QUALIFICATION: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-yellow-100 text-yellow-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
}
const STAGES = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']

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
  const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'quotes' | 'orders'>('details')
  const [activities, setActivities] = useState<Activity[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [linkedOrders, setLinkedOrders] = useState<SalesOrder[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [convertingSO, setConvertingSO] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: { stage: 'PROSPECTING' },
  })
  const selectedAccountId = watch('accountId')

  useEffect(() => {
    fetchAccounts()
    if (!isNew && id) {
      fetchDeal()
    } else {
      setIsFetching(false)
    }
  }, [id, isNew])

  useEffect(() => {
    if (selectedAccountId) {
      fetchContacts(selectedAccountId)
    }
  }, [selectedAccountId])

  useEffect(() => {
    if (!isEditing && id && deal) {
      void fetchRelated()
    }
  }, [isEditing, id, deal])

  const fetchAccounts = async () => {
    try {
      const response = await accountApi.getAll(0, 100)
      setAccounts(response.data.data?.content || [])
    } catch {
      setAccounts([])
    }
  }

  const fetchContacts = async (accountId: string) => {
    try {
      const response = await contactApi.getByAccount(accountId, 0, 100)
      setContacts(response.data.data?.content || [])
    } catch {
      setContacts([])
    }
  }

  const fetchRelated = async () => {
    if (!id) return
    setRelatedLoading(true)
    const [actRes, quoteRes, soRes] = await Promise.allSettled([
      activityApi.getByDeal(id),
      quoteApi.getByDeal(id, 0, 50),
      salesOrderApi.getAll(0, 200),
    ])
    if (actRes.status === 'fulfilled') {
      const data = actRes.value.data?.data
      setActivities(Array.isArray(data) ? data : [])
    }
    if (quoteRes.status === 'fulfilled') {
      const data = quoteRes.value.data?.data
      const items = data?.content ?? (Array.isArray(data) ? data : [])
      setQuotes(items)
    }
    if (soRes.status === 'fulfilled') {
      const rows = soRes.value?.data?.data?.content ?? soRes.value?.data?.content ?? []
      const dealOrders = (Array.isArray(rows) ? rows : []).filter((o: SalesOrder) => o.dealId === id)
      setLinkedOrders(dealOrders)
    }
    setRelatedLoading(false)
  }

  const handleCreateSO = async () => {
    if (!deal) return
    setConvertingSO(true)
    try {
      const resp = await salesOrderApi.create({
        dealId: deal.id,
        accountId: deal.accountId ?? '',
        status: 'DRAFT',
        currency: 'USD',
        notes: `Created from Deal: ${deal.name}`,
        items: [],
      })
      const newSO = resp?.data?.data ?? resp?.data
      toast.success('Sales order created from deal')
      if (newSO?.id) navigate(`/erp/sales-orders/${newSO.id}`)
      else void fetchRelated()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create sales order')
    } finally {
      setConvertingSO(false)
    }
  }

  const fetchDeal = async () => {
    try {
      const response = await dealApi.getById(id!)
      const current = response.data.data
      if (!current) {
        toast.error('Deal not found')
        navigate('/crm/deals')
        return
      }

      setDeal(current)
      reset({
        accountId: current.accountId,
        primaryContactId: current.primaryContactId,
        name: current.name,
        stage: current.stage,
        amount: current.amount,
        probability: current.probability,
        expectedCloseDate: current.expectedCloseDate,
        leadSource: current.leadSource,
        description: current.description,
        nextStep: current.nextStep,
      })

      if (current.accountId) {
        fetchContacts(current.accountId)
      }
    } catch {
      toast.error('Failed to load deal')
      navigate('/crm/deals')
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: DealFormData) => {
    setIsSaving(true)
    try {
      if (isNew) {
        await dealApi.create(data)
        toast.success('Deal created')
      } else {
        await dealApi.update(id!, data)
        toast.success('Deal updated')
      }
      navigate('/crm/deals')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this deal?')) return
    try {
      await dealApi.delete(id!)
      toast.success('Deleted')
      navigate('/crm/deals')
    } catch {
      toast.error('Failed')
    }
  }

  const fmt = (value?: number | string | null) => {
    if (value === null || value === undefined) return '—'
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric)) return '—'
    return `$${numeric.toLocaleString()}`
  }

  if (isFetching) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
  }

  if (!isEditing && deal) {
    const accountName = accounts.find((account) => account.id === deal.accountId)?.name || 'Unlinked'
    const contactName = contacts.find((contact) => contact.id === deal.primaryContactId)

    const TABS = [
      { key: 'details', label: 'Details' },
      { key: 'activities', label: `Activities (${activities.length})` },
      { key: 'quotes', label: `Quotes (${quotes.length})` },
      { key: 'orders', label: `Sales Orders (${linkedOrders.length})` },
    ] as const

    return (
      <div className="space-y-6">
        {/* Stage progress bar */}
        <div className="crm-detail-panel p-4">
          <div className="flex items-center gap-1">
            {STAGES.map((stage, index) => {
              const currentIndex = STAGES.indexOf(deal.stage)
              const isPast = index <= currentIndex
              return (
                <div key={stage} className="flex-1 flex items-center">
                  <div className={`h-2 w-full rounded-full ${isPast ? (stage === 'CLOSED_LOST' ? 'bg-red-400' : 'bg-sky-500') : 'bg-gray-200'}`}></div>
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2 overflow-x-auto">
            {STAGES.map((stage) => <span key={stage} className={`text-[10px] whitespace-nowrap ${stage === deal.stage ? 'font-bold text-sky-700' : 'text-gray-400'}`}>{stage.replace('_', ' ')}</span>)}
          </div>
        </div>

        <CrmDetailHero
          backHref="/crm/deals"
          backLabel="Deals"
          title={deal.name}
          subtitle={`${deal.stage?.replace('_', ' ')} opportunity${accountName !== 'Unlinked' ? ` for ${accountName}` : ''}`}
          avatarText={deal.name?.[0]}
          badges={[deal.stage?.replace('_', ' '), accountName, contactName ? `${contactName.firstName} ${contactName.lastName}` : 'No primary contact']}
          actions={
            <>
              <FeatureGate requiredPermission="ERP_CREATE">
                <button
                  onClick={() => void handleCreateSO()}
                  disabled={convertingSO}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {convertingSO ? 'Creating...' : '+ Create Sales Order'}
                </button>
              </FeatureGate>
              <FeatureGate requiredPermission="CRM_EDIT">
                <button onClick={() => setIsEditing(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Edit</button>
              </FeatureGate>
              <FeatureGate requiredPermission="CRM_DELETE">
                <button onClick={handleDelete} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">Delete</button>
              </FeatureGate>
            </>
          }
          metrics={[
            { label: 'Amount', value: fmt(deal.amount) },
            { label: 'Weighted Revenue', value: fmt(deal.expectedRevenueWeighted) },
            { label: 'Probability', value: `${deal.probability || 0}%`, accentClassName: 'text-sky-700' },
            { label: 'Close Date', value: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—' },
          ]}
        />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Amount', value: fmt(deal.amount) },
                { label: 'Weighted Revenue', value: fmt(deal.expectedRevenueWeighted) },
                { label: 'Probability', value: `${deal.probability || 0}%` },
                { label: 'Close Date', value: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—' },
                { label: 'Days in Stage', value: deal.daysInStage ?? '—' },
                { label: 'Days in Pipeline', value: deal.daysInPipeline ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="crm-detail-panel p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="crm-detail-panel p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  ['Deal Name', deal.name],
                  ['Stage', deal.stage],
                  ['Account', accountName],
                  ['Primary Contact', contactName ? `${contactName.firstName} ${contactName.lastName}` : null],
                  ['Amount', fmt(deal.amount)],
                  ['Weighted Revenue', fmt(deal.expectedRevenueWeighted)],
                  ['Probability', `${deal.probability || 0}%`],
                  ['Days in Stage', deal.daysInStage ?? null],
                  ['Days in Pipeline', deal.daysInPipeline ?? null],
                  ['Expected Close', deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : null],
                  ['Lead Source', deal.leadSource],
                  ['Next Step', deal.nextStep],
                  ['Created', new Date(deal.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label as string}><dt className="text-xs text-gray-400 mb-0.5">{label}</dt><dd className="text-sm text-gray-900">{(value as string) || '—'}</dd></div>
                ))}
              </div>
              {deal.description && <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3><p className="text-sm text-gray-600">{deal.description}</p></>}
            </div>
          </>
        )}

        {/* Tab: Activities */}
        {activeTab === 'activities' && (
          <div className="crm-detail-panel p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h2>
            {relatedLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-400">No activities logged for this deal yet.</p>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-6 ml-3">
                {activities.map((act) => (
                  <li key={act.id} className="ml-6">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 ring-4 ring-white text-sky-600 text-xs font-bold">
                      {act.type?.[0] ?? 'A'}
                    </span>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{act.subject || act.type}</p>
                        {act.description && <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${act.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {act.status || 'OPEN'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {act.dueDate ? new Date(act.dueDate).toLocaleDateString() : new Date(act.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Tab: Quotes */}
        {activeTab === 'quotes' && (
          <div className="crm-detail-panel p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Quotes</h2>
            {relatedLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : quotes.length === 0 ? (
              <p className="text-sm text-gray-400">No quotes linked to this deal.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Quote #', 'Version', 'Status', 'Issued', 'Expiry', 'Total'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quotes.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-sky-700">{q.quoteNumber}</td>
                        <td className="px-4 py-2 text-gray-600">v{q.version}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : q.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{q.issuedDate ? new Date(q.issuedDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2 text-gray-500">{q.expiryDate ? new Date(q.expiryDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2 font-medium">{q.currency} {q.totalAmount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Sales Orders */}
        {activeTab === 'orders' && (
          <div className="crm-detail-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Linked Sales Orders</h2>
              <FeatureGate requiredPermission="ERP_CREATE">
                <button
                  onClick={() => void handleCreateSO()}
                  disabled={convertingSO}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {convertingSO ? 'Creating...' : '+ Create SO'}
                </button>
              </FeatureGate>
            </div>
            {relatedLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : linkedOrders.length === 0 ? (
              <p className="text-sm text-gray-400">No sales orders linked to this deal.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['SO Number', 'Status', 'Order Date', 'Destination', 'Total', ''].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {linkedOrders.map((so) => (
                      <tr key={so.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-sky-700">{so.soNumber}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${so.status === 'DELIVERED' || so.status === 'INSTALLED' ? 'bg-green-100 text-green-700' : so.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {so.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{so.orderDate ? new Date(so.orderDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2 text-gray-500">{so.destinationCountry || '—'}</td>
                        <td className="px-4 py-2 font-medium">{so.currency} {so.totalAmount?.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => navigate(`/erp/sales-orders/${so.id}`)} className="text-xs text-sky-600 hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CrmDetailHero
        backHref="/crm/deals"
        backLabel="Deals"
        title={isNew ? 'New Deal' : 'Edit Deal'}
        subtitle="Manage stage, account linkage, forecast values, and next-step planning in one structured deal form."
      />

      <div className="crm-detail-panel p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Deal Name *</label>
              <input type="text" {...register('name')} className="pm-input text-sm" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stage *</label>
              <select {...register('stage')} className="pm-select text-sm">
                {STAGES.map((stage) => <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
              <select {...register('accountId')} className="pm-select text-sm">
                <option value="">Select Account</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
              <select {...register('primaryContactId')} className="pm-select text-sm">
                <option value="">Select Contact</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
              <input type="number" step="0.01" {...register('amount')} className="pm-input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Probability (%)</label>
              <input type="number" min="0" max="100" {...register('probability')} className="pm-input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expected Close Date</label>
              <input type="date" {...register('expectedCloseDate')} className="pm-input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
              <select {...register('leadSource')} className="pm-select text-sm">
                <option value="">—</option>
                {['WEB', 'REFERRAL', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'OTHER'].map((source) => <option key={source} value={source}>{source.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Next Step</label>
              <input type="text" {...register('nextStep')} className="pm-input text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="pm-textarea text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/deals') : setIsEditing(false)} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DealDetailPage
