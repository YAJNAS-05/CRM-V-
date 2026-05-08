export interface PerformanceMetrics {
  id: string;
  timestamp: Date;
  source: string;
  category: MetricCategory;
  metrics: {
    responseTime: ResponseTimeMetrics;
    throughput: ThroughputMetrics;
    errorRate: ErrorRateMetrics;
    resourceUsage: ResourceUsageMetrics;
    availability: AvailabilityMetrics;
    userExperience: UserExperienceMetrics;
    businessMetrics: BusinessMetrics;
  };
  tags: string[];
  metadata: PerformanceMetadata;
}

export type MetricCategory = 
  | 'APPLICATION'
  | 'DATABASE'
  | 'INFRASTRUCTURE'
  | 'NETWORK'
  | 'USER_EXPERIENCE'
  | 'BUSINESS_PROCESS'
  | 'API'
  | 'FRONTEND'
  | 'BACKEND';

export interface ResponseTimeMetrics {
  average: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  standardDeviation: number;
  trend: TrendData;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  peakThroughput: number;
  averageThroughput: number;
  trend: TrendData;
}

export interface ErrorRateMetrics {
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  warningErrors: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  trend: TrendData;
}

export interface ResourceUsageMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: ResourceMetric;
  network: ResourceMetric;
  gpu?: ResourceMetric;
  cacheHitRate: number;
  connectionPool: ConnectionPoolMetrics;
}

export interface ResourceMetric {
  usage: number;
  available: number;
  total: number;
  percentage: number;
  threshold: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: TrendData;
}

export interface ConnectionPoolMetrics {
  active: number;
  idle: number;
  total: number;
  max: number;
  waiting: number;
  averageWaitTime: number;
}

export interface AvailabilityMetrics {
  uptime: number;
  downtime: number;
  availability: number;
  mttr: number; // Mean Time To Recovery
  mtbf: number; // Mean Time Between Failures
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

export interface UserExperienceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  coreWebVitals: CoreWebVitals;
  userSatisfaction: UserSatisfactionMetrics;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  status: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
}

export interface UserSatisfactionMetrics {
  apdex: number; // Application Performance Index
  satisfactionScore: number;
  frustrationThreshold: number;
  toleratingThreshold: number;
  satisfiedThreshold: number;
}

export interface BusinessMetrics {
  conversionRate: number;
  revenue: number;
  transactionVolume: number;
  cartAbandonmentRate: number;
  userRetention: number;
  customerLifetimeValue: number;
  supportTickets: number;
  churnRate: number;
}

export interface TrendData {
  direction: 'UP' | 'DOWN' | 'STABLE';
  percentage: number;
  period: string;
  dataPoints: DataPoint[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface PerformanceMetadata {
  environment: string;
  version: string;
  region: string;
  datacenter: string;
  instanceType: string;
  deploymentId: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PerformanceAlert {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  condition: AlertCondition;
  threshold: AlertThreshold;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  duration?: number;
  impact: AlertImpact;
  actions: AlertAction[];
  notifications: NotificationConfig[];
  escalationPolicy: EscalationPolicy;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';

export interface AlertCondition {
  metric: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'NOT_EQUALS' | 'PERCENTAGE_CHANGE';
  value: number;
  duration: number;
  evaluationWindow: string;
}

export interface AlertThreshold {
  warning: number;
  critical: number;
  recovery: number;
}

export interface AlertImpact {
  usersAffected: number;
  revenueImpact: number;
  businessImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedServices: string[];
  customerComplaints: number;
}

export interface AlertAction {
  type: 'AUTOMATED' | 'MANUAL';
  description: string;
  executedAt?: Date;
  executedBy?: string;
  result?: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface NotificationConfig {
  type: 'EMAIL' | 'SMS' | 'SLACK' | 'PAGERDUTY' | 'WEBHOOK';
  enabled: boolean;
  recipients: string[];
  template?: string;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY';
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
  currentLevel: number;
  lastEscalatedAt?: Date;
}

export interface EscalationLevel {
  level: number;
  delay: number;
  recipients: string[];
  notificationTypes: string[];
}

export interface PerformanceReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  schedule: ReportSchedule;
  filters: ReportFilter[];
  metrics: string[];
  timeRange: TimeRange;
  format: ReportFormat;
  distribution: DistributionConfig;
  createdAt: Date;
  updatedAt: Date;
  lastGenerated?: Date;
  nextRun?: Date;
  status: ReportStatus;
  generatedBy: string;
  recipients: string[];
}

export type ReportType = 
  | 'SUMMARY'
  | 'DETAILED'
  | 'TREND'
  | 'COMPARISON'
  | 'SLA'
  | 'INCIDENT'
  | 'CUSTOM';

export type ReportStatus = 'ACTIVE' | 'INACTIVE' | 'GENERATING' | 'FAILED';

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  timezone: string;
  nextRun?: Date;
  lastRun?: Date;
}

export interface ReportFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
}

export interface TimeRange {
  start: Date;
  end: Date;
  preset?: 'LAST_HOUR' | 'LAST_24_HOURS' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_QUARTER' | 'LAST_YEAR';
}

export type ReportFormat = 'PDF' | 'CSV' | 'JSON' | 'HTML' | 'EXCEL';

export interface DistributionConfig {
  email: EmailDistribution;
  webhook?: WebhookDistribution;
  storage?: StorageDistribution;
}

export interface EmailDistribution {
  enabled: boolean;
  recipients: string[];
  subject: string;
  template?: string;
  attachments: boolean;
}

export interface WebhookDistribution {
  enabled: boolean;
  url: string;
  headers: Record<string, string>;
  retryPolicy: RetryPolicy;
}

export interface StorageDistribution {
  enabled: boolean;
  provider: 'S3' | 'GCS' | 'AZURE_BLOB';
  path: string;
  retention: number;
}

export interface PerformanceDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  timeRange: TimeRange;
  refreshInterval: number;
  filters: DashboardFilter[];
  sharing: SharingConfig;
  permissions: PermissionConfig;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  category: DashboardCategory;
}

export type DashboardCategory = 
  | 'OVERVIEW'
  | 'APPLICATION'
  | 'INFRASTRUCTURE'
  | 'BUSINESS'
  | 'USER_EXPERIENCE'
  | 'CUSTOM';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSource;
  refreshInterval?: number;
  visible: boolean;
}

