import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  FileText, 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  Download,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Eye,
  Settings,
  Calendar,
  Clock,
  Timer,
  Gauge,
  Zap,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Users,
  Mail,
  Share2,
  Printer,
  FileSpreadsheet,
  FileImage,
  File,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Send,
  Schedule,
  Bell,
  BellOff,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Filter as FilterIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceReport {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom' | 'realtime';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  createdAt: string;
  generatedAt?: string;
  generatedBy: string;
  category: 'overview' | 'detailed' | 'comparison' | 'trend' | 'alert';
  format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  size: number;
  downloadUrl?: string;
  metrics: ReportMetrics;
  sections: ReportSection[];
  recipients: ReportRecipient[];
  schedule?: ReportSchedule;
}

interface ReportMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  resourceUtilization: number;
  userSatisfaction: number;
  overallScore: number;
}

interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'heatmap';
  enabled: boolean;
  order: number;
  data?: any;
}

interface ReportRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

interface ReportSchedule {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  timezone: string;
  nextRun: string;
  lastRun?: string;
  recipients: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: ReportSection[];
  defaultFormat: string;
  defaultRecipients: string[];
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
}

interface ReportDashboard {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'technical' | 'operational';
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshInterval: number;
  lastUpdated: string;
}

interface DashboardWidget {
  id: string;
  name: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'heatmap';
  position: { x: number; y: number; w: number; h: number };
  dataSource: string;
  config: WidgetConfig;
}

interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

interface WidgetConfig {
  title: string;
  subtitle?: string;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  timeRange?: string;
  aggregation?: string;
}

const PerformanceReportingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [performanceReports, setPerformanceReports] = useState<PerformanceReport[]>([]);
  const [loading, setLoading] = useState(false);

  // Load performance reports from API on component mount
  useEffect(() => {
    const loadPerformanceReports = async () => {
      setLoading(true);
      try {
        const reportsData = await performanceApi.getPerformanceReports();
        if (reportsData) {
          setPerformanceReports(reportsData);
        }
      } catch (error) {
        console.error('Failed to load performance reports:', error);
        toast.error('Failed to load performance reports');
      } finally {
        setLoading(false);
      }
    };
    loadPerformanceReports();
  }, []);
      createdAt: '2024-01-15 06:00:00',
      generatedAt: '2024-01-15 06:15:00',
      generatedBy: 'Analytics Team',
      category: 'detailed',
      format: 'excel',
      size: 5242880,
      downloadUrl: '/reports/weekly-performance-2024-01-15.xlsx',
      metrics: {
        responseTime: 252,
        throughput: 1420,
        errorRate: 1.1,
        uptime: 99.7,
        resourceUtilization: 76.8,
        userSatisfaction: 90,
        overallScore: 84
      },
      sections: [
        { id: 'sec-5', name: 'Weekly Overview', type: 'summary', enabled: true, order: 1 },
        { id: 'sec-6', name: 'Performance Trends', type: 'chart', enabled: true, order: 2 },
        { id: 'sec-7', name: 'Resource Analysis', type: 'chart', enabled: true, order: 3 },
        { id: 'sec-8', name: 'Incident Report', type: 'table', enabled: true, order: 4 },
        { id: 'sec-9', name: 'Recommendations', type: 'text', enabled: true, order: 5 }
      ],
      recipients: [
        { id: 'rec-3', email: 'director@company.com', name: 'Sarah Director', role: 'Director', frequency: 'weekly', enabled: true },
        { id: 'rec-4', email: 'architect@company.com', name: 'Mike Architect', role: 'Architect', frequency: 'weekly', enabled: true }
      ],
      schedule: {
        enabled: true,
        frequency: 'weekly',
        timezone: 'UTC',
        nextRun: '2024-01-22 06:00:00',
        lastRun: '2024-01-15 06:00:00',
        recipients: ['director@company.com', 'architect@company.com']
      }
    },
    {
      id: 'report-3',
      name: 'Monthly Performance Review',
      description: 'Monthly performance review for executive stakeholders',
      type: 'monthly',
      status: 'generating',
      createdAt: '2024-01-15 00:00:00',
      generatedBy: 'System',
      category: 'overview',
      format: 'pdf',
      size: 0,
      metrics: {
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        uptime: 0,
        resourceUtilization: 0,
        userSatisfaction: 0,
        overallScore: 0
      },
      sections: [
        { id: 'sec-10', name: 'Monthly Summary', type: 'summary', enabled: true, order: 1 },
        { id: 'sec-11', name: 'KPI Dashboard', type: 'chart', enabled: true, order: 2 },
        { id: 'sec-12', name: 'Performance vs Targets', type: 'chart', enabled: true, order: 3 }
      ],
      recipients: [
        { id: 'rec-5', email: 'ceo@company.com', name: 'CEO', role: 'CEO', frequency: 'monthly', enabled: true }
      ],
      schedule: {
        enabled: true,
        frequency: 'monthly',
        timezone: 'UTC',
        nextRun: '2024-02-01 00:00:00',
        recipients: ['ceo@company.com']
      }
    },
    {
      id: 'report-4',
      name: 'Real-time Performance Dashboard',
      description: 'Real-time performance monitoring dashboard',
      type: 'realtime',
      status: 'completed',
      createdAt: '2024-01-15 09:00:00',
      generatedAt: '2024-01-15 09:00:00',
      generatedBy: 'System',
      category: 'overview',
      format: 'html',
      size: 1048576,
      downloadUrl: '/reports/realtime-dashboard.html',
      metrics: {
        responseTime: 238,
        throughput: 1480,
        errorRate: 0.6,
        uptime: 99.95,
        resourceUtilization: 73.2,
        userSatisfaction: 93,
        overallScore: 89
      },
      sections: [
        { id: 'sec-13', name: 'Live Metrics', type: 'metric', enabled: true, order: 1 },
        { id: 'sec-14', name: 'Real-time Charts', type: 'chart', enabled: true, order: 2 },
        { id: 'sec-15', name: 'Active Alerts', type: 'table', enabled: true, order: 3 }
      ],
      recipients: [
        { id: 'rec-6', email: 'ops@company.com', name: 'Operations Team', role: 'Operations', frequency: 'immediate', enabled: true }
      ]
    }
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'template-1',
      name: 'Executive Summary Template',
      description: 'Template for executive-level performance reports',
      category: 'executive',
      sections: [
        { id: 'temp-sec-1', name: 'Executive Summary', type: 'summary', enabled: true, order: 1 },
        { id: 'temp-sec-2', name: 'KPI Overview', type: 'chart', enabled: true, order: 2 },
        { id: 'temp-sec-3', name: 'Performance Trends', type: 'chart', enabled: true, order: 3 },
        { id: 'temp-sec-4', name: 'Key Insights', type: 'text', enabled: true, order: 4 }
      ],
      defaultFormat: 'pdf',
      defaultRecipients: ['ceo@company.com', 'director@company.com'],
      isDefault: true,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    },
    {
      id: 'template-2',
      name: 'Technical Analysis Template',
      description: 'Template for detailed technical performance analysis',
      category: 'technical',
      sections: [
        { id: 'temp-sec-5', name: 'System Overview', type: 'summary', enabled: true, order: 1 },
        { id: 'temp-sec-6', name: 'Performance Metrics', type: 'chart', enabled: true, order: 2 },
        { id: 'temp-sec-7', name: 'Resource Utilization', type: 'chart', enabled: true, order: 3 },
        { id: 'temp-sec-8', name: 'Error Analysis', type: 'table', enabled: true, order: 4 },
        { id: 'temp-sec-9', name: 'Recommendations', type: 'text', enabled: true, order: 5 }
      ],
      defaultFormat: 'excel',
      defaultRecipients: ['architect@company.com', 'lead@company.com'],
      isDefault: false,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    }
  ];

  const reportDashboards: ReportDashboard[] = [
    {
      id: 'dashboard-1',
      name: 'Executive Performance Dashboard',
      description: 'High-level performance dashboard for executives',
      type: 'executive',
      widgets: [
        {
          id: 'widget-1',
          name: 'Overall Performance Score',
          type: 'gauge',
          position: { x: 0, y: 0, w: 4, h: 3 },
          dataSource: 'performance_score',
          config: { title: 'Performance Score', color: '#3b82f6' }
        },
        {
          id: 'widget-2',
          name: 'Response Time Trend',
          type: 'chart',
          position: { x: 4, y: 0, w: 8, h: 3 },
          dataSource: 'response_time',
          config: { title: 'Response Time Trend', timeRange: '7d' }
        }
      ],
      layout: {
        columns: 12,
        rowHeight: 100,
        margin: [10, 10],
        containerPadding: [10, 10]
      },
      refreshInterval: 300,
      lastUpdated: '2024-01-15 15:30:00'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'generating':
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'text-blue-600 bg-blue-50';
      case 'weekly':
        return 'text-purple-600 bg-purple-50';
      case 'monthly':
        return 'text-orange-600 bg-orange-50';
      case 'quarterly':
        return 'text-red-600 bg-red-50';
      case 'custom':
        return 'text-gray-600 bg-gray-50';
      case 'realtime':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'overview':
        return 'text-blue-600 bg-blue-50';
      case 'detailed':
        return 'text-purple-600 bg-purple-50';
      case 'comparison':
        return 'text-orange-600 bg-orange-50';
      case 'trend':
        return 'text-green-600 bg-green-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'html':
        return <Globe className="w-4 h-4" />;
      case 'json':
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredReports = performanceReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const selectedReportData = performanceReports.find(r => r.id === selectedReport);

  const totalReports = performanceReports.length;
  const completedReports = performanceReports.filter(r => r.status === 'completed').length;
  const scheduledReports = performanceReports.filter(r => r.schedule?.enabled).length;
  const totalRecipients = performanceReports.reduce((acc, r) => acc + r.recipients.filter(rec => rec.enabled).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Reporting</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and distribute performance reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Report Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              reports available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedReports}</div>
            <p className="text-xs text-muted-foreground">
              successfully generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Schedule className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduledReports}</div>
            <p className="text-xs text-muted-foreground">
              automated reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalRecipients}</div>
            <p className="text-xs text-muted-foreground">
              report recipients
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Reports</h3>
              <p className="text-sm text-muted-foreground">
                View and manage generated performance reports
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="custom">Custom</option>
                <option value="realtime">Real-time</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="failed">Failed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id}
                  className={`cursor-pointer transition-colors ${
                    selectedReport === report.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                          {report.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                           report.status === 'generating' ? <RefreshCw className="w-4 h-4" /> :
                           report.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           report.status === 'scheduled' ? <Schedule className="w-4 h-4" /> :
                           <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <CardDescription>{report.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Format:</span>
                      <div className="flex items-center gap-1">
                        {getFormatIcon(report.format)}
                        <span className="capitalize">{report.format}</span>
                      </div>
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatFileSize(report.size)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{report.generatedAt || 'Not generated'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated By:</span>
                        <p className="font-medium">{report.generatedBy}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recipients:</span>
                        <p className="font-medium">{report.recipients.filter(r => r.enabled).length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sections:</span>
                        <p className="font-medium">{report.sections.filter(s => s.enabled).length}</p>
                      </div>
                    </div>

                    {report.metrics.overallScore > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Performance Score</span>
                          <span>{report.metrics.overallScore}/100</span>
                        </div>
                        <Progress value={report.metrics.overallScore} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {report.status === 'completed' && report.downloadUrl && (
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Report Details */}
            <div>
              {selectedReportData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedReportData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedReportData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Report Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedReportData.status)}>
                              {selectedReportData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedReportData.type)}>
                              {selectedReportData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedReportData.category)}>
                              {selectedReportData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Format:</span>
                            <div className="flex items-center gap-1">
                              {getFormatIcon(selectedReportData.format)}
                              <span className="capitalize">{selectedReportData.format}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Generation Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{selectedReportData.createdAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Generated:</span>
                            <span className="font-medium">{selectedReportData.generatedAt || 'Not generated'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Generated By:</span>
                            <span className="font-medium">{selectedReportData.generatedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">File Size:</span>
                            <span className="font-medium">{formatFileSize(selectedReportData.size)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedReportData.metrics.overallScore > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="font-medium">{selectedReportData.metrics.responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Throughput:</span>
                            <span className="font-medium">{selectedReportData.metrics.throughput} req/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="font-medium">{selectedReportData.metrics.errorRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="font-medium">{selectedReportData.metrics.uptime}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Resource Usage:</span>
                            <span className="font-medium">{selectedReportData.metrics.resourceUtilization}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">User Satisfaction:</span>
                            <span className="font-medium">{selectedReportData.metrics.userSatisfaction}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Report Sections</h4>
                      <div className="space-y-2">
                        {selectedReportData.sections
                          .filter(section => section.enabled)
                          .sort((a, b) => a.order - b.order)
                          .map((section) => (
                          <div key={section.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${
                                section.type === 'summary' ? 'bg-blue-100' :
                                section.type === 'chart' ? 'bg-green-100' :
                                section.type === 'table' ? 'bg-orange-100' :
                                section.type === 'text' ? 'bg-purple-100' :
                                'bg-gray-100'
                              }`}>
                                {section.type === 'summary' ? <FileText className="w-3 h-3" /> :
                                 section.type === 'chart' ? <BarChart3 className="w-3 h-3" /> :
                                 section.type === 'table' ? <FileSpreadsheet className="w-3 h-3" /> :
                                 section.type === 'text' ? <File className="w-3 h-3" /> :
                                 <File className="w-3 h-3" />}
                              </div>
                              <span className="font-medium text-sm">{section.name}</span>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {section.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recipients</h4>
                      <div className="space-y-2">
                        {selectedReportData.recipients
                          .filter(recipient => recipient.enabled)
                          .map((recipient) => (
                          <div key={recipient.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <div>
                                <div className="font-medium text-sm">{recipient.name}</div>
                                <div className="text-xs text-muted-foreground">{recipient.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{recipient.role}</Badge>
                              <Badge variant="outline" className="capitalize">
                                {recipient.frequency}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedReportData.schedule && (
                      <div>
                        <h4 className="font-medium mb-2">Schedule</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-muted-foreground">Enabled:</span>
                              <span className="ml-2 font-medium">{selectedReportData.schedule.enabled ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <span className="ml-2 font-medium capitalize">{selectedReportData.schedule.frequency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Timezone:</span>
                              <span className="ml-2 font-medium">{selectedReportData.schedule.timezone}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Next Run:</span>
                              <span className="ml-2 font-medium">{selectedReportData.schedule.nextRun}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedReportData.status === 'completed' && selectedReportData.downloadUrl && (
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a report to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Report Templates</h3>
              <p className="text-sm text-muted-foreground">
                Manage report templates for consistent reporting
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge className="text-blue-600 bg-blue-50">Default</Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{template.category}</Badge>
                    <span className="text-muted-foreground">Format:</span>
                    <Badge variant="outline" className="capitalize">{template.defaultFormat}</Badge>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Sections:</span>
                    <p className="font-medium">{template.sections.length} sections</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Created by:</span>
                    <p className="font-medium">{template.createdBy}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Report Dashboards</h3>
              <p className="text-sm text-muted-foreground">
                Interactive performance dashboards for real-time monitoring
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportDashboards.map((dashboard) => (
              <Card key={dashboard.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {dashboard.name}
                    <Badge variant="outline" className="capitalize">{dashboard.type}</Badge>
                  </CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Widgets:</span>
                    <p className="font-medium">{dashboard.widgets.length} widgets</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Refresh Interval:</span>
                    <p className="font-medium">{dashboard.refreshInterval}s</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium">{dashboard.lastUpdated}</p>
                  </div>

                  <div className="h-32 bg-muted rounded flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    <p className="ml-2 text-sm text-muted-foreground">Dashboard Preview</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Dashboard
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Report Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Manage automated report generation and distribution
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <div className="space-y-4">
            {performanceReports.filter(r => r.schedule?.enabled).map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                        <Schedule className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <p className="font-medium capitalize">{report.schedule?.frequency}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <p className="font-medium">{report.schedule?.nextRun}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <p className="font-medium">{report.schedule?.lastRun || 'Never'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recipients:</span>
                      <p className="font-medium">{report.schedule?.recipients.length}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Schedule
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Run Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Schedule
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

export default PerformanceReportingPage;
