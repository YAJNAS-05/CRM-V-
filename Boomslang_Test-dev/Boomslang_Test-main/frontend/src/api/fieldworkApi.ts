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

const ENABLE_FIELD_JOBS_API = import.meta.env.VITE_ENABLE_FIELD_JOBS_API === 'true';

let preferFieldJobsTestEndpoint = true;
let fieldJobsNetworkUnavailable = !ENABLE_FIELD_JOBS_API;

const markFieldJobsNetworkAvailable = () => {
  fieldJobsNetworkUnavailable = false;
};

const markFieldJobsNetworkUnavailable = () => {
  fieldJobsNetworkUnavailable = true;
};

const isFieldJobsNetworkBlocked = () => fieldJobsNetworkUnavailable;

const FIELD_JOBS_LOCAL_STORAGE_KEY = 'everx_field_jobs_local';

const readLocalFieldJobs = (): FieldJobDto[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(FIELD_JOBS_LOCAL_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FieldJobDto[]) : [];
  } catch {
    return [];
  }
};

const writeLocalFieldJobs = (jobs: FieldJobDto[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FIELD_JOBS_LOCAL_STORAGE_KEY, JSON.stringify(jobs));
};

const upsertLocalFieldJob = (job: FieldJobDto) => {
  const local = readLocalFieldJobs();
  const key = String(job.fieldJobId ?? job.jobNumber ?? '');
  const index = local.findIndex((item) => {
    const itemKey = String(item.fieldJobId ?? item.jobNumber ?? '');
    return itemKey === key;
  });

  if (index >= 0) {
    local[index] = {
      ...local[index],
      ...job,
      updatedAt: new Date().toISOString(),
    };
  } else {
    local.unshift(job);
  }

  writeLocalFieldJobs(local);
};

const removeLocalFieldJob = (id: string | number) => {
  const normalizedId = String(id);
  const local = readLocalFieldJobs().filter((job) => {
    const byFieldJobId = String(job.fieldJobId ?? '') === normalizedId;
    const byJobNumber = String(job.jobNumber ?? '') === normalizedId;
    return !byFieldJobId && !byJobNumber;
  });
  writeLocalFieldJobs(local);
};

const createLocalFieldJob = (fieldJob: FieldJobDto): FieldJobDto => {
  const now = new Date().toISOString();
  const fallbackId = -Date.now();
  return {
    ...fieldJob,
    fieldJobId: fieldJob.fieldJobId ?? fallbackId,
    jobNumber: fieldJob.jobNumber || `JOB-${Date.now()}`,
    jobStatus: fieldJob.jobStatus || 'DRAFT',
    createdAt: fieldJob.createdAt || now,
    updatedAt: now,
    createdBy: fieldJob.createdBy || 'LOCAL_FALLBACK',
    updatedBy: 'LOCAL_FALLBACK',
  };
};

