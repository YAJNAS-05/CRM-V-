// Re-export fieldwork API for backward compatibility
// This file provides FieldJobApi as a class-based interface for field job operations

import { fieldworkApi } from './fieldworkApi';
import { FieldJobDto } from '../types/fieldwork';

/**
 * FieldJobApi - Class-based wrapper around fieldworkApi
 * Provides backward compatibility for existing code using FieldJobApi.method()
 */
export const FieldJobApi = {
  /**
   * Get all field jobs
   */
  getAllFieldJobs: async (): Promise<FieldJobDto[]> => {
    try {
      const response = await fieldworkApi.getFieldJobs(0, 100);
      return response.content || [];
    } catch (error) {
      console.error('Error fetching all field jobs:', error);
      throw error;
    }
  },

  /**
   * Get field job by ID
   */
  getFieldJobById: async (id: string): Promise<{ data: FieldJobDto }> => {
    try {
      const response = await fieldworkApi.getFieldJobById(id);
      return { data: response };
    } catch (error) {
      console.error(`Error fetching field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update field job
   */
  updateFieldJob: async (id: string | number, updates: Partial<FieldJobDto>): Promise<FieldJobDto> => {
    try {
      return await fieldworkApi.updateFieldJob(id, updates as FieldJobDto);
    } catch (error) {
      console.error(`Error updating field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete field job
   */
  deleteFieldJob: async (id: string | number): Promise<void> => {
    try {
      await fieldworkApi.deleteFieldJob(id);
    } catch (error) {
      console.error(`Error deleting field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create field job
   */
  createFieldJob: async (job: FieldJobDto): Promise<FieldJobDto> => {
    try {
      return await fieldworkApi.createFieldJob(job);
    } catch (error) {
      console.error('Error creating field job:', error);
      throw error;
    }
  },
};
