export interface AdvancedFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  type: FeatureType;
  status: FeatureStatus;
  priority: Priority;
  version: string;
  configuration: FeatureConfiguration;
  settings: FeatureSettings;
  permissions: FeaturePermissions;
  usage: FeatureUsage;
  performance: FeaturePerformance;
  metadata: FeatureMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  tags: string[];
}

export type FeatureCategory = 
  | 'AI_ML'
  | 'ANALYTICS'
  | 'AUTOMATION'
  | 'INTEGRATION'
  | 'SECURITY'
  | 'COLLABORATION'
  | 'CUSTOMIZATION'
  | 'PERFORMANCE'
  | 'MOBILITY'
  | 'ENTERPRISE';

export type FeatureType = 
  | 'MODULE'
  | 'COMPONENT'
  | 'API'
  | 'WORKFLOW'
  | 'DASHBOARD'
  | 'REPORT'
  | 'INTEGRATION'
  | 'AUTOMATION'
  | 'TEMPLATE'
  | 'PLUGIN';

export type FeatureStatus = 
  | 'DRAFT'
  | 'DEVELOPMENT'
  | 'TESTING'
  | 'STAGING'
  | 'PRODUCTION'
  | 'DEPRECATED'
  | 'DISABLED'
  | 'ARCHIVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FeatureConfiguration {
  schema: ConfigurationSchema;
  defaults: Record<string, any>;
  validation: ValidationRule[];
  dependencies: FeatureDependency[];
  requirements: FeatureRequirement[];
}

export interface ConfigurationSchema {
  properties: Record<string, PropertyDefinition>;
  required: string[];
  uiSchema: UISchema;
}

export interface PropertyDefinition {
  type: PropertyType;
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  items?: PropertyDefinition;
  properties?: Record<string, PropertyDefinition>;
  readOnly?: boolean;
  writeOnly?: boolean;
}

export type PropertyType = 
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'file'
  | 'json';

export interface UISchema {
  order: string[];
  groups: UIGroup[];
  layouts: UILayout[];
  widgets: UIWidget[];
}

