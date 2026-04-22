import { useNotificationStore } from '../store/notificationStore'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Hook for managing notifications
 * Provides methods to add different types of notifications
 */
export const useNotification = () => {
  const { addNotification } = useNotificationStore()
  const { notificationsEnabled, inAppNotifications } = useSettingsStore((state) => state.settings)

  const canNotify = notificationsEnabled && inAppNotifications

  return {
    success: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'success', title, message, duration, dedupeKey })
    },
    error: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'error', title, message, duration, dedupeKey })
    },
    warning: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'warning', title, message, duration, dedupeKey })
    },
    info: (title: string, message: string, duration?: number, dedupeKey?: string) => {
      if (!canNotify) return
      addNotification({ type: 'info', title, message, duration, dedupeKey })
    },
  }
}
