import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { employeeApi, timesheetApi } from '../../api/hrApi'
import {
  CreateTimesheetRequest,
  Employee,
  Timesheet,
  TimesheetStatus,
} from '../../types/hr'
import CustomFieldsPanel from '../../components/config/CustomFieldsPanel'
import { useCustomFields } from '../../hooks/useCustomFields'
import { useLayoutConfig } from '../../hooks/useLayoutConfig'
import { useOptionSet } from '../../hooks/useOptionSet'

const timesheetSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  fieldJobId: z.string().optional().nullable(),
  workDate: z.string().min(1, 'Work date is required'),
  hoursWorked: z.number().positive('Hours must be greater than 0').max(24, 'Hours cannot exceed 24').optional(),
  notes: z.string().optional(),
})

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const { options: statusOptions } = useOptionSet({
    module: 'HR',
    entity: 'TIMESHEET',
    field: 'status',
    fallbackValues: TIMESHEET_STATUSES,
  })
  const { definitions: customFieldDefinitions, values: customFieldValues, setValue: setCustomFieldValue, save: saveCustomFields, isLoading: customFieldsLoading } = useCustomFields({
    module: 'HR',
    entity: 'TIMESHEET',
    entityId: id,
  })
  const { layout: timesheetLayout } = useLayoutConfig({
    module: 'HR',
    entity: 'TIMESHEET',
  })

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
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      hoursWorked: value === '' ? undefined : Number(value),
    }))
    if (fieldErrors.hoursWorked) {
      setFieldErrors((prev) => ({ ...prev, hoursWorked: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = timesheetSchema.safeParse(formData)
    if (!result.success) {
      const errs: Partial<Record<string, string>> = {}
      for (const issue of result.error.errors) {
        const key = issue.path[0] as string
        if (key && !errs[key]) errs[key] = issue.message
      }
      setFieldErrors(errs)
      toast.error('Please fix the highlighted fields')
      return
    }
    setFieldErrors({})

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
        try {
          await saveCustomFields(id)
        } catch {
          toast.error('Timesheet updated, but custom fields failed to save')
        }
        toast.success('Timesheet updated')
      } else {
        const response = await timesheetApi.create({
          ...formData,
          fieldJobId: formData.fieldJobId || null,
        })
        const savedTimesheet = response.data.data
        if (savedTimesheet?.id) {
          try {
            await saveCustomFields(savedTimesheet.id)
          } catch {
            toast.error('Timesheet created, but custom fields failed to save')
          }
        }
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
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
            {fieldErrors.employeeId && <p className="mt-1 text-xs text-red-600">{fieldErrors.employeeId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Date *</label>
            <input
              type="date"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.workDate ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.workDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.workDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked ?? ''}
              onChange={handleHoursChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.hoursWorked ? 'border-red-500' : 'border-gray-300'}`}
            />
            {fieldErrors.hoursWorked && <p className="mt-1 text-xs text-red-600">{fieldErrors.hoursWorked}</p>}
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
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label || option.value}
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

        <CustomFieldsPanel
          title="Custom Timesheet Fields"
          definitions={customFieldDefinitions}
          values={customFieldValues}
          onChange={setCustomFieldValue}
          isLoading={customFieldsLoading}
          layout={timesheetLayout}
        />

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
