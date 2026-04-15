import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serviceTicketApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

const SERVICE_TYPES = ['PREVENTIVE_MAINTENANCE', 'CORRECTIVE_MAINTENANCE', 'INSTALLATION', 'DEINSTALLATION', 'EMERGENCY_REPAIR', 'SOFTWARE_UPDATE', 'CONSULTATION', 'OTHER']
const SERVICE_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'PENDING_PARTS', 'RESOLVED', 'CLOSED', 'CANCELLED']
const SERVICE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']

interface FormData {
  ticketNumber: string
  accountId: string
  equipmentId: string
  type: string
  status: string
  priority: string
  reportedDate: string
  description: string
  cost: string
  assignedTo: string
  subcontractorId: string
  resolutionNotes: string
}

const defaultForm: FormData = {
  ticketNumber: '',
  accountId: '',
  equipmentId: '',
  type: 'CORRECTIVE_MAINTENANCE',
  status: 'OPEN',
  priority: 'MEDIUM',
  reportedDate: new Date().toISOString().split('T')[0],
  description: '',
  cost: '',
  assignedTo: '',
  subcontractorId: '',
  resolutionNotes: '',
}

export default function ServiceTicketForm() {
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
      const response = await serviceTicketApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          ticketNumber: e.ticketNumber || '',
          accountId: e.accountId || '',
          equipmentId: e.equipmentId || '',
          type: e.type || 'CORRECTIVE_MAINTENANCE',
          status: e.status || 'OPEN',
          priority: e.priority || 'MEDIUM',
          reportedDate: e.reportedDate || '',
          description: e.description || '',
          cost: e.cost?.toString() || '',
          assignedTo: e.assignedTo || '',
          subcontractorId: e.subcontractorId || '',
          resolutionNotes: e.resolutionNotes || '',
        })
      }
    } catch { toast.error('Failed to load service ticket') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ticketNumber || !form.accountId || !form.type || !form.status || !form.priority) {
      toast.error('Ticket Number, Account ID, Type, Status, and Priority are required'); return
    }
    try {
      setSaving(true)
      const payload = {
        ...form,
        cost: form.cost ? parseFloat(form.cost) : null,
        reportedDate: form.reportedDate || null,
        equipmentId: form.equipmentId || null,
        assignedTo: form.assignedTo || null,
        subcontractorId: form.subcontractorId || null,
      }
      if (isEdit) {
        const response = await serviceTicketApi.update(id!, payload)
        if (response.data.success) { toast.success('Service ticket updated'); navigate('/erp/service-tickets') }
      } else {
        const response = await serviceTicketApi.create(payload)
        if (response.data.success) { toast.success('Service ticket created'); navigate('/erp/service-tickets') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save service ticket') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/service-tickets')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Service Tickets
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Service Ticket' : 'Create Service Ticket'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Ticket Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Number *</label>
                <input type="text" name="ticketNumber" value={form.ticketNumber} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account ID *</label>
                <input type="text" name="accountId" value={form.accountId} onChange={handleChange} required placeholder="UUID" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment ID</label>
                <input type="text" name="equipmentId" value={form.equipmentId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select name="priority" value={form.priority} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SERVICE_PRIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                <input type="date" name="reportedDate" value={form.reportedDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input type="text" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractor ID</label>
                <input type="text" name="subcontractorId" value={form.subcontractorId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
            <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/service-tickets')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Ticket' : 'Create Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
