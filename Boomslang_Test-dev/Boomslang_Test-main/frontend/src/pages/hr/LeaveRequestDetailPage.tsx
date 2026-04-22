import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, leaveRequestApi } from '../../api/hrApi'
import { Employee, LeaveRequest } from '../../types/hr'

const LeaveRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [approverId, setApproverId] = useState('')

  useEffect(() => {
    if (id) {
      fetchLeaveRequest(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchLeaveRequest = async (requestId: string) => {
    try {
      setLoading(true)
      const response = await leaveRequestApi.getById(requestId)
      setLeaveRequest(response.data.data || null)
    } catch (error) {
      console.error('Failed to load leave request:', error)
      toast.error('Failed to load leave request')
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

  const handleApprove = async () => {
    if (!id) return
    if (!approverId) {
      toast.error('Approver ID is required')
      return
    }

    try {
      const response = await leaveRequestApi.approve(id, approverId)
      setLeaveRequest(response.data.data || null)
      toast.success('Leave request approved')
    } catch (error) {
      console.error('Failed to approve leave request:', error)
      toast.error('Failed to approve leave request')
    }
  }

  const employeeName = leaveRequest
    ? employees.find((employee) => employee.id === leaveRequest.employeeId)
    : null

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!leaveRequest) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Leave request not found.</div>
        <Link to="/hr/leave-requests" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Leave Requests
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Request</h1>
          <p className="text-sm text-gray-500">Status: {leaveRequest.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/hr/leave-requests/${leaveRequest.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Edit
          </Link>
          <Link to="/hr/leave-requests" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Employee</p>
          <p className="text-gray-900">
            {employeeName ? `${employeeName.firstName} ${employeeName.lastName}` : leaveRequest.employeeId}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Leave Type</p>
          <p className="text-gray-900">{leaveRequest.leaveType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Start Date</p>
          <p className="text-gray-900">{new Date(leaveRequest.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">End Date</p>
          <p className="text-gray-900">{new Date(leaveRequest.endDate).toLocaleDateString()}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-900">{leaveRequest.notes || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Approved By (Employee ID)</label>
            <input
              type="text"
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter approver employee ID"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Approve Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveRequestDetailPage
