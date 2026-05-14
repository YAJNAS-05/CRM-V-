import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { dashboardApi } from '../../api/dashboardApi'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FinanceKPI {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalRevenue: number
  totalOutstanding: number
  avgDaysToPayment: number
  collectionRate: number
  agingBuckets: AgingBucket[]
}

interface AgingBucket {
  label: string
  amount: number
  count: number
  percentage: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) => {
  const v = Number(value || 0)
  if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`
  return `₹${v.toLocaleString()}`
}

// ─── Component ─────────────────────────────────────────────────────────────────
const FinanceDashboardPage: React.FC = () => {
  const { user, hasAnyPermission } = usePermissions()
  const [isLoading, setIsLoading] = useState(true)

  // Simulated finance KPIs (will be replaced by API calls)
  const [kpi, setKpi] = useState<FinanceKPI>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
    avgDaysToPayment: 0,
    collectionRate: 0,
    agingBuckets: [],
  })

  useEffect(() => {
    const loadFinanceDashboard = async () => {
      try {
        setIsLoading(true)
        const response = await dashboardApi.getFinanceMetrics()
        setKpi(response.data.data)
      } catch (error) {
        console.error('Failed to load finance metrics', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFinanceDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading finance dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
              Financial operations
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Finance Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Cash flow overview, accounts receivable aging, payment tracking, and financial health metrics.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Finance view
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Total Invoices"
          value={kpi.totalInvoices}
        />
        <KPICard
          icon="M5 13l4 4L19 7"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Paid"
          value={kpi.paidInvoices}
        />
        <KPICard
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Pending"
          value={kpi.pendingInvoices}
        />
        <KPICard
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          title="Overdue"
          value={kpi.overdueInvoices}
        />
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightTile
          label="Total Revenue"
          value={formatCurrency(kpi.totalRevenue)}
          tone="emerald"
          hint="All time collected"
        />
        <InsightTile
          label="Outstanding"
          value={formatCurrency(kpi.totalOutstanding)}
          tone="amber"
          hint="Yet to be collected"
        />
        <InsightTile
          label="Avg Days to Payment"
          value={`${kpi.avgDaysToPayment} days`}
          tone="blue"
          hint="Invoice to payment"
        />
        <InsightTile
          label="Collection Rate"
          value={`${kpi.collectionRate}%`}
          tone="indigo"
          hint="Paid / Total"
        />
      </div>

      {/* AR Aging Analysis */}
      <div className="shell-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Accounts Receivable Aging
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {kpi.agingBuckets.map((bucket) => (
            <div
              key={bucket.label}
              className="rounded-xl border border-slate-200 p-3 text-center"
            >
              <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                {bucket.label}
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(bucket.amount)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {bucket.count} invoices
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Overdue */}
        <div className="shell-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Overdue Invoices
            </h3>
            <Link
              to="/finance/invoices"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="text-center py-8 text-sm text-slate-400">
            No overdue invoices at this time
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="shell-card p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {hasAnyPermission('FINANCE_CREATE') && (
              <QuickAction
                to="/finance/invoices/new"
                icon="M12 4v16m8-8H4"
                label="Create Invoice"
              />
            )}
            <QuickAction
              to="/finance/payments"
              icon="M3 10h18M7 15h1m4 0h1m-7-4h10"
              label="View Payments"
            />
            <QuickAction
              to="/finance/currency"
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
              label="Currency Rates"
            />
            {hasAnyPermission('REPORT_VIEW', 'REPORT_EXPORT') && (
              <QuickAction
                to="/finance/reports"
                icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
                label="Reports"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const KPICard = ({
  icon,
  iconBg,
  iconColor,
  title,
  value,
}: {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  value: string | number
}) => (
  <div className="shell-card p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  </div>
)

const InsightTile = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string | number
  hint: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo'
}) => {
  const toneClasses: Record<typeof tone, string> = {
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  }

  return (
    <div className={`rounded-xl border p-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-lg font-bold mt-1 leading-tight">{value}</p>
      <p className="text-[11px] opacity-80 mt-1">{hint}</p>
    </div>
  )
}

const QuickAction = ({
  to,
  icon,
  label,
}: {
  to: string
  icon: string
  label: string
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
  >
    <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className="text-sm text-slate-700 font-medium">{label}</span>
  </Link>
)

export default FinanceDashboardPage
