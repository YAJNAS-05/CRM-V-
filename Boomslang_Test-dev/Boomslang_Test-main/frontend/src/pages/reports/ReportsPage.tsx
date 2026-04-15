import { useState, useEffect } from 'react'
import { reportApi } from '../../api/crmApi'
import { ReportDashboardKPIs, ReportPipeline, ReportConversion, ReportActivity } from '../../types/crm'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import * as XLSX from 'xlsx'

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#6366f1', QUALIFICATION: '#8b5cf6', PROPOSAL: '#f59e0b',
  NEGOTIATION: '#f97316', CLOSED_WON: '#10b981', CLOSED_LOST: '#ef4444',
}
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899']

export default function ReportsPage() {
  const [kpis, setKpis] = useState<ReportDashboardKPIs | null>(null)
  const [pipeline, setPipeline] = useState<ReportPipeline | null>(null)
  const [conversion, setConversion] = useState<ReportConversion | null>(null)
  const [activityReport, setActivityReport] = useState<ReportActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [r1, r2, r3, r4] = await Promise.allSettled([
        reportApi.getDashboard(), reportApi.getPipeline(), reportApi.getConversion(), reportApi.getActivities(),
      ])
      if (r1.status === 'fulfilled' && r1.value.data.success) setKpis(r1.value.data.data)
      if (r2.status === 'fulfilled' && r2.value.data.success) setPipeline(r2.value.data.data)
      if (r3.status === 'fulfilled' && r3.value.data.success) setConversion(r3.value.data.data)
      if (r4.status === 'fulfilled' && r4.value.data.success) setActivityReport(r4.value.data.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>

  const pipelineData = pipeline ? Object.entries(pipeline.dealCountByStage).map(([stage, count]) => ({
    stage: stage.replace('_', ' '), count, value: pipeline.dealValueByStage[stage] || 0,
  })) : []

  const leadStatusData = conversion ? Object.entries(conversion.leadsByStatus).map(([name, value]) => ({ name, value })) : []
  const leadSourceData = conversion ? Object.entries(conversion.leadsBySource).map(([name, value]) => ({ name, value })) : []
  const activityData = activityReport ? Object.entries(activityReport.activitiesByType).map(([name, value]) => ({ name, value })) : []

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    // Sheet 1: KPI Summary
    if (kpis) {
      const kpiRows = [
        { Metric: 'Total Leads', Value: kpis.totalLeads },
        { Metric: 'Total Contacts', Value: kpis.totalContacts },
        { Metric: 'Total Accounts', Value: kpis.totalAccounts },
        { Metric: 'Total Deals', Value: kpis.totalDeals },
        { Metric: 'Open Deals', Value: kpis.openDeals },
        { Metric: 'Won Deals', Value: kpis.wonDeals },
        { Metric: 'Lost Deals', Value: kpis.lostDeals },
        { Metric: 'Win Rate', Value: `${(kpis.winRate * 100).toFixed(1)}%` },
        { Metric: 'Total Pipeline Value ($)', Value: kpis.totalPipelineValue },
        { Metric: 'Won Value ($)', Value: kpis.wonValue },
      ]
      const ws1 = XLSX.utils.json_to_sheet(kpiRows)
      ws1['!cols'] = [{ wch: 25 }, { wch: 18 }]
      XLSX.utils.book_append_sheet(wb, ws1, 'KPI Summary')
    }

    // Sheet 2: Pipeline by Stage
    if (pipelineData.length > 0) {
      const pipeRows = pipelineData.map(d => ({
        Stage: d.stage,
        'Deal Count': d.count,
        'Value ($)': d.value,
        '% of Pipeline': pipeline!.totalPipelineValue > 0 ? `${((d.value / pipeline!.totalPipelineValue) * 100).toFixed(1)}%` : '0%',
      }))
      pipeRows.push({ Stage: 'TOTAL', 'Deal Count': pipelineData.reduce((s, d) => s + d.count, 0), 'Value ($)': pipeline!.totalPipelineValue, '% of Pipeline': '100%' })
      const ws2 = XLSX.utils.json_to_sheet(pipeRows)
      ws2['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, ws2, 'Pipeline by Stage')
    }

    // Sheet 3: Lead Analysis
    if (conversion) {
      const leadRows = [
        { Metric: 'Total Leads', Value: conversion.totalLeads },
        { Metric: 'Converted Leads', Value: conversion.convertedLeads },
        { Metric: 'Conversion Rate', Value: `${(conversion.conversionRate * 100).toFixed(1)}%` },
        { Metric: '', Value: '' },
        { Metric: '--- Lead Status ---', Value: '' },
        ...Object.entries(conversion.leadsByStatus).map(([status, count]) => ({ Metric: status, Value: count })),
        { Metric: '', Value: '' },
        { Metric: '--- Lead Sources ---', Value: '' },
        ...Object.entries(conversion.leadsBySource).map(([source, count]) => ({ Metric: source, Value: count })),
      ]
      const ws3 = XLSX.utils.json_to_sheet(leadRows)
      ws3['!cols'] = [{ wch: 22 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, ws3, 'Lead Analysis')
    }

    // Sheet 4: Activity Report
    if (activityReport) {
      const actRows = [
        { Metric: 'Total Activities', Value: activityReport.totalActivities },
        { Metric: 'Completed', Value: activityReport.completedActivities },
        { Metric: 'Pending', Value: activityReport.pendingActivities },
        { Metric: 'Overdue', Value: activityReport.overdueActivities },
        { Metric: '', Value: '' },
        { Metric: '--- By Type ---', Value: '' },
        ...Object.entries(activityReport.activitiesByType).map(([type, count]) => ({ Metric: type, Value: count })),
      ]
      const ws4 = XLSX.utils.json_to_sheet(actRows)
      ws4['!cols'] = [{ wch: 22 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, ws4, 'Activity Report')
    }

    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `EVERX_CRM_Report_${date}.xlsx`)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive CRM performance overview</p>
        </div>
        <button onClick={exportToExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export to Excel
        </button>
      </div>

      {/* KPI Summary */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Leads', value: kpis.totalLeads, color: 'text-indigo-600' },
            { label: 'Total Contacts', value: kpis.totalContacts, color: 'text-blue-600' },
            { label: 'Total Accounts', value: kpis.totalAccounts, color: 'text-purple-600' },
            { label: 'Open Deals', value: kpis.openDeals, color: 'text-amber-600' },
            { label: 'Won Deals', value: kpis.wonDeals, color: 'text-green-600' },
            { label: 'Lost Deals', value: kpis.lostDeals, color: 'text-red-600' },
            { label: 'Win Rate', value: `${(kpis.winRate * 100).toFixed(1)}%`, color: 'text-emerald-600' },
            { label: 'Pipeline Value', value: `$${kpis.totalPipelineValue.toLocaleString()}`, color: 'text-indigo-600' },
            { label: 'Won Value', value: `$${kpis.wonValue.toLocaleString()}`, color: 'text-green-600' },
            { label: 'Total Deals', value: kpis.totalDeals, color: 'text-gray-700' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{k.label}</p>
              <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline by Stage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline by Stage</h2>
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="count" name="Deals" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((d, i) => <Cell key={i} fill={STAGE_COLORS[d.stage.replace(' ', '_')] || PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No pipeline data</p>}
          {pipeline && <p className="text-xs text-gray-400 mt-2">Total pipeline: <span className="font-semibold text-gray-700">${pipeline.totalPipelineValue.toLocaleString()}</span></p>}
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Lead Status Distribution</h2>
          {leadStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={leadStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {leadStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No lead data</p>}
          {conversion && <p className="text-xs text-gray-400 mt-2">Conversion rate: <span className="font-semibold text-green-600">{(conversion.conversionRate * 100).toFixed(1)}%</span> ({conversion.convertedLeads}/{conversion.totalLeads})</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Sources */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Lead Sources</h2>
          {leadSourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadSourceData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No source data</p>}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity Breakdown</h2>
          {activityReport && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Total', value: activityReport.totalActivities, color: 'text-gray-700' },
                { label: 'Completed', value: activityReport.completedActivities, color: 'text-green-600' },
                { label: 'Pending', value: activityReport.pendingActivities, color: 'text-amber-600' },
                { label: 'Overdue', value: activityReport.overdueActivities, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activityData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Activities" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No activity data</p>}
        </div>
      </div>

      {/* Pipeline Value Table */}
      {pipelineData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Pipeline Value by Stage</h2></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Deals</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Value</th><th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">% of Pipeline</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {pipelineData.map(d => (
                <tr key={d.stage} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{d.stage}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{d.count}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">${d.value.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-gray-500">{pipeline!.totalPipelineValue > 0 ? ((d.value / pipeline!.totalPipelineValue) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
