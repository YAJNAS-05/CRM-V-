import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { subcontractorApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

const subcontractorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  hourlyRate: z.string().optional(),
})

const COUNTRIES = ['Australia', 'USA', 'Japan', 'UAE', 'Germany', 'UK', 'India', 'Singapore', 'Other']
const CURRENCIES = ['AUD', 'USD', 'JPY', 'EUR', 'GBP']
const SUBCONTRACTOR_TYPES = ['INSTALL_ENGINEER', 'DELIVERY_AGENT', 'DEINSTALL_TEAM', 'SERVICE_ENGINEER', 'ALL']
const SPECIALISATIONS = ['CT', 'MRI', 'ULTRASOUND', 'CATH', 'MAMMOGRAPHY', 'XRAY', 'C_ARM', 'ELECTRICAL', 'HVAC', 'PLUMBING']
const COVERAGE_REGIONS = ['AUSTRALIA', 'NORTH_AMERICA', 'EUROPE', 'MIDDLE_EAST', 'ASIA', 'JAPAN', 'OTHER']
const CERTIFICATIONS = ['OEM', 'IEC', 'TGA', 'FDA', 'CE', 'OTHER']

interface FormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  country: string
  coverageRegions: string[]
  specialisations: string[]
  hourlyRate: string
  currency: string
  subcontractorType: string
  certifications: string[]
  isActive: boolean
  notes: string
}

const defaultForm: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  coverageRegions: [],
  specialisations: [],
  hourlyRate: '',
  currency: 'USD',
  subcontractorType: 'ALL',
  certifications: [],
  isActive: true,
  notes: '',
}

function parseMetadata(rawNotes: string | null | undefined) {
  const source = rawNotes || ''

  const subcontractorType = source.match(/Subcontractor Type:\s*([^\n]+)/)?.[1]?.trim() || 'ALL'
  const certificationsCsv = source.match(/Certifications:\s*([^\n]+)/)?.[1]?.trim() || ''
  const certifications = certificationsCsv
    ? certificationsCsv.split(',').map((item) => item.trim()).filter(Boolean)
    : []
  const isActive = (source.match(/Is Active:\s*([^\n]+)/)?.[1] || 'YES').trim().toUpperCase() === 'YES'

  const cleanedNotes = source
    .replace(/Subcontractor Type:\s*[^\n]+\n?/g, '')
    .replace(/Certifications:\s*[^\n]+\n?/g, '')
    .replace(/Is Active:\s*[^\n]+\n?/g, '')
    .trim()

  return {
    subcontractorType,
    certifications,
    isActive,
    cleanedNotes,
  }
}

export default function SubcontractorForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id, isEdit])

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await subcontractorApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        const metadata = parseMetadata(e.notes)

        setForm({
          companyName: e.companyName || '',
          contactName: e.contactName || '',
          email: e.email || '',
          phone: e.phone || '',
          country: e.country || '',
          coverageRegions: e.coverageRegions || [],
          specialisations: e.specialisations || [],
          hourlyRate: e.hourlyRate?.toString() || '',
          currency: e.currency || 'USD',
          subcontractorType: metadata.subcontractorType,
          certifications: metadata.certifications,
          isActive: metadata.isActive,
          notes: metadata.cleanedNotes,
        })
      }
    } catch {
      toast.error('Failed to load subcontractor')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleMultiSelectValue = (field: 'coverageRegions' | 'specialisations' | 'certifications', value: string) => {
    setForm((prev) => {
      const exists = prev[field].includes(value)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((item) => item !== value) : [...prev[field], value],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = subcontractorSchema.safeParse({
      companyName: form.companyName,
      email: form.email,
      hourlyRate: form.hourlyRate,
    })
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {}
      for (const issue of result.error.errors) {
        const key = issue.path[0] as string
        if (key && !errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setFieldErrors({})

    try {
      setSaving(true)

      const metadataLines = [
        `Subcontractor Type: ${form.subcontractorType}`,
        `Certifications: ${form.certifications.join(', ') || 'NONE'}`,
        `Is Active: ${form.isActive ? 'YES' : 'NO'}`,
      ].join('\n')

      const payload = {
        companyName: form.companyName,
        contactName: form.contactName || null,
        email: form.email || null,
        phone: form.phone || null,
        country: form.country || null,
        coverageRegions: form.coverageRegions,
        specialisations: form.specialisations,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
        currency: form.currency,
        notes: [form.notes?.trim() || null, metadataLines].filter(Boolean).join('\n') || null,
      }

      if (isEdit) {
        const response = await subcontractorApi.update(id!, payload)
        if (response.data.success) {
          toast.success('Subcontractor updated')
          navigate('/erp/subcontractors')
        }
      } else {
        const response = await subcontractorApi.create(payload)
        if (response.data.success) {
          toast.success('Subcontractor created')
          navigate('/erp/subcontractors')
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save subcontractor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const checkboxClass = 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/subcontractors')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Subcontractors
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Subcontractor' : 'Add New Subcontractor'}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.companyName ? 'border-red-500' : 'border-gray-300'}`} />
                {fieldErrors.companyName && <p className="mt-1 text-xs text-red-600">{fieldErrors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select name="country" value={form.country} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="subcontractorType" value={form.subcontractorType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SUBCONTRACTOR_TYPES.map((item) => (
                    <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                <input type="number" step="0.01" name="hourlyRate" value={form.hourlyRate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className={checkboxClass} />
                <label className="ml-2 text-sm text-gray-700">Is Active</label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input type="text" name="contactName" value={form.contactName} onChange={handleChange} maxLength={255} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} maxLength={255} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} maxLength={20} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Specialisations</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SPECIALISATIONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.specialisations.includes(item)}
                    onChange={() => toggleMultiSelectValue('specialisations', item)}
                    className={checkboxClass}
                  />
                  {item.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Coverage Regions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COVERAGE_REGIONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.coverageRegions.includes(item)}
                    onChange={() => toggleMultiSelectValue('coverageRegions', item)}
                    className={checkboxClass}
                  />
                  {item.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CERTIFICATIONS.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.certifications.includes(item)}
                    onChange={() => toggleMultiSelectValue('certifications', item)}
                    className={checkboxClass}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/subcontractors')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Subcontractor' : 'Create Subcontractor'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
