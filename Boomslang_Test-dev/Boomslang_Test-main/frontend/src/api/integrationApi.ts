import { axiosInstance } from './axiosInstance'

export interface Integration {
  id: string
  name: string
  description: string
  type: 'api' | 'webhook' | 'database' | 'file' | 'message_queue' | 'custom'
  category: string
  provider: string
  status: 'active' | 'inactive' | 'error' | 'configuring'
  configuration: Record<string, any>
  credentials: {
    type: 'api_key' | 'oauth' | 'basic' | 'bearer' | 'custom'
    isEncrypted: boolean
  }
  endpoints: Array<{
    name: string
    url: string
    method: string
    headers?: Record<string, string>
  }>
  schedule?: {
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
    timezone: string
    nextRun: string
    lastRun?: string
  }
  health: {
    isHealthy: boolean
    lastCheck: string
    responseTime: number
    errorRate: number
    uptime: number
  }
  statistics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
    dataVolume: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
}

export interface Webhook {
  id: string
  name: string
  description: string
  url: string
  events: string[]
  method: 'POST' | 'PUT' | 'PATCH'
  headers: Record<string, string>
  isActive: boolean
  secret?: string
  retryPolicy: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier: number
  }
  filters: Array<{
    field: string
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
    value: any
  }>
  statistics: {
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    avgDeliveryTime: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface DataMapping {
  id: string
  name: string
  description: string
  sourceIntegration: string
  targetIntegration: string
  sourceFormat: 'json' | 'xml' | 'csv' | 'custom'
  targetFormat: 'json' | 'xml' | 'csv' | 'custom'
  mappings: Array<{
    sourceField: string
    targetField: string
    transformation?: {
      type: 'direct' | 'function' | 'lookup' | 'conditional'
      config: Record<string, any>
    }
    validation?: {
      required: boolean
      type: string
      pattern?: string
      min?: number
      max?: number
    }
  }>
  isActive: boolean
  testResults?: {
    sourceData: any
    transformedData: any
    validationResults: Array<{
      field: string
      isValid: boolean
      errors: string[]
    }>
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface IntegrationLog {
  id: string
  integrationId: string
  integrationName: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  details?: Record<string, any>
  requestId?: string
  userId?: string
  timestamp: string
  duration?: number
  statusCode?: number
  ipAddress?: string
  userAgent?: string
}

export interface IntegrationMonitoring {
  id: string
  integrationId: string
  metric: 'response_time' | 'error_rate' | 'throughput' | 'data_volume' | 'availability'
  value: number
  threshold?: {
    warning: number
    critical: number
  }
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
}

export interface IntegrationSecurity {
  id: string
  integrationId: string
  securityType: 'authentication' | 'authorization' | 'encryption' | 'validation' | 'rate_limiting'
  config: Record<string, any>
  isActive: boolean
  lastAudited: string
  auditResults: Array<{
    check: string
    status: 'pass' | 'fail' | 'warning'
    details: string
    recommendation?: string
  }>
  complianceScore: number
}

export interface IntegrationTest {
  id: string
  integrationId: string
  name: string
  description: string
  type: 'connection' | 'authentication' | 'data_flow' | 'performance' | 'security'
  config: {
    endpoint?: string
    method?: string
    headers?: Record<string, string>
    payload?: any
    expectedResponse?: any
    timeout?: number
  }
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error'
  results?: {
    responseTime: number
    statusCode: number
    response: any
    errors: string[]
    assertions: Array<{
      passed: boolean
      message: string
    }>
  }
  lastRun: string
  nextRun?: string
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly'
    enabled: boolean
  }
  createdAt: string
  createdBy: string
}

export interface IntegrationBackup {
  id: string
  integrationId: string
  name: string
  description: string
  type: 'configuration' | 'data' | 'full'
  format: 'json' | 'xml' | 'sql' | 'custom'
  size: number
  checksum: string
  location: {
    type: 'local' | 's3' | 'azure' | 'gcs' | 'custom'
    path: string
  }
  isEncrypted: boolean
  encryptionKey?: string
  status: 'creating' | 'completed' | 'failed' | 'restoring'
  createdAt: string
  createdBy: string
  completedAt?: string
}

export interface IntegrationConfiguration {
  id: string
  integrationId: string
  category: 'connection' | 'authentication' | 'data' | 'behavior' | 'monitoring'
  settings: Record<string, any>
  schema: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      required?: boolean
      default?: any
      enum?: any[]
    }>
  }
  validation: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
  lastValidated: string
  updatedBy: string
  updatedAt: string
}

