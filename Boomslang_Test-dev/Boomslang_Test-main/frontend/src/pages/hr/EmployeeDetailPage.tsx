import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  departmentApi,
  employeeApi,
  leaveRequestApi,
  payrollApi,
  positionApi,
  reimbursementApi,
  timesheetApi,
} from '../../api/hrApi'
import {
  Department,
  Employee,
  LeaveRequest,
  PayrollProfile,
  Position,
  ReimbursementRequest,
  Timesheet,
} from '../../types/hr'
import { FeatureGate } from '../../components/rbac'

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'leave' | 'timesheets' | 'payroll' | 'reimbursements'>(
    'overview',
  )
  const [department, setDepartment] = useState<Department | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [manager, setManager] = useState<Employee | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>([])
  const [payrollProfile, setPayrollProfile] = useState<PayrollProfile | null>(null)
  const [loadingContext, setLoadingContext] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEmployee(id)
    }
  }, [id])

  useEffect(() => {
    if (employee) {
      loadEmployeeContext(employee)
    }
  }, [employee?.id])

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true)
      const response = await employeeApi.getById(employeeId)
      setEmployee(response.data.data || null)
    } catch (error) {
      console.error('Failed to load employee:', error)
      toast.error('Failed to load employee')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployeeContext = async (current: Employee) => {
    setLoadingContext(true)
    try {
      const [
        departmentResult,
        positionResult,
        managerResult,
        leaveResult,
        timesheetResult,
        payrollResult,
        reimbursementResult,
      ] = await Promise.allSettled([
        current.departmentId
          ? departmentApi.getById(current.departmentId)
          : Promise.resolve<Awaited<ReturnType<typeof departmentApi.getById>> | null>(null),
        current.positionId
          ? positionApi.getById(current.positionId)
          : Promise.resolve<Awaited<ReturnType<typeof positionApi.getById>> | null>(null),
        current.managerId
          ? employeeApi.getById(current.managerId)
          : Promise.resolve<Awaited<ReturnType<typeof employeeApi.getById>> | null>(null),
        leaveRequestApi.getByEmployee(current.id),
        timesheetApi.getByEmployee(current.id),
        payrollApi.getProfile(current.id),
        current.userId
          ? reimbursementApi.getAll(0, 10, { requestedBy: current.userId, sort: 'requestDate,desc' })
          : reimbursementApi.getAll(0, 10, { search: current.email, sort: 'requestDate,desc' }),
      ] as const)

      setDepartment(departmentResult.status === 'fulfilled' ? departmentResult.value?.data.data ?? null : null)
      setPosition(positionResult.status === 'fulfilled' ? positionResult.value?.data.data ?? null : null)
      setManager(managerResult.status === 'fulfilled' ? managerResult.value?.data.data ?? null : null)
      setLeaveRequests(leaveResult.status === 'fulfilled' ? leaveResult.value.data.data ?? [] : [])
      setTimesheets(timesheetResult.status === 'fulfilled' ? timesheetResult.value.data.data ?? [] : [])
      setPayrollProfile(payrollResult.status === 'fulfilled' ? payrollResult.value.data.data ?? null : null)
      setReimbursements(
        reimbursementResult.status === 'fulfilled'
          ? reimbursementResult.value.data.data?.content ?? []
          : [],
      )
    } catch (error) {
      console.error('Failed to load employee context:', error)
    } finally {
      setLoadingContext(false)
    }
  }

  const leaveSummary = useMemo(() => {
    return {
      requested: leaveRequests.filter((item) => item.status === 'REQUESTED').length,
      approved: leaveRequests.filter((item) => item.status === 'APPROVED').length,
      rejected: leaveRequests.filter((item) => item.status === 'REJECTED').length,
    }
  }, [leaveRequests])

  const timesheetSummary = useMemo(() => {
    return {
      submitted: timesheets.filter((item) => item.status === 'SUBMITTED').length,
      approved: timesheets.filter((item) => item.status === 'APPROVED').length,
      rejected: timesheets.filter((item) => item.status === 'REJECTED').length,
    }
  }, [timesheets])

  const reimbursementSummary = useMemo(() => {
    return {
      submitted: reimbursements.filter((item) => item.status === 'SUBMITTED').length,
      approved: reimbursements.filter((item) => item.status === 'APPROVED').length,
      paid: reimbursements.filter((item) => item.status === 'PAID').length,
    }
  }, [reimbursements])

  const recentActivity = useMemo(() => {
    const events: { id: string; label: string; date: string; href: string }[] = []

    leaveRequests.forEach((leave) => {
      events.push({
        id: `leave-${leave.id}`,
        label: `Leave ${leave.leaveType.replace(/_/g, ' ')} · ${leave.status}`,
        date: leave.startDate,
        href: `/hr/leave-requests/${leave.id}`,
      })
    })

    timesheets.forEach((sheet) => {
      events.push({
        id: `timesheet-${sheet.id}`,
        label: `Timesheet · ${sheet.status}`,
        date: sheet.workDate,
        href: `/hr/timesheets/${sheet.id}`,
      })
    })

    reimbursements.forEach((request) => {
      events.push({
        id: `reimb-${request.id}`,
        label: `Reimbursement · ${request.status}`,
        date: request.requestDate,
        href: `/hr/reimbursements/${request.id}`,
      })
    })

    return events
      .filter((event) => Boolean(event.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [leaveRequests, timesheets, reimbursements])

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Delete this employee?')) return

    try {
      await employeeApi.delete(id)
      toast.success('Employee deleted')
      navigate('/hr/employees')
    } catch (error) {
      console.error('Failed to delete employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'personal', label: 'Personal' },
    { id: 'leave', label: 'Leave' },
    { id: 'timesheets', label: 'Timesheets' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'reimbursements', label: 'Reimbursements' },
  ]

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }

  const formatCurrency = (value?: number | null, currency?: string | null) => {
    const v = Number(value || 0)
    return `${currency || 'AUD'} ${v.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">Employee not found.</div>
        <Link to="/hr/employees" className="inline-flex mt-4 text-sm text-gray-600 hover:text-gray-900">
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700 shrink-0">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-gray-500">Employee Code: {employee.employeeCode}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {employee.lifecycleStage && (
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  employee.lifecycleStage === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  employee.lifecycleStage === 'PROBATION' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  employee.lifecycleStage === 'PIP' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                  'bg-slate-50 border-slate-200 text-slate-600'
                }`}>{employee.lifecycleStage}</span>
              )}
              {employee.workLocation && (
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {employee.workLocation}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FeatureGate requiredPermission="HR_EDIT">
            <Link
              to={`/hr/employees/${employee.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Edit
            </Link>
          </FeatureGate>
          <FeatureGate requiredPermission="HR_DELETE">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </FeatureGate>
          <Link to="/hr/employees" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Back
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="Open leave requests" value={leaveSummary.requested} subtitle="Awaiting approval" />
            <SummaryCard title="Submitted timesheets" value={timesheetSummary.submitted} subtitle="Need review" />
            <SummaryCard title="Pending reimbursements" value={reimbursementSummary.submitted} subtitle="Awaiting approval" />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900">{employee.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="text-gray-900">{employee.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Employment Type</dt>
                  <dd className="text-gray-900">{employee.employmentType}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-gray-900">{employee.status || 'ACTIVE'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Department</dt>
                  <dd className="text-gray-900">{department?.name || employee.departmentId || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Position</dt>
                  <dd className="text-gray-900">{position?.title || employee.positionId || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Manager</dt>
                  <dd className="text-gray-900">
                    {manager ? `${manager.firstName} ${manager.lastName}` : employee.managerId || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Hire Date</dt>
                  <dd className="text-gray-900">{formatDate(employee.hireDate)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Termination Date</dt>
                  <dd className="text-gray-900">{formatDate(employee.terminationDate)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent activity</h2>
              {loadingContext ? (
                <div className="text-sm text-gray-500">Loading activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-sm text-gray-500">No recent HR activity.</div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((event) => (
                    <Link
                      key={event.id}
                      to={event.href}
                      className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="font-medium text-gray-900">{event.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(event.date)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payroll snapshot</h2>
              {loadingContext ? (
                <div className="text-sm text-gray-500">Loading payroll profile...</div>
              ) : payrollProfile ? (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Pay Type</dt>
                    <dd className="text-gray-900">{payrollProfile.payType || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Frequency</dt>
                    <dd className="text-gray-900">{payrollProfile.payFrequency || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Salary</dt>
                    <dd className="text-gray-900">
                      {payrollProfile.salaryAmount ? formatCurrency(payrollProfile.salaryAmount, payrollProfile.currency) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Hourly Rate</dt>
                    <dd className="text-gray-900">
                      {payrollProfile.hourlyRate ? formatCurrency(payrollProfile.hourlyRate, payrollProfile.currency) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Bank Account</dt>
                    <dd className="text-gray-900">{payrollProfile.bankAccountMasked || '—'}</dd>
                  </div>
                </dl>
              ) : (
                <div className="text-sm text-gray-500">Payroll profile not set.</div>
              )}
              <Link to="/hr/payroll-profiles" className="inline-flex mt-4 text-sm text-indigo-600 hover:text-indigo-700">
                Manage payroll profiles →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Date of Birth</dt>
                <dd className="text-gray-900 mt-0.5">{formatDate(employee.dateOfBirth)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Gender</dt>
                <dd className="text-gray-900 mt-0.5">{employee.gender || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Nationality</dt>
                <dd className="text-gray-900 mt-0.5">{employee.nationality || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Work Location</dt>
                <dd className="text-gray-900 mt-0.5">{employee.workLocation || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Lifecycle Stage</dt>
                <dd className="text-gray-900 mt-0.5">{employee.lifecycleStage || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Probation End Date</dt>
                <dd className="text-gray-900 mt-0.5">{formatDate(employee.probationEndDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Confirmation Date</dt>
                <dd className="text-gray-900 mt-0.5">{formatDate(employee.confirmationDate)}</dd>
              </div>
            </dl>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="text-gray-900 mt-0.5">{employee.emergencyContactName || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900 mt-0.5">{employee.emergencyContactPhone || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Relationship</dt>
                <dd className="text-gray-900 mt-0.5">{employee.emergencyContactRelation || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Address</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Address Line 1</dt>
                <dd className="text-gray-900 mt-0.5">{employee.addressLine1 || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">City</dt>
                <dd className="text-gray-900 mt-0.5">{employee.addressCity || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">State</dt>
                <dd className="text-gray-900 mt-0.5">{employee.addressState || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Country</dt>
                <dd className="text-gray-900 mt-0.5">{employee.addressCountry || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Pincode / ZIP</dt>
                <dd className="text-gray-900 mt-0.5">{employee.addressPincode || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Leave requests</h2>
            <Link to="/hr/leave-requests" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {loadingContext ? (
            <div className="text-sm text-gray-500">Loading leave requests...</div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-sm text-gray-500">No leave requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                    <th className="py-2">Type</th>
                    <th className="py-2">Dates</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaveRequests.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="py-2">
                        <Link to={`/hr/leave-requests/${leave.id}`} className="text-indigo-600 hover:text-indigo-700">
                          {leave.leaveType.replace(/_/g, ' ')}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-600">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={leave.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Timesheets</h2>
            <Link to="/hr/timesheets" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {loadingContext ? (
            <div className="text-sm text-gray-500">Loading timesheets...</div>
          ) : timesheets.length === 0 ? (
            <div className="text-sm text-gray-500">No timesheets found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                    <th className="py-2">Work Date</th>
                    <th className="py-2">Hours</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timesheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-gray-50">
                      <td className="py-2">
                        <Link to={`/hr/timesheets/${sheet.id}`} className="text-indigo-600 hover:text-indigo-700">
                          {formatDate(sheet.workDate)}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-600">{sheet.hoursWorked ?? 0}</td>
                      <td className="py-2">
                        <StatusBadge status={sheet.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Payroll profile</h2>
            <Link to="/hr/payroll-profiles" className="text-sm text-indigo-600 hover:text-indigo-700">
              Manage profiles
            </Link>
          </div>
          {loadingContext ? (
            <div className="text-sm text-gray-500">Loading payroll profile...</div>
          ) : payrollProfile ? (
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Pay Type</dt>
                <dd className="text-gray-900">{payrollProfile.payType || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Pay Frequency</dt>
                <dd className="text-gray-900">{payrollProfile.payFrequency || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Salary Amount</dt>
                <dd className="text-gray-900">
                  {payrollProfile.salaryAmount ? formatCurrency(payrollProfile.salaryAmount, payrollProfile.currency) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Hourly Rate</dt>
                <dd className="text-gray-900">
                  {payrollProfile.hourlyRate ? formatCurrency(payrollProfile.hourlyRate, payrollProfile.currency) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Tax ID</dt>
                <dd className="text-gray-900">{payrollProfile.taxId || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Bank Account</dt>
                <dd className="text-gray-900">{payrollProfile.bankAccountMasked || '—'}</dd>
              </div>
            </dl>
          ) : (
            <div className="text-sm text-gray-500">No payroll profile found for this employee.</div>
          )}
        </div>
      )}

      {activeTab === 'reimbursements' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reimbursements</h2>
            <Link to="/hr/reimbursements" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {loadingContext ? (
            <div className="text-sm text-gray-500">Loading reimbursements...</div>
          ) : reimbursements.length === 0 ? (
            <div className="text-sm text-gray-500">No reimbursements found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
                    <th className="py-2">Category</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Request Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reimbursements.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="py-2">
                        <Link to={`/hr/reimbursements/${request.id}`} className="text-indigo-600 hover:text-indigo-700">
                          {request.category}
                        </Link>
                      </td>
                      <td className="py-2 text-gray-600">
                        {formatCurrency(request.amount, request.currency)}
                      </td>
                      <td className="py-2 text-gray-600">{formatDate(request.requestDate)}</td>
                      <td className="py-2">
                        <StatusBadge status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SummaryCard = ({ title, value, subtitle }: { title: string; value: number; subtitle: string }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
  </div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const toneMap: Record<string, string> = {
    REQUESTED: 'border-amber-200 bg-amber-50 text-amber-700',
    SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-700',
    APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
    PAID: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    DRAFT: 'border-slate-200 bg-slate-50 text-slate-700',
    CANCELLED: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneMap[status] || 'border-gray-200 bg-gray-50 text-gray-600'}`}>
      {status}
    </span>
  )
}

export default EmployeeDetailPage
