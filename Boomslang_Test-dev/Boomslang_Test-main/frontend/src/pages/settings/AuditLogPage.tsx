import { useState, useEffect } from 'react'
import { settingsApi } from '../../api/settingsApi'
import { formatDateTime } from '../../utils/formatters'
import { Search, Filter, Download, Eye, ChevronDown, ChevronUp, Clock, User, Globe, Shield, FileText, Settings, Trash2 } from 'lucide-react'

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  resourceName: string
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  status: 'SUCCESS' | 'FAILURE' | 'PARTIAL'
}

interface AuditFilters {
  userId?: string
  action?: string
  resourceType?: string
  startDate?: string
  endDate?: string
  status?: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [page, filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('size', '20')
      
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.action) params.append('action', filters.action)
      if (filters.resourceType) params.append('resourceType', filters.resourceType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status) params.append('status', filters.status)

      const response = await settingsApi.getAuditLogs(params.toString())
      setLogs(response.data.data?.content || [])
      setTotalPages(response.data.data?.totalPages || 0)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return <FileText className="w-4 h-4 text-green-500" />
    if (action.includes('UPDATE')) return <Settings className="w-4 h-4 text-blue-500" />
    if (action.includes('DELETE')) return <Trash2 className="w-4 h-4 text-red-500" />
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <User className="w-4 h-4 text-purple-500" />
    if (action.includes('ACCESS')) return <Globe className="w-4 h-4 text-gray-500" />
    return <Shield className="w-4 h-4 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700'
      case 'FAILURE':
        return 'bg-red-100 text-red-700'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const exportLogs = async () => {
    try {
      const response = await settingsApi.exportAuditLogs(filters)
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500">Track all system activities and user actions</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
        
        {showFilters && (
          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">User</label>
              <input
                type="text"
                placeholder="Search by user name or email"
                value={filters.userId || ''}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="ACCESS">Access</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Resource Type</label>
              <select
                value={filters.resourceType || ''}
                onChange={(e) => setFilters({ ...filters, resourceType: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Resources</option>
                <option value="USER">User</option>
                <option value="LEAD">Lead</option>
                <option value="OPPORTUNITY">Opportunity</option>
                <option value="INVOICE">Invoice</option>
                <option value="FIELD_JOB">Field Job</option>
                <option value="SETTING">Setting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <>
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                          <p className="text-xs text-gray-500">{log.userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="text-sm text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{log.resourceType}</p>
                          <p className="text-xs text-gray-500">{log.resourceName || log.resourceId}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.ipAddress}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr>
                          <td colSpan={7} className="bg-gray-50 px-4 py-4">
                            <div className="max-w-3xl">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Event Details</h4>
                              <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono overflow-x-auto">
                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                              </div>
                              <div className="mt-3 text-xs text-gray-500">
                                <p><strong>User Agent:</strong> {log.userAgent}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
