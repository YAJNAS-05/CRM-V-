import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  LineChart, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  Zap,
  Target,
  Database,
  FileText,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface Forecast {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'revenue' | 'demand' | 'inventory' | 'cash-flow' | 'customer-churn' | 'employee-turnover';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  model: string;
  accuracy: number;
  confidence: number;
  timeframe: string;
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  dataSource: string;
  parameters: Record<string, any>;
  results: ForecastResult[];
  visualizations: string[];
  exports: string[];
}

interface ForecastResult {
  period: string;
  predicted: number;
  confidence_lower: number;
  confidence_upper: number;
  actual?: number;
  accuracy?: number;
}

interface ForecastModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: string;
  isAvailable: boolean;
  supportedForecasts: string[];
}

interface ScheduledForecast {
  id: string;
  forecastName: string;
  schedule: string;
  nextRun: string;
  isActive: boolean;
  recipients: string[];
}

const ForecastGenerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forecasts');
  const [selectedForecast, setSelectedForecast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);

  // Load forecasts from API on component mount
  useEffect(() => {
    const loadForecasts = async () => {
      setLoading(true);
      try {
        const forecastsData = await analyticsApi.getForecasts();
        if (forecastsData) {
          setForecasts(forecastsData);
        }
      } catch (error) {
        console.error('Failed to load forecasts:', error);
        toast.error('Failed to load forecasts');
      } finally {
        setLoading(false);
      }
    };
    loadForecasts();
  }, []);
      model: 'Customer Churn Prediction',
      accuracy: 92.5,
      confidence: 89.3,
      timeframe: '2024-02 to 2024-07',
      granularity: 'monthly',
      createdAt: '2024-01-15 16:00:00',
      createdBy: 'Customer Success Team',
      dataSource: 'customer_behavior_2024',
      parameters: {
        prediction_horizon: 6,
        risk_segments: ['high', 'medium', 'low'],
        intervention_scenarios: true
      },
      results: [],
      visualizations: [],
      exports: []
    },
    {
      id: 'forecast-3',
      name: 'Inventory Demand Forecast',
      description: 'Demand forecast for inventory optimization across all product categories',
      type: 'inventory',
      status: 'completed',
      model: 'Inventory Optimization',
      accuracy: 79.8,
      confidence: 76.5,
      timeframe: '2024-02 to 2024-04',
      granularity: 'weekly',
      createdAt: '2024-01-14',
      completedAt: '2024-01-14 11:20:00',
      createdBy: 'Operations Team',
      dataSource: 'inventory_data_2024',
      parameters: {
        product_categories: ['all'],
        lead_time_inclusion: true,
        safety_stock_calculation: true
      },
      results: [
        { period: '2024-W06', predicted: 12500, confidence_lower: 11800, confidence_upper: 13200 },
        { period: '2024-W07', predicted: 13200, confidence_lower: 12400, confidence_upper: 14000 },
        { period: '2024-W08', predicted: 12800, confidence_lower: 12000, confidence_upper: 13600 }
      ],
      visualizations: ['demand_forecast.png', 'reorder_points.png'],
      exports: ['demand_forecast.csv', 'inventory_recommendations.xlsx']
    },
    {
      id: 'forecast-4',
      name: 'Cash Flow Projection',
      description: 'Monthly cash flow projections for financial planning',
      type: 'cash-flow',
      status: 'failed',
      model: 'Financial Forecasting',
      accuracy: 0,
      confidence: 0,
      timeframe: '2024-02 to 2024-12',
      granularity: 'monthly',
      createdAt: '2024-01-15 10:00:00',
      createdBy: 'Finance Team',
      dataSource: 'financial_data_2024',
      parameters: {
        scenario_analysis: ['best_case', 'base_case', 'worst_case'],
        working_capital: true
      },
      results: [],
      visualizations: [],
      exports: []
    },
    {
      id: 'forecast-5',
      name: 'Employee Turnover Forecast',
      description: 'Predict employee turnover rates for HR planning',
      type: 'employee-turnover',
      status: 'scheduled',
      model: 'HR Analytics',
      accuracy: 84.3,
      confidence: 81.7,
      timeframe: '2024-Q2',
      granularity: 'quarterly',
      createdAt: '2024-01-15',
      createdBy: 'HR Analytics',
      dataSource: 'hr_data_2024',
      parameters: {
        department_breakdown: true,
        risk_factors: ['satisfaction', 'performance', 'tenure'],
        intervention_impact: true
      },
      results: [],
      visualizations: [],
      exports: []
    }
  ];

  const forecastModels: ForecastModel[] = [
    {
      id: 'model-1',
      name: 'Sales Forecasting LSTM',
      type: 'time-series',
      accuracy: 88.7,
      lastTrained: '2024-01-12',
      isAvailable: true,
      supportedForecasts: ['sales', 'revenue', 'demand']
    },
    {
      id: 'model-2',
      name: 'Customer Churn Prediction',
      type: 'classification',
      accuracy: 92.5,
      lastTrained: '2024-01-10',
      isAvailable: true,
      supportedForecasts: ['customer-churn', 'customer-lifetime-value']
    },
    {
      id: 'model-3',
      name: 'Inventory Optimization',
      type: 'regression',
      accuracy: 79.8,
      lastTrained: '2024-01-08',
      isAvailable: true,
      supportedForecasts: ['inventory', 'demand']
    },
    {
      id: 'model-4',
      name: 'Financial Forecasting',
      type: 'time-series',
      accuracy: 85.2,
      lastTrained: '2024-01-05',
      isAvailable: false,
      supportedForecasts: ['cash-flow', 'revenue', 'expenses']
    }
  ];

  const scheduledForecasts: ScheduledForecast[] = [
    {
      id: 'schedule-1',
      forecastName: 'Monthly Sales Forecast',
      schedule: 'First day of each month',
      nextRun: '2024-02-01 09:00:00',
      isActive: true,
      recipients: ['sales-team@company.com', 'executives@company.com']
    },
    {
      id: 'schedule-2',
      forecastName: 'Weekly Inventory Forecast',
      schedule: 'Every Monday at 08:00',
      nextRun: '2024-01-22 08:00:00',
      isActive: true,
      recipients: ['operations@company.com', 'procurement@company.com']
    },
    {
      id: 'schedule-3',
      forecastName: 'Quarterly Churn Analysis',
      schedule: 'First Monday of each quarter',
      nextRun: '2024-04-01 09:00:00',
      isActive: false,
      recipients: ['customer-success@company.com']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'generating':
        return 'text-blue-600 bg-blue-50';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
      case 'revenue':
        return 'text-green-600 bg-green-50';
      case 'demand':
      case 'inventory':
        return 'text-blue-600 bg-blue-50';
      case 'customer-churn':
      case 'employee-turnover':
        return 'text-orange-600 bg-orange-50';
      case 'cash-flow':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-50';
    if (accuracy >= 80) return 'text-blue-600 bg-blue-50';
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredForecasts = forecasts.filter(forecast =>
    forecast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forecast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedForecastData = forecasts.find(f => f.id === selectedForecast);

  const totalForecasts = forecasts.length;
  const completedForecasts = forecasts.filter(f => f.status === 'completed').length;
  const generatingForecasts = forecasts.filter(f => f.status === 'generating').length;
  const failedForecasts = forecasts.filter(f => f.status === 'failed').length;
  const avgAccuracy = Math.round(
    forecasts.filter(f => f.accuracy > 0).reduce((acc, f) => acc + f.accuracy, 0) / 
    forecasts.filter(f => f.accuracy > 0).length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forecast Generation</h1>
          <p className="text-muted-foreground">
            Generate and manage predictive forecasts for business planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Forecast
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForecasts}</div>
            <p className="text-xs text-muted-foreground">
              forecasts generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedForecasts}</div>
            <p className="text-xs text-muted-foreground">
              successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generating</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{generatingForecasts}</div>
            <p className="text-xs text-muted-foreground">
              in progress
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
              model accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Generation Alert */}
      {generatingForecasts > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{generatingForecasts} forecasts</strong> are currently being generated. 
            Monitor progress in the Forecasts tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Generated Forecasts</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all generated forecasts
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search forecasts..."
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
            {/* Forecasts List */}
            <div className="space-y-4">
              {filteredForecasts.map((forecast) => (
                <Card 
                  key={forecast.id}
                  className={`cursor-pointer transition-colors ${
                    selectedForecast === forecast.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedForecast(forecast.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(forecast.type)}`}>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{forecast.name}</CardTitle>
                          <CardDescription>{forecast.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(forecast.type)}>
                          {forecast.type}
                        </Badge>
                        <Badge className={getStatusColor(forecast.status)}>
                          {forecast.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{forecast.model}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <p className="font-medium">{forecast.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <Badge className={getAccuracyColor(forecast.accuracy)}>
                          {forecast.accuracy}%
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{forecast.confidence}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      {forecast.status === 'generating' && (
                        <Button size="sm" variant="outline">
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      {forecast.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Forecast Details */}
            <div>
              {selectedForecastData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedForecastData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedForecast(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedForecastData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Forecast Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedForecastData.type)}>
                              {selectedForecastData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedForecastData.status)}>
                              {selectedForecastData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{selectedForecastData.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Granularity:</span>
                            <span className="font-medium">{selectedForecastData.granularity}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Accuracy:</span>
                            <Badge className={getAccuracyColor(selectedForecastData.accuracy)}>
                              {selectedForecastData.accuracy}%
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">{selectedForecastData.confidence}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{selectedForecastData.createdAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium">{selectedForecastData.completedAt || 'In progress'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedForecastData.results.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Forecast Results</h4>
                        <div className="bg-muted p-3 rounded">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Period</th>
                                <th className="text-right p-2">Predicted</th>
                                <th className="text-right p-2">Lower Bound</th>
                                <th className="text-right p-2">Upper Bound</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedForecastData.results.map((result, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{result.period}</td>
                                  <td className="text-right p-2">{result.predicted.toLocaleString()}</td>
                                  <td className="text-right p-2">{result.confidence_lower.toLocaleString()}</td>
                                  <td className="text-right p-2">{result.confidence_upper.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedForecastData.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <LineChart className="w-4 h-4 mr-2" />
                        Visualize
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a forecast to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Forecast Models</h3>
              <p className="text-sm text-muted-foreground">
                Available models for forecast generation
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecastModels.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={model.isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                      {model.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <CardDescription>{model.type} model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p className="font-medium">{model.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Trained:</span>
                      <p className="font-medium">{model.lastTrained}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Supported Forecasts:</span>
                    <div className="mt-1">
                      {model.supportedForecasts.map((forecast, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                          {forecast}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Scheduled Forecasts</h3>
              <p className="text-sm text-muted-foreground">
                Manage automated forecast generation schedules
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Schedule
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Forecast Name</th>
                      <th className="text-left p-4 font-medium">Schedule</th>
                      <th className="text-left p-4 font-medium">Next Run</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Recipients</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledForecasts.map((schedule) => (
                      <tr key={schedule.id} className="border-b hover:bg-muted">
                        <td className="p-4 font-medium">{schedule.forecastName}</td>
                        <td className="p-4 text-sm">{schedule.schedule}</td>
                        <td className="p-4 text-sm">{schedule.nextRun}</td>
                        <td className="p-4">
                          <Badge className={schedule.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="max-w-xs truncate">
                            {schedule.recipients.join(', ')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              {schedule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Forecast Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Analyze forecast accuracy and performance trends
              </p>
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trends</CardTitle>
                <CardDescription>
                  Forecast accuracy over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="w-12 h-12" />
                  <p className="ml-2">Accuracy trend chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Distribution</CardTitle>
                <CardDescription>
                  Distribution of forecast types and accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Distribution chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastGenerationPage;
