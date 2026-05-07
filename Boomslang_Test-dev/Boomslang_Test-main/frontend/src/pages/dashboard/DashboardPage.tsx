import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportApi } from '../../api/crmApi'
import {
  ReportActivity,
  ReportConversion,
  ReportDashboardKPIs,
  ReportPipeline,
  ReportUserPerformance,
} from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { toast } from 'sonner'

type DashboardMode = 'AUTO' | 'SELF' | 'TEAM'

interface DashboardPageProps {
  mode?: DashboardMode
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6', CONTACTED: '#f59e0b', QUALIFIED: '#10b981', UNQUALIFIED: '#ef4444', CONVERTED: '#8b5cf6',
}
const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#9ca3af', QUALIFICATION: '#3b82f6', PROPOSAL: '#f59e0b', NEGOTIATION: '#f97316', CLOSED_WON: '#10b981', CLOSED_LOST: '#ef4444',
}

const TEAM_SCOPE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MANAGER']

const formatCurrencyShort = (raw: number) => {
  const val = Number(raw || 0)
  if (val >= 1_000_000) return `Rs ${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `Rs ${(val / 1_000).toFixed(1)}K`
  return `Rs ${val.toLocaleString()}`
}

const formatCompact = (raw: number) => {
  const val = Number(raw || 0)
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return `${val}`
}

const DashboardPage: React.FC<DashboardPageProps> = ({ mode = 'AUTO' }) => {
  const user = useAuthStore((state) => state.user)

  const [kpi, setKpi] = useState<ReportDashboardKPIs | null>(null)
  const [pipeline, setPipeline] = useState<ReportPipeline | null>(null)
  const [conversion, setConversion] = useState<ReportConversion | null>(null)
  const [activities, setActivities] = useState<ReportActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userPermissions = user?.permissions || []

  const canViewUserDashboard = useMemo(
    () => userPermissions.includes('DASHBOARD_SELF_VIEW'),
    [userPermissions]
  )

  const canViewTeamDashboard = useMemo(
    () => userPermissions.includes('DASHBOARD_TEAM_VIEW'),
    [userPermissions]
  )

  const resolvedMode = useMemo<DashboardMode>(() => {
    if (mode !== 'AUTO') return mode
    if (canViewTeamDashboard) return 'TEAM'
    if (canViewUserDashboard) return 'SELF'
    return 'AUTO'
  }, [mode, canViewTeamDashboard, canViewUserDashboard])

  const userRoles = useMemo(() => {
    if (!user) return []
    return user.roles && user.roles.length > 0 ? user.roles : user.role ? [user.role] : []
  }, [user])

  const isManagerRole = useMemo(
    () => userRoles.some((role) => TEAM_SCOPE_ROLES.includes(role)),
    [userRoles]
  )

  const teamRows = (kpi?.userPerformance ?? []) as ReportUserPerformance[]

  useEffect(() => { fetchData() }, [resolvedMode])

  const getReportCallsForMode = () => {
    if (resolvedMode === 'TEAM') {
      return {
        dashboard: reportApi.getDashboardTeam,
        pipeline: reportApi.getPipelineTeam,
        conversion: reportApi.getConversionTeam,
        activities: reportApi.getActivitiesTeam,
      }
    }

    if (resolvedMode === 'SELF') {
      return {
        dashboard: reportApi.getDashboardUser,
        pipeline: reportApi.getPipelineUser,
        conversion: reportApi.getConversionUser,
        activities: reportApi.getActivitiesUser,
      }
    }

    return {
      dashboard: reportApi.getDashboard,
      pipeline: reportApi.getPipeline,
      conversion: reportApi.getConversion,
      activities: reportApi.getActivities,
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setKpi(null)
      setPipeline(null)
      setConversion(null)
      setActivities(null)
      const scopedCalls = getReportCallsForMode()
      const [d, p, c, a] = await Promise.allSettled([
        scopedCalls.dashboard(), scopedCalls.pipeline(), scopedCalls.conversion(), scopedCalls.activities(),
      ])
      if (d.status === 'fulfilled' && d.value.data.data) setKpi(d.value.data.data)
      if (p.status === 'fulfilled' && p.value.data.data) setPipeline(p.value.data.data)
      if (c.status === 'fulfilled' && c.value.data.data) setConversion(c.value.data.data)
      if (a.status === 'fulfilled' && a.value.data.data) setActivities(a.value.data.data)
    } catch { toast.error('Failed to load dashboard') } finally { setIsLoading(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  const scopeLabel = kpi?.visibilityScope
    ?? (resolvedMode === 'TEAM' ? 'TEAM' : resolvedMode === 'SELF' ? 'SELF' : (isManagerRole ? 'TEAM' : 'SELF'))
  const selectedDashboardMode = resolvedMode === 'AUTO' ? scopeLabel : resolvedMode
  const topPerformer = teamRows.length > 0 ? teamRows[0] : null
  const trackedMembers = kpi?.teamMemberCount ?? teamRows.filter((row) => Boolean(row.userId)).length

  const totalTeamActivities = teamRows.reduce((sum, row) => sum + row.activities, 0)
  const totalTeamLeads = teamRows.reduce((sum, row) => sum + row.leads, 0)
  const totalTeamConvertedLeads = teamRows.reduce((sum, row) => sum + row.convertedLeads, 0)
  const avgLeadConversion =
    totalTeamLeads > 0
      ? (totalTeamConvertedLeads / totalTeamLeads) * 100
      : 0
  const avgPipelinePerUser = trackedMembers > 0
    ? Number(kpi?.totalPipelineValue || 0) / trackedMembers
    : 0
  const highestOverdueMember = teamRows.reduce<ReportUserPerformance | null>((acc, row) => {
    if (!acc || row.overdueActivities > acc.overdueActivities) {
      return row
    }
    return acc
  }, null)

  const pipeData = pipeline ? Object.entries(pipeline.dealValueByStage || {}).map(([s, v]) => ({
    stage: s.replace('_', ' '), value: v as number, count: (pipeline.dealCountByStage?.[s] || 0) as number, fill: STAGE_COLORS[s] || '#6b7280',
  })) : []

  const statusData = conversion ? Object.entries(conversion.leadsByStatus || {}).map(([s, c]) => ({
    name: s, value: c as number, fill: LEAD_STATUS_COLORS[s] || '#6b7280',
  })) : []

  const sourceData = conversion ? Object.entries(conversion.leadsBySource || {}).map(([s, c]) => ({
    source: s.replace('_', ' '), count: c as number,
  })) : []

  const actData = activities ? Object.entries(activities.activitiesByType || {}).map(([t, c]) => ({
    type: t, count: c as number,
  })) : []

  const teamPipelineData = teamRows.slice(0, 8).map((row) => ({
    userName: row.userName,
    pipelineValue: Number(row.pipelineValue || 0),
  }))

  const teamConversionData = teamRows.slice(0, 8).map((row) => ({
    userName: row.userName,
    leadConversionRate: row.leadConversionRate,
  }))

  return (
    <div className="space-y-6">
      <div className="shell-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">CRM analytics cockpit</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Dashboard</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            {scopeLabel === 'TEAM'
                  ? 'Manager view with full CRM team coverage, user-wise accountability, and stage-level trends.'
                  : 'Personal view showing only your own CRM performance, pipeline movement, and pending execution.'}
          </p>

              {(canViewUserDashboard || canViewTeamDashboard) && (
                <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {canViewUserDashboard && (
                    <Link
                      to="/dashboard/crm/user"
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedDashboardMode === 'SELF' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      User Dashboard
                    </Link>
                  )}
                  {canViewTeamDashboard && (
                    <Link
                      to="/dashboard/crm/team"
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedDashboardMode === 'TEAM' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Team Dashboard
                    </Link>
                  )}
                </div>
              )}
        </div>
            <ScopePill scope={scopeLabel} />
          </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <InsightTile
            label="Scope"
            value={scopeLabel === 'TEAM' ? 'TEAM' : 'SELF'}
            tone="slate"
            hint={scopeLabel === 'TEAM' ? 'All assigned CRM users' : 'Only your owned records'}
          />
          <InsightTile
            label="Tracked users"
            value={scopeLabel === 'TEAM' ? trackedMembers : 1}
            tone="blue"
            hint={scopeLabel === 'TEAM' ? 'User-wise detail enabled' : 'Your own execution only'}
          />
          <InsightTile
            label="Pipeline"
            value={formatCurrencyShort(Number(kpi?.totalPipelineValue || 0))}
            tone="emerald"
            hint="Open deal value"
          />
          <InsightTile
            label="Win rate"
            value={`${(kpi?.winRate ?? 0).toFixed(1)}%`}
            tone="amber"
            hint="Closed won ratio"
          />
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI iconPath="M17 20h5v-2a3 3 0 00-5.36-1.86M9 20H4v-2a3 3 0 015.36-1.86M16 7a4 4 0 11-8 0 4 4 0 018 0z" iconBg="bg-blue-50" iconColor="text-blue-600" title="Total Leads" value={kpi?.totalLeads ?? 0} />
        <KPI iconPath="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z" iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Contacts" value={kpi?.totalContacts ?? 0} />
        <KPI iconPath="M3 3v18h18M7 14l3-3 3 2 4-5" iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Open Deals" value={kpi?.openDeals ?? 0} />
        <KPI iconPath="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8V6m0 10v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z" iconBg="bg-amber-50" iconColor="text-amber-600" title="Pipeline Value" value={formatCurrencyShort(Number(kpi?.totalPipelineValue ?? 0))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI iconPath="M5 13l4 4L19 7" iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Won Deals" value={kpi?.wonDeals ?? 0} />
        <KPI iconPath="M6 18L18 6M6 6l12 12" iconBg="bg-rose-50" iconColor="text-rose-600" title="Lost Deals" value={kpi?.lostDeals ?? 0} />
        <KPI iconPath="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.59a1 1 0 01.7.29l3.41 3.41a1 1 0 01.3.71V16a1 1 0 01-1 1h-1" iconBg="bg-orange-50" iconColor="text-orange-600" title="Activities" value={activities?.totalActivities ?? 0} />
        <KPI iconPath="M3 3v18h18M8 14l3-3 2 2 4-5" iconBg="bg-cyan-50" iconColor="text-cyan-700" title="Win Rate" value={`${(kpi?.winRate ?? 0).toFixed(1)}%`} />
      </div>

      {scopeLabel === 'TEAM' && teamRows.length > 0 && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <InsightTile
            label="Team activities"
            value={formatCompact(totalTeamActivities)}
            tone="indigo"
            hint="Completed + pending"
          />
          <InsightTile
            label="Avg conversion"
            value={`${avgLeadConversion.toFixed(1)}%`}
            tone="emerald"
            hint="Across tracked users"
          />
          <InsightTile
            label="Avg pipeline/user"
            value={formatCurrencyShort(avgPipelinePerUser)}
            tone="blue"
            hint="Distribution health"
          />
          <InsightTile
            label="Highest overdue"
            value={highestOverdueMember ? `${highestOverdueMember.overdueActivities}` : '0'}
            tone="rose"
            hint={highestOverdueMember ? highestOverdueMember.userName : 'No overdue load'}
          />
        </div>

        <div className="shell-card p-5 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Team Performance by CRM User</h3>
              <p className="text-xs text-gray-500 mt-1">
                Segregated lead, deal, pipeline and activity metrics for each assigned CRM user.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Tracked users</p>
              <p className="text-lg font-bold text-slate-900">{trackedMembers}</p>
            </div>
          </div>

          {topPerformer && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Top performer</p>
              <p className="text-sm font-bold text-emerald-900 mt-0.5">{topPerformer.userName}</p>
              <p className="text-xs text-emerald-800 mt-1">
                {topPerformer.deals} deals, {formatCurrencyShort(Number(topPerformer.pipelineValue || 0))} pipeline, {topPerformer.leadConversionRate.toFixed(1)}% conversion
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
            {teamRows.slice(0, 6).map((row, index) => (
              <MemberPerformanceCard key={`${row.userId || 'UNASSIGNED'}-${index}`} row={row} />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">CRM User</th>
                  <th className="py-2 pr-3 font-semibold">Leads</th>
                  <th className="py-2 pr-3 font-semibold">Converted</th>
                  <th className="py-2 pr-3 font-semibold">Deals</th>
                  <th className="py-2 pr-3 font-semibold">Open</th>
                  <th className="py-2 pr-3 font-semibold">Won</th>
                  <th className="py-2 pr-3 font-semibold">Lost</th>
                  <th className="py-2 pr-3 font-semibold">Pipeline</th>
                  <th className="py-2 pr-3 font-semibold">Activities</th>
                  <th className="py-2 pr-3 font-semibold">Completed</th>
                  <th className="py-2 pr-3 font-semibold">Overdue</th>
                  <th className="py-2 pr-0 font-semibold">Lead Conv.</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((row, index) => (
                  <tr key={`${row.userId || 'UNASSIGNED'}-${index}`} className="border-b border-slate-100 last:border-none">
                    <td className="py-2 pr-3 font-medium text-slate-800">{row.userName}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.leads}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.convertedLeads}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.deals}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.openDeals}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.wonDeals}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.lostDeals}</td>
                    <td className="py-2 pr-3 font-semibold text-slate-800">{formatCurrencyShort(Number(row.pipelineValue || 0))}</td>
                    <td className="py-2 pr-3 text-slate-600">{row.activities}</td>
                    <td className="py-2 pr-3 text-emerald-700">{row.completedActivities}</td>
                    <td className="py-2 pr-3 text-rose-600">{row.overdueActivities}</td>
                    <td className="py-2 pr-0 text-slate-700">{row.leadConversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {scopeLabel === 'SELF' && (
        <div className="shell-card p-5 mb-6 border border-blue-100 bg-blue-50/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Personal scope</p>
          <p className="text-sm text-blue-900 mt-1">
            This dashboard is automatically filtered to your own leads, deals and activity execution.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <InsightTile label="My leads" value={kpi?.totalLeads ?? 0} tone="blue" hint="Owned + created" />
            <InsightTile label="My deals" value={kpi?.totalDeals ?? 0} tone="indigo" hint="All stages" />
            <InsightTile label="My overdue" value={activities?.overdueActivities ?? 0} tone="rose" hint="Immediate attention" />
            <InsightTile label="My conversion" value={`${conversion?.conversionRate?.toFixed(1) ?? '0.0'}%`} tone="emerald" hint="Lead conversion" />
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Pipeline by Stage">
          {pipeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatCurrencyShort} />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={100} />
                <Tooltip formatter={(v: number) => [formatCurrencyShort(v), 'Value']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {pipeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Leads by Status">
          {statusData.length > 0 ? (
            <div className="flex">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center space-y-3">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: d.fill }} /><span className="text-xs text-gray-600">{d.name}</span></div>
                    <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <Empty />}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Lead Source Breakdown">
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        <ChartCard title="Activity Summary" action={<Link to="/reports" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View reports →</Link>}>
          {activities ? (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Mini label="Completed" value={activities.completedActivities} cls="bg-green-50 text-green-600" />
                <Mini label="Pending" value={activities.pendingActivities} cls="bg-yellow-50 text-yellow-600" />
                <Mini label="Overdue" value={activities.overdueActivities} cls="bg-red-50 text-red-600" />
                <Mini label="Total" value={activities.totalActivities} cls="bg-blue-50 text-blue-600" />
              </div>
              {actData.length > 0 && (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={actData}>
                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : <Empty />}
        </ChartCard>
      </div>

      {scopeLabel === 'TEAM' && teamRows.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard title="Team Pipeline by User (Top 8)">
            {teamPipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={teamPipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="userName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatCompact} />
                  <Tooltip formatter={(value: number) => [formatCurrencyShort(value), 'Pipeline']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="pipelineValue" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </ChartCard>

          <ChartCard title="Lead Conversion by User (Top 8)">
            {teamConversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={teamConversionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="userName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conversion']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="leadConversionRate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </ChartCard>
        </div>
      )}

      {/* Conversion Funnel */}
      {conversion && (
        <div className="shell-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
          <div className="flex items-center justify-center space-x-2">
            <Funnel label="Total Leads" value={conversion.totalLeads} color="bg-blue-500" />
            <Arrow />
            <Funnel label="Converted" value={conversion.convertedLeads} color="bg-green-500" />
            <Arrow />
            <Funnel label="Conversion Rate" value={`${conversion.conversionRate.toFixed(1)}%`} color="bg-purple-500" />
          </div>
        </div>
      )}
    </div>
  )
}

const ScopePill = ({ scope }: { scope: string }) => {
  const isTeam = scope === 'TEAM'
  return (
    <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${isTeam ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
      {isTeam ? 'Team dashboard' : 'My dashboard'}
    </div>
  )
}

const KPI = ({
  iconPath,
  iconBg,
  iconColor,
  title,
  value,
}: {
  iconPath: string
  iconBg: string
  iconColor: string
  title: string
  value: string | number
}) => (
  <div className="shell-card p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>
      <div><p className="text-xs text-gray-500">{title}</p><p className="text-lg font-bold text-gray-900 leading-tight">{value}</p></div>
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

const MemberPerformanceCard = ({ row }: { row: ReportUserPerformance }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-slate-800 leading-tight">{row.userName}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{row.leads} leads • {row.deals} deals</p>
      </div>
      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
        {row.leadConversionRate.toFixed(1)}%
      </span>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
      <div>
        <p className="text-slate-500">Pipeline</p>
        <p className="font-semibold text-slate-800">{formatCurrencyShort(Number(row.pipelineValue || 0))}</p>
      </div>
      <div>
        <p className="text-slate-500">Completed</p>
        <p className="font-semibold text-emerald-700">{row.completedActivities}</p>
      </div>
      <div>
        <p className="text-slate-500">Overdue</p>
        <p className="font-semibold text-rose-600">{row.overdueActivities}</p>
      </div>
    </div>
  </div>
)

const ChartCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="shell-card p-5">
    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center justify-between">{title}{action}</h3>
    <div className="h-[280px] flex items-center">{children}</div>
  </div>
)

const Mini = ({ label, value, cls }: { label: string; value: number; cls: string }) => (
  <div className={`rounded-lg p-3 ${cls.split(' ')[0]}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${cls.split(' ')[1]}`}>{value}</p>
  </div>
)

const Funnel = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="text-center flex-1">
    <div className={`${color} text-white rounded-lg py-4 px-3 mb-2`}><p className="text-2xl font-bold">{value}</p></div>
    <p className="text-xs text-gray-600 font-medium">{label}</p>
  </div>
)

const Arrow = () => (
  <svg className="w-6 h-6 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const Empty = () => <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No data available</div>

export default DashboardPage
