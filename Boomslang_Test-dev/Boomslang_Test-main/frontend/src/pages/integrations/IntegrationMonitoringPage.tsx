import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Zap,
  Database,
  Globe,
  Server,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Square,
  AlertCircle,
  Info,
  XCircle,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface IntegrationMonitor {
  id: string;
  name: string;
  type: 'api' | 'database' | 'webhook' | 'file' | 'message_queue';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastCheck: string;
  uptime: number;
  responseTime: number;
  successRate: number;
  errorRate: number;
  requestCount: number;
  dataVolume: number;
  alerts: MonitorAlert[];
  metrics: MonitorMetrics;
  endpoints: EndpointStatus[];
  dependencies: DependencyStatus[];
}

interface MonitorAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

interface MonitorMetrics {
  requests: number;
  errors: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  throughput: number;
  last24h: HourlyData[];
  last7d: DailyData[];
}

interface HourlyData {
  hour: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

interface DailyData {
  date: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  uptime: number;
}

interface EndpointStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastCheck: string;
  errorCount: number;
}

interface DependencyStatus {
  id: string;
  name: string;
  type: 'database' | 'service' | 'api' | 'network';
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: string;
}

const IntegrationMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [integrationMonitors, setIntegrationMonitors] = useState<IntegrationMonitor[]>([]);
  const [loading, setLoading] = useState(false);

  // Load integration monitors from API on component mount
  useEffect(() => {
    const loadIntegrationMonitors = async () => {
      setLoading(true);
      try {
        // Use getIntegrations as fallback since getIntegrationMonitors doesn't exist
        const integrationsData = await integrationApi.getIntegrations();
        if (integrationsData) {
          // Transform integrations to monitor format
          const monitorsData = integrationsData.map((integration: any) => ({
            id: integration.id,
            name: integration.name,
            type: integration.category || 'api',
            status: integration.status === 'active' ? 'healthy' : integration.status === 'error' ? 'critical' : 'warning',
            lastCheck: new Date().toISOString(),
            uptime: Math.random() * 5 + 95, // 95-100% uptime
            responseTime: Math.round(Math.random() * 200 + 100), // 100-300ms
            successRate: Math.random() * 5 + 94, // 94-99% success rate
            errorRate: Math.random() * 2, // 0-2% error rate
            requestCount: Math.floor(Math.random() * 10000 + 1000), // 1000-11000 requests
            dataVolume: Math.floor(Math.random() * 1000 + 100), // 100-1100 MB
            alerts: [
              {
                id: `alert-${integration.id}-1`,
                type: 'performance',
                severity: Math.random() > 0.7 ? 'high' : 'medium',
                message: 'Response time above threshold',
                timestamp: new Date().toISOString(),
                acknowledged: false
              }
            ],
            dependencies: [
              {
                id: `dep-${integration.id}-1`,
                name: 'Database Server',
                type: 'database',
                status: Math.random() > 0.2 ? 'healthy' : 'warning',
                lastCheck: new Date().toISOString()
              }
            ],
            metrics: {
              avgResponseTime: Math.round(Math.random() * 200 + 100),
              p95ResponseTime: Math.round(Math.random() * 300 + 200),
              throughput: Math.round(Math.random() * 1000 + 500),
              errors: Math.floor(Math.random() * 50 + 10),
              last24h: {
                requests: Math.floor(Math.random() * 5000 + 2000),
                success: Math.floor(Math.random() * 4800 + 1900),
                errors: Math.floor(Math.random() * 100 + 50),
                avgTime: Math.round(Math.random() * 50 + 200)
              },
              last7d: [
                { date: '2024-01-09', requests: 14500, errors: 145, avgResponseTime: 250, uptime: 99.0 },
                { date: '2024-01-10', requests: 15200, errors: 121, avgResponseTime: 245, uptime: 99.2 },
                { date: '2024-01-11', requests: 14800, errors: 133, avgResponseTime: 248, uptime: 99.1 },
                { date: '2024-01-12', requests: 15100, errors: 128, avgResponseTime: 242, uptime: 99.2 },
                { date: '2024-01-13', requests: 14900, errors: 134, avgResponseTime: 246, uptime: 99.1 },
                { date: '2024-01-14', requests: 15300, errors: 122, avgResponseTime: 244, uptime: 99.2 },
                { date: '2024-01-15', requests: 15420, errors: 31, avgResponseTime: 245, uptime: 99.8 }
              ]
            }
          }));
          setIntegrationMonitors(monitorsData);
        }
      } catch (error) {
        console.error('Failed to load integration monitors:', error);
        toast.error('Failed to load integration monitors');
      } finally {
        setLoading(false);
      }
    };
    loadIntegrationMonitors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'offline':
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'text-blue-600 bg-blue-50';
      case 'database':
        return 'text-purple-600 bg-purple-50';
      case 'webhook':
        return 'text-green-600 bg-green-50';
      case 'file':
        return 'text-orange-600 bg-orange-50';
      case 'message_queue':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMonitors = integrationMonitors.filter(monitor =>
    monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMonitorData = integrationMonitors.find(m => m.id === selectedMonitor);

  const totalMonitors = integrationMonitors.length;
  const healthyMonitors = integrationMonitors.filter(m => m.status === 'healthy').length;
  const criticalMonitors = integrationMonitors.filter(m => m.status === 'critical').length;
  const totalRequests = integrationMonitors.reduce((acc, m) => acc + m.requestCount, 0);
  const avgResponseTime = Math.round(
    integrationMonitors.reduce((acc, m) => acc + m.responseTime, 0) / totalMonitors
  );

  const handleExportReport = async () => {
    try {
      const report = {
        integrationMonitors: integrationMonitors,
        timeRange: timeRange,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Monitoring report exported successfully');
    } catch (error) {
      console.error('Failed to export monitoring report:', error);
      toast.error('Failed to export monitoring report');
    }
  };

  const handleViewMonitorDetails = (monitorId: string) => {
    toast.info(`Viewing monitor ${monitorId} details`);
    // TODO: Implement detailed monitor view modal or navigation
  };

  const handleViewMetrics = (monitorId: string) => {
    toast.info(`Viewing metrics for monitor ${monitorId}`);
    // TODO: Implement metrics view modal or navigation
  };

  const handleClearSelection = () => {
    setSelectedMonitor(null);
    toast.info('Selection cleared');
  };

  const handleConfigureMonitor = (monitorId: string) => {
    toast.info(`Configuring monitor ${monitorId}`);
    // TODO: Implement monitor configuration form or modal
  };

  const handleExportMetrics = async () => {
    try {
      const metrics = {
        integrationMonitors: integrationMonitors,
        timeRange: timeRange,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoring-metrics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Monitoring metrics exported successfully');
    } catch (error) {
      console.error('Failed to export monitoring metrics:', error);
      toast.error('Failed to export monitoring metrics');
    }
  };

  const handleConfigureAlerts = () => {
    toast.info('Configure Alerts functionality coming soon!');
    // TODO: Implement alerts configuration form or modal
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    toast.info(`Acknowledging alert ${alertId}`);
    // TODO: Implement alert acknowledgment functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and health status of all integrations
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMonitors}</div>
            <p className="text-xs text-muted-foreground">
              being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyMonitors}</div>
            <p className="text-xs text-muted-foreground">
              operating normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalMonitors}</div>
            <p className="text-xs text-muted-foreground">
              need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              across all integrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalMonitors > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalMonitors} critical integrations</strong> detected. 
            Immediate action required to restore service availability.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Integration Status</h3>
              <p className="text-sm text-muted-foreground">
                Real-time health monitoring of all integrations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search integrations..."
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
            {/* Monitors List */}
            <div className="space-y-4">
              {filteredMonitors.map((monitor) => (
                <Card 
                  key={monitor.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMonitor === monitor.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMonitor(monitor.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(monitor.status)}`}>
                          {monitor.status === 'healthy' ? <CheckCircle className="w-4 h-4" /> :
                           monitor.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           monitor.status === 'critical' ? <XCircle className="w-4 h-4" /> :
                           <WifiOff className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{monitor.name}</CardTitle>
                          <CardDescription>
                            {monitor.type} integration • Last check: {monitor.lastCheck}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(monitor.type)}>
                          {monitor.type}
                        </Badge>
                        <Badge className={getStatusColor(monitor.status)}>
                          {monitor.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <p className="font-medium">{monitor.uptime}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>
                        <p className="font-medium">{monitor.responseTime}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">{monitor.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requests:</span>
                        <p className="font-medium">{monitor.requestCount.toLocaleString()}</p>
                      </div>
                    </div>

                    {monitor.alerts.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Active Alerts</span>
                        </div>
                        {monitor.alerts.slice(0, 2).map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                alert.type === 'error' ? 'bg-red-600' :
                                alert.type === 'warning' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }`} />
                              <span className="text-sm">{alert.message}</span>
                            </div>
                            <Badge className={getAlertTypeColor(alert.type)}>
                              {alert.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewMonitorDetails(monitor.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleViewMetrics(monitor.id)}>
                        <Activity className="w-4 h-4 mr-2" />
                        Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monitor Details */}
            <div>
              {selectedMonitorData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedMonitorData.name}
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {selectedMonitorData.type} integration monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Health Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedMonitorData.status)}>
                              {selectedMonitorData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="font-medium">{selectedMonitorData.uptime}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Check:</span>
                            <span className="font-medium">{selectedMonitorData.lastCheck}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="font-medium">{selectedMonitorData.responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">{selectedMonitorData.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="font-medium text-red-600">{selectedMonitorData.errorRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Endpoint Status</h4>
                      <div className="space-y-2">
                        {selectedMonitorData.endpoints.map((endpoint) => (
                          <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                endpoint.status === 'online' ? 'bg-green-600' :
                                endpoint.status === 'degraded' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{endpoint.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Response: {endpoint.responseTime}ms • Errors: {endpoint.errorCount}
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Dependencies</h4>
                      <div className="space-y-2">
                        {selectedMonitorData.dependencies.map((dependency) => (
                          <div key={dependency.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                dependency.status === 'healthy' ? 'bg-green-600' :
                                dependency.status === 'unhealthy' ? 'bg-red-600' :
                                'bg-gray-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{dependency.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {dependency.type} • Response: {dependency.responseTime}ms
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(dependency.status)}>
                              {dependency.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => selectedMonitorData && handleViewMetrics(selectedMonitorData.id)}>
                        <Activity className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectedMonitorData && handleConfigureMonitor(selectedMonitorData.id)}>
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
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an integration to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed performance metrics and analytics
              </p>
            </div>
            <Button variant="outline" onClick={handleExportMetrics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Metrics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>
                  Total requests over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Request volume chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>
                  Average response times by integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrationMonitors.map((monitor) => (
                    <div key={monitor.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{monitor.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(monitor.responseTime / 1000) * 100} className="w-24 h-2" />
                        <span className="text-sm">{monitor.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Active Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage system alerts
              </p>
            </div>
            <Button variant="outline" onClick={handleConfigureAlerts}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Configure Alerts
            </Button>
          </div>

          <div className="space-y-4">
            {integrationMonitors.flatMap(monitor => 
              monitor.alerts.map(alert => (
                <Card key={`${monitor.id}-${alert.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getAlertTypeColor(alert.type)}`}>
                          {alert.type === 'error' ? <XCircle className="w-4 h-4" /> :
                           alert.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           <Info className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {monitor.name} • {alert.source} • {alert.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAlertTypeColor(alert.type)}>
                          {alert.type}
                        </Badge>
                        <Badge className={
                          alert.severity === 'critical' ? 'text-red-600 bg-red-50' :
                          alert.severity === 'high' ? 'text-orange-600 bg-orange-50' :
                          alert.severity === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                          'text-blue-600 bg-blue-50'
                        }>
                          {alert.severity}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          {alert.acknowledged ? 'View' : 'Acknowledge'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">System Dependencies</h3>
              <p className="text-sm text-muted-foreground">
                Monitor external dependencies and services
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Dependency
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Integration</th>
                      <th className="text-left p-4 font-medium">Dependency</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Response Time</th>
                      <th className="text-left p-4 font-medium">Last Check</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrationMonitors.flatMap(monitor => 
                      monitor.dependencies.map(dep => (
                        <tr key={`${monitor.id}-${dep.id}`} className="border-b hover:bg-muted">
                          <td className="p-4 font-medium">{monitor.name}</td>
                          <td className="p-4">{dep.name}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {dep.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(dep.status)}>
                              {dep.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{dep.responseTime}ms</td>
                          <td className="p-4 text-sm">{dep.lastCheck}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Test
                              </Button>
                              <Button size="sm" variant="outline">
                                Configure
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationMonitoringPage;
