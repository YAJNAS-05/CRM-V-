import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { payrollApi } from '../../api/hrApi'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { CreatePayrollRunRequest } from '../../types/hr'

const steps = [
  { id: 1, title: 'Review period', description: 'Confirm pay group and dates.' },
  { id: 2, title: 'Exceptions', description: 'Check timesheets and allowances.' },
  { id: 3, title: 'Confirm', description: 'Approve and create pay run.' },
]

const HRPayrollWizardPage: React.FC = () => {
  const navigate = useNavigate()
  const { metrics, loading: metricsLoading } = useHRMetrics()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [payGroup, setPayGroup] = useState('All employees')
  const [formData, setFormData] = useState<CreatePayrollRunRequest>({
    periodStart: '',
    periodEnd: '',
    notes: '',
  })

  const exceptions = useMemo(() => {
    return [
      {
        label: `${metrics.pendingTimesheets} missing timesheets`,
        show: metrics.pendingTimesheets > 0,
      },
      {
        label: `${metrics.pendingLeaves} leave approvals pending`,
        show: metrics.pendingLeaves > 0,
      },
      {
        label: `${metrics.pendingReimbursements} reimbursements awaiting review`,
        show: metrics.pendingReimbursements > 0,
      },
    ]
  }, [metrics.pendingLeaves, metrics.pendingReimbursements, metrics.pendingTimesheets])

  const goNext = () => {
    if (currentStep === 1 && (!formData.periodStart || !formData.periodEnd)) {
      toast.error('Select a payroll period to continue')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleCreateRun = async () => {
    if (!formData.periodStart || !formData.periodEnd) {
      toast.error('Select a payroll period to continue')
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
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Payroll wizard</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Run payroll in three steps</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Validate pay periods, review exceptions, and confirm your payroll run.
            </p>
          </div>
          <Link
            to="/hr/payroll-runs"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to pay runs
          </Link>
        </div>
      </div>

      <div className="shell-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-xl border p-4 ${
                currentStep === step.id
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Step {step.id}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Review pay period</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Pay group</label>
              <select
                value={payGroup}
                onChange={(event) => setPayGroup(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option>All employees</option>
                <option>Weekly payroll</option>
                <option>Fortnightly payroll</option>
                <option>Monthly payroll</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Period start</label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(event) => setFormData((prev) => ({ ...prev, periodStart: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Period end</label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(event) => setFormData((prev) => ({ ...prev, periodEnd: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Optional notes for the payroll run"
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Review exceptions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {metricsLoading && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                Loading exceptions...
              </div>
            )}
            {!metricsLoading && exceptions.filter((item) => item.show).length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                No exceptions detected.
              </div>
            )}
            {!metricsLoading && exceptions.filter((item) => item.show).map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                {item.label}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Resolve exceptions to avoid payroll adjustments after submission.
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Confirm payroll run</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">Pay group</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{payGroup}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">Period</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formData.periodStart || 'Select dates'} - {formData.periodEnd || 'Select dates'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">Estimated gross</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {metricsLoading ? '—' : `AUD ${Number(metrics.nextPayrollAmount || 0).toLocaleString()}`}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Submission will trigger payslip generation and STP reporting once approved.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          disabled={currentStep === 1}
        >
          Back
        </button>
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateRun}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create payroll run'}
          </button>
        )}
      </div>
    </div>
  )
}

export default HRPayrollWizardPage
