import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serviceTicketApi } from '../../api/erpApi'

export default function ServiceTicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const response = await serviceTicketApi.getById(id!)
          if (response.data?.data) {
            setTicket(response.data.data)
            setFormData(response.data.data)
          }
        } catch (err) {
          console.error('Error:', err)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    try {
      await serviceTicketApi.update(id!, formData)
      setTicket(formData)
      setEditMode(false)
      alert('Saved successfully')
    } catch (err) {
      alert('Error saving')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : ticket

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ticket #{displayData?.ticketId || 'N/A'}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              <button onClick={() => { setEditMode(false); setFormData(ticket) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              <button onClick={() => navigate('/erp/servicetickets')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ticket Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Client Name</label>
              <input type="text" name="clientName" value={displayData?.clientName || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select name="priority" value={displayData?.priority || 'MEDIUM'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select name="status" value={displayData?.status || 'OPEN'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Equipment & Warranty</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Equipment SKU</label>
              <input type="text" name="equipmentId" value={displayData?.equipmentId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Warranty Reference</label>
              <input type="text" name="warrantyId" value={displayData?.warrantyId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Billable (Out of Warranty)</label>
              <input type="checkbox" name="billable" checked={displayData?.billable || false} onChange={(e: any) => setFormData((prev: any) => prev ? { ...prev, billable: e.target.checked } : null)} disabled={!editMode} className="mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Fault Description</h2>
        <textarea name="faultDescription" value={displayData?.faultDescription || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resolution Notes</h2>
        <textarea name="resolutionNotes" value={displayData?.resolutionNotes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>
    </div>
  )
}
