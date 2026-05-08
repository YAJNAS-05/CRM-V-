import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Cpu,
  HardDrive,
  Network,
  Users,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Calendar,
  Eye,
  Target,
  Shield
} from 'lucide-react';
import { PerformanceMetrics, MetricCategory, PerformanceAlert, AlertSeverity } from '@/types/performance';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { performanceApi } from '../../api/performanceApi';

const PerformanceDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(false);
            dataPoints: [
              { timestamp: new Date('2024-01-19T14:30:00'), value: 258 },
              { timestamp: new Date('2024-01-20T14:30:00'), value: 245 }
            ]
          }
        },
        throughput: {
          requestsPerSecond: 1250,
          requestsPerMinute: 75000,
          requestsPerHour: 4500000,
          requestsPerDay: 108000000,
          peakThroughput: 1800,
          averageThroughput: 1200,
          trend: {
            direction: 'UP',
            percentage: 8.3,
            period: '24h',
            dataPoints: [
              { timestamp: new Date('2024-01-19T14:30:00'), value: 1155 },
              { timestamp: new Date('2024-01-20T14:30:00'), value: 1250 }
            ]
          }
        },
        errorRate: {
          totalErrors: 125,
          errorRate: 0.01,
          criticalErrors: 8,
          warningErrors: 45,
          errorsByType: {
            'TIMEOUT': 35,
            'CONNECTION_ERROR': 28,
            'VALIDATION_ERROR': 25,
            'SYSTEM_ERROR': 20,
            'AUTHENTICATION_ERROR': 17
          },
          errorsByEndpoint: {
            '/api/users': 25,
            '/api/orders': 20,
            '/api/products': 18,
            '/api/payments': 15,
            '/api/analytics': 12
          },
          trend: {
            direction: 'DOWN',
            percentage: -12.5,
            period: '24h',
            dataPoints: [
              { timestamp: new Date('2024-01-19T14:30:00'), value: 0.0114 },
              { timestamp: new Date('2024-01-20T14:30:00'), value: 0.01 }
            ]
          }
        },
        resourceUsage: {
          cpu: {
            usage: 65,
            available: 35,
            total: 100,
            percentage: 65,
            threshold: 80,
            status: 'NORMAL',
            trend: {
              direction: 'STABLE',
              percentage: 0.5,
              period: '24h',
              dataPoints: []
            }
          },
          memory: {
            usage: 4200,
            available: 1800,
            total: 6000,
            percentage: 70,
            threshold: 85,
            status: 'NORMAL',
            trend: {
              direction: 'UP',
              percentage: 3.2,
              period: '24h',
              dataPoints: []
            }
          },
          disk: {
            usage: 250,
            available: 750,
            total: 1000,
            percentage: 25,
            threshold: 90,
            status: 'NORMAL',
            trend: {
              direction: 'UP',
              percentage: 1.8,
              period: '24h',
              dataPoints: []
            }
          },
          network: {
            usage: 450,
            available: 550,
            total: 1000,
            percentage: 45,
            threshold: 80,
            status: 'NORMAL',
            trend: {
              direction: 'DOWN',
              percentage: -2.1,
              period: '24h',
              dataPoints: []
            }
          },
          cacheHitRate: 0.92,
          connectionPool: {
            active: 45,
            idle: 55,
            total: 100,
            max: 150,
            waiting: 5,
            averageWaitTime: 12
          }
        },
        availability: {
          uptime: 99.8,
          downtime: 0.2,
          availability: 99.8,
          mttr: 5.2,
          mtbf: 720,
          incidents: {
            total: 3,
            critical: 0,
            major: 1,
            minor: 2,
            resolved: 3,
            open: 0,
            averageResolutionTime: 15.5
          },
          sla: {
            target: 99.5,
            current: 99.8,
            compliance: true,
            penalties: 0,
            credits: 0
          }
        },
        userExperience: {
          pageLoadTime: 2.1,
          firstContentfulPaint: 1.2,
          largestContentfulPaint: 2.8,
          cumulativeLayoutShift: 0.08,
          firstInputDelay: 45,
          timeToInteractive: 3.2,
          coreWebVitals: {
            lcp: 2.8,
            fid: 45,
            cls: 0.08,
            status: 'NEEDS_IMPROVEMENT'
          },
          userSatisfaction: {
            apdex: 0.85,
            satisfactionScore: 4.2,
            frustrationThreshold: 5000,
            toleratingThreshold: 2000,
            satisfiedThreshold: 500
          }
        },
        businessMetrics: {
          conversionRate: 3.2,
          revenue: 125000,
          transactionVolume: 4500,
          cartAbandonmentRate: 28.5,
          userRetention: 0.85,
          customerLifetimeValue: 1250,
          supportTickets: 45,
          churnRate: 0.02
        }
      },
      tags: ['production', 'web-app', 'critical'],
      metadata: {
        environment: 'production',
        version: 'v2.1.0',
        region: 'us-east-1',
        datacenter: 'aws-us-east-1a',
        instanceType: 't3.large',
        deploymentId: 'deploy-12345'
      }
    }
  ]);

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      name: 'High Memory Usage',
      description: 'Memory usage exceeded 70% threshold',
      severity: 'HIGH',
      status: 'OPEN',
      condition: {
        metric: 'memory.usage',
        operator: 'GREATER_THAN',
        value: 70,
        duration: 300,
        evaluationWindow: '5m'
      },
      threshold: {
        warning: 70,
        critical: 85,
        recovery: 65
      },
      triggeredAt: new Date('2024-01-20T13:45:00'),
      impact: {
        usersAffected: 1250,
        revenueImpact: 2500,
        businessImpact: 'MEDIUM',
        affectedServices: ['web-app', 'api-gateway'],
        customerComplaints: 3
      },
      actions: [],
      notifications: [
        {
          type: 'EMAIL',
          enabled: true,
          recipients: ['devops@company.com'],
          frequency: 'IMMEDIATE'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 300,
            recipients: ['devops@company.com'],
            notificationTypes: ['EMAIL', 'SLACK']
          },
          {
            level: 2,
            delay: 900,
            recipients: ['manager@company.com'],
            notificationTypes: ['EMAIL', 'SMS']
          }
        ],
        currentLevel: 1
      }
    },
    {
      id: '2',
      name: 'Response Time Degradation',
      description: 'P95 response time increased by 25% in the last hour',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      condition: {
        metric: 'responseTime.p95',
        operator: 'PERCENTAGE_CHANGE',
        value: 20,
        duration: 3600,
        evaluationWindow: '1h'
      },
      threshold: {
        warning: 20,
        critical: 50,
        recovery: 10
      },
      triggeredAt: new Date('2024-01-20T12:30:00'),
      acknowledgedAt: new Date('2024-01-20T13:00:00'),
      acknowledgedBy: 'john.doe@company.com',
      impact: {
        usersAffected: 500,
        revenueImpact: 1000,
        businessImpact: 'LOW',
        affectedServices: ['web-app'],
        customerComplaints: 1
      },
      actions: [
        {
          type: 'MANUAL',
          description: 'Investigated database query performance',
          executedAt: new Date('2024-01-20T13:15:00'),
          executedBy: 'john.doe@company.com',
          result: 'SUCCESS'
        }
      ],
      notifications: [
        {
          type: 'SLACK',
          enabled: true,
          recipients: ['#performance-alerts'],
          frequency: 'IMMEDIATE'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 600,
            recipients: ['dev-team@company.com'],
            notificationTypes: ['SLACK']
          }
        ],
        currentLevel: 1
      }
    }
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetrics | null>(null);

  const handleRefreshMetrics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Performance metrics refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'ACKNOWLEDGED' as const,
              acknowledgedAt: new Date(),
              acknowledgedBy: 'current-user@company.com'
            }
          : alert
      ));
      toast.success('Alert acknowledged successfully');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'RESOLVED' as const,
              resolvedAt: new Date(),
              resolvedBy: 'current-user@company.com'
            }
          : alert
      ));
      toast.success('Alert resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'ACKNOWLEDGED': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UP': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DOWN': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCoreWebVitalsColor = (status: string) => {
    switch (status) {
      case 'GOOD': return 'text-green-600';
      case 'NEEDS_IMPROVEMENT': return 'text-yellow-600';
      case 'POOR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'OPEN');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
  const currentMetrics = metrics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analysis of system performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                CRITICAL: {criticalAlerts.length} critical alert(s) require immediate attention
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-800">
              View Critical Alerts
            </Button>
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentMetrics?.metrics.responseTime.average}ms</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(currentMetrics?.metrics.responseTime.trend.direction)}
                  <span className={`text-xs ${currentMetrics?.metrics.responseTime.trend.direction === 'DOWN' ? 'text-green-600' : 'text-red-600'}`}>
                    {currentMetrics?.metrics.responseTime.trend.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentMetrics?.metrics.availability.availability}%</p>
                <p className="text-sm text-gray-600">Availability</p>
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">SLA Compliant</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentMetrics?.metrics.userExperience.apdex.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Apdex Score</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Target className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600">
                    {currentMetrics?.metrics.userExperience.userSatisfaction.satisfactionScore}/5
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-xs text-orange-600">
                    {criticalAlerts.length} critical
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="user-experience">User Experience</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Response Time Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.responseTime.average}ms</p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.responseTime.p95}ms</p>
                    <p className="text-sm text-gray-600">P95</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.responseTime.median}ms</p>
                    <p className="text-sm text-gray-600">Median</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.responseTime.p99}ms</p>
                    <p className="text-sm text-gray-600">P99</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Throughput Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Throughput Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.throughput.requestsPerSecond}</p>
                    <p className="text-sm text-gray-600">Requests/sec</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.throughput.peakThroughput}</p>
                    <p className="text-sm text-gray-600">Peak</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.errorRate.errorRate.toFixed(3)}%</p>
                    <p className="text-sm text-gray-600">Error Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.throughput.requestsPerMinute.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Requests/min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Resource Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className={`text-sm font-medium ${getResourceStatusColor(currentMetrics?.metrics.resourceUsage.cpu.status)}`}>
                        {currentMetrics?.metrics.resourceUsage.cpu.percentage}%
                      </span>
                    </div>
                    <Progress value={currentMetrics?.metrics.resourceUsage.cpu.percentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className={`text-sm font-medium ${getResourceStatusColor(currentMetrics?.metrics.resourceUsage.memory.status)}`}>
                        {currentMetrics?.metrics.resourceUsage.memory.percentage}%
                      </span>
                    </div>
                    <Progress value={currentMetrics?.metrics.resourceUsage.memory.percentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className={`text-sm font-medium ${getResourceStatusColor(currentMetrics?.metrics.resourceUsage.disk.status)}`}>
                        {currentMetrics?.metrics.resourceUsage.disk.percentage}%
                      </span>
                    </div>
                    <Progress value={currentMetrics?.metrics.resourceUsage.disk.percentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network Usage</span>
                      <span className={`text-sm font-medium ${getResourceStatusColor(currentMetrics?.metrics.resourceUsage.network.status)}`}>
                        {currentMetrics?.metrics.resourceUsage.network.percentage}%
                      </span>
                    </div>
                    <Progress value={currentMetrics?.metrics.resourceUsage.network.percentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Pool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5" />
                  <span>Connection Pool</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.resourceUsage.connectionPool.active}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.resourceUsage.connectionPool.idle}</p>
                    <p className="text-sm text-gray-600">Idle</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.resourceUsage.connectionPool.waiting}</p>
                    <p className="text-sm text-gray-600">Waiting</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.resourceUsage.connectionPool.averageWaitTime}ms</p>
                    <p className="text-sm text-gray-600">Avg Wait</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {(currentMetrics?.metrics.resourceUsage.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={currentMetrics?.metrics.resourceUsage.cacheHitRate * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-experience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Core Web Vitals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                      <span className={`text-sm font-medium ${getCoreWebVitalsColor(currentMetrics?.metrics.userExperience.coreWebVitals.status)}`}>
                        {currentMetrics?.metrics.userExperience.coreWebVitals.lcp}s
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Target: &lt;2.5s</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">First Input Delay (FID)</span>
                      <span className={`text-sm font-medium ${getCoreWebVitalsColor(currentMetrics?.metrics.userExperience.coreWebVitals.status)}`}>
                        {currentMetrics?.metrics.userExperience.coreWebVitals.fid}ms
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Target: &lt;100ms</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                      <span className={`text-sm font-medium ${getCoreWebVitalsColor(currentMetrics?.metrics.userExperience.coreWebVitals.status)}`}>
                        {currentMetrics?.metrics.userExperience.coreWebVitals.cls}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Target: &lt;0.1</div>
                  </div>
                  <div className="mt-4">
                    <Badge variant={currentMetrics?.metrics.userExperience.coreWebVitals.status === 'GOOD' ? 'default' : 'secondary'}>
                      {currentMetrics?.metrics.userExperience.coreWebVitals.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Satisfaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.userExperience.userSatisfaction.apdex.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Apdex Score</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.userExperience.userSatisfaction.satisfactionScore}/5</p>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.userExperience.pageLoadTime}s</p>
                    <p className="text-sm text-gray-600">Page Load</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.userExperience.timeToInteractive}s</p>
                    <p className="text-sm text-gray-600">Time to Interactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ${currentMetrics?.metrics.businessMetrics.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Revenue (Last 24h)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Conversion Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.businessMetrics.conversionRate}%</p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{currentMetrics?.metrics.businessMetrics.transactionVolume.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Customer Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{(currentMetrics?.metrics.businessMetrics.userRetention * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">User Retention</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">${currentMetrics?.metrics.businessMetrics.customerLifetimeValue}</p>
                    <p className="text-sm text-gray-600">CLV</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems are operating normally</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map(alert => (
                <Card key={alert.id} className={
                  alert.severity === 'CRITICAL' ? 'border-red-200' : 
                  alert.severity === 'HIGH' ? 'border-orange-200' : ''
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          alert.severity === 'CRITICAL' ? 'bg-red-100' : 
                          alert.severity === 'HIGH' ? 'bg-orange-100' : 
                          alert.severity === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {getStatusIcon(alert.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.status}</Badge>
                            <span className="text-sm text-gray-500">
                              Triggered: {formatDistanceToNow(alert.triggeredAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Impact Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{alert.impact.usersAffected.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Users Affected</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">${alert.impact.revenueImpact.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Revenue Impact</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{alert.impact.affectedServices.length}</p>
                        <p className="text-sm text-gray-600">Services Affected</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{alert.impact.customerComplaints}</p>
                        <p className="text-sm text-gray-600">Complaints</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {alert.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          disabled={loading}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      {(alert.status === 'OPEN' || alert.status === 'ACKNOWLEDGED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMetric(metrics[0]);
                          setDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Metric Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Metrics Details</DialogTitle>
          </DialogHeader>
          {selectedMetric && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source</Label>
                  <p className="font-medium">{selectedMetric.source}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="font-medium">{selectedMetric.category}</p>
                </div>
                <div>
                  <Label>Environment</Label>
                  <p className="font-medium">{selectedMetric.metadata.environment}</p>
                </div>
                <div>
                  <Label>Version</Label>
                  <p className="font-medium">{selectedMetric.metadata.version}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Charts
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceDashboardPage;
