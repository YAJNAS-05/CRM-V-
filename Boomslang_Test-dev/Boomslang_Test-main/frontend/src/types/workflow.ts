export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  status: WorkflowStatus;
  priority: Priority;
  version: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  variables: WorkflowVariable[];
  schedule?: WorkflowSchedule;
  settings: WorkflowSettings;
  metadata: WorkflowMetadata;
  statistics: WorkflowStatistics;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  tags: string[];
}

export type WorkflowCategory = 
  | 'AUTOMATION'
  | 'APPROVAL'
  | 'NOTIFICATION'
  | 'DATA_SYNC'
  | 'INTEGRATION'
  | 'REPORTING'
  | 'CLEANUP'
  | 'MONITORING'
  | 'CUSTOM';

export type WorkflowStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
  description: string;
}

export type TriggerType = 
  | 'MANUAL'
  | 'SCHEDULE'
  | 'EVENT'
  | 'WEBHOOK'
  | 'API_CALL'
  | 'FILE_UPLOAD'
  | 'DATA_CHANGE'
  | 'THRESHOLD'
  | 'EMAIL_RECEIVED'
  | 'FORM_SUBMISSION';

export interface TriggerConfig {
  eventType?: string;
  schedule?: string;
  webhookUrl?: string;
  apiEndpoint?: string;
  conditions?: Record<string, any>;
  parameters?: Record<string, any>;
  retryPolicy?: RetryPolicy;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  config: ActionConfig;
  order: number;
  enabled: boolean;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  dependencies: string[];
  errorHandling: ErrorHandling;
}

export type ActionType = 
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'CREATE_TASK'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD'
  | 'CALL_API'
  | 'EXECUTE_SCRIPT'
  | 'APPROVAL_REQUEST'
  | 'NOTIFICATION'
  | 'FILE_OPERATION'
  | 'DATABASE_QUERY'
  | 'TRANSFORM_DATA'
  | 'CONDITIONAL_BRANCH'
  | 'LOOP'
  | 'DELAY'
  | 'LOG_MESSAGE'
  | 'WEBHOOK_CALL'
  | 'HUMAN_TASK';

export interface ActionConfig {
  template?: string;
  recipients?: string[];
  subject?: string;
  body?: string;
  apiEndpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  script?: string;
  query?: string;
  parameters?: Record<string, any>;
  conditions?: Record<string, any>;
  mappings?: DataMapping[];
}

export interface DataMapping {
  source: string;
  target: string;
  transformation?: string;
  required: boolean;
}

export interface WorkflowCondition {
  id: string;
  type: ConditionType;
  operator: ConditionOperator;
  leftOperand: string;
  rightOperand: any;
  enabled: boolean;
  description: string;
}

export type ConditionType = 
  | 'SIMPLE'
  | 'COMPOUND'
  | 'EXPRESSION'
  | 'FUNCTION'
  | 'SCRIPT';

export type ConditionOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'IN'
  | 'NOT_IN'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'REGEX'
  | 'CUSTOM';

export interface WorkflowVariable {
  id: string;
  name: string;
  type: VariableType;
  value: any;
  defaultValue?: any;
  required: boolean;
  description: string;
  scope: VariableScope;
}

export type VariableType = 
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'ARRAY'
  | 'OBJECT'
  | 'FILE'
  | 'EMAIL'
  | 'URL';

export type VariableScope = 'GLOBAL' | 'WORKFLOW' | 'ACTION' | 'TEMPORARY';

export interface WorkflowSchedule {
  enabled: boolean;
  timezone: string;
  startDate?: Date;
  endDate?: Date;
  pattern: SchedulePattern;
  nextRun?: Date;
  lastRun?: Date;
}

export interface SchedulePattern {
  type: ScheduleType;
  interval?: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  months?: number[];
  cronExpression?: string;
}

export type ScheduleType = 
  | 'ONCE'
  | 'INTERVAL'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CRON'
  | 'CUSTOM';

