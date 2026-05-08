import axiosInstance from './axiosInstance'

export const settingsApi = {
  // Audit Logs
  getAuditLogs: (params: string) =>
    axiosInstance.get(`/v1/settings/audit-logs?${params}`),

  exportAuditLogs: (filters: any) =>
    axiosInstance.get('/v1/settings/audit-logs/export', { params: filters }),

  // System Settings
  getSettings: () =>
    axiosInstance.get('/v1/settings'),

  updateSettings: (settings: any) =>
    axiosInstance.put('/v1/settings', settings),

  // User Preferences
  getPreferences: () =>
    axiosInstance.get('/v1/settings/preferences'),

  updatePreferences: (prefs: any) =>
    axiosInstance.put('/v1/settings/preferences', prefs),

  // Notifications
  getNotificationSettings: () =>
    axiosInstance.get('/v1/settings/notifications'),

  updateNotificationSettings: (settings: any) =>
    axiosInstance.put('/v1/settings/notifications', settings),
}