export type WidgetType = 
  | 'METRIC_CARD'
  | 'LINE_CHART'
  | 'BAR_CHART'
  | 'PIE_CHART'
  | 'GAUGE'
  | 'TABLE'
  | 'HEATMAP'
  | 'SCATTER_PLOT'
  | 'AREA_CHART'
  | 'KPI_CARD'
  | 'ALERT_LIST'
  | 'TOP_N';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  metric?: string;
  aggregation?: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT';
  timeRange?: TimeRange;
  filters?: Record<string, any>;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  colors?: string[];
  legend?: boolean;
  grid?: boolean;
  annotations?: Annotation[];
}

export interface Annotation {
  timestamp: Date;
  label: string;
  description?: string;
  type: 'EVENT' | 'DEPLOYMENT' | 'INCIDENT' | 'MAINTENANCE';
  color?: string;
}

export interface DataSource {
  type: 'METRIC' | 'LOG' | 'TRACE' | 'CUSTOM';
  query?: string;
  api?: string;
  webhook?: string;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'SELECT' | 'DATE_RANGE' | 'TEXT' | 'MULTI_SELECT';
  field: string;
  options?: FilterOption[];
  defaultValue?: any;
  required: boolean;
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface SharingConfig {
  public: boolean;
  link?: string;
  password?: string;
  expiresAt?: Date;
  permissions: string[];
}

export interface PermissionConfig {
  view: string[];
  edit: string[];
  share: string[];
  delete: string[];
}

export interface PerformanceBaseline {
  id: string;
  name: string;
  description: string;
  metrics: BaselineMetric[];
  timeRange: TimeRange;
  environment: string;
  status: BaselineStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  version: number;
  tags: string[];
}

export type BaselineStatus = 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export interface BaselineMetric {
  name: string;
  value: number;
  unit: string;
  threshold: BaselineThreshold;
  confidence: number;
  samples: number;
  standardDeviation: number;
}

export interface BaselineThreshold {
  warning: number;
  critical: number;
  direction: 'ABOVE' | 'BELOW';
}

export interface PerformanceBenchmark {
  id: string;
  name: string;
  description: string;
  category: BenchmarkCategory;
  metrics: BenchmarkMetric[];
  source: BenchmarkSource;
  methodology: BenchmarkMethodology;
  results: BenchmarkResult[];
  createdAt: Date;
  updatedAt: Date;
  status: BenchmarkStatus;
}

export type BenchmarkCategory = 
  | 'INDUSTRY'
  | 'COMPETITOR'
  | 'HISTORICAL'
  | 'INTERNAL'
  | 'STANDARD';

export type BenchmarkStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  percentile: number;
  rank: number;
  total: number;
  improvement: number;
}

export interface BenchmarkSource {
  type: 'PUBLIC' | 'SUBSCRIPTION' | 'INTERNAL' | 'THIRD_PARTY';
  name: string;
  url?: string;
  lastUpdated: Date;
  reliability: number;
}

export interface BenchmarkMethodology {
  dataSize: number;
  timeRange: TimeRange;
  filters: string[];
  normalization: string;
  confidence: number;
}

export interface BenchmarkResult {
  entity: string;
  metrics: BenchmarkMetric[];
  overallScore: number;
  rank: number;
  percentile: number;
}

export interface PerformanceOptimization {
  id: string;
  name: string;
  description: string;
  type: OptimizationType;
  priority: OptimizationPriority;
  status: OptimizationStatus;
  impact: OptimizationImpact;
  effort: OptimizationEffort;
  roi: OptimizationROI;
  implementation: OptimizationImplementation;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export type OptimizationType = 
  | 'CODE_OPTIMIZATION'
  | 'INFRASTRUCTURE'
  | 'DATABASE'
  | 'CACHE'
  | 'NETWORK'
  | 'ALGORITHM'
  | 'ARCHITECTURE'
  | 'SCALING';

export type OptimizationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OptimizationStatus = 'IDENTIFIED' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface OptimizationImpact {
  performance: number;
  cost: number;
  userExperience: number;
  business: number;
  risk: number;
}

export interface OptimizationEffort {
  development: number;
  testing: number;
  deployment: number;
  total: number;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface OptimizationROI {
  investment: number;
  expectedReturn: number;
  paybackPeriod: number;
  annualSavings: number;
  riskAdjusted: number;
}

export interface OptimizationImplementation {
  steps: ImplementationStep[];
  dependencies: string[];
  blockers: string[];
  risks: string[];
  mitigation: string[];
  timeline: Timeline;
}

export interface ImplementationStep {
  id: string;
  name: string;
  description: string;
  status: OptimizationStatus;
  assignee?: string;
  estimatedHours: number;
  actualHours?: number;
  startDate?: Date;
  endDate?: Date;
  dependencies: string[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  status: 'PENDING' | 'COMPLETED' | 'DELAYED';
  description?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'LINEAR' | 'EXPONENTIAL' | 'FIXED';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}
