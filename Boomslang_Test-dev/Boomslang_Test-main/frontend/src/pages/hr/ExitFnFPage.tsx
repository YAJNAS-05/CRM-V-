import React, { useState } from 'react'
import { toast } from 'sonner'

interface FnFInput {
  employeeName: string
  designation: string
  dateOfJoining: string
  lastWorkingDay: string
  annualCTC: number
  noticePeriodDays: number
  noticePeriodWorkedDays: number
  earnedLeaveBalance: number
  leaveEncashmentEligible: boolean
  pendingReimbursements: number
  currency: string
}

interface FnFResult {
  basicSalary: number
  gratuity: number
  leaveEncashment: number
  noticePeriodRecovery: number
  noticePeriodPayment: number
  salaryForLWD: number
  pendingReimbursements: number
  finalSettlement: number
  yearsOfService: number
  monthlyGross: number
}

const EMPTY_INPUT: FnFInput = {
  employeeName: 'Rajesh Kumar',
  designation: 'Senior Engineer',
  dateOfJoining: '2020-06-15',
  lastWorkingDay: '2026-04-30',
  annualCTC: 1200000,
  noticePeriodDays: 60,
  noticePeriodWorkedDays: 30,
  earnedLeaveBalance: 12,
  leaveEncashmentEligible: true,
  pendingReimbursements: 8500,
  currency: 'INR',
}

const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: currency || 'AUD', maximumFractionDigits: 0 }).format(amount)
}

const calcFnF = (input: FnFInput): FnFResult => {
  const joinDate = new Date(input.dateOfJoining)
  const lastDay = new Date(input.lastWorkingDay)
  const yearsOfService = (lastDay.getTime() - joinDate.getTime()) / (365.25 * 24 * 3600 * 1000)
  const monthlyGross = input.annualCTC / 12
  const dailyRate = monthlyGross / 26 // standard working days

  // Gratuity: eligible after 5 years | (15/26) * monthly basic * years
  const basicSalary = monthlyGross * 0.4
  const gratuity = yearsOfService >= 5 ? (15 / 26) * basicSalary * Math.floor(yearsOfService) : 0

  // Leave encashment
  const leaveEncashment = input.leaveEncashmentEligible ? input.earnedLeaveBalance * dailyRate : 0

  // Notice period
  const shortfallDays = Math.max(0, input.noticePeriodDays - input.noticePeriodWorkedDays)
  const excessDays = Math.max(0, input.noticePeriodWorkedDays - input.noticePeriodDays)
  const noticePeriodRecovery = shortfallDays * dailyRate
  const noticePeriodPayment = excessDays * dailyRate

  // Salary for days worked in last month
  const lwd = new Date(input.lastWorkingDay)
  const startOfMonth = new Date(lwd.getFullYear(), lwd.getMonth(), 1)
  const daysWorked = (lwd.getTime() - startOfMonth.getTime()) / (24 * 3600 * 1000) + 1
  const salaryForLWD = (daysWorked / 26) * monthlyGross

  const finalSettlement =
    salaryForLWD + gratuity + leaveEncashment + noticePeriodPayment + input.pendingReimbursements - noticePeriodRecovery

  return {
    basicSalary,
    gratuity,
    leaveEncashment,
    noticePeriodRecovery,
    noticePeriodPayment,
    salaryForLWD,
    pendingReimbursements: input.pendingReimbursements,
    finalSettlement,
    yearsOfService,
    monthlyGross,
  }
}

