import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { departmentApi, employeeApi, positionApi } from '../../api/hrApi'
import {
  CreateEmployeeRequest,
  Department,
  Employee,
  EmploymentType,
  EmployeeStatus,
  LifecycleStage,
  Position,
  WorkLocation,
} from '../../types/hr'

const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY']
const EMPLOYEE_STATUSES: EmployeeStatus[] = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']
const WORK_LOCATIONS: WorkLocation[] = ['OFFICE', 'REMOTE', 'HYBRID']
const LIFECYCLE_STAGES: LifecycleStage[] = ['PROBATION', 'CONFIRMED', 'PIP', 'RESIGNED', 'OFFBOARDED', 'ALUMNI']
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

type FormTab = 'employment' | 'personal' | 'emergency' | 'address'

const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formTab, setFormTab] = useState<FormTab>('employment')
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    positionId: '',
    managerId: '',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    hireDate: '',
    terminationDate: '',
    workLocation: 'OFFICE',
    lifecycleStage: 'PROBATION',
    gender: '',
    nationality: '',
    dateOfBirth: '',
    probationEndDate: '',
    confirmationDate: '',
    avatarUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    addressLine1: '',
    addressCity: '',
    addressState: '',
    addressCountry: '',
    addressPincode: '',
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      loadEmployee(id)
    }
  }, [id, isEditing])

  const loadLookups = async () => {
    try {
      const [deptResponse, posResponse, empResponse] = await Promise.all([
        departmentApi.getAll(0, 200),
        positionApi.getAll(0, 200),
        employeeApi.getAll(0, 200),
      ])
      setDepartments(deptResponse.data.data?.content || [])
      setPositions(posResponse.data.data?.content || [])
      setEmployees(empResponse.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load HR lookups:', error)
      toast.error('Failed to load lookup data')
    }
  }

  const loadEmployee = async (employeeId: string) => {
    try {
      setFetching(true)
      const response = await employeeApi.getById(employeeId)
      if (response.data.data) {
        const emp = response.data.data
        setFormData({
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          departmentId: emp.departmentId || '',
          positionId: emp.positionId || '',
          managerId: emp.managerId || '',
          employmentType: emp.employmentType,
          status: emp.status || 'ACTIVE',
          hireDate: emp.hireDate || '',
          terminationDate: emp.terminationDate || '',
          userId: emp.userId || '',
          workLocation: emp.workLocation || 'OFFICE',
          lifecycleStage: emp.lifecycleStage || 'PROBATION',
          gender: emp.gender || '',
          nationality: emp.nationality || '',
          dateOfBirth: emp.dateOfBirth || '',
          probationEndDate: emp.probationEndDate || '',
          confirmationDate: emp.confirmationDate || '',
          avatarUrl: emp.avatarUrl || '',
          emergencyContactName: emp.emergencyContactName || '',
          emergencyContactPhone: emp.emergencyContactPhone || '',
          emergencyContactRelation: emp.emergencyContactRelation || '',
          addressLine1: emp.addressLine1 || '',
          addressCity: emp.addressCity || '',
          addressState: emp.addressState || '',
          addressCountry: emp.addressCountry || '',
          addressPincode: emp.addressPincode || '',
        })
      }
    } catch (error) {
      console.error('Failed to load employee:', error)
      toast.error('Failed to load employee')
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
  }

  const normalizeOptionalId = (value?: string | null) => (value ? value : null)
  const normalizeOptionalDate = (value?: string | null) => (value ? value : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeCode.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const payload: CreateEmployeeRequest = {
        ...formData,
        userId: normalizeOptionalId(formData.userId),
        departmentId: normalizeOptionalId(formData.departmentId),
        positionId: normalizeOptionalId(formData.positionId),
        managerId: normalizeOptionalId(formData.managerId),
        hireDate: normalizeOptionalDate(formData.hireDate),
        terminationDate: normalizeOptionalDate(formData.terminationDate),
        dateOfBirth: normalizeOptionalDate(formData.dateOfBirth),
        probationEndDate: normalizeOptionalDate(formData.probationEndDate),
        confirmationDate: normalizeOptionalDate(formData.confirmationDate),
        phone: formData.phone || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        avatarUrl: formData.avatarUrl || null,
        emergencyContactName: formData.emergencyContactName || null,
        emergencyContactPhone: formData.emergencyContactPhone || null,
        emergencyContactRelation: formData.emergencyContactRelation || null,
        addressLine1: formData.addressLine1 || null,
        addressCity: formData.addressCity || null,
        addressState: formData.addressState || null,
        addressCountry: formData.addressCountry || null,
        addressPincode: formData.addressPincode || null,
      }

      if (isEditing && id) {
        await employeeApi.update(id, payload)
        toast.success('Employee updated')
      } else {
        await employeeApi.create(payload)
        toast.success('Employee created')
      }

      navigate('/hr/employees')
    } catch (error) {
      console.error('Failed to save employee:', error)
      toast.error('Failed to save employee')
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

  const formTabs: { id: FormTab; label: string }[] = [
    { id: 'employment', label: 'Employment' },
    { id: 'personal', label: 'Personal' },
    { id: 'emergency', label: 'Emergency Contact' },
    { id: 'address', label: 'Address' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Employee' : 'New Employee'}</h1>
          <p className="text-sm text-gray-500">Maintain employee records</p>
        </div>
        <Link to="/hr/employees" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Employees
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab bar */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {formTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  formTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Employment tab */}
        {formTab === 'employment' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Code *</label>
                <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Type *</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select name="departmentId" value={formData.departmentId || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <select name="positionId" value={formData.positionId || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>{position.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager</label>
                <select name="managerId" value={formData.managerId || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" value={formData.status || 'ACTIVE'} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {EMPLOYEE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Location</label>
                <select name="workLocation" value={formData.workLocation || 'OFFICE'} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {WORK_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lifecycle Stage</label>
                <select name="lifecycleStage" value={formData.lifecycleStage || 'PROBATION'} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {LIFECYCLE_STAGES.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                <input type="date" name="hireDate" value={formData.hireDate || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Probation End Date</label>
                <input type="date" name="probationEndDate" value={formData.probationEndDate || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmation Date</label>
                <input type="date" name="confirmationDate" value={formData.confirmationDate || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Termination Date</label>
                <input type="date" name="terminationDate" value={formData.terminationDate || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Personal tab */}
        {formTab === 'personal' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" value={formData.gender || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <input type="text" name="nationality" value={formData.nationality || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input type="url" name="avatarUrl" value={formData.avatarUrl || ''} onChange={handleChange}
                  placeholder="https://..." className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact tab */}
        {formTab === 'emergency' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange}
                  placeholder="e.g. Spouse, Parent, Sibling" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Address tab */}
        {formTab === 'address' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="addressCity" value={formData.addressCity || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State / Province</label>
                <input type="text" name="addressState" value={formData.addressState || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" name="addressCountry" value={formData.addressCountry || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode / ZIP</label>
                <input type="text" name="addressPincode" value={formData.addressPincode || ''} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Link to="/hr/employees" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeFormPage
