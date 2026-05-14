import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import { employeeApi, leaveRequestApi } from '../../api/hrApi'
import { Employee, LeaveRequest, LeaveStatus, LeaveType } from '../../types/hr'

const STATUS_OPTIONS: LeaveStatus[] = ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED']
const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT']
const SORT_OPTIONS = [
  { label: 'Newest start date', value: 'startDate,desc' },
  { label: 'Oldest start date', value: 'startDate,asc' },
  { label: 'Status (A-Z)', value: 'status,asc' },
]

const LeaveRequestListPage: React.FC = () => {
  const navigate = useNavigate()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<LeaveType | ''>('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('startDate,desc')

  useEffect(() => {
    fetchLeaveRequests()
  }, [page, pageSize, search, statusFilter, typeFilter, employeeFilter, startDate, endDate, sort])

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

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await leaveRequestApi.getAll(page, pageSize, {
        search,
        status: statusFilter || undefined,
        leaveType: typeFilter || undefined,
        employeeId: employeeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sort || undefined,
      })
      const data = response.data.data
      if (data?.content) {
        setLeaveRequests(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else {
        setLeaveRequests([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to load leave requests:', error)
      toast.error('Failed to load leave requests')
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

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => map.set(employee.id, employee))
    return map
  }, [employees])

  const formatEmployee = (employeeId: string) => {
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/leave-requests/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Leave Request
          </Link>
        </FeatureGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search notes"
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <select
          value={employeeFilter}
          onChange={(event) => {
            setEmployeeFilter(event.target.value)
            setPage(0)
          }}
          className="min-w-[200px] rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as LeaveStatus | '')
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
        <select
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value as LeaveType | '')
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
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
            setSearchInput('')
            setEmployeeFilter('')
            setStatusFilter('')
            setTypeFilter('')
            setStartDate('')
            setEndDate('')
            setSort('startDate,desc')
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End</th>
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
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/hr/leave-requests/${request.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-900">{formatEmployee(request.employeeId)}</td>
                    <td className="px-4 py-3 text-gray-600">{request.leaveType}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{request.status}</td>
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

export default LeaveRequestListPage
