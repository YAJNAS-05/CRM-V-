import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  Activity,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface Trend {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'customer' | 'operational' | 'financial' | 'market' | 'product';
  type: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'seasonal';
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  timeframe: string;
  startDate: string;
  endDate: string;
  dataSource: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendations: string[];
  relatedTrends: string[];
  dataPoints: DataPoint[];
  forecast?: ForecastData;
}

interface DataPoint {
  date: string;
  value: number;
  baseline?: number;
  anomaly?: boolean;
}

interface ForecastData {
  nextPeriod: string;
  predictedValue: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

interface TrendAlert {
  id: string;
  trendId: string;
  trendName: string;
  type: 'threshold' | 'anomaly' | 'pattern' | 'opportunity';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

const TrendAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trends');
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trends from API on component mount
  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      try {
        const trendsData = await analyticsApi.getTrends();
        if (trendsData) {
          setTrends(trendsData);
        }
      } catch (error) {
        console.error('Failed to load trends:', error);
        toast.error('Failed to load trends');
      } finally {
        setLoading(false);
      }
    };
    loadTrends();
  }, []);
      direction: 'up',
      magnitude: 15.8,
      confidence: 92.1,
      timeframe: '6 months',
      startDate: '2023-07-01',
      endDate: '2023-12-31',
      dataSource: 'Financial System',
      significance: 'high',
      impact: 'Positive impact on profitability and market position',
      recommendations: [
        'Maintain current sales strategies',
        'Invest in sales team expansion',
        'Explore new market opportunities',
        'Scale successful marketing campaigns'
      ],
      relatedTrends: ['Lead Conversion Rate Improvement', 'Market Share Expansion'],
      dataPoints: [
        { date: '2023-07-01', value: 1200000, baseline: 1100000 },
        { date: '2023-08-01', value: 1250000, baseline: 1120000 },
        { date: '2023-09-01', value: 1320000, baseline: 1150000 },
        { date: '2023-10-01', value: 1380000, baseline: 1180000 },
        { date: '2023-11-01', value: 1450000, baseline: 1200000 },
        { date: '2023-12-01', value: 1520000, baseline: 1220000 }
      ],
      forecast: {
        nextPeriod: '2024-01-01',
        predictedValue: 1580000,
        confidence: 88.5,
        upperBound: 1650000,
        lowerBound: 1510000
      }
    },
    {
      id: 'trend-3',
      name: 'Operational Efficiency Decline',
      description: 'Downward trend in operational efficiency metrics',
      category: 'operational',
      type: 'decreasing',
      direction: 'down',
      magnitude: -12.3,
      confidence: 78.9,
      timeframe: '3 months',
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      dataSource: 'Operations System',
      significance: 'medium',
      impact: 'Increased operational costs and reduced productivity',
      recommendations: [
        'Conduct process efficiency audit',
        'Identify bottlenecks in workflows',
        'Implement automation where possible',
        'Provide additional training to staff'
      ],
      relatedTrends: ['Process Time Increase', 'Resource Utilization Decline'],
      dataPoints: [
        { date: '2023-10-01', value: 87.5, baseline: 89.0 },
        { date: '2023-11-01', value: 85.2, baseline: 88.5 },
        { date: '2023-12-01', value: 82.8, baseline: 88.0 }
      ],
      forecast: {
        nextPeriod: '2024-01-01',
        predictedValue: 80.5,
        confidence: 75.2,
        upperBound: 83.0,
        lowerBound: 78.0
      }
    },
    {
      id: 'trend-4',
      name: 'Market Share Volatility',
      description: 'High volatility in market share due to competitive pressures',
      category: 'market',
      type: 'volatile',
      direction: 'stable',
      magnitude: 0.0,
      confidence: 65.4,
      timeframe: '12 months',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      dataSource: 'Market Research',
      significance: 'medium',
      impact: 'Uncertainty in market position affects strategic planning',
      recommendations: [
        'Monitor competitor activities closely',
        'Differentiate product offerings',
        'Strengthen customer relationships',
        'Consider strategic partnerships'
      ],
      relatedTrends: ['Competitor Pricing Changes', 'Customer Preference Shifts'],
      dataPoints: [
        { date: '2023-01-01', value: 15.2, baseline: 15.0 },
        { date: '2023-03-01', value: 14.8, baseline: 15.1 },
        { date: '2023-06-01', value: 15.5, baseline: 15.2 },
        { date: '2023-09-01', value: 14.9, baseline: 15.3 },
        { date: '2023-12-01', value: 15.3, baseline: 15.4 }
      ]
    },
    {
      id: 'trend-5',
      name: 'Product Adoption Seasonality',
      description: 'Seasonal pattern in product adoption rates',
      category: 'product',
      type: 'seasonal',
      direction: 'stable',
      magnitude: 0.0,
      confidence: 94.2,
      timeframe: '24 months',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      dataSource: 'Product Analytics',
      significance: 'low',
      impact: 'Predictable patterns help in resource planning',
      recommendations: [
        'Align marketing campaigns with seasonal peaks',
        'Optimize inventory based on seasonal demand',
        'Plan resource allocation accordingly',
        'Develop off-season promotion strategies'
      ],
      relatedTrends: ['Seasonal Revenue Patterns', 'User Engagement Cycles'],
      dataPoints: [
        { date: '2023-01-01', value: 850, baseline: 800 },
        { date: '2023-04-01', value: 1200, baseline: 850 },
        { date: '2023-07-01', value: 950, baseline: 900 },
        { date: '2023-10-01', value: 1400, baseline: 950 },
        { date: '2023-12-01', value: 1100, baseline: 1000 }
      ],
      forecast: {
        nextPeriod: '2024-01-01',
        predictedValue: 900,
        confidence: 91.5,
        upperBound: 950,
        lowerBound: 850
      }
    }
  ];

  const trendAlerts: TrendAlert[] = [
    {
      id: 'alert-1',
      trendId: 'trend-1',
      trendName: 'Customer Churn Rate Increase',
      type: 'threshold',
      severity: 'critical',
      message: 'Customer churn rate has exceeded critical threshold of 6%',
      triggeredAt: '2024-01-15 09:30:00',
      acknowledged: false
    },
    {
      id: 'alert-2',
      trendId: 'trend-2',
      trendName: 'Sales Revenue Growth',
      type: 'opportunity',
      severity: 'info',
      message: 'Sales growth trend presents opportunity for market expansion',
      triggeredAt: '2024-01-15 10:15:00',
      acknowledged: true
    },
    {
      id: 'alert-3',
      trendId: 'trend-3',
      trendName: 'Operational Efficiency Decline',
      type: 'anomaly',
      severity: 'warning',
      message: 'Unusual pattern detected in operational efficiency metrics',
      triggeredAt: '2024-01-15 11:45:00',
      acknowledged: false
    }
  ];

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales':
        return 'text-green-600 bg-green-50';
      case 'customer':
        return 'text-blue-600 bg-blue-50';
      case 'operational':
        return 'text-orange-600 bg-orange-50';
      case 'financial':
        return 'text-purple-600 bg-purple-50';
      case 'market':
        return 'text-indigo-600 bg-indigo-50';
      case 'product':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredTrends = trends.filter(trend => {
    const matchesSearch = trend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trend.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || trend.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTrendData = trends.find(t => t.id === selectedTrend);

  const totalTrends = trends.length;
  const increasingTrends = trends.filter(t => t.direction === 'up').length;
  const decreasingTrends = trends.filter(t => t.direction === 'down').length;
  const criticalTrends = trends.filter(t => t.significance === 'critical').length;
  const avgConfidence = Math.round(
    trends.reduce((acc, t) => acc + t.confidence, 0) / totalTrends
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trend Analysis</h1>
          <p className="text-muted-foreground">
            Identify and analyze business trends for strategic decision-making
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trends</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrends}</div>
            <p className="text-xs text-muted-foreground">
              identified trends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Increasing</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{increasingTrends}</div>
            <p className="text-xs text-muted-foreground">
              upward trends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decreasing</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{decreasingTrends}</div>
            <p className="text-xs text-muted-foreground">
              downward trends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalTrends}</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalTrends > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalTrends} critical trends</strong> identified that require immediate attention. 
            Review and take appropriate action to mitigate negative impacts.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Identified Trends</h3>
              <p className="text-sm text-muted-foreground">
                Review and analyze all identified business trends
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search trends..."
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
                <option value="sales">Sales</option>
                <option value="customer">Customer</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="market">Market</option>
                <option value="product">Product</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends List */}
            <div className="space-y-4">
              {filteredTrends.map((trend) => (
                <Card 
                  key={trend.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTrend === trend.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedTrend(trend.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getDirectionColor(trend.direction)}`}>
                          {getDirectionIcon(trend.direction)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{trend.name}</CardTitle>
                          <CardDescription>{trend.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(trend.category)}>
                          {trend.category}
                        </Badge>
                        <Badge className={getSignificanceColor(trend.significance)}>
                          {trend.significance}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Magnitude:</span>
                        <p className="font-medium">
                          {trend.magnitude > 0 ? '+' : ''}{trend.magnitude}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{trend.confidence}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <p className="font-medium">{trend.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{trend.type}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <LineChart className="w-4 h-4 mr-2" />
                        Visualize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trend Details */}
            <div>
              {selectedTrendData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedTrendData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedTrend(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedTrendData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Trend Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedTrendData.category)}>
                              {selectedTrendData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{selectedTrendData.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Direction:</span>
                            <Badge className={getDirectionColor(selectedTrendData.direction)}>
                              {selectedTrendData.direction}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Significance:</span>
                            <Badge className={getSignificanceColor(selectedTrendData.significance)}>
                              {selectedTrendData.significance}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Magnitude:</span>
                            <span className="font-medium">
                              {selectedTrendData.magnitude > 0 ? '+' : ''}{selectedTrendData.magnitude}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">{selectedTrendData.confidence}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span className="font-medium">{selectedTrendData.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span className="font-medium">{selectedTrendData.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Impact Assessment</h4>
                      <p className="text-sm bg-muted p-3 rounded">
                        {selectedTrendData.impact}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {selectedTrendData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedTrendData.forecast && (
                      <div>
                        <h4 className="font-medium mb-2">Forecast</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-muted-foreground">Next Period:</span>
                              <p className="font-medium">{selectedTrendData.forecast.nextPeriod}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Predicted Value:</span>
                              <p className="font-medium">{selectedTrendData.forecast.predictedValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Confidence:</span>
                              <p className="font-medium">{selectedTrendData.forecast.confidence}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Range:</span>
                              <p className="font-medium">
                                {selectedTrendData.forecast.lowerBound.toLocaleString()} - {selectedTrendData.forecast.upperBound.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">
                        <LineChart className="w-4 h-4 mr-2" />
                        Visualize Trend
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button size="sm" variant="outline">
                        <Target className="w-4 h-4 mr-2" />
                        Set Alert
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
                        Select a trend to view details
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
              <h3 className="text-lg font-medium">Trend Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Monitor alerts and notifications for trend changes
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Alert Settings
            </Button>
          </div>

          <div className="space-y-4">
            {trendAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                         alert.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                         <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{alert.trendName}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.triggeredAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={alert.acknowledged ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}>
                        {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {alert.acknowledged ? 'View' : 'Acknowledge'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Pattern Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Advanced pattern analysis and correlation detection
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Pattern Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Correlation Matrix</CardTitle>
                <CardDescription>
                  Cross-correlation between different trend categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Correlation matrix would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
                <CardDescription>
                  Identified seasonal patterns and cycles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Calendar className="w-12 h-12" />
                  <p className="ml-2">Seasonal patterns would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Trend Forecasting</h3>
              <p className="text-sm text-muted-foreground">
                Predict future trend behavior using ML models
              </p>
            </div>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              Generate Forecasts
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>
                  Historical accuracy of trend forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Accuracy</span>
                    <span className="font-medium">{avgConfidence}%</span>
                  </div>
                  <Progress value={avgConfidence} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Sales Forecasts</span>
                    <span className="font-medium">92.1%</span>
                  </div>
                  <Progress value={92.1} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Customer Forecasts</span>
                    <span className="font-medium">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Forecasts</CardTitle>
                <CardDescription>
                  Scheduled trend forecast generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">Monthly Sales Forecast</div>
                      <div className="text-xs text-muted-foreground">Next: Feb 1, 2024</div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600">Scheduled</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">Customer Churn Analysis</div>
                      <div className="text-xs text-muted-foreground">Next: Feb 15, 2024</div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendAnalysisPage;
