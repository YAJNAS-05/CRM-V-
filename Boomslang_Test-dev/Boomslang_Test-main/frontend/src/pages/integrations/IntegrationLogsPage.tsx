import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  Settings,
  Zap,
  Database,
  Globe,
  Server,
  Trash2,
  Save,
  Play,
  Pause,
  Square,
  Info,
  ChevronDown,
  ChevronRight,
  Terminal,
  Code,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  integration: string;
  source: string;
  message: string;
  details: LogDetails;
  metadata: LogMetadata;
  stackTrace?: string;
  relatedEntries: string[];
}

interface LogDetails {
  request?: RequestDetails;
  response?: ResponseDetails;
  error?: ErrorDetails;
  performance?: PerformanceDetails;
  transaction?: TransactionDetails;
}

interface RequestDetails {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  size: number;
  duration: number;
}

interface ResponseDetails {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  size: number;
  duration: number;
}

interface ErrorDetails {
  type: string;
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

interface PerformanceDetails {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface TransactionDetails {
  id: string;
  type: string;
  status: string;
  steps: TransactionStep[];
}

interface TransactionStep {
  id: string;
  name: string;
  status: string;
  startTime: number;
  endTime: number;
  duration: number;
  error?: string;
}

interface LogMetadata {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  environment: string;
  version: string;
}

interface LogFilter {
  level: string[];
  integration: string[];
  source: string[];
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

interface LogStats {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByIntegration: Record<string, number>;
  errorRate: number;
  avgResponseTime: number;
  topErrors: ErrorSummary[];
}

interface ErrorSummary {
  message: string;
  count: number;
  lastOccurrence: string;
  integration: string;
}

const IntegrationLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterIntegration, setFilterIntegration] = useState('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load log entries from API on component mount
  useEffect(() => {
    const loadLogEntries = async () => {
      setLoading(true);
      try {
        const logsData = await integrationApi.getLogEntries();
        if (logsData) {
          setLogEntries(logsData);
        }
      } catch (error) {
        console.error('Failed to load log entries:', error);
        toast.error('Failed to load log entries');
      } finally {
        setLoading(false);
      }
    };
    loadLogEntries();
  }, []);

  const logStats: LogStats = {
    totalLogs: 15420,
    logsByLevel: {
      debug: 3084,
      info: 9252,
      warning: 2313,
      error: 692,
      critical: 79
    },
    logsByIntegration: {
      'Salesforce CRM': 5420,
      'SAP ERP': 3855,
      'HubSpot Marketing': 2890,
      'QuickBooks Finance': 1845,
      'Database Sync': 1410
    },
    errorRate: 4.9,
    avgResponseTime: 285,
    topErrors: [
      { message: 'Failed to authenticate with HubSpot API', count: 45, lastOccurrence: '2024-01-15 15:25:15', integration: 'HubSpot Marketing' },
      { message: 'Connection pool utilization approaching threshold', count: 23, lastOccurrence: '2024-01-15 15:28:30', integration: 'SAP ERP' },
      { message: 'Payment processing service unavailable', count: 12, lastOccurrence: '2024-01-15 15:20:00', integration: 'QuickBooks Finance' }
    ]
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'critical':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug':
        return <Info className="w-4 h-4" />;
      case 'info':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const filteredLogs = logEntries.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.integration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesIntegration = filterIntegration === 'all' || log.integration === filterIntegration;
    return matchesSearch && matchesLevel && matchesIntegration;
  });

