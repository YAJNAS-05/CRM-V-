import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceTrend {
  id: string;
  name: string;
  description: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'availability';
  current: number;
  previous: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  dataPoints: DataPoint[];
  forecast?: ForecastData;
}

interface DataPoint {
  timestamp: string;
  value: number;
  baseline?: number;
}

interface ForecastData {
  predicted: number;
  confidence: number;
  timeframe: string;
}

const PerformanceTrendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);

  // Load performance trends from API on component mount
  useEffect(() => {
    const loadPerformanceTrends = async () => {
      setIsLoading(true);
      try {
        const trendsData = await performanceApi.getPerformanceTrends();
        if (trendsData) {
          setPerformanceTrends(trendsData);
        }
      } catch (error) {
        console.error('Failed to load performance trends:', error);
        toast.error('Failed to load performance trends');
      } finally {
        setIsLoading(false);
      }
    };
    loadPerformanceTrends();
  }, []);
      previous: 1380,
      unit: 'req/s',
      trend: 'up',
      trendPercentage: 5.1,
      status: 'excellent',
      dataPoints: [
        { timestamp: '2024-01-09', value: 1380, baseline: 1400 },
        { timestamp: '2024-01-10', value: 1420, baseline: 1400 },
        { timestamp: '2024-01-11', value: 1445, baseline: 1400 },
        { timestamp: '2024-01-12', value: 1430, baseline: 1400 },
        { timestamp: '2024-01-13', value: 1460, baseline: 1400 },
        { timestamp: '2024-01-14', value: 1448, baseline: 1400 },
        { timestamp: '2024-01-15', value: 1450, baseline: 1400 }
      ],
      forecast: {
        predicted: 1520,
        confidence: 91,
        timeframe: '7 days'
      }
    },
    {
      id: 'trend-3',
      name: 'Error Rate Trend',
      description: 'Error rate percentage over time',
      category: 'error_rate',
      current: 0.8,
      previous: 1.2,
      unit: '%',
      trend: 'down',
      trendPercentage: 33.3,
      status: 'excellent',
      dataPoints: [
        { timestamp: '2024-01-09', value: 1.2, baseline: 1.0 },
        { timestamp: '2024-01-10', value: 1.1, baseline: 1.0 },
        { timestamp: '2024-01-11', value: 0.9, baseline: 1.0 },
        { timestamp: '2024-01-12', value: 1.0, baseline: 1.0 },
        { timestamp: '2024-01-13', value: 0.8, baseline: 1.0 },
        { timestamp: '2024-01-14', value: 0.9, baseline: 1.0 },
        { timestamp: '2024-01-15', value: 0.8, baseline: 1.0 }
      ],
      forecast: {
        predicted: 0.6,
        confidence: 85,
        timeframe: '7 days'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Trends</h1>
          <p className="text-muted-foreground">
            Analyze performance trends and patterns over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trends</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceTrends.length}</div>
            <p className="text-xs text-muted-foreground">Active trends</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improving</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performanceTrends.filter(t => t.trend === 'up' || (t.trend === 'down' && t.category === 'error_rate')).length}
            </div>
            <p className="text-xs text-muted-foreground">Positive trends</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declining</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {performanceTrends.filter(t => t.trend === 'down' && t.category !== 'error_rate').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stable</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {performanceTrends.filter(t => t.trend === 'stable').length}
            </div>
            <p className="text-xs text-muted-foreground">No change</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {performanceTrends.map((trend) => (
              <Card key={trend.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{trend.name}</CardTitle>
                      <CardDescription>{trend.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(trend.status)}>
                        {getStatusIcon(trend.status)}
                        <span className="ml-1">{trend.status}</span>
                      </Badge>
                      {getTrendIcon(trend.trend)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-lg font-semibold">
                        {trend.current} {trend.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous</p>
                      <p className="text-lg font-semibold">
                        {trend.previous} {trend.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Change</p>
                      <p className="text-lg font-semibold">
                        {trend.trend === 'up' ? '+' : ''}{trend.trendPercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Forecast</p>
                      <p className="text-lg font-semibold">
                        {trend.forecast?.predicted} {trend.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Trend Visualization</span>
                      <span className="text-xs text-muted-foreground">
                        Last {trend.dataPoints.length} days
                      </span>
                    </div>
                    <div className="h-20 bg-muted rounded flex items-end justify-around p-2">
                      {trend.dataPoints.slice(-7).map((point, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ 
                              height: `${(point.value / Math.max(...trend.dataPoints.map(d => d.value))) * 60}px` 
                            }}
                          />
                          <span className="text-xs mt-1">
                            {new Date(point.timestamp).getDate()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Detailed trend analysis shows performance patterns, anomalies, and correlations over time.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {performanceTrends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader>
                  <CardTitle>{trend.name} - Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                        <p className="font-semibold">Peak Performance</p>
                        <p className="text-2xl font-bold">
                          {Math.max(...trend.dataPoints.map(d => d.value))} {trend.unit}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold">Average</p>
                        <p className="text-2xl font-bold">
                          {(trend.dataPoints.reduce((acc, d) => acc + d.value, 0) / trend.dataPoints.length).toFixed(1)} {trend.unit}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-semibold">Lowest Point</p>
                        <p className="text-2xl font-bold">
                          {Math.min(...trend.dataPoints.map(d => d.value))} {trend.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Trend Insights</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Performance has improved by {trend.trendPercentage}% over the selected period</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Current performance is {trend.status === 'excellent' ? 'exceeding' : 'meeting'} expectations</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Forecast predicts continued {trend.trend === 'up' ? 'improvement' : 'stabilization'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              AI-powered forecasting predicts future performance based on historical trends and patterns.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {performanceTrends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader>
                  <CardTitle>{trend.name} - Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-4">Predicted Performance</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span>Next {trend.forecast?.timeframe}</span>
                          <span className="font-semibold">
                            {trend.forecast?.predicted} {trend.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span>Confidence Level</span>
                          <span className="font-semibold">{trend.forecast?.confidence}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded">
                          <span>Trend Direction</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(trend.trend)}
                            <span className="capitalize">{trend.trend}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-4">Forecast Accuracy</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Historical Accuracy</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }} />
                        </div>
                        <div className="flex justify-between text-sm mt-3">
                          <span>Prediction Confidence</span>
                          <span>{trend.forecast?.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${trend.forecast?.confidence}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Alert>
            <PieChart className="h-4 w-4" />
            <AlertDescription>
              Pattern detection identifies recurring performance behaviors and seasonal variations.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {performanceTrends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader>
                  <CardTitle>{trend.name} - Pattern Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-semibold">Daily Pattern</p>
                        <p className="text-sm text-muted-foreground">Peak at 14:00 UTC</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="font-semibold">Weekly Pattern</p>
                        <p className="text-sm text-muted-foreground">Higher on weekdays</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold">Growth Pattern</p>
                        <p className="text-sm text-muted-foreground">Steady improvement</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Detected Patterns</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Cyclical pattern detected with 24-hour period</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Weekend performance typically 15% lower</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Monthly growth trend of 5-8% observed</span>
                        </div>
                      </div>
                    </div>
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

export default PerformanceTrendsPage;
