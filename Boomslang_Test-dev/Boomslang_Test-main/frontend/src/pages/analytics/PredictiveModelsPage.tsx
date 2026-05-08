import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Filter,
  Search,
  BarChart3,
  Target,
  Settings,
  Database,
  Cpu,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'time-series' | 'anomaly-detection';
  status: 'training' | 'ready' | 'deployed' | 'failed' | 'deprecated';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  version: string;
  createdAt: string;
  lastTrained: string;
  trainedBy: string;
  dataset: string;
  algorithm: string;
  features: string[];
  targetVariable: string;
  deploymentStatus: 'not-deployed' | 'staging' | 'production' | 'failed';
  inferenceCount: number;
  avgInferenceTime: number;
  lastDeployed?: string;
  healthScore: number;
}

interface ModelTraining {
  id: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  estimatedCompletion?: string;
  logs: string[];
  metrics?: {
    accuracy: number;
    loss: number;
    validationAccuracy: number;
  };
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
  };
}

interface ModelDataset {
  id: string;
  name: string;
  description: string;
  size: number;
  records: number;
  features: number;
  format: 'csv' | 'json' | 'parquet' | 'database';
  source: string;
  lastUpdated: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isUsed: boolean;
  usedBy: string[];
}

const PredictiveModelsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Load predictive models from API on component mount
  useEffect(() => {
    const loadPredictiveModels = async () => {
      setLoading(true);
      try {
        const modelsData = await analyticsApi.getPredictiveModels();
        if (modelsData) {
          setPredictiveModels(modelsData);
        }
      } catch (error) {
        console.error('Failed to load predictive models:', error);
        toast.error('Failed to load predictive models');
      } finally {
        setLoading(false);
      }
    };
    loadPredictiveModels();
  }, []);
      accuracy: 88.7,
      precision: 85.2,
      recall: 86.9,
      f1Score: 86.0,
      version: '1.3.0',
      createdAt: '2024-01-05',
      lastTrained: '2024-01-12',
      trainedBy: 'ML Engineer',
      dataset: 'sales_history_2023_2024',
      algorithm: 'LSTM',
      features: ['historical_sales', 'seasonality', 'market_indicators', 'competitor_pricing'],
      targetVariable: 'revenue_forecast',
      deploymentStatus: 'staging',
      inferenceCount: 890,
      avgInferenceTime: 120,
      lastDeployed: '2024-01-13',
      healthScore: 88
    },
    {
      id: 'model-3',
      name: 'Fraud Detection',
      description: 'Identifies potentially fraudulent transactions in real-time',
      type: 'anomaly-detection',
      status: 'training',
      accuracy: 94.2,
      precision: 91.5,
      recall: 89.8,
      f1Score: 90.6,
      version: '3.0.0',
      createdAt: '2024-01-08',
      lastTrained: '2024-01-15',
      trainedBy: 'Security Team',
      dataset: 'transaction_history_2024',
      algorithm: 'Isolation Forest',
      features: ['transaction_amount', 'location', 'time', 'user_behavior', 'device_fingerprint'],
      targetVariable: 'fraud_probability',
      deploymentStatus: 'not-deployed',
      inferenceCount: 0,
      avgInferenceTime: 0,
      healthScore: 75
    },
    {
      id: 'model-4',
      name: 'Lead Scoring',
      description: 'Scores leads based on likelihood to convert into customers',
      type: 'classification',
      status: 'deployed',
      accuracy: 86.3,
      precision: 83.7,
      recall: 81.9,
      f1Score: 82.8,
      version: '1.5.0',
      createdAt: '2024-01-03',
      lastTrained: '2024-01-08',
      trainedBy: 'Marketing Analytics',
      dataset: 'lead_data_2024',
      algorithm: 'Gradient Boosting',
      features: ['lead_source', 'company_size', 'industry', 'engagement_level', 'budget'],
      targetVariable: 'conversion_probability',
      deploymentStatus: 'production',
      inferenceCount: 32100,
      avgInferenceTime: 25,
      lastDeployed: '2024-01-09',
      healthScore: 92
    },
    {
      id: 'model-5',
      name: 'Inventory Optimization',
      description: 'Predicts optimal inventory levels to minimize stockouts and overstock',
      type: 'regression',
      status: 'ready',
      accuracy: 79.8,
      precision: 77.2,
      recall: 76.5,
      f1Score: 76.8,
      version: '1.0.0',
      createdAt: '2024-01-12',
      lastTrained: '2024-01-14',
      trainedBy: 'Operations Team',
      dataset: 'inventory_data_2024',
      algorithm: 'Linear Regression',
      features: ['historical_demand', 'seasonality', 'supplier_lead_time', 'price_trends'],
      targetVariable: 'optimal_stock_level',
      deploymentStatus: 'staging',
      inferenceCount: 450,
      avgInferenceTime: 15,
      lastDeployed: '2024-01-15',
      healthScore: 85
    }
  ];

  const modelTraining: ModelTraining[] = [
    {
      id: 'training-1',
      modelId: 'model-3',
      modelName: 'Fraud Detection',
      status: 'running',
      progress: 67,
      startedAt: '2024-01-15 14:30:00',
      estimatedCompletion: '2024-01-15 16:45:00',
      logs: [
        'Training started with 1M records',
        'Epoch 1/100 - Loss: 0.4523',
        'Epoch 25/100 - Loss: 0.2341',
        'Epoch 50/100 - Loss: 0.1567'
      ],
      resources: {
        cpu: 85,
        memory: 12,
        gpu: 100
      }
    },
    {
      id: 'training-2',
      modelId: 'model-2',
      modelName: 'Sales Forecasting',
      status: 'completed',
      progress: 100,
      startedAt: '2024-01-12 09:00:00',
      logs: [
        'Training completed successfully',
        'Final accuracy: 88.7%',
        'Model saved to registry'
      ],
      metrics: {
        accuracy: 88.7,
        loss: 0.1234,
        validationAccuracy: 87.2
      },
      resources: {
        cpu: 45,
        memory: 8,
        gpu: 0
      }
    }
  ];

  const modelDatasets: ModelDataset[] = [
    {
      id: 'dataset-1',
      name: 'customer_behavior_2024',
      description: 'Customer interaction and behavior data for churn prediction',
      size: 2.5,
      records: 1500000,
      features: 45,
      format: 'parquet',
      source: 'Production Database',
      lastUpdated: '2024-01-10',
      quality: 'excellent',
      isUsed: true,
      usedBy: ['Customer Churn Prediction', 'Lead Scoring']
    },
    {
      id: 'dataset-2',
      name: 'sales_history_2023_2024',
      description: 'Historical sales data with market indicators',
      size: 1.8,
      records: 850000,
      features: 32,
      format: 'csv',
      source: 'Data Warehouse',
      lastUpdated: '2024-01-12',
      quality: 'good',
      isUsed: true,
      usedBy: ['Sales Forecasting']
    },
    {
      id: 'dataset-3',
      name: 'transaction_history_2024',
      description: 'Financial transactions for fraud detection',
      size: 5.2,
      records: 3200000,
      features: 28,
      format: 'database',
      source: 'Transaction System',
      lastUpdated: '2024-01-15',
      quality: 'excellent',
      isUsed: true,
      usedBy: ['Fraud Detection']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'ready':
      case 'staging':
        return 'text-blue-600 bg-blue-50';
      case 'training':
      case 'running':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
      case 'deprecated':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'classification':
        return 'text-purple-600 bg-purple-50';
      case 'regression':
        return 'text-blue-600 bg-blue-50';
      case 'clustering':
        return 'text-green-600 bg-green-50';
      case 'time-series':
        return 'text-orange-600 bg-orange-50';
      case 'anomaly-detection':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredModels = predictiveModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedModelData = predictiveModels.find(m => m.id === selectedModel);
  const selectedTraining = modelTraining.filter(t => t.modelId === selectedModel);

  const totalModels = predictiveModels.length;
  const deployedModels = predictiveModels.filter(m => m.status === 'deployed').length;
  const trainingModels = predictiveModels.filter(m => m.status === 'training').length;
  const avgAccuracy = Math.round(
    predictiveModels.reduce((acc, m) => acc + m.accuracy, 0) / totalModels
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Models</h1>
          <p className="text-muted-foreground">
            Manage and monitor machine learning models for predictive analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Models
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Model
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModels}</div>
            <p className="text-xs text-muted-foreground">
              ML models deployed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed Models</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deployedModels}</div>
            <p className="text-xs text-muted-foreground">
              in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Models</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{trainingModels}</div>
            <p className="text-xs text-muted-foreground">
              currently training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              model performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training Alert */}
      {trainingModels > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Activity className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{trainingModels} models</strong> are currently training. 
            Monitor training progress in the Training tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">ML Models</h3>
              <p className="text-sm text-muted-foreground">
                Manage and configure predictive models
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Models List */}
            <div className="space-y-4">
              {filteredModels.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-colors ${
                    selectedModel === model.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(model.type)}`}>
                          <Brain className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <CardDescription>{model.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(model.type)}>
                          {model.type}
                        </Badge>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <p className="font-medium">{model.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Algorithm:</span>
                        <p className="font-medium">{model.algorithm}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <p className="font-medium">{model.version}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Health:</span>
                        <Badge className={getHealthColor(model.healthScore)}>
                          {model.healthScore}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        {model.status === 'deployed' ? 'Retrain' : 'Deploy'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Model Details */}
            <div>
              {selectedModelData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedModelData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedModel(null)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedModelData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Model Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedModelData.type)}>
                              {selectedModelData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Algorithm:</span>
                            <span className="font-medium">{selectedModelData.algorithm}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-medium">{selectedModelData.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedModelData.status)}>
                              {selectedModelData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Accuracy:</span>
                            <span className="font-medium">{selectedModelData.accuracy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precision:</span>
                            <span className="font-medium">{selectedModelData.precision}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recall:</span>
                            <span className="font-medium">{selectedModelData.recall}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">F1 Score:</span>
                            <span className="font-medium">{selectedModelData.f1Score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Deployment Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deployment Status:</span>
                          <Badge className={getStatusColor(selectedModelData.deploymentStatus)}>
                            {selectedModelData.deploymentStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inference Count:</span>
                          <span className="font-medium">{selectedModelData.inferenceCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Inference Time:</span>
                          <span className="font-medium">{selectedModelData.avgInferenceTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Health Score:</span>
                          <Badge className={getHealthColor(selectedModelData.healthScore)}>
                            {selectedModelData.healthScore}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedModelData.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        {selectedModelData.status === 'deployed' ? 'Retrain' : 'Deploy'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a model to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Model Training</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage model training jobs
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          </div>

          <div className="space-y-4">
            {modelTraining.map((training) => (
              <Card key={training.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{training.modelName}</CardTitle>
                      <CardDescription>
                        Started at {training.startedAt}
                        {training.estimatedCompletion && ` • Est. completion: ${training.estimatedCompletion}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                      {training.status === 'running' && (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{training.progress}%</span>
                    </div>
                    <Progress value={training.progress} className="h-2" />
                  </div>

                  {training.resources && (
                    <div>
                      <h4 className="font-medium mb-2">Resource Usage</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">CPU:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={training.resources.cpu} className="h-2 flex-1" />
                            <span>{training.resources.cpu}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(training.resources.memory / 16) * 100} className="h-2 flex-1" />
                            <span>{training.resources.memory}GB</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GPU:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={training.resources.gpu} className="h-2 flex-1" />
                            <span>{training.resources.gpu}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {training.logs && (
                    <div>
                      <h4 className="font-medium mb-2">Training Logs</h4>
                      <div className="bg-muted p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                        {training.logs.map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {training.metrics && (
                    <div>
                      <h4 className="font-medium mb-2">Training Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>
                          <p className="font-medium">{training.metrics.accuracy}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Loss:</span>
                          <p className="font-medium">{training.metrics.loss}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Validation Accuracy:</span>
                          <p className="font-medium">{training.metrics.validationAccuracy}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Training Datasets</h3>
              <p className="text-sm text-muted-foreground">
                Manage datasets for model training and evaluation
              </p>
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Dataset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelDatasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dataset.name}</CardTitle>
                    <Badge className={dataset.isUsed ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                      {dataset.isUsed ? 'In Use' : 'Unused'}
                    </Badge>
                  </div>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium">{dataset.size} GB</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Records:</span>
                      <p className="font-medium">{dataset.records.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Features:</span>
                      <p className="font-medium">{dataset.features}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <p className="font-medium">{dataset.format.toUpperCase()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Quality:</span>
                    <Badge className={`ml-2 ${
                      dataset.quality === 'excellent' ? 'bg-green-50 text-green-600' :
                      dataset.quality === 'good' ? 'bg-blue-50 text-blue-600' :
                      dataset.quality === 'fair' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {dataset.quality}
                    </Badge>
                  </div>

                  {dataset.usedBy.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Used by:</span>
                      <div className="mt-1">
                        {dataset.usedBy.map((model, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Model Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring of deployed models
              </p>
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Real-time accuracy and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Performance charts would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  CPU, memory, and GPU usage for model inference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>CPU Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Memory Usage</span>
                    <span className="font-medium">8.2 GB / 16 GB</span>
                  </div>
                  <Progress value={51} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>GPU Usage</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveModelsPage;
