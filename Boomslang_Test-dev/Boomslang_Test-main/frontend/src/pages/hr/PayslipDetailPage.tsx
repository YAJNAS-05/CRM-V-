import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeeApi, payslipApi } from '../../api/hrApi'

const PayslipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const backPath = location.pathname.startsWith('/hr/my-payslips') ? '/hr/my-payslips' : '/hr/payslips'

  const { data, isLoading } = useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payslipApi.getById(id!),
    enabled: Boolean(id),
  })

  const payslip = data?.data?.data

  const { data: employeeData } = useQuery({
    queryKey: ['payslip-employee', payslip?.employeeId],
    queryFn: () => employeeApi.getById(payslip!.employeeId),
    enabled: Boolean(payslip?.employeeId),
  })

  const employee = employeeData?.data?.data

  const formatCurrency = (value?: number | null, currency?: string | null) => {
    const amount = Number(value || 0)
    const code = currency || 'AUD'
    return `${code} ${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!payslip) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Payslip not found.</div>
        <Link to={backPath} className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Payslips
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip</h1>
          <p className="text-sm text-gray-500">{payslip.payPeriodStart} → {payslip.payPeriodEnd}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Download PDF
          </button>
          <Link to={backPath} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 payslip-print">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">EverX HR</h2>
            <p className="text-xs text-gray-500 mt-1">Payslip statement</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p><span className="text-gray-500">Payslip ID:</span> {payslip.id}</p>
            <p><span className="text-gray-500">Status:</span> {payslip.status}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Employee</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {employee ? `${employee.firstName} ${employee.lastName}` : payslip.employeeId}
            </p>
            <p className="text-xs text-gray-500 mt-1">Employee ID: {payslip.employeeId}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Pay Period</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {payslip.payPeriodStart} → {payslip.payPeriodEnd}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currency: {payslip.currency || 'AUD'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Gross Pay</p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatCurrency(payslip.grossPay, payslip.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Deductions</p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {formatCurrency(payslip.deductions, payslip.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-emerald-600">Net Pay</p>
            <p className="mt-2 text-lg font-bold text-emerald-800">
              {formatCurrency(payslip.netPay, payslip.currency)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Tax Amount</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {formatCurrency(payslip.taxAmount, payslip.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 payslip-section">
            <p className="text-xs uppercase tracking-wide text-gray-500">Notes</p>
            <p className="mt-2 text-sm text-gray-700">
              {payslip.notes || 'No notes provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayslipDetailPage
