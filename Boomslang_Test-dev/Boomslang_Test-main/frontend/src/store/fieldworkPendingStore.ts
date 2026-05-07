// Store to track pending field work changes when network is offline
// Helps prevent data loss when user switches devices

import { create } from 'zustand'
import { FieldJobDto } from '../types/fieldwork'

export interface PendingFieldJobChange {
  id: string // Unique ID for this pending change
  jobId: string | number
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  data: FieldJobDto | null // null for DELETE operations
  timestamp: number
  retryCount: number
  lastError?: string
}

interface FieldworkPendingStore {
  // State
  pendingChanges: Map<string, PendingFieldJobChange>
  isSyncing: boolean
  syncError?: string
  lastSyncTime?: number

  // Actions
  addPendingChange: (change: Omit<PendingFieldJobChange, 'id' | 'timestamp' | 'retryCount'>) => string
  removePendingChange: (changeId: string) => void
  clearPendingChanges: () => void
  getPendingChanges: () => PendingFieldJobChange[]
  hasPendingChanges: () => boolean
  getSyncStatus: () => { isSyncing: boolean; count: number; error?: string }

  // Sync state
  setSyncing: (syncing: boolean) => void
  setSyncError: (error?: string) => void
  updateSyncTime: () => void
  incrementRetry: (changeId: string) => void
  markChangeError: (changeId: string, error: string) => void
}

export const useFieldworkPendingStore = create<FieldworkPendingStore>((set, get) => ({
  pendingChanges: new Map(),
  isSyncing: false,
  syncError: undefined,
  lastSyncTime: undefined,

  addPendingChange: (change) => {
    const id = `${change.operation}_${change.jobId}_${Date.now()}`
    const pendingChange: PendingFieldJobChange = {
      ...change,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    }

    set((state) => {
      const newMap = new Map(state.pendingChanges)
      newMap.set(id, pendingChange)
      return { pendingChanges: newMap }
    })

    return id
  },

  removePendingChange: (changeId) => {
    set((state) => {
      const newMap = new Map(state.pendingChanges)
      newMap.delete(changeId)
      return { pendingChanges: newMap }
    })
  },

  clearPendingChanges: () => {
    set({ pendingChanges: new Map() })
  },

  getPendingChanges: () => {
    const state = get()
    return Array.from(state.pendingChanges.values()).sort((a, b) => a.timestamp - b.timestamp)
  },

  hasPendingChanges: () => {
    const state = get()
    return state.pendingChanges.size > 0
  },

  getSyncStatus: () => {
    const state = get()
    return {
      isSyncing: state.isSyncing,
      count: state.pendingChanges.size,
      error: state.syncError,
    }
  },

  setSyncing: (syncing) => {
    set({ isSyncing: syncing })
  },

  setSyncError: (error) => {
    set({ syncError: error })
  },

  updateSyncTime: () => {
    set({ lastSyncTime: Date.now(), syncError: undefined })
  },

  incrementRetry: (changeId) => {
    set((state) => {
      const newMap = new Map(state.pendingChanges)
      const change = newMap.get(changeId)
      if (change) {
        change.retryCount += 1
        newMap.set(changeId, change)
      }
      return { pendingChanges: newMap }
    })
  },

  markChangeError: (changeId, error) => {
    set((state) => {
      const newMap = new Map(state.pendingChanges)
      const change = newMap.get(changeId)
      if (change) {
        change.lastError = error
        newMap.set(changeId, change)
      }
      return { pendingChanges: newMap }
    })
  },
}))
