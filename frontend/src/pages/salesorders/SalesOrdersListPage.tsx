import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { salesOrderApi } from '../../api/erpApi'
import { SalesOrder } from '../../types/erp'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'
import { FeatureGate } from '../../components/rbac'

type LoadState = 'idle' | 'loading' | 'error'

export default function SalesOrdersListPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    void fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoadState('loading')
      setErrorMessage('')
      const response = await salesOrderApi.getAll(0, 200)
      const rows = response?.data?.data?.content || response?.data?.content || []
      setOrders(Array.isArray(rows) ? rows : [])
      setLoadState('idle')
    } catch (error: any) {
      console.error('Failed to fetch sales orders:', error)
      setErrorMessage(error?.message || 'Failed to load sales orders')
      setLoadState('error')
    }
  }

  const handleExport = () => {
    const rows = filteredOrders.map((order) => ({
      SONumber: order.soNumber,
      AccountId: order.accountId,
      Status: order.status,
      OrderDate: order.orderDate || '',
      ExpectedDelivery: order.expectedDelivery || '',
      ActualDelivery: order.actualDelivery || '',
      DestinationCountry: order.destinationCountry || '',
      Incoterms: order.incoterms || '',
      TotalAmount: order.totalAmount || 0,
      Currency: order.currency || '',
      Notes: order.notes || '',
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Sales_Orders_${getExportDateStamp()}.xlsx`,
      sheetName: 'Sales Orders',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      INSTALLED: 'bg-emerald-100 text-emerald-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const statuses = useMemo(() => {
    const values = Array.from(new Set(orders.map((order) => order.status).filter(Boolean)))
    return values.sort()
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders
      .filter((order) => (statusFilter === 'ALL' ? true : order.status === statusFilter))
      .filter((order) => {
        if (!q) return true
        const content = [order.soNumber, order.accountId, order.destinationCountry, order.currency, order.notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return content.includes(q)
      })
  }, [orders, query, statusFilter])

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <FeatureGate requiredPermission="ERP_CREATE">
            <button onClick={() => navigate('/erp/sales-orders/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create SO</button>
          </FeatureGate>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search SO number, account, destination..."
          className="rounded border px-3 py-2"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded border px-3 py-2">
          <option value="ALL">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <div className="rounded border px-3 py-2 text-sm text-slate-600 bg-slate-50">Showing {filteredOrders.length} of {orders.length}</div>
      </div>

      {loadState === 'loading' && <div className="p-6 rounded border bg-white">Loading sales orders...</div>}

      {loadState === 'error' && (
        <div className="p-6 rounded border border-rose-200 bg-rose-50 text-rose-700">
          <p>{errorMessage || 'Failed to load sales orders.'}</p>
          <button className="mt-2 px-3 py-1 rounded border border-rose-300" onClick={() => void fetchOrders()}>
            Retry
          </button>
        </div>
      )}

      {loadState === 'idle' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/erp/sales-orders/${order.id}`)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline">{order.soNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.destinationCountry || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.totalAmount ? `${order.currency} ${order.totalAmount.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm" onClick={(event) => event.stopPropagation()}>
                    <FeatureGate requiredPermission="ERP_EDIT">
                      <button
                        onClick={() => navigate(`/erp/sales-orders/${order.id}/edit`)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </FeatureGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="text-center py-12 text-gray-500">No sales orders found</div>}
        </div>
      )}
    </div>
  )
}
