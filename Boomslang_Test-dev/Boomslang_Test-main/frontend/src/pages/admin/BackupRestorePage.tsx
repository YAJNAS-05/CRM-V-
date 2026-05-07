import React, { useState } from 'react'
import { toast } from 'sonner'

type BackupEntry = {
  id: string
  name: string
  type: 'Full' | 'Incremental'
  size: string
  status: 'completed' | 'failed' | 'in-progress'
  createdAt: string
  workspace: string
}

const DEMO_BACKUPS: BackupEntry[] = [
  { id: 'bkp-001', name: 'Full Backup – 2024-11-01', type: 'Full', size: '4.2 GB', status: 'completed', createdAt: '2024-11-01 03:00', workspace: 'everx-au' },
  { id: 'bkp-002', name: 'Incremental – 2024-11-08', type: 'Incremental', size: '320 MB', status: 'completed', createdAt: '2024-11-08 03:00', workspace: 'everx-au' },
  { id: 'bkp-003', name: 'Full Backup – 2024-11-01', type: 'Full', size: '2.8 GB', status: 'completed', createdAt: '2024-11-01 03:15', workspace: 'everx-us' },
  { id: 'bkp-004', name: 'Incremental – 2024-11-08', type: 'Incremental', size: '180 MB', status: 'failed', createdAt: '2024-11-08 03:15', workspace: 'everx-us' },
]

const STATUS_BADGE: Record<BackupEntry['status'], string> = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
}

const BackupRestorePage: React.FC = () => {
  const [backups, setBackups] = useState<BackupEntry[]>(DEMO_BACKUPS)
  const [runningBackup, setRunningBackup] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null)
  const [restoreConfirm, setRestoreConfirm] = useState('')
  const [schedule, setSchedule] = useState({ daily: true, weekly: true, retention: '30' })

  const handleTriggerBackup = () => {
    setRunningBackup(true)
    const entry: BackupEntry = {
      id: 'bkp-' + Date.now(),
      name: `Full Backup – ${new Date().toISOString().slice(0, 10)}`,
      type: 'Full',
      size: '—',
      status: 'in-progress',
      createdAt: new Date().toLocaleString(),
      workspace: 'everx-au',
    }
    setBackups(prev => [entry, ...prev])
    toast.info('Backup started…')
    setTimeout(() => {
      setBackups(prev => prev.map(b => b.id === entry.id ? { ...b, status: 'completed', size: '4.4 GB' } : b))
      setRunningBackup(false)
      toast.success('Backup completed successfully')
    }, 3000)
  }

  const handleRestore = () => {
    if (restoreConfirm !== 'RESTORE') { toast.error('Type RESTORE to confirm'); return }
    toast.success(`Restore from "${restoreTarget?.name}" initiated. This may take several minutes.`)
    setRestoreTarget(null)
    setRestoreConfirm('')
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">Backup &amp; Restore</h1>
          <p className="text-gray-500 mt-2">Manage system backups and restore points.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Manual backup */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Manual Backup</h2>
            <p className="text-sm text-gray-500 mb-4">Trigger an immediate full backup of all workspace data.</p>
            <button onClick={handleTriggerBackup} disabled={runningBackup}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold disabled:opacity-50 text-sm">
              {runningBackup ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Running…
                </>
              ) : '▶ Run Backup Now'}
            </button>
          </div>

          {/* Backup schedule */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Backup Schedule</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={schedule.daily} onChange={e => setSchedule(p => ({ ...p, daily: e.target.checked }))} className="w-4 h-4 rounded" />
                Daily incremental backup (3:00 AM)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={schedule.weekly} onChange={e => setSchedule(p => ({ ...p, weekly: e.target.checked }))} className="w-4 h-4 rounded" />
                Weekly full backup (Sunday 2:00 AM)
              </label>
              <div className="flex items-center gap-2 text-sm">
                <label className="font-medium text-gray-600">Retention:</label>
                <select value={schedule.retention} onChange={e => setSchedule(p => ({ ...p, retention: e.target.value }))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
            <button onClick={() => toast.success('Schedule saved')}
              className="mt-3 px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200">
              Save Schedule
            </button>
          </div>
        </div>

        {/* Backup history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Backup History</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Backup Name', 'Type', 'Size', 'Status', 'Date', 'Workspace', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {backups.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.type}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.size}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{b.createdAt}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.workspace}</td>
                  <td className="px-4 py-3">
                    {b.status === 'completed' && (
                      <button onClick={() => setRestoreTarget(b)}
                        className="text-xs px-3 py-1 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 font-medium">
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Restore confirmation modal */}
        {restoreTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Confirm Restore</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This will restore data from <strong>{restoreTarget.name}</strong>. All current data will be overwritten.
                This action cannot be undone.
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">Type <code className="bg-gray-100 px-1 rounded">RESTORE</code> to confirm:</label>
                <input value={restoreConfirm} onChange={e => setRestoreConfirm(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="RESTORE" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setRestoreTarget(null); setRestoreConfirm('') }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleRestore}
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold">
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BackupRestorePage
