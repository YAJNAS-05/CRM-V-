import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { leadApi } from '../../api/crmApi'
import { Lead, CreateLeadRequest } from '../../types/crm'
import { FeatureGate } from '../../components/rbac'
import CrmDetailHero from '../../components/crm/CrmDetailHero'
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    leadSource: '',
    status: 'NEW',
    website: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    annualRevenue: undefined,
    employees: undefined,
  })

  useEffect(() => {
    if (id) {
      fetchLead()
    }
  }, [id])

  useEffect(() => {
    if (lead && !isNew) {
      setForm({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        jobTitle: lead.jobTitle || '',
        leadSource: lead.leadSource || '',
        status: lead.status || 'NEW',
        website: lead.website || '',
        description: lead.description || '',
        street: lead.street || '',
        city: lead.city || '',
        state: lead.state || '',
        zip: lead.zip || '',
        country: lead.country || '',
        annualRevenue: lead.annualRevenue,
        employees: lead.employees,
      })
    }
  }, [lead, isNew])

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const fetchLead = async () => {
    try {
      setLoading(true)
      const response = await leadApi.getById(id!)
      setLead(response.data.data)
    } catch {
      toast.error('Failed to load lead')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required')
      return
    }

    try {
      setSaving(true)
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, typeof value === 'string' && value.trim() === '' ? null : value])
      ) as CreateLeadRequest

      if (isNew) {
        await leadApi.create(payload)
        toast.success('Lead created successfully!')
      } else {
        await leadApi.update(id!, payload)
        toast.success('Lead updated successfully!')
      }

      navigate('/crm/leads')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (isNew ? 'Failed to create lead' : 'Failed to update lead'))
    } finally {
      setSaving(false)
    }
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
    } catch {
      toast.error('Conversion failed')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return
    try {
      await leadApi.delete(id!)
      toast.success('Lead deleted')
      navigate('/crm/leads')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!lead && !isNew) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Lead not found</p>
        <Link to="/crm/leads" className="text-indigo-600 hover:text-indigo-800">Back to Leads</Link>
      </div>
    )
  }

  if (isNew || isEditing) {
    return (
      <div className="space-y-6">
        <CrmDetailHero
          backHref="/crm/leads"
          backLabel="Leads"
          title={isNew ? 'New Lead' : `Edit ${lead?.firstName} ${lead?.lastName}`}
          subtitle="Capture qualification data, company context, and outreach details in one structured lead form."
        />

        <div className="crm-detail-panel p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
              <input type="text" value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} className="pm-input text-sm" placeholder="John" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
              <input type="text" value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} className="pm-input text-sm" placeholder="Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(event) => updateForm('email', event.target.value)} className="pm-input text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <input type="tel" value={form.phone || ''} onChange={(event) => updateForm('phone', event.target.value)} className="pm-input text-sm" placeholder="+1234567890" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
              <input type="text" value={form.company || ''} onChange={(event) => updateForm('company', event.target.value)} className="pm-input text-sm" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
              <input type="text" value={form.jobTitle || ''} onChange={(event) => updateForm('jobTitle', event.target.value)} className="pm-input text-sm" placeholder="Manager" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status || 'NEW'} onChange={(event) => updateForm('status', event.target.value)} className="pm-select text-sm">
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
              <select value={form.leadSource || ''} onChange={(event) => updateForm('leadSource', event.target.value)} className="pm-select text-sm">
                <option value="">Select source</option>
                {SOURCES.map((source) => <option key={source} value={source}>{source.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
              <input type="url" value={form.website || ''} onChange={(event) => updateForm('website', event.target.value)} className="pm-input text-sm" placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Annual Revenue</label>
              <input type="number" value={form.annualRevenue ?? ''} onChange={(event) => updateForm('annualRevenue', event.target.value ? Number(event.target.value) : undefined)} className="pm-input text-sm" placeholder="100000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employees</label>
              <input type="number" value={form.employees ?? ''} onChange={(event) => updateForm('employees', event.target.value ? Number(event.target.value) : undefined)} className="pm-input text-sm" placeholder="50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
              <input type="text" value={form.country || ''} onChange={(event) => updateForm('country', event.target.value)} className="pm-input text-sm" placeholder="Australia" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Street</label>
              <input type="text" value={form.street || ''} onChange={(event) => updateForm('street', event.target.value)} className="pm-input text-sm" placeholder="123 Main St" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
              <input type="text" value={form.city || ''} onChange={(event) => updateForm('city', event.target.value)} className="pm-input text-sm" placeholder="Sydney" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
              <input type="text" value={form.state || ''} onChange={(event) => updateForm('state', event.target.value)} className="pm-input text-sm" placeholder="NSW" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Zip Code</label>
              <input type="text" value={form.zip || ''} onChange={(event) => updateForm('zip', event.target.value)} className="pm-input text-sm" placeholder="2000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="pm-textarea text-sm" placeholder="Additional notes about this lead..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button onClick={() => isNew ? navigate('/crm/leads') : setIsEditing(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">
              {saving ? 'Saving...' : isNew ? 'Create Lead' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="space-y-6">
      <CrmDetailHero
        backHref="/crm/leads"
        backLabel="Leads"
        title={`${lead.salutation ? `${lead.salutation} ` : ''}${lead.firstName} ${lead.lastName}`}
        subtitle={lead.jobTitle ? `${lead.jobTitle}${lead.company ? ` at ${lead.company}` : ''}` : lead.company || 'Lead profile and qualification context.'}
        avatarText={`${lead.firstName?.[0] || ''}${lead.lastName?.[0] || ''}`}
        badges={[lead.status, lead.leadSource?.replace('_', ' ') || 'Source pending', lead.company || 'No company']}
        actions={
          <>
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
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Convert
                </button>
              </FeatureGate>
            )}
            <FeatureGate requiredPermission="CRM_EDIT">
              <button onClick={() => setIsEditing(true)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Edit</button>
            </FeatureGate>
            <FeatureGate requiredPermission="CRM_DELETE">
              <button onClick={handleDelete} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">Delete</button>
            </FeatureGate>
          </>
        }
        metrics={[
          { label: 'Status', value: lead.status, accentClassName: 'text-sky-700' },
          { label: 'Company', value: lead.company || '—' },
          { label: 'Employees', value: lead.employees?.toString() || '—' },
          { label: 'Revenue', value: lead.annualRevenue ? `$${lead.annualRevenue.toLocaleString()}` : '—' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="crm-detail-panel p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact Info</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">Email: {lead.email ? <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a> : <span className="text-gray-400">—</span>}</p>
            <p className="text-gray-500">Phone: <span className="text-gray-700">{lead.phone || '—'}</span></p>
            <p className="text-gray-500">Website: {lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all">{lead.website}</a> : <span className="text-gray-400">—</span>}</p>
          </div>
        </div>
        <div className="crm-detail-panel p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Company</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">{lead.company || '—'}</p>
            <p className="text-gray-500">Job Title: <span className="text-gray-700">{lead.jobTitle || '—'}</span></p>
            <p className="text-gray-500">Source: <span className="text-gray-700">{lead.leadSource?.replace('_', ' ') || '—'}</span></p>
          </div>
        </div>
        <div className="crm-detail-panel p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Additional</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">Rating: <span className="text-gray-700 font-medium">{lead.rating || '—'}</span></p>
            <p className="text-gray-500">Created: <span className="text-gray-700">{new Date(lead.createdAt).toLocaleDateString()}</span></p>
            <p className="text-gray-500">Updated: <span className="text-gray-700">{new Date(lead.updatedAt).toLocaleDateString()}</span></p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['details', 'notes'] as const).map((currentTab) => (
            <button key={currentTab} onClick={() => setTab(currentTab)} className={`pb-3 text-sm font-medium capitalize transition ${tab === currentTab ? 'crm-detail-tab-active' : 'crm-detail-tab-idle'}`}>
              {currentTab}
            </button>
          ))}
        </div>
      </div>

      {tab === 'details' && (
        <div className="crm-detail-panel p-6">
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
              <div key={label as string}><dt className="text-xs text-gray-400 mb-0.5">{label}</dt><dd className="text-sm text-gray-900">{value || '—'}</dd></div>
            ))}
          </div>

          {(lead.street || lead.city || lead.state) && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-4">Address</h3>
              <p className="text-sm text-gray-700">{[lead.street, lead.city, lead.state, lead.zip, lead.country].filter(Boolean).join(', ')}</p>
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
        <div className="crm-detail-panel p-6">
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">{lead.description || 'No notes added'}</p>
          </div>
        </div>
      )}

      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Convert Lead</h2>
            <p className="text-sm text-gray-500 mb-5">Convert "{lead.firstName} {lead.lastName}" into contact, account, and deal records.</p>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked disabled className="rounded border-gray-300 text-indigo-600" />
                Create Contact <span className="text-gray-400">(always created)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={convertForm.createAccount} onChange={(event) => setConvertForm({ ...convertForm, createAccount: event.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                Create Account
              </label>
              {convertForm.createAccount && (
                <input type="text" value={convertForm.accountName} onChange={(event) => setConvertForm({ ...convertForm, accountName: event.target.value })} placeholder="Account Name" className="pm-input text-sm" />
              )}
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={convertForm.createDeal} onChange={(event) => setConvertForm({ ...convertForm, createDeal: event.target.checked })} className="rounded border-gray-300 text-indigo-600" />
                Create Deal
              </label>
              {convertForm.createDeal && (
                <input type="text" value={convertForm.dealName} onChange={(event) => setConvertForm({ ...convertForm, dealName: event.target.value })} placeholder="Deal Name" className="pm-input text-sm" />
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConvertModal(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleConvert} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Convert Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadDetailPage
