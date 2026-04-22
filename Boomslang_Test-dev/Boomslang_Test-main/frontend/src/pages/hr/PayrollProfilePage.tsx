import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { employeeApi, payrollApi } from '../../api/hrApi'
import {
  Employee,
  PayFrequency,
  PayrollProfile,
  PayType,
  UpdatePayrollProfileRequest,
} from '../../types/hr'

const PAY_TYPES: PayType[] = ['SALARY', 'HOURLY']
const PAY_FREQUENCIES: PayFrequency[] = ['MONTHLY', 'BIWEEKLY', 'WEEKLY']

const PayrollProfilePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [profile, setProfile] = useState<PayrollProfile | null>(null)
  const [formData, setFormData] = useState<UpdatePayrollProfileRequest>({
    employeeId: '',
    payType: 'SALARY',
    payFrequency: 'MONTHLY',
    salaryAmount: undefined,
    hourlyRate: undefined,
    currency: 'USD',
    taxId: '',
    bankAccountMasked: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployeeId) {
      loadProfile(selectedEmployeeId)
    } else {
      setProfile(null)
      setFormData((prev) => ({
        ...prev,
        employeeId: '',
      }))
    }
  }, [selectedEmployeeId])

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200)
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
      toast.error('Failed to load employees')
    }
  }

  const loadProfile = async (employeeId: string) => {
    try {
      const response = await payrollApi.getProfile(employeeId)
      const data = response.data.data
      if (data) {
        setProfile(data)
        setFormData({
          employeeId: data.employeeId,
          payType: data.payType || 'SALARY',
          payFrequency: data.payFrequency || 'MONTHLY',
          salaryAmount: data.salaryAmount ?? undefined,
          hourlyRate: data.hourlyRate ?? undefined,
          currency: data.currency || 'USD',
          taxId: data.taxId || '',
          bankAccountMasked: data.bankAccountMasked || '',
        })
      } else {
        setProfile(null)
        setFormData((prev) => ({
          ...prev,
          employeeId,
        }))
      }
    } catch (error) {
      console.error('Failed to load payroll profile:', error)
      setProfile(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }))
  }

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      toast.error('Select an employee')
      return
    }

    try {
      setLoading(true)
      const payload: UpdatePayrollProfileRequest = {
        ...formData,
        employeeId: selectedEmployeeId,
      }
      const response = await payrollApi.upsertProfile(payload)
      setProfile(response.data.data || null)
      toast.success('Payroll profile saved')
    } catch (error) {
      console.error('Failed to save payroll profile:', error)
      toast.error('Failed to save payroll profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Profiles</h1>
        <p className="text-sm text-gray-500">Maintain employee payroll configuration</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Choose employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pay Type</label>
            <select
              name="payType"
              value={formData.payType || 'SALARY'}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {PAY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pay Frequency</label>
            <select
              name="payFrequency"
              value={formData.payFrequency || 'MONTHLY'}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {PAY_FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Amount</label>
            <input
              type="number"
              name="salaryAmount"
              value={formData.salaryAmount ?? ''}
              onChange={handleNumberChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate ?? ''}
              onChange={handleNumberChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <input
              type="text"
              name="currency"
              value={formData.currency || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID</label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bank Account (Masked)</label>
            <input
              type="text"
              name="bankAccountMasked"
              value={formData.bankAccountMasked || ''}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {profile ? 'Profile loaded from server' : 'No profile exists yet for this employee'}
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PayrollProfilePage
