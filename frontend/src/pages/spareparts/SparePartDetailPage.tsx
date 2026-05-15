import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sparePartApi } from '../../api/erpApi'
import { toast } from 'sonner'
import { FeatureGate } from '../../components/rbac'

interface SparePartFormData {
  partNumber: string
  name: string
  description: string
  category: string
  compatibleModels: string
  stockQty: string
  reorderPoint: string
  unitCost: string
  currency: string
  supplierId: string
  warehouseLocation: string
  manufacturer: string
  locationCountry: string
  yearOfManufacture: string
}

function toSparePartFormData(part: any): SparePartFormData {
  return {
    partNumber: part?.partNumber || '',
    name: part?.name || '',
    description: part?.description || '',
    category: part?.category || '',
    compatibleModels: part?.compatibleModels?.join(', ') || '',
    stockQty: part?.stockQty?.toString() || '',
    reorderPoint: part?.reorderPoint?.toString() || '',
    unitCost: part?.unitCost?.toString() || '',
    currency: part?.currency || 'USD',
    supplierId: part?.supplierId || '',
    warehouseLocation: part?.warehouseLocation || '',
    manufacturer: part?.manufacturer || '',
    locationCountry: part?.locationCountry || '',
    yearOfManufacture: part?.yearOfManufacture?.toString() || '',
  }
}

function buildSparePartPayload(formData: SparePartFormData) {
  return {
    partNumber: formData.partNumber,
    name: formData.name,
    description: formData.description || null,
    category: formData.category || null,
    compatibleModels: formData.compatibleModels ? formData.compatibleModels.split(',').map((item) => item.trim()).filter(Boolean) : [],
    stockQty: formData.stockQty ? parseInt(formData.stockQty, 10) : null,
    reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint, 10) : null,
    unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
    currency: formData.currency || null,
    supplierId: formData.supplierId || null,
    warehouseLocation: formData.warehouseLocation || null,
    manufacturer: formData.manufacturer || null,
    locationCountry: formData.locationCountry || null,
    yearOfManufacture: formData.yearOfManufacture ? parseInt(formData.yearOfManufacture, 10) : null,
  }
}

export default function SparePartDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sparePart, setSparePart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<SparePartFormData | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await sparePartApi.getById(id)
        const envelope = response.data
        if (envelope?.success && envelope.data) {
          setSparePart(envelope.data)
          setFormData(toSparePartFormData(envelope.data))
        }
      } catch (err) {
        console.error('Error loading spare part:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSave = async () => {
    if (!id || !formData?.partNumber || !formData.name) {
      toast.error('Part Number and Name are required')
      return
    }

    try {
      const response = await sparePartApi.update(id, buildSparePartPayload(formData))
      const envelope = response.data
      if (envelope?.success && envelope.data) {
        setSparePart(envelope.data)
        setFormData(toSparePartFormData(envelope.data))
      }
      setEditMode(false)
      toast.success('Spare part updated successfully')
    } catch {
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
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </FeatureGate>
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(sparePart ? toSparePartFormData(sparePart) : null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <FeatureGate requiredPermission="ERP_EDIT">
                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              </FeatureGate>
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
              <label className="block text-sm font-medium">Part Number</label>
              <input type="text" name="partNumber" value={displayData?.partNumber || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" name="name" value={displayData?.name || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input type="text" name="description" value={displayData?.description || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input type="text" name="category" value={displayData?.category || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pricing & Supply</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Unit Cost</label>
              <input type="number" name="unitCost" value={displayData?.unitCost || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <input type="text" name="currency" value={displayData?.currency || 'USD'} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Supplier ID</label>
              <input type="text" name="supplierId" value={displayData?.supplierId || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Warehouse Location</label>
              <input type="text" name="warehouseLocation" value={displayData?.warehouseLocation || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Stock Qty</label>
              <input type="number" name="stockQty" value={displayData?.stockQty || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Reorder Point</label>
              <input type="number" name="reorderPoint" value={displayData?.reorderPoint || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Compatible Models (comma separated)</label>
              <textarea name="compatibleModels" value={displayData?.compatibleModels || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" rows={3} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manufacturer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Manufacturer</label>
              <input type="text" name="manufacturer" value={displayData?.manufacturer || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Location Country</label>
              <input type="text" name="locationCountry" value={displayData?.locationCountry || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium">Year of Manufacture</label>
              <input type="number" name="yearOfManufacture" value={displayData?.yearOfManufacture || ''} onChange={handleInputChange} disabled={!editMode} className="mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
