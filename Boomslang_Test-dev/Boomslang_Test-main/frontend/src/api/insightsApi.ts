import axiosInstance from './axiosInstance'
import { ApiResponse } from '../types'
import { MyInsightsResponse } from '../types/insights'

export const insightsApi = {
  getMyInsights: async (): Promise<MyInsightsResponse | null> => {
    const response = await axiosInstance.get<ApiResponse<MyInsightsResponse>>('/v1/me/insights')
    return response.data?.data || null
  },
}
