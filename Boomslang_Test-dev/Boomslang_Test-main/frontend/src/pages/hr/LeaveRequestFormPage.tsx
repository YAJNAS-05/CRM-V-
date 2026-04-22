import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, leaveRequestApi } from '../../api/hrApi'
import {
  CreateLeaveRequest,
  Employee,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from '../../types/hr'

const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT']
const LEAVE_STATUSES: LeaveStatus[] = ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED']

const LeaveRequestFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    employeeId: '',
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    notes: '',
  })
  const [status, setStatus] = useState<LeaveStatus>('REQUESTED')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      loadLeaveRequest(id)
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

  const loadLeaveRequest = async (requestId: string) => {
    try {
      setFetching(true)
      const response = await leaveRequestApi.getById(requestId)
      if (response.data.data) {
        const request = response.data.data as LeaveRequest
        setFormData({
          employeeId: request.employeeId,
          leaveType: request.leaveType,
          startDate: request.startDate,
          endDate: request.endDate,
          notes: request.notes || '',
        })
        setStatus(request.status)
      }
    } catch (error) {
      console.error('Failed to load leave request:', error)
      toast.error('Failed to load leave request')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      toast.error('Please complete all required fields')
      return
    }

    try {
      setLoading(true)
      if (isEditing && id) {
        await leaveRequestApi.update(id, {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          notes: formData.notes,
          status,
        })
        toast.success('Leave request updated')
      } else {
        await leaveRequestApi.create(formData)
        toast.success('Leave request created')
      }
      navigate('/hr/leave-requests')
    } catch (error) {
      console.error('Failed to save leave request:', error)
      toast.error('Failed to save leave request')
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
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Leave Request' : 'New Leave Request'}</h1>
          <p className="text-sm text-gray-500">Capture leave requests and approvals</p>
        </div>
        <Link to="/hr/leave-requests" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Leave Requests
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
            <label className="block text-sm font-medium text-gray-700">Leave Type *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeaveStatus)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {LEAVE_STATUSES.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption.replace('_', ' ')}
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
            {loading ? 'Saving...' : 'Save Leave Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeaveRequestFormPage
