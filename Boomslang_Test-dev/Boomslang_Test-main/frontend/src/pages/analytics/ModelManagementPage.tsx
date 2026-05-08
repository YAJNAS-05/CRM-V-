import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Brain, 
  Play, 
  Pause, 
  StopCircle,
  Download,
  Upload,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Database,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { PredictiveModel, ModelType, ModelStatus, DeploymentStatus } from '@/types/analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { analyticsApi } from '../../api/analyticsApi';

const ModelManagementPage: React.FC = () => {
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  // Load models from API on component mount
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        const modelsData = await analyticsApi.getModels();
        if (modelsData) {
          setModels(modelsData);
          uniqueness: 0.89,
          missingValues: 0.05,
          duplicates: 0.02,
          outliers: 0.03
        }
      },
      hyperparameters: {
        learningRate: 0.001,
        maxDepth: 6,
        nEstimators: 100,
        randomState: 42
      },
      features: [
        { name: 'usage_frequency', type: 'NUMERIC', importance: 0.25, description: 'How often customer uses the platform' },
        { name: 'support_tickets', type: 'NUMERIC', importance: 0.18, description: 'Number of support tickets raised' },
        { name: 'subscription_tier', type: 'CATEGORICAL', importance: 0.15, description: 'Customer subscription level' }
      ],
      targetVariable: 'churn_probability',
      deploymentStatus: 'DEPLOYED',
      version: 'v2.1.0',
      tags: ['production', 'customer-success', 'high-priority'],
      owner: 'data-science-team'
    },
    {
      id: '2',
      name: 'Sales Forecasting Model',
      description: 'Time series forecasting for quarterly sales predictions',
      type: 'TIME_SERIES',
      status: 'TRAINING',
      accuracy: 0.0,
      precision: 0.0,
      recall: 0.0,
      f1Score: 0.0,
      createdAt: new Date('2024-01-19T09:00:00'),
      updatedAt: new Date('2024-01-20T11:30:00'),
      trainingData: {
        source: 'sales_history',
        rows: 1200,
        columns: 12,
        trainingSplit: 0.8,
        validationSplit: 0.1,
        testSplit: 0.1,
        lastUpdated: new Date('2024-01-19T09:00:00'),
        dataQuality: {
          completeness: 0.98,
          accuracy: 0.99,
          consistency: 0.95,
          validity: 0.97,
          uniqueness: 0.92,
          missingValues: 0.02,
          duplicates: 0.01,
          outliers: 0.04
        }
      },
      hyperparameters: {
        seasonalPeriods: [12, 4],
        trend: 'additive',
        seasonal: 'multiplicative'
      },
      features: [
        { name: 'historical_sales', type: 'NUMERIC', importance: 0.45, description: 'Past sales data' },
        { name: 'seasonal_factors', type: 'NUMERIC', importance: 0.30, description: 'Seasonal indicators' }
      ],
      targetVariable: 'sales_amount',
      deploymentStatus: 'NOT_DEPLOYED',
      version: 'v1.0.0',
      tags: ['forecasting', 'sales', 'time-series'],
      owner: 'analytics-team'
    },
    {
      id: '3',
      name: 'Lead Scoring Model',
      description: 'ML model to score leads based on conversion probability',
      type: 'CLASSIFICATION',
      status: 'TRAINED',
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.88,
      f1Score: 0.86,
      createdAt: new Date('2024-01-10T14:00:00'),
      updatedAt: new Date('2024-01-17T10:15:00'),
      trainedAt: new Date('2024-01-16T15:30:00'),
      lastUsed: new Date('2024-01-19T09:45:00'),
      trainingData: {
        source: 'lead_data',
        rows: 25000,
        columns: 32,
        trainingSplit: 0.7,
        validationSplit: 0.15,
        testSplit: 0.15,
        lastUpdated: new Date('2024-01-16T15:30:00'),
        dataQuality: {
          completeness: 0.91,
          accuracy: 0.94,
          consistency: 0.88,
          validity: 0.92,
          uniqueness: 0.85,
          missingValues: 0.09,
          duplicates: 0.03,
          outliers: 0.05
        }
      },
      hyperparameters: {
        maxDepth: 5,
        minSamplesSplit: 10,
        minSamplesLeaf: 5,
        nEstimators: 200
      },
      features: [
        { name: 'lead_source', type: 'CATEGORICAL', importance: 0.22, description: 'Source of the lead' },
        { name: 'company_size', type: 'CATEGORICAL', importance: 0.19, description: 'Size of prospect company' },
        { name: 'engagement_score', type: 'NUMERIC', importance: 0.28, description: 'Lead engagement metrics' }
      ],
      targetVariable: 'conversion_probability',
      deploymentStatus: 'DEPLOYING',
      version: 'v1.3.0',
      tags: ['sales', 'lead-management', 'ml'],
      owner: 'sales-analytics-team'
    },
    {
      id: '4',
      name: 'Anomaly Detection System',
      description: 'Detects anomalies in system usage and security events',
      type: 'ANOMALY_DETECTION',
      status: 'FAILED',
      accuracy: 0.0,
      precision: 0.0,
      recall: 0.0,
      f1Score: 0.0,
      createdAt: new Date('2024-01-18T11:00:00'),
      updatedAt: new Date('2024-01-20T08:45:00'),
      trainingData: {
        source: 'system_logs',
        rows: 100000,
        columns: 28,
        trainingSplit: 0.8,
        validationSplit: 0.1,
        testSplit: 0.1,
        lastUpdated: new Date('2024-01-18T11:00:00'),
        dataQuality: {
          completeness: 0.88,
          accuracy: 0.91,
          consistency: 0.85,
          validity: 0.89,
          uniqueness: 0.82,
          missingValues: 0.12,
          duplicates: 0.06,
          outliers: 0.08
        }
      },
      hyperparameters: {
        contamination: 0.1,
        nNeighbors: 20,
        algorithm: 'auto'
      },
      features: [
        { name: 'login_frequency', type: 'NUMERIC', importance: 0.31, description: 'Frequency of user logins' },
        { name: 'error_rate', type: 'NUMERIC', importance: 0.24, description: 'System error rate' }
      ],
      targetVariable: 'anomaly_score',
      deploymentStatus: 'NOT_DEPLOYED',
      version: 'v0.9.0',
      tags: ['security', 'monitoring', 'anomaly'],
      owner: 'security-team'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<PredictiveModel | null>(null);
  const [filterType, setFilterType] = useState<ModelType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ModelStatus | 'ALL'>('ALL');
  const [filterDeployment, setFilterDeployment] = useState<DeploymentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleDeployModel = async (modelId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to deploy model
      await analyticsApi.deployModel(modelId);
      
      setModels(models.map(model => 
        model.id === modelId 
          ? { ...model, deploymentStatus: 'DEPLOYING', status: 'DEPLOYED' }
          : model
      ));
      toast.success('Model deployment started');
    } catch (error) {
      console.error('Failed to deploy model:', error);
      toast.error('Failed to deploy model');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrainModel = async (modelId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to retrain model
      await analyticsApi.retrainModel(modelId);
      
      setModels(models.map(model => 
        model.id === modelId 
          ? { ...model, status: 'TRAINING', deploymentStatus: 'NOT_DEPLOYED' }
          : model
      ));
      toast.success('Model retraining started');
    } catch (error) {
      console.error('Failed to retrain model:', error);
      toast.error('Failed to retrain model');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTraining = async (modelId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to stop training
      await analyticsApi.stopTraining(modelId);
      
      setModels(models.map(model => 
        model.id === modelId 
          ? { ...model, status: 'FAILED' }
          : model
      ));
      toast.success('Model training stopped');
    } catch (error) {
      console.error('Failed to stop model training:', error);
      toast.error('Failed to stop model training');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to delete model
      await analyticsApi.deleteModel(modelId);
      
      setModels(models.filter(model => model.id !== modelId));
      toast.success('Model deleted successfully');
    } catch (error) {
      console.error('Failed to delete model:', error);
      toast.error('Failed to delete model');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: ModelType) => {
    switch (type) {
      case 'CLASSIFICATION': return <Target className="h-5 w-5" />;
      case 'REGRESSION': return <TrendingUp className="h-5 w-5" />;
      case 'TIME_SERIES': return <Clock className="h-5 w-5" />;
      case 'ANOMALY_DETECTION': return <AlertTriangle className="h-5 w-5" />;
      case 'CLUSTERING': return <Database className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: ModelStatus) => {
    switch (status) {
      case 'DEPLOYED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'TRAINING': return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'TRAINED': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'DEPLOYING': return <RefreshCw className="h-5 w-5 text-orange-600 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ModelStatus) => {
    switch (status) {
      case 'DEPLOYED': return 'bg-green-100 text-green-800';
      case 'TRAINING': return 'bg-blue-100 text-blue-800';
      case 'TRAINED': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'DEPLOYING': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeploymentColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'DEPLOYED': return 'bg-green-100 text-green-800';
      case 'DEPLOYING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || model.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || model.status === filterStatus;
    const matchesDeployment = filterDeployment === 'ALL' || model.deploymentStatus === filterDeployment;
    
    return matchesSearch && matchesType && matchesStatus && matchesDeployment;
  });

  const deployedModels = models.filter(m => m.deploymentStatus === 'DEPLOYED');
  const trainingModels = models.filter(m => m.status === 'TRAINING');
  const failedModels = models.filter(m => m.status === 'FAILED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Management</h1>
          <p className="text-gray-600">Manage, train, and deploy machine learning models</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Import Model
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-1" />
            Create Model
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-sm text-gray-600">Total Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deployedModels.length}</p>
                <p className="text-sm text-gray-600">Deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainingModels.length}</p>
                <p className="text-sm text-gray-600">Training</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{failedModels.length}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search models by name, description, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="CLASSIFICATION">Classification</option>
                <option value="REGRESSION">Regression</option>
                <option value="TIME_SERIES">Time Series</option>
                <option value="ANOMALY_DETECTION">Anomaly Detection</option>
                <option value="CLUSTERING">Clustering</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="TRAINED">Trained</option>
                <option value="TRAINING">Training</option>
                <option value="DEPLOYED">Deployed</option>
                <option value="FAILED">Failed</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterDeployment}
                onChange={(e) => setFilterDeployment(e.target.value as any)}
              >
                <option value="ALL">All Deployments</option>
                <option value="DEPLOYED">Deployed</option>
                <option value="DEPLOYING">Deploying</option>
                <option value="NOT_DEPLOYED">Not Deployed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No models found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredModels.map(model => (
            <Card key={model.id} className={model.status === 'FAILED' ? 'border-red-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      model.status === 'DEPLOYED' ? 'bg-green-100' : 
                      model.status === 'TRAINING' ? 'bg-blue-100' : 
                      model.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getTypeIcon(model.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(model.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getDeploymentColor(model.deploymentStatus)}>
                        {model.deploymentStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{model.version}</span>
                  </div>

                  {model.status === 'TRAINED' || model.status === 'DEPLOYED' ? (
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                        <p className="text-gray-600">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{(model.precision * 100).toFixed(1)}%</p>
                        <p className="text-gray-600">Precision</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{(model.recall * 100).toFixed(1)}%</p>
                        <p className="text-gray-600">Recall</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{(model.f1Score * 100).toFixed(1)}%</p>
                        <p className="text-gray-600">F1 Score</p>
                      </div>
                    </div>
                  ) : model.status === 'TRAINING' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Training Progress</span>
                        <span className="text-sm">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Owner: {model.owner}</span>
                    <span>
                      {model.trainedAt 
                        ? `Trained: ${formatDistanceToNow(model.trainedAt, { addSuffix: true })}`
                        : `Created: ${formatDistanceToNow(model.createdAt, { addSuffix: true })}`
                      }
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {model.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {model.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{model.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedModel(model);
                        setDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {model.status === 'TRAINED' && model.deploymentStatus === 'NOT_DEPLOYED' && (
                      <Button
                        size="sm"
                        onClick={() => handleDeployModel(model.id)}
                        disabled={loading}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                    )}
                    {model.status === 'TRAINING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStopTraining(model.id)}
                        disabled={loading}
                      >
                        <StopCircle className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    )}
                    {(model.status === 'TRAINED' || model.status === 'DEPLOYED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetrainModel(model.id)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retrain
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Model Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Model Name</Label>
                  <p className="font-medium">{selectedModel.name}</p>
                </div>
                <div>
                  <Label>Model Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(selectedModel.type)}
                    <span className="font-medium">{selectedModel.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedModel.status)}>
                    {selectedModel.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Deployment Status</Label>
                  <Badge className={getDeploymentColor(selectedModel.deploymentStatus)}>
                    {selectedModel.deploymentStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="font-medium">{selectedModel.description}</p>
              </div>

              {selectedModel.status === 'TRAINED' || selectedModel.status === 'DEPLOYED' ? (
                <div>
                  <Label>Performance Metrics</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {(selectedModel.accuracy * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {(selectedModel.precision * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Precision</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {(selectedModel.recall * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Recall</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {(selectedModel.f1Score * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">F1 Score</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <Label>Training Data</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <span className="ml-2 font-medium">{selectedModel.trainingData.source}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rows:</span>
                      <span className="ml-2 font-medium">{selectedModel.trainingData.rows.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Columns:</span>
                      <span className="ml-2 font-medium">{selectedModel.trainingData.columns}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">Data Quality:</span>
                    <div className="mt-1 grid grid-cols-4 gap-2">
                      <div className="text-xs">
                        <span>Completeness:</span>
                        <span className="ml-1 font-medium">{(selectedModel.trainingData.dataQuality.completeness * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs">
                        <span>Accuracy:</span>
                        <span className="ml-1 font-medium">{(selectedModel.trainingData.dataQuality.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs">
                        <span>Missing Values:</span>
                        <span className="ml-1 font-medium">{(selectedModel.trainingData.dataQuality.missingValues * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs">
                        <span>Duplicates:</span>
                        <span className="ml-1 font-medium">{(selectedModel.trainingData.dataQuality.duplicates * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Top Features</Label>
                <div className="mt-2 space-y-2">
                  {selectedModel.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                        <Progress value={feature.importance * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Model
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Metrics
                </Button>
                {selectedModel.status === 'TRAINED' && selectedModel.deploymentStatus === 'NOT_DEPLOYED' && (
                  <Button onClick={() => handleDeployModel(selectedModel.id)} disabled={loading}>
                    <Zap className="h-4 w-4 mr-1" />
                    Deploy Model
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelManagementPage;
