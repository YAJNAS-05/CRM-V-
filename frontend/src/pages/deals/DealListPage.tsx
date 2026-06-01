import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dealApi } from '../../api/crmApi'
import { Deal } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import DealsViewHeader from './components/DealsViewHeader'

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: 'bg-gray-100 text-gray-800',
  QUALIFICATION: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-yellow-100 text-yellow-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
}
const STAGES = ['', 'PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']

const DealListPage: React.FC = () => {
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canCreate = permissions?.includes('CRM_CREATE') ?? false
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  useEffect(() => { fetchDeals() }, [page, pageSize, stageFilter, searchQuery])
  useEffect(() => { setPage(0); setSelectedRows(new Set()) }, [stageFilter, searchQuery])

  const fetchDeals = async () => {
    try {
      setIsLoading(true)
      const query = searchQuery.trim()
      let resp
      if (query.length > 0) {
        // Text search — pass stage as extra filter if set
        resp = await dealApi.search(query, page, pageSize, stageFilter || undefined)
      } else if (stageFilter.length > 0) {
        // Stage-only filter — use dedicated endpoint
        resp = await dealApi.getByStage(stageFilter, page, pageSize)
      } else {
        resp = await dealApi.getAll(page, pageSize)
      }
      const data = resp.data.data
      if (data?.content) { setDeals(data.content); setTotalPages(data.totalPages || 1); setTotalItems(data.totalElements || data.content.length) }
      else if (Array.isArray(data)) { setDeals(data); setTotalPages(1); setTotalItems(data.length) }
      else { setDeals([]) }
    } catch { toast.error('Failed to load deals') } finally { setIsLoading(false) }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canDelete) {
      toast.error('You do not have permission to delete deals')
      return
    }
    if (!confirm('Delete this deal?')) return
    try { await dealApi.delete(id); toast.success('Deal deleted'); fetchDeals() } catch { toast.error('Failed to delete') }
  }

  const toggleRow = (id: string) => { setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  const toggleAll = () => { setSelectedRows(prev => prev.size === deals.length ? new Set() : new Set(deals.map(d => d.id))) }

  const fmt = (v?: number) => v ? `$${v.toLocaleString()}` : '—'

  const visibleValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const averageVisibleDeal = deals.length > 0 ? visibleValue / deals.length : 0
  const closingSoon = deals.filter((deal) => {
    if (!deal.expectedCloseDate) return false
    const closeDate = new Date(deal.expectedCloseDate)
    if (Number.isNaN(closeDate.getTime())) return false
    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return closeDate >= today && closeDate <= thirtyDaysFromNow
  }).length

  const headerMetrics = [
    { label: 'Open Deals', value: totalItems },
    { label: 'Visible Value', value: fmt(visibleValue) },
    { label: 'Avg Deal Size', value: fmt(averageVisibleDeal) },
    { label: 'Closing in 30 Days', value: closingSoon },
  ]

  const exportToExcel = () => {
    const rows = deals.map(d => ({
      'Deal Name': d.name || '',
      'Stage': d.stage?.replace('_', ' ') || '',
      'Amount': d.amount || 0,
      'Probability (%)': d.probability || 0,
      'Close Date': d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '',
      'Lead Source': d.leadSource || '',
      'Description': d.description || '',
      'Created': new Date(d.createdAt).toLocaleDateString(),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Deals')
    XLSX.writeFile(wb, `EVERX_Deals_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-5">
      <DealsViewHeader
        activeView="list"
        title="Deal Workboard"
        subtitle="Fresh list view for quick scanning and updates."
        metrics={headerMetrics}
        canCreate={canCreate}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search deals..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(0) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Stages</option>
            {STAGES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button onClick={exportToExcel} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          {(searchQuery || stageFilter) && <button onClick={() => { setSearchQuery(''); setStageFilter('') }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={selectedRows.size === deals.length && deals.length > 0} onChange={toggleAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deal Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Probability</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Close Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="w-16 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center">
                  <div className="text-gray-400">
                    <p className="text-sm font-medium">No Deals Found</p>
                    <FeatureGate requiredPermission="CRM_CREATE">
                      <Link to="/crm/deals/new" className="inline-block mt-3 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">New Deal</Link>
                    </FeatureGate>
                  </div>
                </td></tr>
              ) : deals.map(deal => (
                <tr key={deal.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedRows.has(deal.id)} onChange={() => toggleRow(deal.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/crm/deals/${deal.id}`} onClick={e => e.stopPropagation()} className="font-medium text-indigo-600 hover:text-indigo-800">{deal.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800'}`}>{deal.stage?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{fmt(deal.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${deal.probability || 0}%` }}></div></div>
                      <span className="text-xs text-gray-500">{deal.probability || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(deal.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <FeatureGate requiredPermission="CRM_DELETE">
                      <button onClick={e => handleDelete(deal.id, e)} className="p-1 text-gray-400 hover:text-red-600 rounded transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </FeatureGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalItems)} of {totalItems}</span>
              <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(0) }} className="ml-2 border border-gray-200 rounded px-2 py-1 text-xs">{[10,25,50,100].map(s => <option key={s} value={s}>{s} / page</option>)}</select>
            </div>
            <div className="flex gap-1">
              <button disabled={page===0} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {Array.from({length: Math.min(totalPages,5)},(_,i) => (<button key={i} onClick={() => setPage(i)} className={`px-3 py-1.5 text-xs font-medium border rounded ${page===i?'bg-indigo-600 text-white border-indigo-600':'border-gray-200 hover:bg-gray-100'}`}>{i+1}</button>))}
              <button disabled={page>=totalPages-1} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealListPage
