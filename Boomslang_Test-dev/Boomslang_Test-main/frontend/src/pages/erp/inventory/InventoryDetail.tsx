import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { inventoryApi } from '../../../api/erpApi'
import { InventoryItem } from '../../../types/erp'
import { ApiResponse } from '../../../types'
import { useAuthStore } from '../../../store/authStore'
import { toast } from 'react-hot-toast'

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      fetchInventoryItem(id)
    }
  }, [id])

  const fetchInventoryItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await inventoryApi.getById(itemId)
      if (response.success) {
        setInventoryItem(response.data)
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      toast.error('Failed to load inventory item')
      navigate('/erp/inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this inventory item?')) {
      return
    }

    try {
      await inventoryApi.delete(id)
      toast.success('Inventory item deleted successfully')
      navigate('/erp/inventory')
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast.error('Failed to delete inventory item')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      case 'DISCONTINUED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity <= 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock', icon: AlertTriangle }
    if (quantity <= minStockLevel) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock', icon: TrendingDown }
    return { color: 'bg-green-100 text-green-800', text: 'In Stock', icon: TrendingUp }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!inventoryItem) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Inventory item not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The inventory item you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/erp/inventory"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(inventoryItem.quantity, inventoryItem.minStockLevel)
  const StockIcon = stockStatus.icon

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
              {inventoryItem.name}
            </h1>
            <p className="text-gray-600">Item Code: {inventoryItem.itemCode}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/erp/inventory/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StockIcon className={`h-8 w-8 ${stockStatus.color.includes('red') ? 'text-red-600' : stockStatus.color.includes('yellow') ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Status</p>
              <p className="text-lg font-semibold text-gray-900">{stockStatus.text}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Stock</p>
              <p className="text-lg font-semibold text-gray-900">
                {inventoryItem.quantity} {inventoryItem.unitOfMeasure}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Min Stock Level</p>
              <p className="text-lg font-semibold text-gray-900">
                {inventoryItem.minStockLevel} {inventoryItem.unitOfMeasure}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unit Price</p>
              <p className="text-lg font-semibold text-gray-900">
                ${inventoryItem.unitPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Item Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{inventoryItem.itemCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{inventoryItem.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {inventoryItem.description || 'No description provided'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{inventoryItem.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Unit of Measure</dt>
              <dd className="mt-1 text-sm text-gray-900">{inventoryItem.unitOfMeasure}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inventoryItem.status)}`}>
                  {inventoryItem.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Pricing & Stock Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Stock</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${inventoryItem.unitPrice.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Quantity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {inventoryItem.quantity} {inventoryItem.unitOfMeasure}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Minimum Stock Level</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {inventoryItem.minStockLevel} {inventoryItem.unitOfMeasure}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Maximum Stock Level</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {inventoryItem.maxStockLevel} {inventoryItem.unitOfMeasure}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Reorder Point</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {inventoryItem.reorderPoint} {inventoryItem.unitOfMeasure}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Value</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">
                ${(inventoryItem.quantity * inventoryItem.unitPrice).toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Supplier</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.supplierName || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.location || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Barcode</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.barcode || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">SKU</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.sku || 'Not specified'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Audit Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.createdBy || 'System'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.createdDate ? new Date(inventoryItem.createdDate).toLocaleString() : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Modified By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.lastModifiedBy || 'System'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Modified Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.lastModifiedDate ? new Date(inventoryItem.lastModifiedDate).toLocaleString() : 'Unknown'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default InventoryDetail