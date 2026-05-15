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

const ENABLE_FIELD_JOBS_API = import.meta.env.VITE_ENABLE_FIELD_JOBS_API !== 'false';
const ENABLE_FIELD_JOBS_TEST_FALLBACK = import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIELD_JOBS_TEST_FALLBACK === 'true';

const unwrapApiPayload = <T>(payload: any): T => {
  if (payload?.data?.data !== undefined) {
    return payload.data.data as T;
  }

  if (payload?.data?.job !== undefined) {
    return payload.data.job as T;
  }

  if (payload?.data !== undefined) {
    return payload.data as T;
  }

  if (payload?.job !== undefined) {
    return payload.job as T;
  }

  return payload as T;
};

const normalizeFieldJobsPage = (
  payload: any,
  page: number,
  size: number
): Page<FieldJobDto> => {
  const raw = payload?.data ?? payload;

  const toPage = (content: FieldJobDto[]): Page<FieldJobDto> => {
    const safeContent = Array.isArray(content) ? content : [];
    const totalElements = Number(raw?.totalElements ?? safeContent.length);
    const totalPages = Number(raw?.totalPages ?? (size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : 1));
    const number = Number(raw?.number ?? page);
    const resolvedSize = Number(raw?.size ?? size);

    return {
      content: safeContent,
      totalElements,
      totalPages,
      number,
      size: resolvedSize,
      hasContent: safeContent.length > 0,
      first: Boolean(raw?.first ?? number <= 0),
      last: Boolean(raw?.last ?? number >= totalPages - 1),
    };
  };

  if (Array.isArray(raw)) {
    return toPage(raw as FieldJobDto[]);
  }

  if (Array.isArray(raw?.content)) {
    return toPage(raw.content as FieldJobDto[]);
  }

  if (Array.isArray(raw?.list)) {
    return toPage(raw.list as FieldJobDto[]);
  }

  if (Array.isArray(raw?.rows)) {
    return toPage(raw.rows as FieldJobDto[]);
  }

  return toPage([]);
};

/**
 * BASE FIELD JOB OPERATIONS
 */