export interface UIGroup {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface UILayout {
  type: LayoutType;
  columns: number;
  fields: string[];
  breakpoints?: Record<string, number>;
}

export type LayoutType = 'GRID' | 'FLEX' | 'CARD' | 'TABS' | 'ACCORDION' | 'WIZARD';

export interface UIWidget {
  field: string;
  type: WidgetType;
  config: WidgetConfig;
}

export type WidgetType = 
  | 'INPUT'
  | 'TEXTAREA'
  | 'SELECT'
  | 'MULTISELECT'
  | 'CHECKBOX'
  | 'RADIO'
  | 'SWITCH'
  | 'SLIDER'
  | 'DATE_PICKER'
  | 'TIME_PICKER'
  | 'COLOR_PICKER'
  | 'FILE_UPLOAD'
  | 'RICH_TEXT'
  | 'CODE_EDITOR'
  | 'CHART'
  | 'MAP'
  | 'CALCULATOR';

export interface WidgetConfig {
  placeholder?: string;
  options?: WidgetOption[];
  validation?: WidgetValidation;
  styling?: WidgetStyling;
  events?: WidgetEvent[];
}

export interface WidgetOption {
  label: string;
  value: any;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface WidgetValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface WidgetStyling {
  width?: string;
  height?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
}

export interface WidgetEvent {
  event: string;
  handler: string;
  config?: Record<string, any>;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  rule: string;
  message: string;
  severity: ValidationSeverity;
  enabled: boolean;
}

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface FeatureDependency {
  featureId: string;
  featureName: string;
  type: DependencyType;
  required: boolean;
  version?: string;
  description?: string;
}

export type DependencyType = 
  | 'REQUIRES'
  | 'CONFLICTS'
  | 'ENHANCES'
  | 'OPTIONAL'
  | 'ALTERNATIVE';

export interface FeatureRequirement {
  type: RequirementType;
  value: string;
  description: string;
  critical: boolean;
}

export type RequirementType = 
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'API'
  | 'SERVICE'
  | 'LICENSE'
  | 'PERMISSION'
  | 'CONFIGURATION'
  | 'DATA';

export interface FeatureSettings {
  enabled: boolean;
  autoUpdate: boolean;
  logging: LoggingSettings;
  caching: CachingSettings;
  security: SecuritySettings;
  performance: PerformanceSettings;
  notifications: NotificationSettings;
}

export interface LoggingSettings {
  enabled: boolean;
  level: LogLevel;
  destinations: LogDestination[];
  retention: RetentionPolicy;
  format: LogFormat;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogDestination = 'CONSOLE' | 'FILE' | 'DATABASE' | 'EXTERNAL' | 'SYSLOG';
export type LogFormat = 'JSON' | 'TEXT' | 'STRUCTURED';

export interface RetentionPolicy {
  enabled: boolean;
  days: number;
  maxSize?: string;
  compression: boolean;
  archive: boolean;
}

export interface CachingSettings {
  enabled: boolean;
  strategy: CachingStrategy;
  ttl: number;
  maxSize?: string;
  eviction: EvictionPolicy;
  invalidation: InvalidationPolicy;
}

export type CachingStrategy = 'LRU' | 'LFU' | 'FIFO' | 'TTL' | 'CUSTOM';
export type EvictionPolicy = 'LRU' | 'LFU' | 'FIFO' | 'RANDOM';
export type InvalidationPolicy = 'TIMEOUT' | 'MANUAL' | 'EVENT' | 'TAG';

export interface SecuritySettings {
  authentication: AuthenticationSettings;
  authorization: AuthorizationSettings;
  encryption: EncryptionSettings;
  audit: AuditSettings;
  rateLimit: RateLimitSettings;
}

export interface AuthenticationSettings {
  required: boolean;
  methods: AuthMethod[];
  multiFactor: boolean;
  sessionTimeout: number;
}

export type AuthMethod = 'API_KEY' | 'OAUTH' | 'JWT' | 'BASIC' | 'SAML' | 'LDAP';

export interface AuthorizationSettings {
  required: boolean;
  roles: string[];
  permissions: string[];
  policies: AuthorizationPolicy[];
}

export interface AuthorizationPolicy {
  id: string;
  name: string;
  rules: PolicyRule[];
  effect: PolicyEffect;
}

export interface PolicyRule {
  resource: string;
  action: string;
  condition?: string;
  effect: PolicyEffect;
}

export type PolicyEffect = 'ALLOW' | 'DENY';

export interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  fields: string[];
  transport: boolean;
  atRest: boolean;
}

export interface AuditSettings {
  enabled: boolean;
  events: AuditEvent[];
  retention: RetentionPolicy;
  format: LogFormat;
  destinations: LogDestination[];
}

export interface AuditEvent {
  type: string;
  description: string;
  enabled: boolean;
  critical: boolean;
}

export interface RateLimitSettings {
  enabled: boolean;
  requests: number;
  window: number;
  strategy: RateLimitStrategy;
  whitelist: string[];
  blacklist: string[];
}

export type RateLimitStrategy = 'FIXED' | 'SLIDING' | 'TOKEN_BUCKET' | 'LEAKY_BUCKET';

export interface PerformanceSettings {
  timeout: number;
  retries: RetrySettings;
  circuitBreaker: CircuitBreakerSettings;
  bulkhead: BulkheadSettings;
  compression: CompressionSettings;
}

export interface RetrySettings {
  enabled: boolean;
  maxAttempts: number;
  backoff: BackoffStrategy;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
}

export interface CircuitBreakerSettings {
  enabled: boolean;
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
  monitoring: CircuitBreakerMonitoring;
}

export interface CircuitBreakerMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: CircuitBreakerAlert[];
}

export interface CircuitBreakerAlert {
  condition: string;
  severity: AlertSeverity;
  recipients: string[];
}

export interface BulkheadSettings {
  enabled: boolean;
  maxConcurrent: number;
  maxQueue: number;
  timeout: number;
}

export interface CompressionSettings {
  enabled: boolean;
  algorithm: CompressionAlgorithm;
  level: CompressionLevel;
  threshold: number;
}

export type CompressionAlgorithm = 'GZIP' | 'DEFLATE' | 'BROTLI' | 'LZ4' | 'SNAPPY';
export type CompressionLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';

export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  events: NotificationEvent[];
  templates: NotificationTemplate[];
}

export interface NotificationChannel {
  id: string;
  type: ChannelType;
  config: ChannelConfig;
  enabled: boolean;
}

export type ChannelType = 'EMAIL' | 'SMS' | 'SLACK' | 'WEBHOOK' | 'PUSH' | 'IN_APP';

export interface ChannelConfig {
  recipients: string[];
  template?: string;
  format?: string;
  priority?: Priority;
  retry?: RetrySettings;
}

export interface NotificationEvent {
  type: string;
  description: string;
  enabled: boolean;
  channels: string[];
  template?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: ChannelType;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  enabled: boolean;
}

