import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FeatureGate } from '../../components/rbac'
import { employeeApi, reimbursementApi } from '../../api/hrApi'
import { Employee, ReimbursementRequest, ReimbursementStatus } from '../../types/hr'

const STATUS_OPTIONS: ReimbursementStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']
const SORT_OPTIONS = [
  { label: 'Newest request date', value: 'requestDate,desc' },
  { label: 'Oldest request date', value: 'requestDate,asc' },
  { label: 'Amount (high to low)', value: 'amount,desc' },
]

const ReimbursementListPage: React.FC = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<ReimbursementRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReimbursementStatus | ''>('')
  const [requesterFilter, setRequesterFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('requestDate,desc')

  useEffect(() => {
    fetchRequests()
  }, [page, pageSize, search, statusFilter, requesterFilter, startDate, endDate, sort])

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await reimbursementApi.getAll(page, pageSize, {
        search,
        status: statusFilter || undefined,
        requestedBy: requesterFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sort || undefined,
      })
      const data = response.data.data
      if (data?.content) {
        setRequests(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else {
        setRequests([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to load reimbursements:', error)
      toast.error('Failed to load reimbursements')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200)
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const employeeByUserId = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => {
      if (employee.userId) {
        map.set(employee.userId, employee)
      }
    })
    return map
  }, [employees])

  const formatRequester = (request: ReimbursementRequest) => {
    const employee = employeeByUserId.get(request.requestedBy)
    if (employee) return `${employee.firstName} ${employee.lastName}`
    return request.requesterEmail || request.requestedBy
  }

  const formatCurrency = (value: number, currency?: string | null) => {
    const v = Number(value || 0)
    return `${currency || 'AUD'} ${v.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Employee expenses</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Reimbursements</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/reimbursements/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Request
          </Link>
        </FeatureGate>
        </div>
      </div>

      <div className="finance-toolbar flex flex-wrap gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search category, description, requester"
            className="pm-input text-sm"
          />
        </div>
        <select
          value={requesterFilter}
          onChange={(event) => {
            setRequesterFilter(event.target.value)
            setPage(0)
          }}
          className="pm-select min-w-[200px] text-sm"
        >
          <option value="">All employees</option>
          {employees
            .filter((employee) => employee.userId)
            .map((employee) => (
              <option key={employee.id} value={employee.userId || ''}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as ReimbursementStatus | '')
            setPage(0)
          }}
          className="pm-select text-sm"
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
          className="pm-input max-w-[170px] text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value)
            setPage(0)
          }}
          className="pm-input max-w-[170px] text-sm"
        />
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
            setPage(0)
          }}
          className="pm-select text-sm"
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
            setRequesterFilter('')
            setStatusFilter('')
            setStartDate('')
            setEndDate('')
            setSort('requestDate,desc')
            setPage(0)
          }}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div className="finance-table-shell">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    No reimbursements found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/hr/reimbursements/${request.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-900">{formatRequester(request)}</td>
                    <td className="px-4 py-3 text-gray-600">{request.category}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(request.amount, request.currency)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{request.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="finance-toolbar flex items-center justify-between px-4 py-3 border-t border-gray-200">
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

export default ReimbursementListPage
