import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Database,
  Cpu,
  HardDrive,
  Eye,
  Download,
  Upload,
  Plus,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Terminal,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface TrainingJob {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  progress: number;
  startedAt: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: string;
  dataset: string;
  algorithm: string;
  hyperparameters: Record<string, any>;
  metrics?: {
    accuracy?: number;
    loss?: number;
    validationAccuracy?: number;
    validationLoss?: number;
    epochs?: number;
  };
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
    storage: number;
  };
  logs: string[];
  errors?: string[];
  checkpoints: string[];
  artifacts: string[];
}

interface TrainingTemplate {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  defaultHyperparameters: Record<string, any>;
  resourceRequirements: {
    cpu: number;
    memory: number;
    gpu: boolean;
  };
  estimatedDuration: number;
  category: 'classification' | 'regression' | 'clustering' | 'time-series' | 'deep-learning';
}

interface TrainingQueue {
  position: number;
  jobId: string;
  jobName: string;
  estimatedWaitTime: number;
  priority: string;
}

const ModelTrainingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Load training jobs from API on component mount
  useEffect(() => {
    const loadTrainingJobs = async () => {
      setLoading(true);
      try {
        const trainingJobsData = await analyticsApi.getTrainingJobs();
        if (trainingJobsData) {
          setTrainingJobs(trainingJobsData);
        }
      } catch (error) {
        console.error('Failed to load training jobs:', error);
        toast.error('Failed to load training jobs');
      } finally {
        setLoading(false);
      }
    };
    loadTrainingJobs();
  }, []);
        'checkpoint_50.ckpt',
        'checkpoint_67.ckpt'
      ],
      artifacts: []
    },
    {
      id: 'job-2',
      name: 'Customer Churn Prediction Retraining',
      modelId: 'model-1',
      modelName: 'Customer Churn Prediction',
      status: 'completed',
      progress: 100,
      startedAt: '2024-01-12 09:00:00',
      completedAt: '2024-01-12 11:45:00',
      actualDuration: 165,
      priority: 'medium',
      submittedBy: 'ML Engineer',
      dataset: 'customer_behavior_2024',
      algorithm: 'Random Forest',
      hyperparameters: {
        n_estimators: 200,
        max_depth: 10,
        min_samples_split: 5,
        min_samples_leaf: 2,
        random_state: 42
      },
      metrics: {
        accuracy: 92.5,
        loss: 0.2134,
        validationAccuracy: 91.2,
        validationLoss: 0.2456,
        epochs: 100
      },
      resources: {
        cpu: 45,
        memory: 8,
        gpu: 0,
        storage: 15
      },
      logs: [
        '[2024-01-12 09:00:00] Training job started',
        '[2024-01-12 11:45:00] Training completed successfully',
        '[2024-01-12 11:45:15] Model saved to registry'
      ],
      checkpoints: [
        'final_model.pkl'
      ],
      artifacts: [
        'training_report.pdf',
        'confusion_matrix.png',
        'feature_importance.csv'
      ]
    },
    {
      id: 'job-3',
      name: 'Sales Forecasting LSTM',
      modelId: 'model-2',
      modelName: 'Sales Forecasting',
      status: 'failed',
      progress: 35,
      startedAt: '2024-01-14 16:00:00',
      completedAt: '2024-01-14 18:30:00',
      actualDuration: 150,
      priority: 'low',
      submittedBy: 'Data Analyst',
      dataset: 'sales_history_2023_2024',
      algorithm: 'LSTM',
      hyperparameters: {
        units: 128,
        dropout: 0.2,
        epochs: 100,
        batch_size: 32,
        learning_rate: 0.001
      },
      resources: {
        cpu: 60,
        memory: 10,
        gpu: 75,
        storage: 20
      },
      logs: [
        '[2024-01-14 16:00:00] Training job started',
        '[2024-01-14 16:15:00] Loading dataset...',
        '[2024-01-14 16:30:00] Building LSTM model...',
        '[2024-01-14 17:00:00] Starting training...',
        '[2024-01-14 18:15:00] Epoch 35/100 - Loss: 0.3421',
        '[2024-01-14 18:30:00] ERROR: CUDA out of memory'
      ],
      errors: [
        'CUDA out of memory. Try reducing batch size or model size.'
      ],
      checkpoints: [
        'checkpoint_35.ckpt'
      ],
      artifacts: []
    },
    {
      id: 'job-4',
      name: 'Lead Scoring Model Update',
      modelId: 'model-4',
      modelName: 'Lead Scoring',
      status: 'queued',
      progress: 0,
      startedAt: '',
      estimatedDuration: 90,
      priority: 'medium',
      submittedBy: 'Marketing Team',
      dataset: 'lead_data_2024',
      algorithm: 'Gradient Boosting',
      hyperparameters: {
        n_estimators: 150,
        learning_rate: 0.1,
        max_depth: 6,
        subsample: 0.8
      },
      resources: {
        cpu: 40,
        memory: 6,
        gpu: 0,
        storage: 10
      },
      logs: [],
      checkpoints: [],
      artifacts: []
    }
  ];

  const trainingTemplates: TrainingTemplate[] = [
    {
      id: 'template-1',
      name: 'Random Forest Classification',
      description: 'Robust classification model using ensemble of decision trees',
      algorithm: 'Random Forest',
      defaultHyperparameters: {
        n_estimators: 100,
        max_depth: 10,
        min_samples_split: 5,
        random_state: 42
      },
      resourceRequirements: {
        cpu: 50,
        memory: 8,
        gpu: false
      },
      estimatedDuration: 60,
      category: 'classification'
    },
    {
      id: 'template-2',
      name: 'LSTM Time Series',
      description: 'Deep learning model for time series forecasting',
      algorithm: 'LSTM',
      defaultHyperparameters: {
        units: 128,
        dropout: 0.2,
        epochs: 100,
        batch_size: 32
      },
      resourceRequirements: {
        cpu: 60,
        memory: 12,
        gpu: true
      },
      estimatedDuration: 180,
      category: 'time-series'
    },
    {
      id: 'template-3',
      name: 'Isolation Forest Anomaly Detection',
      description: 'Unsupervised anomaly detection algorithm',
      algorithm: 'Isolation Forest',
      defaultHyperparameters: {
        n_estimators: 100,
        contamination: 0.1,
        random_state: 42
      },
      resourceRequirements: {
        cpu: 70,
        memory: 10,
        gpu: false
      },
      estimatedDuration: 120,
      category: 'deep-learning'
    }
  ];

  const trainingQueue: TrainingQueue[] = [
    {
      position: 1,
      jobId: 'job-4',
      jobName: 'Lead Scoring Model Update',
      estimatedWaitTime: 15,
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'queued':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      case 'paused':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredJobs = trainingJobs.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedJobData = trainingJobs.find(j => j.id === selectedJob);

  const totalJobs = trainingJobs.length;
  const runningJobs = trainingJobs.filter(j => j.status === 'running').length;
  const completedJobs = trainingJobs.filter(j => j.status === 'completed').length;
  const failedJobs = trainingJobs.filter(j => j.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Training</h1>
          <p className="text-muted-foreground">
            Manage and monitor machine learning model training jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Job
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Training Job
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              training jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningJobs}</div>
            <p className="text-xs text-muted-foreground">
              currently training
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedJobs}</div>
            <p className="text-xs text-muted-foreground">
              failed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Training Alert */}
      {runningJobs > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{runningJobs} training jobs</strong> are currently running. 
            Monitor progress and resource usage in the Jobs tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Training Jobs</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Training Jobs</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage model training jobs
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search jobs..."
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
            {/* Jobs List */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id}
                  className={`cursor-pointer transition-colors ${
                    selectedJob === job.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(job.status)}`}>
                          {job.status === 'running' ? <Play className="w-4 h-4" /> :
                           job.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                           job.status === 'failed' ? <AlertTriangle className="w-4 h-4" /> :
                           job.status === 'queued' ? <Clock className="w-4 h-4" /> :
                           <Pause className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{job.name}</CardTitle>
                          <CardDescription>
                            {job.modelName} • {job.algorithm}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.status === 'running' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Submitted by:</span>
                        <p className="font-medium">{job.submittedBy}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <p className="font-medium">{job.startedAt || 'Not started'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">
                          {job.actualDuration ? `${job.actualDuration} min` : 
                           job.estimatedDuration ? `Est. ${job.estimatedDuration} min` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dataset:</span>
                        <p className="font-medium">{job.dataset}</p>
                      </div>
                    </div>

                    {job.metrics && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>
                          <p className="font-medium">{job.metrics.accuracy}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Loss:</span>
                          <p className="font-medium">{job.metrics.loss}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {job.status === 'running' && (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Job Details */}
            <div>
              {selectedJobData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedJobData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {selectedJobData.modelName} • {selectedJobData.algorithm}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Job Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedJobData.status)}>
                              {selectedJobData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <Badge className={getPriorityColor(selectedJobData.priority)}>
                              {selectedJobData.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Submitted by:</span>
                            <span className="font-medium">{selectedJobData.submittedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Started at:</span>
                            <span className="font-medium">{selectedJobData.startedAt || 'Not started'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Resource Usage</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CPU:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedJobData.resources.cpu} className="h-2 w-16" />
                              <span>{selectedJobData.resources.cpu}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="font-medium">{selectedJobData.resources.memory} GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GPU:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={selectedJobData.resources.gpu} className="h-2 w-16" />
                              <span>{selectedJobData.resources.gpu}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Storage:</span>
                            <span className="font-medium">{selectedJobData.resources.storage} GB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedJobData.progress > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Training Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{selectedJobData.progress}%</span>
                          </div>
                          <Progress value={selectedJobData.progress} className="h-3" />
                        </div>
                      </div>
                    )}

                    {selectedJobData.metrics && (
                      <div>
                        <h4 className="font-medium mb-2">Training Metrics</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Accuracy:</span>
                            <span className="font-medium">{selectedJobData.metrics.accuracy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Loss:</span>
                            <span className="font-medium">{selectedJobData.metrics.loss}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Validation Accuracy:</span>
                            <span className="font-medium">{selectedJobData.metrics.validationAccuracy}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Validation Loss:</span>
                            <span className="font-medium">{selectedJobData.metrics.validationLoss}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedJobData.hyperparameters && (
                      <div>
                        <h4 className="font-medium mb-2">Hyperparameters</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(selectedJobData.hyperparameters, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {selectedJobData.logs.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent Logs</h4>
                        <div className="bg-muted p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                          {selectedJobData.logs.slice(-5).map((log, index) => (
                            <div key={index}>{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedJobData.errors && selectedJobData.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                        <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                          {selectedJobData.errors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedJobData.status === 'running' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                          <Button size="sm" variant="outline">
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}
                      {selectedJobData.status === 'failed' && (
                        <Button size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      {selectedJobData.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download Model
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a training job to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Training Queue</h3>
              <p className="text-sm text-muted-foreground">
                View and manage queued training jobs
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Queue Settings
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Position</th>
                      <th className="text-left p-4 font-medium">Job Name</th>
                      <th className="text-left p-4 font-medium">Priority</th>
                      <th className="text-left p-4 font-medium">Estimated Wait</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingQueue.map((item) => (
                      <tr key={item.jobId} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <Badge className="bg-blue-50 text-blue-600">
                            #{item.position}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">{item.jobName}</td>
                        <td className="p-4">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{item.estimatedWaitTime} min</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Square className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Training Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-configured templates for common ML tasks
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className="bg-purple-50 text-purple-600">
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Algorithm:</span>
                      <p className="font-medium">{template.algorithm}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{template.estimatedDuration} min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPU:</span>
                      <p className="font-medium">{template.resourceRequirements.cpu}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory:</span>
                      <p className="font-medium">{template.resourceRequirements.memory} GB</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Default Parameters:</span>
                    <div className="bg-muted p-2 rounded text-xs mt-1">
                      {Object.entries(template.defaultHyperparameters).slice(0, 3).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                      {Object.keys(template.defaultHyperparameters).length > 3 && (
                        <div className="text-muted-foreground">+{Object.keys(template.defaultHyperparameters).length - 3} more</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Resource Usage</h3>
              <p className="text-sm text-muted-foreground">
                Monitor training cluster resource utilization
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Cluster Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cluster Resources</CardTitle>
                <CardDescription>
                  Overall resource utilization across training cluster
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">13 of 20 cores used</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Memory Usage
                    </span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">57.6 GB of 80 GB used</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      GPU Usage
                    </span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">2 of 4 GPUs used</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Storage Usage
                    </span>
                    <span className="font-medium">38%</span>
                  </div>
                  <Progress value={38} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">380 GB of 1 TB used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>
                  Current resource allocation by training jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingJobs.filter(j => j.status === 'running').map((job) => (
                    <div key={job.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{job.name}</span>
                        <Badge className="bg-blue-50 text-blue-600">
                          {job.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{job.resources.cpu}%</div>
                          <div className="text-muted-foreground">CPU</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.resources.memory}GB</div>
                          <div className="text-muted-foreground">Memory</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.resources.gpu}%</div>
                          <div className="text-muted-foreground">GPU</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.resources.storage}GB</div>
                          <div className="text-muted-foreground">Storage</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelTrainingPage;
