import { axiosInstance } from './axiosInstance'

export interface PerformanceMetric {
  id: string
  name: string
  description: string
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'availability'
  currentValue: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  target: number
  lastUpdated: string
}

export interface PerformanceAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  category: string
  metric: string
  threshold: number
  currentValue: number
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  assignedTo?: string
}

export interface PerformanceBenchmark {
  id: string
  name: string
  description: string
  category: string
  baseline: number
  target: number
  current: number
  unit: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  lastUpdated: string
  history: Array<{
    timestamp: string
    value: number
  }>
}

export interface PerformanceComparison {
  id: string
  name: string
  description: string
  period1: {
    name: string
    startDate: string
    endDate: string
  }
  period2: {
    name: string
    startDate: string
    endDate: string
  }
  metrics: {
    responseTimeChange: number
    throughputChange: number
    errorRateChange: number
    resourceUtilizationChange: number
    overallScore: number
  }
  insights: string[]
  recommendations: string[]
}

export interface PerformanceSLA {
  id: string
  name: string
  description: string
  category: 'response_time' | 'availability' | 'throughput' | 'error_rate'
  target: number
  unit: string
  currentValue: number
  status: 'compliant' | 'warning' | 'violation' | 'exceeded'
  compliancePercentage: number
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    startDate: string
    endDate: string
  }
  history: Array<{
    timestamp: string
    value: number
    target: number
    status: 'compliant' | 'warning' | 'violation'
  }>
}

export interface PerformanceThreshold {
  id: string
  name: string
  metric: string
  warningThreshold: number
  criticalThreshold: number
  unit: string
  isActive: boolean
  notificationChannels: string[]
  createdAt: string
  lastTriggered?: string
}

export interface PerformanceTrend {
  id: string
  name: string
  description: string
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'availability'
  current: number
  previous: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  dataPoints: Array<{
    timestamp: string
    value: number
    baseline?: number
  }>
  forecast?: {
    predicted: number
    confidence: number
    timeframe: string
  }
}

export interface PerformanceOptimization {
  id: string
  name: string
  description: string
  type: 'query' | 'index' | 'cache' | 'configuration' | 'infrastructure'
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  status: 'suggested' | 'in_progress' | 'completed' | 'rejected'
  estimatedImprovement: number
  actualImprovement?: number
  createdAt: string
  completedAt?: string
}

export interface PerformanceProfile {
  id: string
  name: string
  description: string
  endpoint: string
  method: string
  avgResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  requestCount: number
  errorCount: number
  errorRate: number
  lastExecuted: string
  status: 'active' | 'inactive'
}

export interface PerformanceReport {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  period: {
    startDate: string
    endDate: string
  }
  metrics: PerformanceMetric[]
  summary: {
    overallScore: number
    totalAlerts: number
    criticalIssues: number
    improvements: number
  }
  generatedAt: string
}

