// src/api/reportApi.ts
import axiosInstance from './axiosInstance'

export interface ReportDefinition {
  reportId: number
  reportKey?: string
  reportType?: string
  reportName: string
  module: string
  description: string
  definition: Record<string, any>
  createdBy: string
  ownedBy: string
  isSystem: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportColumn {
  columnId: string
  label: string
  field: string
  dataType: string
  format?: string
  visible: boolean
  sortable: boolean
  aggregatable: boolean
  aggregation?: string
  displayOrder: number
  width: number
  alignment: string
}

export interface ReportFilter {
  filterId: string
  field: string
  label: string
  operator: string
  value: any
  valueTo?: any
  inputType: string
  options?: Array<{ value: any; label: string }>
}

export interface SortConfig {
  field: string
  direction: 'ASC' | 'DESC'
  priority: number
}

export interface ReportResult {
  reportId: number
  reportName: string
  columns: ReportColumn[]
  rows: Record<string, any>[]
  totalCount: number
  page: number
  pageSize: number
  aggregates: Record<string, any>
  chartData: any[]
  executedAt: string
  durationMs: number
}

export interface ReportExecutionRequest {
  filters?: ReportFilter[]
  sorts?: SortConfig[]
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
  companyCode?: string
}

interface LocalCustomReport {
  id: string
  name: string
  description: string
  widgets: any[]
  refreshRate?: number
  filters?: any
  createdAt: string
  updatedAt: string
}

const CUSTOM_REPORTS_STORAGE_KEY = 'everx_custom_reports_local'

const readLocalCustomReports = (): LocalCustomReport[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CUSTOM_REPORTS_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalCustomReports = (reports: LocalCustomReport[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CUSTOM_REPORTS_STORAGE_KEY, JSON.stringify(reports))
}

const createLocalReportId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const ENABLE_CUSTOM_REPORTS_DRAFT_MODE = import.meta.env.VITE_ENABLE_CUSTOM_REPORTS_DRAFT_MODE === 'true'

const shouldUseCustomReportFallback = (error: any) => {
  if (!ENABLE_CUSTOM_REPORTS_DRAFT_MODE) {
    return false
  }
  const status = error?.response?.status
  return !status || [400, 401, 403, 404, 500, 501, 503, 504].includes(status)
}

const ENABLE_CUSTOM_REPORTS_API =
  import.meta.env.VITE_ENABLE_CUSTOM_REPORTS_API === 'true' || import.meta.env.DEV
let customReportsApiStatus: 'unknown' | 'available' | 'unavailable' =
  ENABLE_CUSTOM_REPORTS_API ? 'unknown' : 'unavailable'

const shouldSkipCustomReportsApi = () =>
  ENABLE_CUSTOM_REPORTS_DRAFT_MODE && customReportsApiStatus === 'unavailable'
const markCustomReportsApiAvailable = () => {
  customReportsApiStatus = 'available'
}
const markCustomReportsApiUnavailable = () => {
  customReportsApiStatus = 'unavailable'
}

export const reportApi = {
  // Get all reports
  listReports: (module?: string, page = 0, size = 20) =>
    axiosInstance.get<{ data: ReportResult[] }>('/v1/reports', {
      params: { module, page, size }
    }),

  // Get single report definition
  getReport: (reportId: number) =>
    axiosInstance.get<{ data: ReportDefinition }>(`/v1/reports/${reportId}`),

  // Execute report
  execute: (reportId: number, request: ReportExecutionRequest) =>
    axiosInstance.post<{ data: ReportResult }>(`/v1/reports/${reportId}/execute`, request),

  // Export report
  export: (reportId: number, format: 'CSV' | 'EXCEL' | 'PDF', request: ReportExecutionRequest) =>
    axiosInstance.post(`/v1/reports/${reportId}/export?format=${format}`, request, {
      responseType: 'blob'
    }),

  // Get available fields
  getAvailableFields: () =>
    axiosInstance.get<{ data: Record<string, any[]> }>('/v1/reports/metadata/fields'),

  // Get modules
  getModules: () =>
    axiosInstance.get<{ data: any[] }>('/v1/reports/metadata/modules'),

  // Create custom report
  createReport: (data: any) =>
    axiosInstance.post<{ data: ReportDefinition }>('/v1/reports', data),

  // Update report
  updateReport: (reportId: number, data: any) =>
    axiosInstance.put<{ data: ReportDefinition }>(`/v1/reports/${reportId}`, data),

  // Clone report
  cloneReport: (reportId: number, moduleName: string) =>
    axiosInstance.post<{ data: ReportDefinition }>(`/v1/reports/${reportId}/clone`, { newName: moduleName }),

  // Delete report
  deleteReport: (reportId: number) =>
    axiosInstance.delete(`/v1/reports/${reportId}`),

  // ============ JASPER ENDPOINTS ============

  // Execute with JasperReports
  jasperExecute: (reportId: number, request: ReportExecutionRequest) =>
    axiosInstance.post<{ data: ReportResult }>(`/v1/reports/${reportId}/jasper/execute`, request),

  // Export to PDF using JasperReports
  jasperExportPdf: (reportId: number, request: ReportExecutionRequest) =>
    axiosInstance.post(`/v1/reports/${reportId}/jasper/export-pdf`, request, {
      responseType: 'blob'
    }),

  // Export to Excel using JasperReports
  jasperExportExcel: (reportId: number, request: ReportExecutionRequest) =>
    axiosInstance.post(`/v1/reports/${reportId}/jasper/export-excel`, request, {
      responseType: 'blob'
    }),

  // ============ CUSTOM REPORT ENDPOINTS (Widget-based) ============

  // Get custom report
  getCustomReport: async (reportId: string) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports().find((report) => report.id === reportId)
      if (!local) throw new Error('Custom report not found')
      return local
    }

    try {
      const response = await axiosInstance.get(`/v1/custom-reports/${reportId}`)
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports().find((report) => report.id === reportId)
      if (!local) {
        throw error
      }

      return local
    }
  },

