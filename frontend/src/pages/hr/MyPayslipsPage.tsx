import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payslipApi, employeeApi } from '../../api/hrApi'
import { Payslip } from '../../types/hr'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  GENERATED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-yellow-100 text-yellow-700',
  ACKNOWLEDGED: 'bg-green-100 text-green-700',
}

const MyPayslipsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: empData } = useQuery({
    queryKey: ['my-employee-profile', user?.id],
    queryFn: () => employeeApi.getAll(0, 1, { search: user?.email }),
    enabled: Boolean(user?.id),
  })
  const employee = empData?.data?.data?.content?.[0]

  const { data, isLoading } = useQuery({
    queryKey: ['my-payslips', employee?.id],
    queryFn: () => payslipApi.getByEmployee(employee!.id),
    enabled: Boolean(employee?.id),
  })

  const acknowledgeMutation = useMutation({
    mutationFn: payslipApi.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payslips'] })
      toast.success('Payslip acknowledged')
    },
    onError: () => toast.error('Failed to acknowledge payslip'),
  })

  const payslips: Payslip[] = data?.data?.data ?? []

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Payslips</h1>
        <p className="text-sm text-slate-500">Your salary payment history</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : !employee ? (
        <div className="py-20 text-center text-slate-400">No employee profile linked to your account</div>
      ) : payslips.length === 0 ? (
        <div className="py-20 text-center text-slate-400">No payslips available yet</div>
      ) : (
        <div className="space-y-4">
          {payslips.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="grid grid-cols-4 gap-6 flex-1">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Pay Period</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {p.payPeriodStart} → {p.payPeriodEnd}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Gross Pay</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {p.currency} {Number(p.grossPay).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Net Pay</p>
                  <p className="mt-0.5 text-sm font-bold text-blue-700">
                    {p.currency} {Number(p.netPay).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/hr/my-payslips/${p.id}`}
                  className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Statement
                </Link>
                {p.status !== 'ACKNOWLEDGED' && (
                  <button
                    onClick={() => acknowledgeMutation.mutate(p.id)}
                    disabled={acknowledgeMutation.isPending}
                    className="shrink-0 rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPayslipsPage
