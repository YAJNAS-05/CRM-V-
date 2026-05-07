import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { leadApi } from '../../api/crmApi'
import { Lead } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { getErrorMessage } from '../../utils/errorUtils'
import { useOptionSet } from '../../hooks/useOptionSet'
import { getOptionLabel } from '../../utils/optionSet'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  UNQUALIFIED: 'bg-red-100 text-red-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
}

const FALLBACK_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED']
const FALLBACK_SOURCES = ['WEB', 'REFERRAL', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'OTHER']

const LeadListPage: React.FC = () => {
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canCreate = permissions?.includes('CRM_CREATE') ?? false
  const canEdit = permissions?.includes('CRM_EDIT') ?? false
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'status' } | null>(null)
  const { options: statusOptions } = useOptionSet({
    module: 'CRM',
    entity: 'LEAD',
    field: 'status',
    fallbackValues: FALLBACK_STATUSES,
  })
  const { options: sourceOptions } = useOptionSet({
    module: 'CRM',
    entity: 'LEAD',
    field: 'leadSource',
    fallbackValues: FALLBACK_SOURCES,
  })

  useEffect(() => { fetchLeads() }, [page, pageSize, statusFilter, sourceFilter, searchQuery, sortField, sortDir])
  useEffect(() => { setPage(0); setSelectedRows(new Set()) }, [statusFilter, sourceFilter, searchQuery])
  useEffect(() => {
    setSelectedRows((prev) => new Set(Array.from(prev).filter((id) => leads.some((lead) => lead.id === id))))
  }, [leads])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const query = searchQuery.trim()
      const shouldSearch = query.length > 0 || statusFilter.length > 0 || sourceFilter.length > 0
      const resp = shouldSearch
        ? await leadApi.search(query, page, pageSize, sortField, sortDir, statusFilter || undefined, sourceFilter || undefined)
        : await leadApi.getAll(page, pageSize, sortField, sortDir)
      const data = resp.data.data
      if (data?.content) {
        setLeads(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.totalElements || data.content.length)
      } else if (Array.isArray(data)) {
        setLeads(data)
        setTotalPages(1)
        setTotalItems(data.length)
      } else {
        setLeads([])
      }
    } catch (err) { toast.error(getErrorMessage(err, 'Failed to load leads')) } finally { setIsLoading(false) }
  }

  const handleInlineStatusChange = async (id: string, newStatus: string) => {
    setEditingCell(null)
    if (!canEdit) { toast.error('No permission to edit'); return }
    try {
      await leadApi.update(id, { status: newStatus })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      toast.success('Status updated')
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {    e.stopPropagation()
    if (!canDelete) {
      toast.error('You do not have permission to delete leads')
      return
    }
    if (!confirm('Delete this lead?')) return
    try {
      await leadApi.delete(id)
      toast.success('Lead deleted')
      fetchLeads()
    } catch { toast.error('Failed to delete') }
  }

  const toggleRow = (id: string) => {
    setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const toggleAll = () => {
    setSelectedRows((prev) => {
      const visibleIds = leads.map((lead) => lead.id)
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id))
      const next = new Set(prev)

      visibleIds.forEach((id) => {
        if (allVisibleSelected) next.delete(id)
        else next.add(id)
      })

      return next
    })
  }

  const selectedLeadIds = leads.filter((lead) => selectedRows.has(lead.id)).map((lead) => lead.id)
  const allFilteredSelected = leads.length > 0 && leads.every((lead) => selectedRows.has(lead.id))

  const handleBulkAssign = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to edit leads')
      return
    }
    if (selectedLeadIds.length === 0) return

    const ownerId = prompt('Enter owner user ID (UUID) to assign selected leads:')?.trim()
    if (!ownerId) return

    const results = await Promise.allSettled(selectedLeadIds.map((id) => leadApi.update(id, { ownerId })))
    const success = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.length - success

    if (success > 0) {
      toast.success(`Assigned ${success} lead${success === 1 ? '' : 's'}`)
      fetchLeads()
    }
    if (failed > 0) toast.error(`Failed to assign ${failed} lead${failed === 1 ? '' : 's'}`)
    setSelectedRows(new Set())
  }

  const handleBulkStatusChange = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to edit leads')
      return
    }
    if (selectedLeadIds.length === 0) return

    const allowedStatuses = statusOptions.map((option) => option.value)
    const nextStatus = prompt(`Enter new status (${allowedStatuses.join(', ')}):`)?.trim().toUpperCase()
    if (!nextStatus) return

    if (!allowedStatuses.includes(nextStatus)) {
      toast.error('Invalid status')
      return
    }

    const results = await Promise.allSettled(selectedLeadIds.map((id) => leadApi.update(id, { status: nextStatus })))
    const success = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.length - success

    if (success > 0) {
      toast.success(`Updated ${success} lead${success === 1 ? '' : 's'}`)
      fetchLeads()
    }
    if (failed > 0) toast.error(`Failed to update ${failed} lead${failed === 1 ? '' : 's'}`)
    setSelectedRows(new Set())
  }

  const handleBulkDelete = async () => {
    if (!canDelete) {
      toast.error('You do not have permission to delete leads')
      return
    }
    if (selectedLeadIds.length === 0) return
    if (!confirm(`Delete ${selectedLeadIds.length} selected lead${selectedLeadIds.length === 1 ? '' : 's'}?`)) return

    const results = await Promise.allSettled(selectedLeadIds.map((id) => leadApi.delete(id)))
    const success = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.length - success

    if (success > 0) {
      toast.success(`Deleted ${success} lead${success === 1 ? '' : 's'}`)
      fetchLeads()
    }
    if (failed > 0) toast.error(`Failed to delete ${failed} lead${failed === 1 ? '' : 's'}`)
    setSelectedRows(new Set())
  }

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalItems)

  const exportToExcel = () => {
    const data = leads.map(l => ({
      'Name': `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim(),
      'Company': l.company ?? '',
      'Email': l.email ?? '',
      'Phone': l.phone ?? '',
      'Status': l.status ?? '',
      'Source': l.leadSource ?? '',
      'City': l.city ?? '',
      'Country': l.country ?? '',
      'Created': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    XLSX.writeFile(wb, `EVERX_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          <FeatureGate requiredPermission="CRM_CREATE">
            <Link to="/crm/leads/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Lead
            </Link>
          </FeatureGate>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.value}>{option.label || option.value}</option>
            ))}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Sources</option>
            {sourceOptions.map((option) => (
              <option key={option.id} value={option.value}>{option.label || option.value}</option>
            ))}
          </select>
          {(searchQuery || statusFilter || sourceFilter) && (
            <button onClick={() => { setSearchQuery(''); setStatusFilter(''); setSourceFilter('') }} className="text-sm text-gray-500 hover:text-gray-700">Clear Filters</button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeadIds.length > 0 && (canEdit || canDelete) && (
        <div className="bg-indigo-50 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-indigo-700 font-medium">{selectedLeadIds.length} selected</span>
          <div className="flex gap-2">
            <FeatureGate requiredPermission="CRM_EDIT">
                <button onClick={handleBulkAssign} className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded border hover:bg-gray-50">Assign To</button>
                <button onClick={handleBulkStatusChange} className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded border hover:bg-gray-50">Change Status</button>
            </FeatureGate>
            <FeatureGate requiredPermission="CRM_DELETE">
              <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100">Delete</button>
            </FeatureGate>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => { setSortField('firstName'); setSortDir(d => d === 'asc' ? 'desc' : 'asc') }}>Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900" onClick={() => { setSortField('createdAt'); setSortDir(d => d === 'asc' ? 'desc' : 'asc') }}>Created</th>
                <th className="w-16 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={10} className="px-4 py-16 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-16 text-center">
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-sm font-medium">No Leads Found</p>
                    <p className="text-xs mt-1">Get started by adding your first lead.</p>
                    <FeatureGate requiredPermission="CRM_CREATE">
                      <Link to="/crm/leads/new" className="inline-block mt-3 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">New Lead</Link>
                    </FeatureGate>
                  </div>
                </td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/crm/leads/${lead.id}`)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedRows.has(lead.id)} onChange={() => toggleRow(lead.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/crm/leads/${lead.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-indigo-600 hover:text-indigo-800">
                      {lead.salutation ? `${lead.salutation} ` : ''}{lead.firstName} {lead.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.company || '—'}</td>
                  <td className="px-4 py-3">
                    {lead.email ? <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="text-gray-600 hover:text-indigo-600">{lead.email}</a> : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone || '—'}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {editingCell?.id === lead.id && editingCell.field === 'status' ? (
                      <select
                        autoFocus
                        value={lead.status}
                        onBlur={() => setEditingCell(null)}
                        onChange={e => handleInlineStatusChange(lead.id, e.target.value)}
                        className="text-xs border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                      >
                        {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label || o.value}</option>)}
                      </select>
                    ) : (
                      <span
                        title={canEdit ? 'Click to edit status' : undefined}
                        onClick={canEdit ? () => setEditingCell({ id: lead.id, field: 'status' }) : undefined}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'} ${canEdit ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300' : ''}`}
                      >
                        {getOptionLabel(statusOptions, lead.status)}
                        {canEdit && <svg className="ml-1 w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.rating ? (
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= lead.rating! ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{getOptionLabel(sourceOptions, lead.leadSource) || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <FeatureGate requiredPermission="CRM_DELETE">
                      <button onClick={(e) => handleDelete(lead.id, e)} className="p-1 text-gray-400 hover:text-red-600 rounded transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </FeatureGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Showing {from}–{to} of {totalItems} records</span>
              <select value={pageSize} onChange={(e) => { setPageSize(+e.target.value); setPage(0) }} className="ml-2 border border-gray-200 rounded px-2 py-1 text-xs">
                {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const startPage = Math.max(0, Math.min(page - 2, totalPages - 5))
                const pageIndex = startPage + i
                return (
                  <button key={pageIndex} onClick={() => setPage(pageIndex)} className={`px-3 py-1.5 text-xs font-medium border rounded ${page === pageIndex ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-100'}`}>{pageIndex + 1}</button>
                )
              })}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadListPage
