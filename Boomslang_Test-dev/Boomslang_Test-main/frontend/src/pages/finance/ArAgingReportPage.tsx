import { useState, useEffect } from 'react'
import { reportApi } from '../../api/financeApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { AlertCircle, Clock, CheckCircle, FileText, Download } from 'lucide-react'

interface ArAgingBucket {
  label: string
  outstandingAmount: number
  percentage: number
}

interface ArCustomerAging {
  customerId: string
  customerName: string
  currentAmount: number
  days1To30: number
  days31To60: number
  days61To90: number
  days91To120: number
  over120Days: number
  totalOutstanding: number
  invoiceCount: number
  averageDaysOverdue: number
  creditStatus: 'CURRENT' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL'
}

interface ArAgingReport {
  reportDate: string
  entityId?: string
  buckets: ArAgingBucket[]
  customerAging: ArCustomerAging[]
  totalOutstanding: number
  totalInvoiceCount: number
}

export default function ArAgingReportPage() {
  const [report, setReport] = useState<ArAgingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadReport()
  }, [asOfDate])

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await reportApi.getArAging()
      setReport(response.data.data)
    } catch (error) {
      console.error('Failed to load AR aging report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT':
        return 'bg-green-100 text-green-800'
      case 'LOW_RISK':
        return 'bg-blue-100 text-blue-800'
      case 'MODERATE_RISK':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH_RISK':
        return 'bg-orange-100 text-orange-800'
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBucketIcon = (label: string) => {
    if (label.includes('Current')) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (label.includes('1-30')) return <Clock className="w-5 h-5 text-blue-500" />
    if (label.includes('31-60')) return <Clock className="w-5 h-5 text-yellow-500" />
    if (label.includes('61-90')) return <AlertCircle className="w-5 h-5 text-orange-500" />
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AR Aging Report</h1>
          <p className="text-sm text-gray-500">Accounts Receivable aging analysis and customer credit status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">As of Date:</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={loadReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(report?.totalOutstanding || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{report?.totalInvoiceCount} invoices</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-sm text-green-600">Current</p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {formatCurrency(report?.buckets.find(b => b.label.includes('Current'))?.outstandingAmount || 0)}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <p className="text-sm text-yellow-600">1-60 Days Overdue</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">
            {formatCurrency(
              (report?.buckets.find(b => b.label.includes('1-30'))?.outstandingAmount || 0) +
              (report?.buckets.find(b => b.label.includes('31-60'))?.outstandingAmount || 0)
            )}
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-sm text-red-600">60+ Days Overdue</p>
          <p className="text-xl font-bold text-red-700 mt-1">
            {formatCurrency(
              (report?.buckets.find(b => b.label.includes('61-90'))?.outstandingAmount || 0) +
              (report?.buckets.find(b => b.label.includes('91-120'))?.outstandingAmount || 0) +
              (report?.buckets.find(b => b.label.includes('Over 120'))?.outstandingAmount || 0)
            )}
          </p>
        </div>
      </div>

      {/* Aging Buckets Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Buckets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {report?.buckets.map((bucket) => (
            <div key={bucket.label} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getBucketIcon(bucket.label)}
                <span className="text-xs font-medium text-gray-600">{bucket.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(bucket.outstandingAmount)}</p>
              <p className="text-xs text-gray-500">{bucket.percentage.toFixed(1)}% of total</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(bucket.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Aging Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Aging Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">1-30 Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">31-60 Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">61-90 Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">91-120 Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">120+ Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Days</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report?.customerAging.map((customer) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{customer.customerName}</p>
                    <p className="text-xs text-gray-500">{customer.invoiceCount} invoices</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(customer.currentAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(customer.days1To30)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(customer.days31To60)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(customer.days61To90)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(customer.days91To120)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-red-600">
                    {formatCurrency(customer.over120Days)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(customer.totalOutstanding)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {customer.averageDaysOverdue.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCreditStatusColor(customer.creditStatus)}`}>
                      {customer.creditStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
