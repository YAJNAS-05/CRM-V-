import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import { Employee, Timesheet } from '../../types/hr'

const TimesheetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [approverId, setApproverId] = useState('')

  useEffect(() => {
    if (id) {
      fetchTimesheet(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchTimesheet = async (timesheetId: string) => {
    try {
      setLoading(true)
      const response = await timesheetApi.getById(timesheetId)
      setTimesheet(response.data.data || null)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
      toast.error('Failed to load timesheet')
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

  const handleSubmit = async () => {
    if (!id) return
    try {
      const response = await timesheetApi.submit(id)
      setTimesheet(response.data.data || null)
      toast.success('Timesheet submitted')
    } catch (error) {
      console.error('Failed to submit timesheet:', error)
      toast.error('Failed to submit timesheet')
    }
  }

  const handleApprove = async () => {
    if (!id) return
    if (!approverId) {
      toast.error('Approver ID is required')
      return
    }

    try {
      const response = await timesheetApi.approve(id, approverId)
      setTimesheet(response.data.data || null)
      toast.success('Timesheet approved')
    } catch (error) {
      console.error('Failed to approve timesheet:', error)
      toast.error('Failed to approve timesheet')
    }
  }

  const employeeName = timesheet
    ? employees.find((employee) => employee.id === timesheet.employeeId)
    : null

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!timesheet) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Timesheet not found.</div>
        <Link to="/hr/timesheets" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Timesheets
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
          <p className="text-sm text-gray-500">Status: {timesheet.status}</p>
        </div>
        <Link
          to={`/hr/timesheets/${timesheet.id}/edit`}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Edit
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Employee</p>
          <p className="text-gray-900">
            {employeeName ? `${employeeName.firstName} ${employeeName.lastName}` : timesheet.employeeId}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Work Date</p>
          <p className="text-gray-900">{new Date(timesheet.workDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hours Worked</p>
          <p className="text-gray-900">{timesheet.hoursWorked ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Field Job ID</p>
          <p className="text-gray-900">{timesheet.fieldJobId || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-900">{timesheet.notes || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Submit Timesheet
          </button>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Approver employee ID"
            />
            <button
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Approve Timesheet
            </button>
          </div>
        </div>
      </div>

      <Link to="/hr/timesheets" className="text-sm text-gray-600 hover:text-gray-900">
        Back to Timesheets
      </Link>
    </div>
  )
}

export default TimesheetDetailPage
