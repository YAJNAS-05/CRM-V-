import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FeatureGate } from '../../components/rbac'
import { employeeApi } from '../../api/hrApi'
import { Employee, EmployeeStatus, EmploymentType } from '../../types/hr'
import { toast } from 'sonner'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const STATUS_OPTIONS: EmployeeStatus[] = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']
const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt,desc' },
  { label: 'Last name (A-Z)', value: 'lastName,asc' },
  { label: 'Last name (Z-A)', value: 'lastName,desc' },
  { label: 'Hire date (newest)', value: 'hireDate,desc' },
  { label: 'Hire date (oldest)', value: 'hireDate,asc' },
]

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State for filters and pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | ''>('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | ''>('')
  const [sort, setSort] = useState('createdAt,desc')

  // React Query for fetching employees
  const { data: employeesData, isLoading, error, refetch } = useQuery({
    queryKey: ['employees', page, pageSize, search, statusFilter, employmentTypeFilter, sort],
    queryFn: async () => {
      const response = await employeeApi.getAll(page, pageSize, {
        search,
        status: statusFilter || undefined,
        employmentType: employmentTypeFilter || undefined,
        sort: sort || undefined,
      })
      return response.data.data
    },
    onError: (error) => {
      console.error('Failed to load employees:', error)
      toast.error('Failed to load employees')
    }
  })

  // Extract data from React Query result
  const employees = employeesData?.content || []
  const totalPages = employeesData?.totalPages || 1
  const totalItems = employeesData?.totalElements || 0

  // Debounced search effect
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchInput])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/employees/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Employee
          </Link>
        </FeatureGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="min-w-[220px] flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, code, or email"
            className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as EmployeeStatus | '')
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
          value={employmentTypeFilter}
          onChange={(event) => {
            setEmploymentTypeFilter(event.target.value as EmploymentType | '')
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All employment types</option>
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
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
            setStatusFilter('')
            setEmploymentTypeFilter('')
            setSort('createdAt,desc')
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hire Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/hr/employees/${employee.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">{employee.employeeCode}</td>
                    <td className="px-4 py-3">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{employee.email}</td>
                    <td className="px-4 py-3 text-gray-600">{employee.employmentType}</td>
                    <td className="px-4 py-3 text-gray-600">{employee.status || 'ACTIVE'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '—'}
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
                {PAGE_SIZE_OPTIONS.map((size) => (
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

export default EmployeeListPage
