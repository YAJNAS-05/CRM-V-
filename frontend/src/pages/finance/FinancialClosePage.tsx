import React, { useState } from 'react'
import { toast } from 'sonner'
import { financialCloseApi } from '../../api/financeApi'
import { ThreeWayMatchException } from '../../types/finance'
import FinanceModuleHeader from '../../components/finance/FinanceModuleHeader'

const DEFAULT_ACTION = 'RESOLVED'

const FinancialClosePage: React.FC = () => {
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().split('T')[0])
  const [companyCode, setCompanyCode] = useState('EVERX')
  const [exceptions, setExceptions] = useState<ThreeWayMatchException[]>([])
  const [isInitiating, setIsInitiating] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isLoadingExceptions, setIsLoadingExceptions] = useState(false)
  const [resolutionActions, setResolutionActions] = useState<Record<string, string>>({})
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({})

  const formatAmount = (value?: number | string | null) => {
    if (value === null || value === undefined) return '—'
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric)) return '—'
    return numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const loadExceptions = async () => {
    if (!periodEnd) {
      toast.error('Select a period end date')
      return
    }
    setIsLoadingExceptions(true)
    try {
      const response = await financialCloseApi.getExceptions(periodEnd)
      setExceptions(response.data.data || [])
      toast.success('Exceptions loaded')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load exceptions')
    } finally {
      setIsLoadingExceptions(false)
    }
  }

  const initiateClose = async () => {
    if (!periodEnd) {
      toast.error('Select a period end date')
      return
    }
    setIsInitiating(true)
    try {
      await financialCloseApi.initiate(periodEnd)
      toast.success('Month-end close initiated')
      await loadExceptions()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate close')
    } finally {
      setIsInitiating(false)
    }
  }

  const finalizeClose = async () => {
    if (!periodEnd || !companyCode.trim()) {
      toast.error('Company code and period end are required')
      return
    }
    setIsFinalizing(true)
    try {
      await financialCloseApi.finalize(companyCode.trim(), periodEnd)
      toast.success('Posting period closed')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to finalize close')
    } finally {
      setIsFinalizing(false)
    }
  }

  const resolveException = async (exceptionId: string) => {
    const action = resolutionActions[exceptionId] || DEFAULT_ACTION
    const notes = resolutionNotes[exceptionId]
    try {
      await financialCloseApi.resolveException(exceptionId, { action, notes })
      toast.success('Exception resolved')
      setExceptions((prev) => prev.map((item) => (item.id === exceptionId ? { ...item, status: action } : item)))
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resolve exception')
    }
  }

  return (
    <div className="space-y-6">
      <FinanceModuleHeader
        eyebrow="Period Close"
        title="Financial close"
        subtitle="Run month-end checks, resolve three-way-match exceptions, and close posting periods with full audit visibility."
        metrics={[
          { label: 'Open Exceptions', value: exceptions.length },
          { label: 'Period End', value: periodEnd || 'Not set' },
          { label: 'Company Code', value: companyCode || 'Not set' },
          { label: 'Close Mode', value: 'Controlled Workflow', accentClassName: 'text-sky-700' },
        ]}
      />

      <div className="shell-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={initiateClose}
              disabled={isInitiating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isInitiating ? 'Running checks...' : 'Initiate Close'}
            </button>
            <button
              type="button"
              onClick={loadExceptions}
              disabled={isLoadingExceptions}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoadingExceptions ? 'Loading...' : 'Refresh Exceptions'}
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Period End</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Company Code</label>
            <input
              type="text"
              value={companyCode}
              onChange={(event) => setCompanyCode(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={finalizeClose}
              disabled={isFinalizing}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isFinalizing ? 'Closing period...' : 'Finalize Close'}
            </button>
          </div>
        </div>
      </div>

      <div className="shell-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Three-way match exceptions</h2>
          <span className="text-xs font-semibold text-slate-400">{exceptions.length} open items</span>
        </div>
        {exceptions.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">No exceptions found for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">PO</th>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.map((exception) => (
                  <tr key={exception.id}>
                    <td className="px-4 py-4 text-slate-900">{exception.exceptionType}</td>
                    <td className="px-4 py-4 text-slate-600">{exception.invoiceId || '—'}</td>
                    <td className="px-4 py-4 text-slate-600">{exception.poId || '—'}</td>
                    <td className="px-4 py-4 text-slate-600">{exception.receiptId || '—'}</td>
                    <td className="px-4 py-4 text-slate-900">{formatAmount(exception.varianceAmount)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {exception.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={resolutionActions[exception.id] || DEFAULT_ACTION}
                          onChange={(event) =>
                            setResolutionActions((prev) => ({ ...prev, [exception.id]: event.target.value }))
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="RESOLVED">Resolved</option>
                          <option value="WAIVED">Waived</option>
                          <option value="WRITE_OFF">Write off</option>
                        </select>
                        <input
                          type="text"
                          value={resolutionNotes[exception.id] || ''}
                          onChange={(event) =>
                            setResolutionNotes((prev) => ({ ...prev, [exception.id]: event.target.value }))
                          }
                          placeholder="Resolution notes"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => resolveException(exception.id)}
                          className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Apply
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancialClosePage
