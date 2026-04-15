// src/api/reportApi.ts
import axios from 'axios'
import axiosInstance from './axiosInstance'

export interface ReportDefinition {
  reportId: number
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
    })
}