export interface TemplateVariable {
  name: string;
  type: PropertyType;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface FeaturePermissions {
  view: PermissionSet;
  use: PermissionSet;
  configure: PermissionSet;
  manage: PermissionSet;
  deploy: PermissionSet;
}

export interface PermissionSet {
  roles: string[];
  users: string[];
  groups: string[];
  conditions: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
  description?: string;
}

export interface FeatureUsage {
  totalUsage: number;
  dailyUsage: DailyUsage[];
  users: UserUsage[];
  performance: UsagePerformance;
  trends: UsageTrend[];
  quotas: UsageQuota[];
}

export interface DailyUsage {
  date: string;
  requests: number;
  users: number;
  errors: number;
  avgResponseTime: number;
  dataVolume: number;
}

export interface UserUsage {
  userId: string;
  userName: string;
  usage: number;
  lastUsed: Date;
  features: string[];
  performance: UserPerformance;
}

export interface UserPerformance {
  avgResponseTime: number;
  errorRate: number;
  successRate: number;
  requests: number;
}

export interface UsagePerformance {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
  availability: number;
}

export interface UsageTrend {
  period: string;
  metric: string;
  trend: TrendDirection;
  change: number;
  data: TrendDataPoint[];
}

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface UsageQuota {
  type: QuotaType;
  limit: number;
  current: number;
  resetPeriod: string;
  nextReset: Date;
}

export type QuotaType = 'REQUESTS' | 'USERS' | 'STORAGE' | 'BANDWIDTH' | 'API_CALLS' | 'FEATURE_USES';

export interface FeaturePerformance {
  responseTime: ResponseTimeMetrics;
  throughput: ThroughputMetrics;
  errorRate: ErrorRateMetrics;
  availability: AvailabilityMetrics;
  resourceUsage: ResourceUsageMetrics;
  scalability: ScalabilityMetrics;
}

export interface ResponseTimeMetrics {
  average: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  standardDeviation: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  peakThroughput: number;
  averageThroughput: number;
}

export interface ErrorRateMetrics {
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  warningErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
}

export interface AvailabilityMetrics {
  uptime: number;
  downtime: number;
  availability: number;
  mttr: number;
  mtbf: number;
  incidents: IncidentMetrics;
  sla: SLAMetrics;
}

export interface IncidentMetrics {
  total: number;
  critical: number;
  major: number;
  minor: number;
  resolved: number;
  open: number;
  averageResolutionTime: number;
}

export interface SLAMetrics {
  target: number;
  current: number;
  compliance: boolean;
  penalties: number;
  credits: number;
}

export interface ResourceUsageMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: ResourceMetric;
  network: ResourceMetric;
  cache: CacheMetrics;
  connections: ConnectionMetrics;
}

export interface ResourceMetric {
  usage: number;
  available: number;
  total: number;
  percentage: number;
  threshold: number;
  status: ResourceStatus;
  trend: TrendDirection;
}

export type ResourceStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  size: number;
  evictions: number;
  ttl: number;
}

export interface ConnectionMetrics {
  active: number;
  idle: number;
  total: number;
  max: number;
  waiting: number;
  averageWaitTime: number;
}

export interface ScalabilityMetrics {
  horizontalScaling: HorizontalScalingMetrics;
  verticalScaling: VerticalScalingMetrics;
  loadBalancing: LoadBalancingMetrics;
  autoScaling: AutoScalingMetrics;
}

export interface HorizontalScalingMetrics {
  minInstances: number;
  maxInstances: number;
  currentInstances: number;
  scalingEvents: ScalingEvent[];
  averageScaleTime: number;
}

export interface VerticalScalingMetrics {
  cpuScaling: boolean;
  memoryScaling: boolean;
  storageScaling: boolean;
  scalingEvents: ScalingEvent[];
  averageScaleTime: number;
}

export interface LoadBalancingMetrics {
  algorithm: string;
  distribution: Record<string, number>;
  healthChecks: HealthCheckMetrics;
  failover: FailoverMetrics;
}

export interface HealthCheckMetrics {
  enabled: boolean;
  interval: number;
  timeout: number;
  healthyEndpoints: number;
  totalEndpoints: number;
  averageResponseTime: number;
}

export interface FailoverMetrics {
  events: FailoverEvent[];
  averageFailoverTime: number;
  successfulFailovers: number;
  failedFailovers: number;
}

export interface FailoverEvent {
  timestamp: Date;
  source: string;
  target: string;
  duration: number;
  success: boolean;
  reason?: string;
}

export interface AutoScalingMetrics {
  enabled: boolean;
  policies: ScalingPolicy[];
  events: ScalingEvent[];
  averageScaleTime: number;
  cost: ScalingCostMetrics;
}

export interface ScalingPolicy {
  id: string;
  name: string;
  metric: string;
  target: number;
  minInstances: number;
  maxInstances: number;
  cooldown: number;
  enabled: boolean;
}

export interface ScalingEvent {
  timestamp: Date;
  type: 'SCALE_OUT' | 'SCALE_IN';
  fromInstances: number;
  toInstances: number;
  reason: string;
  duration: number;
  success: boolean;
  cost?: number;
}

