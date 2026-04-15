import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tradeShowApi } from '../../api/crmApi'
import { TradeShow } from '../../types/crm'

export default function TradeShowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tradeShow, setTradeShow] = useState<TradeShow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchTradeShow()
    }
  }, [id])

  const fetchTradeShow = async () => {
    try {
      setLoading(true)
      const response = await tradeShowApi.getById(id!)
      if (response.data.success) {
        setTradeShow(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch trade show:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading trade show details...</div>
  }

  if (!tradeShow) {
    return <div className="p-6">Trade show not found</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tradeshows')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Trade Shows
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">{tradeShow.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{tradeShow.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="text-sm text-gray-900">{tradeShow.country}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="text-sm text-gray-900">{new Date(tradeShow.startDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="text-sm text-gray-900">{new Date(tradeShow.endDate).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Leads Captured</dt>
                <dd className="text-sm text-gray-900">{tradeShow.leadsCaptured || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estimated ROI</dt>
                <dd className="text-sm text-gray-900">
                  {tradeShow.estimatedRoi ? `$${tradeShow.estimatedRoi.toLocaleString()}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Attendees</dt>
                <dd className="text-sm text-gray-900">{tradeShow.attendees?.length || 0} team members</dd>
              </div>
            </dl>
          </div>
        </div>

        {tradeShow.notes && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{tradeShow.notes}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/tradeshows/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Trade Show
          </button>
        </div>
      </div>
    </div>
  )
}
