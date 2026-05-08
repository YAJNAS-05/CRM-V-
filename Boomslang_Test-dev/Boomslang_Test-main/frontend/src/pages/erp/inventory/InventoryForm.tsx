import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Package } from 'lucide-react'
import { z } from 'zod'
import { inventoryApi, supplierApi } from '../../../api/erpApi'
import { InventoryItem, CreateInventoryItemRequest, Supplier } from '../../../types/erp'
import { ApiResponse } from '../../../types'
import { useAuthStore } from '../../../store/authStore'
import { toast } from 'react-hot-toast'
import SearchableLookupSelect from '../../../components/form/SearchableLookupSelect'

const inventorySchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Item name is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  minStockLevel: z.number().min(0, 'Minimum stock level cannot be negative'),
  maxStockLevel: z.number().min(0, 'Maximum stock level cannot be negative'),
}).refine((d) => d.maxStockLevel >= d.minStockLevel, {
  message: 'Maximum stock level must be greater than minimum stock level',
  path: ['maxStockLevel'],
})

const INVENTORY_CATEGORIES = [
  'EQUIPMENT',
  'EQUIPMENT_ACCESSORY',
  'SPARE_PARTS',
  'CONSUMABLE',
  'CONSUMABLES',
  'RAW_MATERIALS',
  'PACKING_MATERIAL',
  'SAFETY',
  'TOOL',
  'OTHER',
]

const UNIT_OF_MEASURE_OPTIONS = ['PIECE', 'BOX', 'SET', 'ROLL', 'KG', 'LTR']

const INVENTORY_LOCATIONS = ['Sydney AU', 'Vista CA USA', 'Kawasaki JP', 'Australia', 'USA', 'Japan', 'Germany', 'UK', 'India', 'Other']

const InventoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id
  const { user } = useAuthStore()

  const [formData, setFormData] = useState<CreateInventoryItemRequest>({
    itemCode: '',
    name: '',
    description: '',
    category: INVENTORY_CATEGORIES[0],
    unitOfMeasure: 'PIECE',
    quantity: 0,
    minStockLevel: 0,
    maxStockLevel: 100,
    reorderPoint: 10,
    unitPrice: 0,
    supplierName: '',
    location: '',
    barcode: '',
    sku: '',
    status: 'ACTIVE',
  })

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    if (isEditing && id) {
      fetchInventoryItem(id)
    }
  }, [id, isEditing])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    if (!formData.supplierName || suppliers.length === 0) {
      return
    }

    const normalizedSupplierName = formData.supplierName.toLowerCase()

    const matchedSupplier = suppliers.find(
      (supplier) => supplier.companyName.toLowerCase() === normalizedSupplierName
    )
    if (matchedSupplier) {
      setSelectedSupplierId(matchedSupplier.id)
    }
  }, [formData.supplierName, suppliers])

  const loadSuppliers = async () => {
    try {
      setLookupLoading(true)
      const response = await supplierApi.getAll(0, 200)
      setSuppliers(response.data?.data?.content || [])
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setLookupLoading(false)
    }
  }

  const fetchInventoryItem = async (itemId: string) => {
    try {
      setFetchLoading(true)
      const response = await inventoryApi.getById(itemId)
      if (response.success) {
        const item = response.data!
        setFormData({
          itemCode: item.itemCode,
          name: item.name,
          description: item.description || '',
          category: item.category,
          unitOfMeasure: item.unitOfMeasure,
          quantity: item.quantity,
          minStockLevel: item.minStockLevel,
          maxStockLevel: item.maxStockLevel,
          reorderPoint: item.reorderPoint,
          unitPrice: item.unitPrice,
          supplierName: item.supplierName || '',
          location: item.location || '',
          barcode: item.barcode || '',
          sku: item.sku || '',
          status: item.status,
        })
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      toast.error('Failed to load inventory item')
      navigate('/erp/inventory')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const result = inventorySchema.safeParse({
      itemCode: formData.itemCode.trim(),
      name: formData.name.trim(),
      unitPrice: formData.unitPrice,
      quantity: formData.quantity,
      minStockLevel: formData.minStockLevel,
      maxStockLevel: formData.maxStockLevel,
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
      setLoading(true)
      let response: ApiResponse<InventoryItem>

      if (isEditing && id) {
        response = await inventoryApi.update(id, { id, ...formData })
      } else {
        response = await inventoryApi.create(formData)
      }

      if (response.success) {
        toast.success(`Inventory item ${isEditing ? 'updated' : 'created'} successfully`)
        navigate('/erp/inventory')
      }
    } catch (error) {
      console.error('Error saving inventory item:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} inventory item`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSupplierChange = (_name: string, value: string) => {
    setSelectedSupplierId(value)
    const selectedSupplier = suppliers.find((supplier) => supplier.id === value)
    setFormData((prev) => ({
      ...prev,
      supplierName: selectedSupplier?.companyName || '',
    }))
  }

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.companyName,
    meta: [supplier.country, supplier.paymentTerms].filter(Boolean).join(' | ') || undefined,
  }))

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to="/erp/inventory"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-2 h-6 w-6" />
              {isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update inventory item details' : 'Create a new inventory item'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700">
                Item Code *
              </label>
              <input
                type="text"
                id="itemCode"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.itemCode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter item code"
              />
              {fieldErrors.itemCode && <p className="mt-1 text-xs text-red-600">{fieldErrors.itemCode}</p>}
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter item name"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter item description"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {INVENTORY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">
                Unit of Measure *
              </label>
              <select
                id="unitOfMeasure"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {UNIT_OF_MEASURE_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Stock Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                Unit Price *
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Current Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
                Minimum Stock Level *
              </label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="maxStockLevel" className="block text-sm font-medium text-gray-700">
                Maximum Stock Level *
              </label>
              <input
                type="number"
                id="maxStockLevel"
                name="maxStockLevel"
                value={formData.maxStockLevel}
                onChange={handleInputChange}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
            </div>
            <div>
              <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700">
                Reorder Point *
              </label>
              <input
                type="number"
                id="reorderPoint"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SearchableLookupSelect
                label="Supplier"
                name="supplierId"
                value={selectedSupplierId}
                options={supplierOptions}
                onChange={handleSupplierChange}
                disabled={lookupLoading}
                placeholder="Search supplier by company name"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select location</option>
                {INVENTORY_LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                Barcode
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter barcode"
              />
            </div>
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter SKU"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/erp/inventory"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InventoryForm
