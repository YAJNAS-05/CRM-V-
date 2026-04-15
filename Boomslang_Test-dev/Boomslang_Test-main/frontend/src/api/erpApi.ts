import axiosInstance from './axiosInstance'
import { InventoryItem, CreateInventoryItemRequest, UpdateInventoryItemRequest, Equipment } from '../types/erp'
import { ApiResponse } from '../types'

export const erpApi = {
  getInventoryItems: async (page?: number, size?: number): Promise<ApiResponse<{ content: InventoryItem[] }>> => {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (size !== undefined) params.append('size', size.toString())
    const response = await axiosInstance.get<ApiResponse<{ content: InventoryItem[] }>>(`/v1/erp/inventory?${params}`)
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
  // Add stubs for missing methods
  getByCategory: async (category: string, page: number, size: number): Promise<ApiResponse<{ content: InventoryItem[] }>> => {
    const response = await axiosInstance.get<ApiResponse<{ content: InventoryItem[] }>>(`/v1/erp/inventory?category=${category}&page=${page}&size=${size}`)
    return response.data
  },
  getByStatus: async (status: string, page: number, size: number): Promise<ApiResponse<{ content: InventoryItem[] }>> => {
    const response = await axiosInstance.get<ApiResponse<{ content: InventoryItem[] }>>(`/v1/erp/inventory?status=${status}&page=${page}&size=${size}`)
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
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/sales-orders/${id}`),
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
export const warrantyApi = {
  getAll: async (page = 0, size = 100) =>
    axiosInstance.get(`/v1/erp/warranties?page=${page}&size=${size}`),
  getById: async (id: string) =>
    axiosInstance.get(`/v1/erp/warranties/${id}`),
  create: async (data: any) =>
    axiosInstance.post('/v1/erp/warranties', data),
  update: async (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/warranties/${id}`, data),
  delete: async (id: string) =>
    axiosInstance.delete(`/v1/erp/warranties/${id}`),
}
