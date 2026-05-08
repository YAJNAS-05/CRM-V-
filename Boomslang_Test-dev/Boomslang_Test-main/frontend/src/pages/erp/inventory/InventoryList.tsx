import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react'
import { inventoryApi } from '../../../api/erpApi'
import { InventoryItem, ReorderSuggestion } from '../../../types/erp'
import { ApiResponse } from '../../../types'
import { toast } from 'react-hot-toast'
import { exportToExcel, getExportDateStamp } from '../../../utils/exportToExcel'
import { FeatureGate } from '../../../components/rbac'

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

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt,desc' },
  { label: 'Name (A-Z)', value: 'name,asc' },
  { label: 'Code (A-Z)', value: 'itemCode,asc' },
  { label: 'Stock (high to low)', value: 'currentStock,desc' },
]

const InventoryList: React.FC = () => {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([])
  const [reorderLoading, setReorderLoading] = useState(false)
  const [sort, setSort] = useState('createdAt,desc')

  const pageSize = 20

  useEffect(() => {
    fetchInventory()
  }, [currentPage, categoryFilter, statusFilter, search, sort])

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim())
      setCurrentPage(0)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput])

  useEffect(() => {
    fetchReorderSuggestions()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response: ApiResponse<any> = await inventoryApi.getAll(currentPage, pageSize, {
        search,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        sort: sort || undefined,
      })

      if (response.success) {
        setInventory(response.data?.content || [])
        setTotalPages(response.data?.totalPages || 0)
      } else {
        setInventory([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory items')
    } finally {
      setLoading(false)
    }
  }

  const fetchReorderSuggestions = async () => {
    try {
      setReorderLoading(true)
      const response = await inventoryApi.getReorderSuggestions()
      if (response.success) {
        setReorderSuggestions(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching reorder suggestions:', error)
    } finally {
      setReorderLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return
    }

    try {
      await inventoryApi.delete(id)
      toast.success('Inventory item deleted successfully')
      fetchInventory()
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast.error('Failed to delete inventory item')
    }
  }

  const handleExport = () => {
    const rows = inventory.map((item) => ({
      ItemCode: item.itemCode,
      Name: item.name,
      Description: item.description || '',
      Category: item.category,
      Quantity: item.quantity,
      UnitOfMeasure: item.unitOfMeasure,
      MinStockLevel: item.minStockLevel,
      UnitPrice: item.unitPrice || 0,
      Location: item.location || '',
      Status: item.status,
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Inventory_${getExportDateStamp()}.xlsx`,
      sheetName: 'Inventory',
    })
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
    if (quantity <= 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' }
    if (quantity <= minStockLevel) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' }
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' }
  }

  if (loading) {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-2 h-6 w-6" />
            Inventory Management
          </h1>
          <p className="text-gray-600">Manage your inventory items and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/erp/inventory/ledger"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Ledger
          </Link>
          <Link
            to="/erp/inventory/transfers"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Transfers
          </Link>
          <button
            onClick={handleExport}
            disabled={inventory.length === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <FeatureGate requiredPermission="ERP_CREATE">
            <Link
              to="/erp/inventory/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </FeatureGate>
        </div>
      </div>

      {reorderSuggestions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Reorder Suggestions</h2>
              <p className="text-sm text-gray-600">Items below reorder point with suggested quantities.</p>
            </div>
            {reorderLoading && (
              <span className="text-xs text-gray-500">Refreshing...</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reorderSuggestions.map((suggestion) => (
                  <tr key={suggestion.itemId}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="font-medium">{suggestion.itemCode}</div>
                      <div className="text-xs text-gray-500">{suggestion.name}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{suggestion.currentStock}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{suggestion.reorderPoint}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{suggestion.suggestedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{suggestion.location || 'MAIN'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(0)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {INVENTORY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setCurrentPage(0)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setCategoryFilter('')
              setStatusFilter('')
              setCurrentPage(0)
              setSort('createdAt,desc')
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minStockLevel || 0)
                return (
                  <tr key={item.id} onClick={() => navigate(`/erp/inventory/${item.id}`)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                      {item.itemCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {item.quantity} {item.unitOfMeasure}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <FeatureGate requiredPermission="ERP_EDIT">
                          <Link
                            to={`/erp/inventory/${item.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </FeatureGate>
                        <FeatureGate requiredPermission="ERP_DELETE">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </FeatureGate>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {inventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first inventory item.
            </p>
            <div className="mt-6">
              <FeatureGate requiredPermission="ERP_CREATE">
                <Link
                  to="/erp/inventory/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Link>
              </FeatureGate>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default InventoryList
