import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  FlaskConical, 
  Play, 
  Pause,
  StopCircle,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Zap,
  Brain,
  Filter
} from 'lucide-react';
import { ModelExperiment, ExperimentStatus, ExperimentModel, ModelMetrics } from '@/types/analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { analyticsApi } from '../../api/analyticsApi';

const ModelExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ModelExperiment[]>([]);
  const [loading, setLoading] = useState(false);

  // Load experiments from API on component mount
  useEffect(() => {
    const loadExperiments = async () => {
      setLoading(true);
      try {
        const experimentsData = await analyticsApi.getExperiments();
        if (experimentsData) {
          setExperiments(experimentsData);
        }
      } catch (error) {
        console.error('Failed to load experiments:', error);
        toast.error('Failed to load experiments');
      } finally {
        setLoading(false);
      }
    };
    loadExperiments();
  }, []);

  const [selectedExperiment, setSelectedExperiment] = useState<ModelExperiment | null>(null);
  const [newExperimentDialog, setNewExperimentDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ExperimentStatus | 'ALL'>('ALL');
  
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    objective: 'Maximize Accuracy',
    dataset: '',
    searchMethod: 'BAYESIAN_OPTIMIZATION',
    maxIterations: 50,
    parallelTrials: 3
  });

  const handleCreateExperiment = async () => {
    if (!newExperiment.name || !newExperiment.dataset) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use real analyticsApi to create experiment
      const experiment = await analyticsApi.createExperiment(newExperiment);
      
      setExperiments([experiment, ...experiments]);
      setNewExperimentDialog(false);
      setNewExperiment({
        name: '',
        description: '',
        objective: 'Maximize Accuracy',
        dataset: '',
        searchMethod: 'BAYESIAN_OPTIMIZATION',
        maxIterations: 50,
        parallelTrials: 3
      });
      toast.success('Experiment created successfully');
    } catch (error) {
      console.error('Failed to create experiment:', error);
      toast.error('Failed to create experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExperiment = async (experimentId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to start experiment
      await analyticsApi.startExperiment(experimentId);
      
      setExperiments(experiments.map(exp => 
        exp.id === experimentId 
          ? { ...exp, status: 'RUNNING' as ExperimentStatus }
          : exp
      ));
      toast.success('Experiment started successfully');
    } catch (error) {
      console.error('Failed to start experiment:', error);
      toast.error('Failed to start experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleStopExperiment = async (experimentId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to stop experiment
      await analyticsApi.stopExperiment(experimentId);
      
      setExperiments(experiments.map(exp => 
        exp.id === experimentId 
          ? { ...exp, status: 'CANCELLED', completedAt: new Date() }
          : exp
      ));
      toast.success('Experiment stopped successfully');
    } catch (error) {
      console.error('Failed to stop experiment:', error);
      toast.error('Failed to stop experiment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperiment = async (experimentId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to delete experiment
      await analyticsApi.deleteExperiment(experimentId);
      
      setExperiments(experiments.filter(exp => exp.id !== experimentId));
      toast.success('Experiment deleted successfully');
    } catch (error) {
      console.error('Failed to delete experiment:', error);
      toast.error('Failed to delete experiment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ExperimentStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'RUNNING': return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'CANCELLED': return <StopCircle className="h-5 w-5 text-gray-600" />;
      case 'DRAFT': return <Clock className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ExperimentStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSearchMethodColor = (method: string) => {
    switch (method) {
      case 'BAYESIAN_OPTIMIZATION': return 'bg-purple-100 text-purple-800';
      case 'GRID_SEARCH': return 'bg-blue-100 text-blue-800';
      case 'RANDOM_SEARCH': return 'bg-green-100 text-green-800';
      case 'GENETIC_ALGORITHM': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExperiments = experiments.filter(exp => 
    filterStatus === 'ALL' || exp.status === filterStatus
  );

  const completedExperiments = experiments.filter(exp => exp.status === 'COMPLETED');
  const runningExperiments = experiments.filter(exp => exp.status === 'RUNNING');
  const failedExperiments = experiments.filter(exp => exp.status === 'FAILED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Experiments</h1>
          <p className="text-gray-600">Run and manage machine learning experiments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={newExperimentDialog} onOpenChange={setNewExperimentDialog}>
            <DialogTrigger asChild>
              <Button>
                <FlaskConical className="h-4 w-4 mr-1" />
                Create Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Experiment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Experiment Name</Label>
                  <Input
                    placeholder="Enter experiment name"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({...newExperiment, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Describe your experiment"
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment({...newExperiment, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Objective</Label>
                    <Select value={newExperiment.objective} onValueChange={(value) => setNewExperiment({...newExperiment, objective: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maximize Accuracy">Maximize Accuracy</SelectItem>
                        <SelectItem value="Maximize F1 Score">Maximize F1 Score</SelectItem>
                        <SelectItem value="Minimize MAE">Minimize MAE</SelectItem>
                        <SelectItem value="Minimize MSE">Minimize MSE</SelectItem>
                        <SelectItem value="Maximize R²">Maximize R²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dataset</Label>
                    <Select value={newExperiment.dataset} onValueChange={(value) => setNewExperiment({...newExperiment, dataset: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_churn_dataset_v3">Customer Churn Dataset v3</SelectItem>
                        <SelectItem value="sales_history_2020_2023">Sales History 2020-2023</SelectItem>
                        <SelectItem value="lead_scoring_dataset">Lead Scoring Dataset</SelectItem>
                        <SelectItem value="user_behavior_logs">User Behavior Logs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Search Method</Label>
                    <Select value={newExperiment.searchMethod} onValueChange={(value: any) => setNewExperiment({...newExperiment, searchMethod: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAYESIAN_OPTIMIZATION">Bayesian Optimization</SelectItem>
                        <SelectItem value="GRID_SEARCH">Grid Search</SelectItem>
                        <SelectItem value="RANDOM_SEARCH">Random Search</SelectItem>
                        <SelectItem value="GENETIC_ALGORITHM">Genetic Algorithm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Iterations</Label>
                    <Input
                      type="number"
                      value={newExperiment.maxIterations}
                      onChange={(e) => setNewExperiment({...newExperiment, maxIterations: parseInt(e.target.value)})}
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
                <div>
                  <Label>Parallel Trials</Label>
                  <Input
                    type="number"
                    value={newExperiment.parallelTrials}
                    onChange={(e) => setNewExperiment({...newExperiment, parallelTrials: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setNewExperimentDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateExperiment} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Experiment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FlaskConical className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{experiments.length}</p>
                <p className="text-sm text-gray-600">Total Experiments</p>
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
                <p className="text-2xl font-bold">{completedExperiments.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
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
                <p className="text-2xl font-bold">{runningExperiments.length}</p>
                <p className="text-sm text-gray-600">Running</p>
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
                <p className="text-2xl font-bold">{failedExperiments.length}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Experiments List */}
      <div className="space-y-4">
        {filteredExperiments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <FlaskConical className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No experiments found</p>
              <p className="text-sm">Create your first experiment to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredExperiments.map(experiment => (
            <Card key={experiment.id} className={
              experiment.status === 'FAILED' ? 'border-red-200' : 
              experiment.status === 'RUNNING' ? 'border-blue-200' : ''
            }>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      experiment.status === 'COMPLETED' ? 'bg-green-100' : 
                      experiment.status === 'RUNNING' ? 'bg-blue-100' : 
                      experiment.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(experiment.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
                      <p className="text-sm text-gray-600">{experiment.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(experiment.status)}>
                      {experiment.status}
                    </Badge>
                    <Badge className={getSearchMethodColor(experiment.parameters.searchMethod)}>
                      {experiment.parameters.searchMethod.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Experiment Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">
                      {experiment.metrics.bestScore > 1 
                        ? experiment.metrics.bestScore.toFixed(0)
                        : (experiment.metrics.bestScore * 100).toFixed(1) + '%'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Best Score</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{experiment.results.totalTrials}</p>
                    <p className="text-sm text-gray-600">Total Trials</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{experiment.results.successfulTrials}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{experiment.models.length}</p>
                    <p className="text-sm text-gray-600">Models</p>
                  </div>
                </div>

                {/* Top Models */}
                {experiment.models.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Models</h4>
                    <div className="space-y-2">
                      {experiment.models.slice(0, 3).map((model, index) => (
                        <div key={model.modelId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">#{model.rank}</span>
                            <span className="text-sm">{model.modelName}</span>
                            <Badge variant="outline" className="text-xs">
                              {model.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {model.metrics.accuracy 
                                ? `${(model.metrics.accuracy * 100).toFixed(1)}%`
                                : model.metrics.mae 
                                  ? `MAE: ${model.metrics.mae.toLocaleString()}`
                                  : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress for running experiments */}
                {experiment.status === 'RUNNING' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Dataset: {experiment.dataset}</span>
                  <span>
                    {experiment.status === 'COMPLETED' && experiment.completedAt
                      ? `Completed: ${formatDistanceToNow(experiment.completedAt, { addSuffix: true })}`
                      : `Created: ${formatDistanceToNow(experiment.createdAt, { addSuffix: true })}`
                    }
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedExperiment(experiment);
                      setDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {experiment.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartExperiment(experiment.id)}
                      disabled={loading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {experiment.status === 'RUNNING' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStopExperiment(experiment.id)}
                      disabled={loading}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExperiment(experiment.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Experiment Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Experiment Details</DialogTitle>
          </DialogHeader>
          {selectedExperiment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experiment Name</Label>
                  <p className="font-medium">{selectedExperiment.name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedExperiment.status)}>
                    {selectedExperiment.status}
                  </Badge>
                </div>
                <div>
                  <Label>Objective</Label>
                  <p className="font-medium">{selectedExperiment.objective}</p>
                </div>
                <div>
                  <Label>Dataset</Label>
                  <p className="font-medium">{selectedExperiment.dataset}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="font-medium">{selectedExperiment.description}</p>
              </div>

              {/* Experiment Results */}
              <div>
                <Label>Results Summary</Label>
                <div className="mt-2 grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedExperiment.metrics.bestScore > 1 
                        ? selectedExperiment.metrics.bestScore.toFixed(0)
                        : (selectedExperiment.metrics.bestScore * 100).toFixed(1) + '%'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Best Score</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedExperiment.results.totalTrials}
                    </p>
                    <p className="text-sm text-gray-600">Total Trials</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedExperiment.results.successfulTrials}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedExperiment.results.failedTrials}
                    </p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
              </div>

              {/* Models Table */}
              <div>
                <Label>Model Performance</Label>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Rank</th>
                        <th className="px-4 py-2 text-left">Model Name</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-right">Accuracy</th>
                        <th className="px-4 py-2 text-right">Precision</th>
                        <th className="px-4 py-2 text-right">Recall</th>
                        <th className="px-4 py-2 text-right">F1 Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExperiment.models.map((model) => (
                        <tr key={model.modelId} className="border-b">
                          <td className="px-4 py-2 font-medium">#{model.rank}</td>
                          <td className="px-4 py-2">{model.modelName}</td>
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-xs">
                              {model.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {model.metrics.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {model.metrics.precision ? `${(model.metrics.precision * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {model.metrics.recall ? `${(model.metrics.recall * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {model.metrics.f1Score ? `${(model.metrics.f1Score * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Hyperparameters */}
              {Object.keys(selectedExperiment.results.bestHyperparameters).length > 0 && (
                <div>
                  <Label>Best Hyperparameters</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedExperiment.results.bestHyperparameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Feature Importance */}
              {selectedExperiment.results.featureImportance.length > 0 && (
                <div>
                  <Label>Feature Importance</Label>
                  <div className="mt-2 space-y-2">
                    {selectedExperiment.results.featureImportance.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{feature.feature}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{(feature.importance * 100).toFixed(1)}%</span>
                          <Progress value={feature.importance * 100} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Results
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Charts
                </Button>
                {selectedExperiment.status === 'DRAFT' && (
                  <Button onClick={() => handleStartExperiment(selectedExperiment.id)} disabled={loading}>
                    <Play className="h-4 w-4 mr-1" />
                    Start Experiment
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

export default ModelExperimentsPage;