export interface IntegrationDocumentation {
  id: string
  integrationId: string
  title: string
  content: string
  type: 'api_spec' | 'user_guide' | 'troubleshooting' | 'examples' | 'custom'
  format: 'markdown' | 'html' | 'pdf' | 'custom'
  version: string
  isPublished: boolean
  lastUpdated: string
  updatedBy: string
  tags: string[]
}

export interface IntegrationTroubleshooting {
  id: string
  integrationId: string
  issue: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  category: 'connection' | 'authentication' | 'data' | 'performance' | 'configuration'
  symptoms: string[]
  diagnostics: {
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warning'
      message: string
      details?: any
    }>
    recommendations: string[]
    automatedFixes: Array<{
      description: string
      canApply: boolean
      impact: string
    }>
  }
  resolution?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  createdBy: string
}

export const integrationApi = {
  // Dashboard
  getDashboardData: async () => {
    const response = await axiosInstance.get('/api/integrations/dashboard')
    return response.data
  },

  // Integration Management
  getIntegrations: async (filters?: {
    type?: string
    status?: string
    category?: string
    search?: string
  }) => {
    const response = await axiosInstance.get('/api/integrations', { params: filters })
    return response.data
  },

  getIntegration: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/${id}`)
    return response.data
  },

  createIntegration: async (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy' | 'health' | 'statistics'>) => {
    const response = await axiosInstance.post('/api/integrations', integration)
    return response.data
  },

  updateIntegration: async (id: string, integration: Partial<Integration>) => {
    const response = await axiosInstance.put(`/api/integrations/${id}`, integration)
    return response.data
  },

  deleteIntegration: async (id: string) => {
    await axiosInstance.delete(`/api/integrations/${id}`)
  },

  testIntegration: async (id: string, testType: 'connection' | 'authentication' | 'data_flow') => {
    const response = await axiosInstance.post(`/api/integrations/${id}/test`, { testType })
    return response.data
  },

  enableIntegration: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/${id}/enable`)
    return response.data
  },

  disableIntegration: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/${id}/disable`)
    return response.data
  },

  // API Integration
  getAPIIntegrations: async () => {
    const response = await axiosInstance.get('/api/integrations/api')
    return response.data
  },

  createAPIIntegration: async (config: {
    name: string
    description: string
    baseUrl: string
    authentication: {
      type: 'api_key' | 'oauth' | 'basic' | 'bearer'
      credentials: Record<string, any>
    }
    endpoints: Array<{
      name: string
      path: string
      method: string
    }>
  }) => {
    const response = await axiosInstance.post('/api/integrations/api', config)
    return response.data
  },

  testAPIEndpoint: async (integrationId: string, endpoint: string, method: string, headers?: Record<string, string>, body?: any) => {
    const response = await axiosInstance.post(`/api/integrations/api/${integrationId}/test`, {
      endpoint,
      method,
      headers,
      body
    })
    return response.data
  },

  // Data Mapping
  getDataMappings: async (filters?: {
    sourceIntegration?: string
    targetIntegration?: string
    isActive?: boolean
  }) => {
    const response = await axiosInstance.get('/api/integrations/data-mapping', { params: filters })
    return response.data
  },

  getDataMapping: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/data-mapping/${id}`)
    return response.data
  },

  createDataMapping: async (mapping: Omit<DataMapping, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'testResults'>) => {
    const response = await axiosInstance.post('/api/integrations/data-mapping', mapping)
    return response.data
  },

  updateDataMapping: async (id: string, mapping: Partial<DataMapping>) => {
    const response = await axiosInstance.put(`/api/integrations/data-mapping/${id}`, mapping)
    return response.data
  },

  testDataMapping: async (id: string, testData: any) => {
    const response = await axiosInstance.post(`/api/integrations/data-mapping/${id}/test`, { testData })
    return response.data
  },

  // Analytics
  getAnalytics: async (filters?: {
    timeRange?: string
    integrationIds?: string[]
    metrics?: string[]
  }) => {
    const response = await axiosInstance.get('/api/integrations/analytics', { params: filters })
    return response.data
  },

  getIntegrationMetrics: async (id: string, timeRange?: string) => {
    const response = await axiosInstance.get(`/api/integrations/${id}/metrics`, {
      params: { timeRange }
    })
    return response.data
  },

  getUsageStatistics: async (timeRange?: string) => {
    const response = await axiosInstance.get('/api/integrations/analytics/usage', {
      params: { timeRange }
    })
    return response.data
  },

  // Audit
  getAuditLogs: async (filters?: {
    integrationId?: string
    level?: string
    startDate?: string
    endDate?: string
    userId?: string
  }) => {
    const response = await axiosInstance.get('/api/integrations/audit', { params: filters })
    return response.data
  },

  getAuditLog: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/audit/${id}`)
    return response.data
  },

  exportAuditLogs: async (filters: any, format: 'csv' | 'json' | 'excel') => {
    const response = await axiosInstance.get('/api/integrations/audit/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  },

  // Backup
  getBackups: async (filters?: {
    integrationId?: string
    type?: string
    status?: string
  }) => {
    const response = await axiosInstance.get('/api/integrations/backup', { params: filters })
    return response.data
  },

  createBackup: async (config: {
    integrationId: string
    name: string
    description?: string
    type: IntegrationBackup['type']
    format: IntegrationBackup['format']
    location: IntegrationBackup['location']
    isEncrypted?: boolean
  }) => {
    const response = await axiosInstance.post('/api/integrations/backup', config)
    return response.data
  },

  restoreBackup: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/backup/${id}/restore`)
    return response.data
  },

  downloadBackup: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/backup/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  deleteBackup: async (id: string) => {
    await axiosInstance.delete(`/api/integrations/backup/${id}`)
  },

  // Configuration
  getConfigurations: async (integrationId?: string) => {
    const response = await axiosInstance.get('/api/integrations/configuration', {
      params: { integrationId }
    })
    return response.data
  },

  getConfiguration: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/configuration/${id}`)
    return response.data
  },

  updateConfiguration: async (id: string, settings: Record<string, any>) => {
    const response = await axiosInstance.put(`/api/integrations/configuration/${id}`, { settings })
    return response.data
  },

  validateConfiguration: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/configuration/${id}/validate`)
    return response.data
  },

  // Documentation
  getDocumentation: async (integrationId?: string, type?: string) => {
    const response = await axiosInstance.get('/api/integrations/documentation', {
      params: { integrationId, type }
    })
    return response.data
  },

  getDocumentationItem: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/documentation/${id}`)
    return response.data
  },

  createDocumentation: async (doc: Omit<IntegrationDocumentation, 'id' | 'lastUpdated' | 'updatedBy'>) => {
    const response = await axiosInstance.post('/api/integrations/documentation', doc)
    return response.data
  },

  updateDocumentation: async (id: string, doc: Partial<IntegrationDocumentation>) => {
    const response = await axiosInstance.put(`/api/integrations/documentation/${id}`, doc)
    return response.data
  },

  publishDocumentation: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/documentation/${id}/publish`)
    return response.data
  },

  // Logs
  getLogs: async (filters?: {
    integrationId?: string
    level?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    const response = await axiosInstance.get('/api/integrations/logs', { params: filters })
    return response.data
  },

  getLog: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/logs/${id}`)
    return response.data
  },

  downloadLogs: async (filters: any, format: 'csv' | 'json' | 'txt') => {
    const response = await axiosInstance.get('/api/integrations/logs/download', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  },

  clearLogs: async (filters: {
    integrationId?: string
    level?: string
    olderThan?: string
  }) => {
    const response = await axiosInstance.delete('/api/integrations/logs', { params: filters })
    return response.data
  },

  // Monitoring
  getMonitoringData: async (integrationId?: string, timeRange?: string) => {
    const response = await axiosInstance.get('/api/integrations/monitoring', {
      params: { integrationId, timeRange }
    })
    return response.data
  },

  getHealthStatus: async (integrationId: string) => {
    const response = await axiosInstance.get(`/api/integrations/${integrationId}/health`)
    return response.data
  },

  getMetrics: async (integrationId: string, metric: string, timeRange?: string) => {
    const response = await axiosInstance.get(`/api/integrations/${integrationId}/metrics/${metric}`, {
      params: { timeRange }
    })
    return response.data
  },

  // Security
  getSecuritySettings: async (integrationId?: string) => {
    const response = await axiosInstance.get('/api/integrations/security', {
      params: { integrationId }
    })
    return response.data
  },

  updateSecuritySettings: async (id: string, config: Record<string, any>) => {
    const response = await axiosInstance.put(`/api/integrations/security/${id}`, { config })
    return response.data
  },

  runSecurityAudit: async (integrationId: string) => {
    const response = await axiosInstance.post(`/api/integrations/${integrationId}/security/audit`)
    return response.data
  },

  getSecurityReport: async (integrationId: string) => {
    const response = await axiosInstance.get(`/api/integrations/${integrationId}/security/report`)
    return response.data
  },

  // Testing
  getTests: async (integrationId?: string, status?: string) => {
    const response = await axiosInstance.get('/api/integrations/testing', {
      params: { integrationId, status }
    })
    return response.data
  },

  getTest: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/testing/${id}`)
    return response.data
  },

  createTest: async (test: Omit<IntegrationTest, 'id' | 'lastRun' | 'nextRun' | 'createdAt' | 'createdBy' | 'results'>) => {
    const response = await axiosInstance.post('/api/integrations/testing', test)
    return response.data
  },

  runTest: async (id: string) => {
    const response = await axiosInstance.post(`/api/integrations/testing/${id}/run`)
    return response.data
  },

  scheduleTest: async (id: string, schedule: IntegrationTest['schedule']) => {
    const response = await axiosInstance.put(`/api/integrations/testing/${id}/schedule`, { schedule })
    return response.data
  },

  getTestResults: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/testing/${id}/results`)
    return response.data
  },

  // Troubleshooting
  getTroubleshootingIssues: async (filters?: {
    integrationId?: string
    status?: string
    severity?: string
    category?: string
  }) => {
    const response = await axiosInstance.get('/api/integrations/troubleshooting', { params: filters })
    return response.data
  },

  getTroubleshootingIssue: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/troubleshooting/${id}`)
    return response.data
  },

  createTroubleshootingIssue: async (issue: Omit<IntegrationTroubleshooting, 'id' | 'createdAt' | 'createdBy' | 'diagnostics'>) => {
    const response = await axiosInstance.post('/api/integrations/troubleshooting', issue)
    return response.data
  },

  runDiagnostics: async (integrationId: string) => {
    const response = await axiosInstance.post(`/api/integrations/${integrationId}/diagnostics`)
    return response.data
  },

  applyAutomatedFix: async (issueId: string, fixIndex: number) => {
    const response = await axiosInstance.post(`/api/integrations/troubleshooting/${issueId}/fix`, { fixIndex })
    return response.data
  },

  resolveIssue: async (id: string, resolution: string) => {
    const response = await axiosInstance.put(`/api/integrations/troubleshooting/${id}/resolve`, { resolution })
    return response.data
  },

  // Webhooks
  getWebhooks: async (filters?: {
    isActive?: boolean
    event?: string
  }) => {
    const response = await axiosInstance.get('/api/integrations/webhooks', { params: filters })
    return response.data
  },

  getWebhook: async (id: string) => {
    const response = await axiosInstance.get(`/api/integrations/webhooks/${id}`)
    return response.data
  },

  createWebhook: async (webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'statistics'>) => {
    const response = await axiosInstance.post('/api/integrations/webhooks', webhook)
    return response.data
  },

  updateWebhook: async (id: string, webhook: Partial<Webhook>) => {
    const response = await axiosInstance.put(`/api/integrations/webhooks/${id}`, webhook)
    return response.data
  },

  deleteWebhook: async (id: string) => {
    await axiosInstance.delete(`/api/integrations/webhooks/${id}`)
  },

  testWebhook: async (id: string, testPayload: any) => {
    const response = await axiosInstance.post(`/api/integrations/webhooks/${id}/test`, { testPayload })
    return response.data
  },

  getWebhookDeliveryLogs: async (id: string, filters?: {
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await axiosInstance.get(`/api/integrations/webhooks/${id}/logs`, { params: filters })
    return response.data
  },

  redeliverWebhook: async (id: string, deliveryId: string) => {
    const response = await axiosInstance.post(`/api/integrations/webhooks/${id}/redeliver`, { deliveryId })
    return response.data
  }
}
