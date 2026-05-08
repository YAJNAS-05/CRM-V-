export interface SecuritySession {
  id: string;
  userId: string;
  userEmail: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  mfaVerified: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  fingerprint: string;
  trusted: boolean;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  description: string;
  details: Record<string, any>;
  ipAddress: string;
  location: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export type SecurityEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'PASSWORD_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_BREACH_ATTEMPT'
  | 'PERMISSION_ESCALATION'
  | 'API_ACCESS_DENIED'
  | 'SESSION_TERMINATED'
  | 'SECURITY_POLICY_VIOLATION';

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  enabled: boolean;
  settings: PolicySettings;
  enforcement: PolicyEnforcement;
  lastModified: Date;
  modifiedBy: string;
}

export type PolicyCategory = 
  | 'PASSWORD'
  | 'SESSION'
  | 'MFA'
  | 'ACCESS'
  | 'DATA_PROTECTION'
  | 'NETWORK'
  | 'COMPLIANCE';

export interface PolicySettings {
  minPasswordLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  passwordExpiryDays?: number;
  sessionTimeoutMinutes?: number;
  maxConcurrentSessions?: number;
  requireMfaForAdmin?: boolean;
  requireMfaForSensitive?: boolean;
  allowedIpRanges?: string[];
  blockedCountries?: string[];
  encryptionRequired?: boolean;
  auditLogRetention?: number;
}

export interface PolicyEnforcement {
  action: 'WARN' | 'BLOCK' | 'LOG' | 'ALERT';
  gracePeriodDays?: number;
  exceptions: string[];
  autoResolve?: boolean;
}

export interface MFAMethod {
  id: string;
  type: 'TOTP' | 'SMS' | 'EMAIL' | 'PUSH' | 'HARDWARE_TOKEN';
  name: string;
  description: string;
  enabled: boolean;
  isPrimary: boolean;
  lastUsed?: Date;
  setupDate: Date;
  metadata: Record<string, any>;
}

export interface MFASetupRequest {
  method: 'TOTP' | 'SMS' | 'EMAIL' | 'PUSH';
  phoneNumber?: string;
  email?: string;
  deviceName?: string;
}

export interface MFAVerificationRequest {
  method: 'TOTP' | 'SMS' | 'EMAIL' | 'PUSH';
  code: string;
  trustDevice?: boolean;
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'SAML' | 'OIDC' | 'OAUTH2' | 'LDAP';
  enabled: boolean;
  config: SSOConfig;
  metadata: SSOProviderMetadata;
  lastSync?: Date;
  userCount: number;
}

export interface SSOConfig {
  entityId: string;
  loginUrl: string;
  logoutUrl: string;
  certificate?: string;
  clientId?: string;
  clientSecret?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scopes?: string[];
  mapping: AttributeMapping;
}

export interface AttributeMapping {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  customAttributes: Record<string, string>;
}

export interface SSOProviderMetadata {
  logo?: string;
  description?: string;
  supportUrl?: string;
  documentation?: string;
  features: string[];
  limitations: string[];
}

export interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  usersWithMFA: number;
  mfaAdoptionRate: number;
  activeSessions: number;
  suspiciousLogins: number;
  blockedAttempts: number;
  policyViolations: number;
  avgSessionDuration: number;
  topRiskFactors: RiskFactor[];
  securityScore: number;
}

export interface RiskFactor {
  type: string;
  count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  userId?: string;
  sessionId?: string;
  details: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export type AlertType = 
  | 'SUSPICIOUS_LOGIN'
  | 'BRUTE_FORCE_ATTACK'
  | 'MFA_BYPASS_ATTEMPT'
  | 'POLICY_VIOLATION'
  | 'DATA_EXFILTRATION'
  | 'UNAUTHORIZED_ACCESS'
  | 'SYSTEM_BREACH'
  | 'COMPLIANCE_ISSUE';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  category: IncidentCategory;
  assignedTo?: string;
  reportedBy: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  affectedUsers: string[];
  affectedAssets: string[];
  timeline: IncidentEvent[];
  mitigation: MitigationAction[];
}

export type IncidentCategory = 
  | 'DATA_BREACH'
  | 'SYSTEM_COMPROMISE'
  | 'INSIDER_THREAT'
  | 'PHISHING'
  | 'MALWARE'
  | 'DENIAL_OF_SERVICE'
  | 'PHYSICAL_SECURITY'
  | 'COMPLIANCE_VIOLATION';

export interface IncidentEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
  details: Record<string, any>;
}

export interface MitigationAction {
  id: string;
  action: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  result?: string;
}

export interface SecurityCompliance {
  id: string;
  framework: ComplianceFramework;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NOT_ASSESSED';
  score: number;
  lastAssessment: Date;
  nextAssessment: Date;
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  evidence: ComplianceEvidence[];
}

export type ComplianceFramework = 
  | 'SOC2'
  | 'ISO27001'
  | 'GDPR'
  | 'HIPAA'
  | 'PCI_DSS'
  | 'NIST'
  | 'CIS_CONTROLS';

export interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  lastVerified: Date;
  evidence: string[];
  owner: string;
}

export interface ComplianceViolation {
  id: string;
  requirementId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  discoveredAt: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  remediationPlan?: string;
  resolvedAt?: Date;
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  type: 'DOCUMENT' | 'SCREENSHOT' | 'LOG' | 'CONFIGURATION' | 'TEST_RESULT';
  title: string;
  description: string;
  filePath?: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface SecurityReport {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  generatedAt: Date;
  generatedBy: string;
  period: ReportPeriod;
  metrics: SecurityMetrics;
  incidents: SecurityIncident[];
  alerts: SecurityAlert[];
  compliance: SecurityCompliance[];
  recommendations: SecurityRecommendation[];
}

export type ReportType = 
  | 'SECURITY_OVERVIEW'
  | 'INCIDENT_SUMMARY'
  | 'COMPLIANCE_STATUS'
  | 'RISK_ASSESSMENT'
  | 'THREAT_INTELLIGENCE'
  | 'VULNERABILITY_SCAN'
  | 'AUDIT_TRAIL';

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface SecurityRecommendation {
  id: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  impact: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  assignedTo?: string;
}

export interface ThreatIntelligence {
  id: string;
  source: string;
  type: ThreatType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  indicators: ThreatIndicator[];
  affectedSystems: string[];
  mitigations: string[];
  publishedAt: Date;
  expiresAt?: Date;
}

export type ThreatType = 
  | 'MALWARE'
  | 'PHISHING'
  | 'ZERO_DAY'
  | 'APT_ATTACK'
  | 'DDOS'
  | 'INSIDER_THREAT'
  | 'DATA_BREACH'
  | 'VULNERABILITY';

export interface ThreatIndicator {
  type: 'IP_ADDRESS' | 'DOMAIN' | 'URL' | 'HASH' | 'EMAIL' | 'FILE_SIGNATURE';
  value: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  description: string;
}
