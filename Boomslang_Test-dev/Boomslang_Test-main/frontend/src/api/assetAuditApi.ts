// Asset Audit API
// Provides API methods for managing asset audits through the backend

import axiosInstance from './axiosInstance';
import { AssetAudit } from '../types/erp';
import { ApiResponse } from '../types';

export const AssetAuditApi = {
  /**
   * Get all asset audits
   */
  getAllAudits: async (): Promise<{ data: AssetAudit[] }> => {
    try {
      const response = await axiosInstance.get<ApiResponse<{ content: AssetAudit[] }>>('/v1/erp/asset-audits');
      return { data: response.data.data?.content || [] };
    } catch (error) {
      console.error('Error fetching asset audits:', error);
      return { data: [] };
    }
  },

  /**
   * Get audit by ID
   */
  getAuditById: async (id: string): Promise<{ data: AssetAudit }> => {
    try {
      const response = await axiosInstance.get<ApiResponse<AssetAudit>>(`/v1/erp/asset-audits/${id}`);
      return { data: response.data.data };
    } catch (error) {
      console.error(`Error fetching audit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new audit
   */
  createAudit: async (audit: AssetAudit): Promise<AssetAudit> => {
    try {
      const response = await axiosInstance.post<ApiResponse<AssetAudit>>('/v1/erp/asset-audits', audit);
      return response.data.data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  },

  /**
   * Update audit
   */
  updateAudit: async (id: string, audit: Partial<AssetAudit>): Promise<AssetAudit> => {
    try {
      const response = await axiosInstance.put<ApiResponse<AssetAudit>>(`/v1/erp/asset-audits/${id}`, audit);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating audit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete audit
   */
  deleteAudit: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/v1/erp/asset-audits/${id}`);
    } catch (error) {
      console.error(`Error deleting audit ${id}:`, error);
      throw error;
    }
  },
};
