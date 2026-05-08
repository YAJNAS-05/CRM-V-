import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Zap, TrendingUp, TrendingDown, Activity, Clock, Download, Upload, Server, Database, Globe, Monitor, Smartphone, AlertTriangle, CheckCircle, Settings, RefreshCw, Play, Pause, BarChart3, PieChart, Target, Gauge } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceData {
  timestamp: string;
  loadTime: number;
  renderTime: number;
  apiTime: number;
  memoryUsage: number;
  cpuUsage: number;
  requests: number;
  errors: number;
}

interface Optimization {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedGain: number;
}

const UXEnhancementPerformancePage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(false);

  const performanceMetrics: PerformanceMetric[] = [
    { name: 'Page Load Time', current: 2.1, previous: 2.8, unit: 's', threshold: 3, status: 'good' },
    { name: 'First Contentful Paint', current: 1.2, previous: 1.5, unit: 's', threshold: 2, status: 'good' },
    { name: 'Time to Interactive', current: 3.5, previous: 4.2, unit: 's', threshold: 5, status: 'good' },
    { name: 'Memory Usage', current: 68, previous: 72, unit: '%', threshold: 80, status: 'good' },
    { name: 'CPU Usage', current: 45, previous: 52, unit: '%', threshold: 70, status: 'good' },
    { name: 'API Response Time', current: 320, previous: 380, unit: 'ms', threshold: 500, status: 'good' },
    { name: 'Bundle Size', current: 2.8, previous: 3.2, unit: 'MB', threshold: 4, status: 'good' },
    { name: 'Error Rate', current: 0.2, previous: 0.5, unit: '%', threshold: 1, status: 'good' },
  ];

  const performanceData: PerformanceData[] = [
    { timestamp: '00:00', loadTime: 2.5, renderTime: 0.8, apiTime: 280, memoryUsage: 65, cpuUsage: 42, requests: 120, errors: 2 },
    { timestamp: '04:00', loadTime: 2.2, renderTime: 0.7, apiTime: 260, memoryUsage: 62, cpuUsage: 38, requests: 80, errors: 1 },
    { timestamp: '08:00', loadTime: 2.8, renderTime: 0.9, apiTime: 320, memoryUsage: 70, cpuUsage: 48, requests: 200, errors: 3 },
    { timestamp: '12:00', loadTime: 3.1, renderTime: 1.0, apiTime: 350, memoryUsage: 75, cpuUsage: 55, requests: 280, errors: 5 },
    { timestamp: '16:00', loadTime: 2.9, renderTime: 0.9, apiTime: 330, memoryUsage: 72, cpuUsage: 50, requests: 240, errors: 4 },
    { timestamp: '20:00', loadTime: 2.4, renderTime: 0.8, apiTime: 290, memoryUsage: 66, cpuUsage: 44, requests: 150, errors: 2 },
  ];

  const optimizations: Optimization[] = [
    {
      id: 'opt1',
      name: 'Image Lazy Loading',
      description: 'Implement lazy loading for below-the-fold images',
      category: 'frontend',
      impact: 'high',
      effort: 'medium',
      status: 'completed',
      estimatedGain: 15
    },
    {
      id: 'opt2',
      name: 'API Response Caching',
      description: 'Cache frequently accessed API responses',
      category: 'backend',
      impact: 'high',
      effort: 'low',
      status: 'in-progress',
      estimatedGain: 25
    },
    {
      id: 'opt3',
      name: 'Code Splitting',
      description: 'Split application code into smaller chunks',
      category: 'frontend',
      impact: 'medium',
      effort: 'medium',
      status: 'pending',
      estimatedGain: 20
    },
    {
      id: 'opt4',
      name: 'Database Query Optimization',
      description: 'Optimize slow database queries',
      category: 'backend',
      impact: 'high',
      effort: 'high',
      status: 'pending',
      estimatedGain: 30
    },
    {
      id: 'opt5',
      name: 'Service Worker Implementation',
      description: 'Add service worker for offline functionality',
      category: 'frontend',
      impact: 'medium',
      effort: 'high',
      status: 'pending',
      estimatedGain: 18
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      good: 'default',
      warning: 'secondary',
      critical: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default'
    };
    return <Badge variant={variants[impact] || 'outline'}>{impact}</Badge>;
  };

  const getEffortBadge = (effort: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'destructive'
    };
    return <Badge variant={variants[effort] || 'outline'}>{effort}</Badge>;
  };

  const overallScore = Math.round(
    performanceMetrics.reduce((acc, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20;
      return acc + score;
    }, 0) / performanceMetrics.length
  );

  const handleOptimize = () => {
    setAutoOptimize(true);
    setTimeout(() => {
      setAutoOptimize(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">Monitor and optimize application performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleOptimize} disabled={autoOptimize}>
            {autoOptimize ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {autoOptimize ? 'Optimizing...' : 'Auto Optimize'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                <p className="text-2xl font-bold">{overallScore}</p>
              </div>
              <Gauge className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Load Time</p>
                <p className="text-2xl font-bold">2.1s</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">-25% from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
              <Server className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">0.2%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">-60% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <h3 className="font-medium">{metric.name}</h3>
                        {getStatusBadge(metric.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Current: {metric.current}{metric.unit}</span>
                        <span>Previous: {metric.previous}{metric.unit}</span>
                        <span>Threshold: {metric.threshold}{metric.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Change</div>
                        <div className={`flex items-center gap-1 ${metric.current < metric.previous ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.current < metric.previous ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          {Math.abs(((metric.current - metric.previous) / metric.previous) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Load Time Trends</CardTitle>
                <CardDescription>Page load performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="loadTime" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="renderTime" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Memory and CPU utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="memoryUsage" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                    <Area type="monotone" dataKey="cpuUsage" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>API response times and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="apiTime" fill="#ef4444" />
                    <Bar dataKey="requests" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>Error rates and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimizations</CardTitle>
              <CardDescription>Recommended and implemented optimizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map(opt => (
                  <div key={opt.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{opt.name}</h3>
                          <Badge variant="outline">{opt.category}</Badge>
                          {getImpactBadge(opt.impact)}
                          {getEffortBadge(opt.effort)}
                          <Badge variant={opt.status === 'completed' ? 'default' : opt.status === 'in-progress' ? 'secondary' : 'outline'}>
                            {opt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{opt.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Estimated Gain: {opt.estimatedGain}%</span>
                          {opt.status === 'completed' && (
                            <span className="text-green-600">✓ Implemented</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {opt.status === 'pending' && (
                          <Button size="sm">Implement</Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>Active performance alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Systems Optimal</h3>
                <p className="text-muted-foreground">No performance alerts at this time</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementPerformancePage;
