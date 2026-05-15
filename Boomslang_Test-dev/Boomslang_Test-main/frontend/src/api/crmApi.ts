import axiosInstance from './axiosInstance'
import { ApiResponse } from '../types'
import {
  Account,
  Contact,
  Lead,
  Deal,
  Quote,
  Activity,
  CreateAccountRequest,
  CreateContactRequest,
  CreateLeadRequest,
  CreateDealRequest,
  CreateQuoteRequest,
  CreateActivityRequest,
  LeadConvertRequest,
  ReportDashboardKPIs,
  ReportPipeline,
  ReportConversion,
  ReportActivity,
} from '../types/crm'

// Account APIs
export const accountApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/accounts?page=${page}&size=${size}`),

  search: (query: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(
      `/v1/crm/accounts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    ),
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Account>>(`/v1/crm/accounts/${id}`),
  
  create: (data: CreateAccountRequest) =>
    axiosInstance.post<ApiResponse<Account>>('/v1/crm/accounts', data),
  
  update: (id: string, data: Partial<CreateAccountRequest>) =>
    axiosInstance.put<ApiResponse<Account>>(`/v1/crm/accounts/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/accounts/${id}`),
}

// Contact APIs
export const contactApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/contacts?page=${page}&size=${size}`),

  search: (query: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(
      `/v1/crm/contacts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    ),
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Contact>>(`/v1/crm/contacts/${id}`),
  
  getByAccount: (accountId: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/contacts/account/${accountId}?page=${page}&size=${size}`),
  
  create: (data: CreateContactRequest) =>
    axiosInstance.post<ApiResponse<Contact>>('/v1/crm/contacts', data),
  
  update: (id: string, data: Partial<CreateContactRequest>) =>
    axiosInstance.put<ApiResponse<Contact>>(`/v1/crm/contacts/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/contacts/${id}`),
}

// Lead APIs
export const leadApi = {
  getAll: (page = 0, size = 20, sortField = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/leads?page=${page}&size=${size}&sort=${sortField},${sortDir}`),

  search: (
    query: string,
    page = 0,
    size = 20,
    sortField = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc',
    status?: string,
    source?: string
  ) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
      sort: `${sortField},${sortDir}`,
    })

    if (status) {
      params.set('status', status)
    }

    if (source) {
      params.set('source', source)
    }

    return axiosInstance.get<ApiResponse<any>>(`/v1/crm/leads/search?${params.toString()}`)
  },
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Lead>>(`/v1/crm/leads/${id}`),
  
  getByStatus: (status: string, page = 0, size = 20, sortField = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/leads/status/${status}?page=${page}&size=${size}&sort=${sortField},${sortDir}`),
  
  create: (data: CreateLeadRequest) =>
    axiosInstance.post<ApiResponse<Lead>>('/v1/crm/leads', data),
  
  update: (id: string, data: Partial<CreateLeadRequest>) =>
    axiosInstance.put<ApiResponse<Lead>>(`/v1/crm/leads/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/leads/${id}`),

  convert: (id: string, data: LeadConvertRequest) =>
    axiosInstance.post<ApiResponse<Contact>>(`/v1/crm/leads/${id}/convert`, data),
}

// Deal APIs
export const dealApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/deals?page=${page}&size=${size}`),

  search: (query: string, page = 0, size = 20, stage?: string) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    })

    if (stage) {
      params.set('stage', stage)
    }

    return axiosInstance.get<ApiResponse<any>>(`/v1/crm/deals/search?${params.toString()}`)
  },
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Deal>>(`/v1/crm/deals/${id}`),
  
  getByAccount: (accountId: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/deals/account/${accountId}?page=${page}&size=${size}`),
  
  getByStage: (stage: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/deals/stage/${stage}?page=${page}&size=${size}`),
  
  create: (data: CreateDealRequest) =>
    axiosInstance.post<ApiResponse<Deal>>('/v1/crm/deals', data),
  
  update: (id: string, data: Partial<CreateDealRequest>) =>
    axiosInstance.put<ApiResponse<Deal>>(`/v1/crm/deals/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/deals/${id}`),
}

