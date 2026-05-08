import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, Clock, Zap, AlertCircle, CheckCircle, Activity, BarChart3, PieChartIcon, Filter, Download, Calendar } from 'lucide-react';

interface AnalyticsData {
  period: string;
  users: number;
  engagement: number;
  satisfaction: number;
  performance: number;
  errors: number;
}

interface FeatureAnalytics {
  featureId: string;
  featureName: string;
  usage: number;
  satisfaction: number;
  performance: number;
  issues: number;
  trend: 'up' | 'down' | 'stable';
}

const UXEnhancementAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const analyticsData: AnalyticsData[] = [
    { period: 'Mon', users: 1200, engagement: 85, satisfaction: 92, performance: 88, errors: 12 },
    { period: 'Tue', users: 1350, engagement: 87, satisfaction: 91, performance: 90, errors: 10 },
    { period: 'Wed', users: 1400, engagement: 89, satisfaction: 93, performance: 89, errors: 8 },
    { period: 'Thu', users: 1380, engagement: 86, satisfaction: 90, performance: 91, errors: 11 },
    { period: 'Fri', users: 1450, engagement: 88, satisfaction: 94, performance: 92, errors: 7 },
    { period: 'Sat', users: 900, engagement: 82, satisfaction: 89, performance: 87, errors: 15 },
    { period: 'Sun', users: 850, engagement: 80, satisfaction: 88, performance: 85, errors: 18 },
  ];

  const featureAnalytics: FeatureAnalytics[] = [
    { featureId: 'dark-mode', featureName: 'Dark Mode', usage: 85, satisfaction: 92, performance: 95, issues: 2, trend: 'up' },
    { featureId: 'shortcuts', featureName: 'Keyboard Shortcuts', usage: 72, satisfaction: 88, performance: 98, issues: 5, trend: 'up' },
    { featureId: 'search', featureName: 'Enhanced Search', usage: 90, satisfaction: 85, performance: 82, issues: 12, trend: 'stable' },
    { featureId: 'notifications', featureName: 'Smart Notifications', usage: 78, satisfaction: 90, performance: 88, issues: 8, trend: 'down' },
    { featureId: 'dashboard', featureName: 'Customizable Dashboard', usage: 65, satisfaction: 87, performance: 90, issues: 6, trend: 'up' },
  ];

  const satisfactionData = [
    { name: 'Very Satisfied', value: 45, color: '#10b981' },
    { name: 'Satisfied', value: 30, color: '#3b82f6' },
    { name: 'Neutral', value: 15, color: '#f59e0b' },
    { name: 'Dissatisfied', value: 7, color: '#ef4444' },
    { name: 'Very Dissatisfied', value: 3, color: '#991b1b' },
  ];

  const keyMetrics = [
    { title: 'Total Users', value: '9,530', change: '+12.5%', trend: 'up', icon: Users },
    { title: 'Avg Engagement', value: '85.2%', change: '+3.1%', trend: 'up', icon: Activity },
    { title: 'Satisfaction Score', value: '4.6/5', change: '+0.2', trend: 'up', icon: CheckCircle },
    { title: 'Performance Score', value: '89.1%', change: '-1.2%', trend: 'down', icon: Zap },
    { title: 'Error Rate', value: '2.3%', change: '-0.8%', trend: 'down', icon: AlertCircle },
    { title: 'Avg Session Time', value: '24m', change: '+2m', trend: 'up', icon: Clock },
  ];

  const handleExportData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UX Enhancement Analytics</h1>
          <p className="text-muted-foreground">Monitor and analyze user experience metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {metric.change}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Analytics</TabsTrigger>
          <TabsTrigger value="satisfaction">User Satisfaction</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
                <CardDescription>Daily user engagement and activity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate Analysis</CardTitle>
                <CardDescription>System errors and issues over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Performance Analytics</CardTitle>
              <CardDescription>Detailed metrics for individual UX enhancements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureAnalytics.map((feature) => (
                  <div key={feature.featureId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{feature.featureName}</h3>
                        <Badge variant={feature.trend === 'up' ? 'default' : feature.trend === 'down' ? 'destructive' : 'secondary'}>
                          {feature.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                           feature.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                          {feature.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Usage</div>
                          <div className="font-medium">{feature.usage}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                          <div className="font-medium">{feature.satisfaction}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Performance</div>
                          <div className="font-medium">{feature.performance}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Issues</div>
                          <div className="font-medium">{feature.issues}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Distribution</CardTitle>
                <CardDescription>User satisfaction rating breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={satisfactionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {satisfactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Trends</CardTitle>
                <CardDescription>Satisfaction scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and responsiveness data</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementAnalyticsPage;
