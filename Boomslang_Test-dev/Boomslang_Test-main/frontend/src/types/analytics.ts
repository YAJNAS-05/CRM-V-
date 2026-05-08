export interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  status: ModelStatus;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  createdAt: Date;
  updatedAt: Date;
  trainedAt?: Date;
  lastUsed?: Date;
  trainingData: TrainingDataInfo;
  hyperparameters: Record<string, any>;
  features: ModelFeature[];
  targetVariable: string;
  deploymentStatus: DeploymentStatus;
  version: string;
  tags: string[];
  owner: string;
}

export type ModelType = 
  | 'CLASSIFICATION'
  | 'REGRESSION'
  | 'CLUSTERING'
  | 'TIME_SERIES'
  | 'ANOMALY_DETECTION'
  | 'RECOMMENDATION'
  | 'NATURAL_LANGUAGE_PROCESSING'
  | 'COMPUTER_VISION';

export type ModelStatus = 
  | 'DRAFT'
  | 'TRAINING'
  | 'TRAINED'
  | 'VALIDATING'
  | 'DEPLOYED'
  | 'FAILED'
  | 'ARCHIVED';

export type DeploymentStatus = 
  | 'NOT_DEPLOYED'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'SCALING'
  | 'FAILED';

export interface TrainingDataInfo {
  source: string;
  rows: number;
  columns: number;
  trainingSplit: number;
  validationSplit: number;
  testSplit: number;
  lastUpdated: Date;
  dataQuality: DataQualityMetrics;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  missingValues: number;
  duplicates: number;
  outliers: number;
}

export interface ModelFeature {
  name: string;
  type: 'NUMERIC' | 'CATEGORICAL' | 'TEXT' | 'DATE' | 'BOOLEAN';
  importance: number;
  description: string;
  transformPipeline?: string[];
}

export interface ModelTraining {
  id: string;
  modelId: string;
  status: TrainingStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  estimatedDuration?: number;
  currentEpoch?: number;
  totalEpochs?: number;
  metrics: TrainingMetrics;
  logs: TrainingLog[];
  hyperparameters: Record<string, any>;
  earlyStoppingPatience: number;
  checkpointPath?: string;
}

export type TrainingStatus = 
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TrainingMetrics {
  loss: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
  learningRate: number;
  batchSize: number;
  epochs: number;
  bestEpoch?: number;
  bestScore?: number;
}

export interface TrainingLog {
  timestamp: Date;
  epoch: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  metrics?: Partial<TrainingMetrics>;
}

export interface Prediction {
  id: string;
  modelId: string;
  input: Record<string, any>;
  output: PredictionOutput;
  confidence: number;
  timestamp: Date;
  processingTime: number;
  requestId: string;
  userId?: string;
  metadata: Record<string, any>;
}

export interface PredictionOutput {
  value: any;
  probability?: number;
  classProbabilities?: Record<string, number>;
  features?: Record<string, number>;
  explanation?: PredictionExplanation;
}

export interface PredictionExplanation {
  method: 'SHAP' | 'LIME' | 'FEATURE_IMPORTANCE' | 'PERMUTATION';
  features: FeatureImportance[];
  globalExplanation?: string;
  localExplanation?: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  value: any;
}

export interface Forecast {
  id: string;
  modelId: string;
  targetVariable: string;
  horizon: number;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  predictions: ForecastPoint[];
  confidenceIntervals: ConfidenceInterval[];
  accuracy: ForecastAccuracy;
  generatedAt: Date;
  validUntil: Date;
  metadata: ForecastMetadata;
}

export interface ForecastPoint {
  timestamp: Date;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

export interface ConfidenceInterval {
  level: number; // e.g., 0.95 for 95% confidence
  lowerBound: number;
  upperBound: number;
}

export interface ForecastAccuracy {
  mae: number; // Mean Absolute Error
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error
  r2: number; // R-squared
  smape: number; // Symmetric Mean Absolute Percentage Error
}

export interface ForecastMetadata {
  trainingPeriod: {
    start: Date;
    end: Date;
  };
  features: string[];
  seasonality: SeasonalityPattern[];
  trends: TrendAnalysis[];
  anomalies: Anomaly[];
}

export interface SeasonalityPattern {
  period: string;
  strength: number;
  pattern: number[];
}

export interface TrendAnalysis {
  type: 'LINEAR' | 'EXPONENTIAL' | 'POLYNOMIAL' | 'SEASONAL';
  slope: number;
  intercept: number;
  r2: number;
  significance: number;
}

export interface Anomaly {
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  score: number;
  type: 'SPIKE' | 'DIP' | 'TREND_CHANGE' | 'LEVEL_SHIFT';
}

export interface ModelExperiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  createdAt: Date;
  completedAt?: Date;
  models: ExperimentModel[];
  bestModel?: string;
  objective: string;
  metrics: ExperimentMetrics;
  dataset: string;
  parameters: ExperimentParameters;
  results: ExperimentResults;
}

export type ExperimentStatus = 
  | 'DRAFT'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ExperimentModel {
  modelId: string;
  modelName: string;
  hyperparameters: Record<string, any>;
  metrics: ModelMetrics;
  rank: number;
  status: ModelStatus;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  logLoss?: number;
  mse?: number;
  mae?: number;
  r2?: number;
  customMetrics?: Record<string, number>;
}

export interface ExperimentMetrics {
  primaryMetric: string;
  optimization: 'MAXIMIZE' | 'MINIMIZE';
  bestScore: number;
  averageScore: number;
  standardDeviation: number;
  convergenceEpoch?: number;
}

export interface ExperimentParameters {
  searchMethod: 'GRID_SEARCH' | 'RANDOM_SEARCH' | 'BAYESIAN_OPTIMIZATION' | 'GENETIC_ALGORITHM';
  maxIterations: number;
  parallelTrials: number;
  earlyStopping: boolean;
  crossValidationFolds: number;
  parameterSpace: ParameterSpace[];
}

export interface ParameterSpace {
  name: string;
  type: 'CATEGORICAL' | 'INTEGER' | 'FLOAT' | 'BOOLEAN';
  values?: any[];
  min?: number;
  max?: number;
  step?: number;
  distribution?: 'UNIFORM' | 'NORMAL' | 'LOG_UNIFORM';
}

export interface ExperimentResults {
  totalTrials: number;
  successfulTrials: number;
  failedTrials: number;
  bestHyperparameters: Record<string, any>;
  featureImportance: FeatureImportance[];
  learningCurves: LearningCurve[];
  confusionMatrix?: ConfusionMatrix;
  rocCurve?: RocCurve;
}

export interface LearningCurve {
  metric: string;
  trainingScores: number[];
  validationScores: number[];
  epochs: number[];
}

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
  normalizedMatrix?: number[][];
}

export interface RocCurve {
  fpr: number[]; // False Positive Rate
  tpr: number[]; // True Positive Rate
  thresholds: number[];
  auc: number;
}

export interface AnomalyDetection {
  id: string;
  modelId: string;
  timestamp: Date;
  dataPoint: Record<string, any>;
  anomalyScore: number;
  threshold: number;
  isAnomaly: boolean;
  type: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: AnomalyExplanation;
  confidence: number;
  metadata: Record<string, any>;
}

export type AnomalyType = 
  | 'POINT_ANOMALY'
  | 'CONTEXTUAL_ANOMALY'
  | 'COLLECTIVE_ANOMALY'
  | 'SEASONAL_ANOMALY'
  | 'TREND_ANOMALY';

export interface AnomalyExplanation {
  primaryFeatures: string[];
  featureContributions: FeatureImportance[];
  normalRange: Record<string, [number, number]>;
  similarAnomalies: string[];
  recommendedAction: string;
}

export interface ModelPerformance {
  modelId: string;
  timestamp: Date;
  metrics: PerformanceMetrics;
  resourceUsage: ResourceUsage;
  throughput: ThroughputMetrics;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  predictions: PredictionMetrics;
}

export interface PerformanceMetrics {
  accuracy: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
  availability: number;
  cost: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  peakThroughput: number;
  averageThroughput: number;
}

export interface LatencyMetrics {
  p50: number; // 50th percentile
  p95: number; // 95th percentile
  p99: number; // 99th percentile
  average: number;
  maximum: number;
  minimum: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorsByType: Record<string, number>;
  criticalErrors: number;
  recentErrors: ErrorLog[];
}

export interface ErrorLog {
  timestamp: Date;
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  count: number;
}

export interface PredictionMetrics {
  totalPredictions: number;
  successfulPredictions: number;
  failedPredictions: number;
  averageConfidence: number;
  confidenceDistribution: Record<string, number>;
  predictionFrequency: Record<string, number>;
}

export interface ModelInsight {
  id: string;
  modelId: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  timestamp: Date;
  data: Record<string, any>;
  recommendations: string[];
  actionRequired: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export type InsightType = 
  | 'PERFORMANCE_DEGRADATION'
  | 'DATA_DRIFT'
  | 'CONCEPT_DRIFT'
  | 'ACCURACY_DROP'
  | 'RESOURCE_CONSTRAINT'
  | 'PREDICTION_BIAS'
  | 'ANOMALY_PATTERN'
  | 'FEATURE_IMPORTANCE_SHIFT';

export interface ModelMonitoring {
  modelId: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  lastHealthCheck: Date;
  uptime: number;
  downtime: number;
  alerts: MonitoringAlert[];
  checks: HealthCheck[];
  sla: ServiceLevelAgreement;
}

export interface MonitoringAlert {
  id: string;
  type: AlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type AlertType = 
  | 'HIGH_ERROR_RATE'
  | 'HIGH_LATENCY'
  | 'LOW_ACCURACY'
  | 'RESOURCE_EXHAUSTION'
  | 'DATA_DRIFT'
  | 'MODEL_FAILURE'
  | 'SCALING_EVENT';

export interface HealthCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  lastCheck: Date;
  responseTime: number;
  details: Record<string, any>;
}

export interface ServiceLevelAgreement {
  availability: number;
  responseTime: number;
  errorRate: number;
  accuracy: number;
  currentAvailability: number;
  currentResponseTime: number;
  currentErrorRate: number;
  currentAccuracy: number;
  slaCompliance: boolean;
}
