// Re-export warranty API for backward compatibility
// This file provides WarrantyApi as a class-based interface for warranty operations

import { warrantyApi } from './erpApi';
import { Warranty } from '../types/erp';
import { ApiResponse } from '../types';

/**
 * WarrantyApi - Class-based wrapper around warrantyApi
 * Provides backward compatibility for existing code using WarrantyApi.method()
 */
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
