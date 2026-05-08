import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  Activity,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  Zap,
  Target,
  Database,
  PieChart,
  BarChart,
  ScatterChart,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'customer' | 'operational' | 'financial' | 'marketing';
  type: 'real-time' | 'batch' | 'historical' | 'predictive';
  status: 'active' | 'inactive' | 'error';
  lastUpdated: string;
  accuracy: number;
  dataPoints: number;
  insights: number;
  alerts: number;
  metrics: DashboardMetric[];
  visualizations: Visualization[];
}

interface DashboardMetric {
  id: string;
  name: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
  description: string;
}

interface Visualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'heatmap';
  title: string;
  description: string;
  data: any;
  insights: string[];
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: string;
  actionItems: string[];
  relatedMetrics: string[];
  generatedAt: string;
}

interface ModelPerformance {
  modelId: string;
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  predictions: number;
  errors: number;
  uptime: number;
}

const PredictiveAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsDashboards, setAnalyticsDashboards] = useState<AnalyticsDashboard[]>([]);
  const [loading, setLoading] = useState(false);

  // Load analytics dashboards from API on component mount
  useEffect(() => {
    const loadAnalyticsDashboards = async () => {
      setLoading(true);
      try {
        const dashboardsData = await analyticsApi.getAnalyticsDashboards();
        if (dashboardsData) {
          setAnalyticsDashboards(dashboardsData);
        }
      } catch (error) {
        console.error('Failed to load analytics dashboards:', error);
        toast.error('Failed to load analytics dashboards');
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsDashboards();
  }, []);
      status: 'active',
      lastUpdated: '2024-01-15 14:15:00',
      accuracy: 89.7,
      dataPoints: 32800,
      insights: 18,
      alerts: 5,
      metrics: [
        { id: 'm5', name: 'Customer Lifetime Value', value: 12500, change: 850, trend: 'up', target: 15000, unit: '$', description: 'Average customer lifetime value' },
        { id: 'm6', name: 'Churn Rate', value: 5.2, change: 0.8, trend: 'up', target: 3, unit: '%', description: 'Monthly customer churn rate' },
        { id: 'm7', name: 'Engagement Score', value: 78.4, change: -2.1, trend: 'down', target: 85, unit: '%', description: 'Customer engagement score' },
        { id: 'm8', name: 'Net Promoter Score', value: 42, change: 3, trend: 'up', target: 50, unit: '', description: 'Net promoter score' }
      ],
      visualizations: [
        { id: 'v3', type: 'scatter', title: 'Customer Segments', description: 'Customer segmentation analysis', data: {}, insights: ['3 distinct segments identified', 'High-value segment growing'] },
        { id: 'v4', type: 'pie', title: 'Churn Reasons', description: 'Primary reasons for customer churn', data: {}, insights: ['Price sensitivity main factor', 'Support issues significant'] }
      ]
    },
    {
      id: 'dashboard-3',
      name: 'Financial Risk Analytics',
      description: 'Predictive analytics for financial risk management',
      category: 'financial',
      type: 'real-time',
      status: 'active',
      lastUpdated: '2024-01-15 15:45:00',
      accuracy: 91.3,
      dataPoints: 8900,
      insights: 15,
      alerts: 2,
      metrics: [
        { id: 'm9', name: 'Risk Score', value: 3.2, change: -0.3, trend: 'down', target: 2.5, unit: '', description: 'Overall financial risk score' },
        { id: 'm10', name: 'Fraud Detection Rate', value: 0.2, change: -0.05, trend: 'down', target: 0.1, unit: '%', description: 'Fraud detection accuracy' },
        { id: 'm11', name: 'Credit Risk', value: 12.5, change: 1.2, trend: 'up', target: 10, unit: '%', description: 'Credit risk exposure' },
        { id: 'm12', name: 'Liquidity Ratio', value: 1.8, change: 0.1, trend: 'up', target: 2.0, unit: '', description: 'Liquidity coverage ratio' }
      ],
      visualizations: [
        { id: 'v5', type: 'bar', title: 'Risk Assessment', description: 'Multi-dimensional risk analysis', data: {}, insights: ['Operational risk reduced', 'Market risk increased'] },
        { id: 'v6', type: 'heatmap', title: 'Risk Hotspots', description: 'Geographic risk distribution', data: {}, insights: ['High risk in emerging markets', 'Stable in core markets'] }
      ]
    }
  ];

  const insights: Insight[] = [
    {
      id: 'insight-1',
      title: 'Revenue Growth Opportunity',
      description: 'Analysis indicates 23% revenue growth potential in Q2 2024 through targeted marketing campaigns',
      type: 'opportunity',
      severity: 'high',
      confidence: 87.3,
      impact: 'Potential $2.3M additional revenue',
      actionItems: [
        'Launch targeted marketing campaign',
        'Increase sales team by 15%',
        'Optimize pricing strategy',
        'Expand to new geographic markets'
      ],
      relatedMetrics: ['Revenue Growth', 'Market Share'],
      generatedAt: '2024-01-15 15:30:00'
    },
    {
      id: 'insight-2',
      title: 'Customer Churn Warning',
      description: 'Customer churn rate increasing by 15% month-over-month, primarily affecting high-value customers',
      type: 'risk',
      severity: 'critical',
      confidence: 92.1,
      impact: 'Potential loss of $1.8M annual revenue',
      actionItems: [
        'Immediate retention campaign for at-risk customers',
        'Review pricing and value proposition',
        'Enhance customer success programs',
        'Investigate root causes of dissatisfaction'
      ],
      relatedMetrics: ['Churn Rate', 'Customer Lifetime Value'],
      generatedAt: '2024-01-15 14:15:00'
    },
    {
      id: 'insight-3',
      title: 'Operational Efficiency Trend',
      description: 'Operational efficiency improving by 3.1% due to process automation initiatives',
      type: 'trend',
      severity: 'medium',
      confidence: 78.9,
      impact: 'Cost savings of $450K annually',
      actionItems: [
        'Continue automation investments',
        'Expand successful programs to other departments',
        'Monitor ROI of automation initiatives',
        'Share best practices across organization'
      ],
      relatedMetrics: ['Operational Efficiency'],
      generatedAt: '2024-01-15 13:45:00'
    }
  ];

  const modelPerformance: ModelPerformance[] = [
    {
      modelId: 'model-1',
      modelName: 'Revenue Forecasting LSTM',
      accuracy: 94.2,
      precision: 91.5,
      recall: 89.8,
      f1Score: 90.6,
      lastTrained: '2024-01-10',
      predictions: 15420,
      errors: 89,
      uptime: 99.8
    },
    {
      modelId: 'model-2',
      modelName: 'Customer Churn Prediction',
      accuracy: 89.7,
      precision: 87.3,
      recall: 85.2,
      f1Score: 86.2,
      lastTrained: '2024-01-08',
      predictions: 32800,
      errors: 334,
      uptime: 99.5
    },
    {
      modelId: 'model-3',
      modelName: 'Fraud Detection Model',
      accuracy: 91.3,
      precision: 93.1,
      recall: 88.7,
      f1Score: 90.8,
      lastTrained: '2024-01-12',
      predictions: 8900,
      errors: 77,
      uptime: 99.9
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'text-blue-600 bg-blue-50';
      case 'customer':
        return 'text-green-600 bg-green-50';
      case 'operational':
        return 'text-orange-600 bg-orange-50';
      case 'financial':
        return 'text-purple-600 bg-purple-50';
      case 'marketing':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedDashboardData = analyticsDashboards.find(d => d.id === selectedDashboard);

  const totalDashboards = analyticsDashboards.length;
  const activeDashboards = analyticsDashboards.filter(d => d.status === 'active').length;
  const totalInsights = insights.length;
  const criticalInsights = insights.filter(i => i.severity === 'critical').length;
  const avgAccuracy = Math.round(
    analyticsDashboards.reduce((acc, d) => acc + d.accuracy, 0) / totalDashboards
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered analytics dashboard with real-time insights and predictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dashboards</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDashboards}</div>
            <p className="text-xs text-muted-foreground">
              of {totalDashboards} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsights}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalInsights}</div>
            <p className="text-xs text-muted-foreground">
              require immediate action
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

      {/* Critical Alert */}
      {criticalInsights > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalInsights} critical insights</strong> detected that require immediate attention. 
            Review insights panel for detailed recommendations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time business metrics with AI-powered predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsDashboards[0].metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">{metric.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                        {metric.unit}
                      </div>
                      <div className={`text-sm ${
                        metric.change > 0 ? 'text-green-600' : 
                        metric.change < 0 ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
                <CardDescription>
                  Latest insights generated by predictive models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${getSeverityColor(insight.severity)}`}>
                          {insight.type === 'opportunity' ? <Target className="w-3 h-3" /> :
                           insight.type === 'risk' ? <AlertTriangle className="w-3 h-3" /> :
                           insight.type === 'trend' ? <TrendingUp className="w-3 h-3" /> :
                           <Brain className="w-3 h-3" />}
                        </div>
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Confidence: {insight.confidence}%</span>
                      <span>{insight.generatedAt}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Model Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Overview</CardTitle>
              <CardDescription>
                Real-time performance metrics for all predictive models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modelPerformance.map((model) => (
                  <div key={model.modelId} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">{model.modelName}</span>
                      <Badge className="bg-green-50 text-green-600">
                        {model.uptime}% uptime
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Predictions:</span>
                        <span className="font-medium">{model.predictions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Errors:</span>
                        <span className="font-medium text-red-600">{model.errors}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Analytics Dashboards</h3>
              <p className="text-sm text-muted-foreground">
                Manage and configure predictive analytics dashboards
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search dashboards..."
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsDashboards.map((dashboard) => (
              <Card 
                key={dashboard.id}
                className={`cursor-pointer transition-colors ${
                  selectedDashboard === dashboard.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedDashboard(dashboard.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    <Badge className={getStatusColor(dashboard.status)}>
                      {dashboard.status}
                    </Badge>
                  </div>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <Badge className={getCategoryColor(dashboard.category)}>
                        {dashboard.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{dashboard.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p className="font-medium">{dashboard.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Points:</span>
                      <p className="font-medium">{dashboard.dataPoints.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{dashboard.lastUpdated}</span>
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

          {/* Dashboard Details */}
          {selectedDashboardData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedDashboardData.name}
                  <Button variant="outline" size="sm" onClick={() => setSelectedDashboard(null)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </CardTitle>
                <CardDescription>{selectedDashboardData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Metrics</h4>
                    <div className="space-y-3">
                      {selectedDashboardData.metrics.map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(metric.trend)}
                            <div>
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-sm text-muted-foreground">{metric.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                              {metric.unit}
                            </div>
                            <div className={`text-sm ${
                              metric.change > 0 ? 'text-green-600' : 
                              metric.change < 0 ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Visualizations</h4>
                    <div className="space-y-3">
                      {selectedDashboardData.visualizations.map((viz) => (
                        <div key={viz.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{viz.title}</span>
                            <Badge variant="outline" className="capitalize">
                              {viz.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{viz.description}</p>
                          <div className="space-y-1">
                            {viz.insights.map((insight, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                • {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Dashboard
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">AI-Generated Insights</h3>
              <p className="text-sm text-muted-foreground">
                Review insights and recommendations from predictive models
              </p>
            </div>
            <Button variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              Generate New Insights
            </Button>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(insight.severity)}`}>
                        {insight.type === 'opportunity' ? <Target className="w-4 h-4" /> :
                         insight.type === 'risk' ? <AlertTriangle className="w-4 h-4" /> :
                         insight.type === 'trend' ? <TrendingUp className="w-4 h-4" /> :
                         insight.type === 'anomaly' ? <Activity className="w-4 h-4" /> :
                         <Brain className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm text-muted-foreground capitalize">{insight.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{insight.description}</p>
                  
                  <div className="bg-muted p-3 rounded mb-3">
                    <div className="text-sm font-medium mb-1">Impact:</div>
                    <div className="text-sm">{insight.impact}</div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                    <ul className="space-y-1">
                      {insight.actionItems.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div>
                      <span>Related metrics: </span>
                      {insight.relatedMetrics.map((metric, index) => (
                        <Badge key={index} variant="outline" className="ml-1 text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                    <span>{insight.generatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Model Performance</h3>
              <p className="text-sm text-muted-foreground">
                Monitor performance and health of all predictive models
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Model Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {modelPerformance.map((model) => (
              <Card key={model.modelId}>
                <CardHeader>
                  <CardTitle className="text-lg">{model.modelName}</CardTitle>
                  <CardDescription>Last trained: {model.lastTrained}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p className="font-medium">{model.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Precision:</span>
                      <p className="font-medium">{model.precision}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recall:</span>
                      <p className="font-medium">{model.recall}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">F1 Score:</span>
                      <p className="font-medium">{model.f1Score}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predictions:</span>
                      <span className="font-medium">{model.predictions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Errors:</span>
                      <span className="font-medium text-red-600">{model.errors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium text-green-600">{model.uptime}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retrain
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

export default PredictiveAnalyticsPage;
