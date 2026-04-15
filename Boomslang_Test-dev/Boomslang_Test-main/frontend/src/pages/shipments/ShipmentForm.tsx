import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shipmentApi } from '../../api/erpApi'
import { toast } from 'react-hot-toast'

const SHIPMENT_STATUSES = ['PENDING', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'RETURNED', 'CANCELLED']

interface FormData {
  trackingNumber: string
  carrier: string
  originCountry: string
  destinationCountry: string
  status: string
  shippedDate: string
  estimatedArrival: string
  freightCost: string
  currency: string
  soId: string
  poId: string
  notes: string
}

const defaultForm: FormData = {
  trackingNumber: '',
  carrier: '',
  originCountry: '',
  destinationCountry: '',
  status: 'PENDING',
  shippedDate: '',
  estimatedArrival: '',
  freightCost: '',
  currency: 'USD',
  soId: '',
  poId: '',
  notes: '',
}

export default function ShipmentForm() {
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
      const response = await shipmentApi.getById(id!)
      const d = response.data
      if (d.success && d.data) {
        const e = d.data
        setForm({
          trackingNumber: e.trackingNumber || '',
          carrier: e.carrier || '',
          originCountry: e.originCountry || '',
          destinationCountry: e.destinationCountry || '',
          status: e.status || 'PENDING',
          shippedDate: e.shippedDate || '',
          estimatedArrival: e.estimatedArrival || '',
          freightCost: e.freightCost?.toString() || '',
          currency: e.currency || 'USD',
          soId: e.soId || '',
          poId: e.poId || '',
          notes: e.notes || '',
        })
      }
    } catch { toast.error('Failed to load shipment') }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.status) { toast.error('Status is required'); return }
    try {
      setSaving(true)
      const payload = {
        ...form,
        freightCost: form.freightCost ? parseFloat(form.freightCost) : null,
        shippedDate: form.shippedDate || null,
        estimatedArrival: form.estimatedArrival || null,
        soId: form.soId || null,
        poId: form.poId || null,
      }
      if (isEdit) {
        const response = await shipmentApi.update(id!, payload)
        if (response.data.success) { toast.success('Shipment updated'); navigate('/erp/shipments') }
      } else {
        const response = await shipmentApi.create(payload)
        if (response.data.success) { toast.success('Shipment created'); navigate('/erp/shipments') }
      }
    } catch (error: any) { toast.error(error?.response?.data?.message || 'Failed to save shipment') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/erp/shipments')} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Shipments
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Shipment' : 'Create Shipment'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Shipment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <input type="text" name="carrier" value={form.carrier} onChange={handleChange} maxLength={50} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Route & Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
                <input type="text" name="originCountry" value={form.originCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                <input type="text" name="destinationCountry" value={form.destinationCountry} onChange={handleChange} maxLength={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipped Date</label>
                <input type="date" name="shippedDate" value={form.shippedDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival</label>
                <input type="date" name="estimatedArrival" value={form.estimatedArrival} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freight Cost</label>
                <input type="number" step="0.01" name="freightCost" value={form.freightCost} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" name="currency" value={form.currency} onChange={handleChange} maxLength={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Linked Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order ID</label>
                <input type="text" name="soId" value={form.soId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order ID</label>
                <input type="text" name="poId" value={form.poId} onChange={handleChange} placeholder="UUID (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/erp/shipments')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : isEdit ? 'Update Shipment' : 'Create Shipment'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
