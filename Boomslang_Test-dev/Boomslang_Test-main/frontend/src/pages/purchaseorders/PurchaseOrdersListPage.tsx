import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchaseOrderApi } from '../../api/erpApi'
import { PurchaseOrder } from '../../types/erp'
import { exportToExcel, getExportDateStamp } from '../../utils/exportToExcel'

export default function PurchaseOrdersListPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrderApi.getAll(0, 100)
      if (response.data.success) {
        setOrders(response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const rows = orders.map((order) => ({
      PONumber: order.poNumber,
      SupplierId: order.supplierId,
      Status: order.status,
      PODate: order.poDate || '',
      OrderDate: order.orderDate || '',
      ExpectedDelivery: order.expectedDelivery || '',
      ActualDelivery: order.actualDelivery || '',
      TotalAmount: order.totalAmount || 0,
      Currency: order.currency || '',
      PaymentMethod: order.paymentMethod || '',
      PaymentTerms: order.paymentTerms || '',
      Notes: order.notes || '',
    }))

    exportToExcel(rows, {
      fileName: `EVERX_Purchase_Orders_${getExportDateStamp()}.xlsx`,
      sheetName: 'Purchase Orders',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      RECEIVED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="p-6">Loading purchase orders...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={orders.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <button onClick={() => navigate('/erp/purchase-orders/new')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create PO</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/erp/purchase-orders/${order.id}`)}
              >
                <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline">{order.poNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.totalAmount ? `${order.currency} ${order.totalAmount.toLocaleString()}` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/erp/purchase-orders/${order.id}/edit`)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-gray-500">No purchase orders found</div>}
      </div>
    </div>
  )
}
