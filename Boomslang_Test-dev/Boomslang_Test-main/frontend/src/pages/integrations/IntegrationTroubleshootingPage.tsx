import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Zap,
  Database,
  Globe,
  Server,
  Activity,
  TrendingUp,
  TrendingDown,
  Terminal,
  Code,
  FileText,
  Wrench,
  HelpCircle,
  Bug,
  Shield,
  Timer,
  Info,
  ExternalLink,
  Copy,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface TroubleshootingIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: 'connectivity' | 'performance' | 'authentication' | 'data' | 'configuration';
  integration: string;
  detectedAt: string;
  lastUpdated: string;
  assignedTo?: string;
  impact: ImpactAssessment;
  symptoms: Symptom[];
  diagnosis: Diagnosis;
  resolution: Resolution;
  relatedIssues: string[];
}

interface ImpactAssessment {
  affectedUsers: number;
  affectedSystems: string[];
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  estimatedDowntime?: number;
  financialImpact?: number;
}

interface Symptom {
  id: string;
  description: string;
  observedAt: string;
  severity: 'info' | 'warning' | 'error';
  source: string;
  data?: Record<string, any>;
}

interface Diagnosis {
  probableCause: string;
  confidence: number;
  evidence: Evidence[];
  recommendedActions: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedResolutionTime: number;
}

interface Evidence {
  type: 'log' | 'metric' | 'trace' | 'test';
  description: string;
  source: string;
  timestamp: string;
  data?: any;
}

interface Resolution {
  steps: ResolutionStep[];
  actualResolutionTime?: number;
  resolvedBy?: string;
  verifiedAt?: string;
  preventionMeasures: string[];
}

interface ResolutionStep {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: string;
  notes?: string;
}

interface TroubleshootingGuide {
  id: string;
  title: string;
  category: string;
  description: string;
  symptoms: string[];
  causes: string[];
  solutions: Solution[];
  prevention: string[];
  relatedIntegrations: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  steps: string[];
  code?: string;
  commands?: string[];
  verification: string;
}

interface DiagnosticTool {
  id: string;
  name: string;
  description: string;
  type: 'connectivity' | 'performance' | 'security' | 'data';
  integration: string;
  status: 'available' | 'running' | 'completed' | 'error';
  lastRun?: string;
  results?: ToolResult;
  configuration: ToolConfiguration;
}

interface ToolResult {
  status: 'pass' | 'fail' | 'warning';
  summary: string;
  details: string;
  recommendations: string[];
  artifacts: string[];
  metrics: Record<string, number>;
}

interface ToolConfiguration {
  parameters: Record<string, any>;
  timeout: number;
  retryAttempts: number;
}

const IntegrationTroubleshootingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('issues');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [troubleshootingIssues, setTroubleshootingIssues] = useState<TroubleshootingIssue[]>([]);
  const [loading, setLoading] = useState(false);

  // Load troubleshooting issues from API on component mount
  useEffect(() => {
    const loadTroubleshootingIssues = async () => {
      setLoading(true);
      try {
        const issuesData = await integrationApi.getTroubleshootingIssues();
        if (issuesData) {
          setTroubleshootingIssues(issuesData);
        }
      } catch (error) {
        console.error('Failed to load troubleshooting issues:', error);
        toast.error('Failed to load troubleshooting issues');
      } finally {
        setLoading(false);
      }
    };
    loadTroubleshootingIssues();
  }, []);

  // ... rest of the code remains the same ...
      diagnosis: {
        probableCause: 'OAuth client credentials expired or revoked',
        confidence: 85,
        evidence: [
          {
            type: 'log',
            description: 'Authentication log showing invalid_grant errors',
            source: 'Auth Service Logs',
            timestamp: '2024-01-15 14:35:00',
            data: { error: 'invalid_grant', timestamp: '2024-01-15T14:35:00Z' }
          },
          {
            type: 'metric',
            description: 'Spike in authentication failures',
            source: 'Metrics Dashboard',
            timestamp: '2024-01-15 14:30:00',
            data: { failures: 25, timeframe: '5m' }
          }
        ],
        recommendedActions: [
          'Verify OAuth client credentials in Salesforce',
          'Check token refresh configuration',
          'Update client secret if necessary',
          'Test authentication flow'
        ],
        complexity: 'moderate',
        estimatedResolutionTime: 30
      },
      resolution: {
        steps: [
          {
            id: 'step-1',
            description: 'Verify OAuth client credentials',
            status: 'completed',
            completedAt: '2024-01-15 15:00:00',
            notes: 'Credentials are valid and active'
          },
          {
            id: 'step-2',
            description: 'Check token refresh configuration',
            status: 'in_progress',
            notes: 'Investigating refresh token logic'
          },
          {
            id: 'step-3',
            description: 'Update client secret if necessary',
            status: 'pending'
          },
          {
            id: 'step-4',
            description: 'Test authentication flow',
            status: 'pending'
          }
        ],
        preventionMeasures: [
          'Implement proactive credential monitoring',
          'Set up automated token refresh testing',
          'Add credential expiration alerts'
        ]
      },
      relatedIssues: ['issue-2', 'issue-3']
    },
    {
      id: 'issue-2',
      title: 'SAP Database Connection Pool Exhaustion',
      description: 'Database connection pool reaching maximum capacity causing timeouts',
      severity: 'critical',
      status: 'open',
      category: 'connectivity',
      integration: 'SAP ERP',
      detectedAt: '2024-01-15 13:15:00',
      lastUpdated: '2024-01-15 15:30:00',
      impact: {
        affectedUsers: 300,
        affectedSystems: ['Finance', 'Inventory', 'HR'],
        businessImpact: 'critical',
        estimatedDowntime: 120,
        financialImpact: 15000
      },
      symptoms: [
        {
          id: 'symptom-4',
          description: 'Database connection timeouts',
          observedAt: '2024-01-15 13:15:00',
          severity: 'error',
          source: 'Database Connector',
          data: { timeout: 30000, poolSize: 50, activeConnections: 50 }
        },
        {
          id: 'symptom-5',
          description: 'High CPU usage on database server',
          observedAt: '2024-01-15 13:20:00',
          severity: 'warning',
          source: 'System Monitoring',
          data: { cpuUsage: 85, memoryUsage: 72 }
        }
      ],
      diagnosis: {
        probableCause: 'Connection leak in application code or insufficient pool size',
        confidence: 75,
        evidence: [
          {
            type: 'metric',
            description: 'Connection pool at maximum capacity',
            source: 'Database Metrics',
            timestamp: '2024-01-15 13:15:00',
            data: { activeConnections: 50, maxConnections: 50 }
          }
        ],
        recommendedActions: [
          'Increase connection pool size',
          'Review application code for connection leaks',
          'Implement connection timeout and retry logic',
          'Monitor connection usage patterns'
        ],
        complexity: 'complex',
        estimatedResolutionTime: 60
      },
      resolution: {
        steps: [
          {
            id: 'step-5',
            description: 'Increase connection pool size',
            status: 'pending'
          },
          {
            id: 'step-6',
            description: 'Review application code for connection leaks',
            status: 'pending'
          }
        ],
        preventionMeasures: [
          'Implement connection pool monitoring',
          'Add connection leak detection',
          'Set up automated scaling based on load'
        ]
      },
      relatedIssues: []
    },
    {
      id: 'issue-3',
      title: 'HubSpot Webhook Delivery Failures',
      description: 'Webhooks to HubSpot failing with timeout errors',
      severity: 'medium',
      status: 'resolved',
      category: 'connectivity',
      integration: 'HubSpot Marketing',
      detectedAt: '2024-01-15 11:45:00',
      lastUpdated: '2024-01-15 12:30:00',
      assignedTo: 'Jane Doe',
      impact: {
        affectedUsers: 50,
        affectedSystems: ['Marketing Automation'],
        businessImpact: 'medium',
        estimatedDowntime: 30,
        financialImpact: 2000
      },
      symptoms: [
        {
          id: 'symptom-6',
          description: 'Webhook timeout errors',
          observedAt: '2024-01-15 11:45:00',
          severity: 'error',
          source: 'Webhook Service',
          data: { timeout: 30000, endpoint: 'https://api.hubapi.com/webhooks', failures: 15 }
        }
      ],
      diagnosis: {
        probableCause: 'HubSpot API rate limiting or network connectivity issues',
        confidence: 90,
        evidence: [
          {
            type: 'log',
            description: 'HTTP 429 Too Many Requests from HubSpot',
            source: 'Webhook Logs',
            timestamp: '2024-01-15 11:45:00',
            data: { status: 429, retryAfter: 60 }
          }
        ],
        recommendedActions: [
          'Implement exponential backoff retry logic',
          'Reduce webhook frequency',
          'Contact HubSpot support for rate limit increase'
        ],
        complexity: 'simple',
        estimatedResolutionTime: 15
      },
      resolution: {
        steps: [
          {
            id: 'step-7',
            description: 'Implement exponential backoff retry logic',
            status: 'completed',
            completedAt: '2024-01-15 12:00:00',
            notes: 'Added retry logic with 1s, 2s, 4s, 8s intervals'
          },
          {
            id: 'step-8',
            description: 'Reduce webhook frequency',
            status: 'completed',
            completedAt: '2024-01-15 12:15:00',
            notes: 'Reduced from real-time to batch every 5 minutes'
          }
        ],
        actualResolutionTime: 45,
        resolvedBy: 'Jane Doe',
        verifiedAt: '2024-01-15 12:30:00',
        preventionMeasures: [
          'Monitor webhook delivery rates',
          'Set up rate limiting alerts',
          'Implement circuit breaker pattern'
        ]
      },
      relatedIssues: []
    }
  ];

  const troubleshootingGuides: TroubleshootingGuide[] = [
    {
      id: 'guide-1',
      title: 'API Authentication Issues',
      category: 'authentication',
      description: 'Step-by-step guide to resolve API authentication problems',
      symptoms: [
        '401 Unauthorized responses',
        'Token refresh failures',
        'Invalid credentials errors'
      ],
      causes: [
        'Expired API keys',
        'Incorrect OAuth configuration',
        'Network connectivity issues',
        'Clock synchronization problems'
      ],
      solutions: [
        {
          id: 'sol-1',
          title: 'Verify API Credentials',
          description: 'Check that API keys and secrets are correct and not expired',
          steps: [
            'Log into the provider\'s developer console',
            'Navigate to API credentials section',
            'Verify key and secret are active',
            'Check expiration dates',
            'Regenerate if necessary'
          ],
          verification: 'API calls should succeed with 200 status codes'
        },
        {
          id: 'sol-2',
          title: 'Check OAuth Configuration',
          description: 'Ensure OAuth settings are properly configured',
          steps: [
            'Verify redirect URLs match',
            'Check scope permissions',
            'Validate client ID and secret',
            'Test token endpoint'
          ],
          verification: 'OAuth flow should complete successfully'
        }
      ],
      prevention: [
        'Set up credential expiration alerts',
        'Implement automated credential rotation',
        'Monitor authentication success rates'
      ],
      relatedIntegrations: ['Salesforce CRM', 'HubSpot Marketing', 'QuickBooks Finance'],
      tags: ['auth', 'oauth', 'api-key', 'security'],
      difficulty: 'intermediate',
      estimatedTime: 30
    },
    {
      id: 'guide-2',
      title: 'Database Connection Problems',
      category: 'connectivity',
      description: 'Troubleshoot database connectivity and performance issues',
      symptoms: [
        'Connection timeouts',
        'Connection pool exhaustion',
        'Slow query performance'
      ],
      causes: [
        'Network connectivity issues',
        'Insufficient connection pool size',
        'Database server overload',
        'Firewall or security group restrictions'
      ],
      solutions: [
        {
          id: 'sol-3',
          title: 'Check Network Connectivity',
          description: 'Verify network path to database server',
          steps: [
            'Ping database server',
            'Check telnet connection to port',
            'Verify firewall rules',
            'Test with database client tools'
          ],
          verification: 'Network connectivity should be established'
        }
      ],
      prevention: [
        'Implement connection health checks',
        'Set up connection pool monitoring',
        'Configure appropriate timeout values'
      ],
      relatedIntegrations: ['SAP ERP', 'Database Sync'],
      tags: ['database', 'connection', 'pool', 'network'],
      difficulty: 'advanced',
      estimatedTime: 45
    }
  ];

  const diagnosticTools: DiagnosticTool[] = [
    {
      id: 'tool-1',
      name: 'Connectivity Test',
      description: 'Test network connectivity to integration endpoints',
      type: 'connectivity',
      integration: 'Salesforce CRM',
      status: 'available',
      configuration: {
        parameters: { timeout: 30000, retries: 3 },
        timeout: 60000,
        retryAttempts: 2
      }
    },
    {
      id: 'tool-2',
      name: 'Performance Benchmark',
      description: 'Run performance benchmarks on API endpoints',
      type: 'performance',
      integration: 'SAP ERP',
      status: 'completed',
      lastRun: '2024-01-15 14:00:00',
      results: {
        status: 'warning',
        summary: 'Performance below expected thresholds',
        details: 'Average response time 520ms (threshold: 300ms)',
        recommendations: [
          'Optimize database queries',
          'Implement caching',
          'Consider database indexing'
        ],
        artifacts: ['performance-report-2024-01-15.pdf'],
        metrics: { avgResponseTime: 520, p95ResponseTime: 850, throughput: 372 }
      },
      configuration: {
        parameters: { duration: 300, concurrentUsers: 10 },
        timeout: 300000,
        retryAttempts: 1
      }
    },
    {
      id: 'tool-3',
      name: 'Security Scan',
      description: 'Scan for security vulnerabilities in integration',
      type: 'security',
      integration: 'HubSpot Marketing',
      status: 'error',
      lastRun: '2024-01-15 13:30:00',
      results: {
        status: 'fail',
        summary: 'Security vulnerabilities detected',
        details: 'Outdated SSL certificate and weak encryption',
        recommendations: [
          'Update SSL certificate',
          'Upgrade to TLS 1.3',
          'Implement stronger encryption'
        ],
        artifacts: ['security-scan-report-2024-01-15.pdf'],
        metrics: { vulnerabilities: 3, criticalIssues: 1 }
      },
      configuration: {
        parameters: { scanType: 'full', depth: 'deep' },
        timeout: 600000,
        retryAttempts: 1
      }
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
      case 'open':
        return 'text-red-600 bg-red-50';
      case 'investigating':
        return 'text-blue-600 bg-blue-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'connectivity':
        return 'text-blue-600 bg-blue-50';
      case 'performance':
        return 'text-orange-600 bg-orange-50';
      case 'authentication':
        return 'text-purple-600 bg-purple-50';
      case 'data':
        return 'text-green-600 bg-green-50';
      case 'configuration':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredIssues = troubleshootingIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const selectedIssueData = troubleshootingIssues.find(i => i.id === selectedIssue);

  const totalIssues = troubleshootingIssues.length;
  const openIssues = troubleshootingIssues.filter(i => i.status === 'open').length;
  const criticalIssues = troubleshootingIssues.filter(i => i.severity === 'critical').length;
  const investigatingIssues = troubleshootingIssues.filter(i => i.status === 'investigating').length;

  const handleExportReport = async () => {
    try {
      const report = {
        troubleshootingIssues,
        diagnosticTools,
        troubleshootingHistory,
        summary: {
          totalIssues,
          openIssues,
          criticalIssues,
          investigatingIssues,
          exportedAt: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `troubleshooting-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Troubleshooting report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleViewIssueDetails = (issueId: string) => {
    setSelectedIssue(issueId);
    toast.info(`Viewing details for issue ${issueId}`);
  };

  const handleStartTroubleshooting = (issueId: string) => {
    toast.info(`Starting troubleshooting for issue ${issueId}`);
    // TODO: Implement troubleshooting workflow
  };

  const handleViewGuide = (guideId: string) => {
    toast.info(`Viewing troubleshooting guide ${guideId}`);
    // TODO: Implement guide viewer
  };

  const handleRunDiagnostics = (issueId: string) => {
    toast.info(`Running diagnostics for issue ${issueId}`);
    // TODO: Implement diagnostic tools
  };

  const handleCopySteps = async (issueId: string) => {
    try {
      const issue = troubleshootingIssues.find(i => i.id === issueId);
      if (issue && issue.resolutionSteps) {
        const steps = issue.resolutionSteps.map((step, index) => 
          `${index + 1}. ${step.action}\n   ${step.description}`
        ).join('\n\n');
        
        await navigator.clipboard.writeText(steps);
        toast.success('Resolution steps copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy steps:', error);
      toast.error('Failed to copy steps');
    }
  };

  const handleStartResolution = (issueId: string) => {
    toast.info(`Starting resolution for issue ${issueId}`);
    // TODO: Implement resolution workflow
  };

  const handleStopTool = (toolId: string) => {
    toast.info(`Stopping diagnostic tool ${toolId}`);
    // TODO: Implement tool stop functionality
  };

  const handleViewResults = (toolId: string) => {
    toast.info(`Viewing results for tool ${toolId}`);
    // TODO: Implement results viewer
  };

  const handleConfigureTool = (toolId: string) => {
    toast.info(`Configuring diagnostic tool ${toolId}`);
    // TODO: Implement tool configuration
  };

  const handleExportHistory = async () => {
    try {
      const history = {
        troubleshootingHistory,
        summary: {
          totalSessions: troubleshootingHistory.length,
          exportedAt: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `troubleshooting-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Troubleshooting history exported successfully');
    } catch (error) {
      console.error('Failed to export history:', error);
      toast.error('Failed to export history');
    }
  };

  const handleViewSession = (sessionId: string) => {
    toast.info(`Viewing troubleshooting session ${sessionId}`);
    // TODO: Implement session viewer
  };

  const handleViewLogs = (sessionId: string) => {
    toast.info(`Viewing logs for session ${sessionId}`);
    // TODO: Implement log viewer
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Troubleshooting</h1>
          <p className="text-muted-foreground">
            Diagnose and resolve integration issues and problems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {openIssues} open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Search className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{investigatingIssues}</div>
            <p className="text-xs text-muted-foreground">
              being investigated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45m</div>
            <p className="text-xs text-muted-foreground">
              average resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalIssues} critical issues</strong> require immediate attention. 
            Review and resolve to minimize business impact.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issues">Active Issues</TabsTrigger>
          <TabsTrigger value="guides">Troubleshooting Guides</TabsTrigger>
          <TabsTrigger value="tools">Diagnostic Tools</TabsTrigger>
          <TabsTrigger value="history">Issue History</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Active Issues</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage current integration issues
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search issues..."
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
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issues List */}
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <Card 
                  key={issue.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIssue === issue.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedIssue(issue.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(issue.severity)}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{issue.title}</CardTitle>
                          <CardDescription>{issue.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(issue.category)}>
                          {issue.category}
                        </Badge>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Integration:</span>
                      <Badge variant="outline">{issue.integration}</Badge>
                      <span className="text-muted-foreground">Impact:</span>
                      <Badge className={getSeverityColor(issue.impact.businessImpact)}>
                        {issue.impact.businessImpact}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Detected:</span>
                        <p className="font-medium">{issue.detectedAt}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned:</span>
                        <p className="font-medium">{issue.assignedTo || 'Unassigned'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Affected Users:</span>
                        <p className="font-medium">{issue.impact.affectedUsers}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Resolution:</span>
                        <p className="font-medium">{issue.diagnosis.estimatedResolutionTime}m</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewIssueDetails(issue.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStartTroubleshooting(issue.id)}>
                        <Wrench className="w-4 h-4 mr-2" />
                        Start Troubleshooting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Issue Details */}
            <div>
              {selectedIssueData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedIssueData.title}
                      <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedIssueData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Issue Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity:</span>
                            <Badge className={getSeverityColor(selectedIssueData.severity)}>
                              {selectedIssueData.severity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedIssueData.status)}>
                              {selectedIssueData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedIssueData.category)}>
                              {selectedIssueData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Integration:</span>
                            <span className="font-medium">{selectedIssueData.integration}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Business Impact</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Affected Users:</span>
                            <span className="font-medium">{selectedIssueData.impact.affectedUsers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Business Impact:</span>
                            <Badge className={getSeverityColor(selectedIssueData.impact.businessImpact)}>
                              {selectedIssueData.impact.businessImpact}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Downtime:</span>
                            <span className="font-medium">{selectedIssueData.impact.estimatedDowntime}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Financial Impact:</span>
                            <span className="font-medium">${selectedIssueData.impact.financialImpact}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Symptoms</h4>
                      <div className="space-y-2">
                        {selectedIssueData.symptoms.map((symptom) => (
                          <div key={symptom.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                symptom.severity === 'error' ? 'bg-red-600' :
                                symptom.severity === 'warning' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{symptom.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  {symptom.source} • {symptom.observedAt}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {symptom.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Diagnosis</h4>
                      <div className="bg-muted p-3 rounded text-sm space-y-2">
                        <div>
                          <span className="font-medium">Probable Cause:</span>
                          <p className="mt-1">{selectedIssueData.diagnosis.probableCause}</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Confidence:</span>
                          <span className="font-medium">{selectedIssueData.diagnosis.confidence}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Recommended Actions:</span>
                          <ul className="mt-1 list-disc list-inside">
                            {selectedIssueData.diagnosis.recommendedActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Resolution Steps</h4>
                      <div className="space-y-2">
                        {selectedIssueData.resolution.steps.map((step) => (
                          <div key={step.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                step.status === 'completed' ? 'bg-green-600' :
                                step.status === 'in_progress' ? 'bg-blue-600' :
                                step.status === 'failed' ? 'bg-red-600' :
                                'bg-gray-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{step.description}</div>
                                {step.notes && (
                                  <div className="text-xs text-muted-foreground mt-1">{step.notes}</div>
                                )}
                              </div>
                            </div>
                            <Badge className={
                              step.status === 'completed' ? 'bg-green-50 text-green-600' :
                              step.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                              step.status === 'failed' ? 'bg-red-50 text-red-600' :
                              'bg-gray-50 text-gray-600'
                            }>
                              {step.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Wrench className="w-4 h-4 mr-2" />
                        Start Resolution
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleViewGuide(issue.id)}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        View Guide
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRunDiagnostics(issue.id)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Run Diagnostics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an issue to view details and start troubleshooting
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Troubleshooting Guides</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step guides for common integration issues
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Guide
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {troubleshootingGuides.map((guide) => (
              <Card key={guide.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <Badge className={
                      guide.difficulty === 'beginner' ? 'text-green-600 bg-green-50' :
                      guide.difficulty === 'intermediate' ? 'text-yellow-600 bg-yellow-50' :
                      'text-red-600 bg-red-50'
                    }>
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge className={getCategoryColor(guide.category)}>
                      {guide.category}
                    </Badge>
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-medium">{guide.estimatedTime}m</span>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Common Symptoms:</h5>
                    <div className="space-y-1">
                      {guide.symptoms.slice(0, 3).map((symptom, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {symptom}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Guide
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCopySteps(issue.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Steps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Diagnostic Tools</h3>
              <p className="text-sm text-muted-foreground">
                Run diagnostic tests to identify issues
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diagnosticTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge className={
                      tool.status === 'available' ? 'text-green-600 bg-green-50' :
                      tool.status === 'running' ? 'text-blue-600 bg-blue-50' :
                      tool.status === 'completed' ? 'text-purple-600 bg-purple-50' :
                      'text-red-600 bg-red-50'
                    }>
                      {tool.status}
                    </Badge>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {tool.type}
                    </Badge>
                    <span className="text-muted-foreground">Integration:</span>
                    <Badge variant="outline">{tool.integration}</Badge>
                  </div>

                  {tool.results && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Result:</span>
                        <Badge className={
                          tool.results.status === 'pass' ? 'bg-green-50 text-green-600' :
                          tool.results.status === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }>
                          {tool.results.status}
                        </Badge>
                      </div>
                      <p className="text-xs">{tool.results.summary}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {tool.status === 'available' ? (
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Run Tool
                      </Button>
                    ) : tool.status === 'running' ? (
                      <Button size="sm" variant="outline" onClick={() => handleStopTool(tool.id)}>
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleViewResults(tool.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleConfigureTool(tool.id)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Issue History</h3>
              <p className="text-sm text-muted-foreground">
                Review past issues and resolutions
              </p>
            </div>
            <Button variant="outline" onClick={handleExportHistory}>
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Title</th>
                      <th className="text-left p-4 font-medium">Integration</th>
                      <th className="text-left p-4 font-medium">Severity</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Detected</th>
                      <th className="text-left p-4 font-medium">Resolved</th>
                      <th className="text-left p-4 font-medium">Duration</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {troubleshootingIssues
                      .filter(issue => issue.status === 'resolved' || issue.status === 'closed')
                      .map((issue) => (
                      <tr key={issue.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div className="font-medium">{issue.title}</div>
                        </td>
                        <td className="p-4">{issue.integration}</td>
                        <td className="p-4">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{issue.detectedAt}</td>
                        <td className="p-4 text-sm">{issue.resolution.actualResolutionTime ? issue.resolution.verifiedAt : 'N/A'}</td>
                        <td className="p-4 text-sm">
                          {issue.resolution.actualResolutionTime ? `${issue.resolution.actualResolutionTime}m` : 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewSession(session.id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleViewLogs(session.id)}>
                              <FileText className="w-4 h-4" />
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
      </Tabs>
    </div>
  );
};

export default IntegrationTroubleshootingPage;
