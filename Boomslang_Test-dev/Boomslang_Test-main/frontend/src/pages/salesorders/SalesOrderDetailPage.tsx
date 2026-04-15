import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { salesOrderApi } from '../../api/erpApi'

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [so, setSo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (id) fetchSalesOrder()
  }, [id])

  const fetchSalesOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await salesOrderApi.getById(id!)
      if (response.data?.success && response.data?.data) {
        setSo(response.data.data)
        setFormData(response.data.data)
      } else {
        setError('Failed to fetch sales order')
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    if (!formData) return
    try {
      const response = await salesOrderApi.update(id!, formData)
      if (response.data?.success) {
        setSo(response.data.data)
        setEditMode(false)
        alert('Sales order updated successfully')
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async () => {
    if (confirm('Delete this sales order?')) {
      try {
        await salesOrderApi.delete(id!)
        navigate('/erp/salesorders')
      } catch (err) {
        alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
      }
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded">{error}</div>
  if (!so) return <div className="p-6 bg-yellow-50 text-yellow-700 rounded">Sales order not found</div>

  const displayData = editMode ? formData : so

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SO #{displayData?.soNumber || 'N/A'}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
              <button onClick={() => { setEditMode(false); setFormData(so) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </>
          )}
          <button onClick={() => navigate('/erp/salesorders')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SO Number</label>
              <input type="text" name="soNumber" value={displayData?.soNumber || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Date</label>
              <input type="date" name="orderDate" value={displayData?.orderDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination Country</label>
              <input type="text" name="destinationCountry" value={displayData?.destinationCountry || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Financial</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input type="number" name="totalAmount" value={displayData?.totalAmount || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={displayData?.status || 'DRAFT'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_LOGISTICS">In Logistics</option>
                <option value="INSTALLED">Installed</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
        <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>
    </div>
  )
}
