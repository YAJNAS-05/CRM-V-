import { useNotificationStore } from '../store/notificationStore'

/**
 * Hook for managing notifications
 * Provides methods to add different types of notifications
 */
export const useNotification = () => {
  const { addNotification } = useNotificationStore()

  return {
    success: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration })
    },
    error: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration })
    },
    warning: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'warning', title, message, duration })
    },
    info: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'info', title, message, duration })
    },
  }
}
