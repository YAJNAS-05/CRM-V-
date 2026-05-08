import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Eye,
  Download,
 Edit,
  Trash2,
  Copy,
  Save,
  Target,
  Gauge,
 Zap,
  Activity,
  BarChart3,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Timer,
  Cpu,
  Database,
  Globe,
  Server,
  HardDrive,
  MemoryStick,
  Network,
  Users,
  Volume2,
  VolumeX,
  AlertCircle,
  Shield,
  Lock,
  Unlock,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  Webhook,
  Slack,
  MicrosoftTeams,
  Discord,
  Telegram
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface PerformanceThreshold {
  id: string;
  name: string;
  description: string;
  metric: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'user_experience' | 'availability';
  type: 'warning' | 'critical' | 'info';
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
  value: number;
  duration: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'triggered' | 'resolved';
  lastTriggered?: string;
  triggerCount: number;
  notifications: NotificationConfig[];
  escalation: EscalationConfig;
  history: ThresholdHistory[];
}

interface NotificationConfig {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook' | 'discord' | 'telegram';
  enabled: boolean;
  recipients: string[];
  template: string;
  cooldown: number;
}

interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
  currentLevel: number;
  triggeredAt?: string;
}

interface EscalationLevel {
  level: number;
  delay: number;
  recipients: string[];
  message: string;
  notified: boolean;
  notifiedAt?: string;
}

interface ThresholdHistory {
  id: string;
  timestamp: string;
  oldValue: number;
  newValue: number;
  triggered: boolean;
  resolved: boolean;
  duration?: number;
  notifications: number;
}

interface ThresholdGroup {
  id: string;
  name: string;
  description: string;
  thresholds: string[];
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}

interface ThresholdTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thresholds: Omit<PerformanceThreshold, 'id' | 'status' | 'lastTriggered' | 'triggerCount' | 'history'>[];
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
}

const PerformanceThresholdsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('thresholds');
  const [selectedThreshold, setSelectedThreshold] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [performanceThresholds, setPerformanceThresholds] = useState<PerformanceThreshold[]>([]);
  const [loading, setLoading] = useState(false);

  // Load performance thresholds from API on component mount
  useEffect(() => {
    const loadPerformanceThresholds = async () => {
      setLoading(true);
      try {
        const thresholdsData = await performanceApi.getPerformanceThresholds();
        if (thresholdsData) {
          setPerformanceThresholds(thresholdsData);
        }
      } catch (error) {
        console.error('Failed to load performance thresholds:', error);
        toast.error('Failed to load performance thresholds');
      } finally {
        setLoading(false);
      }
    };
    loadPerformanceThresholds();
  }, []);

  // ... rest of the code remains the same ...
        ],
        currentLevel: 0
      },
      history: [
        {
          id: 'hist-1',
          timestamp: '2024-01-15 14:30:00',
          oldValue: 450,
          newValue: 520,
          triggered: true,
          resolved: true,
          duration: 180,
          notifications: 3
        },
        {
          id: 'hist-2',
          timestamp: '2024-01-15 10:15:00',
          oldValue: 480,
          newValue: 510,
          triggered: true,
          resolved: true,
          duration: 120,
          notifications: 2
        }
      ]
    },
    {
      id: 'threshold-2',
      name: 'Error Rate Critical',
      description: 'Critical alert when error rate exceeds 5%',
      metric: 'error_rate',
      category: 'error_rate',
      type: 'critical',
      operator: 'greater_than',
      value: 5,
      duration: 60,
      enabled: true,
      severity: 'critical',
      status: 'triggered',
      lastTriggered: '2024-01-15 15:45:00',
      triggerCount: 3,
      notifications: [
        {
          id: 'notif-3',
          type: 'email',
          enabled: true,
          recipients: ['dev-team@company.com', 'ops-team@company.com', 'manager@company.com'],
          template: 'error-rate-critical',
          cooldown: 300
        },
        {
          id: 'notif-4',
          type: 'sms',
          enabled: true,
          recipients: ['+1234567890'],
          template: 'error-rate-critical-sms',
          cooldown: 600
        },
        {
          id: 'notif-5',
          type: 'teams',
          enabled: true,
          recipients: ['performance-team'],
          template: 'error-rate-critical-teams',
          cooldown: 300
        }
      ],
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 300,
            recipients: ['on-call-engineer@company.com'],
            message: 'Critical error rate detected - immediate attention required',
            notified: true,
            notifiedAt: '2024-01-15 15:50:00'
          },
          {
            level: 2,
            delay: 900,
            recipients: ['cto@company.com'],
            message: 'Critical error rate persists - executive notification',
            notified: false
          }
        ],
        currentLevel: 1,
        triggeredAt: '2024-01-15 15:45:00'
      },
      history: [
        {
          id: 'hist-3',
          timestamp: '2024-01-15 15:45:00',
          oldValue: 3.2,
          newValue: 6.8,
          triggered: true,
          resolved: false,
          notifications: 5
        }
      ]
    },
    {
      id: 'threshold-3',
      name: 'CPU Usage High',
      description: 'Warning when CPU usage exceeds 80%',
      metric: 'cpu_usage',
      category: 'resource_usage',
      type: 'warning',
      operator: 'greater_than',
      value: 80,
      duration: 600,
      enabled: true,
      severity: 'medium',
      status: 'active',
      triggerCount: 8,
      notifications: [
        {
          id: 'notif-6',
          type: 'email',
          enabled: true,
          recipients: ['ops-team@company.com'],
          template: 'cpu-usage-warning',
          cooldown: 1200
        }
      ],
      escalation: {
        enabled: false,
        levels: [],
        currentLevel: 0
      },
      history: []
    },
    {
      id: 'threshold-4',
      name: 'Memory Usage Critical',
      description: 'Critical alert when memory usage exceeds 95%',
      metric: 'memory_usage',
      category: 'resource_usage',
      type: 'critical',
      operator: 'greater_than',
      value: 95,
      duration: 120,
      enabled: false,
      severity: 'critical',
      status: 'inactive',
      triggerCount: 0,
      notifications: [
        {
          id: 'notif-7',
          type: 'email',
          enabled: true,
          recipients: ['ops-team@company.com'],
          template: 'memory-usage-critical',
          cooldown: 600
        },
        {
          id: 'notif-8',
          type: 'webhook',
          enabled: true,
          recipients: ['https://api.company.com/alerts'],
          template: 'memory-usage-critical-webhook',
          cooldown: 300
        }
      ],
      escalation: {
        enabled: true,
        levels: [
          {
            level: 1,
            delay: 300,
            recipients: ['infrastructure-lead@company.com'],
            message: 'Memory usage critical - system at risk',
            notified: false
          }
        ],
        currentLevel: 0
      },
      history: []
    },
    {
      id: 'threshold-5',
      name: 'Throughput Drop',
      description: 'Alert when throughput drops by 20%',
      metric: 'throughput',
      category: 'throughput',
      type: 'warning',
      operator: 'percentage_change',
      value: -20,
      duration: 300,
      enabled: true,
      severity: 'high',
      status: 'active',
      triggerCount: 5,
      notifications: [
        {
          id: 'notif-9',
          type: 'slack',
          enabled: true,
          recipients: ['#performance-alerts'],
          template: 'throughput-drop-warning',
          cooldown: 900
        }
      ],
      escalation: {
        enabled: false,
        levels: [],
        currentLevel: 0
      },
      history: []
    }
  ];

  const thresholdGroups: ThresholdGroup[] = [
    {
      id: 'group-1',
      name: 'API Performance Thresholds',
      description: 'Thresholds for API response time and error rates',
      thresholds: ['threshold-1', 'threshold-2'],
      enabled: true,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    },
    {
      id: 'group-2',
      name: 'Resource Usage Thresholds',
      description: 'Thresholds for CPU, memory, and disk usage',
      thresholds: ['threshold-3', 'threshold-4'],
      enabled: true,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    },
    {
      id: 'group-3',
      name: 'Business Metrics Thresholds',
      description: 'Thresholds for business-critical metrics',
      thresholds: ['threshold-5'],
      enabled: true,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    }
  ];

  const thresholdTemplates: ThresholdTemplate[] = [
    {
      id: 'template-1',
      name: 'Standard API Thresholds',
      description: 'Standard thresholds for API performance monitoring',
      category: 'api',
      thresholds: [
        {
          name: 'Response Time Warning',
          description: 'Warning for slow API responses',
          metric: 'response_time',
          category: 'response_time',
          type: 'warning',
          operator: 'greater_than',
          value: 500,
          duration: 300,
          enabled: true,
          severity: 'medium',
          notifications: [
            {
              id: 'temp-notif-1',
              type: 'email',
              enabled: true,
              recipients: ['dev-team@company.com'],
              template: 'response-time-warning',
              cooldown: 900
            }
          ],
          escalation: {
            enabled: false,
            levels: [],
            currentLevel: 0
          }
        }
      ],
      isDefault: true,
      createdAt: '2024-01-01 00:00:00',
      createdBy: 'Admin'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'triggered':
        return 'text-red-600 bg-red-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'resolved':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'response_time':
        return 'text-blue-600 bg-blue-50';
      case 'throughput':
        return 'text-green-600 bg-green-50';
      case 'error_rate':
        return 'text-red-600 bg-red-50';
      case 'resource_usage':
        return 'text-orange-600 bg-orange-50';
      case 'user_experience':
        return 'text-purple-600 bg-purple-50';
      case 'availability':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'slack':
        return <Slack className="w-4 h-4" />;
      case 'teams':
        return <MicrosoftTeams className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      case 'discord':
        return <Discord className="w-4 h-4" />;
      case 'telegram':
        return <Telegram className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const filteredThresholds = performanceThresholds.filter(threshold => {
    const matchesSearch = threshold.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threshold.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threshold.metric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || threshold.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || threshold.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || threshold.severity === filterSeverity;
    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  const selectedThresholdData = performanceThresholds.find(t => t.id === selectedThreshold);

  const totalThresholds = performanceThresholds.length;
  const activeThresholds = performanceThresholds.filter(t => t.status === 'active').length;
  const triggeredThresholds = performanceThresholds.filter(t => t.status === 'triggered').length;
  const criticalThresholds = performanceThresholds.filter(t => t.severity === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Thresholds</h1>
          <p className="text-muted-foreground">
            Configure and manage performance monitoring thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Threshold Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Threshold
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Thresholds</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThresholds}</div>
            <p className="text-xs text-muted-foreground">
              configured thresholds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Thresholds</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeThresholds}</div>
            <p className="text-xs text-muted-foreground">
              currently monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triggered Thresholds</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{triggeredThresholds}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Thresholds</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{criticalThresholds}</div>
            <p className="text-xs text-muted-foreground">
              high severity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {triggeredThresholds > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{triggeredThresholds} threshold(s)</strong> are currently triggered. 
            Review the triggered thresholds and take appropriate action.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Thresholds</h3>
              <p className="text-sm text-muted-foreground">
                Configure monitoring thresholds for performance metrics
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search thresholds..."
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
                <option value="response_time">Response Time</option>
                <option value="throughput">Throughput</option>
                <option value="error_rate">Error Rate</option>
                <option value="resource_usage">Resource Usage</option>
                <option value="user_experience">User Experience</option>
                <option value="availability">Availability</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="triggered">Triggered</option>
                <option value="inactive">Inactive</option>
                <option value="resolved">Resolved</option>
              </select>
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thresholds List */}
            <div className="space-y-4">
              {filteredThresholds.map((threshold) => (
                <Card 
                  key={threshold.id}
                  className={`cursor-pointer transition-colors ${
                    selectedThreshold === threshold.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedThreshold(threshold.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(threshold.status)}`}>
                          {threshold.status === 'triggered' ? <AlertTriangle className="w-4 h-4" /> :
                           threshold.status === 'active' ? <CheckCircle className="w-4 h-4" /> :
                           threshold.status === 'inactive' ? <BellOff className="w-4 h-4" /> :
                           <Target className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{threshold.name}</CardTitle>
                          <CardDescription>{threshold.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(threshold.severity)}>
                          {threshold.severity}
                        </Badge>
                        <Badge className={getStatusColor(threshold.status)}>
                          {threshold.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Metric:</span>
                      <Badge className={getCategoryColor(threshold.category)}>
                        {threshold.metric}
                      </Badge>
                      <span className="text-muted-foreground">Type:</span>
                      <Badge className={getTypeColor(threshold.type)}>
                        {threshold.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Condition:</span>
                        <p className="font-medium">
                          {threshold.operator === 'greater_than' ? '>' :
                           threshold.operator === 'less_than' ? '<' :
                           threshold.operator === 'equals' ? '=' :
                           threshold.operator === 'not_equals' ? '!=' :
                           threshold.operator === 'percentage_change' ? '% change' : ''} {threshold.value}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{threshold.duration}s</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trigger Count:</span>
                        <p className="font-medium">{threshold.triggerCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Triggered:</span>
                        <p className="font-medium">{threshold.lastTriggered || 'Never'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Notifications:</span>
                      <div className="flex gap-1">
                        {threshold.notifications.filter(n => n.enabled).slice(0, 3).map((notif) => (
                          <div key={notif.id} className="p-1 rounded bg-muted">
                            {getNotificationIcon(notif.type)}
                          </div>
                        ))}
                        {threshold.notifications.filter(n => n.enabled).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{threshold.notifications.filter(n => n.enabled).length - 3} more
                          </span>
                        )}
                      </div>
                      {threshold.escalation.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Escalation: L{threshold.escalation.currentLevel}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {threshold.enabled ? (
                        <Button size="sm" variant="outline">
                          <BellOff className="w-4 h-4 mr-2" />
                          Disable
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Bell className="w-4 h-4 mr-2" />
                          Enable
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Threshold Details */}
            <div>
              {selectedThresholdData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedThresholdData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedThreshold(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedThresholdData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Threshold Configuration</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedThresholdData.status)}>
                              {selectedThresholdData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Metric:</span>
                            <Badge className={getCategoryColor(selectedThresholdData.category)}>
                              {selectedThresholdData.metric}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedThresholdData.type)}>
                              {selectedThresholdData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity:</span>
                            <Badge className={getSeverityColor(selectedThresholdData.severity)}>
                              {selectedThresholdData.severity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Condition:</span>
                            <span className="font-medium">
                              {selectedThresholdData.operator} {selectedThresholdData.value}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{selectedThresholdData.duration}s</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Trigger Statistics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Triggers:</span>
                            <span className="font-medium">{selectedThresholdData.triggerCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Triggered:</span>
                            <span className="font-medium">{selectedThresholdData.lastTriggered || 'Never'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enabled:</span>
                            <span className="font-medium">{selectedThresholdData.enabled ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Notification Channels</h4>
                      <div className="space-y-2">
                        {selectedThresholdData.notifications.map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${notification.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div>
                                <div className="font-medium text-sm capitalize">{notification.type}</div>
                                <div className="text-xs text-muted-foreground">
                                  {notification.recipients.length} recipient(s)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.cooldown}s cooldown
                              </Badge>
                              <Badge className={notification.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                                {notification.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedThresholdData.escalation.enabled && (
                      <div>
                        <h4 className="font-medium mb-2">Escalation Policy</h4>
                        <div className="bg-muted p-3 rounded">
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Current Level:</span>
                              <span className="ml-2 font-medium">Level {selectedThresholdData.escalation.currentLevel}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Triggered At:</span>
                              <span className="ml-2 font-medium">{selectedThresholdData.escalation.triggeredAt || 'Not triggered'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {selectedThresholdData.escalation.levels.map((level) => (
                              <div key={level.level} className="flex items-center justify-between p-2 bg-background rounded">
                                <div>
                                  <div className="font-medium text-sm">Level {level.level}</div>
                                  <div className="text-xs text-muted-foreground">
                                    After {level.delay}s • {level.recipients.length} recipient(s)
                                  </div>
                                </div>
                                <Badge className={level.notified ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                                  {level.notified ? 'Notified' : 'Pending'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedThresholdData.history.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recent History</h4>
                        <div className="space-y-2">
                          {selectedThresholdData.history.slice(0, 3).map((history) => (
                            <div key={history.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium text-sm">{history.timestamp}</div>
                                <div className="text-xs text-muted-foreground">
                                  {history.oldValue} → {history.newValue}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={history.triggered ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}>
                                  {history.triggered ? 'Triggered' : 'Resolved'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {history.notifications} notifications
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Threshold
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="w-4 h-4 mr-2" />
                        Test Threshold
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a threshold to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Threshold Groups</h3>
              <p className="text-sm text-muted-foreground">
                Organize thresholds into logical groups
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thresholdGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge className={group.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                      {group.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Thresholds:</span>
                    <p className="font-medium">{group.thresholds.length}</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Created by:</span>
                    <p className="font-medium">{group.createdBy}</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">{group.createdAt}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
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

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Threshold Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-configured threshold templates for quick setup
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thresholdTemplates.map((template) => (
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
                    <span className="text-muted-foreground">Thresholds:</span>
                    <Badge variant="outline">{template.thresholds.length}</Badge>
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
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure global notification settings and templates
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Notification Channel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Available notification channels for thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <Badge className="text-green-600 bg-green-50">Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Slack className="w-4 h-4" />
                    <span className="font-medium">Slack</span>
                  </div>
                  <Badge className="text-green-600 bg-green-50">Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <MicrosoftTeams className="w-4 h-4" />
                    <span className="font-medium">Microsoft Teams</span>
                  </div>
                  <Badge className="text-green-600 bg-green-50">Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span className="font-medium">SMS</span>
                  </div>
                  <Badge className="text-gray-600 bg-gray-50">Not Configured</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  Global notification settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Master switch for all threshold notifications
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Quiet Hours</div>
                    <div className="text-sm text-muted-foreground">
                      Suppress non-critical notifications during quiet hours
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rate Limiting</div>
                    <div className="text-sm text-muted-foreground">
                      Limit notification frequency to prevent spam
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceThresholdsPage;
