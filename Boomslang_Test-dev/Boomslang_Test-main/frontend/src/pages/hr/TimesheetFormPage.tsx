import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import {
  CreateTimesheetRequest,
  Employee,
  Timesheet,
  TimesheetStatus,
} from '../../types/hr'

const TIMESHEET_STATUSES: TimesheetStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

const TimesheetFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState<CreateTimesheetRequest>({
    employeeId: '',
    fieldJobId: '',
    workDate: '',
    hoursWorked: undefined,
    notes: '',
  })
  const [status, setStatus] = useState<TimesheetStatus>('DRAFT')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      loadTimesheet(id)
    }
  }, [id, isEditing])

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200)
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
      toast.error('Failed to load employees')
    }
  }

  const loadTimesheet = async (timesheetId: string) => {
    try {
      setFetching(true)
      const response = await timesheetApi.getById(timesheetId)
      if (response.data.data) {
        const timesheet = response.data.data as Timesheet
        setFormData({
          employeeId: timesheet.employeeId,
          fieldJobId: timesheet.fieldJobId || '',
          workDate: timesheet.workDate,
          hoursWorked: timesheet.hoursWorked ?? undefined,
          notes: timesheet.notes || '',
        })
        setStatus(timesheet.status)
      }
    } catch (error) {
      console.error('Failed to load timesheet:', error)
      toast.error('Failed to load timesheet')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      hoursWorked: value === '' ? undefined : Number(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.workDate) {
      toast.error('Please complete required fields')
      return
    }

    try {
      setLoading(true)
      if (isEditing && id) {
        await timesheetApi.update(id, {
          fieldJobId: formData.fieldJobId || null,
          workDate: formData.workDate,
          hoursWorked: formData.hoursWorked,
          notes: formData.notes,
          status,
        })
        toast.success('Timesheet updated')
      } else {
        await timesheetApi.create({
          ...formData,
          fieldJobId: formData.fieldJobId || null,
        })
        toast.success('Timesheet created')
      }
      navigate('/hr/timesheets')
    } catch (error) {
      console.error('Failed to save timesheet:', error)
      toast.error('Failed to save timesheet')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Timesheet' : 'New Timesheet'}</h1>
          <p className="text-sm text-gray-500">Track time and approvals</p>
        </div>
        <Link to="/hr/timesheets" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Timesheets
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee *</label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Date *</label>
            <input
              type="date"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked ?? ''}
              onChange={handleHoursChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Field Job ID</label>
            <input
              type="text"
              name="fieldJobId"
              value={formData.fieldJobId || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TimesheetStatus)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {TIMESHEET_STATUSES.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Timesheet'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TimesheetFormPage
