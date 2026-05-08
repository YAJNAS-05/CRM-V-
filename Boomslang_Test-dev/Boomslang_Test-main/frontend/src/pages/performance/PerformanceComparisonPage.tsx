import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Clock,
  Zap,
  Users,
  Server
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceComparison {
  id: string;
  name: string;
  description: string;
  period1: {
    name: string;
    startDate: string;
    endDate: string;
  };
  period2: {
    name: string;
    startDate: string;
    endDate: string;
  };
  metrics: {
    responseTimeChange: number;
    throughputChange: number;
    errorRateChange: number;
    resourceUtilizationChange: number;
    overallScore: number;
  };
  insights: string[];
  recommendations: string[];
}

interface ComparisonMetric {
  name: string;
  period1Value: number;
  period2Value: number;
  unit: string;
  change: number;
  changeType: 'improvement' | 'degradation' | 'neutral';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const PerformanceComparisonPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceComparisons, setPerformanceComparisons] = useState<PerformanceComparison[]>([]);

  // Load performance comparisons from API on component mount
  useEffect(() => {
    const loadPerformanceComparisons = async () => {
      setIsLoading(true);
      try {
        const comparisonsData = await performanceApi.getPerformanceComparisons();
        if (comparisonsData) {
          setPerformanceComparisons(comparisonsData);
        }
      } catch (error) {
        console.error('Failed to load performance comparisons:', error);
        toast.error('Failed to load performance comparisons');
      } finally {
        setIsLoading(false);
      }
    };
    loadPerformanceComparisons();
  }, []);
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      period2: {
        name: 'Last Month',
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      },
      metrics: {
        responseTimeChange: -12.3,
        throughputChange: 18.7,
        errorRateChange: -45.2,
        resourceUtilizationChange: 8.9,
        overallScore: 92
      },
      insights: [
        'Significant improvement in all performance metrics',
        'Error rate reduction of 45.2% shows improved stability',
        'Throughput increase of 18.7% indicates better scalability',
        'Resource utilization optimization successful'
      ],
      recommendations: [
        'Document successful optimization strategies',
        'Plan for increased traffic capacity',
        'Implement proactive monitoring for new thresholds'
      ]
    },
    {
      id: 'comp-3',
      name: 'Environment Comparison',
      description: 'Compare production vs staging performance',
      period1: {
        name: 'Production',
        startDate: '2024-01-14',
        endDate: '2024-01-15'
      },
      period2: {
        name: 'Staging',
        startDate: '2024-01-14',
        endDate: '2024-01-15'
      },
      metrics: {
        responseTimeChange: 15.2,
        throughputChange: -8.3,
        errorRateChange: 5.6,
        resourceUtilizationChange: 12.7,
        overallScore: 78
      },
      insights: [
        'Production shows 15.2% higher response times than staging',
        'Staging environment handles 8.3% more throughput',
        'Error rates are comparable between environments',
        'Resource utilization higher in production'
      ],
      recommendations: [
        'Investigate production response time differences',
        'Align staging environment with production specs',
        'Consider production-specific optimizations'
      ]
    }
  ];

  const comparisonMetrics: ComparisonMetric[] = [
    {
      name: 'Average Response Time',
      period1Value: 245,
      period2Value: 268,
      unit: 'ms',
      change: -8.6,
      changeType: 'improvement',
      status: 'good'
    },
    {
      name: 'Peak Throughput',
      period1Value: 1450,
      period2Value: 1380,
      unit: 'req/s',
      change: 5.1,
      changeType: 'improvement',
      status: 'excellent'
    },
    {
      name: 'Error Rate',
      period1Value: 0.8,
      period2Value: 1.2,
      unit: '%',
      change: -33.3,
      changeType: 'improvement',
      status: 'excellent'
    },
    {
      name: 'Resource Utilization',
      period1Value: 68.5,
      period2Value: 66.9,
      unit: '%',
      change: 2.4,
      changeType: 'degradation',
      status: 'good'
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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number, metric: string) => {
    if (metric === 'Error Rate' || metric === 'Response Time') {
      return change < 0 ? 'text-green-600' : 'text-red-600';
    }
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Comparison</h1>
          <p className="text-muted-foreground">
            Compare performance metrics across different time periods and environments
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
            <CardTitle className="text-sm font-medium">Total Comparisons</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceComparisons.length}</div>
            <p className="text-xs text-muted-foreground">Active comparisons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {comparisonMetrics.filter(m => m.changeType === 'improvement').length}
            </div>
            <p className="text-xs text-muted-foreground">Positive changes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degradations</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {comparisonMetrics.filter(m => m.changeType === 'degradation').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(performanceComparisons.reduce((acc, c) => acc + c.metrics.overallScore, 0) / performanceComparisons.length)}
            </div>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metric Details</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {performanceComparisons.map((comparison) => (
              <Card key={comparison.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{comparison.name}</CardTitle>
                      <CardDescription>{comparison.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(
                      comparison.metrics.overallScore >= 90 ? 'excellent' : 
                      comparison.metrics.overallScore >= 80 ? 'good' : 
                      comparison.metrics.overallScore >= 70 ? 'warning' : 'critical'
                    )}>
                      Score: {comparison.metrics.overallScore}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">{comparison.period1.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comparison.period1.startDate} to {comparison.period1.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600">{comparison.period2.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comparison.period2.startDate} to {comparison.period2.endDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.responseTimeChange}%</span>
                        {getChangeIcon(comparison.metrics.responseTimeChange)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Throughput:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.throughputChange}%</span>
                        {getChangeIcon(comparison.metrics.throughputChange)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.errorRateChange}%</span>
                        {getChangeIcon(comparison.metrics.errorRateChange)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resources:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{comparison.metrics.resourceUtilizationChange}%</span>
                        {getChangeIcon(comparison.metrics.resourceUtilizationChange)}
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
                      {comparison.insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Detailed metric comparison shows specific performance changes across different dimensions.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {comparisonMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.name}</span>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Period 1</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {metric.period1Value} {metric.unit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Change</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-2xl font-bold ${getChangeColor(metric.change, metric.name)}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                        {getChangeIcon(metric.change)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Period 2</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {metric.period2Value} {metric.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          metric.changeType === 'improvement' ? 'bg-green-500' : 
                          metric.changeType === 'degradation' ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs(metric.change), 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {metric.changeType === 'improvement' ? 'Improvement' : 
                       metric.changeType === 'degradation' ? 'Degradation' : 'No Change'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              Performance insights provide actionable intelligence from comparison data.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {performanceComparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardHeader>
                  <CardTitle>{comparison.name} - Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Positive Trends
                        </h5>
                        <div className="space-y-1">
                          {comparison.insights
                            .filter(insight => 
                              insight.includes('improved') || 
                              insight.includes('increased') || 
                              insight.includes('decreased') && insight.includes('error')
                            )
                            .map((insight, index) => (
                              <div key={index} className="text-sm p-2 bg-green-50 border border-green-200 rounded">
                                {insight}
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Areas of Concern
                        </h5>
                        <div className="space-y-1">
                          {comparison.insights
                            .filter(insight => 
                              insight.includes('higher') || 
                              insight.includes('increased') && !insight.includes('throughput')
                            )
                            .map((insight, index) => (
                              <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                                {insight}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-4 bg-muted rounded">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                        <p className="font-semibold">Performance Impact</p>
                        <p className="text-sm text-muted-foreground">
                          {comparison.metrics.overallScore >= 90 ? 'Highly Positive' : 
                           comparison.metrics.overallScore >= 80 ? 'Positive' : 
                           comparison.metrics.overallScore >= 70 ? 'Moderate' : 'Needs Attention'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-semibold">User Experience</p>
                        <p className="text-sm text-muted-foreground">
                          {comparison.metrics.responseTimeChange < 0 ? 'Improved' : 'Degraded'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <Server className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold">System Health</p>
                        <p className="text-sm text-muted-foreground">
                          {comparison.metrics.errorRateChange < 0 ? 'Better' : 'Worse'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Actionable recommendations based on performance comparison analysis.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {performanceComparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardHeader>
                  <CardTitle>{comparison.name} - Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Immediate Actions
                        </h5>
                        <div className="space-y-2">
                          {comparison.recommendations
                            .filter(rec => 
                              rec.includes('Monitor') || 
                              rec.includes('Investigate') || 
                              rec.includes('Consider')
                            )
                            .map((recommendation, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{recommendation}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-600" />
                          Strategic Planning
                        </h5>
                        <div className="space-y-2">
                          {comparison.recommendations
                            .filter(rec => 
                              rec.includes('Document') || 
                              rec.includes('Plan') || 
                              rec.includes('Implement')
                            )
                            .map((recommendation, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{recommendation}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-muted rounded">
                      <h5 className="font-medium mb-2">Priority Matrix</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-600">High Priority</p>
                          <p className="text-muted-foreground">
                            {comparison.metrics.errorRateChange < -20 ? 'Error rate optimization' : 
                             comparison.metrics.responseTimeChange > 10 ? 'Response time investigation' : 
                             'Continue monitoring'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-600">Medium Priority</p>
                          <p className="text-muted-foreground">
                            {comparison.metrics.throughputChange > 15 ? 'Capacity planning' : 
                             comparison.metrics.resourceUtilizationChange > 5 ? 'Resource optimization' : 
                             'Performance documentation'}
                          </p>
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

export default PerformanceComparisonPage;