export interface ScalingCostMetrics {
  totalCost: number;
  averageCostPerInstance: number;
  costSavings: number;
  projectedCost: number;
}

export interface FeatureMetadata {
  version: string;
  environment: string;
  category: string;
  tags: string[];
  documentation?: string;
  changelog: ChangelogEntry[];
  dependencies: FeatureDependency[];
  requirements: FeatureRequirement[];
  compatibility: CompatibilityInfo;
  support: SupportInfo;
  licensing: LicensingInfo;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  type: 'MAJOR' | 'MINOR' | 'PATCH';
  breaking: boolean;
}

export interface CompatibilityInfo {
  minVersion: string;
  maxVersion?: string;
  platforms: string[];
  browsers: string[];
  dependencies: CompatibilityDependency[];
}

export interface CompatibilityDependency {
  name: string;
  version: string;
  optional: boolean;
  description?: string;
}

export interface SupportInfo {
  level: SupportLevel;
  team: string;
  contact: SupportContact[];
  sla: SupportSLA;
  documentation: string;
  training: TrainingResource[];
}

export type SupportLevel = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export interface SupportContact {
  type: ContactType;
  value: string;
  description?: string;
  hours?: string;
}

export type ContactType = 'EMAIL' | 'PHONE' | 'CHAT' | 'PORTAL' | 'SLACK';

export interface SupportSLA {
  responseTime: number;
  resolutionTime: number;
  availability: number;
  escalation: EscalationPolicy[];
}

export interface EscalationPolicy {
  level: number;
  delay: number;
  contacts: SupportContact[];
  conditions: string[];
}

export interface TrainingResource {
  id: string;
  name: string;
  type: ResourceType;
  url?: string;
  duration?: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  description?: string;
}

export type ResourceType = 'VIDEO' | 'DOCUMENTATION' | 'COURSE' | 'WORKSHOP' | 'TUTORIAL' | 'WEBINAR';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface LicensingInfo {
  type: LicenseType;
  provider: string;
  key?: string;
  expiry?: Date;
  limits: LicenseLimit[];
  features: LicenseFeature[];
  compliance: LicenseCompliance;
}

export type LicenseType = 'OPEN_SOURCE' | 'COMMERCIAL' | 'TRIAL' | 'FREEMIUM' | 'ENTERPRISE';

export interface LicenseLimit {
  type: LimitType;
  value: number;
  description?: string;
}

export type LimitType = 'USERS' | 'REQUESTS' | 'STORAGE' | 'FEATURES' | 'API_CALLS' | 'TIME';

export interface LicenseFeature {
  name: string;
  enabled: boolean;
  description?: string;
  restrictions?: string[];
}

export interface LicenseCompliance {
  compliant: boolean;
  violations: LicenseViolation[];
  lastChecked: Date;
  nextCheck: Date;
}

export interface LicenseViolation {
  type: ViolationType;
  description: string;
  severity: ViolationSeverity;
  detected: Date;
  resolved?: Date;
}

export type ViolationType = 'OVERAGE' | 'EXPIRY' | 'UNAUTHORIZED' | 'RESTRICTION';
export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  version: string;
  author: string;
  isPublic: boolean;
  tags: string[];
  documentation: string;
  configuration: FeatureConfiguration;
  settings: FeatureSettings;
  usage: TemplateUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateUsage {
  timesUsed: number;
  lastUsed?: Date;
  usedBy: string[];
  popular: boolean;
  rating: number;
  reviews: TemplateReview[];
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

export interface FeatureMarketplace {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  provider: MarketplaceProvider;
  version: string;
  pricing: PricingInfo;
  features: MarketplaceFeature[];
  reviews: MarketplaceReview[];
  downloads: number;
  rating: number;
  tags: string[];
  compatibility: CompatibilityInfo;
  requirements: FeatureRequirement[];
  documentation: string;
  support: SupportInfo;
  licensing: LicensingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceProvider {
  id: string;
  name: string;
  website: string;
  email: string;
  phone?: string;
  address?: string;
  verified: boolean;
  rating: number;
  totalFeatures: number;
  supportLevel: SupportLevel;
}

export interface PricingInfo {
  type: PricingType;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays?: number;
  discounts: DiscountInfo[];
  tiers: PricingTier[];
}

export type PricingType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'USAGE_BASED' | 'CUSTOM';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';

export interface DiscountInfo {
  type: DiscountType;
  amount: number;
  conditions: string[];
  expiry?: Date;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'VOLUME' | 'EARLY_BIRD';

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limits: LicenseLimit[];
  popular?: boolean;
}

export interface MarketplaceFeature {
  name: string;
  description: string;
  included: boolean;
  limitations?: string[];
}

export interface MarketplaceReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  version: string;
}
