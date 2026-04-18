import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contactApi, accountApi } from '../../api/crmApi'
import { Contact, Account } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'sonner'

const contactSchema = z.object({
  accountId: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  mailingStreet: z.string().optional(),
  mailingCity: z.string().optional(),
  mailingState: z.string().optional(),
  mailingZip: z.string().optional(),
  mailingCountry: z.string().optional(),
  linkedinUrl: z.string().optional(),
  description: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactDetailPageProps { isNew?: boolean }

const ContactDetailPage: React.FC<ContactDetailPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canEdit = permissions?.includes('CRM_EDIT') ?? false
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!isNew)
  const [contact, setContact] = useState<Contact | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isEditing, setIsEditing] = useState(isNew)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  useEffect(() => {
    fetchAccounts()
    if (!isNew && id) { fetchContact() } else { setIsFetching(false) }
  }, [id, isNew])

  const fetchAccounts = async () => {
    try { const r = await accountApi.getAll(0, 100); setAccounts(r.data.data?.content || []) } catch {}
  }
  const fetchContact = async () => {
    try {
      const r = await contactApi.getById(id!)
      const c = r.data.data
      if (!c) { toast.error('Contact not found'); navigate('/crm/contacts'); return }
      setContact(c)
      reset({ accountId: c.accountId, salutation: c.salutation, firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, mobile: c.mobile, jobTitle: c.jobTitle, department: c.department, mailingStreet: c.mailingStreet, mailingCity: c.mailingCity, mailingState: c.mailingState, mailingZip: c.mailingZip, mailingCountry: c.mailingCountry, linkedinUrl: c.linkedinUrl, description: c.description })
    } catch { toast.error('Failed to load contact'); navigate('/crm/contacts') } finally { setIsFetching(false) }
  }
  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    try {
      if (isNew) { await contactApi.create(data); toast.success('Contact created') } else { await contactApi.update(id!, data); toast.success('Contact updated') }
      navigate('/crm/contacts')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed'
      toast.error(msg)
    } finally { setIsLoading(false) }
  }
  const handleDelete = async () => {
    if (!canDelete) {
      toast.error('You do not have permission to delete contacts')
      return
    }
    if (!confirm('Delete this contact?')) return
    try { await contactApi.delete(id!); toast.success('Deleted'); navigate('/crm/contacts') } catch { toast.error('Failed') }
  }

  if (isFetching) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>

  // VIEW MODE for existing contact
  if (!isEditing && contact) return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/contacts" className="hover:text-indigo-600">Contacts</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{contact.firstName} {contact.lastName}</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">{contact.firstName?.[0]}{contact.lastName?.[0]}</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contact.salutation ? `${contact.salutation} ` : ''}{contact.firstName} {contact.lastName}</h1>
              <p className="text-sm text-gray-500">{contact.jobTitle ? `${contact.jobTitle}` : ''}{contact.department ? ` · ${contact.department}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>}
            {canDelete && <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">Delete</button>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact Info</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">Email: {contact.email ? <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a> : '—'}</p>
            <p className="text-gray-500">Phone: <span className="text-gray-700">{contact.phone || '—'}</span></p>
            <p className="text-gray-500">Mobile: <span className="text-gray-700">{contact.mobile || '—'}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Account</h3>
          <p className="text-sm text-gray-700">{accounts.find(a => a.id === contact.accountId)?.name || '—'}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Address</h3>
          <p className="text-sm text-gray-700">{[contact.mailingStreet, contact.mailingCity, contact.mailingState, contact.mailingZip, contact.mailingCountry].filter(Boolean).join(', ') || '—'}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[['First Name', contact.firstName], ['Last Name', contact.lastName], ['Email', contact.email], ['Phone', contact.phone], ['Mobile', contact.mobile], ['Job Title', contact.jobTitle], ['Department', contact.department], ['Lead Source', contact.leadSource], ['LinkedIn', contact.linkedinUrl], ['Created', new Date(contact.createdAt).toLocaleDateString()]].map(([l, v]) => (
            <div key={l as string}><dt className="text-xs text-gray-400 mb-0.5">{l}</dt><dd className="text-sm text-gray-900">{(v as string) || '—'}</dd></div>
          ))}
        </div>
        {contact.description && <><h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Notes</h3><p className="text-sm text-gray-600">{contact.description}</p></>}
      </div>
    </div>
  )

  // FORM MODE (new or edit)
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/crm/contacts" className="hover:text-indigo-600">Contacts</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">{isNew ? 'New Contact' : 'Edit Contact'}</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{isNew ? 'New Contact' : 'Edit Contact'}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
              <select {...register('accountId')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salutation</label>
              <select {...register('salutation')} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">—</option>{['Mr.','Mrs.','Ms.','Dr.','Prof.'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {[
              { name: 'firstName' as const, label: 'First Name *', type: 'text' },
              { name: 'lastName' as const, label: 'Last Name *', type: 'text' },
              { name: 'email' as const, label: 'Email', type: 'email' },
              { name: 'phone' as const, label: 'Phone', type: 'tel' },
              { name: 'mobile' as const, label: 'Mobile', type: 'tel' },
              { name: 'jobTitle' as const, label: 'Job Title', type: 'text' },
              { name: 'department' as const, label: 'Department', type: 'text' },
              { name: 'mailingStreet' as const, label: 'Street', type: 'text' },
              { name: 'mailingCity' as const, label: 'City', type: 'text' },
              { name: 'mailingState' as const, label: 'State', type: 'text' },
              { name: 'mailingZip' as const, label: 'Zip', type: 'text' },
              { name: 'mailingCountry' as const, label: 'Country', type: 'text' },
              { name: 'linkedinUrl' as const, label: 'LinkedIn URL', type: 'url' },
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
            <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/contacts') : setIsEditing(false)} className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactDetailPage
