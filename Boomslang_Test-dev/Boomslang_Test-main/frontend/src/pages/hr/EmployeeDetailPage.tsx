import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi } from '../../api/hrApi'
import { Employee } from '../../types/hr'

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchEmployee(id)
    }
  }, [id])

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true)
      const response = await employeeApi.getById(employeeId)
      setEmployee(response.data.data || null)
    } catch (error) {
      console.error('Failed to load employee:', error)
      toast.error('Failed to load employee')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Delete this employee?')) return

    try {
      await employeeApi.delete(id)
      toast.success('Employee deleted')
      navigate('/hr/employees')
    } catch (error) {
      console.error('Failed to delete employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Employee not found.</div>
        <Link to="/hr/employees" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-gray-500">Employee Code: {employee.employeeCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/hr/employees/${employee.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
          <Link to="/hr/employees" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{employee.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{employee.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Employment Type</dt>
              <dd className="text-gray-900">{employee.employmentType}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="text-gray-900">{employee.status || 'ACTIVE'}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Department</dt>
              <dd className="text-gray-900">{employee.departmentId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Position</dt>
              <dd className="text-gray-900">{employee.positionId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Manager</dt>
              <dd className="text-gray-900">{employee.managerId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Hire Date</dt>
              <dd className="text-gray-900">
                {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Termination Date</dt>
              <dd className="text-gray-900">
                {employee.terminationDate ? new Date(employee.terminationDate).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailPage
