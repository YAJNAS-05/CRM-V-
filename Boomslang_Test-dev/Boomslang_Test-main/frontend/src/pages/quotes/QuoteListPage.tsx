import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quoteApi } from '../../api/crmApi'
import { Quote } from '../../types/crm'
import { toast } from 'sonner'

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    fetchQuotes()
  }, [page])

  const fetchQuotes = async () => {
    try {
      setIsLoading(true)
      const response = await quoteApi.getAll(page, pageSize)
      setQuotes(response.data.data?.content || [])
    } catch (error) {
      toast.error('Failed to load quotes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    try {
      await quoteApi.delete(id)
      toast.success('Quote deleted successfully')
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete quote')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <button
          onClick={() => navigate('/crm/quotes/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          New Quote
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Quote #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Total Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Issued Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Expiry Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  No quotes found
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{quote.quoteNumber}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {quote.currency} {quote.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{quote.issuedDate}</td>
                  <td className="px-6 py-4 text-sm">{quote.expiryDate}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button
                      onClick={() => navigate(`/crm/quotes/${quote.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={quotes.length < pageSize}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default QuoteListPage
