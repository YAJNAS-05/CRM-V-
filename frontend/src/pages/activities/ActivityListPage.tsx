import { useState, useEffect } from 'react'
import { activityApi } from '../../api/crmApi'
import { Activity, CreateActivityRequest } from '../../types/crm'
import { useAuthStore } from '../../store/authStore'
import { FeatureGate } from '../../components/rbac'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

const TYPE_COLORS: Record<string, string> = {
  CALL: 'bg-blue-100 text-blue-700',
  EMAIL: 'bg-green-100 text-green-700',
  MEETING: 'bg-purple-100 text-purple-700',
  TASK: 'bg-amber-100 text-amber-700',
  NOTE: 'bg-gray-100 text-gray-700',
}
const TYPE_ICONS: Record<string, string> = {
  CALL: '📞', EMAIL: '✉️', MEETING: '🤝', TASK: '✅', NOTE: '📝',
}
const TYPES = ['ALL', 'CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']

export default function ActivityListPage() {
  const permissions = useAuthStore((state) => state.user?.permissions)
  const canCreate = permissions?.includes('CRM_CREATE') ?? false
  const canEdit = permissions?.includes('CRM_EDIT') ?? false
  const canDelete = permissions?.includes('CRM_DELETE') ?? false
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createForm, setCreateForm] = useState<CreateActivityRequest>({
    type: 'CALL', subject: '', description: '', dueDate: '', status: 'PENDING', durationMins: undefined,
  })

  const resetCreateForm = () => setCreateForm({ type: 'CALL', subject: '', description: '', dueDate: '', status: 'PENDING', durationMins: undefined })

  const handleCreate = async () => {
    if (!canCreate) { toast.error('You do not have permission to create activities'); return }
    if (!createForm.type) { toast.error('Activity type is required'); return }
    if (!createForm.subject?.trim()) { toast.error('Subject is required'); return }
    try {
      setCreateSaving(true)
      const payload: any = { ...createForm }
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate).toISOString()
      else delete payload.dueDate
      if (!payload.durationMins) delete payload.durationMins
      await activityApi.create(payload)
      toast.success('Activity created!')
      setShowCreateModal(false)
      resetCreateForm()
      fetchActivities()
    } catch { toast.error('Failed to create activity') } finally { setCreateSaving(false) }
  }

  useEffect(() => { fetchActivities() }, [filter, page, pageSize])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      if (filter === 'overdue') {
        const r = await activityApi.getOverdue()
        if (r.data.success && r.data.data) { setActivities(r.data.data); setTotalPages(1); setTotalElements(r.data.data.length) }
      } else {
        const r = await activityApi.getAll(page, pageSize)
        if (r.data.success) { const d = r.data.data; setActivities(d.content || []); setTotalPages(d.totalPages || 1); setTotalElements(d.totalElements || 0) }
      }
    } catch { toast.error('Failed to load activities') } finally { setLoading(false) }
  }

  const handleComplete = async (id: string) => {
    if (!canEdit) { toast.error('You do not have permission to update activities'); return }
    try { await activityApi.complete(id); toast.success('Marked complete'); fetchActivities() } catch { toast.error('Failed') }
  }
  const handleDelete = async (id: string) => {
    if (!canDelete) { toast.error('You do not have permission to delete activities'); return }
    if (!confirm('Delete this activity?')) return
    try { await activityApi.delete(id); toast.success('Deleted'); fetchActivities() } catch { toast.error('Failed') }
  }

  const filtered = activities.filter(a => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false
    if (search) { const q = search.toLowerCase(); return (a.subject?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) }
    return true
  })

  const isOverdue = (a: Activity) => !a.completedAt && a.dueDate && new Date(a.dueDate) < new Date()

  const exportToExcel = () => {
    const data = filtered.map(a => ({
      'Type': a.type ?? '',
      'Subject': a.subject ?? '',
      'Description': a.description ?? '',
      'Due Date': a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '',
      'Duration (min)': a.durationMins ?? '',
      'Status': a.completedAt ? 'Completed' : (a.dueDate && new Date(a.dueDate) < new Date() ? 'Overdue' : 'Pending'),
      'Created': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{ wch: 10 }, { wch: 24 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Activities')
    XLSX.writeFile(wb, `EVERX_Activities_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalElements} total activities</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          <FeatureGate requiredPermission="CRM_CREATE">
            <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Activity
            </button>
          </FeatureGate>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button onClick={() => { setFilter('all'); setPage(0) }} className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>All</button>
          <button onClick={() => { setFilter('overdue'); setPage(0) }} className={`px-4 py-2 text-sm font-medium border-l ${filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Overdue</button>
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
          {TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-400 text-sm">No activities found</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[a.type] || 'bg-gray-100 text-gray-700'}`}>
                      {TYPE_ICONS[a.type] || '📋'} {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.subject || 'No subject'}</p>
                    {a.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{a.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {a.dueDate ? (
                      <span className={`text-xs ${isOverdue(a) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{new Date(a.dueDate).toLocaleDateString()}{isOverdue(a) && ' ⚠️'}</span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{a.durationMins ? `${a.durationMins} min` : '—'}</td>
                  <td className="px-4 py-3">
                    {a.completedAt ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOverdue(a) ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{isOverdue(a) ? 'Overdue' : 'Pending'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <FeatureGate requiredPermission="CRM_EDIT">
                        {!a.completedAt && (
                          <button onClick={() => handleComplete(a.id)} className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100" title="Complete">✓ Done</button>
                        )}
                      </FeatureGate>
                      <FeatureGate requiredPermission="CRM_DELETE">
                        <button onClick={() => handleDelete(a.id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </FeatureGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filter === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Rows per page:
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }} className="px-2 py-1 text-sm border border-gray-200 rounded">
              {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 mr-2">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Activity</h2>
            <p className="text-sm text-gray-500 mb-5">Log a new activity — call, email, meeting, task, or note</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type *</label>
                <div className="flex gap-2">
                  {(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE'] as const).map(t => (
                    <button key={t} onClick={() => setCreateForm(f => ({ ...f, type: t }))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${createForm.type === t ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {TYPE_ICONS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject *</label>
                <input type="text" value={createForm.subject || ''} onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Follow-up call with client" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={createForm.description || ''} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Details about this activity..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                  <input type="datetime-local" value={createForm.dueDate || ''} onChange={e => setCreateForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration (minutes)</label>
                  <input type="number" min="0" value={createForm.durationMins ?? ''} onChange={e => setCreateForm(f => ({ ...f, durationMins: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="30" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => { setShowCreateModal(false); resetCreateForm() }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleCreate} disabled={createSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                {createSaving ? 'Saving...' : 'Create Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
