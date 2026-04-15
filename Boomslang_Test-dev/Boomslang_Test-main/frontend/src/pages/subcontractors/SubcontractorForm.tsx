import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subcontractorApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

interface FormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  country: string
  coverageRegions: string
  specialisations: string
  hourlyRate: string
  currency: string
  notes: string
}

const defaultForm: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  coverageRegions: '',
  specialisations: '',
  hourlyRate: '',
  currency: 'USD',
  notes: '',
}

export default function SubcontractorForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) loadItem()
  }, [id])

  const loadItem = async () => {
    try {
      setLoading(true)
      const response = await subcontractorApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          companyName: e.companyName || '',
          contactName: e.contactName || '',
          email: e.email || '',
          phone: e.phone || '',
          country: e.country || '',
          coverageRegions: e.coverageRegions?.join(', ') || '',
          specialisations: e.specialisations?.join(', ') || '',
          hourlyRate: e.hourlyRate?.toString() || '',
          currency: e.currency || 'USD',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load subcontractor') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName) { toast.error('Company Name is required'); return }
    try {
      setSaving(true)
      const payload = {
        ...form,
        coverageRegions: form.coverageRegions ? form.coverageRegions.split(',').map(s => s.trim()).filter(Boolean) : [],
        specialisations: form.specialisations ? form.specialisations.split(',').map(s => s.trim()).filter(Boolean) : [],
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
      }
      if (isEdit) {
        const response = await subcontractorApi.update(id!, payload)
        if (response.data.success) { toast.success('Subcontractor updated'); navigate('/erp/subcontractors') }
      } else {
        const response = await subcontractorApi.create(payload)
        if (response.data.success) { toast.success('Subcontractor created'); navigate('/erp/subcontractors') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save subcontractor') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/subcontractors')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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
                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" name="country" value={form.country} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                <input type="number" step="0.01" name="hourlyRate" value={form.hourlyRate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" name="currency" value={form.currency} onChange={handleChange} maxLength={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialisations (comma-separated)</label>
            <input type="text" name="specialisations" value={form.specialisations} onChange={handleChange} placeholder="e.g. Electrical, HVAC, Plumbing" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Regions (comma-separated)</label>
            <input type="text" name="coverageRegions" value={form.coverageRegions} onChange={handleChange} placeholder="e.g. North America, Europe" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
