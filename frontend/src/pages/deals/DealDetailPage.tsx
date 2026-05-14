import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { dealApi, accountApi, contactApi } from '../../api/crmApi'
import { Deal, Account, Contact } from '../../types/crm'
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

    return (
      <div className="space-y-6">
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