  // List custom reports
  listCustomReports: async (page = 0, size = 20) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports()
      const start = page * size
      return {
        content: local.slice(start, start + size),
        totalElements: local.length,
        totalPages: Math.max(1, Math.ceil(local.length / size)),
        number: page,
        size,
      }
    }

    try {
      const response = await axiosInstance.get('/v1/custom-reports', {
        params: { page, size }
      })
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports()
      const start = page * size
      return {
        content: local.slice(start, start + size),
        totalElements: local.length,
        totalPages: Math.max(1, Math.ceil(local.length / size)),
        number: page,
        size,
      }
    }
  },

  // Create custom report
  createCustomReport: async (data: any) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports()
      const now = new Date().toISOString()
      const saved: LocalCustomReport = {
        id: createLocalReportId(),
        name: data?.name || 'Untitled Custom Report',
        description: data?.description || '',
        widgets: Array.isArray(data?.widgets) ? data.widgets : [],
        refreshRate: data?.refreshRate,
        filters: data?.filters,
        createdAt: now,
        updatedAt: now,
      }

      local.unshift(saved)
      writeLocalCustomReports(local)
      return saved
    }

    try {
      const response = await axiosInstance.post('/v1/custom-reports', data)
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports()
      const now = new Date().toISOString()
      const saved: LocalCustomReport = {
        id: createLocalReportId(),
        name: data?.name || 'Untitled Custom Report',
        description: data?.description || '',
        widgets: Array.isArray(data?.widgets) ? data.widgets : [],
        refreshRate: data?.refreshRate,
        filters: data?.filters,
        createdAt: now,
        updatedAt: now,
      }

      local.unshift(saved)
      writeLocalCustomReports(local)
      return saved
    }
  },

  // Update custom report
  updateCustomReport: async (reportId: string, data: any) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports()
      const index = local.findIndex((report) => report.id === reportId)
      const now = new Date().toISOString()

      if (index >= 0) {
        local[index] = {
          ...local[index],
          ...data,
          id: reportId,
          updatedAt: now,
        }
      } else {
        local.unshift({
          id: reportId,
          name: data?.name || 'Untitled Custom Report',
          description: data?.description || '',
          widgets: Array.isArray(data?.widgets) ? data.widgets : [],
          refreshRate: data?.refreshRate,
          filters: data?.filters,
          createdAt: now,
          updatedAt: now,
        })
      }

      writeLocalCustomReports(local)
      return local.find((report) => report.id === reportId)
    }

    try {
      const response = await axiosInstance.put(`/v1/custom-reports/${reportId}`, data)
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports()
      const index = local.findIndex((report) => report.id === reportId)
      const now = new Date().toISOString()

      if (index >= 0) {
        local[index] = {
          ...local[index],
          ...data,
          id: reportId,
          updatedAt: now,
        }
      } else {
        local.unshift({
          id: reportId,
          name: data?.name || 'Untitled Custom Report',
          description: data?.description || '',
          widgets: Array.isArray(data?.widgets) ? data.widgets : [],
          refreshRate: data?.refreshRate,
          filters: data?.filters,
          createdAt: now,
          updatedAt: now,
        })
      }

      writeLocalCustomReports(local)
      return local.find((report) => report.id === reportId)
    }
  },

  // Delete custom report
  deleteCustomReport: async (reportId: string) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports().filter((report) => report.id !== reportId)
      writeLocalCustomReports(local)
      return
    }

    try {
      await axiosInstance.delete(`/v1/custom-reports/${reportId}`)
      markCustomReportsApiAvailable()
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports().filter((report) => report.id !== reportId)
      writeLocalCustomReports(local)
    }
  },

  // Execute custom report with filters
  executeCustomReport: async (reportId: string, filters: any) => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports().find((report) => report.id === reportId)
      return {
        reportId,
        widgets: local?.widgets || [],
        filters,
        rows: [],
      }
    }

    try {
      const response = await axiosInstance.post(`/v1/custom-reports/${reportId}/execute`, { filters })
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports().find((report) => report.id === reportId)
      return {
        reportId,
        widgets: local?.widgets || [],
        filters,
        rows: [],
      }
    }
  },

  // Export custom report
  exportCustomReport: async (reportId: string, format: 'CSV' | 'EXCEL' | 'PDF' = 'EXCEL') => {
    if (shouldSkipCustomReportsApi()) {
      const local = readLocalCustomReports().find((report) => report.id === reportId)
      const body = JSON.stringify(local || {}, null, 2)
      return new Blob([body], { type: 'application/json' })
    }

    try {
      const response = await axiosInstance.post(
        `/v1/custom-reports/${reportId}/export?format=${format}`,
        {},
        { responseType: 'blob' }
      )
      markCustomReportsApiAvailable()
      return response.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      const local = readLocalCustomReports().find((report) => report.id === reportId)
      const body = JSON.stringify(local || {}, null, 2)
      return new Blob([body], { type: 'application/json' })
    }
  },

  // Get widget configuration options
  getWidgetOptions: async (widgetType: 'chart' | 'metric' | 'table' | 'text') => {
    if (shouldSkipCustomReportsApi()) {
      return {
        widgetType,
        fallback: true,
      }
    }

    try {
      const response = await axiosInstance.get(`/v1/custom-reports/widgets/${widgetType}/options`)
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      return {
        widgetType,
        fallback: true,
      }
    }
  },

  // Validate widget configuration
  validateWidget: async (widget: any) => {
    if (shouldSkipCustomReportsApi()) {
      return {
        valid: true,
        errors: [],
      }
    }

    try {
      const response = await axiosInstance.post('/v1/custom-reports/widgets/validate', widget)
      markCustomReportsApiAvailable()
      return response.data.data
    } catch (error) {
      if (!shouldUseCustomReportFallback(error)) {
        throw error
      }

      markCustomReportsApiUnavailable()

      return {
        valid: true,
        errors: [],
      }
    }
  }
}
