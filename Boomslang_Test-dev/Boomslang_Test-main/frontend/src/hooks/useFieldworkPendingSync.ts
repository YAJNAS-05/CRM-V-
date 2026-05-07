// Hook to sync pending field work changes when network becomes available
// Automatically attempts to upload pending changes to the backend

import { useEffect, useRef } from 'react'
import { useFieldworkPendingStore } from '../store/fieldworkPendingStore'
import { fieldworkApi } from '../api/fieldworkApi'
import { toast } from 'sonner'

export function useFieldworkPendingSync() {
  const {
    getPendingChanges,
    removePendingChange,
    setSyncing,
    setSyncError,
    updateSyncTime,
    incrementRetry,
    markChangeError,
  } = useFieldworkPendingStore()

  const syncInProgressRef = useRef(false)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const attemptSync = async () => {
    if (syncInProgressRef.current) return

    const changes = getPendingChanges()
    if (changes.length === 0) return

    syncInProgressRef.current = true
    setSyncing(true)

    try {
      let successCount = 0
      let failureCount = 0

      for (const change of changes) {
        try {
          // Process each pending change
          switch (change.operation) {
            case 'CREATE':
              if (change.data) {
                await fieldworkApi.createFieldJob(change.data)
                successCount++
                removePendingChange(change.id)
              }
              break

            case 'UPDATE':
              if (change.data) {
                await fieldworkApi.updateFieldJob(change.jobId, change.data)
                successCount++
                removePendingChange(change.id)
              }
              break

            case 'DELETE':
              await fieldworkApi.deleteFieldJob(change.jobId)
              successCount++
              removePendingChange(change.id)
              break
          }
        } catch (error: any) {
          failureCount++
          incrementRetry(change.id)
          markChangeError(change.id, error?.message || 'Unknown error')

          // Stop trying if we hit max retries
          if (change.retryCount >= 3) {
            removePendingChange(change.id)
            toast.error(`Failed to sync field job after 3 attempts: ${error?.message || 'Unknown error'}`)
          }
        }
      }

      if (successCount > 0) {
        updateSyncTime()
        toast.success(`✓ Synced ${successCount} pending field job change${successCount === 1 ? '' : 's'}`)
      }

      if (failureCount > 0) {
        setSyncError(`${failureCount} pending change${failureCount === 1 ? '' : 's'} failed to sync`)
      } else {
        setSyncError(undefined)
      }
    } finally {
      syncInProgressRef.current = false
      setSyncing(false)
    }
  }

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      // Retry sync after network comes back online
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(attemptSync, 500)
    }

    const handleOffline = () => {
      // Clear any pending sync attempts when going offline
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Attempt initial sync when hook mounts
    attemptSync()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  return {
    attemptSync,
  }
}
