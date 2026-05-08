import { axiosInstance } from './axiosInstance'

export interface MLModel {
  id: string
  name: string
  description: string
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'time_series'
  algorithm: string
  version: string
  status: 'training' | 'ready' | 'deployed' | 'failed' | 'archived'
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  features: string[]
  targetVariable: string
  trainingData: {
    startDate: string
    endDate: string
    recordCount: number
  }
  deployment: {
    endpoint?: string
    deployedAt?: string
    environment: 'development' | 'staging' | 'production'
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ModelExperiment {
  id: string
  name: string
  description: string
  modelId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  parameters: Record<string, any>
  metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    mse?: number
    mae?: number
    r2Score?: number
  }
  results: {
    predictions: any[]
    actualValues?: any[]
    confusionMatrix?: number[][]
  }
  duration: number
  startedAt: string
  completedAt?: string
  createdBy: string
}

export interface Forecast {
  id: string
  name: string
  description: string
  type: 'sales' | 'revenue' | 'demand' | 'inventory' | 'headcount' | 'custom'
  target: string
  methodology: 'arima' | 'prophet' | 'lstm' | 'linear_regression' | 'ensemble'
  period: {
    startDate: string
    endDate: string
    granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  }
  forecastData: Array<{
    date: string
    predicted: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    actual?: number
  }>
  accuracy: {
    mape: number
    rmse: number
    mae: number
  }
  status: 'generating' | 'ready' | 'failed'
  createdAt: string
  createdBy: string
}

export interface AnomalyDetection {
  id: string
  name: string
  description: string
  dataSource: string
  methodology: 'isolation_forest' | 'one_class_svm' | 'local_outlier_factor' | 'autoencoder'
  sensitivity: number
  status: 'active' | 'inactive' | 'training'
  anomalies: Array<{
    id: string
    timestamp: string
    value: number
    anomalyScore: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    isConfirmed: boolean
    investigatedBy?: string
    investigatedAt?: string
  }>
  lastRun: string
  nextRun: string
  createdAt: string
  createdBy: string
}

export interface Prediction {
  id: string
  modelId: string
  modelName: string
  input: Record<string, any>
  output: any
  confidence: number
  timestamp: string
  userId?: string
  context?: string
}

export interface MLInsight {
  id: string
  title: string
  description: string
  type: 'pattern' | 'correlation' | 'trend' | 'anomaly' | 'recommendation'
  category: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  data: {
    summary: string
    details: Record<string, any>
    visualizations?: Array<{
      type: string
      data: any
      config: Record<string, any>
    }>
  }
  actionable: boolean
  recommendations: string[]
  generatedAt: string
  expiresAt?: string
}

export interface TrendAnalysis {
  id: string
  name: string
  description: string
  metric: string
  timeRange: {
    startDate: string
    endDate: string
  }
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
    strength: number
    significance: number
  }
  seasonality: {
    detected: boolean
    period?: number
    strength?: number
  }
  forecast: Array<{
    date: string
    predicted: number
    confidenceInterval: {
      lower: number
      upper: number
    }
  }>
  keyDrivers: Array<{
    factor: string
    correlation: number
    importance: number
  }>
  insights: string[]
  generatedAt: string
}

