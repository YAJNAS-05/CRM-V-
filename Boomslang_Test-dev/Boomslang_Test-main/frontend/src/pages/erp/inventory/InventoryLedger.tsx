import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { inventoryApi } from '../../../api/erpApi'
import { InventoryItem, InventoryLedgerEntry } from '../../../types/erp'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const PAGE_SIZE = 20

const InventoryLedger: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [entries, setEntries] = useState<InventoryLedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [itemIdFilter, setItemIdFilter] = useState(searchParams.get('itemId') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    fetchLedger()
  }, [itemIdFilter, locationFilter, currentPage])

  const fetchItems = async () => {
    try {
      const response = await inventoryApi.getAll(0, 200)
      if (response.success) {
        setItems(response.data?.content || [])
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      toast.error('Failed to load inventory items')
    }
  }

  const fetchLedger = async () => {
    try {
      setLoading(true)
      const response = await inventoryApi.getLedger({
        itemId: itemIdFilter || undefined,
        location: itemIdFilter ? undefined : locationFilter || undefined,
        page: currentPage,
        size: PAGE_SIZE,
      })

      if (response.success) {
        setEntries(response.data?.content || [])
        setTotalPages(response.data?.totalPages || 0)
      }
    } catch (error) {
      console.error('Error fetching inventory ledger:', error)
      toast.error('Failed to load inventory ledger')
    } finally {
      setLoading(false)
    }
  }

  const formatLedgerType = (entryType: string) =>
    entryType
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  const itemLookup = useMemo(() => {
    const map = new Map<string, InventoryItem>()
    items.forEach((item) => map.set(item.id, item))
    return map
  }, [items])

  const handleClearFilters = () => {
    setItemIdFilter('')
    setLocationFilter('')
    setCurrentPage(0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/erp/inventory" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Ledger</h1>
            <p className="text-sm text-gray-600">Track stock movements across all locations.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Item</label>
            <select
              value={itemIdFilter}
              onChange={(event) => {
                setItemIdFilter(event.target.value)
                setCurrentPage(0)
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Items</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value)
                setCurrentPage(0)
              }}
              placeholder="All locations"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!!itemIdFilter}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6">Loading ledger entries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => {
                  const item = itemLookup.get(entry.itemId)
                  return (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {entry.transactionAt ? new Date(entry.transactionAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item ? (
                          <div>
                            <div className="font-medium">{item.itemCode}</div>
                            <div className="text-xs text-gray-500">{item.name}</div>
                          </div>
                        ) : (
                          entry.itemId
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entry.location || 'MAIN'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatLedgerType(entry.entryType)}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${entry.quantityChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {entry.quantityChange}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{entry.balanceAfter}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.notes || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-500">No ledger entries found.</div>
            )}
          </div>
        )}
      </div>

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
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default InventoryLedger
