import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { employeeApi, leaveBalanceApi } from '../../api/hrApi'
import { Employee, LeaveBalance, LeaveType } from '../../types/hr'

const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT']

const LeaveBalancesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [adjusting, setAdjusting] = useState(false)

  const [adjustForm, setAdjustForm] = useState({
    leaveType: 'ANNUAL' as LeaveType,
    deltaAvailable: '',
    deltaUsed: '',
    deltaPending: '',
    reason: '',
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployeeId) {
      loadBalances(selectedEmployeeId)
    } else {
      setBalances([])
    }
  }, [selectedEmployeeId])

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200, { sort: 'lastName,asc' })
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees', error)
      toast.error('Failed to load employees')
    }
  }

  const loadBalances = async (employeeId: string) => {
    try {
      setLoading(true)
      const response = await leaveBalanceApi.getByEmployee(employeeId)
      setBalances(response.data.data || [])
    } catch (error) {
      console.error('Failed to load balances', error)
      toast.error('Failed to load balances')
    } finally {
      setLoading(false)
    }
  }

  const seedBalances = async () => {
    if (!selectedEmployeeId) return
    try {
      setLoading(true)
      const response = await leaveBalanceApi.seed({ employeeId: selectedEmployeeId })
      setBalances(response.data.data || [])
      toast.success('Leave balances seeded')
    } catch (error) {
      console.error('Failed to seed balances', error)
      toast.error('Failed to seed balances')
    } finally {
      setLoading(false)
    }
  }

  const toNumber = (value: string) => (value.trim() === '' ? null : Number(value))

  const handleAdjust = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedEmployeeId) {
      toast.error('Select an employee first')
      return
    }

    try {
      setAdjusting(true)
      await leaveBalanceApi.adjust({
        employeeId: selectedEmployeeId,
        leaveType: adjustForm.leaveType,
        deltaAvailable: toNumber(adjustForm.deltaAvailable),
        deltaUsed: toNumber(adjustForm.deltaUsed),
        deltaPending: toNumber(adjustForm.deltaPending),
        reason: adjustForm.reason || null,
      })
      toast.success('Leave balance adjusted')
      setAdjustForm({ leaveType: 'ANNUAL', deltaAvailable: '', deltaUsed: '', deltaPending: '', reason: '' })
      loadBalances(selectedEmployeeId)
    } catch (error) {
      console.error('Failed to adjust balance', error)
      toast.error('Failed to adjust balance')
    } finally {
      setAdjusting(false)
    }
  }

  const balanceMap = useMemo(() => {
    const map = new Map<string, LeaveBalance>()
    balances.forEach((balance) => map.set(balance.leaveType, balance))
    return map
  }, [balances])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Balances</h1>
        <p className="text-sm text-gray-500">Seed and adjust employee leave balances.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <select
          value={selectedEmployeeId}
          onChange={(event) => setSelectedEmployeeId(event.target.value)}
          className="min-w-[260px] rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={seedBalances}
          disabled={!selectedEmployeeId || loading}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Seed balances
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Balances</h2>
          <span className="text-xs text-gray-500">{balances.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Last Accrued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : selectedEmployeeId && LEAVE_TYPES.length > 0 ? (
                LEAVE_TYPES.map((type) => {
                  const balance = balanceMap.get(type)
                  return (
                    <tr key={type} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">{balance?.availableDays ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600">{balance?.usedDays ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600">{balance?.pendingDays ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500">{balance?.lastAccruedOn || '—'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    Select an employee to view balances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleAdjust} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Adjust balance</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              value={adjustForm.leaveType}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, leaveType: event.target.value as LeaveType }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delta Available</label>
            <input
              type="number"
              step="0.5"
              value={adjustForm.deltaAvailable}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, deltaAvailable: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delta Used</label>
            <input
              type="number"
              step="0.5"
              value={adjustForm.deltaUsed}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, deltaUsed: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delta Pending</label>
            <input
              type="number"
              step="0.5"
              value={adjustForm.deltaPending}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, deltaPending: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <input
              value={adjustForm.reason}
              onChange={(event) => setAdjustForm((prev) => ({ ...prev, reason: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Opening balance correction"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adjusting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {adjusting ? 'Adjusting...' : 'Apply adjustment'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeaveBalancesPage
