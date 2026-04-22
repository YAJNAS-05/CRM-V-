import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { employeeApi, payrollApi } from '../../api/hrApi'
import { Employee, PayrollItem, PayrollRun } from '../../types/hr'

const PayrollRunDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<PayrollRun | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchRun(id)
    }
  }, [id])

  useEffect(() => {
    loadEmployees()
  }, [])

  const fetchRun = async (runId: string) => {
    try {
      setLoading(true)
      const response = await payrollApi.getRun(runId)
      setRun(response.data.data || null)
    } catch (error) {
      console.error('Failed to load payroll run:', error)
      toast.error('Failed to load payroll run')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll(0, 200)
      setEmployees(response.data.data?.content || [])
    } catch (error) {
      console.error('Failed to load employees:', error)
    }
  }

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>()
    employees.forEach((employee) => map.set(employee.id, employee))
    return map
  }, [employees])

  const formatEmployee = (employeeId: string) => {
    const employee = employeeMap.get(employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      const response = await payrollApi.approveRun(id)
      setRun(response.data.data || null)
      toast.success('Payroll run approved')
    } catch (error) {
      console.error('Failed to approve payroll run:', error)
      toast.error('Failed to approve payroll run')
    }
  }

  const handleMarkPaid = async () => {
    if (!id) return
    try {
      const response = await payrollApi.markPaid(id)
      setRun(response.data.data || null)
      toast.success('Payroll run marked paid')
    } catch (error) {
      console.error('Failed to mark payroll run paid:', error)
      toast.error('Failed to mark payroll run paid')
    }
  }

  const items: PayrollItem[] = run?.items || []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Payroll run not found.</div>
        <Link to="/hr/payroll-runs" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Payroll Runs
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Run</h1>
          <p className="text-sm text-gray-500">Status: {run.status}</p>
        </div>
        <Link to="/hr/payroll-runs" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Back
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Period Start</p>
          <p className="text-gray-900">{new Date(run.periodStart).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Period End</p>
          <p className="text-gray-900">{new Date(run.periodEnd).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Run Date</p>
          <p className="text-gray-900">{run.runDate ? new Date(run.runDate).toLocaleDateString() : '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-900">{run.notes || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payroll Items</h2>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Approve Run
            </button>
            <button
              onClick={handleMarkPaid}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Mark Paid
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No payroll items generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-900">{formatEmployee(item.employeeId)}</td>
                    <td className="px-4 py-3 text-gray-600">{item.grossPay ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.deductions ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.netPay ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.status || '—'}</td>
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

export default PayrollRunDetailPage
