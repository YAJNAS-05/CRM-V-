import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Play,
  Settings,
  Eye,
  BarChart3,
  Activity,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  LineChart,
  AreaChart,
  Zap
} from 'lucide-react';
import { Forecast, ForecastPoint, ForecastAccuracy } from '@/types/analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { analyticsApi } from '../../api/analyticsApi';

const ForecastingPage: React.FC = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
      accuracy: {
        mae: 45000,
        mse: 3200000000,
        rmse: 56568,
        mape: 0.035,
        r2: 0.92,
        smape: 0.032
      },
      generatedAt: new Date('2024-01-20T10:00:00'),
      validUntil: new Date('2024-02-20T10:00:00'),
      metadata: {
        trainingPeriod: {
          start: new Date('2020-01-01'),
          end: new Date('2023-12-31')
        },
        features: ['historical_sales', 'seasonal_factors', 'economic_indicators', 'marketing_spend'],
        seasonality: [
          { period: 'monthly', strength: 0.65, pattern: [0.9, 0.95, 1.1, 1.15, 1.2, 1.1, 0.95, 0.9, 0.85, 0.9, 1.05, 1.15] }
        ],
        trends: [
          { type: 'LINEAR', slope: 15000, intercept: 800000, r2: 0.88, significance: 0.001 }
        ],
        anomalies: [
          { timestamp: new Date('2022-04-01'), value: 980000, expectedValue: 1200000, deviation: -220000, score: 2.8, type: 'DIP' },
          { timestamp: new Date('2023-11-01'), value: 1650000, expectedValue: 1350000, deviation: 300000, score: 3.2, type: 'SPIKE' }
        ]
      }
    },
    {
      id: '2',
      modelId: 'customer-growth-forecast',
      targetVariable: 'customer_count',
      horizon: 24,
      frequency: 'MONTHLY',
      predictions: [
        { timestamp: new Date('2024-02-01'), value: 12500, lowerBound: 12200, upperBound: 12800, confidence: 0.90 },
        { timestamp: new Date('2024-03-01'), value: 12800, lowerBound: 12450, upperBound: 13150, confidence: 0.88 },
        { timestamp: new Date('2024-04-01'), value: 13100, lowerBound: 12700, upperBound: 13500, confidence: 0.86 }
      ],
      confidenceIntervals: [
        { level: 0.95, lowerBound: 12000, upperBound: 13600 },
        { level: 0.80, lowerBound: 12300, upperBound: 13300 }
      ],
      accuracy: {
        mae: 180,
        mse: 65000,
        rmse: 255,
        mape: 0.015,
        r2: 0.94,
        smape: 0.014
      },
      generatedAt: new Date('2024-01-19T14:30:00'),
      validUntil: new Date('2024-02-19T14:30:00'),
      metadata: {
        trainingPeriod: {
          start: new Date('2021-01-01'),
          end: new Date('2023-12-31')
        },
        features: ['acquisition_channels', 'retention_rates', 'market_conditions'],
        seasonality: [
          { period: 'quarterly', strength: 0.45, pattern: [0.95, 1.05, 1.1, 0.9] }
        ],
        trends: [
          { type: 'EXPONENTIAL', slope: 0.025, intercept: 8000, r2: 0.91, significance: 0.0005 }
        ],
        anomalies: []
      }
    },
    {
      id: '3',
      modelId: 'demand-forecast',
      targetVariable: 'product_demand',
      horizon: 90,
      frequency: 'DAILY',
      predictions: [
        { timestamp: new Date('2024-01-21'), value: 5200, lowerBound: 4800, upperBound: 5600, confidence: 0.75 },
        { timestamp: new Date('2024-01-22'), value: 5350, lowerBound: 4900, upperBound: 5800, confidence: 0.74 },
        { timestamp: new Date('2024-01-23'), value: 5100, lowerBound: 4700, upperBound: 5500, confidence: 0.76 }
      ],
      confidenceIntervals: [
        { level: 0.95, lowerBound: 4500, upperBound: 6000 },
        { level: 0.80, lowerBound: 4800, upperBound: 5700 }
      ],
      accuracy: {
        mae: 220,
        mse: 95000,
        rmse: 308,
        mape: 0.042,
        r2: 0.87,
        smape: 0.039
      },
      generatedAt: new Date('2024-01-20T08:15:00'),
      validUntil: new Date('2024-01-27T08:15:00'),
      metadata: {
        trainingPeriod: {
          start: new Date('2023-01-01'),
          end: new Date('2024-01-15')
        },
        features: ['historical_demand', 'seasonal_patterns', 'promotions', 'competitor_pricing'],
        seasonality: [
          { period: 'weekly', strength: 0.72, pattern: [0.8, 0.9, 1.0, 1.1, 1.2, 1.15, 0.85] }
        ],
        trends: [
          { type: 'SEASONAL', slope: 5, intercept: 4800, r2: 0.85, significance: 0.002 }
        ],
        anomalies: [
          { timestamp: new Date('2023-12-15'), value: 3200, expectedValue: 5100, deviation: -1900, score: 4.1, type: 'DIP' }
        ]
      }
    }
  ]);

  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [newForecastDialog, setNewForecastDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  
  const [newForecast, setNewForecast] = useState({
    modelId: '',
    targetVariable: '',
    horizon: 12,
    frequency: 'MONTHLY' as const,
    confidenceLevel: 0.95
  });

  const handleGenerateForecast = async () => {
    if (!newForecast.modelId || !newForecast.targetVariable) {
      toast.error('Please select a model and target variable');
      return;
    }

    setLoading(true);
    try {
      // Use real analyticsApi to generate forecast
      const forecast = await analyticsApi.generateForecast(newForecast);
      
      setForecasts([forecast, ...forecasts]);
      setNewForecastDialog(false);
      setNewForecast({
        modelId: '',
        targetVariable: '',
        horizon: 12,
        frequency: 'MONTHLY',
        confidenceLevel: 0.95
      });
      toast.success('Forecast generated successfully');
    } catch (error) {
      console.error('Failed to generate forecast:', error);
      toast.error('Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshForecast = async (forecastId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to refresh forecast
      const refreshedForecast = await analyticsApi.refreshForecast(forecastId);
      
      setForecasts(forecasts.map(f => 
        f.id === forecastId ? refreshedForecast : f
      ));
      toast.success('Forecast refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh forecast:', error);
      toast.error('Failed to refresh forecast');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForecast = async (forecastId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to delete forecast
      await analyticsApi.deleteForecast(forecastId);
      
      setForecasts(forecasts.filter(f => f.id !== forecastId));
      toast.success('Forecast deleted successfully');
    } catch (error) {
      console.error('Failed to delete forecast:', error);
      toast.error('Failed to delete forecast');
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'HOURLY': return <Clock className="h-5 w-5" />;
      case 'DAILY': return <Calendar className="h-5 w-5" />;
      case 'WEEKLY': return <Calendar className="h-5 w-5" />;
      case 'MONTHLY': return <Calendar className="h-5 w-5" />;
      case 'QUARTERLY': return <BarChart3 className="h-5 w-5" />;
      case 'YEARLY': return <TrendingUp className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getAccuracyColor = (r2: number) => {
    if (r2 >= 0.9) return 'text-green-600';
    if (r2 >= 0.8) return 'text-blue-600';
    if (r2 >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (r2: number) => {
    if (r2 >= 0.9) return 'Excellent';
    if (r2 >= 0.8) return 'Good';
    if (r2 >= 0.7) return 'Fair';
    return 'Poor';
  };

  const formatValue = (value: number, variable: string): string => {
    if (variable.includes('revenue') || variable.includes('sales')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forecasting</h1>
          <p className="text-gray-600">Generate and manage predictive forecasts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={newForecastDialog} onOpenChange={setNewForecastDialog}>
            <DialogTrigger asChild>
              <Button>
                <TrendingUp className="h-4 w-4 mr-1" />
                Generate Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Forecast</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Model</Label>
                  <Select value={newForecast.modelId} onValueChange={(value) => setNewForecast({...newForecast, modelId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales-forecast-v2">Sales Forecast v2</SelectItem>
                      <SelectItem value="customer-growth-forecast">Customer Growth Forecast</SelectItem>
                      <SelectItem value="demand-forecast">Demand Forecast</SelectItem>
                      <SelectItem value="inventory-forecast">Inventory Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Variable</Label>
                  <Select value={newForecast.targetVariable} onValueChange={(value) => setNewForecast({...newForecast, targetVariable: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly_revenue">Monthly Revenue</SelectItem>
                      <SelectItem value="customer_count">Customer Count</SelectItem>
                      <SelectItem value="product_demand">Product Demand</SelectItem>
                      <SelectItem value="inventory_levels">Inventory Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Forecast Horizon</Label>
                    <Input
                      type="number"
                      value={newForecast.horizon}
                      onChange={(e) => setNewForecast({...newForecast, horizon: parseInt(e.target.value)})}
                      min="1"
                      max="365"
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={newForecast.frequency} onValueChange={(value: any) => setNewForecast({...newForecast, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Confidence Level</Label>
                  <Select value={newForecast.confidenceLevel.toString()} onValueChange={(value) => setNewForecast({...newForecast, confidenceLevel: parseFloat(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.80">80%</SelectItem>
                      <SelectItem value="0.90">90%</SelectItem>
                      <SelectItem value="0.95">95%</SelectItem>
                      <SelectItem value="0.99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setNewForecastDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateForecast} disabled={loading} className="flex-1">
                    {loading ? 'Generating...' : 'Generate Forecast'}
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
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forecasts.length}</p>
                <p className="text-sm text-gray-600">Active Forecasts</p>
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
                <p className="text-2xl font-bold">
                  {forecasts.filter(f => f.accuracy.r2 >= 0.8).length}
                </p>
                <p className="text-sm text-gray-600">High Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {forecasts.reduce((sum, f) => sum + f.horizon, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Periods</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {forecasts.filter(f => f.metadata.anomalies.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">With Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecasts.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No forecasts available</p>
            <p className="text-sm">Generate your first forecast to get started</p>
          </div>
        ) : (
          forecasts.map(forecast => (
            <Card key={forecast.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getFrequencyIcon(forecast.frequency)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {forecast.targetVariable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600">{forecast.modelId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{forecast.frequency}</Badge>
                    <Badge variant="outline">{forecast.horizon} periods</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Prediction */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Next Forecast</span>
                      <span className="text-xs text-gray-500">
                        {forecast.predictions[0]?.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {forecast.predictions[0] ? formatValue(forecast.predictions[0].value, forecast.targetVariable) : 'N/A'}
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Confidence</span>
                        <p className="text-sm font-medium">
                          {forecast.predictions[0]?.confidence ? `${(forecast.predictions[0].confidence * 100).toFixed(0)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {forecast.predictions[0]?.lowerBound && forecast.predictions[0]?.upperBound && (
                      <div className="mt-2 text-xs text-gray-600">
                        Range: {formatValue(forecast.predictions[0].lowerBound, forecast.targetVariable)} - {formatValue(forecast.predictions[0].upperBound, forecast.targetVariable)}
                      </div>
                    )}
                  </div>

                  {/* Accuracy Metrics */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Model Accuracy</span>
                      <span className={`text-sm font-medium ${getAccuracyColor(forecast.accuracy.r2)}`}>
                        {getAccuracyLabel(forecast.accuracy.r2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium">R²</p>
                        <p className={getAccuracyColor(forecast.accuracy.r2)}>
                          {forecast.accuracy.r2.toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">MAPE</p>
                        <p>{(forecast.accuracy.mape * 100).toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">RMSE</p>
                        <p>{forecast.accuracy.rmse.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Anomalies */}
                  {forecast.metadata.anomalies.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          {forecast.metadata.anomalies.length} Anomalies Detected
                        </span>
                      </div>
                      <div className="text-xs text-yellow-700">
                        Last: {forecast.metadata.anomalies[forecast.metadata.anomalies.length - 1].timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Generated: {formatDistanceToNow(forecast.generatedAt, { addSuffix: true })}
                    </span>
                    <span>
                      Valid until: {forecast.validUntil.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedForecast(forecast);
                        setDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshForecast(forecast.id)}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForecast(forecast.id)}
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

      {/* Forecast Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Forecast Details</DialogTitle>
          </DialogHeader>
          {selectedForecast && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Variable</Label>
                  <p className="font-medium">
                    {selectedForecast.targetVariable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <Label>Model</Label>
                  <p className="font-medium">{selectedForecast.modelId}</p>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Badge variant="outline">{selectedForecast.frequency}</Badge>
                </div>
                <div>
                  <Label>Horizon</Label>
                  <p className="font-medium">{selectedForecast.horizon} periods</p>
                </div>
              </div>

              {/* Accuracy Metrics */}
              <div>
                <Label>Model Performance</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {(selectedForecast.accuracy.r2 * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">R² Score</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {(selectedForecast.accuracy.mape * 100).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600">MAPE</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedForecast.accuracy.rmse.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">RMSE</p>
                  </div>
                </div>
              </div>

              {/* Predictions Table */}
              <div>
                <Label>Forecast Predictions</Label>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-right">Prediction</th>
                        <th className="px-4 py-2 text-right">Lower Bound</th>
                        <th className="px-4 py-2 text-right">Upper Bound</th>
                        <th className="px-4 py-2 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedForecast.predictions.slice(0, 10).map((prediction, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{prediction.timestamp.toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-right">
                            {formatValue(prediction.value, selectedForecast.targetVariable)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {prediction.lowerBound ? formatValue(prediction.lowerBound, selectedForecast.targetVariable) : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {prediction.upperBound ? formatValue(prediction.upperBound, selectedForecast.targetVariable) : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {prediction.confidence ? `${(prediction.confidence * 100).toFixed(0)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedForecast.predictions.length > 10 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Showing first 10 of {selectedForecast.predictions.length} predictions
                    </p>
                  )}
                </div>
              </div>

              {/* Seasonality */}
              {selectedForecast.metadata.seasonality.length > 0 && (
                <div>
                  <Label>Seasonality Patterns</Label>
                  <div className="mt-2 space-y-2">
                    {selectedForecast.metadata.seasonality.map((season, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{season.period} pattern</span>
                          <span className="text-sm">Strength: {(season.strength * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {season.pattern.map((value, i) => (
                            <div
                              key={i}
                              className="flex-1 h-8 bg-blue-500 rounded"
                              style={{ opacity: 0.3 + (value - Math.min(...season.pattern)) / (Math.max(...season.pattern) - Math.min(...season.pattern)) * 0.7 }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {selectedForecast.metadata.anomalies.length > 0 && (
                <div>
                  <Label>Detected Anomalies</Label>
                  <div className="mt-2 space-y-2">
                    {selectedForecast.metadata.anomalies.slice(0, 5).map((anomaly, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{anomaly.type}</span>
                            <span className="ml-2 text-sm text-gray-600">
                              {anomaly.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-yellow-800">
                            Score: {anomaly.score.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Value: {formatValue(anomaly.value, selectedForecast.targetVariable)} | 
                          Expected: {formatValue(anomaly.expectedValue, selectedForecast.targetVariable)} | 
                          Deviation: {formatValue(anomaly.deviation, selectedForecast.targetVariable)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Forecast
                </Button>
                <Button variant="outline">
                  <LineChart className="h-4 w-4 mr-1" />
                  View Chart
                </Button>
                <Button onClick={() => handleRefreshForecast(selectedForecast.id)} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Forecast
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForecastingPage;
