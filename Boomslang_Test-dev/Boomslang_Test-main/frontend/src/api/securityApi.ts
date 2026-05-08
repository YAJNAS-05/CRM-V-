import { axiosInstance } from './axiosInstance'

export interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'permission_change' | 'data_access' | 'system_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  userId?: string
  username?: string
  ipAddress: string
  userAgent?: string
  location?: {
    country: string
    city: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export interface SecuritySession {
  id: string
  userId: string
  username: string
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
  }
  loginTime: string
  lastActivity: string
  isActive: boolean
  expiresAt: string
  deviceInfo?: {
    type: string
    os: string
    browser: string
  }
}

export interface SecurityPolicy {
  id: string
  name: string
  description: string
  type: 'password' | 'session' | 'access' | 'data' | 'network'
  category: string
  isEnabled: boolean
  rules: Array<{
    name: string
    description: string
    value: any
    type: 'string' | 'number' | 'boolean' | 'array'
  }>
  enforcementLevel: 'advisory' | 'warning' | 'strict'
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  type: 'intrusion' | 'malware' | 'data_breach' | 'policy_violation' | 'anomaly'
  source: string
  userId?: string
  ipAddress?: string
  timestamp: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
  metadata?: Record<string, any>
}

export interface SecurityIncident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'contained' | 'resolved'
  type: 'data_breach' | 'system_compromise' | 'denial_of_service' | 'insider_threat' | 'malware'
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: string
  affectedSystems: string[]
  affectedUsers: string[]
  impact: {
    dataExposed: boolean
    systemsAffected: number
    usersAffected: number
    estimatedDamage: string
  }
  timeline: Array<{
    timestamp: string
    action: string
    description: string
    performedBy: string
  }>
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface SecurityRole {
  id: string
  name: string
  description: string
  category: string
  permissions: string[]
  isActive: boolean
  isSystem: boolean
  userCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SecurityThreat {
  id: string
  name: string
  description: string
  type: 'malware' | 'phishing' | 'sql_injection' | 'xss' | 'ddos' | 'brute_force' | 'social_engineering'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'mitigated' | 'resolved'
  source: string
  target: string
  detectedAt: string
  confidence: number
  indicators: Array<{
    type: string
    value: string
    description: string
  }>
  mitigations: Array<{
    action: string
    timestamp: string
    performedBy: string
  }>
}

export interface SecurityCompliance {
  id: string
  framework: string
  standard: string
  requirement: string
  description: string
  category: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  compliancePercentage: number
  lastAssessed: string
  nextAssessment: string
  evidence: Array<{
    type: string
    description: string
    url?: string
    uploadedAt: string
  }>
  violations: Array<{
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    discoveredAt: string
    resolvedAt?: string
  }>
}

export interface SecurityAudit {
  id: string
  type: 'access' | 'configuration' | 'compliance' | 'vulnerability' | 'custom'
  name: string
  description: string
  status: 'scheduled' | 'running' | 'completed' | 'failed'
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand'
    nextRun: string
    lastRun?: string
  }
  scope: {
    systems: string[]
    users: string[]
    resources: string[]
  }
  results?: {
    totalChecks: number
    passed: number
    failed: number
    warnings: number
    score: number
  }
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    category: string
    description: string
    recommendation: string
    status: 'open' | 'acknowledged' | 'resolved'
  }>
  createdAt: string
  createdBy: string
  completedAt?: string
}

export interface SecurityReport {
  id: string
  name: string
  description: string
  type: 'security_posture' | 'threat_landscape' | 'compliance' | 'incident_summary' | 'custom'
  period: {
    startDate: string
    endDate: string
  }
  status: 'generating' | 'completed' | 'failed'
  summary: {
    overallScore: number
    criticalIssues: number
    highIssues: number
    mediumIssues: number
    lowIssues: number
    incidents: number
    complianceScore: number
  }
  sections: Array<{
    title: string
    content: string
    charts?: Array<{
      type: string
      data: any
    }>
  }>
  generatedAt: string
  generatedBy: string
}

export interface SecuritySetting {
  id: string
  category: 'authentication' | 'authorization' | 'session' | 'audit' | 'notification'
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  isEditable: boolean
  requiresRestart: boolean
  lastModified: string
  modifiedBy: string
}

