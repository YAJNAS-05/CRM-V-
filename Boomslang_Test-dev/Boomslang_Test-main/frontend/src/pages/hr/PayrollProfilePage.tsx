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

      {/* Salary Structure Visualization */}
      {profile && (profile.salaryAmount || profile.hourlyRate) && (
        <SalaryStructureCard profile={profile} />
      )}
    </div>
  )
}

interface SalaryStructureCardProps {
  profile: PayrollProfile
}

function SalaryStructureCard({ profile }: SalaryStructureCardProps) {
  const currency = profile.currency || 'USD'
  const fmt = (val: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)

  const annualGross = profile.payType === 'HOURLY' && profile.hourlyRate
    ? profile.hourlyRate * 2080 // 52 weeks × 40 hours
    : (profile.salaryAmount || 0) * (profile.payFrequency === 'WEEKLY' ? 52 : profile.payFrequency === 'BIWEEKLY' ? 26 : 12)

  const annualTax = annualGross * 0.3   // indicative 30%
  const superannuation = annualGross * 0.11  // indicative 11% super
  const annualNet = annualGross - annualTax - superannuation
  const monthly = annualGross / 12
  const hourlyEquivalent = annualGross / 2080

  const bars = [
    { label: 'Net Take-Home', value: annualNet, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'Income Tax (est. 30%)', value: annualTax, color: 'bg-red-400', textColor: 'text-red-600' },
    { label: 'Superannuation (est. 11%)', value: superannuation, color: 'bg-amber-400', textColor: 'text-amber-700' },
  ]

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-base font-bold text-gray-800">Salary Structure Breakdown</h2>
        <span className="ml-1 text-xs text-gray-400 font-medium">(indicative estimates)</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Annual Gross', value: fmt(annualGross), color: 'text-gray-900' },
          { label: 'Net Take-Home (est.)', value: fmt(annualNet), color: 'text-emerald-700' },
          { label: 'Monthly Gross', value: fmt(monthly), color: 'text-indigo-700' },
          { label: 'Hourly Equivalent', value: `${fmt(hourlyEquivalent)}/hr`, color: 'text-blue-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
            <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Annual Gross Breakdown</p>
        <div className="flex h-8 w-full rounded-xl overflow-hidden border border-gray-100">
          {bars.map(({ label, value, color }) => {
            const pct = annualGross > 0 ? (value / annualGross) * 100 : 0
            return (
              <div
                key={label}
                className={`${color} h-full flex items-center justify-center text-white text-[10px] font-bold transition-all`}
                style={{ width: `${pct}%` }}
                title={`${label}: ${fmt(value)} (${pct.toFixed(1)}%)`}
              >
                {pct > 8 ? `${pct.toFixed(0)}%` : ''}
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4">
          {bars.map(({ label, value, color, textColor }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
              <span className={`text-xs font-medium ${textColor}`}>{label}</span>
              <span className="text-xs text-gray-400">— {fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        * Tax and superannuation figures are indicative estimates only. Actual amounts will vary based on applicable tax rates, deductions, and jurisdiction requirements.
      </p>
    </div>
  )
}

export default PayrollProfilePage
