import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  dedupeKey?: string
  timestamp: number
  read?: boolean
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  setNotifications: (notifications: Notification[]) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAllRead: () => void
}

/**
 * Notification store - manages app-wide notifications
 * Complements the toast notifications from Sonner
 */
export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    if (notification.dedupeKey) {
      const exists = get().notifications.some((item) => item.dedupeKey === notification.dedupeKey)
      if (exists) {
        return
      }
    }

    const id = `notif-${Date.now()}-${Math.random()}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 3000,
      read: false,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
      unreadCount: state.unreadCount + 1,
    }))

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, newNotification.duration)
    }
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((notification) => !notification.read).length
    set({ notifications, unreadCount })
  },

  removeNotification: (id) => {
    set((state) => {
      const target = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - (target?.read ? 0 : 1)),
      }
    })
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },
}))

