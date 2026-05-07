// Component to display pending field work changes and sync status
// Shows warning when there are unsaved changes stored locally

import React from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useFieldworkPendingStore, PendingFieldJobChange } from '../../store/fieldworkPendingStore'

interface FieldworkPendingIndicatorProps {
  compact?: boolean
  showDetails?: boolean
}

export const FieldworkPendingIndicator: React.FC<FieldworkPendingIndicatorProps> = ({
  compact = false,
  showDetails = false,
}) => {
  const { hasPendingChanges, getSyncStatus, getPendingChanges } = useFieldworkPendingStore()

  if (!hasPendingChanges()) {
    return null
  }

  const { isSyncing, count, error } = getSyncStatus()
  const changes = showDetails ? getPendingChanges() : []

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-800 px-3 py-2 rounded-lg border border-amber-200">
        <AlertCircle size={16} />
        <span>{count} pending change{count === 1 ? '' : 's'}</span>
        {isSyncing && <Loader2 size={14} className="animate-spin ml-auto" />}
      </div>
    )
  }

  return (
    <div className="w-full bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {isSyncing ? (
            <Loader2 size={20} className="text-amber-600 animate-spin" />
          ) : (
            <AlertCircle size={20} className="text-amber-600" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">
            {isSyncing ? 'Syncing changes...' : 'Unsaved changes stored locally'}
          </h3>

          <p className="text-sm text-amber-800 mt-1">
            {count} field job change{count === 1 ? '' : 's'} have been saved to your device but not yet synced
            to the server. These changes will be automatically synced when your connection is restored.
          </p>

          {error && (
            <p className="text-sm text-amber-700 mt-2 font-medium">
              ⚠️ Sync error: {error}
            </p>
          )}

          {showDetails && changes.length > 0 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium text-amber-900 hover:text-amber-700">
                View pending changes ({changes.length})
              </summary>
              <ul className="mt-2 space-y-1 ml-4">
                {changes.map((change: PendingFieldJobChange) => (
                  <li key={change.id} className="text-amber-700">
                    <span className="font-mono text-xs bg-amber-100 px-2 py-1 rounded">
                      {change.operation}
                    </span>
                    {' '}
                    Job #{change.jobId} at{' '}
                    <span className="font-mono text-xs">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                    {change.lastError && (
                      <span className="text-red-700"> — {change.lastError}</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="text-xs text-amber-700 mt-2">
            💡 Tip: Keep this device online and active for the changes to sync automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
