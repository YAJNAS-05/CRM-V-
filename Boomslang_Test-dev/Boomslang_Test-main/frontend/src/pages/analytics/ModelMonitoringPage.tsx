import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Cpu,
  HardDrive,
  Network,
  BarChart3,
  Target,
  Shield
} from 'lucide-react';
import { ModelMonitoring, ModelPerformance, MonitoringAlert } from '@/types/analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { analyticsApi } from '../../api/analyticsApi';

const ModelMonitoringPage: React.FC = () => {
  const [monitoringData, setMonitoringData] = useState<ModelMonitoring[]>([]);
    },
    {
      modelId: 'sales-forecasting-model',
      status: 'WARNING',
      lastHealthCheck: new Date('2024-01-20T14:15:00'),
      uptime: 98.5,
      downtime: 1.5,
      alerts: [
        {
          id: '2',
          type: 'HIGH_LATENCY',
          severity: 'HIGH',
          message: 'Average response time exceeded SLA (650ms > 500ms)',
          timestamp: new Date('2024-01-20T13:30:00'),
          resolved: false
        },
        {
          id: '3',
          type: 'ACCURACY_DROP',
          severity: 'MEDIUM',
          message: 'Model accuracy dropped below threshold (82% < 85%)',
          timestamp: new Date('2024-01-20T12:45:00'),
          resolved: false
        }
      ],
      checks: [
        { name: 'API Connectivity', status: 'PASS', lastCheck: new Date('2024-01-20T14:15:00'), responseTime: 55, details: {} },
        { name: 'Model Performance', status: 'FAIL', lastCheck: new Date('2024-01-20T14:10:00'), responseTime: 650, details: {} },
        { name: 'Data Pipeline', status: 'PASS', lastCheck: new Date('2024-01-20T14:05:00'), responseTime: 180, details: {} }
      ],
      sla: {
        availability: 99.0,
        responseTime: 500,
        errorRate: 2.0,
        accuracy: 85.0,
        currentAvailability: 98.5,
        currentResponseTime: 650,
        currentErrorRate: 1.8,
        currentAccuracy: 82.0,
        slaCompliance: false
      }
    },
    {
      modelId: 'lead-scoring-model',
      status: 'CRITICAL',
      lastHealthCheck: new Date('2024-01-20T13:45:00'),
      uptime: 95.2,
      downtime: 4.8,
      alerts: [
        {
          id: '4',
          type: 'MODEL_FAILURE',
          severity: 'CRITICAL',
          message: 'Model service is unresponsive',
          timestamp: new Date('2024-01-20T13:00:00'),
          resolved: false
        },
        {
          id: '5',
          type: 'RESOURCE_EXHAUSTION',
          severity: 'HIGH',
          message: 'CPU usage exceeded 90% threshold',
          timestamp: new Date('2024-01-20T12:30:00'),
          resolved: false
        }
      ],
      checks: [
        { name: 'API Connectivity', status: 'FAIL', lastCheck: new Date('2024-01-20T13:45:00'), responseTime: 5000, details: {} },
        { name: 'Model Performance', status: 'FAIL', lastCheck: new Date('2024-01-20T13:40:00'), responseTime: 0, details: {} },
        { name: 'Data Pipeline', status: 'FAIL', lastCheck: new Date('2024-01-20T13:35:00'), responseTime: 0, details: {} }
      ],
      sla: {
        availability: 99.0,
        responseTime: 300,
        errorRate: 5.0,
        accuracy: 80.0,
        currentAvailability: 95.2,
        currentResponseTime: 5000,
        currentErrorRate: 15.0,
        currentAccuracy: 0,
        slaCompliance: false
      }
    }
  ]);

  const [performanceData, setPerformanceData] = useState<ModelPerformance[]>([
    {
      modelId: 'customer-churn-model',
      timestamp: new Date('2024-01-20T14:30:00'),
      metrics: {
        accuracy: 89.2,
        responseTime: 320,
        throughput: 1250,
        errorRate: 2.5,
        resourceUtilization: 65,
        availability: 99.8,
        cost: 0.045
      },
      resourceUsage: {
        cpu: 65,
        memory: 72,
        gpu: 0,
        storage: 45,
        network: 30
      },
      throughput: {
        requestsPerSecond: 1250,
        requestsPerMinute: 75000,
        requestsPerHour: 4500000,
        peakThroughput: 1800,
        averageThroughput: 1200
      },
      latency: {
        p50: 280,
        p95: 450,
        p99: 620,
        average: 320,
        maximum: 800,
        minimum: 150
      },
      errors: {
        totalErrors: 125,
        errorRate: 2.5,
        errorsByType: {
          'TIMEOUT': 45,
          'VALIDATION': 35,
          'MODEL_ERROR': 30,
          'SYSTEM_ERROR': 15
        },
        criticalErrors: 8,
        recentErrors: [
          { timestamp: new Date('2024-01-20T14:25:00'), type: 'TIMEOUT', message: 'Request timeout', severity: 'MEDIUM', count: 5 }
        ]
      },
      predictions: {
        totalPredictions: 5000,
        successfulPredictions: 4875,
        failedPredictions: 125,
        averageConfidence: 0.87,
        confidenceDistribution: {
          'high': 2500,
          'medium': 1875,
          'low': 500
        },
        predictionFrequency: {
          'batch': 3000,
          'real-time': 2000
        }
      }
    }
  ]);

  const [selectedModel, setSelectedModel] = useState<ModelMonitoring | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleRefreshMonitoring = async () => {
    setLoading(true);
    try {
      // Use real analyticsApi to refresh monitoring data
      const monitoringDataResponse = await analyticsApi.getModelMonitoring();
      if (monitoringDataResponse) {
        setMonitoringData(monitoringDataResponse);
      }
      toast.success('Monitoring data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
      toast.error('Failed to refresh monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (modelId: string, alertId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to resolve alert
      await analyticsApi.resolveAlert(modelId, alertId);
      
      setMonitoringData(monitoringData.map(model => 
        model.modelId === modelId 
          ? {
              ...model,
              alerts: model.alerts.map(alert => 
                alert.id === alertId 
                  ? { ...alert, resolved: true, resolvedAt: new Date(), resolvedBy: 'current-user' }
                  : alert
              )
            }
          : model
      ));
      toast.success('Alert resolved successfully');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'CRITICAL': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'OFFLINE': return <XCircle className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-100 text-green-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'FAIL': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const healthyModels = monitoringData.filter(m => m.status === 'HEALTHY');
  const warningModels = monitoringData.filter(m => m.status === 'WARNING');
  const criticalModels = monitoringData.filter(m => m.status === 'CRITICAL');
  const totalAlerts = monitoringData.reduce((sum, m) => sum + m.alerts.filter(a => !a.resolved).length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring of deployed ML models</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshMonitoring} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalModels.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                CRITICAL: {criticalModels.length} model(s) require immediate attention
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-800">
              Investigate Critical Issues
            </Button>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{healthyModels.length}</p>
                <p className="text-sm text-gray-600">Healthy Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningModels.length}</p>
                <p className="text-sm text-gray-600">Warning Models</p>
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
                <p className="text-2xl font-bold">{criticalModels.length}</p>
                <p className="text-sm text-gray-600">Critical Models</p>
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
                <p className="text-2xl font-bold">{totalAlerts}</p>
                <p className="text-sm text-gray-600">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monitoringData.map(model => (
          <Card key={model.modelId} className={
            model.status === 'CRITICAL' ? 'border-red-200' : 
            model.status === 'WARNING' ? 'border-yellow-200' : ''
          }>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    model.status === 'HEALTHY' ? 'bg-green-100' : 
                    model.status === 'WARNING' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {getStatusIcon(model.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{model.modelId}</h3>
                    <p className="text-sm text-gray-600">
                      Last check: {formatDistanceToNow(model.lastHealthCheck, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                  <Badge variant="outline" className={model.sla.slaCompliance ? 'text-green-800' : 'text-red-800'}>
                    SLA: {model.sla.slaCompliance ? 'Compliant' : 'Violation'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* SLA Metrics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">SLA Performance</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Availability:</span>
                      <span className={model.sla.currentAvailability >= model.sla.availability ? 'text-green-600' : 'text-red-600'}>
                        {model.sla.currentAvailability}% (target: {model.sla.availability}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span className={model.sla.currentResponseTime <= model.sla.responseTime ? 'text-green-600' : 'text-red-600'}>
                        {model.sla.currentResponseTime}ms (target: {model.sla.responseTime}ms)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className={model.sla.currentErrorRate <= model.sla.errorRate ? 'text-green-600' : 'text-red-600'}>
                        {model.sla.currentErrorRate}% (target: {model.sla.errorRate}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className={model.sla.currentAccuracy >= model.sla.accuracy ? 'text-green-600' : 'text-red-600'}>
                        {model.sla.currentAccuracy}% (target: {model.sla.accuracy}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Checks */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Health Checks</h4>
                  <div className="space-y-1">
                    {model.checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {getCheckStatusIcon(check.status)}
                          <span>{check.name}</span>
                        </div>
                        <span className="text-gray-500">{check.responseTime}ms</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Alerts */}
                {model.alerts.filter(a => !a.resolved).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Alerts</h4>
                    <div className="space-y-2">
                      {model.alerts.filter(a => !a.resolved).slice(0, 2).map((alert) => (
                        <div key={alert.id} className="p-2 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm">{alert.message}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveAlert(model.modelId, alert.id)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                      {model.alerts.filter(a => !a.resolved).length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{model.alerts.filter(a => !a.resolved).length - 2} more alerts
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Uptime */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm">{model.uptime}%</span>
                  </div>
                  <Progress value={model.uptime} className="h-2" />
                </div>

                {/* Actions */}
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
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Metrics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Monitoring Details</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Model ID</Label>
                  <p className="font-medium">{selectedModel.modelId}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedModel.status)}>
                    {selectedModel.status}
                  </Badge>
                </div>
                <div>
                  <Label>Uptime</Label>
                  <p className="font-medium">{selectedModel.uptime}%</p>
                </div>
                <div>
                  <Label>Last Health Check</Label>
                  <p className="font-medium">{selectedModel.lastHealthCheck.toLocaleString()}</p>
                </div>
              </div>

              {/* SLA Performance */}
              <div>
                <Label>SLA Performance</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Availability</span>
                      <span className={selectedModel.sla.currentAvailability >= selectedModel.sla.availability ? 'text-green-600' : 'text-red-600'}>
                        {selectedModel.sla.currentAvailability}%
                      </span>
                    </div>
                    <Progress value={selectedModel.sla.currentAvailability} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Target: {selectedModel.sla.availability}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className={selectedModel.sla.currentResponseTime <= selectedModel.sla.responseTime ? 'text-green-600' : 'text-red-600'}>
                        {selectedModel.sla.currentResponseTime}ms
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedModel.sla.currentResponseTime <= selectedModel.sla.responseTime ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, (selectedModel.sla.currentResponseTime / selectedModel.sla.responseTime) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Target: {selectedModel.sla.responseTime}ms</p>
                  </div>
                </div>
              </div>

              {/* Health Checks */}
              <div>
                <Label>Health Checks</Label>
                <div className="mt-2 space-y-2">
                  {selectedModel.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCheckStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-gray-600">
                            Last check: {formatDistanceToNow(check.lastCheck, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{check.responseTime}ms</p>
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <Label>Alerts</Label>
                <div className="mt-2 space-y-2">
                  {selectedModel.alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg ${
                      alert.resolved ? 'bg-gray-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.type.replace(/_/g, ' ')}</span>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        {!alert.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveAlert(selectedModel.modelId, alert.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        {alert.resolvedAt && ` • Resolved: ${formatDistanceToNow(alert.resolvedAt, { addSuffix: true })}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Detailed Metrics
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure Monitoring
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelMonitoringPage;