const ExitFnFPage: React.FC = () => {
  const [input, setInput] = useState<FnFInput>(EMPTY_INPUT)
  const [result, setResult] = useState<FnFResult | null>(null)
  const [calculated, setCalculated] = useState(false)

  const update = <K extends keyof FnFInput>(key: K, value: FnFInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const handleCalculate = () => {
    if (!input.dateOfJoining || !input.lastWorkingDay || !input.annualCTC) {
      toast.error('Please fill in all required fields')
      return
    }
    const res = calcFnF(input)
    setResult(res)
    setCalculated(true)
    toast.success('F&F calculated successfully')
  }

  const handlePrint = () => window.print()

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 no-print">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Exit Management</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Full & Final Settlement</h1>
        <p className="text-sm text-slate-600 mt-1">Calculate final settlement amount for departing employees.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form */}
        <div className="shell-card p-6 no-print space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Employee Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700">Employee Name</label>
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.employeeName} onChange={(e) => update('employeeName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Designation</label>
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.designation} onChange={(e) => update('designation', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Currency</label>
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.currency} onChange={(e) => update('currency', e.target.value)}>
                <option value="INR">INR</option>
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Date of Joining *</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.dateOfJoining} onChange={(e) => update('dateOfJoining', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Last Working Day *</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.lastWorkingDay} onChange={(e) => update('lastWorkingDay', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700">Annual CTC *</label>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.annualCTC} onChange={(e) => update('annualCTC', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Notice Period (days)</label>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.noticePeriodDays} onChange={(e) => update('noticePeriodDays', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Days Worked in Notice</label>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.noticePeriodWorkedDays} onChange={(e) => update('noticePeriodWorkedDays', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">EL Balance (days)</label>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.earnedLeaveBalance} onChange={(e) => update('earnedLeaveBalance', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Pending Reimbursements</label>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={input.pendingReimbursements} onChange={(e) => update('pendingReimbursements', Number(e.target.value))} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="leaveEnc" checked={input.leaveEncashmentEligible} onChange={(e) => update('leaveEncashmentEligible', e.target.checked)} className="accent-indigo-600 h-4 w-4" />
              <label htmlFor="leaveEnc" className="text-sm text-slate-700">Eligible for leave encashment</label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Calculate Settlement
          </button>
        </div>

        {/* Result */}
        {calculated && result && (
          <div className="shell-card p-6 space-y-4 payslip-print">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Settlement Summary</h2>
              <button type="button" onClick={handlePrint} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 no-print">
                Print / PDF
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p><span className="text-slate-500">Employee:</span> <span className="font-semibold">{input.employeeName}</span></p>
              <p><span className="text-slate-500">Designation:</span> <span className="font-semibold">{input.designation}</span></p>
              <p><span className="text-slate-500">Years of Service:</span> <span className="font-semibold">{result.yearsOfService.toFixed(1)} years</span></p>
              <p><span className="text-slate-500">Last Working Day:</span> <span className="font-semibold">{input.lastWorkingDay}</span></p>
            </div>

            <table className="w-full text-sm border-t border-slate-100">
              <thead>
                <tr>
                  <th className="py-2 text-left text-xs text-slate-500 uppercase font-semibold">Component</th>
                  <th className="py-2 text-right text-xs text-slate-500 uppercase font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: 'Salary for last working month', value: result.salaryForLWD, positive: true },
                  { label: 'Gratuity', value: result.gratuity, positive: true, note: result.yearsOfService < 5 ? '(< 5 yrs — not applicable)' : '' },
                  { label: 'Leave Encashment', value: result.leaveEncashment, positive: true },
                  { label: 'Notice Period Payment', value: result.noticePeriodPayment, positive: true },
                  { label: 'Pending Reimbursements', value: result.pendingReimbursements, positive: true },
                  { label: 'Notice Period Recovery', value: result.noticePeriodRecovery, positive: false },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-2 text-slate-700">{row.label} {row.note && <span className="text-xs text-slate-400">{row.note}</span>}</td>
                    <td className={`py-2 text-right font-semibold ${row.positive ? 'text-slate-900' : 'text-red-600'}`}>
                      {row.positive ? '' : '- '}{formatCurrency(row.value, input.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="py-3 font-bold text-slate-900">Net Settlement Amount</td>
                  <td className={`py-3 text-right text-lg font-bold ${result.finalSettlement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(result.finalSettlement, input.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p className="text-[10px] text-slate-400">* This is an indicative calculation. Final amounts are subject to HR and Finance review.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExitFnFPage
