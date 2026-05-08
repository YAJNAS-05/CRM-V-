export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry: string;
  segment: CustomerSegment;
  tier: CustomerTier;
  status: CustomerStatus;
  accountManager: string;
  healthScore: CustomerHealthScore;
  satisfactionScore: number;
  npsScore: number;
  churnRisk: ChurnRisk;
  lifetimeValue: number;
  contractValue: number;
  startDate: Date;
  renewalDate?: Date;
  lastActivity: Date;
  nextTouchpoint?: Date;
  tags: string[];
  customFields: Record<string, any>;
  metadata: CustomerMetadata;
}

export type CustomerSegment = 
  | 'ENTERPRISE'
  | 'MID_MARKET'
  | 'SMALL_BUSINESS'
  | 'STARTUP'
  | 'GOVERNMENT'
  | 'NON_PROFIT';

export type CustomerTier = 
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE'
  | 'TRIAL';

export type CustomerStatus = 
  | 'ACTIVE'
  | 'AT_RISK'
  | 'CHURNED'
  | 'DORMANT'
  | 'TRIAL'
  | 'ONBOARDING'
  | 'UPGRADE_PENDING';

export interface CustomerHealthScore {
  overall: number;
  productUsage: number;
  supportTickets: number;
  engagement: number;
  satisfaction: number;
  lastUpdated: Date;
  trend: HealthTrend;
  factors: HealthFactor[];
}

export interface HealthTrend {
  direction: 'IMPROVING' | 'DECLINING' | 'STABLE';
  change: number;
  period: string;
}

export interface HealthFactor {
  name: string;
  weight: number;
  score: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export type ChurnRisk = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface CustomerMetadata {
  source: string;
  campaign?: string;
  region: string;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CustomerSuccessPlan {
  id: string;
  customerId: string;
  name: string;
  description: string;
  status: PlanStatus;
  priority: Priority;
  objectives: Objective[];
  milestones: Milestone[];
  activities: Activity[];
  kpis: KPI[];
  timeline: Timeline;
  budget?: number;
  owner: string;
  stakeholders: Stakeholder[];
  risks: Risk[];
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export type PlanStatus = 
  | 'DRAFT'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Objective {
  id: string;
  title: string;
  description: string;
  category: ObjectiveCategory;
  status: ObjectiveStatus;
  dueDate?: Date;
  completedAt?: Date;
  owner: string;
  progress: number;
  kpis: string[];
  dependencies: string[];
  notes: string;
}

export type ObjectiveCategory = 
  | 'ADOPTION'
  | 'RETENTION'
  | 'EXPANSION'
  | 'SATISFACTION'
  | 'EFFICIENCY'
  | 'COMPLIANCE';

export type ObjectiveStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: Date;
  completedAt?: Date;
  owner: string;
  dependencies: string[];
  deliverables: Deliverable[];
}

export type MilestoneStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface Deliverable {
  id: string;
  name: string;
  type: DeliverableType;
  status: DeliverableStatus;
  dueDate: Date;
  completedAt?: Date;
  owner: string;
  artifacts: Artifact[];
}

export type DeliverableType = 
  | 'DOCUMENT'
  | 'TRAINING'
  | 'MEETING'
  | 'REVIEW'
  | 'DEMONSTRATION'
  | 'REPORT';

export type DeliverableStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE';

export interface Artifact {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  status: ActivityStatus;
  priority: Priority;
  assignedTo: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  notes: string;
  attachments: Attachment[];
}

export type ActivityType = 
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'DEMO'
  | 'TRAINING'
  | 'REVIEW'
  | 'FOLLOW_UP'
  | 'CHECK_IN'
  | 'ONBOARDING'
  | 'QBR';

export type ActivityStatus = 
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: KPICategory;
  target: number;
  current: number;
  unit: string;
  status: KPIStatus;
  trend: KPITrend;
  lastUpdated: Date;
  frequency: string;
  owner: string;
}

export type KPICategory = 
  | 'ADOPTION'
  | 'USAGE'
  | 'SATISFACTION'
  | 'RETENTION'
  | 'REVENUE'
  | 'EFFICIENCY';

export type KPIStatus = 
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'OFF_TRACK'
  | 'ACHIEVED'
  | 'NOT_APPLICABLE';

export type KPITrend = 
  | 'IMPROVING'
  | 'DECLINING'
  | 'STABLE'
  | 'UNKNOWN';

export interface Timeline {
  startDate: Date;
  endDate: Date;
  phases: Phase[];
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  objectives: string[];
  milestones: string[];
}

export type PhaseStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED';

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  influence: StakeholderInfluence;
  interest: StakeholderInterest;
  engagement: StakeholderEngagement;
  notes: string;
}

export type StakeholderInfluence = 'HIGH' | 'MEDIUM' | 'LOW';
export type StakeholderInterest = 'HIGH' | 'MEDIUM' | 'LOW';
export type StakeholderEngagement = 'CHAMPION' | 'SUPPORTER' | 'NEUTRAL' | 'BLOCKER';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  severity: RiskSeverity;
  status: RiskStatus;
  mitigation: string;
  owner: string;
  identifiedDate: Date;
  reviewDate?: Date;
}

export type RiskCategory = 
  | 'TECHNICAL'
  | 'RESOURCE'
  | 'TIMELINE'
  | 'BUDGET'
  | 'ADOPTION'
  | 'COMPETITIVE'
  | 'REGULATORY';

export type RiskProbability = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskImpact = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: InteractionType;
  subject: string;
  description: string;
  channel: InteractionChannel;
  direction: InteractionDirection;
  status: InteractionStatus;
  priority: Priority;
  assignedTo: string;
  participants: Participant[];
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  outcome?: string;
  nextSteps?: string;
  attachments: Attachment[];
  tags: string[];
  notes: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type InteractionType = 
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'DEMO'
  | 'TRAINING'
  | 'QBR'
  | 'CHECK_IN'
  | 'ONBOARDING'
  | 'SUPPORT'
  | 'SURVEY';

export type InteractionChannel = 
  | 'PHONE'
  | 'EMAIL'
  | 'VIDEO'
  | 'IN_PERSON'
  | 'CHAT'
  | 'WEBINAR';

export type InteractionDirection = 'INBOUND' | 'OUTBOUND';

export type InteractionStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  required: boolean;
  confirmed?: boolean;
}

export interface CustomerFeedback {
  id: string;
  customerId: string;
  type: FeedbackType;
  source: FeedbackSource;
  rating?: number;
  sentiment: Sentiment;
  category: FeedbackCategory;
  subject: string;
  content: string;
  tags: string[];
  status: FeedbackStatus;
  priority: Priority;
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  createdAt: Date;
  collectedAt: Date;
  metadata: FeedbackMetadata;
}

export type FeedbackType = 
  | 'NPS'
  | 'CSAT'
  | 'CES'
  | 'SURVEY'
  | 'REVIEW'
  | 'COMPLAINT'
  | 'SUGGESTION'
  | 'TESTIMONIAL';

export type FeedbackSource = 
  | 'EMAIL'
  | 'SURVEY'
  | 'SUPPORT_TICKET'
  | 'SOCIAL_MEDIA'
  | 'REVIEW_SITE'
  | 'SALES_CALL'
  | 'CUSTOMER_PORTAL';

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type FeedbackStatus = 
  | 'NEW'
  | 'REVIEWED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type FeedbackCategory = 
  | 'PRODUCT'
  | 'SERVICE'
  | 'SUPPORT'
  | 'PRICING'
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'DOCUMENTATION'
  | 'ONBOARDING'
  | 'BILLING';

