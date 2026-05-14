import { useNotificationStore } from '../store/notificationStore'
import { useSettingsStore } from '../store/settingsStore'
import { notificationApi } from '../api/notificationApi'

/**
 * Hook for managing notifications
 * Provides methods to add different types of notifications
 */
export const useNotification = () => {
  const { addNotification } = useNotificationStore()
  const { notificationsEnabled, inAppNotifications } = useSettingsStore((state) => state.settings)

  const canNotify = notificationsEnabled && inAppNotifications

  const persistNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, dedupeKey?: string) => {
    notificationApi.createNotification({ type, title, message, dedupeKey }).catch(() => {
      // Local notification should still work even if backend persistence fails.
    })
  }

  return {
    success: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'success', title, message, duration, dedupeKey })
      persistNotification('success', title, message, dedupeKey)
    },
    error: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'error', title, message, duration, dedupeKey })
      persistNotification('error', title, message, dedupeKey)
    },
    warning: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'warning', title, message, duration, dedupeKey })
      persistNotification('warning', title, message, dedupeKey)
    },
    info: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'info', title, message, duration, dedupeKey })
      persistNotification('info', title, message, dedupeKey)
    },
  }
}
