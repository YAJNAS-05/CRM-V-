import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue: string
  newValue: string
  ipAddress: string
  timestamp: string
  userId: string
}

const exportCSV = (logs: AuditLog[]) => {
  const headers = ['ID', 'Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User ID', 'IP Address']
  const rows = logs.map((l) => [l.id, l.timestamp, l.action, l.entityType, l.entityId || '', l.userId || '', l.ipAddress || ''])
  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getAuditLogs(page, pageSize)
      setLogs(response.data.data?.content || [])
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && logs.length === 0) return <div className="p-10 text-center font-bold text-slate-400">Loading Secure Audit Trail...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Log</h1>
          <p className="text-slate-500 font-medium">Immutable record of all administrative and operational mutations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportCSV(logs)}
            disabled={logs.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 text-xs font-black uppercase tracking-widest">
             Status: Compliant
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic font-medium text-sm">No log entries found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                     {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter uppercase ${
                       log.action.includes('DELETE') ? 'bg-red-50 text-red-600' : 
                       log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                        {log.action}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-xs font-bold text-slate-900">{log.entityType}</p>
                     <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{log.entityId || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-500 uppercase">{log.userId || 'System'}</td>
                  <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="text-xs font-black text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition uppercase tracking-widest"
        >
          &larr; Earlier
        </button>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={logs.length < pageSize}
          className="text-xs font-black text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition uppercase tracking-widest"
        >
          Later &rarr;
        </button>
      </div>
    </div>
  )
}

export default AuditLogPage
