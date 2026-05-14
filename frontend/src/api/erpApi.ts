import axiosInstance from './axiosInstance'
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  Equipment,
  EquipmentAcquisition,
  EquipmentAssessment,
  SiteAssessment,
  EquipmentQCRecord,
  InventoryLedgerEntry,
  InventoryBin,
  InventoryTransfer,
  CreateInventoryTransferRequest,
  CreateStockAdjustmentRequest,
  ReorderSuggestion,
} from '../types/erp'
import { ApiResponse, Page } from '../types'

const buildQueryString = (params: Record<string, string | number | boolean | undefined | null>) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  return searchParams.toString()
}

export const erpApi = {
  getInventoryItems: async (
    page?: number,
    size?: number,
    filters?: {
      search?: string
      category?: string
      status?: string
      sort?: string
    },
  ): Promise<ApiResponse<Page<InventoryItem>>> => {
    const query = buildQueryString({
      page,
      size,
      search: filters?.search,
      category: filters?.category,
      status: filters?.status,
      sort: filters?.sort,
    })
    const response = await axiosInstance.get<ApiResponse<Page<InventoryItem>>>(`/v1/erp/inventory?${query}`)
    return response.data
  },

  getInventoryItem: async (id: string): Promise<ApiResponse<InventoryItem>> => {
    const response = await axiosInstance.get<ApiResponse<InventoryItem>>(`/v1/erp/inventory/${id}`)
    return response.data
  },

  createInventoryItem: async (item: CreateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> => {
    const response = await axiosInstance.post<ApiResponse<InventoryItem>>('/v1/erp/inventory', item)
    return response.data
  },

  updateInventoryItem: async (id: string, item: UpdateInventoryItemRequest): Promise<ApiResponse<InventoryItem>> => {
    const response = await axiosInstance.put<ApiResponse<InventoryItem>>(`/v1/erp/inventory/${id}`, item)
    return response.data
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/erp/inventory/${id}`)
  },
}

export const equipmentApi = {
  getEquipment: async (): Promise<ApiResponse<{ content: Equipment[] }>> => {
    const response = await axiosInstance.get<ApiResponse<{ content: Equipment[] }>>('/v1/erp/equipment')
    return response.data
  },

  getEquipmentById: async (id: string): Promise<ApiResponse<Equipment>> => {
    const response = await axiosInstance.get<ApiResponse<Equipment>>(`/v1/erp/equipment/${id}`)
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Equipment>> => {
    return equipmentApi.getEquipmentById(id)
  },

  getAll: async (page: number, size: number): Promise<ApiResponse<{ content: Equipment[] }>> => {
    const response = await axiosInstance.get<ApiResponse<{ content: Equipment[] }>>(`/v1/erp/equipment?page=${page}&size=${size}`)
    return response.data
  },

  create: async (data: any): Promise<ApiResponse<Equipment>> => {
    const response = await axiosInstance.post<ApiResponse<Equipment>>('/v1/erp/equipment', data)
    return response.data
  },

  update: async (id: string, data: any): Promise<ApiResponse<Equipment>> => {
    const response = await axiosInstance.put<ApiResponse<Equipment>>(`/v1/erp/equipment/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/erp/equipment/${id}`)
  },
}

export const inventoryApi = {
  ...erpApi,
  getById: erpApi.getInventoryItem,
  delete: erpApi.deleteInventoryItem,
  update: erpApi.updateInventoryItem,
  create: erpApi.createInventoryItem,
  getAll: erpApi.getInventoryItems,
  getLedger: async (filters?: {
    itemId?: string
    location?: string
    page?: number
    size?: number
  }): Promise<ApiResponse<Page<InventoryLedgerEntry>>> => {
    const params = new URLSearchParams()
    if (filters?.itemId) params.append('itemId', filters.itemId)
    if (filters?.location) params.append('location', filters.location)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())
    const response = await axiosInstance.get<ApiResponse<Page<InventoryLedgerEntry>>>(
      `/v1/erp/inventory/ledger?${params}`
    )
    return response.data
  },
  getBins: async (itemId: string): Promise<ApiResponse<InventoryBin[]>> => {
    const response = await axiosInstance.get<ApiResponse<InventoryBin[]>>(`/v1/erp/inventory/bins?itemId=${itemId}`)
    return response.data
  },
  getTransfers: async (page = 0, size = 20): Promise<ApiResponse<Page<InventoryTransfer>>> => {
    const response = await axiosInstance.get<ApiResponse<Page<InventoryTransfer>>>(
      `/v1/erp/inventory/transfers?page=${page}&size=${size}`
    )
    return response.data
  },
  createTransfer: async (payload: CreateInventoryTransferRequest): Promise<ApiResponse<InventoryTransfer>> => {
    const response = await axiosInstance.post<ApiResponse<InventoryTransfer>>('/v1/erp/inventory/transfers', payload)
    return response.data
  },
  createStockAdjustment: async (payload: CreateStockAdjustmentRequest): Promise<ApiResponse<InventoryLedgerEntry>> => {
    const response = await axiosInstance.post<ApiResponse<InventoryLedgerEntry>>('/v1/erp/inventory/adjustments', payload)
    return response.data
  },
  getReorderSuggestions: async (): Promise<ApiResponse<ReorderSuggestion[]>> => {
    const response = await axiosInstance.get<ApiResponse<ReorderSuggestion[]>>('/v1/erp/inventory/reorder-suggestions')
    return response.data
  },
  getByCategory: async (category: string, page = 0, size = 20): Promise<ApiResponse<Page<InventoryItem>>> => {
    const response = await axiosInstance.get<ApiResponse<Page<InventoryItem>>>(
      `/v1/erp/inventory/category/${encodeURIComponent(category)}?page=${page}&size=${size}`
    )
    return response.data
  },
  getByStatus: async (status: string, page = 0, size = 20): Promise<ApiResponse<Page<InventoryItem>>> => {
    const response = await axiosInstance.get<ApiResponse<Page<InventoryItem>>>(
      `/v1/erp/inventory/status/${encodeURIComponent(status)}?page=${page}&size=${size}`
    )
    return response.data
  },
}

export const purchaseOrderApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/purchase-orders?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/purchase-orders/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/purchase-orders', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/purchase-orders/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/purchase-orders/${id}`),
}
export const salesOrderApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/sales-orders?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/sales-orders/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/sales-orders', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/sales-orders/${id}`, data),
  confirm: async (id: string) =>
    axiosInstance.patch(`/v1/erp/sales-orders/${id}/confirm`),
  cancel: async (id: string) =>
    axiosInstance.patch(`/v1/erp/sales-orders/${id}/cancel`),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/sales-orders/${id}`),
}
export const shipmentApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/shipments?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/shipments/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/shipments', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/shipments/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/shipments/${id}`),
}
export const sparePartApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/spareparts?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/spareparts/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/spareparts', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/spareparts/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/spareparts/${id}`),
}
export const subcontractorApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/subcontractors?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/subcontractors/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/subcontractors', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/subcontractors/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/subcontractors/${id}`),
}
export const supplierApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/suppliers?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/suppliers/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/suppliers', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/suppliers/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/suppliers/${id}`),
}