export interface WorkflowSettings {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  concurrency: ConcurrencySettings;
  logging: LoggingSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export type BackoffStrategy = 'LINEAR' | 'EXPONENTIAL' | 'FIXED' | 'CUSTOM';

export interface ConcurrencySettings {
  maxConcurrent: number;
  queueSize: number;
  strategy: ConcurrencyStrategy;
}

export type ConcurrencyStrategy = 
  | 'FIFO'
  | 'LIFO'
  | 'PRIORITY'
  | 'PARALLEL'
  | 'SEQUENTIAL';

export interface LoggingSettings {
  enabled: boolean;
  level: LogLevel;
  includePayloads: boolean;
  retentionDays: number;
  destinations: LogDestination[];
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogDestination = 'CONSOLE' | 'FILE' | 'DATABASE' | 'EXTERNAL';

export interface SecuritySettings {
  encryption: boolean;
  authentication: AuthenticationSettings;
  authorization: AuthorizationSettings;
  audit: boolean;
}

export interface AuthenticationSettings {
  required: boolean;
  method: 'API_KEY' | 'OAUTH' | 'JWT' | 'BASIC';
  credentials?: Record<string, string>;
}

export interface AuthorizationSettings {
  required: boolean;
  roles: string[];
  permissions: string[];
}

export interface NotificationSettings {
  onSuccess: NotificationConfig[];
  onFailure: NotificationConfig[];
  onTimeout: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'EMAIL' | 'SMS' | 'SLACK' | 'WEBHOOK';
  recipients: string[];
  template?: string;
  enabled: boolean;
}

export interface ErrorHandling {
  strategy: ErrorStrategy;
  retryOnFailure: boolean;
  continueOnError: boolean;
  fallbackAction?: string;
  errorNotifications: NotificationConfig[];
}

export type ErrorStrategy = 
  | 'STOP'
  | 'CONTINUE'
  | 'RETRY'
  | 'FALLBACK'
  | 'ESCALATE';

export interface WorkflowMetadata {
  version: string;
  environment: string;
  category: string;
  tags: string[];
  documentation?: string;
  changelog: ChangelogEntry[];
  dependencies: WorkflowDependency[];
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  type: 'MAJOR' | 'MINOR' | 'PATCH';
}

export interface WorkflowDependency {
  workflowId: string;
  workflowName: string;
  type: DependencyType;
  required: boolean;
}

export type DependencyType = 'TRIGGER' | 'DATA' | 'SEQUENCE' | 'SHARED_RESOURCE';

export interface WorkflowStatistics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  lastRun?: Date;
  lastRunStatus?: RunStatus;
  successRate: number;
  errorRate: number;
  runsByStatus: Record<RunStatus, number>;
  runsByDate: Record<string, number>;
  performance: PerformanceMetrics;
}

export type RunStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMEOUT';

export interface PerformanceMetrics {
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  throughput: number;
  errorRate: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: string;
  status: RunStatus;
  triggeredBy: string;
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: ErrorInfo;
  steps: ExecutionStep[];
  variables: Record<string, any>;
  logs: ExecutionLog[];
  metadata: ExecutionMetadata;
}

export interface ErrorInfo {
  code: string;
  message: string;
  stack?: string;
  stepId?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ExecutionStep {
  id: string;
  actionId: string;
  actionName: string;
  status: RunStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: ErrorInfo;
  retries: number;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  stepId?: string;
  context?: Record<string, any>;
  source: string;
}

export interface ExecutionMetadata {
  environment: string;
  version: string;
  instanceId: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  version: string;
  author: string;
  isPublic: boolean;
  tags: string[];
  documentation: string;
  preview: WorkflowPreview;
  configuration: TemplateConfiguration;
  usage: TemplateUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowPreview {
  steps: TemplateStep[];
  triggers: TemplateTrigger[];
  variables: TemplateVariable[];
  estimatedComplexity: ComplexityLevel;
}

export interface TemplateStep {
  name: string;
  type: ActionType;
  description: string;
  required: boolean;
  configurable: boolean;
}

export interface TemplateTrigger {
  type: TriggerType;
  description: string;
  configurable: boolean;
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export type ComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT';

export interface TemplateConfiguration {
  requiredFields: string[];
  optionalFields: string[];
  validationRules: ValidationRule[];
  defaultValues: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  required: boolean;
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

export interface WorkflowSchedule {
  id: string;
  workflowId: string;
  name: string;
  enabled: boolean;
  timezone: string;
  pattern: SchedulePattern;
  nextRun: Date;
  lastRun?: Date;
  runCount: number;
  failureCount: number;
  lastStatus?: RunStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface WorkflowMonitor {
  id: string;
  workflowId: string;
  name: string;
  type: MonitorType;
  config: MonitorConfig;
  enabled: boolean;
  status: MonitorStatus;
  lastCheck?: Date;
  alerts: MonitorAlert[];
  thresholds: MonitorThreshold[];
  createdAt: Date;
  updatedAt: Date;
}

export type MonitorType = 
  | 'PERFORMANCE'
  | 'ERROR_RATE'
  | 'SUCCESS_RATE'
  | 'EXECUTION_TIME'
  | 'QUEUE_DEPTH'
  | 'RESOURCE_USAGE'
  | 'CUSTOM';

export type MonitorStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';

export interface MonitorConfig {
  checkInterval: number;
  evaluationWindow: string;
  aggregation: AggregationType;
  filters?: Record<string, any>;
  groupBy?: string[];
}

export type AggregationType = 
  | 'AVERAGE'
  | 'SUM'
  | 'COUNT'
  | 'MIN'
  | 'MAX'
  | 'PERCENTILE';

export interface MonitorAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type AlertType = 'THRESHOLD' | 'ANOMALY' | 'TREND' | 'CUSTOM';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MonitorThreshold {
  metric: string;
  operator: ConditionOperator;
  value: number;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface WorkflowReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  workflowIds: string[];
  dateRange: DateRange;
  filters: ReportFilter[];
  metrics: ReportMetric[];
  format: ReportFormat;
  schedule?: ReportSchedule;
  generatedAt?: Date;
  generatedBy?: string;
  fileUrl?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = 
  | 'EXECUTION_SUMMARY'
  | 'PERFORMANCE_ANALYSIS'
  | 'ERROR_REPORT'
  | 'USAGE_STATISTICS'
  | 'COMPLIANCE_AUDIT'
  | 'CUSTOM';

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'LAST_24_HOURS' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_QUARTER' | 'LAST_YEAR' | 'CUSTOM';
}

export interface ReportFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
  label: string;
}

export interface ReportMetric {
  name: string;
  type: MetricType;
  aggregation: AggregationType;
  label: string;
  format?: string;
}

export type MetricType = 
  | 'COUNT'
  | 'SUM'
  | 'AVERAGE'
  | 'MIN'
  | 'MAX'
  | 'PERCENTAGE'
  | 'RATE'
  | 'DURATION';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON' | 'HTML';

export type ReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  timezone: string;
  recipients: string[];
  nextRun?: Date;
  lastRun?: Date;
}

export interface WorkflowPermission {
  id: string;
  workflowId: string;
  userId?: string;
  roleId?: string;
  permissions: Permission[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export type Permission = 
  | 'VIEW'
  | 'EDIT'
  | 'DELETE'
  | 'EXECUTE'
  | 'MANAGE'
  | 'SHARE'
  | 'PUBLISH'
  | 'MONITOR';

export interface WorkflowComment {
  id: string;
  workflowId: string;
  executionId?: string;
  userId: string;
  userName: string;
  content: string;
  type: CommentType;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentReply[];
  mentions: string[];
  attachments: CommentAttachment[];
}

export type CommentType = 'GENERAL' | 'QUESTION' | 'ISSUE' | 'SUGGESTION' | 'APPROVAL';
export type CommentType = 'GENERAL' | 'QUESTION' | 'ISSUE' | 'SUGGESTION' | 'APPROVAL';

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface WorkflowTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usage: number;
  createdAt: Date;
  createdBy: string;
}
