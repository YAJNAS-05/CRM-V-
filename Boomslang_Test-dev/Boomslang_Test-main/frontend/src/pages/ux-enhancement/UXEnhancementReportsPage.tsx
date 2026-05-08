import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Upload, Plus, Edit, Trash2, Search, Filter, Eye, EyeOff, Settings, Zap, Save, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, TrendingDown, Clock, Star, Calendar, FileText, BarChart3, PieChartIcon, Activity, Target, Globe, Smartphone, Monitor } from 'lucide-react';

interface UXReport {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'usage' | 'satisfaction' | 'accessibility' | 'custom';
  category: string;
  status: 'active' | 'inactive' | 'draft';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'excel' | 'csv' | 'dashboard';
  recipients: string[];
  lastGenerated: string;
  nextScheduled: string;
  data: {
    metrics: number;
    period: string;
    insights: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  charts: string[];
  usage: number;
  rating: number;
  featured: boolean;
}

interface ReportSchedule {
  id: string;
  reportId: string;
  reportName: string;
  frequency: string;
  recipients: string[];
  nextRun: string;
  status: 'active' | 'paused' | 'completed';
}

const UXEnhancementReportsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const uxReports: UXReport[] = [
    {
      id: 'report1',
      name: 'Weekly Performance Report',
      description: 'Comprehensive performance metrics and analysis',
      type: 'performance',
      category: 'analytics',
      status: 'active',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['john@example.com', 'jane@example.com'],
      lastGenerated: '2024-01-15T10:30:00Z',
      nextScheduled: '2024-01-22T10:30:00Z',
      data: {
        metrics: 45,
        period: '7 days',
        insights: 12
      }
    },
    {
      id: 'report2',
      name: 'User Satisfaction Survey',
      description: 'User feedback and satisfaction metrics',
      type: 'satisfaction',
      category: 'feedback',
      status: 'active',
      frequency: 'monthly',
      format: 'dashboard',
      recipients: ['manager@example.com'],
      lastGenerated: '2024-01-01T09:00:00Z',
      nextScheduled: '2024-02-01T09:00:00Z',
      data: {
        metrics: 28,
        period: '30 days',
        insights: 8
      }
    },
    {
      id: 'report3',
      name: 'Accessibility Compliance',
      description: 'WCAG compliance and accessibility metrics',
      type: 'accessibility',
      category: 'compliance',
      status: 'active',
      frequency: 'quarterly',
      format: 'excel',
      recipients: ['compliance@example.com'],
      lastGenerated: '2024-01-10T14:20:00Z',
      nextScheduled: '2024-04-10T14:20:00Z',
      data: {
        metrics: 67,
        period: '90 days',
        insights: 15
      }
    },
    {
      id: 'report4',
      name: 'Feature Usage Analytics',
      description: 'Detailed feature usage and adoption metrics',
      type: 'usage',
      category: 'analytics',
      status: 'draft',
      frequency: 'weekly',
      format: 'csv',
      recipients: ['product@example.com'],
      lastGenerated: '',
      nextScheduled: '',
      data: {
        metrics: 34,
        period: '7 days',
        insights: 6
      }
    },
    {
      id: 'report5',
      name: 'Mobile Experience Report',
      description: 'Mobile-specific UX metrics and performance',
      type: 'custom',
      category: 'mobile',
      status: 'active',
      frequency: 'monthly',
      format: 'dashboard',
      recipients: ['mobile@example.com'],
      lastGenerated: '2024-01-05T11:15:00Z',
      nextScheduled: '2024-02-05T11:15:00Z',
      data: {
        metrics: 23,
        period: '30 days',
        insights: 5
      }
    },
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'template1',
      name: 'Executive Dashboard',
      description: 'High-level metrics for executive stakeholders',
      category: 'executive',
      metrics: ['User Satisfaction', 'Performance Score', 'Adoption Rate'],
      charts: ['line', 'bar', 'pie'],
      usage: 156,
      rating: 4.7,
      featured: true
    },
    {
      id: 'template2',
      name: 'Technical Performance',
      description: 'Detailed technical performance metrics',
      category: 'technical',
      metrics: ['Load Time', 'Error Rate', 'API Response'],
      charts: ['line', 'area'],
      usage: 89,
      rating: 4.5,
      featured: false
    },
    {
      id: 'template3',
      name: 'User Behavior Analysis',
      description: 'User journey and behavior patterns',
      category: 'behavior',
      metrics: ['Page Views', 'Session Duration', 'Bounce Rate'],
      charts: ['funnel', 'heatmap', 'line'],
      usage: 234,
      rating: 4.6,
      featured: true
    },
  ];

  const reportSchedules: ReportSchedule[] = [
    {
      id: 'schedule1',
      reportId: 'report1',
      reportName: 'Weekly Performance Report',
      frequency: 'weekly',
      recipients: ['john@example.com', 'jane@example.com'],
      nextRun: '2024-01-22T10:30:00Z',
      status: 'active'
    },
    {
      id: 'schedule2',
      reportId: 'report2',
      reportName: 'User Satisfaction Survey',
      frequency: 'monthly',
      recipients: ['manager@example.com'],
      nextRun: '2024-02-01T09:00:00Z',
      status: 'active'
    },
    {
      id: 'schedule3',
      reportId: 'report3',
      reportName: 'Accessibility Compliance',
      frequency: 'quarterly',
      recipients: ['compliance@example.com'],
      nextRun: '2024-04-10T14:20:00Z',
      status: 'active'
    },
  ];

  const performanceData = [
    { name: 'Mon', performance: 85, satisfaction: 88, usage: 1200 },
    { name: 'Tue', performance: 87, satisfaction: 90, usage: 1350 },
    { name: 'Wed', performance: 89, satisfaction: 92, usage: 1400 },
    { name: 'Thu', performance: 86, satisfaction: 89, usage: 1380 },
    { name: 'Fri', performance: 88, satisfaction: 91, usage: 1450 },
    { name: 'Sat', performance: 82, satisfaction: 85, usage: 900 },
    { name: 'Sun', performance: 80, satisfaction: 83, usage: 850 },
  ];

  const satisfactionData = [
    { name: 'Very Satisfied', value: 45, color: '#10b981' },
    { name: 'Satisfied', value: 30, color: '#3b82f6' },
    { name: 'Neutral', value: 15, color: '#f59e0b' },
    { name: 'Dissatisfied', value: 7, color: '#ef4444' },
    { name: 'Very Dissatisfied', value: 3, color: '#991b1b' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'usage':
        return <Activity className="h-4 w-4" />;
      case 'satisfaction':
        return <Star className="h-4 w-4" />;
      case 'accessibility':
        return <CheckCircle className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      draft: 'secondary',
      paused: 'outline',
      completed: 'default'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getFrequencyBadge = (frequency: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      daily: 'destructive',
      weekly: 'default',
      monthly: 'secondary',
      quarterly: 'outline'
    };
    return <Badge variant={variants[frequency] || 'outline'}>{frequency}</Badge>;
  };

  const activeReports = uxReports.filter(report => report.status === 'active').length;
  const totalRecipients = uxReports.reduce((acc, report) => acc + report.recipients.length, 0);
  const averageMetrics = uxReports.filter(report => report.data.metrics > 0)
    .reduce((acc, report) => acc + report.data.metrics, 0) / 
  uxReports.filter(report => report.data.metrics > 0).length;

  const filteredReports = uxReports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UX Reports</h1>
          <p className="text-muted-foreground">Generate and manage UX enhancement reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Reports</p>
                <p className="text-2xl font-bold">{activeReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{totalRecipients}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Metrics</p>
                <p className="text-2xl font-bold">{Math.round(averageMetrics)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>UX Reports</CardTitle>
                  <CardDescription>Manage automated and manual UX reports</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Generate</label>
                    <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Email Notifications</label>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="satisfaction">Satisfaction</SelectItem>
                    <SelectItem value="accessibility">Accessibility</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(report.status)}
                          {getTypeIcon(report.type)}
                          <h3 className="font-medium">{report.name}</h3>
                          {getStatusBadge(report.status)}
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge variant="secondary">{report.category}</Badge>
                          {getFrequencyBadge(report.frequency)}
                          <Badge variant="outline">{report.format}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Recipients: {report.recipients.length}</span>
                          <span>•</span>
                          <span>Metrics: {report.data.metrics}</span>
                          <span>•</span>
                          <span>Insights: {report.data.insights}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Last Generated: {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}</span>
                          <span>•</span>
                          <span>Next Scheduled: {report.nextScheduled ? new Date(report.nextScheduled).toLocaleDateString() : 'Not scheduled'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-built report templates for quick setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {reportTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.featured && <Badge variant="default">Featured</Badge>}
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span>Usage: {template.usage}</span>
                          <span>•</span>
                          <span>Rating: {template.rating} ⭐</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Metrics:</span>
                          {template.metrics.map(metric => (
                            <Badge key={metric} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">Charts:</span>
                          {template.charts.map(chart => (
                            <Badge key={chart} variant="outline" className="text-xs">
                              {chart}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Schedule</CardTitle>
              <CardDescription>Manage automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportSchedules.map(schedule => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{schedule.reportName}</h3>
                          {getStatusBadge(schedule.status)}
                          {getFrequencyBadge(schedule.frequency)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Next Run: {new Date(schedule.nextRun).toLocaleString()}</span>
                          <span>•</span>
                          <span>Recipients: {schedule.recipients.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {schedule.recipients.map(recipient => (
                            <Badge key={recipient} variant="outline" className="text-xs">
                              {recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Weekly performance and satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementReportsPage;
