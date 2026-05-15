import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supplierApi } from '../../api/erpApi'
import { Supplier } from '../../types/erp'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Supplier | null>(null)

  useEffect(() => {
    if (id) {
      fetchSupplier()
    }
  }, [id])

  const fetchSupplier = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await supplierApi.getById(id!)
      if (response.data.success && response.data.data) {
        setSupplier(response.data.data)
        setFormData(response.data.data)
      } else {
        setError('Failed to fetch supplier')
      }
    } catch (err) {
      setError('Error loading supplier: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Failed to fetch supplier:', err)
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
      const response = await supplierApi.update(id!, formData)
      if (response.data.success) {
        setSupplier(response.data.data)
        setEditMode(false)
        alert('Supplier updated successfully')
      }
    } catch (err) {
      alert('Error saving supplier: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierApi.delete(id!)
        alert('Supplier deleted successfully')
        navigate('/erp/suppliers')
      } catch (err) {
        alert('Error deleting supplier: ' + (err instanceof Error ? err.message : 'Unknown error'))
      }
    }
  }

  if (loading) {
    return <div className="p-6">Loading supplier details...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
        <button onClick={() => navigate('/erp/suppliers')} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Suppliers
        </button>
      </div>
    )
  }

  if (!supplier && !editMode) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">Supplier not found</div>
        <button onClick={() => navigate('/erp/suppliers')} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back to Suppliers
        </button>
      </div>
    )
  }

  const displayData = editMode ? formData : supplier

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{displayData?.companyName || 'Supplier Details'}</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(supplier)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/erp/suppliers')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={displayData?.companyName || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier Type</label>
              <select
                name="supplierType"
                value={displayData?.supplierType || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              >
                <option value="">Select type</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="DEALER">Dealer</option>
                <option value="BROKER">Broker</option>
                <option value="PARTS_SUPPLIER">Parts Supplier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={displayData?.country || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={displayData?.contactName || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={displayData?.email || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={displayData?.phone || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Payment & Business Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              name="currency"
              value={displayData?.currency || 'USD'}
              onChange={handleInputChange}
              disabled={!editMode}
              className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
            >
              <option value="AUD">AUD (Australian Dollar)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="JPY">JPY (Japanese Yen)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={displayData?.paymentMethod || 'TT'}
              onChange={handleInputChange}
              disabled={!editMode}
              className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
            >
              <option value="TT">TT (Transfer)</option>
              <option value="LC">LC (Letter of Credit)</option>
              <option value="INSTALLMENT">Installment</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={displayData?.notes || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
            rows={4}
          />
        </div>
      </div>

      {/* Status */}
      {supplier && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold">{supplier.active ? '✅ Active' : '❌ Inactive'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-lg font-semibold">{new Date(supplier.createdAt || '').toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated</p>
              <p className="text-lg font-semibold">{new Date(supplier.updatedAt || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
