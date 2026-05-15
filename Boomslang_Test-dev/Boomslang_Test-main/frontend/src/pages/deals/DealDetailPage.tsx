import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { dealApi, accountApi, contactApi } from '../../api/crmApi'
import { Deal, Account, Contact } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
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
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canEdit = permissions?.includes('CRM_EDIT') ?? false
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
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
    if (!isNew && id) { fetchDeal() } else { setIsFetching(false) }
  }, [id, isNew])

  useEffect(() => { if (selectedAccountId) fetchContacts(selectedAccountId) }, [selectedAccountId])

  const fetchAccounts = async () => { try { const r = await accountApi.getAll(0, 100); setAccounts(r.data.data?.content || []) } catch {} }
  const fetchContacts = async (aid: string) => { try { const r = await contactApi.getByAccount(aid, 0, 100); setContacts(r.data.data?.content || []) } catch {} }
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
      if (isNew) { await dealApi.create(data); toast.success('Deal created') } else { await dealApi.update(id!, data); toast.success('Deal updated') }
      navigate('/crm/deals')
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') } finally { setIsSaving(false) }
  }
  const handleDelete = async () => {
    if (!canDelete) {
      toast.error('You do not have permission to delete deals')
      return
    }
    if (!confirm('Delete this deal?')) return
    try { await dealApi.delete(id!); toast.success('Deleted'); navigate('/crm/deals') } catch { toast.error('Failed') }
  }

  const fmt = (v?: number) => v ? `$${v.toLocaleString()}` : '—'

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
          {STAGES.map((s, i) => {
            const currentIdx = STAGES.indexOf(deal.stage)
            const isPast = i <= currentIdx
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className={`h-2 w-full rounded-full ${isPast ? (s === 'CLOSED_LOST' ? 'bg-red-400' : 'bg-indigo-500') : 'bg-gray-200'}`}></div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {STAGES.map(s => <span key={s} className={`text-[10px] ${s === deal.stage ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>{s.replace('_', ' ')}</span>)}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{deal.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800'}`}>{deal.stage?.replace('_', ' ')}</span>
              <span className="text-lg font-bold text-gray-900">{fmt(deal.amount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Amount', value: fmt(deal.amount) },
          { label: 'Probability', value: `${deal.probability || 0}%` },
          { label: 'Close Date', value: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—' },
          { label: 'Source', value: deal.leadSource?.replace('_', ' ') || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[['Deal Name', deal.name], ['Stage', deal.stage], ['Amount', fmt(deal.amount)], ['Probability', `${deal.probability || 0}%`], ['Expected Close', deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : null], ['Lead Source', deal.leadSource], ['Next Step', deal.nextStep], ['Created', new Date(deal.createdAt).toLocaleDateString()]].map(([l, v]) => (
            <div key={l as string}><dt className="text-xs text-gray-400 mb-0.5">{l}</dt><dd className="text-sm text-gray-900">{(v as string) || '—'}</dd></div>
          ))}
        </div>
        {deal.description && <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3><p className="text-sm text-gray-600">{deal.description}</p></>}
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
                {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
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
                <option value="">—</option>{['WEB','REFERRAL','COLD_CALL','EMAIL_CAMPAIGN','SOCIAL_MEDIA','OTHER'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
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