export const securityApi = {
  // Two-Factor Authentication
  get2FASettings: async () => {
    const response = await axiosInstance.get('/api/security/2fa/settings')
    return response.data
  },

  enable2FA: async (method: 'sms' | 'email' | 'app') => {
    const response = await axiosInstance.post('/api/security/2fa/enable', { method })
    return response.data
  },

  disable2FA: async () => {
    const response = await axiosInstance.post('/api/security/2fa/disable')
    return response.data
  },

  verify2FA: async (code: string) => {
    const response = await axiosInstance.post('/api/security/2fa/verify', { code })
    return response.data
  },

  generateBackupCodes: async () => {
    const response = await axiosInstance.post('/api/security/2fa/backup-codes')
    return response.data
  },

  // SSO Configuration
  getSSOConfig: async () => {
    const response = await axiosInstance.get('/api/security/sso/config')
    return response.data
  },

  updateSSOConfig: async (config: any) => {
    const response = await axiosInstance.put('/api/security/sso/config', config)
    return response.data
  },

  testSSOConnection: async (provider: string) => {
    const response = await axiosInstance.post('/api/security/sso/test', { provider })
    return response.data
  },

  // Sessions
  getSessions: async (filters?: {
    userId?: string
    isActive?: boolean
    ipAddress?: string
  }) => {
    const response = await axiosInstance.get('/api/security/sessions', { params: filters })
    return response.data
  },

  getSession: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/sessions/${id}`)
    return response.data
  },

  terminateSession: async (id: string) => {
    await axiosInstance.delete(`/api/security/sessions/${id}`)
  },

  terminateAllSessions: async (userId?: string) => {
    await axiosInstance.post('/api/security/sessions/terminate-all', { userId })
  },

  // Events
  getEvents: async (filters?: {
    type?: string
    severity?: string
    userId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const response = await axiosInstance.get('/api/security/events', { params: filters })
    return response.data
  },

  getEvent: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/events/${id}`)
    return response.data
  },

  // Policies
  getPolicies: async (filters?: {
    type?: string
    category?: string
    isEnabled?: boolean
  }) => {
    const response = await axiosInstance.get('/api/security/policies', { params: filters })
    return response.data
  },

  getPolicy: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/policies/${id}`)
    return response.data
  },

  createPolicy: async (policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/security/policies', policy)
    return response.data
  },

  updatePolicy: async (id: string, policy: Partial<SecurityPolicy>) => {
    const response = await axiosInstance.put(`/api/security/policies/${id}`, policy)
    return response.data
  },

  deletePolicy: async (id: string) => {
    await axiosInstance.delete(`/api/security/policies/${id}`)
  },

  // Analytics
  getAnalytics: async (filters?: {
    timeRange?: string
    metrics?: string[]
    granularity?: 'hour' | 'day' | 'week' | 'month'
  }) => {
    const response = await axiosInstance.get('/api/security/analytics', { params: filters })
    return response.data
  },

  getSecurityScore: async () => {
    const response = await axiosInstance.get('/api/security/analytics/score')
    return response.data
  },

  getThreatLandscape: async (timeRange?: string) => {
    const response = await axiosInstance.get('/api/security/analytics/threats', {
      params: { timeRange }
    })
    return response.data
  },

  // Settings
  getSettings: async (category?: string) => {
    const response = await axiosInstance.get('/api/security/settings', {
      params: { category }
    })
    return response.data
  },

  updateSetting: async (id: string, value: any) => {
    const response = await axiosInstance.put(`/api/security/settings/${id}`, { value })
    return response.data
  },

  resetToDefaults: async (category?: string) => {
    const response = await axiosInstance.post('/api/security/settings/reset', { category })
    return response.data
  },

  // Audit
  getAudits: async (filters?: {
    type?: string
    status?: string
    createdBy?: string
  }) => {
    const response = await axiosInstance.get('/api/security/audits', { params: filters })
    return response.data
  },

  getAudit: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/audits/${id}`)
    return response.data
  },

  createAudit: async (audit: Omit<SecurityAudit, 'id' | 'createdAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/security/audits', audit)
    return response.data
  },

  runAudit: async (id: string) => {
    const response = await axiosInstance.post(`/api/security/audits/${id}/run`)
    return response.data
  },

  getAuditResults: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/audits/${id}/results`)
    return response.data
  },

  // Alerts
  getAlerts: async (filters?: {
    severity?: string
    status?: string
    type?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await axiosInstance.get('/api/security/alerts', { params: filters })
    return response.data
  },

  getAlert: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/alerts/${id}`)
    return response.data
  },

  acknowledgeAlert: async (id: string, note?: string) => {
    const response = await axiosInstance.post(`/api/security/alerts/${id}/acknowledge`, { note })
    return response.data
  },

  resolveAlert: async (id: string, resolution: string) => {
    const response = await axiosInstance.post(`/api/security/alerts/${id}/resolve`, { resolution })
    return response.data
  },

  markAsFalsePositive: async (id: string, reason: string) => {
    const response = await axiosInstance.post(`/api/security/alerts/${id}/false-positive`, { reason })
    return response.data
  },

  // Reports
  getReports: async (filters?: {
    type?: string
    status?: string
    period?: string
  }) => {
    const response = await axiosInstance.get('/api/security/reports', { params: filters })
    return response.data
  },

  getReport: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/reports/${id}`)
    return response.data
  },

  generateReport: async (config: {
    type: SecurityReport['type']
    period: {
      startDate: string
      endDate: string
    }
    includeSections?: string[]
  }) => {
    const response = await axiosInstance.post('/api/security/reports/generate', config)
    return response.data
  },

  downloadReport: async (id: string, format: 'pdf' | 'excel' | 'csv') => {
    const response = await axiosInstance.get(`/api/security/reports/${id}/download`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  // Compliance
  getCompliance: async (filters?: {
    framework?: string
    status?: string
    category?: string
  }) => {
    const response = await axiosInstance.get('/api/security/compliance', { params: filters })
    return response.data
  },

  getComplianceItem: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/compliance/${id}`)
    return response.data
  },

  updateComplianceStatus: async (id: string, status: SecurityCompliance['status'], note?: string) => {
    const response = await axiosInstance.put(`/api/security/compliance/${id}/status`, { status, note })
    return response.data
  },

  uploadEvidence: async (id: string, file: File, description: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', description)
    
    const response = await axiosInstance.post(`/api/security/compliance/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Incidents
  getIncidents: async (filters?: {
    severity?: string
    status?: string
    type?: string
    assignedTo?: string
  }) => {
    const response = await axiosInstance.get('/api/security/incidents', { params: filters })
    return response.data
  },

  getIncident: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/incidents/${id}`)
    return response.data
  },

  createIncident: async (incident: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axiosInstance.post('/api/security/incidents', incident)
    return response.data
  },

  updateIncident: async (id: string, incident: Partial<SecurityIncident>) => {
    const response = await axiosInstance.put(`/api/security/incidents/${id}`, incident)
    return response.data
  },

  assignIncident: async (id: string, assignedTo: string) => {
    const response = await axiosInstance.put(`/api/security/incidents/${id}/assign`, { assignedTo })
    return response.data
  },

  addIncidentTimeline: async (id: string, action: string, description: string) => {
    const response = await axiosInstance.post(`/api/security/incidents/${id}/timeline`, {
      action,
      description
    })
    return response.data
  },

  // Roles
  getRoles: async (filters?: {
    category?: string
    isActive?: boolean
    search?: string
  }) => {
    const response = await axiosInstance.get('/api/security/roles', { params: filters })
    return response.data
  },

  getRole: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/roles/${id}`)
    return response.data
  },

  createRole: async (role: Omit<SecurityRole, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'userCount'>) => {
    const response = await axiosInstance.post('/api/security/roles', role)
    return response.data
  },

  updateRole: async (id: string, role: Partial<SecurityRole>) => {
    const response = await axiosInstance.put(`/api/security/roles/${id}`, role)
    return response.data
  },

  deleteRole: async (id: string) => {
    await axiosInstance.delete(`/api/security/roles/${id}`)
  },

  // Threat Detection
  getThreats: async (filters?: {
    type?: string
    severity?: string
    status?: string
  }) => {
    const response = await axiosInstance.get('/api/security/threats', { params: filters })
    return response.data
  },

  getThreat: async (id: string) => {
    const response = await axiosInstance.get(`/api/security/threats/${id}`)
    return response.data
  },

  acknowledgeThreat: async (id: string) => {
    const response = await axiosInstance.post(`/api/security/threats/${id}/acknowledge`)
    return response.data
  },

  mitigateThreat: async (id: string, action: string) => {
    const response = await axiosInstance.post(`/api/security/threats/${id}/mitigate`, { action })
    return response.data
  },

  runThreatScan: async () => {
    const response = await axiosInstance.post('/api/security/threats/scan')
    return response.data
  }
}
