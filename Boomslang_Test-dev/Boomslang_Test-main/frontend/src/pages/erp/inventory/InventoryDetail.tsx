import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { inventoryApi } from '../../../api/erpApi'
import { InventoryItem, InventoryBin, InventoryLedgerEntry, StockAdjustmentType } from '../../../types/erp'
import { toast } from 'react-hot-toast'
import { FeatureGate } from '../../../components/rbac'

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [bins, setBins] = useState<InventoryBin[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<InventoryLedgerEntry[]>([])
  const [ledgerPage, setLedgerPage] = useState(0)
  const [ledgerTotalPages, setLedgerTotalPages] = useState(0)
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>('INCREASE')
  const [adjustmentLocation, setAdjustmentLocation] = useState('')
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
  const [adjustmentUnitCost, setAdjustmentUnitCost] = useState('')
  const [adjustmentNotes, setAdjustmentNotes] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchInventoryItem(id)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchBins(id)
      fetchLedger(id, ledgerPage)
    }
  }, [id, ledgerPage])

  useEffect(() => {
    if (!inventoryItem) {
      return
    }

    if (!adjustmentLocation) {
      setAdjustmentLocation(inventoryItem.location || 'MAIN')
    }
    if (!adjustmentUnitCost && inventoryItem.unitPrice) {
      setAdjustmentUnitCost(inventoryItem.unitPrice.toString())
    }
  }, [inventoryItem, adjustmentLocation, adjustmentUnitCost])

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

  const fetchBins = async (itemId: string) => {
    try {
      const response = await inventoryApi.getBins(itemId)
      if (response.success) {
        setBins(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching inventory bins:', error)
    }
  }

  const fetchLedger = async (itemId: string, page: number) => {
    try {
      const response = await inventoryApi.getLedger({ itemId, page, size: 10 })
      if (response.success) {
        setLedgerEntries(response.data?.content || [])
        setLedgerTotalPages(response.data?.totalPages || 0)
      }
    } catch (error) {
      console.error('Error fetching inventory ledger:', error)
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

  const handleAdjustStock = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!id) {
      return
    }

    const quantityValue = Number(adjustmentQuantity)
    if (!quantityValue || quantityValue <= 0) {
      toast.error('Quantity must be greater than zero')
      return
    }

    const unitCostValue = adjustmentUnitCost.trim() === '' ? undefined : Number(adjustmentUnitCost)
    if (unitCostValue !== undefined && Number.isNaN(unitCostValue)) {
      toast.error('Unit cost must be a valid number')
      return
    }

    try {
      setAdjusting(true)
      const locationValue = adjustmentLocation.trim() || inventoryItem?.location || 'MAIN'
      const response = await inventoryApi.createStockAdjustment({
        itemId: id,
        location: locationValue,
        quantity: quantityValue,
        unitCost: unitCostValue,
        notes: adjustmentNotes.trim() || undefined,
        adjustmentType,
      })

      if (response.success) {
        toast.success('Stock adjustment posted')
        setAdjustmentQuantity('')
        setAdjustmentNotes('')
        fetchInventoryItem(id)
        fetchBins(id)
        fetchLedger(id, ledgerPage)
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock')
    } finally {
      setAdjusting(false)
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

  const formatLedgerType = (entryType: string) =>
    entryType
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

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

  const stockStatus = getStockStatus(inventoryItem.quantity, inventoryItem.minStockLevel || 0)
  const StockIcon = stockStatus.icon
  const unitPrice = Number(inventoryItem.unitPrice || 0)

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
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/erp/inventory/ledger?itemId=${id}`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Ledger
          </Link>
          <Link
            to={`/erp/inventory/transfers?itemId=${id}`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Transfers
          </Link>
          <FeatureGate requiredPermission="ERP_EDIT">
            <Link
              to={`/erp/inventory/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </FeatureGate>
          <FeatureGate requiredPermission="ERP_DELETE">
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </FeatureGate>
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
                ${unitPrice.toFixed(2)}
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
              <dd className="mt-1 text-sm text-gray-900">${unitPrice.toFixed(2)}</dd>
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
                ${(inventoryItem.quantity * unitPrice).toFixed(2)}
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

      {/* Storage Bins */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Storage Bins</h3>
          <span className="text-sm text-gray-500">{bins.length} locations</span>
        </div>
        {bins.length === 0 ? (
          <p className="text-sm text-gray-500">No bins yet. Adjust stock to create the first bin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bins.map((bin) => (
                  <tr key={bin.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{bin.location}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{bin.onHand}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{bin.reserved}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{bin.available}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{bin.reorderPoint ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Adjustment</h3>
        <form onSubmit={handleAdjustStock} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
            <select
              value={adjustmentType}
              onChange={(event) => setAdjustmentType(event.target.value as StockAdjustmentType)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="INCREASE">Increase</option>
              <option value="DECREASE">Decrease</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={adjustmentLocation}
              onChange={(event) => setAdjustmentLocation(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="MAIN"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={adjustmentQuantity}
              onChange={(event) => setAdjustmentQuantity(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={adjustmentUnitCost}
              onChange={(event) => setAdjustmentUnitCost(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input
              type="text"
              value={adjustmentNotes}
              onChange={(event) => setAdjustmentNotes(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes"
            />
          </div>
          <div className="md:col-span-6 flex justify-end">
            <FeatureGate requiredPermission="ERP_EDIT">
              <button
                type="submit"
                disabled={adjusting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adjusting ? 'Posting...' : 'Post Adjustment'}
              </button>
            </FeatureGate>
          </div>
        </form>
      </div>

      {/* Ledger Entries */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Ledger Entries</h3>
          <Link
            to={`/erp/inventory/ledger?itemId=${id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View full ledger
          </Link>
        </div>
        {ledgerEntries.length === 0 ? (
          <p className="text-sm text-gray-500">No ledger activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {entry.transactionAt ? new Date(entry.transactionAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.location || 'MAIN'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatLedgerType(entry.entryType)}</td>
                    <td className={`px-4 py-2 text-sm font-semibold ${entry.quantityChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {entry.quantityChange}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{entry.balanceAfter}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ledgerTotalPages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => setLedgerPage(Math.max(0, ledgerPage - 1))}
              disabled={ledgerPage === 0}
              className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {ledgerPage + 1} of {ledgerTotalPages}
            </span>
            <button
              onClick={() => setLedgerPage(Math.min(ledgerTotalPages - 1, ledgerPage + 1))}
              disabled={ledgerPage >= ledgerTotalPages - 1}
              className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Audit Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.createdAt ? new Date(inventoryItem.createdAt).toLocaleString() : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {inventoryItem.updatedAt ? new Date(inventoryItem.updatedAt).toLocaleString() : 'Unknown'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default InventoryDetail
