import { useState, useEffect } from 'react'
import { tradeShowApi } from '../../api/crmApi'
import { TradeShow } from '../../types/crm'
import { useNavigate } from 'react-router-dom'

export default function TradeShowListPage() {
  const [tradeShows, setTradeShows] = useState<TradeShow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTradeShows()
  }, [filter])

  const fetchTradeShows = async () => {
    try {
      setLoading(true)
      const response = filter === 'upcoming'
        ? await tradeShowApi.getUpcoming()
        : await tradeShowApi.getAll(0, 100)
      
      if (response.data.success) {
        setTradeShows(filter === 'upcoming' ? response.data.data : response.data.data.content)
      }
    } catch (error) {
      console.error('Failed to fetch trade shows:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">Upcoming</span>
    } else if (now >= start && now <= end) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Ongoing</span>
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">Completed</span>
    }
  }

  if (loading) {
    return <div className="p-6">Loading trade shows...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Shows</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            All Trade Shows
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded ${
              filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tradeShows.map((tradeShow) => (
          <div
            key={tradeShow.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/tradeshows/${tradeShow.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{tradeShow.name}</h3>
              {getStatusBadge(tradeShow.startDate, tradeShow.endDate)}
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tradeShow.location}, {tradeShow.country}
              </div>

              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(tradeShow.startDate).toLocaleDateString()} - {new Date(tradeShow.endDate).toLocaleDateString()}
              </div>

              {tradeShow.leadsCaptured !== undefined && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {tradeShow.leadsCaptured} leads captured
                </div>
              )}

              {tradeShow.estimatedRoi !== undefined && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ROI: ${tradeShow.estimatedRoi.toLocaleString()}
                </div>
              )}
            </div>

            {tradeShow.notes && (
              <p className="mt-4 text-sm text-gray-500 line-clamp-2">{tradeShow.notes}</p>
            )}
          </div>
        ))}
      </div>

      {tradeShows.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          No trade shows found
        </div>
      )}
    </div>
  )
}
