import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import { Employee, Timesheet, TimesheetStatus } from '../../types/hr'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionLabel } from '../../utils/optionSet'

const STATUS_OPTIONS: TimesheetStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
const SORT_OPTIONS = [
  { label: 'Newest work date', value: 'workDate,desc' },
  { label: 'Oldest work date', value: 'workDate,asc' },
  { label: 'Hours (high to low)', value: 'hoursWorked,desc' },
]

const TimesheetListPage: React.FC = () => {
  const navigate = useNavigate()
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | ''>('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('workDate,desc')
  const { options: statusOptions } = useOptionSet({
    module: 'HR',
    entity: 'TIMESHEET',
    field: 'status',
    fallbackValues: STATUS_OPTIONS,
  })

  useEffect(() => {
    fetchTimesheets()
  }, [page, pageSize, statusFilter, employeeFilter, startDate, endDate, sort])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const response = await timesheetApi.getAll(page, pageSize, {
        employeeId: employeeFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: sort || undefined,
      })
      const data = response.data.data
      if (data?.content) {
        setTimesheets(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else {
        setTimesheets([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (error) {
      console.error('Failed to load timesheets:', error)
      toast.error('Failed to load timesheets')
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
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <FeatureGate requiredPermission="HR_CREATE">
          <Link
            to="/hr/timesheets/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            New Timesheet
          </Link>
        </FeatureGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-4">
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
            setStatusFilter(event.target.value as TimesheetStatus | '')
            setPage(0)
          }}
          className="rounded border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label || option.value}
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
            setEmployeeFilter('')
            setStatusFilter('')
            setStartDate('')
            setEndDate('')
            setSort('workDate,desc')
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : timesheets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-gray-500">
                    No timesheets found
                  </td>
                </tr>
              ) : (
                timesheets.map((timesheet) => (
                  <tr
                    key={timesheet.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/hr/timesheets/${timesheet.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-900">{formatEmployee(timesheet.employeeId)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(timesheet.workDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{timesheet.hoursWorked ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{getOptionLabel(statusOptions, timesheet.status)}</td>
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

export default TimesheetListPage
