import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contactApi, accountApi } from '../../api/crmApi'
import { Contact, Account } from '../../types/crm'
import { FeatureGate } from '../../components/rbac'
import CrmDetailHero from '../../components/crm/CrmDetailHero'
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
    if (!isNew && id) {
      fetchContact()
    } else {
      setIsFetching(false)
    }
  }, [id, isNew])

  const fetchAccounts = async () => {
    try {
      const response = await accountApi.getAll(0, 100)
      setAccounts(response.data.data?.content || [])
    } catch {
      setAccounts([])
    }
  }

  const fetchContact = async () => {
    try {
      const response = await contactApi.getById(id!)
      const current = response.data.data
      if (!current) {
        toast.error('Contact not found')
        navigate('/crm/contacts')
        return
      }

      setContact(current)
      reset({
        accountId: current.accountId,
        salutation: current.salutation,
        firstName: current.firstName,
        lastName: current.lastName,
        email: current.email,
        phone: current.phone,
        mobile: current.mobile,
        jobTitle: current.jobTitle,
        department: current.department,
        mailingStreet: current.mailingStreet,
        mailingCity: current.mailingCity,
        mailingState: current.mailingState,
        mailingZip: current.mailingZip,
        mailingCountry: current.mailingCountry,
        linkedinUrl: current.linkedinUrl,
        description: current.description,
      })
    } catch {
      toast.error('Failed to load contact')
      navigate('/crm/contacts')
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    try {
      if (isNew) {
        await contactApi.create(data)
        toast.success('Contact created')
      } else {
        await contactApi.update(id!, data)
        toast.success('Contact updated')
      }
      navigate('/crm/contacts')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact?')) return
    try {
      await contactApi.delete(id!)
      toast.success('Deleted')
      navigate('/crm/contacts')
    } catch {
      toast.error('Failed')
    }
  }

  if (isFetching) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
  }

  if (!isEditing && contact) {
    const linkedAccount = accounts.find((account) => account.id === contact.accountId)?.name || 'Unlinked'

    return (
      <div className="space-y-6">
        <CrmDetailHero
          backHref="/crm/contacts"
          backLabel="Contacts"
          title={`${contact.salutation ? `${contact.salutation} ` : ''}${contact.firstName} ${contact.lastName}`}
          subtitle={[contact.jobTitle, contact.department].filter(Boolean).join(' · ') || 'Stakeholder profile and communication context.'}
          avatarText={`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`}
          badges={[linkedAccount, contact.email || 'No email', contact.phone || contact.mobile || 'No phone']}
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
            { label: 'Account', value: linkedAccount },
            { label: 'Email', value: contact.email || '—', accentClassName: contact.email ? 'text-sky-700' : 'text-slate-900' },
            { label: 'Phone', value: contact.phone || contact.mobile || '—' },
            { label: 'Created', value: new Date(contact.createdAt).toLocaleDateString() },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="crm-detail-panel p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">Email: {contact.email ? <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a> : '—'}</p>
              <p className="text-gray-500">Phone: <span className="text-gray-700">{contact.phone || '—'}</span></p>
              <p className="text-gray-500">Mobile: <span className="text-gray-700">{contact.mobile || '—'}</span></p>
            </div>
          </div>

          <div className="crm-detail-panel p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Account</h3>
            <p className="text-sm text-gray-700">{linkedAccount}</p>
          </div>

          <div className="crm-detail-panel p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Address</h3>
            <p className="text-sm text-gray-700">{[contact.mailingStreet, contact.mailingCity, contact.mailingState, contact.mailingZip, contact.mailingCountry].filter(Boolean).join(', ') || '—'}</p>
          </div>
        </div>

        <div className="crm-detail-panel p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              ['First Name', contact.firstName],
              ['Last Name', contact.lastName],
              ['Email', contact.email],
              ['Phone', contact.phone],
              ['Mobile', contact.mobile],
              ['Job Title', contact.jobTitle],
              ['Department', contact.department],
              ['Lead Source', contact.leadSource],
              ['LinkedIn', contact.linkedinUrl],
              ['Created', new Date(contact.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label as string}><dt className="text-xs text-gray-400 mb-0.5">{label}</dt><dd className="text-sm text-gray-900">{(value as string) || '—'}</dd></div>
            ))}
          </div>

          {contact.description && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{contact.description}</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CrmDetailHero
        backHref="/crm/contacts"
        backLabel="Contacts"
        title={isNew ? 'New Contact' : 'Edit Contact'}
        subtitle="Capture role, communication details, and account linkage in a cleaner contact record form."
      />

      <div className="crm-detail-panel p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account</label>
              <select {...register('accountId')} className="pm-select text-sm">
                <option value="">Select Account</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salutation</label>
              <select {...register('salutation')} className="pm-select text-sm">
                <option value="">—</option>
                {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map((salutation) => <option key={salutation} value={salutation}>{salutation}</option>)}
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
            <button type="submit" disabled={isLoading} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{isLoading ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => isNew ? navigate('/crm/contacts') : setIsEditing(false)} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactDetailPage
