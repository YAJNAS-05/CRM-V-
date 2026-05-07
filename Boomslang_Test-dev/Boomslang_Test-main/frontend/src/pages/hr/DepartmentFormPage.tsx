import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { departmentApi, employeeApi } from '../../api/hrApi'
import { CreateDepartmentRequest, Department, Employee } from '../../types/hr'

const departmentSchema = z.object({
  code: z.string().min(1, 'Department code is required').max(50, 'Code must be under 50 characters'),
  name: z.string().min(1, 'Department name is required').max(100, 'Name must be under 100 characters'),
  parentDepartmentId: z.string().optional().nullable(),
  managerEmployeeId: z.string().optional().nullable(),
})

const DepartmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    code: '',
    name: '',
    parentDepartmentId: '',
    managerEmployeeId: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      loadDepartment(id)
    }
  }, [id, isEditing])

  const loadLookups = async () => {
    try {
      const [deptResponse, empResponse] = await Promise.all([
        departmentApi.getAll(0, 200),
        employeeApi.getAll(0, 200),
      ])
      setDepartments(deptResponse.data.data?.content || [])
      setEmployees(empResponse.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load lookups:', error)
      toast.error('Failed to load lookup data')
    }
  }

  const loadDepartment = async (departmentId: string) => {
    try {
      setFetching(true)
      const response = await departmentApi.getById(departmentId)
      if (response.data.data) {
        const department = response.data.data
        setFormData({
          code: department.code,
          name: department.name,
          parentDepartmentId: department.parentDepartmentId || '',
          managerEmployeeId: department.managerEmployeeId || '',
        })
      }
    } catch (error) {
      console.error('Failed to load department:', error)
      toast.error('Failed to load department')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const normalizeOptionalId = (value?: string | null) => (value ? value : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = departmentSchema.safeParse(formData)
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
      const payload: CreateDepartmentRequest = {
        ...formData,
        parentDepartmentId: normalizeOptionalId(formData.parentDepartmentId),
        managerEmployeeId: normalizeOptionalId(formData.managerEmployeeId),
      }

      if (isEditing && id) {
        await departmentApi.update(id, payload)
        toast.success('Department updated')
      } else {
        await departmentApi.create(payload)
        toast.success('Department created')
      }

      navigate('/hr/departments')
    } catch (error) {
      console.error('Failed to save department:', error)
      toast.error('Failed to save department')
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
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Department' : 'New Department'}</h1>
          <p className="text-sm text-gray-500">Maintain departments and reporting lines</p>
        </div>
        <Link to="/hr/departments" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Departments
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.code ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.code && <p className="mt-1 text-xs text-red-600">{fieldErrors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Department</label>
            <select
              name="parentDepartmentId"
              value={formData.parentDepartmentId || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">None</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manager</label>
            <select
              name="managerEmployeeId"
              value={formData.managerEmployeeId || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Department'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DepartmentFormPage