export interface FeedbackMetadata {
  campaign?: string;
  product?: string;
  feature?: string;
  version?: string;
  environment?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

export interface CustomerOnboarding {
  id: string;
  customerId: string;
  status: OnboardingStatus;
  startDate: Date;
  targetDate?: Date;
  completedAt?: Date;
  progress: number;
  phases: OnboardingPhase[];
  tasks: OnboardingTask[];
  milestones: OnboardingMilestone[];
  owner: string;
  team: TeamMember[];
  resources: Resource[];
  blockers: Blocker[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OnboardingStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface OnboardingPhase {
  id: string;
  name: string;
  description: string;
  status: OnboardingStatus;
  startDate?: Date;
  endDate?: Date;
  progress: number;
  tasks: string[];
  owner: string;
  dependencies: string[];
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];
  attachments: Attachment[];
  notes: string;
}

export type TaskType = 
  | 'TRAINING'
  | 'CONFIGURATION'
  | 'INTEGRATION'
  | 'DOCUMENTATION'
  | 'REVIEW'
  | 'MEETING'
  | 'VERIFICATION';

export type TaskStatus = 
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: Date;
  completedAt?: Date;
  criteria: string[];
  owner: string;
  verification: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  responsibilities: string[];
  availability: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  url?: string;
  description: string;
  category: string;
  tags: string[];
}

export type ResourceType = 
  | 'DOCUMENT'
  | 'VIDEO'
  | 'LINK'
  | 'TEMPLATE'
  | 'TOOL'
  | 'CONTACT';

export interface Blocker {
  id: string;
  title: string;
  description: string;
  severity: BlockerSeverity;
  status: BlockerStatus;
  owner: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export type BlockerSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type BlockerStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export interface CustomerRenewal {
  id: string;
  customerId: string;
  type: RenewalType;
  status: RenewalStatus;
  currentContract: Contract;
  proposedContract?: Contract;
  renewalDate: Date;
  probability: RenewalProbability;
  value: number;
  riskFactors: RiskFactor[];
  nextSteps: RenewalNextStep[];
  owner: string;
  stakeholders: Stakeholder[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RenewalType = 'RENEWAL' | 'EXPANSION' | 'DOWNGRADE' | 'CANCELLATION';
export type RenewalStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PROPOSED'
  | 'NEGOTIATING'
  | 'SIGNED'
  | 'LOST'
  | 'DELAYED';

export type RenewalProbability = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Contract {
  id: string;
  name: string;
  type: ContractType;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  billingCycle: BillingCycle;
  terms: ContractTerm[];
  products: Product[];
  services: Service[];
  status: ContractStatus;
}

export type ContractType = 'NEW' | 'RENEWAL' | 'EXPANSION' | 'AMENDMENT';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export interface ContractTerm {
  id: string;
  name: string;
  value: string;
  type: TermType;
  mandatory: boolean;
}

export type TermType = 
  | 'PAYMENT'
  | 'SERVICE_LEVEL'
  | 'USAGE_LIMIT'
  | 'SUPPORT'
  | 'TERMINATION'
  | 'RENEWAL'
  | 'CUSTOM';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  discount?: number;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  level: ServiceLevel;
  hours?: number;
  rate?: number;
}

export type ServiceType = 
  | 'SUPPORT'
  | 'TRAINING'
  | 'CONSULTING'
  | 'IMPLEMENTATION'
  | 'MAINTENANCE';

export type ServiceLevel = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export interface RiskFactor {
  id: string;
  factor: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  mitigation: string;
}

export interface RenewalNextStep {
  id: string;
  action: string;
  dueDate: Date;
  owner: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  notes: string;
}

export interface CustomerMetrics {
  customerId: string;
  period: string;
  metrics: {
    adoption: AdoptionMetrics;
    usage: UsageMetrics;
    satisfaction: SatisfactionMetrics;
    financial: FinancialMetrics;
    engagement: EngagementMetrics;
  };
  calculatedAt: Date;
}

export interface AdoptionMetrics {
  featureAdoptionRate: number;
  userAdoptionRate: number;
  timeToValue: number;
  onboardingCompletion: number;
  trainingCompletion: number;
}

export interface UsageMetrics {
  activeUsers: number;
  totalUsers: number;
  loginFrequency: number;
  sessionDuration: number;
  featureUsage: Record<string, number>;
  apiCalls: number;
  dataVolume: number;
}

export interface SatisfactionMetrics {
  npsScore: number;
  csatScore: number;
  cesScore: number;
  supportTickets: number;
  responseTime: number;
  resolutionTime: number;
}

export interface FinancialMetrics {
  mrr: number;
  arr: number;
  ltv: number;
  cac: number;
  expansionRevenue: number;
  churnRevenue: number;
  grossMargin: number;
}

export interface EngagementMetrics {
  touchpoints: number;
  lastTouchpoint: Date;
  nextTouchpoint?: Date;
  meetingAttendance: number;
  supportInteractions: number;
  productFeedback: number;
  communityParticipation: number;
}

export interface CustomerReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  template: ReportTemplate;
  parameters: ReportParameter[];
  schedule: ReportSchedule;
  recipients: string[];
  status: ReportStatus;
  lastGenerated?: Date;
  nextRun?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = 
  | 'HEALTH_SCORE'
  | 'ADOPTION'
  | 'SATISFACTION'
  | 'RENEWAL_FORECAST'
  | 'QBR_SUMMARY'
  | 'ACCOUNT_SUMMARY'
  | 'TEAM_PERFORMANCE'
  | 'CUSTOM';

export interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
  format: ReportFormat;
  branding: ReportBranding;
}

export interface ReportSection {
  id: string;
  title: string;
  type: SectionType;
  content: SectionContent;
  order: number;
  visible: boolean;
}

export type SectionType = 
  | 'HEADER'
  | 'SUMMARY'
  | 'CHART'
  | 'TABLE'
  | 'TEXT'
  | 'METRICS'
  | 'IMAGE';

export interface SectionContent {
  data?: any;
  config?: Record<string, any>;
  query?: string;
  template?: string;
}

export type ReportFormat = 'PDF' | 'HTML' | 'EXCEL' | 'POWERPOINT';

export interface ReportBranding {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface ReportParameter {
  id: string;
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  options?: ParameterOption[];
}

export type ParameterType = 
  | 'DATE_RANGE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN';

export interface ParameterOption {
  label: string;
  value: any;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  timezone: string;
  nextRun?: Date;
  lastRun?: Date;
}
