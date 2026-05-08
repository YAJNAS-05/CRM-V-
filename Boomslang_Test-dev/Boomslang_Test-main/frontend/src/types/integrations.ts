export interface Integration {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  category: IntegrationCategory;
  provider: string;
  status: IntegrationStatus;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  nextSync?: Date;
  configuration: IntegrationConfiguration;
  credentials: IntegrationCredentials;
  endpoints: IntegrationEndpoint[];
  mappings: FieldMapping[];
  webhooks: Webhook[];
  monitoring: IntegrationMonitoring;
  metadata: IntegrationMetadata;
  tags: string[];
  owner: string;
  dependencies: string[];
}

export type IntegrationType = 
  | 'API_REST'
  | 'API_GRAPHQL'
  | 'DATABASE'
  | 'FILE_TRANSFER'
  | 'WEBHOOK'
  | 'MESSAGE_QUEUE'
  | 'EVENT_STREAM'
  | 'SOAP';

export type IntegrationCategory = 
  | 'CRM'
  | 'ERP'
  | 'HR'
  | 'FINANCE'
  | 'MARKETING'
  | 'SALES'
  | 'SUPPORT'
  | 'ANALYTICS'
  | 'COMMUNICATION'
  | 'STORAGE'
  | 'SECURITY'
  | 'PAYMENT'
  | 'ECOMMERCE'
  | 'PROJECT_MANAGEMENT'
  | 'COLLABORATION';

export type IntegrationStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ERROR'
  | 'PENDING'
  | 'MAINTENANCE'
  | 'DEPRECATED';

export interface IntegrationConfiguration {
  baseUrl?: string;
  apiKey?: string;
  apiVersion?: string;
  timeout: number;
  retryPolicy: RetryPolicy;
  rateLimit: RateLimit;
  authentication: AuthenticationConfig;
  encryption: EncryptionConfig;
  logging: LoggingConfig;
  validation: ValidationConfig;
  transformation: TransformationConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'LINEAR' | 'EXPONENTIAL' | 'FIXED';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export interface RateLimit {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  throttleStrategy: 'FIXED_WINDOW' | 'SLIDING_WINDOW' | 'TOKEN_BUCKET';
}

export interface AuthenticationConfig {
  type: 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'BEARER_TOKEN' | 'JWT' | 'CUSTOM';
  config: Record<string, any>;
  tokenRefresh?: TokenRefreshConfig;
}

export interface TokenRefreshConfig {
  enabled: boolean;
  refreshTokenUrl?: string;
  expiresIn: number;
  refreshBuffer: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
  rotationInterval: number;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  includePayloads: boolean;
  includeHeaders: boolean;
  retentionDays: number;
}

export interface ValidationConfig {
  requestValidation: boolean;
  responseValidation: boolean;
  schemaValidation: boolean;
  customValidators: string[];
}

export interface TransformationConfig {
  requestTransforms: TransformRule[];
  responseTransforms: TransformRule[];
  errorTransforms: TransformRule[];
}

export interface TransformRule {
  name: string;
  type: 'MAP' | 'FILTER' | 'AGGREGATE' | 'ENRICH' | 'VALIDATE';
  condition?: string;
  script?: string;
  mapping?: Record<string, string>;
}

export interface IntegrationCredentials {
  id: string;
  type: 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'CERTIFICATE' | 'CUSTOM';
  encrypted: boolean;
  expiresAt?: Date;
  lastRotated?: Date;
  rotationRequired: boolean;
  metadata: Record<string, any>;
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requestSchema?: JsonSchema;
  responseSchema?: JsonSchema;
  rateLimitOverride?: Partial<RateLimit>;
  timeoutOverride?: number;
  enabled: boolean;
  monitoring: EndpointMonitoring;
}

export interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface EndpointMonitoring {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequest?: Date;
  lastError?: Date;
  successRate: number;
  statusCodes: Record<string, number>;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: FieldTransformation;
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
}

export interface FieldTransformation {
  type: 'DIRECT' | 'FUNCTION' | 'LOOKUP' | 'CONDITIONAL' | 'FORMAT';
  config: Record<string, any>;
}

export interface FieldValidation {
  type: 'REQUIRED' | 'TYPE' | 'RANGE' | 'PATTERN' | 'CUSTOM';
  config: Record<string, any>;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  retryPolicy: RetryPolicy;
  lastTriggered?: Date;
  deliveryStatus: WebhookDeliveryStatus;
  headers: Record<string, string>;
}

export interface WebhookDeliveryStatus {
  totalDelivered: number;
  totalFailed: number;
  lastDelivery?: Date;
  lastFailure?: Date;
  averageDeliveryTime: number;
}

export interface IntegrationMonitoring {
  status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'UNKNOWN';
  lastHealthCheck: Date;
  uptime: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastError?: IntegrationError;
  alerts: IntegrationAlert[];
  metrics: IntegrationMetrics;
  sla: ServiceLevelAgreement;
}

export interface IntegrationError {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  code?: string;
  endpoint?: string;
  payload?: any;
  response?: any;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface IntegrationAlert {
  id: string;
  type: AlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type AlertType = 
  | 'CONNECTION_FAILED'
  | 'AUTHENTICATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATA_VALIDATION_FAILED'
  | 'PERFORMANCE_DEGRADATION'
  | 'SYNC_FAILURE'
  | 'WEBHOOK_DELIVERY_FAILED'
  | 'CREDENTIALS_EXPIRED'
  | 'DEPENDENCY_FAILURE';

export interface IntegrationMetrics {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  successRate: number;
  errorRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  dataVolume: DataVolumeMetrics;
}

export interface LatencyMetrics {
  min: number;
  max: number;
  mean: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface ErrorMetrics {
  total: number;
  rate: number;
  byType: Record<string, number>;
  byEndpoint: Record<string, number>;
  critical: number;
  recent: IntegrationError[];
}

export interface DataVolumeMetrics {
  totalRequests: number;
  totalResponses: number;
  requestBytes: number;
  responseBytes: number;
  averageRequestSize: number;
  averageResponseSize: number;
}

export interface ServiceLevelAgreement {
  availability: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  currentAvailability: number;
  currentResponseTime: number;
  currentErrorRate: number;
  currentThroughput: number;
  compliance: boolean;
}

export interface IntegrationMetadata {
  documentation?: string;
  supportContact?: string;
  vendor: {
    name: string;
    website: string;
    supportUrl?: string;
    documentationUrl?: string;
  };
  compliance: ComplianceInfo;
  versionHistory: VersionHistory[];
  changelog: ChangelogEntry[];
}

export interface ComplianceInfo {
  standards: string[];
  certifications: string[];
  dataResidency: string[];
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  soc2Compliant: boolean;
  iso27001Compliant: boolean;
}

export interface VersionHistory {
  version: string;
  releaseDate: Date;
  changes: string[];
  breaking: boolean;
  deprecated?: Date;
}

export interface ChangelogEntry {
  id: string;
  timestamp: Date;
  version: string;
  type: 'FEATURE' | 'BUGFIX' | 'SECURITY' | 'DEPRECATION' | 'BREAKING';
  description: string;
  author: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  provider: string;
  type: IntegrationType;
  configuration: IntegrationConfiguration;
  endpoints: IntegrationEndpoint[];
  mappings: FieldMapping[];
  documentation: string;
  tags: string[];
  popularity: number;
  rating: number;
  downloads: number;
  lastUpdated: Date;
  author: string;
  verified: boolean;
}

export interface IntegrationExecution {
  id: string;
  integrationId: string;
  type: ExecutionType;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  trigger: ExecutionTrigger;
  input: any;
  output?: any;
  error?: IntegrationError;
  steps: ExecutionStep[];
  context: ExecutionContext;
  metadata: ExecutionMetadata;
}

export type ExecutionType = 
  | 'SYNC'
  | 'ASYNC'
  | 'BATCH'
  | 'REAL_TIME'
  | 'SCHEDULED';

export type ExecutionStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMEOUT';

export interface ExecutionTrigger {
  type: 'MANUAL' | 'SCHEDULE' | 'EVENT' | 'WEBHOOK' | 'API';
  source?: string;
  data?: any;
}

export interface ExecutionStep {
  id: string;
  name: string;
  type: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: IntegrationError;
  metrics: StepMetrics;
}

export interface StepMetrics {
  requestCount: number;
  responseTime: number;
  dataSize: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ExecutionContext {
  userId?: string;
  tenantId?: string;
  requestId: string;
  correlationId: string;
  userAgent?: string;
  ipAddress?: string;
  environment: string;
}

export interface ExecutionMetadata {
  version: string;
  retryCount: number;
  timeout: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  tags: string[];
  customFields: Record<string, any>;
}

export interface IntegrationSchedule {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: ScheduleConfig;
  timezone: string;
  lastRun?: Date;
  nextRun?: Date;
  runHistory: ScheduledRun[];
  monitoring: ScheduleMonitoring;
}

export interface ScheduleConfig {
  type: 'CRON' | 'INTERVAL' | 'ONCE';
  expression?: string;
  interval?: number;
  intervalUnit?: 'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS';
  startDate?: Date;
  endDate?: Date;
  maxRuns?: number;
}

export interface ScheduledRun {
  id: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: ExecutionStatus;
  duration?: number;
  executionId?: string;
  error?: IntegrationError;
}

export interface ScheduleMonitoring {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  missedRuns: number;
  averageDuration: number;
  successRate: number;
}

export interface IntegrationTest {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  type: TestType;
  config: TestConfig;
  lastRun?: Date;
  lastResult?: TestResult;
  schedule?: string;
  enabled: boolean;
}

export type TestType = 
  | 'CONNECTIVITY'
  | 'AUTHENTICATION'
  | 'DATA_FLOW'
  | 'PERFORMANCE'
  | 'LOAD'
  | 'SECURITY'
  | 'COMPLIANCE';

export interface TestConfig {
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  payload?: any;
  expectedResponse?: any;
  timeout?: number;
  retries?: number;
  assertions: TestAssertion[];
}

export interface TestAssertion {
  type: 'STATUS_CODE' | 'RESPONSE_TIME' | 'RESPONSE_BODY' | 'HEADER' | 'CUSTOM';
  expected: any;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'MATCHES';
  path?: string;
}

export interface TestResult {
  status: 'PASSED' | 'FAILED' | 'ERROR';
  duration: number;
  assertions: AssertionResult[];
  error?: string;
  response?: any;
  metrics: TestMetrics;
}

export interface AssertionResult {
  passed: boolean;
  assertion: TestAssertion;
  actual?: any;
  error?: string;
}

export interface TestMetrics {
  requestTime: number;
  responseTime: number;
  dataSize: number;
  memoryUsage: number;
}
