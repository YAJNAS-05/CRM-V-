import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { departmentApi, employeeApi } from '../../api/hrApi'
import { Department, Employee } from '../../types/hr'
import { FeatureGate } from '../../components/rbac'

const DepartmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [department, setDepartment] = useState<Department | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchDepartment(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchDepartment = async (departmentId: string) => {
    try {
      setLoading(true)
      const response = await departmentApi.getById(departmentId)
      setDepartment(response.data.data || null)
    } catch (error) {
      console.error('Failed to load department:', error)
      toast.error('Failed to load department')
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

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Delete this department?')) return

    try {
      await departmentApi.delete(id)
      toast.success('Department deleted')
      navigate('/hr/departments')
    } catch (error) {
      console.error('Failed to delete department:', error)
      toast.error('Failed to delete department')
    }
  }

  const managerName = employees.find((emp) => emp.id === department?.managerEmployeeId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Department not found.</div>
        <Link to="/hr/departments" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Departments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
          <p className="text-sm text-gray-500">Department Code: {department.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <FeatureGate requiredPermission="HR_EDIT">
            <Link
              to={`/hr/departments/${department.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Edit
            </Link>
          </FeatureGate>
          <FeatureGate requiredPermission="HR_DELETE">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </FeatureGate>
          <Link to="/hr/departments" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Parent Department</p>
          <p className="text-gray-900">{department.parentDepartmentId || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Manager</p>
          <p className="text-gray-900">
            {managerName ? `${managerName.firstName} ${managerName.lastName}` : department.managerEmployeeId || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DepartmentDetailPage
