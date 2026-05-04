import React from 'react'
import { Link } from 'react-router-dom'
import { useHRMetrics } from '../../hooks/useHRMetrics'

const modules = [
  {
    title: 'People',
    status: 'MVP',
    href: '/hr/people',
    description: 'Profiles, employment details, and people records in one place.',
    highlights: [
      'Photo, contact, TFN, visa',
      'Employment types and cost centers',
      'Document vault and org chart',
    ],
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Payroll',
    status: 'MVP',
    href: '/hr/payroll',
    description: 'Pay runs, award interpretation, and compliant payroll outputs.',
    highlights: [
      'Pay runs and award rules',
      'Super, PAYG, HELP, HECS',
      'Payslips and termination pay',
    ],
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Leave',
    status: 'MVP',
    href: '/hr/leave',
    description: 'Leave types, accruals, approvals, and team calendars.',
    highlights: [
      'NES accrual engine',
      'One-click approvals',
      'Blackout and clash detection',
    ],
    icon: 'M8 7V3m8 4V3m-9 8h10m-10 4h6m-1 6h-7a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v5',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Time',
    status: 'MVP',
    href: '/hr/time',
    description: 'Timesheets, rosters, geo clock-ins, and approvals.',
    highlights: [
      'Mobile timesheets',
      'Roster builder and overtime flags',
      'Project and job tracking',
    ],
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    iconClass: 'bg-slate-50 text-slate-600',
  },
  {
    title: 'Recruit',
    status: 'MVP',
    href: '/hr/recruit',
    description: 'Job posts, kanban pipeline, interviews, and offers.',
    highlights: [
      'SEEK and LinkedIn postings',
      'Interview scheduling',
      'Applicant to employee conversion',
    ],
    icon: 'M6 7V6a3 3 0 013-3h6a3 3 0 013 3v1h2a1 1 0 011 1v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1h2z',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Onboard',
    status: 'MVP',
    href: '/hr/onboard',
    description: 'Pre-start portals, digital forms, and 90-day tracking.',
    highlights: [
      'Checklist templates',
      'Manager task assignments',
      'Buddy and mentor support',
    ],
    icon: 'M5 13l4 4L19 7',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    iconClass: 'bg-teal-50 text-teal-600',
  },
  {
    title: 'Performance',
    status: 'Phase 2',
    href: '/hr/performance',
    description: 'Reviews, goals, 360 feedback, and calibration tools.',
    highlights: [
      'Review cycles and check-ins',
      'OKR and goal tracking',
      '1-on-1 notes',
    ],
    icon: 'M3 3v18h18M7 14l3-3 3 2 4-5',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Compliance',
    status: 'MVP',
    href: '/hr/compliance',
    description: 'Awards, visa alerts, policies, and incident logs.',
    highlights: [
      'Fair Work award checks',
      'Visa expiry monitoring',
      'Policy acknowledgements',
    ],
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconClass: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Analytics',
    status: 'Phase 2',
    href: '/hr/analytics',
    description: 'Headcount, turnover, leave liability, and payroll costs.',
    highlights: [
      'Headcount and turnover trends',
      'Payroll and overtime costs',
      'DEI and gender pay gap',
    ],
    icon: 'M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-8 0h8m-8 0H7a2 2 0 01-2-2V7a2 2 0 012-2h2m8 0h-2m2 0a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-8h.01M12 11h.01M16 11h.01M8 7h8',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    iconClass: 'bg-slate-50 text-slate-600',
  },
]

const flows = [
  {
    title: 'New hire automation',
    description: 'Offer to Day 1 ready with pre-start tasks and onboarding.',
    steps: ['Offer accepted', 'Digital forms', 'Payroll and access ready'],
  },
  {
    title: 'Leave automation',
    description: 'Requests, approvals, and payroll impact in one flow.',
    steps: ['Request submitted', 'Manager approval', 'Accruals updated'],
  },
  {
    title: 'Payroll close',
    description: 'Timesheets and allowances roll into a compliant pay run.',
    steps: ['Time approved', 'Award check', 'STP lodgement'],
  },
]

const principles = [
  'Three clicks to action with contextual shortcuts',
  'Mobile first requests and approvals',
  'Automation first with fewer manual steps',
  'Plain language compliance alerts',
]

const aiFeatures = [
  'Award auto interpretation and pay variance',
  'Leave anomaly detection',
  'Job description generator',
  'Performance summary assist',
  'Termination risk scoring',
]

const HRLandingPage: React.FC = () => {
  const { metrics, loading } = useHRMetrics()
  const pendingApprovals = (metrics.pendingLeaves || 0) + (metrics.pendingTimesheets || 0)
  const highlightStats = [
    { label: 'Total employees', value: metrics.totalEmployees.toLocaleString() },
    { label: 'Open positions', value: metrics.openPositions.toLocaleString() },
    { label: 'Pending approvals', value: pendingApprovals.toLocaleString() },
    { label: 'Compliance rate', value: `${Math.round(metrics.complianceRate)}%` },
  ]

  return (
    <div className="space-y-6">
      <div className="shell-card relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-7 animate-fade-up">
        <div className="absolute -top-14 -right-24 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold">HR command center</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            People operations that stay in flow
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Manage the full employee lifecycle with automation-first workflows, plain language compliance,
            and dashboards for every role.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              to="/dashboard/hr"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              HR admin dashboard
            </Link>
            <Link
              to="/dashboard/hr/manager"
              className="rounded-lg border border-blue-100 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Manager dashboard
            </Link>
            <Link
              to="/dashboard/employee"
              className="rounded-lg border border-blue-100 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Employee self-service
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {highlightStats.map((stat) => (
          <div key={stat.label} className="shell-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? '—' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.title}
            to={module.href}
            className="shell-card group p-5 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${module.iconClass}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={module.icon} />
                </svg>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${module.badgeClass}`}>
                {module.status}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{module.description}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-500">
              {module.highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="shell-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Automation flows</h2>
          <p className="mt-1 text-xs text-slate-500">Designed to finish in three clicks or less.</p>
          <div className="mt-4 space-y-4">
            {flows.map((flow) => (
              <div key={flow.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{flow.title}</p>
                <p className="mt-1 text-xs text-slate-500">{flow.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {flow.steps.map((step) => (
                    <span
                      key={step}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-card p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Experience principles</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {principles.map((principle) => (
                <div key={principle} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>{principle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Premium AI</p>
            <div className="mt-3 space-y-2 text-xs text-amber-800">
              {aiFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRLandingPage
