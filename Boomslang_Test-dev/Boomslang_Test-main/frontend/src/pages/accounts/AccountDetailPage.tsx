import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountApi, contactApi, dealApi } from '../../api/crmApi'
import { Account, Contact, Deal } from '../../types/crm'
import { toast } from 'sonner'

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
    if (!isNew && id) { fetchAccount(); fetchRelated() } else { setIsFetching(false) }
  }, [id, isNew])

  const fetchAccount = async () => {
    try {
      const r = await accountApi.getById(id!)
      const a = r.data.data
      if (!a) { toast.error('Account not found'); navigate('/crm/accounts'); return }
      setAccount(a)
      reset({ name: a.name, email: a.email, phone: a.phone, accountType: a.accountType, website: a.website, industry: a.industry, annualRevenue: a.annualRevenue, employees: a.employees, billingStreet: a.billingStreet, billingCity: a.billingCity, billingState: a.billingState, billingZip: a.billingZip, billingCountry: a.billingCountry, description: a.description })
    } catch { toast.error('Failed to load account'); navigate('/crm/accounts') } finally { setIsFetching(false) }
  }
  const fetchRelated = async () => {
    try { const r = await contactApi.getByAccount(id!, 0, 50); setContacts(r.data.data?.content || []) } catch {}
    try { const r = await dealApi.getByAccount(id!, 0, 50); setDeals(r.data.data?.content || []) } catch {}
  }

  const onSubmit = async (data: AccountFormData) => {
    setIsSaving(true)
    try {
      if (isNew) { await accountApi.create(data); toast.success('Account created') } else { await accountApi.update(id!, data); toast.success('Account updated') }
      navigate('/crm/accounts')
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') } finally { setIsSaving(false) }
  }
  const handleDelete = async () => {
    if (!confirm('Delete this account?')) return
    try { await accountApi.delete(id!); toast.success('Deleted'); navigate('/crm/accounts') } catch { toast.error('Failed') }
  }

  if (isFetching) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>

  // VIEW MODE
  if (!isEditing && account) return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/accounts" className="hover:text-indigo-600">Accounts</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{account.name}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">{account.name?.[0]}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{account.name}</h1>
              <p className="text-sm text-gray-500">{[account.industry, account.accountType].filter(Boolean).join(' · ') || 'No details'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Revenue', value: account.annualRevenue ? `$${account.annualRevenue.toLocaleString()}` : '—' },
          { label: 'Employees', value: account.employees?.toString() || '—' },
          { label: 'Contacts', value: contacts.length.toString() },
          { label: 'Open Deals', value: deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage)).length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(['details', 'contacts', 'deals'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm font-medium capitalize transition ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'details' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[['Account Name', account.name], ['Industry', account.industry], ['Type', account.accountType], ['Website', account.website], ['Phone', account.phone], ['Email', account.email], ['Revenue', account.annualRevenue ? `$${account.annualRevenue.toLocaleString()}` : null], ['Employees', account.employees?.toString()]].map(([l, v]) => (
              <div key={l as string}><dt className="text-xs text-gray-400 mb-0.5">{l}</dt><dd className="text-sm text-gray-900">{(v as string) || '—'}</dd></div>
            ))}
          </div>
          {(account.billingStreet || account.billingCity) && (
            <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Billing Address</h3><p className="text-sm text-gray-700">{[account.billingStreet, account.billingCity, account.billingState, account.billingZip, account.billingCountry].filter(Boolean).join(', ')}</p></>
          )}
          {account.description && <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3><p className="text-sm text-gray-600">{account.description}</p></>}
        </div>
      )}

      {tab === 'contacts' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {contacts.length === 0 ? <p className="text-center py-12 text-sm text-gray-400">No contacts linked</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/crm/contacts/${c.id}`)}>
                  <td className="px-4 py-3 font-medium text-indigo-600">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.jobTitle || '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'deals' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {deals.length === 0 ? <p className="text-center py-12 text-sm text-gray-400">No deals linked</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deal Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Close Date</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{deals.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/crm/deals/${d.id}`)}>
                  <td className="px-4 py-3 font-medium text-indigo-600">{d.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.stage === 'CLOSED_WON' ? 'bg-green-100 text-green-800' : d.stage === 'CLOSED_LOST' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{d.stage?.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-gray-700">{d.amount ? `$${d.amount.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )

  // FORM MODE
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/accounts" className="hover:text-indigo-600">Accounts</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{isNew ? 'New Account' : 'Edit Account'}</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{isNew ? 'New Account' : 'Edit Account'}</h1>
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
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input type={f.type} {...register(f.name)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/accounts') : setIsEditing(false)} className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountDetailPage
