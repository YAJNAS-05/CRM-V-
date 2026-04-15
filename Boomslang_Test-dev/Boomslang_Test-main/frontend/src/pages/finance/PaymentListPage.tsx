import React, { useEffect, useState } from 'react'
import { paymentApi } from '../../api/financeApi'
import { Payment } from '../../types/finance'
import { toast } from 'sonner'

const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    fetchPayments()
  }, [page])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const response = await paymentApi.getAll(page, pageSize)
      setPayments(response.data.data?.content || [])
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display">Transaction History</h1>
        <div className="text-sm text-gray-500">Total Records: {payments.length}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">AUD Equiv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                  <p className="text-lg">No payments recorded yet.</p>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{payment.paymentDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 border text-[10px] font-bold uppercase">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic truncate max-w-[200px]">
                    {payment.reference || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-gray-900">
                      {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="ml-1 text-[10px] font-bold text-gray-400">{payment.currency}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="group relative inline-block">
                      <span className="text-sm font-medium text-indigo-600 border-b border-dotted border-indigo-300">
                        ${payment.audEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded -left-1/2 -top-8 whitespace-nowrap z-10 shadow-lg">
                        Rate: {payment.exchangeRate} AUD/{payment.currency}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 flex items-center gap-1 font-medium text-sm transition"
        >
          &larr; Earlier
        </button>
        <div className="bg-indigo-50 text-indigo-700 text-xs font-bold py-1 px-3 rounded-full border border-indigo-100">
          Page {page + 1}
        </div>
        <button
          onClick={() => setPage(page + 1)}
          disabled={payments.length < pageSize}
          className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 flex items-center gap-1 font-medium text-sm transition"
        >
          Later &rarr;
        </button>
      </div>
    </div>
  )
}

export default PaymentListPage
