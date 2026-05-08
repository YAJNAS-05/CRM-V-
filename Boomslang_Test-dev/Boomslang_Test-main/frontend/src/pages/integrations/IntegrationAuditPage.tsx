import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Calendar,
  FileText,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Terminal,
  Code,
  Database,
  Globe,
  Server,
  Lock,
  Unlock,
  User,
  Key,
  Zap,
  Timer,
  Info,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  integration: string;
  details: AuditDetails;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  correlationId: string;
}

interface AuditDetails {
  operation: string;
  parameters: Record<string, any>;
  result: string;
  duration: number;
  affectedRecords: number;
  changes: ChangeRecord[];
  riskScore: number;
}

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

interface ComplianceReport {
  id: string;
  name: string;
  framework: string;
  period: string;
  status: 'in_progress' | 'completed' | 'failed';
  score: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  generatedAt: string;
  generatedBy: string;
  findings: ComplianceFinding[];
  recommendations: string[];
}

interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  integration: string;
  userId?: string;
  ipAddress: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  riskScore: number;
  indicators: SecurityIndicator[];
  response: SecurityResponse;
}

interface SecurityIndicator {
  type: string;
  value: string;
  description: string;
}

interface SecurityResponse {
  actions: string[];
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

interface AccessPattern {
  userId: string;
  userName: string;
  integration: string;
  accessCount: number;
  lastAccess: string;
  unusualActivity: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  patterns: AccessPatternDetail[];
}

interface AccessPatternDetail {
  timestamp: string;
  action: string;
  resource: string;
  riskScore: number;
}

const IntegrationAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('audit-logs');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Load audit logs from API on component mount
  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);
      try {
        const logsData = await integrationApi.getAuditLogs();
        if (logsData) {
          setAuditLogs(logsData);
        }
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    loadAuditLogs();
  }, []);
      resource: '/api/v1/export',
      integration: 'SAP ERP',
      details: {
        operation: 'EXPORT',
        parameters: { format: 'csv', dateRange: '2024-01-01:2024-01-15' },
        result: 'SUCCESS',
        duration: 2500,
        affectedRecords: 5000,
        changes: [],
        riskScore: 25
      },
      severity: 'medium',
      status: 'success',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess-ghi789',
      correlationId: 'corr-jkl012'
    },
    {
      id: 'audit-3',
      timestamp: '2024-01-15 15:20:33',
      userId: 'user-789',
      userName: 'Bob Johnson',
      action: 'LOGIN_FAILED',
      resource: '/auth/login',
      integration: 'HubSpot Marketing',
      details: {
        operation: 'AUTHENTICATE',
        parameters: { username: 'bob.johnson' },
        result: 'FAILURE',
        duration: 450,
        affectedRecords: 0,
        changes: [],
        riskScore: 35
      },
      severity: 'high',
      status: 'failure',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess-mno345',
      correlationId: 'corr-pqr678'
    },
    {
      id: 'audit-4',
      timestamp: '2024-01-15 15:15:22',
      userId: 'user-123',
      userName: 'John Smith',
      action: 'CONFIGURATION_UPDATED',
      resource: '/api/v1/config',
      integration: 'Salesforce CRM',
      details: {
        operation: 'UPDATE',
        parameters: { timeout: 30000, retryAttempts: 3 },
        result: 'SUCCESS',
        duration: 180,
        affectedRecords: 1,
        changes: [
          { field: 'timeout', oldValue: 15000, newValue: 30000, changeType: 'update' },
          { field: 'retryAttempts', oldValue: 2, newValue: 3, changeType: 'update' }
        ],
        riskScore: 10
      },
      severity: 'low',
      status: 'success',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess-abc123',
      correlationId: 'corr-stu901'
    }
  ];

  const complianceReports: ComplianceReport[] = [
    {
      id: 'report-1',
      name: 'SOC 2 Type II Compliance Report',
      framework: 'SOC 2',
      period: 'Q4 2023',
      status: 'completed',
      score: 94,
      totalChecks: 125,
      passedChecks: 118,
      failedChecks: 5,
      warningChecks: 2,
      generatedAt: '2024-01-15 10:00:00',
      generatedBy: 'Compliance Team',
      findings: [
        {
          id: 'finding-1',
          category: 'Access Control',
          severity: 'medium',
          description: 'Some users have excessive permissions',
          evidence: 'User audit log shows admin access for non-admin users',
          recommendation: 'Review and restrict user permissions',
          status: 'open'
        },
        {
          id: 'finding-2',
          category: 'Encryption',
          severity: 'low',
          description: 'Legacy encryption algorithm detected',
          evidence: 'TLS 1.0 connections found in logs',
          recommendation: 'Upgrade to TLS 1.3 across all integrations',
          status: 'in_progress'
        }
      ],
      recommendations: [
        'Implement role-based access control',
        'Upgrade encryption protocols',
        'Enhance monitoring and alerting',
        'Conduct regular security training'
      ]
    },
    {
      id: 'report-2',
      name: 'GDPR Compliance Assessment',
      framework: 'GDPR',
      period: 'January 2024',
      status: 'in_progress',
      score: 88,
      totalChecks: 85,
      passedChecks: 75,
      failedChecks: 7,
      warningChecks: 3,
      generatedAt: '2024-01-15 14:30:00',
      generatedBy: 'Privacy Team',
      findings: [
        {
          id: 'finding-3',
          category: 'Data Processing',
          severity: 'high',
          description: 'Missing data processing agreements',
          evidence: 'No DPAs found for some third-party integrations',
          recommendation: 'Establish data processing agreements with all vendors',
          status: 'open'
        }
      ],
      recommendations: [
        'Update privacy policy',
        'Implement data subject request workflow',
        'Enhance data breach notification process'
      ]
    }
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: 'event-1',
      type: 'authentication',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: 'Multiple failed login attempts detected from unusual IP address',
      timestamp: '2024-01-15 15:20:33',
      source: 'Authentication Service',
      integration: 'HubSpot Marketing',
      userId: 'user-789',
      ipAddress: '192.168.1.102',
      status: 'investigating',
      riskScore: 75,
      indicators: [
        { type: 'IP Address', value: '192.168.1.102', description: 'Source IP of failed attempts' },
        { type: 'Attempt Count', value: '5', description: 'Number of failed attempts' },
        { type: 'Time Window', value: '5 minutes', description: 'Time period of attempts' }
      ],
      response: {
        actions: ['Account locked', 'Security team notified'],
        assignedTo: 'Security Team'
      }
    },
    {
      id: 'event-2',
      type: 'data_access',
      severity: 'medium',
      title: 'Unusual Data Access Pattern',
      description: 'User accessing large volumes of data outside normal hours',
      timestamp: '2024-01-15 15:25:12',
      source: 'Data Access Monitor',
      integration: 'SAP ERP',
      userId: 'user-456',
      ipAddress: '192.168.1.101',
      status: 'open',
      riskScore: 45,
      indicators: [
        { type: 'Data Volume', value: '5000 records', description: 'Unusually large data export' },
        { type: 'Time of Day', value: '3:25 PM', description: 'Outside normal working hours' }
      ],
      response: {
        actions: ['Alert sent to user manager', 'Additional monitoring enabled']
      }
    }
  ];

  const accessPatterns: AccessPattern[] = [
    {
      userId: 'user-123',
      userName: 'John Smith',
      integration: 'Salesforce CRM',
      accessCount: 45,
      lastAccess: '2024-01-15 15:30:45',
      unusualActivity: false,
      riskLevel: 'low',
      patterns: [
        { timestamp: '2024-01-15 15:30:45', action: 'API_KEY_CREATED', resource: '/api/v1/keys', riskScore: 15 },
        { timestamp: '2024-01-15 15:15:22', action: 'CONFIGURATION_UPDATED', resource: '/api/v1/config', riskScore: 10 }
      ]
    },
    {
      userId: 'user-456',
      userName: 'Jane Doe',
      integration: 'SAP ERP',
      accessCount: 23,
      lastAccess: '2024-01-15 15:25:12',
      unusualActivity: true,
      riskLevel: 'medium',
      patterns: [
        { timestamp: '2024-01-15 15:25:12', action: 'DATA_EXPORT', resource: '/api/v1/export', riskScore: 25 }
      ]
    },
    {
      userId: 'user-789',
      userName: 'Bob Johnson',
      integration: 'HubSpot Marketing',
      accessCount: 12,
      lastAccess: '2024-01-15 15:20:33',
      unusualActivity: true,
      riskLevel: 'high',
      patterns: [
        { timestamp: '2024-01-15 15:20:33', action: 'LOGIN_FAILED', resource: '/auth/login', riskScore: 35 }
      ]
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'failure':
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'warning':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'open':
      case 'investigating':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'authentication':
        return 'text-purple-600 bg-purple-50';
      case 'authorization':
        return 'text-blue-600 bg-blue-50';
      case 'data_access':
        return 'text-green-600 bg-green-50';
      case 'configuration':
        return 'text-orange-600 bg-orange-50';
      case 'anomaly':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.integration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const selectedLogData = auditLogs.find(l => l.id === selectedLog);

  const totalLogs = auditLogs.length;
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
  const highRiskEvents = securityEvents.filter(e => e.severity === 'high').length;
  const avgComplianceScore = Math.round(
    complianceReports.reduce((acc, r) => acc + r.score, 0) / complianceReports.length
  );

  const handleExportAuditLog = async () => {
    try {
      const auditData = {
        auditLogs: filteredLogs,
        securityEvents,
        complianceReports,
        summary: {
          totalLogs,
          criticalEvents,
          highRiskEvents,
          avgComplianceScore,
          exportedAt: new Date().toISOString()
        },
        filters: {
          searchTerm,
          filterSeverity,
          filterStatus
        }
      };
      
      const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integration-audit-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Audit log exported successfully');
    } catch (error) {
      console.error('Failed to export audit log:', error);
      toast.error('Failed to export audit log');
    }
  };

  const handleViewDetails = (logId: string) => {
    setSelectedLog(logId);
    toast.info(`Viewing details for audit log ${logId}`);
  };

  const handleCopyDetails = async () => {
    try {
      if (selectedLogData) {
        const details = JSON.stringify(selectedLogData, null, 2);
        await navigator.clipboard.writeText(details);
        toast.success('Audit log details copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy details:', error);
      toast.error('Failed to copy details');
    }
  };

  const handleExportLog = async () => {
    try {
      if (selectedLogData) {
        const blob = new Blob([JSON.stringify(selectedLogData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${selectedLogData.id}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Audit log exported successfully');
      }
    } catch (error) {
      console.error('Failed to export log:', error);
      toast.error('Failed to export log');
    }
  };

  const handleViewInSIEM = () => {
    toast.info('View in SIEM functionality coming soon!');
    // TODO: Implement SIEM integration
  };

  const handleInvestigate = (eventId: string) => {
    toast.info(`Investigating security event ${eventId}`);
    // TODO: Implement investigation workflow
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const report = complianceReports.find(r => r.id === reportId);
      if (report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${reportId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Compliance report downloaded successfully');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleGenerateAnalysis = () => {
    toast.info('Generate analysis functionality coming soon!');
    // TODO: Implement comprehensive analysis generation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Audit & Compliance</h1>
          <p className="text-muted-foreground">
            Monitor audit logs, compliance reports, and security events
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" onClick={handleExportAuditLog}>
            <Download className="w-4 h-4 mr-2" />
            Export Audit Log
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
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highRiskEvents}</div>
            <p className="text-xs text-muted-foreground">
              under investigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgComplianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              average compliance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {(criticalEvents > 0 || highRiskEvents > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalEvents + highRiskEvents} security events</strong> require attention. 
            Review the security events tab for details and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="security-events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="access-patterns">Access Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Audit Logs</h3>
              <p className="text-sm text-muted-foreground">
                Detailed audit trail of all integration activities
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterSeverity} 
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Logs List */}
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card 
                  key={log.id}
                  className={`cursor-pointer transition-colors ${
                    selectedLog === log.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedLog(log.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(log.status)}`}>
                          {log.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                           log.status === 'failure' ? <XCircle className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{log.action}</CardTitle>
                          <CardDescription>{log.resource}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">User:</span>
                      <Badge variant="outline">{log.userName}</Badge>
                      <span className="text-muted-foreground">Integration:</span>
                      <Badge variant="outline">{log.integration}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Timestamp:</span>
                        <p className="font-medium">{log.timestamp}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{log.details.duration}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <p className="font-medium">{log.details.riskScore}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IP Address:</span>
                        <p className="font-medium">{log.ipAddress}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(log.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopyDetails}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Audit Log Details */}
            <div>
              {selectedLogData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedLogData.action}
                      <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedLogData.resource}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Event Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">User:</span>
                            <span className="font-medium">{selectedLogData.userName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Integration:</span>
                            <span className="font-medium">{selectedLogData.integration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity:</span>
                            <Badge className={getSeverityColor(selectedLogData.severity)}>
                              {selectedLogData.severity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedLogData.status)}>
                              {selectedLogData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Technical Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Operation:</span>
                            <span className="font-medium">{selectedLogData.details.operation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{selectedLogData.details.duration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Score:</span>
                            <span className="font-medium">{selectedLogData.details.riskScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Session ID:</span>
                            <span className="font-medium text-xs">{selectedLogData.sessionId}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap font-sans">
                          {JSON.stringify(selectedLogData.details.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {selectedLogData.details.changes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Changes Made</h4>
                        <div className="space-y-2">
                          {selectedLogData.details.changes.map((change, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium text-sm">{change.field}</div>
                                <div className="text-xs text-muted-foreground">
                                  {change.oldValue !== null && `From: ${change.oldValue}`}
                                  {change.oldValue !== null && change.newValue !== null && ' → '}
                                  {change.newValue !== null && `To: ${change.newValue}`}
                                </div>
                              </div>
                              <Badge className={getStatusColor(change.changeType)}>
                                {change.changeType}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleExportLog}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Log
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleViewInSIEM}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in SIEM
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
                        Select an audit log to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security-events" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Events</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and respond to security incidents
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Report Event
            </Button>
          </div>

          <div className="space-y-4">
            {securityEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Integration:</span>
                      <p className="font-medium">{event.integration}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Score:</span>
                      <p className="font-medium">{event.riskScore}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User:</span>
                      <p className="font-medium">{event.userId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP Address:</span>
                      <p className="font-medium">{event.ipAddress}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Security Indicators</h5>
                    <div className="flex flex-wrap gap-2">
                      {event.indicators.map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator.type}: {indicator.value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(event.id || pattern.userId)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleInvestigate(event.id || pattern.userId)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Investigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Compliance Reports</h3>
              <p className="text-sm text-muted-foreground">
                Review compliance assessment results
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>{report.framework} • {report.period}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compliance Score</span>
                    <span className="text-2xl font-bold">{report.score}%</span>
                  </div>
                  <Progress value={report.score} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{report.passedChecks}</div>
                      <div className="text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{report.warningChecks}</div>
                      <div className="text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{report.failedChecks}</div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access-patterns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Access Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Monitor user access patterns and detect anomalies
              </p>
            </div>
            <Button variant="outline" onClick={handleGenerateAnalysis}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Analysis
            </Button>
          </div>

          <div className="space-y-4">
            {accessPatterns.map((pattern) => (
              <Card key={pattern.userId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getRiskLevelColor(pattern.riskLevel)}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">{pattern.userName}</div>
                        <div className="text-sm text-muted-foreground">{pattern.integration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskLevelColor(pattern.riskLevel)}>
                        {pattern.riskLevel} risk
                      </Badge>
                      {pattern.unusualActivity && (
                        <Badge className="text-orange-600 bg-orange-50">
                          Unusual Activity
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Access Count:</span>
                      <p className="font-medium">{pattern.accessCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Access:</span>
                      <p className="font-medium">{pattern.lastAccess}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Level:</span>
                      <p className="font-medium capitalize">{pattern.riskLevel}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Recent Activity</h5>
                    <div className="space-y-1">
                      {pattern.patterns.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <span>{activity.action}</span>
                          <Badge variant="outline">Risk: {activity.riskScore}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(event.id || pattern.userId)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleInvestigate(event.id || pattern.userId)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Investigate
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

export default IntegrationAuditPage;
