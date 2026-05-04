import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi } from '../../api/hrApi'
import { FeatureGate } from '../../components/rbac'
import { useHRMetrics } from '../../hooks/useHRMetrics'
import { Employee } from '../../types/hr'

const quickLinks = [
  { label: 'Employee directory', href: '/hr/employees' },
  { label: 'Departments', href: '/hr/departments' },
  { label: 'Positions', href: '/hr/positions' },
  { label: 'Payroll profiles', href: '/hr/payroll-profiles' },
]

const HRPeoplePage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const totalEmployees = metrics.totalEmployees || 0
  const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
  const activeRate = totalEmployees > 0 ? (metrics.activeEmployees / totalEmployees) * 100 : 0
  const visaRate = totalEmployees > 0 ? ((totalEmployees - metrics.visasExpiring) / totalEmployees) * 100 : 100

  useEffect(() => {
    let active = true

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true)
        const response = await employeeApi.getAll(0, 200, { sort: 'hireDate,desc' })
        if (!active) return
        setEmployees(response.data.data?.content || [])
      } catch (error) {
        console.error('Failed to load employees', error)
      } finally {
        if (active) {
          setLoadingEmployees(false)
        }
      }
    }

    loadEmployees()

    return () => {
      active = false
    }
  }, [])

  const statusCounts = useMemo(() => {
    return employees.reduce(
      (acc, employee) => {
        if (employee.status) {
          acc[employee.status] = (acc[employee.status] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
  }, [employees])

  const employmentCounts = useMemo(() => {
    return employees.reduce(
      (acc, employee) => {
        if (employee.employmentType) {
          acc[employee.employmentType] = (acc[employee.employmentType] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
  }, [employees])

  const peopleStats = [
    { label: 'Active employees', value: metrics.activeEmployees },
    { label: 'On leave', value: statusCounts.ON_LEAVE || 0 },
    { label: 'Inactive', value: statusCounts.INACTIVE || 0 },
    { label: 'Terminated', value: statusCounts.TERMINATED || 0 },
    { label: 'Contractors', value: employmentCounts.CONTRACTOR || 0 },
    { label: 'New hires (MTD)', value: metrics.newHiresThisMonth },
  ]

  const recentEmployees = employees.slice(0, 4)

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date TBD'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime())
      ? 'Date TBD'
      : parsed.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })
  }

  const coverageStats = [
    {
      label: 'Profile completeness',
      value: loading ? '—' : `${clampPercent(activeRate)}%`,
    },
    {
      label: 'Policy acknowledgements',
      value: loading ? '—' : `${clampPercent(metrics.complianceRate)}%`,
    },
    {
      label: 'Visa checks current',
      value: loading ? '—' : `${clampPercent(visaRate)}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">People and records</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">People operations</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Maintain compliant employee records, manage employment details, and keep org data current.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/hr/employees"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Employee directory
            </Link>
            <FeatureGate requiredPermission="HR_CREATE">
              <Link
                to="/hr/employees/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add employee
              </Link>
            </FeatureGate>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {peopleStats.map((stat) => (
          <div key={stat.label} className="shell-card p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loadingEmployees || loading ? '—' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="shell-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Quick links</h2>
            <span className="text-xs text-slate-500">MVP ready</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recent employees</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {loadingEmployees && (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  Loading employees...
                </div>
              )}
              {!loadingEmployees && recentEmployees.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  No employees found.
                </div>
              )}
              {!loadingEmployees && recentEmployees.map((employee) => (
                <div key={employee.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>{employee.firstName} {employee.lastName}</span>
                    <span className="text-xs text-slate-400">{formatDate(employee.hireDate)}</span>
                  </div>
                  <div className="text-xs text-slate-500">{employee.status || 'Status pending'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Record coverage</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {coverageStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span>{stat.label}</span>
                <span className="text-sm font-semibold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRPeoplePage
