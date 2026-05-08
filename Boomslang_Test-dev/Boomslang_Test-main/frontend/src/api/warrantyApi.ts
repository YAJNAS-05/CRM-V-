import axios from 'axios'
import { Warranty } from '../types/erp';
import { ApiResponse } from '../types';

// Re-export warranty API for backward compatibility

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// New warranty API exports
export const warrantyApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get(`/v1/erp/warranty/claims?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    axiosInstance.get(`/v1/erp/warranty/claims/${id}`),
  
  getByStatus: (status: string, page = 0, size = 20) =>
    axiosInstance.get(`/v1/erp/warranty/claims/status/${status}?page=${page}&size=${size}`),
  
  getByEquipment: (equipmentId: string, page = 0, size = 20) =>
    axiosInstance.get(`/v1/erp/warranty/equipment/${equipmentId}/claims?page=${page}&size=${size}`),
  
  getByCustomer: (customerId: string, page = 0, size = 20) =>
    axiosInstance.get(`/v1/erp/warranty/customer/${customerId}/claims?page=${page}&size=${size}`),
  
  getDashboard: () =>
    axiosInstance.get('/v1/erp/warranty/dashboard'),
  
  create: (data: any) =>
    axiosInstance.post('/v1/erp/warranty/claims', data),
  
  update: (id: string, data: any) =>
    axiosInstance.put(`/v1/erp/warranty/claims/${id}`, data),
  
  updateStatus: (id: string, status: string, notes?: string) =>
    axiosInstance.patch(`/v1/erp/warranty/claims/${id}/status?status=${status}${notes ? `&notes=${notes}` : ''}`),
  
  assignEngineer: (id: string, engineerId: string) =>
    axiosInstance.patch(`/v1/erp/warranty/claims/${id}/assign?engineerId=${engineerId}`),
  
  delete: (id: string) =>
    axiosInstance.delete(`/v1/erp/warranty/claims/${id}`),
}

// Keep backward compatibility
export const WarrantyApi = {
  /**
   * Get all warranties
   */
  getAllWarranties: async (): Promise<Warranty[]> => {
    try {
      const response = await warrantyApi.getAll(0, 100);
      return (response.data as any)?.content || [];
    } catch (error) {
      console.error('Error fetching warranties:', error);
      return [];
    }
  },

  /**
   * Get warranty by ID
   */
  getWarrantyById: async (id: string): Promise<Warranty> => {
    try {
      const response = await warrantyApi.getById(id);
      return response.data as any;
    } catch (error) {
      console.error(`Error fetching warranty ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new warranty
   */
  createWarranty: async (warranty: Warranty): Promise<Warranty> => {
    try {
      const response = await warrantyApi.create(warranty);
      return response.data as any;
    } catch (error) {
      console.error('Error creating warranty:', error);
      throw error;
    }
  },

  /**
   * Update warranty
   */
  updateWarranty: async (id: string, warranty: Partial<Warranty>): Promise<Warranty> => {
    try {
      const response = await warrantyApi.update(id, warranty);
      return response.data as any;
    } catch (error) {
      console.error(`Error updating warranty ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete warranty
   */
  deleteWarranty: async (id: string): Promise<void> => {
    try {
      await warrantyApi.delete(id);
    } catch (error) {
      console.error(`Error deleting warranty ${id}:`, error);
      throw error;
    }
  },
};