export const analyticsApi = {
  // Model Management
  getModels: async (filters?: {
    type?: string
    status?: string
    algorithm?: string
    search?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/models', { params: filters })
    return response.data
  },

  getModel: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/models/${id}`)
    return response.data
  },

  createModel: async (model: Omit<MLModel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/analytics/models', model)
    return response.data
  },

  updateModel: async (id: string, model: Partial<MLModel>) => {
    const response = await axiosInstance.put(`/api/analytics/models/${id}`, model)
    return response.data
  },

  deleteModel: async (id: string) => {
    await axiosInstance.delete(`/api/analytics/models/${id}`)
  },

  trainModel: async (id: string, config: {
    algorithm?: string
    parameters?: Record<string, any>
    trainingData?: {
      startDate: string
      endDate: string
    }
  }) => {
    const response = await axiosInstance.post(`/api/analytics/models/${id}/train`, config)
    return response.data
  },

  deployModel: async (id: string, environment: 'staging' | 'production') => {
    const response = await axiosInstance.post(`/api/analytics/models/${id}/deploy`, { environment })
    return response.data
  },

  undeployModel: async (id: string) => {
    await axiosInstance.post(`/api/analytics/models/${id}/undeploy`)
  },

  getModelMetrics: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/models/${id}/metrics`)
    return response.data
  },

  getModelFeatureImportance: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/models/${id}/feature-importance`)
    return response.data
  },

  // Model Training
  getTrainingJobs: async (filters?: {
    status?: string
    modelId?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/training', { params: filters })
    return response.data
  },

  getTrainingJob: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/training/${id}`)
    return response.data
  },

  startTraining: async (config: {
    modelId: string
    algorithm: string
    parameters: Record<string, any>
    trainingData: {
      startDate: string
      endDate: string
    }
  }) => {
    const response = await axiosInstance.post('/api/analytics/training', config)
    return response.data
  },

  stopTraining: async (id: string) => {
    await axiosInstance.post(`/api/analytics/training/${id}/stop`)
  },

  getTrainingLogs: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/training/${id}/logs`)
    return response.data
  },

  // Forecasting
  getForecasts: async (filters?: {
    type?: string
    status?: string
    target?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/forecasts', { params: filters })
    return response.data
  },

  getForecast: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/forecasts/${id}`)
    return response.data
  },

  createForecast: async (forecast: Omit<Forecast, 'id' | 'createdAt' | 'createdBy' | 'forecastData' | 'accuracy' | 'status'>) => {
    const response = await axiosInstance.post('/api/analytics/forecasts', forecast)
    return response.data
  },

  generateForecast: async (id: string) => {
    const response = await axiosInstance.post(`/api/analytics/forecasts/${id}/generate`)
    return response.data
  },

  updateForecast: async (id: string, forecast: Partial<Forecast>) => {
    const response = await axiosInstance.put(`/api/analytics/forecasts/${id}`, forecast)
    return response.data
  },

  deleteForecast: async (id: string) => {
    await axiosInstance.delete(`/api/analytics/forecasts/${id}`)
  },

  // Forecast Generation
  generateAdHocForecast: async (config: {
    target: string
    methodology: string
    period: {
      startDate: string
      endDate: string
      granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    }
    parameters?: Record<string, any>
  }) => {
    const response = await axiosInstance.post('/api/analytics/forecasts/generate', config)
    return response.data
  },

  getForecastAccuracy: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/forecasts/${id}/accuracy`)
    return response.data
  },

  // Predictions
  getPredictions: async (filters?: {
    modelId?: string
    userId?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/predictions', { params: filters })
    return response.data
  },

  getPrediction: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/predictions/${id}`)
    return response.data
  },

  makePrediction: async (config: {
    modelId: string
    input: Record<string, any>
    context?: string
  }) => {
    const response = await axiosInstance.post('/api/analytics/predictions', config)
    return response.data
  },

  batchPredict: async (config: {
    modelId: string
    inputs: Record<string, any>[]
  }) => {
    const response = await axiosInstance.post('/api/analytics/predictions/batch', config)
    return response.data
  },

  // Predictive Analytics
  getPredictiveAnalytics: async (filters?: {
    category?: string
    timeRange?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/predictive', { params: filters })
    return response.data
  },

  runPredictiveAnalysis: async (config: {
    target: string
    features: string[]
    methodology: string
    timeRange: {
      startDate: string
      endDate: string
    }
  }) => {
    const response = await axiosInstance.post('/api/analytics/predictive/analyze', config)
    return response.data
  },

  // Predictive Models
  getPredictiveModels: async (filters?: {
    type?: string
    status?: string
    target?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/predictive-models', { params: filters })
    return response.data
  },

  getPredictiveModel: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/predictive-models/${id}`)
    return response.data
  },

  createPredictiveModel: async (model: Omit<MLModel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/analytics/predictive-models', model)
    return response.data
  },

  // Trend Analysis
  getTrendAnalyses: async (filters?: {
    metric?: string
    category?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/trend-analysis', { params: filters })
    return response.data
  },

  getTrendAnalysis: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/trend-analysis/${id}`)
    return response.data
  },

  createTrendAnalysis: async (analysis: Omit<TrendAnalysis, 'id' | 'generatedAt' | 'trend' | 'seasonality' | 'forecast' | 'keyDrivers' | 'insights'>) => {
    const response = await axiosInstance.post('/api/analytics/trend-analysis', analysis)
    return response.data
  },

  runTrendAnalysis: async (id: string) => {
    const response = await axiosInstance.post(`/api/analytics/trend-analysis/${id}/run`)
    return response.data
  },

  // ML Insights
  getMLInsights: async (filters?: {
    type?: string
    category?: string
    importance?: string
    actionable?: boolean
  }) => {
    const response = await axiosInstance.get('/api/analytics/ml-insights', { params: filters })
    return response.data
  },

  getMLInsight: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/ml-insights/${id}`)
    return response.data
  },

  generateMLInsights: async (config: {
    dataSource: string
    insightTypes: string[]
    timeRange?: {
      startDate: string
      endDate: string
    }
  }) => {
    const response = await axiosInstance.post('/api/analytics/ml-insights/generate', config)
    return response.data
  },

  markInsightAsActioned: async (id: string, action: string) => {
    const response = await axiosInstance.post(`/api/analytics/ml-insights/${id}/action`, { action })
    return response.data
  },

  // Anomaly Detection
  getAnomalyDetections: async (filters?: {
    status?: string
    dataSource?: string
    severity?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/anomaly-detection', { params: filters })
    return response.data
  },

  getAnomalyDetection: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/anomaly-detection/${id}`)
    return response.data
  },

  createAnomalyDetection: async (detection: Omit<AnomalyDetection, 'id' | 'anomalies' | 'lastRun' | 'nextRun' | 'createdAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/analytics/anomaly-detection', detection)
    return response.data
  },

  runAnomalyDetection: async (id: string) => {
    const response = await axiosInstance.post(`/api/analytics/anomaly-detection/${id}/run`)
    return response.data
  },

  getAnomalies: async (detectionId: string, filters?: {
    severity?: string
    isConfirmed?: boolean
    startDate?: string
    endDate?: string
  }) => {
    const response = await axiosInstance.get(`/api/analytics/anomaly-detection/${detectionId}/anomalies`, {
      params: filters
    })
    return response.data
  },

  confirmAnomaly: async (detectionId: string, anomalyId: string, confirmed: boolean, note?: string) => {
    const response = await axiosInstance.post(`/api/analytics/anomaly-detection/${detectionId}/anomalies/${anomalyId}/confirm`, {
      confirmed,
      note
    })
    return response.data
  },

  // Model Experiments
  getExperiments: async (filters?: {
    modelId?: string
    status?: string
    createdBy?: string
  }) => {
    const response = await axiosInstance.get('/api/analytics/experiments', { params: filters })
    return response.data
  },

  getExperiment: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/experiments/${id}`)
    return response.data
  },

  createExperiment: async (experiment: Omit<ModelExperiment, 'id' | 'startedAt' | 'completedAt' | 'createdBy'>) => {
    const response = await axiosInstance.post('/api/analytics/experiments', experiment)
    return response.data
  },

  runExperiment: async (id: string) => {
    const response = await axiosInstance.post(`/api/analytics/experiments/${id}/run`)
    return response.data
  },

  stopExperiment: async (id: string) => {
    await axiosInstance.post(`/api/analytics/experiments/${id}/stop`)
  },

  compareExperiments: async (experimentIds: string[]) => {
    const response = await axiosInstance.post('/api/analytics/experiments/compare', { experimentIds })
    return response.data
  },

  // Model Monitoring
  getMonitoringData: async (modelId: string, filters?: {
    startDate?: string
    endDate?: string
    metrics?: string[]
  }) => {
    const response = await axiosInstance.get(`/api/analytics/monitoring/${modelId}`, { params: filters })
    return response.data
  },

  getModelPerformance: async (modelId: string, timeRange?: string) => {
    const response = await axiosInstance.get(`/api/analytics/monitoring/${modelId}/performance`, {
      params: { timeRange }
    })
    return response.data
  },

  getModelDrift: async (modelId: string) => {
    const response = await axiosInstance.get(`/api/analytics/monitoring/${modelId}/drift`)
    return response.data
  },

  getModelUsage: async (modelId: string, timeRange?: string) => {
    const response = await axiosInstance.get(`/api/analytics/monitoring/${modelId}/usage`, {
      params: { timeRange }
    })
    return response.data
  },

  // Data Sources
  getDataSources: async () => {
    const response = await axiosInstance.get('/api/analytics/data-sources')
    return response.data
  },

  getDataSource: async (id: string) => {
    const response = await axiosInstance.get(`/api/analytics/data-sources/${id}`)
    return response.data
  },

  testDataSource: async (config: {
    type: string
    connection: Record<string, any>
  }) => {
    const response = await axiosInstance.post('/api/analytics/data-sources/test', config)
    return response.data
  },

  // Analytics Dashboard
  getDashboardData: async (timeRange?: string) => {
    const response = await axiosInstance.get('/api/analytics/dashboard', {
      params: { timeRange }
    })
    return response.data
  },

  getAnalyticsSummary: async () => {
    const response = await axiosInstance.get('/api/analytics/summary')
    return response.data
  }
}
