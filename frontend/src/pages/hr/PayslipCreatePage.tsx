import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { payslipApi } from '../../api/hrApi'
import { CreatePayslipRequest } from '../../types/hr'
import { toast } from 'sonner'

const PayslipCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePayslipRequest>()

  const createMutation = useMutation({
    mutationFn: payslipApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] })
      toast.success('Payslip generated')
      navigate('/hr/payslips')
    },
    onError: () => toast.error('Failed to generate payslip'),
  })

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate Payslip</h1>
        <p className="text-sm text-slate-500">Create a payslip for an employee</p>
      </div>

      <form
        onSubmit={handleSubmit((data) =>
          createMutation.mutate({
            ...data,
            grossPay: Number(data.grossPay),
            deductions: data.deductions ? Number(data.deductions) : undefined,
            netPay: Number(data.netPay),
            taxAmount: data.taxAmount ? Number(data.taxAmount) : undefined,
          })
        )}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            {...register('employeeId', { required: 'Employee ID is required' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UUID"
          />
          {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pay Period Start <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('payPeriodStart', { required: 'Required' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.payPeriodStart && <p className="mt-1 text-xs text-red-600">{errors.payPeriodStart.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pay Period End <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('payPeriodEnd', { required: 'Required' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.payPeriodEnd && <p className="mt-1 text-xs text-red-600">{errors.payPeriodEnd.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gross Pay <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('grossPay', { required: 'Required' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000.00"
            />
            {errors.grossPay && <p className="mt-1 text-xs text-red-600">{errors.grossPay.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deductions</label>
            <input
              type="number"
              step="0.01"
              {...register('deductions')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Net Pay <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('netPay', { required: 'Required' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="4500.00"
            />
            {errors.netPay && <p className="mt-1 text-xs text-red-600">{errors.netPay.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Amount</label>
            <input
              type="number"
              step="0.01"
              {...register('taxAmount')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="350.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
          <select
            {...register('currency')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/hr/payslips')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Generate Payslip
          </button>
        </div>
      </form>
    </div>
  )
}

export default PayslipCreatePage
