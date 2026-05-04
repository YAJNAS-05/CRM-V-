import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payslipApi } from '../../api/hrApi'
import { Payslip } from '../../types/hr'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  GENERATED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-yellow-100 text-yellow-700',
  ACKNOWLEDGED: 'bg-green-100 text-green-700',
}

const PayslipListPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['payslips', page, employeeId],
    queryFn: () =>
      payslipApi.getAll(page, 20, {
        employeeId: employeeId || undefined,
      }),
  })

  const payslips = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payslips</h1>
          <p className="text-sm text-slate-500">All generated employee payslips</p>
        </div>
        <Link
          to="/hr/payslips/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Generate Payslip
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by employee ID..."
          value={employeeId}
          onChange={(e) => { setEmployeeId(e.target.value); setPage(0) }}
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pay Period</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Net Pay</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No payslips found
                  </td>
                </tr>
              ) : (
                payslips.map((p: Payslip) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{p.employeeId.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {p.payPeriodStart} → {p.payPeriodEnd}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {p.currency} {Number(p.grossPay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {p.deductions != null ? `${p.currency} ${Number(p.deductions).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {p.currency} {Number(p.netPay).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/hr/payslips/${p.id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View PDF
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PayslipListPage