const createLocalFieldJobsPage = (page: number, size: number): Page<FieldJobDto> => {
  const local = readLocalFieldJobs();
  const safeSize = size > 0 ? size : 20;
  const start = page * safeSize;
  const content = local.slice(start, start + safeSize);
  const totalElements = local.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / safeSize));

  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size: safeSize,
    hasContent: content.length > 0,
    first: page <= 0,
    last: page >= totalPages - 1,
  };
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
    if (isFieldJobsNetworkBlocked()) {
      const localJob = createLocalFieldJob(fieldJob);
      upsertLocalFieldJob(localJob);
      return localJob;
    }

    try {
      const response = await api.post<FieldJobDto>('/field-jobs', fieldJob);
      markFieldJobsNetworkAvailable();
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
        markFieldJobsNetworkAvailable();
        return testResponse.data as FieldJobDto;
      } catch (testError) {
        markFieldJobsNetworkUnavailable();
        console.warn('Both create endpoints failed, using local fallback:', testError);
        const localJob = createLocalFieldJob(fieldJob);
        upsertLocalFieldJob(localJob);
        return localJob;
      }
    }
  },

  /**
   * Get paginated list of all field jobs
   * GET /api/field-jobs?page={page}&size={size}
   */
  getFieldJobs: async (page: number = 0, size: number = 20): Promise<Page<FieldJobDto>> => {
    if (isFieldJobsNetworkBlocked()) {
      return createLocalFieldJobsPage(page, size);
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
      if (preferFieldJobsTestEndpoint) {
        const testPage = await fetchFromTestEndpoint();
        markFieldJobsNetworkAvailable();
        return testPage;
      }

      const mainPage = await fetchFromMainEndpoint();
      markFieldJobsNetworkAvailable();
      return mainPage;
    } catch (primaryError) {
      if (preferFieldJobsTestEndpoint) {
        console.warn('Test field job list endpoint unavailable, trying main endpoint:', primaryError);
        try {
          const mainPage = await fetchFromMainEndpoint();
          preferFieldJobsTestEndpoint = false;
          markFieldJobsNetworkAvailable();
          return mainPage;
        } catch (mainError) {
          markFieldJobsNetworkUnavailable();
          console.warn('Both list endpoints failed, using local fallback:', mainError);
          return createLocalFieldJobsPage(page, size);
        }
      }

      console.warn('Main field job endpoint failed, trying test endpoint:', primaryError);
      try {
        const testPage = await fetchFromTestEndpoint();
        preferFieldJobsTestEndpoint = true;
        markFieldJobsNetworkAvailable();
        return testPage;
      } catch (testError) {
        markFieldJobsNetworkUnavailable();
        console.warn('Both list endpoints failed, using local fallback:', testError);
        return createLocalFieldJobsPage(page, size);
      }
    }
  },

  /**
   * Get single field job by ID
   * GET /api/field-jobs/{id}
   */
  getFieldJobById: async (id: number | string): Promise<FieldJobDto> => {
    const normalizedId = String(id);

    if (isFieldJobsNetworkBlocked()) {
      const localJob = readLocalFieldJobs().find((job) => {
        const byFieldJobId = String(job.fieldJobId ?? '') === normalizedId;
        const byJobNumber = String(job.jobNumber ?? '') === normalizedId;
        return byFieldJobId || byJobNumber;
      });

      if (localJob) return localJob;
      throw new Error(`Field job ${id} not found`);
    }

    try {
      const response = await api.get<FieldJobDto>(`/field-jobs/${id}`);
      return response.data;
    } catch (error) {
      const localJob = readLocalFieldJobs().find((job) => {
        const byFieldJobId = String(job.fieldJobId ?? '') === normalizedId;
        const byJobNumber = String(job.jobNumber ?? '') === normalizedId;
        return byFieldJobId || byJobNumber;
      });

      if (localJob) {
        markFieldJobsNetworkUnavailable();
        return localJob;
      }

      console.error(`Error fetching field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update a field job (only DRAFT/SCHEDULED status)
   * PUT /api/field-jobs/{id}
   */
  updateFieldJob: async (id: number | string, fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    if (isFieldJobsNetworkBlocked()) {
      const localJob = {
        ...fieldJob,
        fieldJobId: fieldJob.fieldJobId ?? (id as unknown as number),
        updatedAt: new Date().toISOString(),
      };
      upsertLocalFieldJob(localJob);
      return localJob;
    }

    try {
      const response = await api.put<FieldJobDto>(`/field-jobs/${id}`, fieldJob);
      markFieldJobsNetworkAvailable();
      return response.data;
    } catch (error) {
      markFieldJobsNetworkUnavailable();
      const localJob = {
        ...fieldJob,
        fieldJobId: fieldJob.fieldJobId ?? (id as unknown as number),
        updatedAt: new Date().toISOString(),
      };
      upsertLocalFieldJob(localJob);
      return localJob;
    }
  },

  /**
   * Delete a field job (only DRAFT/SCHEDULED status)
   * DELETE /api/field-jobs/{id}
   */
  deleteFieldJob: async (id: number | string): Promise<void> => {
    if (isFieldJobsNetworkBlocked()) {
      removeLocalFieldJob(id);
      return;
    }

    try {
      await api.delete(`/field-jobs/${id}`);
      markFieldJobsNetworkAvailable();
    } catch (error) {
      markFieldJobsNetworkUnavailable();
      removeLocalFieldJob(id);
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
