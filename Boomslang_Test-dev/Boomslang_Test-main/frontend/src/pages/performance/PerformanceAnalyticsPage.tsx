import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  Zap,
  Clock,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Timer,
  Gauge,
  Database,
  Globe,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Users,
  FileText,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'user_experience';
  currentValue: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target: number;
  lastUpdated: string;
}

interface PerformanceReport {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'generating' | 'completed' | 'failed';
  generatedAt: string;
  generatedBy: string;
  metrics: ReportMetrics;
  insights: PerformanceInsight[];
  recommendations: string[];
  downloadUrl?: string;
}

interface ReportMetrics {
  avgResponseTime: number;
  peakThroughput: number;
  errorRate: number;
  uptime: number;
  resourceUtilization: number;
  userSatisfaction: number;
}

interface PerformanceInsight {
  id: string;
  type: 'improvement' | 'degradation' | 'anomaly' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: InsightData;
}

interface InsightData {
  metric: string;
  value: number;
  baseline: number;
  period: string;
}

interface PerformanceTrend {
  id: string;
  name: string;
  description: string;
  metric: string;
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly';
  dataPoints: TrendDataPoint[];
  analysis: TrendAnalysis;
}

interface TrendDataPoint {
  timestamp: string;
  value: number;
  baseline?: number;
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number;
  correlation: number;
  forecast: number;
  confidence: number;
}

interface PerformanceComparison {
  id: string;
  name: string;
  description: string;
  period1: ComparisonPeriod;
  period2: ComparisonPeriod;
  metrics: ComparisonMetrics;
  insights: string[];
}

interface ComparisonPeriod {
  name: string;
  startDate: string;
  endDate: string;
}

interface ComparisonMetrics {
  responseTimeChange: number;
  throughputChange: number;
  errorRateChange: number;
  resourceUtilizationChange: number;
  overallScore: number;
}

const PerformanceAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Load performance metrics from API on component mount
  useEffect(() => {
    const loadPerformanceMetrics = async () => {
      setLoading(true);
      try {
        const metricsData = await performanceApi.getPerformanceAnalytics();
        if (metricsData) {
          setPerformanceMetrics(metricsData);
        }
      } catch (error) {
        console.error('Failed to load performance analytics:', error);
        toast.error('Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };
    loadPerformanceMetrics();
  }, []);
      previousValue: 1380,
      unit: 'req/s',
      trend: 'up',
      trendPercentage: 5.1,
      status: 'excellent',
      target: 1600,
      lastUpdated: '2024-01-15 15:30:00'
    },
    {
      id: 'metric-3',
      name: 'Error Rate',
      description: 'Percentage of failed requests',
      category: 'error_rate',
      currentValue: 0.8,
      previousValue: 1.2,
      unit: '%',
      trend: 'down',
      trendPercentage: 33.3,
      status: 'excellent',
      target: 0.5,
      lastUpdated: '2024-01-15 15:30:00'
    },
    {
      id: 'metric-4',
      name: 'CPU Utilization',
      description: 'Average CPU usage across all servers',
      category: 'resource_usage',
      currentValue: 68.5,
      previousValue: 72.3,
      unit: '%',
      trend: 'down',
      trendPercentage: 5.3,
      status: 'good',
      target: 70,
      lastUpdated: '2024-01-15 15:30:00'
    },
    {
      id: 'metric-5',
      name: 'Memory Usage',
      description: 'Average memory consumption',
      category: 'resource_usage',
      currentValue: 82.3,
      previousValue: 78.9,
      unit: '%',
      trend: 'up',
      trendPercentage: 4.3,
      status: 'warning',
      target: 75,
      lastUpdated: '2024-01-15 15:30:00'
    },
    {
      id: 'metric-6',
      name: 'User Satisfaction',
      description: 'User satisfaction score based on feedback',
      category: 'user_experience',
      currentValue: 92,
      previousValue: 88,
      unit: 'score',
      trend: 'up',
      trendPercentage: 4.5,
      status: 'excellent',
      target: 95,
      lastUpdated: '2024-01-15 15:30:00'
    }
  ];

  const performanceReports: PerformanceReport[] = [
    {
      id: 'report-1',
      name: 'Daily Performance Report',
      description: 'Daily performance summary and analysis',
      type: 'daily',
      status: 'completed',
      generatedAt: '2024-01-15 08:00:00',
      generatedBy: 'System',
      metrics: {
        avgResponseTime: 245,
        peakThroughput: 1450,
        errorRate: 0.8,
        uptime: 99.9,
        resourceUtilization: 75.4,
        userSatisfaction: 92
      },
      insights: [
        {
          id: 'insight-1',
          type: 'improvement',
          title: 'Response Time Improved',
          description: 'Average response time decreased by 8.6% compared to yesterday',
          impact: 'medium',
          confidence: 95,
          data: {
            metric: 'response_time',
            value: 245,
            baseline: 268,
            period: '24h'
          }
        }
      ],
      recommendations: [
        'Continue monitoring memory usage trends',
        'Consider implementing additional caching for frequently accessed data'
      ],
      downloadUrl: '/reports/daily-performance-2024-01-15.pdf'
    },
    {
      id: 'report-2',
      name: 'Weekly Performance Analysis',
      description: 'Comprehensive weekly performance analysis',
      type: 'weekly',
      status: 'completed',
      generatedAt: '2024-01-15 06:00:00',
      generatedBy: 'Analytics Team',
      metrics: {
        avgResponseTime: 252,
        peakThroughput: 1420,
        errorRate: 1.1,
        uptime: 99.7,
        resourceUtilization: 76.8,
        userSatisfaction: 90
      },
      insights: [
        {
          id: 'insight-2',
          type: 'trend',
          title: 'Steady Performance Improvement',
          description: 'Overall performance has improved steadily over the past week',
          impact: 'high',
          confidence: 88,
          data: {
            metric: 'overall_performance',
            value: 85,
            baseline: 78,
            period: '7d'
          }
        }
      ],
      recommendations: [
        'Focus on optimizing memory usage',
        'Implement predictive scaling based on usage patterns'
      ],
      downloadUrl: '/reports/weekly-performance-2024-01-15.pdf'
    },
    {
      id: 'report-3',
      name: 'Monthly Performance Review',
      description: 'Monthly performance review and strategic recommendations',
      type: 'monthly',
      status: 'generating',
      generatedAt: '2024-01-15 00:00:00',
      generatedBy: 'System',
      metrics: {
        avgResponseTime: 0,
        peakThroughput: 0,
        errorRate: 0,
        uptime: 0,
        resourceUtilization: 0,
        userSatisfaction: 0
      },
      insights: [],
      recommendations: []
    }
  ];

  const performanceTrends: PerformanceTrend[] = [
    {
      id: 'trend-1',
      name: 'Response Time Trend',
      description: 'Response time trends over the past 30 days',
      metric: 'response_time',
      timeframe: 'daily',
      dataPoints: [
        { timestamp: '2024-01-01', value: 289, baseline: 300 },
        { timestamp: '2024-01-02', value: 275, baseline: 295 },
        { timestamp: '2024-01-03', value: 268, baseline: 290 },
        { timestamp: '2024-01-04', value: 262, baseline: 285 },
        { timestamp: '2024-01-05', value: 255, baseline: 280 },
        { timestamp: '2024-01-06', value: 248, baseline: 275 },
        { timestamp: '2024-01-07', value: 245, baseline: 270 }
      ],
      analysis: {
        trend: 'decreasing',
        slope: -6.4,
        correlation: -0.92,
        forecast: 235,
        confidence: 87
      }
    },
    {
      id: 'trend-2',
      name: 'Throughput Trend',
      description: 'System throughput trends over the past 30 days',
      metric: 'throughput',
      timeframe: 'daily',
      dataPoints: [
        { timestamp: '2024-01-01', value: 1250, baseline: 1200 },
        { timestamp: '2024-01-02', value: 1280, baseline: 1220 },
        { timestamp: '2024-01-03', value: 1320, baseline: 1240 },
        { timestamp: '2024-01-04', value: 1350, baseline: 1260 },
        { timestamp: '2024-01-05', value: 1380, baseline: 1280 },
        { timestamp: '2024-01-06', value: 1420, baseline: 1300 },
        { timestamp: '2024-01-07', value: 1450, baseline: 1320 }
      ],
      analysis: {
        trend: 'increasing',
        slope: 33.3,
        correlation: 0.95,
        forecast: 1520,
        confidence: 91
      }
    }
  ];

  const performanceComparisons: PerformanceComparison[] = [
    {
      id: 'comp-1',
      name: 'Week over Week Comparison',
      description: 'Compare this week\'s performance with last week',
      period1: {
        name: 'This Week',
        startDate: '2024-01-08',
        endDate: '2024-01-15'
      },
      period2: {
        name: 'Last Week',
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      },
      metrics: {
        responseTimeChange: -8.6,
        throughputChange: 5.1,
        errorRateChange: -33.3,
        resourceUtilizationChange: -2.1,
        overallScore: 87
      },
      insights: [
        'Response time improved by 8.6% compared to last week',
        'Error rate decreased significantly',
        'Overall performance score improved by 7 points'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
      case 'generating':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'response_time':
        return 'text-blue-600 bg-blue-50';
      case 'throughput':
        return 'text-green-600 bg-green-50';
      case 'error_rate':
        return 'text-red-600 bg-red-50';
      case 'resource_usage':
        return 'text-orange-600 bg-orange-50';
      case 'user_experience':
        return 'text-purple-600 bg-purple-50';
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

  const filteredMetrics = performanceMetrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedMetricData = performanceMetrics.find(m => m.id === selectedMetric);

  const criticalMetrics = performanceMetrics.filter(m => m.status === 'critical').length;
  const warningMetrics = performanceMetrics.filter(m => m.status === 'warning').length;
  const avgImprovement = performanceMetrics.reduce((acc, m) => acc + m.trendPercentage, 0) / performanceMetrics.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics and insights for performance optimization
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Analytics
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
            <CardTitle className="text-sm font-medium">Critical Metrics</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalMetrics}</div>
            <p className="text-xs text-muted-foreground">
              require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Metrics</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{warningMetrics}</div>
            <p className="text-xs text-muted-foreground">
              need monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgImprovement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              across all metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{performanceReports.length}</div>
            <p className="text-xs text-muted-foreground">
              reports available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalMetrics > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalMetrics} critical metrics</strong> require immediate attention. 
            Review the metrics overview and take corrective action.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Metrics Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Metrics Overview</h3>
              <p className="text-sm text-muted-foreground">
                Real-time performance metrics and key indicators
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
                <option value="response_time">Response Time</option>
                <option value="throughput">Throughput</option>
                <option value="error_rate">Error Rate</option>
                <option value="resource_usage">Resource Usage</option>
                <option value="user_experience">User Experience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics List */}
            <div className="space-y-4">
              {filteredMetrics.map((metric) => (
                <Card 
                  key={metric.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMetric === metric.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMetric(metric.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(metric.status)}`}>
                          {metric.category === 'response_time' ? <Timer className="w-4 h-4" /> :
                           metric.category === 'throughput' ? <BarChart3 className="w-4 h-4" /> :
                           metric.category === 'error_rate' ? <AlertTriangle className="w-4 h-4" /> :
                           metric.category === 'resource_usage' ? <Cpu className="w-4 h-4" /> :
                           <Users className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{metric.name}</CardTitle>
                          <CardDescription>{metric.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(metric.category)}>
                          {metric.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {metric.currentValue.toLocaleString()}{metric.unit}
                      </div>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Previous:</span>
                        <p className="font-medium">{metric.previousValue}{metric.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <p className="font-medium">{metric.target}{metric.unit}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to Target</span>
                        <span>{Math.round((1 - Math.abs(metric.currentValue - metric.target) / metric.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(1 - Math.abs(metric.currentValue - metric.target) / metric.target) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last updated: {metric.lastUpdated}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Metric Details */}
            <div>
              {selectedMetricData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedMetricData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedMetric(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedMetricData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Current Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Value:</span>
                            <span className="font-medium">{selectedMetricData.currentValue}{selectedMetricData.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Previous Value:</span>
                            <span className="font-medium">{selectedMetricData.previousValue}{selectedMetricData.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Value:</span>
                            <span className="font-medium">{selectedMetricData.target}{selectedMetricData.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedMetricData.status)}>
                              {selectedMetricData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Trend Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Trend:</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(selectedMetricData.trend)}
                              <span className="font-medium capitalize">{selectedMetricData.trend}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Change:</span>
                            <span className="font-medium">{selectedMetricData.trendPercentage > 0 ? '+' : ''}{selectedMetricData.trendPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedMetricData.category)}>
                              {selectedMetricData.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="font-medium">{selectedMetricData.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Performance Chart</h4>
                      <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted rounded">
                        <LineChart className="w-12 h-12" />
                        <p className="ml-2">Performance trend chart would go here</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Detailed Chart
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
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a metric to view detailed analytics
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Trends</h3>
              <p className="text-sm text-muted-foreground">
                Analyze performance trends and patterns over time
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Trend Analysis
            </Button>
          </div>

          <div className="space-y-4">
            {performanceTrends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{trend.name}</CardTitle>
                      <CardDescription>{trend.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{trend.timeframe}</Badge>
                      <Badge className={
                        trend.analysis.trend === 'increasing' ? 'text-green-600 bg-green-50' :
                        trend.analysis.trend === 'decreasing' ? 'text-red-600 bg-red-50' :
                        trend.analysis.trend === 'stable' ? 'text-blue-600 bg-blue-50' :
                        'text-yellow-600 bg-yellow-50'
                      }>
                        {trend.analysis.trend}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Slope:</span>
                      <p className="font-medium">{trend.analysis.slope.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Correlation:</span>
                      <p className="font-medium">{trend.analysis.correlation.toFixed(3)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Forecast:</span>
                      <p className="font-medium">{trend.analysis.forecast}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-medium">{trend.analysis.confidence}%</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Trend Chart</h5>
                    <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted rounded">
                      <LineChart className="w-8 h-8" />
                      <p className="ml-2 text-sm">Trend visualization would go here</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Trend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generated performance reports and analysis
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="space-y-4">
            {performanceReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status === 'completed' ? <FileText className="w-4 h-4" /> :
                         report.status === 'generating' ? <RefreshCw className="w-4 h-4" /> :
                         <XCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{report.type}</Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Generated:</span>
                      <p className="font-medium">{report.generatedAt}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Generated By:</span>
                      <p className="font-medium">{report.generatedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Insights:</span>
                      <p className="font-medium">{report.insights.length} findings</p>
                    </div>
                  </div>

                  {report.status === 'completed' && (
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Key Metrics</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Response Time:</span>
                          <p className="font-medium">{report.metrics.avgResponseTime}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Peak Throughput:</span>
                          <p className="font-medium">{report.metrics.peakThroughput} req/s</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Error Rate:</span>
                          <p className="font-medium">{report.metrics.errorRate}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {report.status === 'completed' && report.downloadUrl && (
                      <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Comparisons</h3>
              <p className="text-sm text-muted-foreground">
                Compare performance across different time periods
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Comparison
            </Button>
          </div>

          <div className="space-y-4">
            {performanceComparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{comparison.name}</div>
                      <div className="text-sm text-muted-foreground">{comparison.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comparison.period1.name}</Badge>
                      <span>vs</span>
                      <Badge variant="outline">{comparison.period2.name}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.responseTimeChange}%</span>
                        {comparison.metrics.responseTimeChange < 0 ? 
                          <ArrowDown className="w-3 h-3 text-green-600" /> :
                          <ArrowUp className="w-3 h-3 text-red-600" />
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Throughput:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.throughputChange}%</span>
                        {comparison.metrics.throughputChange > 0 ? 
                          <ArrowUp className="w-3 h-3 text-green-600" /> :
                          <ArrowDown className="w-3 h-3 text-red-600" />
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.errorRateChange}%</span>
                        {comparison.metrics.errorRateChange < 0 ? 
                          <ArrowDown className="w-3 h-3 text-green-600" /> :
                          <ArrowUp className="w-3 h-3 text-red-600" />
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overall Score:</span>
                      <p className="font-medium">{comparison.metrics.overallScore}/100</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Key Insights</h5>
                    <div className="space-y-1">
                      {comparison.insights.map((insight, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Comparison
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

export default PerformanceAnalyticsPage;
