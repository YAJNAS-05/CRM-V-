import axiosInstance from './axiosInstance'

export interface BackendNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  dedupeKey?: string
  isRead: boolean
  timestamp: string
}

export interface CreateBackendNotificationRequest {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  dedupeKey?: string
}

export const notificationApi = {
  listMyNotifications: () =>
    axiosInstance.get<{ data: BackendNotification[] }>('/v1/notifications'),

  createNotification: (request: CreateBackendNotificationRequest) =>
    axiosInstance.post<{ data: BackendNotification }>('/v1/notifications', request),

  markAllRead: () =>
    axiosInstance.patch('/v1/notifications/read-all'),

  markRead: (notificationId: string) =>
    axiosInstance.patch(`/v1/notifications/${notificationId}/read`),
}