export const performanceApi = {
  // Dashboard
  getDashboardData: async () => {
    const response = await axiosInstance.get('/api/performance/dashboard')
    return response.data
  },

  // Metrics
  getMetrics: async (filters?: {
    category?: string
    status?: string
    timeRange?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/metrics', { params: filters })
    return response.data
  },

  getMetric: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/metrics/${id}`)
    return response.data
  },

  createMetric: async (metric: Omit<PerformanceMetric, 'id' | 'lastUpdated'>) => {
    const response = await axiosInstance.post('/api/performance/metrics', metric)
    return response.data
  },

  updateMetric: async (id: string, metric: Partial<PerformanceMetric>) => {
    const response = await axiosInstance.put(`/api/performance/metrics/${id}`, metric)
    return response.data
  },

  deleteMetric: async (id: string) => {
    await axiosInstance.delete(`/api/performance/metrics/${id}`)
  },

  // Alerts
  getAlerts: async (filters?: {
    severity?: string
    status?: string
    category?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/alerts', { params: filters })
    return response.data
  },

  getAlert: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/alerts/${id}`)
    return response.data
  },

  acknowledgeAlert: async (id: string) => {
    const response = await axiosInstance.post(`/api/performance/alerts/${id}/acknowledge`)
    return response.data
  },

  resolveAlert: async (id: string) => {
    const response = await axiosInstance.post(`/api/performance/alerts/${id}/resolve`)
    return response.data
  },

  // Analytics
  getAnalytics: async (filters?: {
    timeRange?: string
    metrics?: string[]
    granularity?: 'hour' | 'day' | 'week' | 'month'
  }) => {
    const response = await axiosInstance.get('/api/performance/analytics', { params: filters })
    return response.data
  },

  // Benchmarking
  getBenchmarks: async (filters?: {
    category?: string
    status?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/benchmarks', { params: filters })
    return response.data
  },

  getBenchmark: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/benchmarks/${id}`)
    return response.data
  },

  createBenchmark: async (benchmark: Omit<PerformanceBenchmark, 'id' | 'lastUpdated' | 'history'>) => {
    const response = await axiosInstance.post('/api/performance/benchmarks', benchmark)
    return response.data
  },

  // Comparison
  getComparisons: async () => {
    const response = await axiosInstance.get('/api/performance/comparisons')
    return response.data
  },

  getComparison: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/comparisons/${id}`)
    return response.data
  },

  createComparison: async (comparison: Omit<PerformanceComparison, 'id'>) => {
    const response = await axiosInstance.post('/api/performance/comparisons', comparison)
    return response.data
  },

  // Monitoring
  getMonitoringData: async (filters?: {
    timeRange?: string
    metrics?: string[]
  }) => {
    const response = await axiosInstance.get('/api/performance/monitoring', { params: filters })
    return response.data
  },

  getRealTimeMetrics: async () => {
    const response = await axiosInstance.get('/api/performance/monitoring/realtime')
    return response.data
  },

  // Optimization
  getOptimizations: async (filters?: {
    status?: string
    type?: string
    impact?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/optimizations', { params: filters })
    return response.data
  },

  getOptimization: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/optimizations/${id}`)
    return response.data
  },

  createOptimization: async (optimization: Omit<PerformanceOptimization, 'id' | 'createdAt'>) => {
    const response = await axiosInstance.post('/api/performance/optimizations', optimization)
    return response.data
  },

  updateOptimizationStatus: async (id: string, status: PerformanceOptimization['status']) => {
    const response = await axiosInstance.patch(`/api/performance/optimizations/${id}/status`, { status })
    return response.data
  },

  // Profiling
  getProfiles: async (filters?: {
    endpoint?: string
    status?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/profiles', { params: filters })
    return response.data
  },

  getProfile: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/profiles/${id}`)
    return response.data
  },

  createProfile: async (profile: Omit<PerformanceProfile, 'id' | 'lastExecuted'>) => {
    const response = await axiosInstance.post('/api/performance/profiles', profile)
    return response.data
  },

  executeProfile: async (id: string) => {
    const response = await axiosInstance.post(`/api/performance/profiles/${id}/execute`)
    return response.data
  },

  // Reporting
  getReports: async (filters?: {
    type?: string
    period?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/reports', { params: filters })
    return response.data
  },

  getReport: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/reports/${id}`)
    return response.data
  },

  generateReport: async (config: {
    type: PerformanceReport['type']
    period: {
      startDate: string
      endDate: string
    }
    metrics?: string[]
  }) => {
    const response = await axiosInstance.post('/api/performance/reports/generate', config)
    return response.data
  },

  downloadReport: async (id: string, format: 'pdf' | 'excel' | 'csv') => {
    const response = await axiosInstance.get(`/api/performance/reports/${id}/download`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  // SLA
  getSLAs: async (filters?: {
    status?: string
    category?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/sla', { params: filters })
    return response.data
  },

  getSLA: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/sla/${id}`)
    return response.data
  },

  createSLA: async (sla: Omit<PerformanceSLA, 'id' | 'history'>) => {
    const response = await axiosInstance.post('/api/performance/sla', sla)
    return response.data
  },

  updateSLA: async (id: string, sla: Partial<PerformanceSLA>) => {
    const response = await axiosInstance.put(`/api/performance/sla/${id}`, sla)
    return response.data
  },

  // Thresholds
  getThresholds: async (filters?: {
    metric?: string
    isActive?: boolean
  }) => {
    const response = await axiosInstance.get('/api/performance/thresholds', { params: filters })
    return response.data
  },

  getThreshold: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/thresholds/${id}`)
    return response.data
  },

  createThreshold: async (threshold: Omit<PerformanceThreshold, 'id' | 'createdAt'>) => {
    const response = await axiosInstance.post('/api/performance/thresholds', threshold)
    return response.data
  },

  updateThreshold: async (id: string, threshold: Partial<PerformanceThreshold>) => {
    const response = await axiosInstance.put(`/api/performance/thresholds/${id}`, threshold)
    return response.data
  },

  deleteThreshold: async (id: string) => {
    await axiosInstance.delete(`/api/performance/thresholds/${id}`)
  },

  // Trends
  getTrends: async (filters?: {
    category?: string
    timeRange?: string
  }) => {
    const response = await axiosInstance.get('/api/performance/trends', { params: filters })
    return response.data
  },

  getTrend: async (id: string) => {
    const response = await axiosInstance.get(`/api/performance/trends/${id}`)
    return response.data
  },

  generateTrendForecast: async (id: string, config: {
    timeframe: string
    confidence: number
  }) => {
    const response = await axiosInstance.post(`/api/performance/trends/${id}/forecast`, config)
    return response.data
  }
}
