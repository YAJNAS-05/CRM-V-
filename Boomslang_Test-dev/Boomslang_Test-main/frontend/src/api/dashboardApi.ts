// src/api/dashboardApi.ts
import axiosInstance from './axiosInstance'

export interface DashboardWidget {
  widgetId?: number
  dashboardId: number
  reportId?: number
  widgetType: string
  widgetTitle: string
  widgetKey?: string
  description?: string
  
  // Layout
  colIndex: number
  rowIndex: number
  colSpan: number
  rowSpan: number
  backgroundColor?: string
  fontSize?: string
  
  // Configuration
  config?: Record<string, any>
  chartType?: string
  metricField?: string
  metricLabel?: string
  metricFormat?: string
  filtersApplied?: Record<string, any>
  sortConfig?: Record<string, any>
  
  // Refresh settings
  refreshInterval?: number
  cacheDuration?: number
  isCached?: boolean
  lastRefreshedAt?: string
  
  // Visibility
  isVisible?: boolean
  isLocked?: boolean
  widgetOrder?: number
  
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface Dashboard {
  dashboardId?: number
  userEmail: string
  dashboardName: string
  dashboardKey?: string
  description?: string
  isDefault?: boolean
  isShared?: boolean
  gridColumns?: number
  widgetsCount?: number
  sharedWithEmails?: string[]
  sharedWithRoles?: string[]
  widgets?: DashboardWidget[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateDashboardRequest {
  dashboardName: string
  description?: string
  isDefault?: boolean
  isShared?: boolean
  gridColumns?: number
  sharedWithEmails?: string[]
  sharedWithRoles?: string[]
}

export interface UpdateDashboardRequest {
  dashboardName?: string
  description?: string
  isDefault?: boolean
  isShared?: boolean
  sharedWithEmails?: string[]
  sharedWithRoles?: string[]
}

export interface CreateWidgetRequest {
  widgetType: string
  widgetTitle: string
  description?: string
  colIndex?: number
  rowIndex?: number
  colSpan?: number
  rowSpan?: number
  backgroundColor?: string
  fontSize?: string
  config?: Record<string, any>
  chartType?: string
  metricField?: string
  metricLabel?: string
  metricFormat?: string
  filtersApplied?: Record<string, any>
  sortConfig?: Record<string, any>
  refreshInterval?: number
  reportId?: number
}

export interface UpdateWidgetRequest {
  widgetTitle?: string
  description?: string
  colIndex?: number
  rowIndex?: number
  colSpan?: number
  rowSpan?: number
  backgroundColor?: string
  fontSize?: string
  config?: Record<string, any>
  filtersApplied?: Record<string, any>
  sortConfig?: Record<string, any>
  isVisible?: boolean
  isLocked?: boolean
  refreshInterval?: number
}

export interface WidgetPositionUpdate {
  widgetId: number
  colIndex?: number
  rowIndex?: number
  colSpan?: number
  rowSpan?: number
  widgetOrder?: number
}

export interface BatchUpdateWidgetsRequest {
  updates: WidgetPositionUpdate[]
}

export const dashboardApi = {
  // Dashboard CRUD
  listDashboards: (page = 0, size = 20) =>
    axiosInstance.get<{ data: Dashboard[] }>('/v1/dashboards', {
      params: { page, size }
    }),

  getDefaultDashboard: () =>
    axiosInstance.get<{ data: Dashboard }>('/v1/dashboards/default'),

  getDashboard: (dashboardId: number) =>
    axiosInstance.get<{ data: Dashboard }>(`/v1/dashboards/${dashboardId}`),

  createDashboard: (request: CreateDashboardRequest) =>
    axiosInstance.post<{ data: Dashboard }>('/v1/dashboards', request),

  updateDashboard: (dashboardId: number, request: UpdateDashboardRequest) =>
    axiosInstance.put<{ data: Dashboard }>(`/v1/dashboards/${dashboardId}`, request),

  deleteDashboard: (dashboardId: number) =>
    axiosInstance.delete(`/v1/dashboards/${dashboardId}`),

  // Widget CRUD
  getWidgets: (dashboardId: number) =>
    axiosInstance.get<{ data: DashboardWidget[] }>(`/v1/dashboards/${dashboardId}/widgets`),

  createWidget: (dashboardId: number, request: CreateWidgetRequest) =>
    axiosInstance.post<{ data: DashboardWidget }>(`/v1/dashboards/${dashboardId}/widgets`, request),

  updateWidget: (dashboardId: number, widgetId: number, request: UpdateWidgetRequest) =>
    axiosInstance.put<{ data: DashboardWidget }>(`/v1/dashboards/${dashboardId}/widgets/${widgetId}`, request),

  deleteWidget: (dashboardId: number, widgetId: number) =>
    axiosInstance.delete(`/v1/dashboards/${dashboardId}/widgets/${widgetId}`),

  updateWidgetPositions: (dashboardId: number, request: BatchUpdateWidgetsRequest) =>
    axiosInstance.post(`/v1/dashboards/${dashboardId}/widgets/batch-update-positions`, request),
}