// Quote APIs
export const quoteApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/quotes?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Quote>>(`/v1/crm/quotes/${id}`),
  
  getByDeal: (dealId: string, page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/quotes/deal/${dealId}?page=${page}&size=${size}`),
  
  create: (data: CreateQuoteRequest) =>
    axiosInstance.post<ApiResponse<Quote>>('/v1/crm/quotes', data),
  
  update: (id: string, data: Partial<CreateQuoteRequest>) =>
    axiosInstance.put<ApiResponse<Quote>>(`/v1/crm/quotes/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/quotes/${id}`),
}

// Activity APIs
export const activityApi = {
  getAll: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<any>>(`/v1/crm/activities?page=${page}&size=${size}`),
  
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Activity>>(`/v1/crm/activities/${id}`),
  
  getByDeal: (dealId: string) =>
    axiosInstance.get<ApiResponse<Activity[]>>(`/v1/crm/activities/deal/${dealId}`),
  
  getByLead: (leadId: string) =>
    axiosInstance.get<ApiResponse<Activity[]>>(`/v1/crm/activities/lead/${leadId}`),
  
  getByContact: (contactId: string) =>
    axiosInstance.get<ApiResponse<Activity[]>>(`/v1/crm/activities/contact/${contactId}`),
  
  getOverdue: () =>
    axiosInstance.get<ApiResponse<Activity[]>>(`/v1/crm/activities/overdue`),
  
  create: (data: CreateActivityRequest) =>
    axiosInstance.post<ApiResponse<Activity>>('/v1/crm/activities', data),
  
  update: (id: string, data: Partial<CreateActivityRequest>) =>
    axiosInstance.put<ApiResponse<Activity>>(`/v1/crm/activities/${id}`, data),
  
  complete: (id: string) =>
    axiosInstance.patch<ApiResponse<Activity>>(`/v1/crm/activities/${id}/complete`),
  
  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/v1/crm/activities/${id}`),
}

// Report APIs
export const reportApi = {
  getDashboard: () =>
    axiosInstance.get<ApiResponse<ReportDashboardKPIs>>('/v1/crm/reports/dashboard'),

  getDashboardUser: () =>
    axiosInstance.get<ApiResponse<ReportDashboardKPIs>>('/v1/crm/reports/dashboard/user'),

  getDashboardTeam: () =>
    axiosInstance.get<ApiResponse<ReportDashboardKPIs>>('/v1/crm/reports/dashboard/team'),

  getPipeline: () =>
    axiosInstance.get<ApiResponse<ReportPipeline>>('/v1/crm/reports/pipeline'),

  getPipelineUser: () =>
    axiosInstance.get<ApiResponse<ReportPipeline>>('/v1/crm/reports/pipeline/user'),

  getPipelineTeam: () =>
    axiosInstance.get<ApiResponse<ReportPipeline>>('/v1/crm/reports/pipeline/team'),

  getConversion: () =>
    axiosInstance.get<ApiResponse<ReportConversion>>('/v1/crm/reports/conversion'),

  getConversionUser: () =>
    axiosInstance.get<ApiResponse<ReportConversion>>('/v1/crm/reports/conversion/user'),

  getConversionTeam: () =>
    axiosInstance.get<ApiResponse<ReportConversion>>('/v1/crm/reports/conversion/team'),

  getActivities: () =>
    axiosInstance.get<ApiResponse<ReportActivity>>('/v1/crm/reports/activities'),

  getActivitiesUser: () =>
    axiosInstance.get<ApiResponse<ReportActivity>>('/v1/crm/reports/activities/user'),

  getActivitiesTeam: () =>
    axiosInstance.get<ApiResponse<ReportActivity>>('/v1/crm/reports/activities/team'),

  getFull: () =>
    axiosInstance.get<ApiResponse<any>>('/v1/crm/reports'),
}
