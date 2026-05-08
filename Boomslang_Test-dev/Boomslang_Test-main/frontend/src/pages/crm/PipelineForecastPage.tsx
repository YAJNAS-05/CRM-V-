import { useState, useEffect } from 'react'
import { forecastApi } from '../../api/crmApi'
import { PipelineForecastDto, SalesVelocityDto } from '../../types/crm'
import { formatCurrency, formatDate } from '../../utils/formatters'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export default function PipelineForecastPage() {
  const [forecast, setForecast] = useState<PipelineForecastDto | null>(null)
  const [velocity, setVelocity] = useState<SalesVelocityDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      const [forecastRes, velocityRes] = await Promise.all([
        forecastApi.getPipelineForecast(undefined, dateRange.start || undefined, dateRange.end || undefined),
        forecastApi.getSalesVelocity(undefined, 6),
      ])
      setForecast(forecastRes.data.data)
      setVelocity(velocityRes.data.data)
    } catch (error) {
      console.error('Failed to load forecast data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const healthScoreColor =
    (forecast?.healthScore || 0) >= 80
      ? 'text-green-600 bg-green-50'
      : (forecast?.healthScore || 0) >= 60
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-600 bg-red-50'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Forecasting</h1>
          <p className="text-sm text-gray-500">AI-powered sales predictions and pipeline analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <button
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Health Score & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${healthScoreColor}`}>
          <p className="text-sm font-medium opacity-80">Pipeline Health</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">{forecast?.healthScore || 0}</span>
            <span className="text-sm">/100</span>
          </div>
          <p className="text-xs mt-2 opacity-70">
            {forecast?.healthScore && forecast.healthScore >= 80
              ? 'Excellent pipeline health'
              : forecast?.healthScore && forecast.healthScore >= 60
              ? 'Good, room for improvement'
              : 'Needs attention'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Pipeline</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(forecast?.summary.totalPipelineValue || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{forecast?.summary.openDealCount || 0} open deals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Weighted Forecast</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {formatCurrency(forecast?.summary.weightedForecast || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Probability-adjusted</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Best Case</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(forecast?.summary.bestCaseForecast || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Optimistic scenario</p>
        </div>
      </div>

      {/* Velocity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Avg Deal Size</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(velocity?.averageDealSize || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Win Rate</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {((velocity?.winRate || 0) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Days to Close</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {Math.round(velocity?.averageDaysToClose || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Revenue Velocity</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(velocity?.revenueVelocity || 0)}/mo
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Opportunities</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {velocity?.opportunitiesCreated || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecast?.byStage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="totalValue" name="Total Value" fill="#6366f1" />
              <Bar dataKey="weightedValue" name="Weighted Value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Forecast Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast?.byMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="yearMonth" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="totalValue" name="Total Value" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="weightedValue" name="Weighted Value" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Forecast */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(forecast?.byQuarter || []).map((q, idx) => (
            <div key={q.quarter} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{q.quarter}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(q.totalValue)}</p>
              <p className="text-xs text-gray-500 mt-1">{q.dealCount} deals</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min((q.weightedValue / q.totalValue) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-indigo-600 mt-1">
                Weighted: {formatCurrency(q.weightedValue)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {forecast?.recommendations && forecast.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            AI-Powered Recommendations
          </h3>
          <ul className="space-y-2">
            {forecast.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-xs font-medium flex-shrink-0">
                  {idx + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