  const selectedLogData = logEntries.find(l => l.id === selectedLog);

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleExportLogs = async () => {
    try {
      const logs = {
        logEntries: filteredLogs,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        filters: {
          searchTerm,
          filterLevel,
          filterIntegration
        }
      };
      
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integration-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const handleLogSettings = () => {
    toast.info('Log Settings functionality coming soon!');
    // TODO: Implement log settings modal or navigation
  };

  const handleClearSelection = () => {
    setSelectedLog(null);
    toast.info('Selection cleared');
  };

  const handleViewRelated = (logId: string) => {
    toast.info(`Viewing related logs for ${logId}`);
    // TODO: Implement related logs view
  };

  const handleExportLog = (logId: string) => {
    try {
      const log = logEntries.find(l => l.id === logId);
      if (log) {
        const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `log-${logId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Log exported successfully');
      }
    } catch (error) {
      console.error('Failed to export log:', error);
      toast.error('Failed to export log');
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const analytics = {
        summary: {
          totalLogs: logEntries.length,
          errorCount: logEntries.filter(l => l.level === 'error').length,
          warningCount: logEntries.filter(l => l.level === 'warning').length,
          infoCount: logEntries.filter(l => l.level === 'info').length
        },
        integrations: [...new Set(logEntries.map(l => l.integration))].map(integration => ({
          name: integration,
          count: logEntries.filter(l => l.integration === integration).length,
          errors: logEntries.filter(l => l.integration === integration && l.level === 'error').length
        })),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `log-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully');
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  const handleConfigureAlerts = () => {
    toast.info('Alert Configuration functionality coming soon!');
    // TODO: Implement alert configuration
  };

  const handleViewLogs = (integration: string) => {
    toast.info(`Viewing logs for ${integration}`);
    setFilterIntegration(integration);
  };

  const handleInvestigate = (logId: string) => {
    toast.info(`Investigating log ${logId}`);
    setSelectedLog(logId);
    // TODO: Implement investigation workflow
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze integration logs and events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={handleLogSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Log Settings
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
            />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.totalLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              of total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.logsByLevel.critical}</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              across all integrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="search">Advanced Search</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Recent Logs</h3>
              <p className="text-sm text-muted-foreground">
                View and analyze integration logs
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterLevel} 
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
              <select 
                value={filterIntegration} 
                onChange={(e) => setFilterIntegration(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Integrations</option>
                <option value="Salesforce CRM">Salesforce CRM</option>
                <option value="SAP ERP">SAP ERP</option>
                <option value="HubSpot Marketing">HubSpot Marketing</option>
                <option value="QuickBooks Finance">QuickBooks Finance</option>
                <option value="Database Sync">Database Sync</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logs List */}
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card 
                  key={log.id}
                  className={`cursor-pointer transition-colors ${
                    selectedLog === log.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedLog(log.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getLevelColor(log.level)}`}>
                          {getLevelIcon(log.level)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{log.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.integration} • {log.source}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLogExpansion(log.id);
                          }}
                        >
                          {expandedLogs.has(log.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{log.timestamp}</span>
                      {log.details.performance && (
                        <span>Duration: {log.details.performance.duration}ms</span>
                      )}
                    </div>

                    {expandedLogs.has(log.id) && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        {log.details.request && (
                          <div>
                            <div className="font-medium text-sm mb-1">Request</div>
                            <div className="bg-muted p-2 rounded text-xs font-mono">
                              {log.details.request.method} {log.details.request.url}
                            </div>
                          </div>
                        )}
                        {log.details.response && (
                          <div>
                            <div className="font-medium text-sm mb-1">Response</div>
                            <div className="bg-muted p-2 rounded text-xs">
                              Status: {log.details.response.status} • Duration: {log.details.response.duration}ms
                            </div>
                          </div>
                        )}
                        {log.details.error && (
                          <div>
                            <div className="font-medium text-sm mb-1">Error</div>
                            <div className="bg-red-50 p-2 rounded text-xs text-red-800">
                              {log.details.error.message}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Log Details */}
            <div>
              {selectedLogData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Log Details
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Level:</span>
                            <Badge className={getLevelColor(selectedLogData.level)}>
                              {selectedLogData.level}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Integration:</span>
                            <span className="font-medium">{selectedLogData.integration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Source:</span>
                            <span className="font-medium">{selectedLogData.source}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timestamp:</span>
                            <span className="font-medium">{selectedLogData.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Metadata</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Request ID:</span>
                            <span className="font-medium">{selectedLogData.metadata.requestId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Correlation ID:</span>
                            <span className="font-medium">{selectedLogData.metadata.correlationId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment:</span>
                            <span className="font-medium">{selectedLogData.metadata.environment}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-medium">{selectedLogData.metadata.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Message</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        {selectedLogData.message}
                      </div>
                    </div>

                    {selectedLogData.details.request && (
                      <div>
                        <h4 className="font-medium mb-2">Request Details</h4>
                        <div className="bg-muted p-3 rounded text-sm space-y-2">
                          <div>
                            <span className="font-medium">Method:</span> {selectedLogData.details.request.method}
                          </div>
                          <div>
                            <span className="font-medium">URL:</span> {selectedLogData.details.request.url}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {selectedLogData.details.request.duration}ms
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {selectedLogData.details.request.size} bytes
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLogData.details.response && (
                      <div>
                        <h4 className="font-medium mb-2">Response Details</h4>
                        <div className="bg-muted p-3 rounded text-sm space-y-2">
                          <div>
                            <span className="font-medium">Status:</span> {selectedLogData.details.response.status} {selectedLogData.details.response.statusText}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {selectedLogData.details.response.duration}ms
                          </div>
                          <div>
                            <span className="font-medium">Size:</span> {selectedLogData.details.response.size} bytes
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLogData.details.error && (
                      <div>
                        <h4 className="font-medium mb-2">Error Details</h4>
                        <div className="bg-red-50 p-3 rounded text-sm space-y-2">
                          <div>
                            <span className="font-medium">Type:</span> {selectedLogData.details.error.type}
                          </div>
                          <div>
                            <span className="font-medium">Code:</span> {selectedLogData.details.error.code}
                          </div>
                          <div>
                            <span className="font-medium">Message:</span> {selectedLogData.details.error.message}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLogData.stackTrace && (
                      <div>
                        <h4 className="font-medium mb-2">Stack Trace</h4>
                        <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                          <pre>{selectedLogData.stackTrace}</pre>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => selectedLogData && handleViewRelated(selectedLogData.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Related
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectedLogData && handleExportLog(selectedLogData.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
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
                        Select a log entry to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Log Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Analyze log patterns and trends
              </p>
            </div>
            <Button variant="outline" onClick={handleExportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs by Level</CardTitle>
                <CardDescription>
                  Distribution of logs by severity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(logStats.logsByLevel).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getLevelColor(level).split(' ')[1]}`} />
                        <span className="text-sm capitalize">{level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {((count / logStats.totalLogs) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs by Integration</CardTitle>
                <CardDescription>
                  Log volume by integration system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(logStats.logsByIntegration).map(([integration, count]) => (
                    <div key={integration} className="flex items-center justify-between">
                      <span className="text-sm">{integration}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {((count / logStats.totalLogs) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Error Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyze common errors and patterns
              </p>
            </div>
            <Button variant="outline" onClick={handleConfigureAlerts}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Configure Alerts
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Error Message</th>
                      <th className="text-left p-4 font-medium">Count</th>
                      <th className="text-left p-4 font-medium">Integration</th>
                      <th className="text-left p-4 font-medium">Last Occurrence</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logStats.topErrors.map((error, index) => (
                      <tr key={index} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div className="font-medium text-sm">{error.message}</div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-red-50 text-red-600">
                            {error.count}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{error.integration}</td>
                        <td className="p-4 text-sm">{error.lastOccurrence}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewLogs(error.integration)}>
                              View Logs
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleInvestigate(error.id)}>
                              Investigate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Advanced Search</h3>
              <p className="text-sm text-muted-foreground">
                Search logs with advanced filters
              </p>
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Criteria</CardTitle>
              <CardDescription>
                Configure advanced search parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Log Levels</label>
                  <div className="mt-1 space-y-2">
                    {['debug', 'info', 'warning', 'error', 'critical'].map(level => (
                      <label key={level} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={level !== 'debug'} />
                        <span className="text-sm capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="mt-1 space-y-2">
                    <input type="datetime-local" className="w-full px-3 py-2 border rounded-md text-sm" />
                    <input type="datetime-local" className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Search Query</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm" 
                  rows={4}
                  placeholder="Enter search query..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationLogsPage;
