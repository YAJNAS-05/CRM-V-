import axiosInstance from './axios'

export interface InsightRequest {
  id?: string
  insightType: string
  tenantId: string
  parameters?: Record<string, any>
  startDate?: string
  endDate?: string
  dataSource?: string
  filters?: Record<string, any>
  priority?: string
  includeRecommendations?: boolean
}

export interface AIModel {
  id: string
  name: string
  type: string
  version: string
  tenantId: string
  modelConfig?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PredictionRequest {
  tenantId: string
  modelType: string
  data: Record<string, any>
}

export const aiApi = {
  // AI Insights
  generateInsights: async (request: InsightRequest) => {
    const response = await axiosInstance.post('/ai/insights/generate', request)
    return response.data
  },

  // AI Models
  getAvailableModels: async () => {
    const response = await axiosInstance.get('/ai/models')
    return response.data
  },

  makePrediction: async (request: PredictionRequest) => {
    const response = await axiosInstance.post('/ai/predict', request)
    return response.data
  },

  // Analytics Endpoints
  getRevenueAnalytics: async (tenantId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ tenantId })
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const response = await axiosInstance.get(`/ai/analytics/revenue?${params}`)
    return response.data
  },

  getCustomerAnalytics: async (tenantId: string) => {
    const response = await axiosInstance.get(`/ai/analytics/customers?tenantId=${tenantId}`)
    return response.data
  },

  getOperationalAnalytics: async (tenantId: string) => {
    const response = await axiosInstance.get(`/ai/analytics/operational?tenantId=${tenantId}`)
    return response.data
  },

  getRiskAnalytics: async (tenantId: string) => {
    const response = await axiosInstance.get(`/ai/analytics/risk?tenantId=${tenantId}`)
    return response.data
  }
}
