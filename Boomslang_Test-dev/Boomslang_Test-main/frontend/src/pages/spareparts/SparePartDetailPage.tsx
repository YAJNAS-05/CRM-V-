import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sparePartApi } from '../../api/erpApi'
import { toast } from 'sonner'

export default function SparePartDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sparePart, setSparePart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const response = await sparePartApi.getById(id)
          if (response.data) {
            setSparePart(response.data)
            setFormData(response.data)
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
      await sparePartApi.update(id!, formData)
      setSparePart(formData)
      setEditMode(false)
      toast.success('Spare Part updated successfully')
    } catch (err) {
      toast.error('Error saving spare part')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  const displayData = editMode ? formData : sparePart

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Spare Part Details</h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              <button onClick={() => { setEditMode(false); setFormData(sparePart) }} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              <button onClick={() => navigate('/erp/spareparts')} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Part Code</label>
              <input type="text" name="partCode" value={displayData?.partCode || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input type="text" name="description" value={displayData?.description || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select name="category" value={displayData?.category || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="">Select Category</option>
                <option value="MECHANICAL">Mechanical</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="HYDRAULIC">Hydraulic</option>
                <option value="CONSUMABLE">Consumable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing & Suppliers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Unit Cost</label>
              <input type="number" name="unitCost" value={displayData?.unitCost || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium">Markup %</label>
              <input type="number" name="markup" value={displayData?.markup || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Lead Time (Days)</label>
              <input type="number" name="leadTime" value={displayData?.leadTime || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Minimum Stock Level</label>
              <input type="number" name="minStockLevel" value={displayData?.minStockLevel || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Reorder Quantity</label>
              <input type="number" name="reorderQuantity" value={displayData?.reorderQuantity || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">UOM</label>
              <input type="text" name="uom" value={displayData?.uom || 'EA'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Equipment Classification</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Suitable for Equipment Type</label>
              <input type="text" name="equipmentType" value={displayData?.equipmentType || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Part Status</label>
              <select name="status" value={displayData?.status || 'ACTIVE'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
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
