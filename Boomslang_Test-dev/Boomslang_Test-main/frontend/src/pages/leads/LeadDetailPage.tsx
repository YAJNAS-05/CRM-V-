import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { leadApi } from '../../api/crmApi'
import { Lead, CreateLeadRequest } from '../../types/crm'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  UNQUALIFIED: 'bg-red-100 text-red-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED']
const SOURCES = ['WEB', 'REFERRAL', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'OTHER']

interface LeadDetailPageProps { isNew?: boolean }

const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [tab, setTab] = useState<'details' | 'notes'>('details')
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertForm, setConvertForm] = useState({
    createAccount: true,
    accountName: '',
    createDeal: true,
    dealName: '',
  })
  const [isEditing, setIsEditing] = useState(isNew)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateLeadRequest>({
    firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '',
    leadSource: '', status: 'NEW', website: '', description: '', street: '', city: '',
    state: '', zip: '', country: '', annualRevenue: undefined, employees: undefined,
  })

  useEffect(() => {
    if (id) {
      fetchLead()
    }
  }, [id])

  useEffect(() => {
    if (lead && !isNew) {
      setForm({
        firstName: lead.firstName || '', lastName: lead.lastName || '', email: lead.email || '',
        phone: lead.phone || '', company: lead.company || '', jobTitle: lead.jobTitle || '',
        leadSource: lead.leadSource || '', status: lead.status || 'NEW', website: lead.website || '',
        description: lead.description || '', street: lead.street || '', city: lead.city || '',
        state: lead.state || '', zip: lead.zip || '', country: lead.country || '',
        annualRevenue: lead.annualRevenue, employees: lead.employees,
      })
    }
  }, [lead])

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required')
      return
    }
    try {
      setSaving(true)
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v])
      ) as CreateLeadRequest
      if (isNew) {
        await leadApi.create(payload)
        toast.success('Lead created successfully!')
      } else {
        await leadApi.update(id!, payload)
        toast.success('Lead updated successfully!')
      }
      navigate('/crm/leads')
    } catch { toast.error(isNew ? 'Failed to create lead' : 'Failed to update lead') } finally { setSaving(false) }
  }

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const fetchLead = async () => {
    try {
      setLoading(true)
      const resp = await leadApi.getById(id!)
      setLead(resp.data.data)
    } catch { toast.error('Failed to load lead') } finally { setLoading(false) }
  }

  const handleConvert = async () => {
    if (!id) return
    try {
      const resolvedAccountName = convertForm.accountName?.trim() || lead?.company?.trim() || ''
      if (convertForm.createAccount && !resolvedAccountName) {
        toast.error('Account name is required to create an account')
        return
      }
      await leadApi.convert(id, {
        createAccount: convertForm.createAccount,
        accountName: resolvedAccountName || undefined,
        createDeal: convertForm.createDeal,
        dealName: convertForm.dealName || `${lead?.firstName} ${lead?.lastName} - Deal`,
      })
      toast.success('Lead converted successfully!')
      setShowConvertModal(false)
      navigate('/crm/leads')
    } catch { toast.error('Conversion failed') }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return
    try {
      await leadApi.delete(id!)
      toast.success('Lead deleted')
      navigate('/crm/leads')
    } catch { toast.error('Delete failed') }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  )

  if (!lead && !isNew) return (
    <div className="text-center py-24">
      <p className="text-gray-500 mb-4">Lead not found</p>
      <Link to="/crm/leads" className="text-indigo-600 hover:text-indigo-800">Back to Leads</Link>
    </div>
  )

  if (isNew || isEditing) return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/leads" className="hover:text-indigo-600">Leads</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{isNew ? 'New Lead' : `Edit ${lead?.firstName} ${lead?.lastName}`}</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">{isNew ? 'Create New Lead' : 'Edit Lead'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
            <input type="text" value={form.firstName} onChange={e => updateForm('firstName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
            <input type="text" value={form.lastName} onChange={e => updateForm('lastName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input type="email" value={form.email || ''} onChange={e => updateForm('email', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input type="tel" value={form.phone || ''} onChange={e => updateForm('phone', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+1234567890" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
            <input type="text" value={form.company || ''} onChange={e => updateForm('company', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Acme Inc." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
            <input type="text" value={form.jobTitle || ''} onChange={e => updateForm('jobTitle', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Manager" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={form.status || 'NEW'} onChange={e => updateForm('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
            <select value={form.leadSource || ''} onChange={e => updateForm('leadSource', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select source</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
            <input type="url" value={form.website || ''} onChange={e => updateForm('website', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Annual Revenue</label>
            <input type="number" value={form.annualRevenue ?? ''} onChange={e => updateForm('annualRevenue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="100000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Employees</label>
            <input type="number" value={form.employees ?? ''} onChange={e => updateForm('employees', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
            <input type="text" value={form.country || ''} onChange={e => updateForm('country', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Australia" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Street</label>
            <input type="text" value={form.street || ''} onChange={e => updateForm('street', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <input type="text" value={form.city || ''} onChange={e => updateForm('city', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Sydney" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
            <input type="text" value={form.state || ''} onChange={e => updateForm('state', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="NSW" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Zip Code</label>
            <input type="text" value={form.zip || ''} onChange={e => updateForm('zip', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2000" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => updateForm('description', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Additional notes about this lead..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button onClick={() => isNew ? navigate('/crm/leads') : setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : isNew ? 'Create Lead' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )

  // This point ensures lead is defined for the main view
  if (!lead) return null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/leads" className="hover:text-indigo-600">Leads</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{lead.firstName} {lead.lastName}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
              {lead.firstName?.[0]}{lead.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {lead.salutation ? `${lead.salutation} ` : ''}{lead.firstName} {lead.lastName}
              </h1>
              <p className="text-sm text-gray-500">{lead.jobTitle ? `${lead.jobTitle} at ` : ''}{lead.company || '—'}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'}`}>{lead.status}</span>
                {lead.leadSource && <span className="text-xs text-gray-400">Source: {lead.leadSource.replace('_', ' ')}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead.status !== 'CONVERTED' && (
              <FeatureGate requiredPermission="CRM_EDIT">
                <button
                  onClick={() => {
                    setConvertForm({
                      createAccount: true,
                      accountName: lead.company || '',
                      createDeal: true,
                      dealName: `${lead.firstName} ${lead.lastName} - Deal`,
                    })
                    setShowConvertModal(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Convert
                </button>
              </FeatureGate>
            )}
            <FeatureGate requiredPermission="CRM_EDIT">
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Edit
              </button>
            </FeatureGate>
            <FeatureGate requiredPermission="CRM_DELETE">
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </FeatureGate>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact Info</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {lead.email ? <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a> : <span className="text-gray-400">—</span>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="text-gray-700">{lead.phone || '—'}</span>
            </div>
            {lead.website && (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs truncate">{lead.website}</a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Company</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">{lead.company || '—'}</p>
            {lead.employees && <p className="text-gray-500">Employees: {lead.employees}</p>}
            {lead.annualRevenue && <p className="text-gray-500">Revenue: ${lead.annualRevenue.toLocaleString()}</p>}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Additional</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">Rating: <span className="text-gray-700 font-medium">{lead.rating || '—'}</span></p>
            <p className="text-gray-500">Created: <span className="text-gray-700">{new Date(lead.createdAt).toLocaleDateString()}</span></p>
            <p className="text-gray-500">Updated: <span className="text-gray-700">{new Date(lead.updatedAt).toLocaleDateString()}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(['details', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm font-medium capitalize transition ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'details' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Information</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['First Name', lead.firstName],
              ['Last Name', lead.lastName],
              ['Email', lead.email],
              ['Phone', lead.phone],
              ['Company', lead.company],
              ['Job Title', lead.jobTitle],
              ['Website', lead.website],
              ['Lead Source', lead.leadSource?.replace('_', ' ')],
              ['Status', lead.status],
              ['Rating', lead.rating],
              ['Annual Revenue', lead.annualRevenue ? `$${lead.annualRevenue.toLocaleString()}` : null],
              ['Employees', lead.employees?.toString()],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                <dd className="text-sm text-gray-900">{value || '—'}</dd>
              </div>
            ))}
          </div>
          {(lead.street || lead.city || lead.state) && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-4">Address</h3>
              <p className="text-sm text-gray-700">
                {[lead.street, lead.city, lead.state, lead.zip, lead.country].filter(Boolean).join(', ')}
              </p>
            </>
          )}
          {lead.description && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{lead.description}</p>
            </>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">{lead.description || 'No notes added'}</p>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Convert Lead</h2>
            <p className="text-sm text-gray-500 mb-4">Convert "{lead.firstName} {lead.lastName}" into Contact, Account, and/or Deal</p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked disabled className="rounded border-gray-300 text-indigo-600" />
                Create Contact <span className="text-gray-400">(always created)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={convertForm.createAccount} onChange={(e) => setConvertForm({ ...convertForm, createAccount: e.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                Create Account
              </label>
              {convertForm.createAccount && (
                <input
                  type="text"
                  value={convertForm.accountName}
                  onChange={(e) => setConvertForm({ ...convertForm, accountName: e.target.value })}
                  placeholder="Account Name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={convertForm.createDeal} onChange={(e) => setConvertForm({ ...convertForm, createDeal: e.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                Create Deal
              </label>
              {convertForm.createDeal && (
                <input
                  type="text"
                  value={convertForm.dealName}
                  onChange={(e) => setConvertForm({ ...convertForm, dealName: e.target.value })}
                  placeholder="Deal Name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConvertModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleConvert} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Convert Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadDetailPage
