import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { purchaseOrderApi } from '../../api/erpApi'
import { PurchaseOrder } from '../../types/erp'
import { FeatureGate } from '../../components/rbac'

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    if (id) {
      fetchPurchaseOrder()
    }
  }, [id])

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await purchaseOrderApi.getById(id!)
      if (response.data.success && response.data.data) {
        setPo(response.data.data)
        setFormData(response.data.data)
      } else {
        setError('Failed to fetch purchase order')
      }
    } catch (err) {
      setError('Error loading purchase order: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    if (!formData) return
    try {
      const response = await purchaseOrderApi.update(id!, formData)
      if (response.data.success) {
        setPo(response.data.data)
        setEditMode(false)
        alert('Purchase order updated successfully')
      }
    } catch (err) {
      alert('Error saving purchase order: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrderApi.delete(id!)
        alert('Purchase order deleted successfully')
        navigate('/erp/purchaseorders')
      } catch (err) {
        alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
      }
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded">{error}</div>
  if (!po && !editMode) return <div className="p-6 bg-yellow-50 text-yellow-700 rounded">Purchase order not found</div>

  const displayData = editMode ? formData : po

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PO #{displayData?.poNumber || 'N/A'}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
              </FeatureGate>
              <button onClick={() => { setEditMode(false); setFormData(po) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
              </FeatureGate>
              <FeatureGate requiredPermission="ERP_DELETE">
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
              </FeatureGate>
            </>
          )}
          <button onClick={() => navigate('/erp/purchaseorders')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Number</label>
              <input type="text" name="poNumber" value={displayData?.poNumber || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <input type="text" name="supplierId" value={displayData?.supplierId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" placeholder="Supplier ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Date</label>
              <input type="date" name="poDate" value={displayData?.poDate || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={displayData?.status || 'DRAFT'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="RECEIVED">Received</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
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
              <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
              <input type="text" name="paymentTerms" value={displayData?.paymentTerms || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <textarea name="notes" value={displayData?.notes || ''} onChange={handleInputChange} disabled={!editMode} className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={4} />
      </div>
    </div>
  )
}
