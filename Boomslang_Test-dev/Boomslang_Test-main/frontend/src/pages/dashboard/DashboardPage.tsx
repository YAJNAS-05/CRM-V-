import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reportApi } from '../../api/crmApi'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { toast } from 'sonner'

const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: '#3b82f6', CONTACTED: '#f59e0b', QUALIFIED: '#10b981', UNQUALIFIED: '#ef4444', CONVERTED: '#8b5cf6',
}
const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#9ca3af', QUALIFICATION: '#3b82f6', PROPOSAL: '#f59e0b', NEGOTIATION: '#f97316', CLOSED_WON: '#10b981', CLOSED_LOST: '#ef4444',
}

const DashboardPage: React.FC = () => {
  const [kpi, setKpi] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any>(null)
  const [conversion, setConversion] = useState<any>(null)
  const [activities, setActivities] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [d, p, c, a] = await Promise.allSettled([
        reportApi.getDashboard(), reportApi.getPipeline(), reportApi.getConversion(), reportApi.getActivities(),
      ])
      if (d.status === 'fulfilled') setKpi(d.value.data.data)
      if (p.status === 'fulfilled') setPipeline(p.value.data.data)
      if (c.status === 'fulfilled') setConversion(c.value.data.data)
      if (a.status === 'fulfilled') setActivities(a.value.data.data)
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

  const fmt = (val: number) => {
    if (val >= 1_000_000) return `₹${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`
    return `₹${val.toLocaleString()}`
  }

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">CRM performance overview</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI icon="👥" bg="bg-blue-50" title="Total Leads" value={kpi?.totalLeads ?? 0} />
        <KPI icon="📇" bg="bg-green-50" title="Contacts" value={kpi?.totalContacts ?? 0} />
        <KPI icon="📈" bg="bg-purple-50" title="Open Deals" value={kpi?.openDeals ?? 0} />
        <KPI icon="💰" bg="bg-amber-50" title="Pipeline Value" value={fmt(kpi?.totalPipelineValue ?? 0)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI icon="✅" bg="bg-green-50" title="Won Deals" value={kpi?.wonDeals ?? 0} />
        <KPI icon="❌" bg="bg-red-50" title="Lost Deals" value={kpi?.lostDeals ?? 0} />
        <KPI icon="⚡" bg="bg-orange-50" title="Activities" value={activities?.totalActivities ?? 0} />
        <KPI icon="📊" bg="bg-teal-50" title="Win Rate" value={`${(kpi?.winRate ?? 0).toFixed(1)}%`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Pipeline by Stage">
          {pipeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={fmt} />
                <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={100} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Value']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
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

        <ChartCard title="Activity Summary" action={<Link to="/crm/activities" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all →</Link>}>
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

      {/* Conversion Funnel */}
      {conversion && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
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

const KPI = ({ icon, bg, title, value }: { icon: string; bg: string; title: string; value: string | number }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-lg`}>{icon}</div>
      <div><p className="text-xs text-gray-500">{title}</p><p className="text-lg font-bold text-gray-900 leading-tight">{value}</p></div>
    </div>
  </div>
)

const ChartCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
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
