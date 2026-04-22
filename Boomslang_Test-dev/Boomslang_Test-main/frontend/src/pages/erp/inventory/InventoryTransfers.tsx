import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { inventoryApi } from '../../../api/erpApi'
import { InventoryItem, InventoryTransfer } from '../../../types/erp'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const PAGE_SIZE = 20

const LOCATION_OPTIONS = [
  'Sydney AU',
  'Vista CA USA',
  'Kawasaki JP',
  'Australia',
  'USA',
  'Japan',
  'Germany',
  'UK',
  'India',
  'MAIN',
  'Other',
]

const InventoryTransfers: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [formItemId, setFormItemId] = useState(searchParams.get('itemId') || '')
  const [formFromLocation, setFormFromLocation] = useState('')
  const [formToLocation, setFormToLocation] = useState('')
  const [formQuantity, setFormQuantity] = useState('')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    fetchTransfers(currentPage)
  }, [currentPage])

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

  const fetchTransfers = async (page: number) => {
    try {
      setLoading(true)
      const response = await inventoryApi.getTransfers(page, PAGE_SIZE)
      if (response.success) {
        setTransfers(response.data?.content || [])
        setTotalPages(response.data?.totalPages || 0)
      }
    } catch (error) {
      console.error('Error fetching transfers:', error)
      toast.error('Failed to load inventory transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formItemId) {
      toast.error('Select an item to transfer')
      return
    }

    const quantityValue = Number(formQuantity)
    if (!quantityValue || quantityValue <= 0) {
      toast.error('Quantity must be greater than zero')
      return
    }

    if (!formFromLocation.trim() || !formToLocation.trim()) {
      toast.error('Both locations are required')
      return
    }

    if (formFromLocation.trim().toLowerCase() === formToLocation.trim().toLowerCase()) {
      toast.error('Destination must be different from source')
      return
    }

    try {
      setSubmitting(true)
      const response = await inventoryApi.createTransfer({
        itemId: formItemId,
        fromLocation: formFromLocation.trim(),
        toLocation: formToLocation.trim(),
        quantity: quantityValue,
        notes: formNotes.trim() || undefined,
      })

      if (response.success) {
        toast.success('Transfer posted successfully')
        setFormQuantity('')
        setFormNotes('')
        fetchTransfers(currentPage)
      }
    } catch (error) {
      console.error('Error posting transfer:', error)
      toast.error('Failed to post transfer')
    } finally {
      setSubmitting(false)
    }
  }

  const itemLookup = useMemo(() => {
    const map = new Map<string, InventoryItem>()
    items.forEach((item) => map.set(item.id, item))
    return map
  }, [items])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/erp/inventory" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Transfers</h1>
            <p className="text-sm text-gray-600">Move stock between locations.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Transfer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Item</label>
            <select
              value={formItemId}
              onChange={(event) => setFormItemId(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">From Location</label>
            <input
              list="inventory-locations"
              value={formFromLocation}
              onChange={(event) => setFormFromLocation(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Source"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">To Location</label>
            <input
              list="inventory-locations"
              value={formToLocation}
              onChange={(event) => setFormToLocation(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Destination"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={formQuantity}
              onChange={(event) => setFormQuantity(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              required
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(event) => setFormNotes(event.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes"
            />
          </div>
          <div className="md:col-span-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Transfer'}
            </button>
          </div>
        </form>
        <datalist id="inventory-locations">
          {LOCATION_OPTIONS.map((location) => (
            <option key={location} value={location} />
          ))}
        </datalist>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6">Loading transfers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => {
                  const item = itemLookup.get(transfer.itemId)
                  return (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{transfer.transferNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item ? (
                          <div>
                            <div className="font-medium">{item.itemCode}</div>
                            <div className="text-xs text-gray-500">{item.name}</div>
                          </div>
                        ) : (
                          transfer.itemId
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{transfer.fromLocation}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{transfer.toLocation}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{transfer.quantity}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transfer.postedAt ? new Date(transfer.postedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {transfers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No transfers recorded.</div>
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

export default InventoryTransfers