export const fieldworkApi = {
  /**
   * Create a new field job
   * POST /api/field-jobs
   * Falls back to test endpoint, then local fallback if backend is unavailable
   */
  createFieldJob: async (fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    if (!ENABLE_FIELD_JOBS_API) {
      throw new Error('Field Jobs API is disabled by configuration');
    }

    try {
      const response = await api.post<FieldJobDto>('/field-jobs', fieldJob);
      return unwrapApiPayload<FieldJobDto>(response.data);
    } catch (error) {
      if (!ENABLE_FIELD_JOBS_TEST_FALLBACK) {
        throw error;
      }

      const testResponse = await api.post<any>('/field-jobs-test/create', {
        jobType: fieldJob.jobType,
        internalNotes: fieldJob.internalNotes,
        priority: fieldJob.priority || 'ROUTINE'
      });
      return unwrapApiPayload<FieldJobDto>(testResponse.data);
    }
  },

  /**
   * Get paginated list of all field jobs
   * GET /api/field-jobs?page={page}&size={size}
   */
  getFieldJobs: async (page: number = 0, size: number = 20): Promise<Page<FieldJobDto>> => {
    if (!ENABLE_FIELD_JOBS_API) {
      throw new Error('Field Jobs API is disabled by configuration');
    }

    const fetchFromTestEndpoint = async (): Promise<Page<FieldJobDto>> => {
      const testResponse = await api.get<any>(
        `/field-jobs-test/list`,
        { params: { page, size } }
      );
      return normalizeFieldJobsPage(testResponse.data, page, size);
    };

    const fetchFromMainEndpoint = async (): Promise<Page<FieldJobDto>> => {
      const response = await api.get<Page<FieldJobDto>>(
        `/field-jobs`,
        { params: { page, size } }
      );
      return normalizeFieldJobsPage(response.data, page, size);
    };

    try {
      if (ENABLE_FIELD_JOBS_TEST_FALLBACK) {
        const testPage = await fetchFromTestEndpoint();
        return testPage;
      }

      const mainPage = await fetchFromMainEndpoint();
      return mainPage;
    } catch (primaryError) {
      if (ENABLE_FIELD_JOBS_TEST_FALLBACK) {
        console.warn('Test field job list endpoint unavailable, trying main endpoint:', primaryError);
        return await fetchFromMainEndpoint();
      }

      try {
        const testPage = await fetchFromTestEndpoint();
        return testPage;
      } catch (testError) {
        console.error('Both field job endpoints failed:', testError);
        throw primaryError;
      }
    }
  },

  /**
   * Get single field job by ID
   * GET /api/field-jobs/{id}
   */
  getFieldJobById: async (id: number | string): Promise<FieldJobDto> => {
    try {
      const response = await api.get<FieldJobDto>(`/field-jobs/${id}`);
      return unwrapApiPayload<FieldJobDto>(response.data);
    } catch (error) {
      console.error(`Error fetching field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a field job (only DRAFT/SCHEDULED status)
   * PUT /api/field-jobs/{id}
   */
  updateFieldJob: async (id: number | string, fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/field-jobs/${id}`, fieldJob);
      return unwrapApiPayload<FieldJobDto>(response.data);
    } catch (error) {
      console.error(`Error updating field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a field job (only DRAFT/SCHEDULED status)
   * DELETE /api/field-jobs/{id}
   */
  deleteFieldJob: async (id: number | string): Promise<void> => {
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
      return unwrapApiPayload<FieldJobDto[]>(response.data);
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
  assignEngineer: async (jobId: string | number, engineerId: string): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(
        `/field-jobs/${jobId}/assign`,
        {},
        { params: { engineerId } }
      );
      return unwrapApiPayload<FieldJobDto>(response.data);
    } catch (error) {
      console.error(`Error assigning engineer to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Start job (transition to IN_PROGRESS)
   * PATCH /api/field-jobs/{id}/start
   */
  startJob: async (id: string | number): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(`/field-jobs/${id}/start`, {});
      return unwrapApiPayload<FieldJobDto>(response.data);
    } catch (error) {
      console.error(`Error starting job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Complete job (transition to PENDING_SIGN_OFF, auto-generate report)
   * PATCH /api/field-jobs/{id}/complete
   */
  completeJob: async (id: string | number): Promise<FieldJobDto> => {
    try {
      const response = await api.patch<FieldJobDto>(`/field-jobs/${id}/complete`, {});
      return unwrapApiPayload<FieldJobDto>(response.data);
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
  processSignOff: async (id: string | number, signOff: FieldJobSignOffDto): Promise<FieldJobDto> => {
    try {
      const response = await api.post<FieldJobDto>(`/field-jobs/${id}/sign-off`, signOff);
      return unwrapApiPayload<FieldJobDto>(response.data);
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
  addCost: async (jobId: string | number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
    try {
      const response = await api.post<FieldJobCostDto>(
        `/field-jobs/${jobId}/costs`,
        cost
      );
      return unwrapApiPayload<FieldJobCostDto>(response.data);
    } catch (error) {
      console.error(`Error adding cost to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Get all costs for a job
   * GET /api/field-jobs/{id}/costs
   */
  getJobCosts: async (jobId: string | number): Promise<FieldJobCostDto[]> => {
    try {
      const response = await api.get<FieldJobCostDto[]>(`/field-jobs/${jobId}/costs`);
      return unwrapApiPayload<FieldJobCostDto[]>(response.data);
    } catch (error) {
      console.error(`Error fetching costs for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * UPDATE cost line (OCC locking enforced)
   * PUT /api/field-jobs/{jobId}/costs/{costId}
   */
  updateCost: async (jobId: string | number, costId: number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
    try {
      const response = await api.put<FieldJobCostDto>(
        `/field-jobs/${jobId}/costs/${costId}`,
        cost
      );
      return unwrapApiPayload<FieldJobCostDto>(response.data);
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
  addTravel: async (jobId: string | number, travel: FieldJobTravelDto): Promise<FieldJobTravelDto> => {
    try {
      const response = await api.post<FieldJobTravelDto>(
        `/field-jobs/${jobId}/travel`,
        travel
      );
      return unwrapApiPayload<FieldJobTravelDto>(response.data);
    } catch (error) {
      console.error(`Error adding travel to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Get all travel legs for job
   * GET /api/field-jobs/{id}/travel
   */
  getJobTravel: async (jobId: string | number): Promise<FieldJobTravelDto[]> => {
    try {
      const response = await api.get<FieldJobTravelDto[]>(`/field-jobs/${jobId}/travel`);
      return unwrapApiPayload<FieldJobTravelDto[]>(response.data);
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
  getChecklist: async (jobId: string | number): Promise<FieldJobChecklistDto> => {
    try {
      const response = await api.get<FieldJobChecklistDto>(`/field-jobs/${jobId}/checklist`);
      return unwrapApiPayload<FieldJobChecklistDto>(response.data);
    } catch (error) {
      console.error(`Error fetching checklist for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Submit completed checklist
   * POST /api/field-jobs/{id}/checklist/submit
   */
  submitChecklist: async (jobId: string | number, checklist: FieldJobChecklistDto): Promise<FieldJobChecklistDto> => {
    try {
      const response = await api.post<FieldJobChecklistDto>(
        `/field-jobs/${jobId}/checklist/submit`,
        checklist
      );
      return unwrapApiPayload<FieldJobChecklistDto>(response.data);
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
  getReport: async (jobId: string | number): Promise<FieldJobReportDto> => {
    try {
      const response = await api.get<FieldJobReportDto>(`/field-jobs/${jobId}/report`);
      return unwrapApiPayload<FieldJobReportDto>(response.data);
    } catch (error) {
      console.error(`Error fetching report for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Download report PDF
   * GET /api/field-jobs/{id}/report/pdf
   */
  downloadReportPdf: async (jobId: string | number): Promise<Blob> => {
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
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
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
