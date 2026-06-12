import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountApi, contactApi, dealApi } from '../../api/crmApi'
import { Account, Contact, Deal } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import CrmDetailHero from '../../components/crm/CrmDetailHero'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import CompletionStatusBadge from '../../components/forms/CompletionStatusBadge'
import { deriveCompletionStatus } from '../../lib/formCompletion'

const ACCOUNT_REQUIRED_FIELDS = ['name', 'email', 'phone', 'industry', 'accountType'] as const

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  email: z.string().optional(),
  phone: z.string().optional(),
  accountType: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  annualRevenue: z.coerce.number().optional(),
  employees: z.coerce.number().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  description: z.string().optional(),
})
type AccountFormData = z.infer<typeof accountSchema>

interface AccountDetailPageProps { isNew?: boolean }

const AccountDetailPage: React.FC<AccountDetailPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
  const [isSaving, setIsSaving] = useState(false)
  const [isFetching, setIsFetching] = useState(!isNew)
  const [account, setAccount] = useState<Account | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [isEditing, setIsEditing] = useState(isNew)
  const [tab, setTab] = useState<'details' | 'contacts' | 'deals'>('details')
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  })

  useEffect(() => {
    if (!isNew && id) {
      fetchAccount()
      fetchRelated()
    } else {
      setIsFetching(false)
    }
  }, [id, isNew])

  const fetchAccount = async () => {
    try {
      const response = await accountApi.getById(id!)
      const current = response.data.data
      if (!current) {
        toast.error('Account not found')
        navigate('/crm/accounts')
        return
      }

      setAccount(current)
      const completion = deriveCompletionStatus(current, [...ACCOUNT_REQUIRED_FIELDS])
      setIsEditing(isNew || completion === 'PENDING')
      reset({
        name: current.name,
        email: current.email,
        phone: current.phone,
        accountType: current.accountType,
        website: current.website,
        industry: current.industry,
        annualRevenue: current.annualRevenue,
        employees: current.employees,
        billingStreet: current.billingStreet,
        billingCity: current.billingCity,
        billingState: current.billingState,
        billingZip: current.billingZip,
        billingCountry: current.billingCountry,
        description: current.description,
      })
    } catch {
      toast.error('Failed to load account')
      navigate('/crm/accounts')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchRelated = async () => {
    try {
      const contactsResponse = await contactApi.getByAccount(id!, 0, 50)
      setContacts(contactsResponse.data.data?.content || [])
    } catch {
      setContacts([])
    }

    try {
      const dealsResponse = await dealApi.getByAccount(id!, 0, 50)
      setDeals(dealsResponse.data.data?.content || [])
    } catch {
      setDeals([])
    }
  }

  const onSubmit = async (data: AccountFormData) => {
    setIsSaving(true)
    try {
      if (isNew) {
        await accountApi.create(data)
        toast.success('Account created')
      } else {
        await accountApi.update(id!, data)
        toast.success('Account updated')
        const completion = deriveCompletionStatus(data, [...ACCOUNT_REQUIRED_FIELDS])
        if (completion === 'PENDING') {
          await fetchAccount()
          return
        }
        setIsEditing(false)
        await fetchAccount()
        return
      }
      navigate('/crm/accounts')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error('You do not have permission to delete accounts')
      return
    }
    if (!confirm('Delete this account?')) return
    try {
      await accountApi.delete(id!)
      toast.success('Deleted')
      navigate('/crm/accounts')
    } catch {
      toast.error('Failed')
    }
  }

  if (isFetching) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
  }

  if (!isEditing && account) {
    const openDeals = deals.filter((deal) => !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)).length
    const weightedPipeline = deals.reduce((sum, deal) => sum + (deal.expectedRevenueWeighted || 0), 0)
    const recordCompletion = deriveCompletionStatus(account, [...ACCOUNT_REQUIRED_FIELDS])

    return (
      <div className="space-y-6">
        <CrmDetailHero
          backHref="/crm/accounts"
          backLabel="Accounts"
          title={account.name}
          subtitle={[account.industry, account.accountType].filter(Boolean).join(' · ') || 'Customer account profile and commercial context.'}
          avatarText={account.name?.[0]}
          badges={[
            <CompletionStatusBadge key="completion" status={recordCompletion} />,
            account.industry || 'Industry pending',
            account.accountType || 'Type pending',
            `${contacts.length} contacts`,
          ]}
          actions={
            <>
              {recordCompletion === 'COMPLETED' && (
              <FeatureGate requiredPermission="CRM_EDIT">
                <button onClick={() => setIsEditing(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Edit</button>
              </FeatureGate>
              )}
              <FeatureGate requiredPermission="CRM_DELETE">
                <button onClick={handleDelete} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">Delete</button>
              </FeatureGate>
            </>
          }
          metrics={[
            { label: 'Revenue', value: account.annualRevenue ? `$${account.annualRevenue.toLocaleString()}` : '—' },
            { label: 'Employees', value: account.employees?.toString() || '—' },
            { label: 'Open Deals', value: openDeals, accentClassName: openDeals > 0 ? 'text-sky-700' : 'text-slate-900' },
            { label: 'Weighted Pipeline', value: weightedPipeline ? `$${weightedPipeline.toLocaleString()}` : '$0' },
          ]}
        />

        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {(['details', 'contacts', 'deals'] as const).map((currentTab) => (
              <button key={currentTab} onClick={() => setTab(currentTab)} className={`pb-3 text-sm font-medium capitalize transition ${tab === currentTab ? 'crm-detail-tab-active' : 'crm-detail-tab-idle'}`}>
                {currentTab}
              </button>
            ))}
          </div>
        </div>

        {tab === 'details' && (
          <div className="crm-detail-panel p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ['Account Name', account.name],
                ['Industry', account.industry],
                ['Type', account.accountType],
                ['Website', account.website],
                ['Phone', account.phone],
                ['Email', account.email],
                ['Revenue', account.annualRevenue ? `$${account.annualRevenue.toLocaleString()}` : null],
                ['Employees', account.employees?.toString()],
              ].map(([label, value]) => (
                <div key={label as string}><dt className="text-xs text-gray-400 mb-0.5">{label}</dt><dd className="text-sm text-gray-900">{(value as string) || '—'}</dd></div>
              ))}
            </div>

            {(account.billingStreet || account.billingCity) && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Billing Address</h3>
                <p className="text-sm text-gray-700">{[account.billingStreet, account.billingCity, account.billingState, account.billingZip, account.billingCountry].filter(Boolean).join(', ')}</p>
              </>
            )}

            {account.description && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{account.description}</p>
              </>
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="crm-table-shell">
            {contacts.length === 0 ? <p className="text-center py-12 text-sm text-gray-400">No contacts linked</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="cursor-pointer hover:bg-slate-50/80" onClick={() => navigate(`/crm/contacts/${contact.id}`)}>
                      <td className="px-4 py-3 font-medium text-indigo-600">{contact.firstName} {contact.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.jobTitle || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'deals' && (
          <div className="crm-table-shell">
            {deals.length === 0 ? <p className="text-center py-12 text-sm text-gray-400">No deals linked</p> : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deal Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Close Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="cursor-pointer hover:bg-slate-50/80" onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                      <td className="px-4 py-3 font-medium text-indigo-600">{deal.name}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${deal.stage === 'CLOSED_WON' ? 'bg-green-100 text-green-800' : deal.stage === 'CLOSED_LOST' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{deal.stage?.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 text-gray-700">{deal.amount ? `$${deal.amount.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CrmDetailHero
        backHref="/crm/accounts"
        backLabel="Accounts"
        title={isNew ? 'New Account' : 'Edit Account'}
        subtitle="Capture account identity, commercial profile, and address details in one structured form."
      />

      <div className="crm-detail-panel p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'name' as const, label: 'Account Name *', type: 'text' },
              { name: 'industry' as const, label: 'Industry', type: 'text' },
              { name: 'accountType' as const, label: 'Account Type', type: 'text' },
              { name: 'website' as const, label: 'Website', type: 'url' },
              { name: 'phone' as const, label: 'Phone', type: 'tel' },
              { name: 'email' as const, label: 'Email', type: 'email' },
              { name: 'annualRevenue' as const, label: 'Annual Revenue', type: 'number' },
              { name: 'employees' as const, label: 'Employees', type: 'number' },
              { name: 'billingStreet' as const, label: 'Street', type: 'text' },
              { name: 'billingCity' as const, label: 'City', type: 'text' },
              { name: 'billingState' as const, label: 'State', type: 'text' },
              { name: 'billingZip' as const, label: 'Zip', type: 'text' },
              { name: 'billingCountry' as const, label: 'Country', type: 'text' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                <input type={field.type} {...register(field.name)} className="pm-input text-sm" />
                {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="pm-textarea text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/accounts') : setIsEditing(false)} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountDetailPage
