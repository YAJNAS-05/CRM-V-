// File: src/api/fieldworkApi.ts
// Field Work API Integration Layer
// Provides type-safe communication with backend /api/field-jobs endpoints

import api from './axiosInstance';
import {
  FieldJobDto,
  FieldJobSignOffDto,
  FieldJobCostDto,
  FieldJobTravelDto,
  FieldJobChecklistDto,
  FieldJobReportDto,
  ErrorResponse
} from '../types/fieldwork';
import { Page } from '../types';

/**
 * BASE FIELD JOB OPERATIONS
 */

export const fieldworkApi = {
  /**
   * Create a new field job
   * POST /api/field-jobs
   * Falls back to test endpoint if main endpoint fails
   */
  createFieldJob: async (fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    try {
      const response = await api.post<FieldJobDto>('/field-jobs', fieldJob);
      return response.data;
    } catch (error) {
      console.warn('Main field job endpoint failed, trying test endpoint:', error);
      try {
        // Fallback to test endpoint
        const testResponse = await api.post<any>('/field-jobs-test/create', {
          jobType: fieldJob.jobType,
          internalNotes: fieldJob.internalNotes,
          priority: fieldJob.priority || 'ROUTINE'
        });
        return testResponse.data as FieldJobDto;
      } catch (testError) {
        console.error('Both endpoints failed:', testError);
        throw error;
      }
    }
  },

  /**
   * Get paginated list of all field jobs
   * GET /api/field-jobs?page={page}&size={size}
   */
  getFieldJobs: async (page: number = 0, size: number = 20): Promise<Page<FieldJobDto>> => {
    try {
      const response = await api.get<Page<FieldJobDto>>(
        `/field-jobs`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching field jobs:', error);
      throw error;
    }
  },

  /**
   * Get single field job by ID
   * GET /api/field-jobs/{id}
   */
  getFieldJobById: async (id: number): Promise<FieldJobDto> => {
    try {
      const response = await api.get<FieldJobDto>(`/field-jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a field job (only DRAFT/SCHEDULED status)
   * PUT /api/field-jobs/{id}
   */
  updateFieldJob: async (id: number, fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/field-jobs/${id}`, fieldJob);
      return response.data;
    } catch (error) {
      console.error(`Error updating field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a field job (only DRAFT/SCHEDULED status)
   * DELETE /api/field-jobs/{id}
   */
  deleteFieldJob: async (id: number): Promise<void> => {
    try {
      await api.delete(`/field-jobs/${id}`);
    } catch (error) {
      console.error(`Error deleting field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all urgent (CRITICAL/EMERGENCY) jobs
   * GET /api/field-jobs/urgent
   */
  getUrgentJobs: async (): Promise<FieldJobDto[]> => {
    try {
      const response = await api.get<FieldJobDto[]>('/field-jobs/urgent');
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent jobs:', error);
      throw error;
    }
  },

  /**
   * WORKFLOW OPERATIONS
   */

  /**
   * Assign engineer to job (checks availability)
   * PATCH /api/field-jobs/{id}/assign?engineerId={engineerId}
   */
  assignEngineer: async (jobId: number, engineerId: number): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(
        `/field-jobs/${jobId}/assign`,
        {},
        { params: { engineerId } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning engineer to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Start job (transition to IN_PROGRESS)
   * PATCH /api/field-jobs/{id}/start
   */
  startJob: async (id: number): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(`/field-jobs/${id}/start`, {});
      return response.data;
    } catch (error) {
      console.error(`Error starting job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Complete job (transition to PENDING_SIGN_OFF, auto-generate report)
   * PATCH /api/field-jobs/{id}/complete
   */
  completeJob: async (id: number): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(`/field-jobs/${id}/complete`, {});
      return response.data;
    } catch (error) {
      console.error(`Error completing job ${id}:`, error);
      throw error;
    }
  },

  /**
   * CRITICAL: Process client sign-off (fires downstream ERP triggers)
   * POST /api/field-jobs/{id}/sign-off
   * @Transactional(isolation=REPEATABLE_READ)
   */
  processSignOff: async (id: number, signOff: FieldJobSignOffDto): Promise<FieldJobDto> => {
    try {
      const response = await api.post<FieldJobDto>(`/field-jobs/${id}/sign-off`, signOff);
      return response.data;
    } catch (error) {
      console.error(`Error processing sign-off for job ${id}:`, error);
      throw error;
    }
  },

  /**
   * COST MANAGEMENT (future implementation)
   */

  /**
   * Add cost line to job
   * POST /api/field-jobs/{id}/costs
   */
  addCost: async (jobId: number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
    try {
      const response = await api.post<FieldJobCostDto>(
        `/field-jobs/${jobId}/costs`,
        cost
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding cost to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Get all costs for a job
   * GET /api/field-jobs/{id}/costs
   */
  getJobCosts: async (jobId: number): Promise<FieldJobCostDto[]> => {
    try {
      const response = await api.get<FieldJobCostDto[]>(`/field-jobs/${jobId}/costs`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching costs for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * UPDATE cost line (OCC locking enforced)
   * PUT /api/field-jobs/{jobId}/costs/{costId}
   */
  updateCost: async (jobId: number, costId: number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
    try {
      const response = await api.put<FieldJobCostDto>(
        `/field-jobs/${jobId}/costs/${costId}`,
        cost
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating cost ${costId}:`, error);
      throw error;
    }
  },

  /**
   * TRAVEL MANAGEMENT
   */

  /**
   * Add travel leg
   * POST /api/field-jobs/{id}/travel
   */
  addTravel: async (jobId: number, travel: FieldJobTravelDto): Promise<FieldJobTravelDto> => {
    try {
      const response = await api.post<FieldJobTravelDto>(
        `/field-jobs/${jobId}/travel`,
        travel
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding travel to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Get all travel legs for job
   * GET /api/field-jobs/{id}/travel
   */
  getJobTravel: async (jobId: number): Promise<FieldJobTravelDto[]> => {
    try {
      const response = await api.get<FieldJobTravelDto[]>(`/field-jobs/${jobId}/travel`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching travel for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * CHECKLIST MANAGEMENT
   */

  /**
   * Get checklist for job
   * GET /api/field-jobs/{id}/checklist
   */
  getChecklist: async (jobId: number): Promise<FieldJobChecklistDto> => {
    try {
      const response = await api.get<FieldJobChecklistDto>(`/field-jobs/${jobId}/checklist`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching checklist for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Submit completed checklist
   * POST /api/field-jobs/{id}/checklist/submit
   */
  submitChecklist: async (jobId: number, checklist: FieldJobChecklistDto): Promise<FieldJobChecklistDto> => {
    try {
      const response = await api.post<FieldJobChecklistDto>(
        `/field-jobs/${jobId}/checklist/submit`,
        checklist
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting checklist for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * REPORT MANAGEMENT
   */

  /**
   * Get job report
   * GET /api/field-jobs/{id}/report
   */
  getReport: async (jobId: number): Promise<FieldJobReportDto> => {
    try {
      const response = await api.get<FieldJobReportDto>(`/field-jobs/${jobId}/report`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Download report PDF
   * GET /api/field-jobs/{id}/report/pdf
   */
  downloadReportPdf: async (jobId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/field-jobs/${jobId}/report/pdf`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error(`Error downloading report PDF for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * ERROR HANDLING HELPER
   */

  /**
   * Parse API error response
   */
  parseError: (error: any): string => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
};

export default fieldworkApi;
