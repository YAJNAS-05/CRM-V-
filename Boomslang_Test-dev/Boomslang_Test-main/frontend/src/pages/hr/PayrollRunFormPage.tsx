import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { payrollApi } from '../../api/hrApi'
import { CreatePayrollRunRequest } from '../../types/hr'

const PayrollRunFormPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreatePayrollRunRequest>({
    periodStart: '',
    periodEnd: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.periodStart || !formData.periodEnd) {
      toast.error('Please select a payroll period')
      return
    }

    try {
      setLoading(true)
      await payrollApi.createRun(formData)
      toast.success('Payroll run created')
      navigate('/hr/payroll-runs')
    } catch (error) {
      console.error('Failed to create payroll run:', error)
      toast.error('Failed to create payroll run')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Payroll Run</h1>
          <p className="text-sm text-gray-500">Create a payroll processing window</p>
        </div>
        <Link to="/hr/payroll-runs" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Payroll Runs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Period Start *</label>
            <input
              type="date"
              name="periodStart"
              value={formData.periodStart}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Period End *</label>
            <input
              type="date"
              name="periodEnd"
              value={formData.periodEnd}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
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
            {loading ? 'Saving...' : 'Create Payroll Run'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PayrollRunFormPage