export const acquisitionApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/acquisitions?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/acquisitions/${id}`),
  getByStage: async (stage: string, page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/acquisitions/stage/${stage}?page=${page}&size=${size}`),
  create: async (data: Partial<EquipmentAcquisition>) =>
    axiosInstance.post(`/v1/erp/acquisitions`, data),
  update: async (id: string, data: Partial<EquipmentAcquisition>) =>
    axiosInstance.put(`/v1/erp/acquisitions/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/acquisitions/${id}`),
}

export const equipmentAssessmentApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/equipment-assessments?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/equipment-assessments/${id}`),
  getByAcquisition: async (acquisitionId: string, page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/equipment-assessments/acquisition/${acquisitionId}?page=${page}&size=${size}`),
  getByOutcome: async (outcome: string, page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/equipment-assessments/outcome/${outcome}?page=${page}&size=${size}`),
  create: async (data: Partial<EquipmentAssessment>) =>
    axiosInstance.post(`/v1/erp/equipment-assessments`, data),
  update: async (id: string, data: Partial<EquipmentAssessment>) =>
    axiosInstance.put(`/v1/erp/equipment-assessments/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/equipment-assessments/${id}`),
}

export const siteAssessmentApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/site-assessments?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/site-assessments/${id}`),
  getBySalesOrder: async (salesOrderId: string) =>
    axiosInstance.get(`/v1/erp/site-assessments/sales-order/${salesOrderId}`),
  getByReadiness: async (readiness: string, page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/site-assessments/readiness/${readiness}?page=${page}&size=${size}`),
  create: async (data: Partial<SiteAssessment>) =>
    axiosInstance.post(`/v1/erp/site-assessments`, data),
  update: async (id: string, data: Partial<SiteAssessment>) =>
    axiosInstance.put(`/v1/erp/site-assessments/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/site-assessments/${id}`),
}

export const equipmentQcApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/equipment-qc?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/equipment-qc/${id}`),
  getByEquipment: async (equipmentId: string, page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/equipment-qc/equipment/${equipmentId}?page=${page}&size=${size}`),
  create: async (data: Partial<EquipmentQCRecord>) =>
    axiosInstance.post(`/v1/erp/equipment-qc`, data),
  update: async (id: string, data: Partial<EquipmentQCRecord>) =>
    axiosInstance.put(`/v1/erp/equipment-qc/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/equipment-qc/${id}`),
}

export const warrantyApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/warranties?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/warranties/${id}`),
  getByEquipment: async (equipmentId: string) =>
    axiosInstance.get(`/v1/erp/warranties/equipment/${equipmentId}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/warranties', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/warranties/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/warranties/${id}`),
}

export const serviceTicketApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/service-tickets?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/service-tickets/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/service-tickets', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/service-tickets/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/service-tickets/${id}`),
}
