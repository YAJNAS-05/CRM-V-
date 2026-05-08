// File: src/api/fieldworkApi.ts
// Enhanced Field Work API Integration Layer
// Provides type-safe communication with new backend /api/v1/fieldwork endpoints

import api from './axiosInstance';
import {
  FieldJobDto,
  FieldJobSignOffDto,
  FieldJobCostDto,
  FieldJobTravelDto,
  FieldJobChecklistDto,
  FieldJobReportDto,
  TechnicianDto,
  GpsLocationDto,
  FieldWorkAssetDto,
  FieldJobNoteDto,
  ErrorResponse
} from '../types/fieldwork';
import { Page } from '../types';
import { useFieldworkPendingStore } from '../store/fieldworkPendingStore';

const ENABLE_FIELD_JOBS_API = import.meta.env.VITE_ENABLE_FIELD_JOBS_API !== 'false';

let preferFieldJobsTestEndpoint = false;
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
  const raw = payload?.data ?? payload

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
 * ENHANCED FIELD WORK API - NEW BACKEND INTEGRATION
 */

export const fieldworkApi = {
  // FIELD JOBS - NEW BACKEND ENDPOINTS
  /**
   * Get paginated list of all field jobs
   * GET /api/v1/fieldwork/jobs
   */
  getFieldJobs: async (page: number = 0, size: number = 20): Promise<Page<FieldJobDto>> => {
    try {
      const response = await api.get<Page<FieldJobDto>>('/api/v1/fieldwork/jobs', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching field jobs:', error);
      throw error;
    }
  },

  /**
   * Get single field job by ID
   * GET /api/v1/fieldwork/jobs/{jobId}
   */
  getFieldJobById: async (id: number | string): Promise<FieldJobDto> => {
    try {
      const response = await api.get<FieldJobDto>(`/api/v1/fieldwork/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get field job by job number
   * GET /api/v1/fieldwork/jobs/number/{jobNumber}
   */
  getFieldJobByNumber: async (jobNumber: string): Promise<FieldJobDto> => {
    try {
      const response = await api.get<FieldJobDto>(`/api/v1/fieldwork/jobs/number/${jobNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching field job ${jobNumber}:`, error);
      throw error;
    }
  },

  /**
   * Create a new field job
   * POST /api/v1/fieldwork/jobs
   */
  createFieldJob: async (fieldJob: any): Promise<FieldJobDto> => {
    try {
      const response = await api.post<FieldJobDto>('/api/v1/fieldwork/jobs', fieldJob);
      return response.data;
    } catch (error) {
      console.error('Error creating field job:', error);
      throw error;
    }
  },

  /**
   * Update a field job
   * PUT /api/v1/fieldwork/jobs/{jobId}
   */
  updateFieldJob: async (id: number | string, fieldJob: FieldJobDto): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/api/v1/fieldwork/jobs/${id}`, fieldJob);
      return response.data;
    } catch (error) {
      console.error(`Error updating field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a field job
   * DELETE /api/v1/fieldwork/jobs/{jobId}
   */
  deleteFieldJob: async (id: number | string): Promise<void> => {
    try {
      await api.delete(`/api/v1/fieldwork/jobs/${id}`);
    } catch (error) {
      console.error(`Error deleting field job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update job status
   * PUT /api/v1/fieldwork/jobs/{jobId}/status
   */
  updateJobStatus: async (jobId: string, statusUpdate: any): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/api/v1/fieldwork/jobs/${jobId}/status`, statusUpdate);
      return response.data;
    } catch (error) {
      console.error(`Error updating job status ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Search field jobs
   * POST /api/v1/fieldwork/jobs/search
   */
  searchFieldJobs: async (searchRequest: any, page: number = 0, size: number = 20): Promise<Page<FieldJobDto>> => {
    try {
      const response = await api.post<Page<FieldJobDto>>('/api/v1/fieldwork/jobs/search', searchRequest, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching field jobs:', error);
      throw error;
    }
  },

  /**
   * Get jobs by technician
   * GET /api/v1/fieldwork/jobs/technician/{technicianId}
   */
  getJobsByTechnician: async (technicianId: string, status?: string): Promise<FieldJobDto[]> => {
    try {
      const response = await api.get<FieldJobDto[]>(`/api/v1/fieldwork/jobs/technician/${technicianId}`, {
        params: status ? { status } : {}
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching jobs for technician ${technicianId}:`, error);
      throw error;
    }
  },

  /**
   * Get overdue jobs
   * GET /api/v1/fieldwork/jobs/overdue
   */
  getOverdueJobs: async (): Promise<FieldJobDto[]> => {
    try {
      const response = await api.get<FieldJobDto[]>('/api/v1/fieldwork/jobs/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue jobs:', error);
      throw error;
    }
  },

  /**
   * Get jobs requiring attention
   * GET /api/v1/fieldwork/jobs/attention
   */
  getJobsRequiringAttention: async (): Promise<FieldJobDto[]> => {
    try {
      const response = await api.get<FieldJobDto[]>('/api/v1/fieldwork/jobs/attention');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs requiring attention:', error);
      throw error;
    }
  },

  /**
   * Get all urgent (CRITICAL/EMERGENCY) jobs - combines overdue and attention jobs
   */
  getUrgentJobs: async (): Promise<FieldJobDto[]> => {
    try {
      const [overdue, attention] = await Promise.all([
        fieldworkApi.getOverdueJobs(),
        fieldworkApi.getJobsRequiringAttention()
      ]);
      return [...overdue, ...attention];
    } catch (error) {
      console.error('Error fetching urgent jobs:', error);
      throw error;
    }
  },

  // GPS TRACKING API - NEW BACKEND ENDPOINTS
  /**
   * Get all active technician locations
   * GET /api/v1/fieldwork/gps/active-technicians
   */
  getActiveEngineerLocations: async (): Promise<any> => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
    try {
      const response = await api.get<GpsLocationDto[]>('/api/v1/fieldwork/gps/active-technicians', {
        params: { since }
      });
      return response;
    } catch (error) {
      console.error('Error fetching active technician locations:', error);
      throw error;
    }
  },

  /**
   * Get technician route history
   * GET /api/v1/fieldwork/gps/technician/{technicianId}/path
   */
  getEngineerRoute: async (engineerId: string, startDate: string, endDate: string): Promise<any> => {
    try {
      const response = await api.get<GpsLocationDto[]>(`/api/v1/fieldwork/gps/technician/${engineerId}/path`, {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error(`Error fetching route for technician ${engineerId}:`, error);
      throw error;
    }
  },

  /**
   * Get latest technician location
   * GET /api/v1/fieldwork/gps/technician/{technicianId}/latest
   */
  getLatestTechnicianLocation: async (technicianId: string): Promise<GpsLocationDto> => {
    try {
      const response = await api.get<GpsLocationDto>(`/api/v1/fieldwork/gps/technician/${technicianId}/latest`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching latest location for technician ${technicianId}:`, error);
      throw error;
    }
  },

  /**
   * Create GPS location
   * POST /api/v1/fieldwork/gps/locations
   */
  createGpsLocation: async (location: any): Promise<GpsLocationDto> => {
    try {
      const response = await api.post<GpsLocationDto>('/api/v1/fieldwork/gps/locations', location);
      return response.data;
    } catch (error) {
      console.error('Error creating GPS location:', error);
      throw error;
    }
  },

  /**
   * WORKFLOW OPERATIONS - NEW BACKEND ENDPOINTS
   */

  /**
   * Assign technician to job (checks availability)
   * PUT /api/v1/fieldwork/jobs/{jobId}/status
   */
  assignEngineer: async (jobId: string | number, engineerId: string): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/api/v1/fieldwork/jobs/${jobId}/status`, {
        newStatus: 'ASSIGNED',
        updatedBy: 'system',
        assignedTechnicianId: engineerId
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning technician to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Start job (transition to IN_PROGRESS)
   * PUT /api/v1/fieldwork/jobs/{jobId}/status
   */
  startJob: async (id: string | number): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/api/v1/fieldwork/jobs/${id}/status`, {
        newStatus: 'IN_PROGRESS',
        updatedBy: 'system'
      });
      return response.data;
    } catch (error) {
      console.error(`Error starting job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Complete job (transition to COMPLETED)
   * PUT /api/v1/fieldwork/jobs/{jobId}/status
   */
  completeJob: async (id: string | number): Promise<FieldJobDto> => {
    try {
      const response = await api.put<FieldJobDto>(`/api/v1/fieldwork/jobs/${id}/status`, {
        newStatus: 'COMPLETED',
        updatedBy: 'system'
      });
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
  processSignOff: async (id: string | number, signOff: FieldJobSignOffDto): Promise<FieldJobDto> => {
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
  addCost: async (jobId: string | number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
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
  getJobCosts: async (jobId: string | number): Promise<FieldJobCostDto[]> => {
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
  updateCost: async (jobId: string | number, costId: number, cost: FieldJobCostDto): Promise<FieldJobCostDto> => {
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
  addTravel: async (jobId: string | number, travel: FieldJobTravelDto): Promise<FieldJobTravelDto> => {
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
  getJobTravel: async (jobId: string | number): Promise<FieldJobTravelDto[]> => {
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
  getChecklist: async (jobId: string | number): Promise<FieldJobChecklistDto> => {
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
  submitChecklist: async (jobId: string | number, checklist: FieldJobChecklistDto): Promise<FieldJobChecklistDto> => {
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
  getReport: async (jobId: string | number): Promise<FieldJobReportDto> => {
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
  parseError: (error: unknown): string => {
    const e = error as { response?: { data?: { error?: string } }; message?: string }
    if (e.response?.data?.error) {
      return e.response.data.error
    }
    if (e.message) {
      return e.message
    }
    return 'An unexpected error occurred'
  }
};

export default fieldworkApi;
