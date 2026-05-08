import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Filter,
  Search,
  Eye,
  Download,
  Zap,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Timer,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'application' | 'database' | 'network' | 'user_experience';
  value: number;
  unit: string;
  threshold: {
    good: number;
    warning: number;
    critical: number;
  };
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastUpdated: string;
  source: string;
}

interface SystemResource {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'disk' | 'network';
  usage: number;
  capacity: number;
  available: number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: ResourceMetrics;
  processes: ProcessInfo[];
  alerts: ResourceAlert[];
}

interface ResourceMetrics {
  utilization: number;
  average: number;
  peak: number;
  minimum: number;
  timestamp: string;
}

interface ProcessInfo {
  id: string;
  name: string;
  pid: number;
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'sleeping' | 'stopped';
  startTime: string;
}

interface ResourceAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'capacity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  category: string;
  source: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metrics: AlertMetrics;
}

interface AlertMetrics {
  currentValue: number;
  thresholdValue: number;
  deviation: number;
  duration: number;
}

const PerformanceMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Load performance metrics from API on component mount
  useEffect(() => {
    const loadPerformanceMetrics = async () => {
      setLoading(true);
      try {
        const metricsData = await performanceApi.getPerformanceMonitoring();
        if (metricsData) {
          setPerformanceMetrics(metricsData);
        }
      } catch (error) {
        console.error('Failed to load performance monitoring:', error);
        toast.error('Failed to load performance monitoring');
      } finally {
        setLoading(false);
      }
    };
    loadPerformanceMetrics();
  }, []);
      unit: '%',
      threshold: { good: 75, warning: 85, critical: 95 },
      status: 'warning',
      trend: 'up',
      trendPercentage: 8.7,
      lastUpdated: '2024-01-15 15:30:00',
      source: 'System Monitor'
    },
    {
      id: 'metric-3',
      name: 'Response Time',
      description: 'Average application response time',
      category: 'application',
      value: 245,
      unit: 'ms',
      threshold: { good: 300, warning: 500, critical: 1000 },
      status: 'good',
      trend: 'down',
      trendPercentage: 12.3,
      lastUpdated: '2024-01-15 15:30:00',
      source: 'Application Monitor'
    },
    {
      id: 'metric-4',
      name: 'Database Connections',
      description: 'Active database connections',
      category: 'database',
      value: 145,
      unit: 'connections',
      threshold: { good: 150, warning: 180, critical: 200 },
      status: 'good',
      trend: 'stable',
      trendPercentage: 0,
      lastUpdated: '2024-01-15 15:30:00',
      source: 'Database Monitor'
    },
    {
      id: 'metric-5',
      name: 'Network Throughput',
      description: 'Network data transfer rate',
      category: 'network',
      value: 850,
      unit: 'Mbps',
      threshold: { good: 800, warning: 950, critical: 1000 },
      status: 'good',
      trend: 'up',
      trendPercentage: 15.8,
      lastUpdated: '2024-01-15 15:30:00',
      source: 'Network Monitor'
    },
    {
      id: 'metric-6',
      name: 'Error Rate',
      description: 'Application error rate',
      category: 'user_experience',
      value: 0.8,
      unit: '%',
      threshold: { good: 1, warning: 3, critical: 5 },
      status: 'good',
      trend: 'down',
      trendPercentage: 25.4,
      lastUpdated: '2024-01-15 15:30:00',
      source: 'Application Monitor'
    }
  ];

  const systemResources: SystemResource[] = [
    {
      id: 'resource-1',
      name: 'Web Server 01',
      type: 'cpu',
      usage: 68.5,
      capacity: 100,
      available: 31.5,
      status: 'healthy',
      metrics: {
        utilization: 68.5,
        average: 65.2,
        peak: 89.3,
        minimum: 12.4,
        timestamp: '2024-01-15 15:30:00'
      },
      processes: [
        { id: 'proc-1', name: 'nginx', pid: 1234, cpuUsage: 15.2, memoryUsage: 8.5, status: 'running', startTime: '2024-01-15 08:00:00' },
        { id: 'proc-2', name: 'node-app', pid: 5678, cpuUsage: 45.3, memoryUsage: 512.8, status: 'running', startTime: '2024-01-15 08:00:00' },
        { id: 'proc-3', name: 'postgres', pid: 9012, cpuUsage: 8.0, memoryUsage: 256.4, status: 'running', startTime: '2024-01-15 08:00:00' }
      ],
      alerts: [
        { id: 'alert-1', type: 'threshold', severity: 'low', message: 'CPU usage approaching warning threshold', timestamp: '2024-01-15 15:25:00', resolved: false }
      ]
    },
    {
      id: 'resource-2',
      name: 'Database Server',
      type: 'memory',
      usage: 82.3,
      capacity: 100,
      available: 17.7,
      status: 'warning',
      metrics: {
        utilization: 82.3,
        average: 78.9,
        peak: 94.2,
        minimum: 45.6,
        timestamp: '2024-01-15 15:30:00'
      },
      processes: [
        { id: 'proc-4', name: 'postgres', pid: 1234, cpuUsage: 25.8, memoryUsage: 4096.0, status: 'running', startTime: '2024-01-15 08:00:00' },
        { id: 'proc-5', name: 'redis', pid: 5678, cpuUsage: 5.2, memoryUsage: 1024.0, status: 'running', startTime: '2024-01-15 08:00:00' }
      ],
      alerts: [
        { id: 'alert-2', type: 'capacity', severity: 'medium', message: 'Memory usage exceeds 80%', timestamp: '2024-01-15 15:20:00', resolved: false },
        { id: 'alert-3', type: 'threshold', severity: 'low', message: 'Memory usage trending upward', timestamp: '2024-01-15 15:10:00', resolved: true }
      ]
    },
    {
      id: 'resource-3',
      name: 'Application Server 02',
      type: 'disk',
      usage: 45.7,
      capacity: 100,
      available: 54.3,
      status: 'healthy',
      metrics: {
        utilization: 45.7,
        average: 42.3,
        peak: 67.8,
        minimum: 23.4,
        timestamp: '2024-01-15 15:30:00'
      },
      processes: [
        { id: 'proc-6', name: 'java-app', pid: 1234, cpuUsage: 35.6, memoryUsage: 2048.0, status: 'running', startTime: '2024-01-15 08:00:00' }
      ],
      alerts: []
    }
  ];

  const performanceAlerts: PerformanceAlert[] = [
    {
      id: 'perf-alert-1',
      title: 'High Memory Usage on Database Server',
      description: 'Memory usage has exceeded 80% threshold for the past 15 minutes',
      severity: 'medium',
      status: 'active',
      category: 'System Resource',
      source: 'Database Server',
      timestamp: '2024-01-15 15:20:00',
      metrics: {
        currentValue: 82.3,
        thresholdValue: 80,
        deviation: 2.3,
        duration: 900
      }
    },
    {
      id: 'perf-alert-2',
      title: 'Response Time Degradation',
      description: 'Application response time has increased by 25% in the last hour',
      severity: 'low',
      status: 'acknowledged',
      category: 'Application Performance',
      source: 'Web Application',
      timestamp: '2024-01-15 14:30:00',
      acknowledgedBy: 'John Smith',
      acknowledgedAt: '2024-01-15 14:45:00',
      metrics: {
        currentValue: 245,
        thresholdValue: 300,
        deviation: -55,
        duration: 3600
      }
    },
    {
      id: 'perf-alert-3',
      title: 'Database Connection Pool Exhaustion',
      description: 'Database connection pool is at 90% capacity',
      severity: 'high',
      status: 'active',
      category: 'Database',
      source: 'Database Server',
      timestamp: '2024-01-15 15:15:00',
      metrics: {
        currentValue: 180,
        thresholdValue: 180,
        deviation: 0,
        duration: 300
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'acknowledged':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'active':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'text-blue-600 bg-blue-50';
      case 'application':
        return 'text-purple-600 bg-purple-50';
      case 'database':
        return 'text-green-600 bg-green-50';
      case 'network':
        return 'text-orange-600 bg-orange-50';
      case 'user_experience':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'memory':
        return <MemoryStick className="w-4 h-4" />;
      case 'disk':
        return <HardDrive className="w-4 h-4" />;
      case 'network':
        return <Network className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const filteredMetrics = performanceMetrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedResourceData = systemResources.find(r => r.id === selectedResource);

  const totalAlerts = performanceAlerts.length;
  const activeAlerts = performanceAlerts.filter(a => a.status === 'active').length;
  const criticalAlerts = performanceAlerts.filter(a => a.severity === 'critical').length;
  const avgSystemLoad = systemResources.reduce((acc, r) => acc + r.usage, 0) / systemResources.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and resources
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="5m">Last 5 Minutes</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button variant="outline">
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
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSystemLoad.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              average across all resources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              of {totalAlerts} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">245ms</div>
            <p className="text-xs text-muted-foreground">
              average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts} critical alerts</strong> require immediate attention. 
            Review the alerts section and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="resources">System Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Overview</h3>
              <p className="text-sm text-muted-foreground">
                Key performance indicators and system health
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="application">Application</option>
                <option value="database">Database</option>
                <option value="network">Network</option>
                <option value="user_experience">User Experience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Badge className={getCategoryColor(metric.category)}>
                    {metric.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()}{metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                      </span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(metric.value / metric.threshold.critical) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last updated: {metric.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed performance metrics and trends
              </p>
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>
                  Application response time over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="w-12 h-12" />
                  <p className="ml-2">Response time trend chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>
                  System resource usage breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="w-12 h-12" />
                  <p className="ml-2">Resource utilization chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">System Resources</h3>
              <p className="text-sm text-muted-foreground">
                Monitor system resource usage and allocation
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resources List */}
            <div className="space-y-4">
              {systemResources.map((resource) => (
                <Card 
                  key={resource.id}
                  className={`cursor-pointer transition-colors ${
                    selectedResource === resource.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedResource(resource.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(resource.status)}`}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{resource.name}</CardTitle>
                          <CardDescription>{resource.type.toUpperCase()} Resource</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(resource.status)}>
                        {resource.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Usage</span>
                        <span>{resource.usage}% of {resource.capacity}{resource.type === 'memory' ? 'GB' : '%'}</span>
                      </div>
                      <Progress value={resource.usage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Average:</span>
                        <p className="font-medium">{resource.metrics.average}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peak:</span>
                        <p className="font-medium">{resource.metrics.peak}%</p>
                      </div>
                    </div>

                    {resource.alerts.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-600">
                          {resource.alerts.filter(a => !a.resolved).length} active alerts
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resource Details */}
            <div>
              {selectedResourceData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedResourceData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedResource(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {selectedResourceData.type.toUpperCase()} Resource Details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Resource Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{selectedResourceData.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedResourceData.status)}>
                              {selectedResourceData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span className="font-medium">{selectedResourceData.capacity}{selectedResourceData.type === 'memory' ? 'GB' : '%'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span className="font-medium">{selectedResourceData.available}{selectedResourceData.type === 'memory' ? 'GB' : '%'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current:</span>
                            <span className="font-medium">{selectedResourceData.metrics.utilization}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Average:</span>
                            <span className="font-medium">{selectedResourceData.metrics.average}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Peak:</span>
                            <span className="font-medium">{selectedResourceData.metrics.peak}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Minimum:</span>
                            <span className="font-medium">{selectedResourceData.metrics.minimum}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Top Processes</h4>
                      <div className="space-y-2">
                        {selectedResourceData.processes.slice(0, 3).map((process) => (
                          <div key={process.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{process.name}</div>
                              <div className="text-xs text-muted-foreground">
                                PID: {process.pid} • Started: {process.startTime}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">CPU: {process.cpuUsage}%</div>
                              <div className="text-sm font-medium">Memory: {process.memoryUsage}MB</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Charts
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a resource to view detailed information
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage performance alerts
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert Rule
            </Button>
          </div>

          <div className="space-y-4">
            {performanceAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status === 'active' ? <AlertTriangle className="w-4 h-4" /> :
                         alert.status === 'acknowledged' ? <Eye className="w-4 h-4" /> :
                         <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(alert.category)}>
                        {alert.category}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <Badge className={getStatusColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Source:</span>
                      <p className="font-medium">{alert.source}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Value:</span>
                      <p className="font-medium">{alert.metrics.currentValue}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threshold:</span>
                      <p className="font-medium">{alert.metrics.thresholdValue}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{Math.round(alert.metrics.duration / 60)}m</p>
                    </div>
                  </div>

                  {alert.acknowledgedBy && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {alert.status === 'active' && (
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringPage;
