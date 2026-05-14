import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import { positionApi } from '../../api/hrApi'
import { Position } from '../../types/hr'

const SORT_OPTIONS = [
  { label: 'Title (A-Z)', value: 'title,asc' },
  { label: 'Title (Z-A)', value: 'title,desc' },
  { label: 'Grade (A-Z)', value: 'grade,asc' },
]

const PositionListPage: React.FC = () => {
  const navigate = useNavigate()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('title,asc')

  useEffect(() => {
    fetchPositions()
  }, [page, pageSize, search, sort])

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput])

  const fetchPositions = async () => {
    try {
      setLoading(true)
      const response = await positionApi.getAll(page, pageSize, {
        search,
        sort: sort || undefined,
      })
      const data = response.data.data
      if (data?.content) {
        setPositions(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else {
        setPositions([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to load positions:', error)
      toast.error('Failed to load positions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/positions/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Position
          </Link>
        </FeatureGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="min-w-[220px] flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search position"
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
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
            setSearchInput('')
            setSort('title,asc')
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Currency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : positions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    No positions found
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr
                    key={position.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/hr/positions/${position.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">{position.title}</td>
                    <td className="px-4 py-3 text-gray-600">{position.grade || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{position.minSalary ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{position.maxSalary ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{position.currency || '—'}</td>
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

export default PositionListPage
