import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import { payrollApi } from '../../api/hrApi'
import { PayrollRun, PayrollRunStatus } from '../../types/hr'

const STATUS_OPTIONS: PayrollRunStatus[] = ['DRAFT', 'APPROVED', 'PAID']
const SORT_OPTIONS = [
  { label: 'Newest period end', value: 'periodEnd,desc' },
  { label: 'Oldest period end', value: 'periodEnd,asc' },
  { label: 'Run date (newest)', value: 'runDate,desc' },
]

const PayrollRunListPage: React.FC = () => {
  const navigate = useNavigate()
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<PayrollRunStatus | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('periodEnd,desc')

  useEffect(() => {
    fetchRuns()
  }, [page, pageSize, statusFilter, startDate, endDate, sort])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      const response = await payrollApi.getRuns(page, pageSize, {
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sort || undefined,
      })
      const data = response.data.data
      if (data?.content) {
        setRuns(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else {
        setRuns([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to load payroll runs:', error)
      toast.error('Failed to load payroll runs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Runs</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/payroll-runs/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Payroll Run
          </Link>
        </FeatureGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as PayrollRunStatus | '')
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value)
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value)
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setStatusFilter('')
            setStartDate('')
            setEndDate('')
            setSort('periodEnd,desc')
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period End</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Run Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-gray-500">
                    No payroll runs found
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr
                    key={run.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/hr/payroll-runs/${run.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-600">{new Date(run.periodStart).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(run.periodEnd).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600">{run.status}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {run.runDate ? new Date(run.runDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} of {totalItems}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(0)
                }}
                className="ml-2 border border-gray-200 rounded px-2 py-1 text-xs"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PayrollRunListPage
