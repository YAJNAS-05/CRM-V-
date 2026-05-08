import axiosInstance from './axios'

export interface SubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  maxUsers: number
  maxStorageGb: number
  features: string[]
}

export interface Subscription {
  id: string
  tenantId: string
  planType: string
  status: string
  monthlyPrice: number
  maxUsers: number
  currentUsers: number
  maxStorageGb: number
  usedStorageGb: number
  nextBillingDate: string
  trialEnd?: string
  features: string[]
}

export interface UsageMetrics {
  users: {
    current: number
    max: number
    percentage: number
  }
  storage: {
    current: number
    max: number
    percentage: number
  }
  apiCalls: {
    current: number
    max: number
    percentage: number
  }
  features: {
    crm: boolean
    analytics: boolean
    ai: boolean
    integrations: boolean
  }
}

export interface BillingInfo {
  tenantId: string
  currentPlan: string
  monthlyPrice: number
  nextBillingDate: string
  paymentMethod: string
  paymentStatus: string
  billingHistory: Array<{
    date: string
    amount: number
    status: string
  }>
}

export const saasApi = {
  // Subscription Plans
  getSubscriptionPlans: async () => {
    const response = await axiosInstance.get('/saas/plans')
    return response.data
  },

  // Current Subscription
  getCurrentSubscription: async (tenantId: string) => {
    const response = await axiosInstance.get(`/saas/subscription/current?tenantId=${tenantId}`)
    return response.data
  },

  // Subscription Management
  upgradeSubscription: async (tenantId: string, planType: string) => {
    const response = await axiosInstance.post('/saas/subscription/upgrade', null, {
      params: { tenantId, planType }
    })
    return response.data
  },

  cancelSubscription: async (tenantId: string) => {
    const response = await axiosInstance.post('/saas/subscription/cancel', null, {
      params: { tenantId }
    })
    return response.data
  },

  // Usage Metrics
  getUsageMetrics: async (tenantId: string) => {
    const response = await axiosInstance.get(`/saas/usage?tenantId=${tenantId}`)
    return response.data
  },

  // Billing Information
  getBillingInfo: async (tenantId: string) => {
    const response = await axiosInstance.get(`/saas/billing?tenantId=${tenantId}`)
    return response.data
  }
}
