import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Bell,
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  Search,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Zap,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';
import { PerformanceAlert, AlertSeverity, AlertStatus, AlertCondition, NotificationConfig, EscalationPolicy } from '@/types/performance';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';
import { formatDistanceToNow } from 'date-fns';

const PerformanceAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Load performance alerts from API on component mount
  useEffect(() => {
    const loadPerformanceAlerts = async () => {
      setLoading(true);
      try {
        const alertsData = await performanceApi.getPerformanceAlerts();
        if (alertsData) {
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Failed to load performance alerts:', error);
        toast.error('Failed to load performance alerts');
      } finally {
        setLoading(false);
      }
    };
    loadPerformanceAlerts();
  }, []);

  return (
    // ... rest of the code remains the same ...
  );
};
      condition: {
        metric: 'responseTime.p95',
        operator: 'PERCENTAGE_CHANGE',
        value: 20,
        duration: 3600,
        evaluationWindow: '1h'
      },
      threshold: {
        warning: 20,
        critical: 50,
        recovery: 10
      },
      triggeredAt: new Date('2024-01-20T12:30:00'),
      acknowledgedAt: new Date('2024-01-20T13:00:00'),
      acknowledgedBy: 'john.doe@company.com',
      impact: {
        usersAffected: 500,
        revenueImpact: 1000,
        businessImpact: 'LOW',
        affectedServices: ['web-app'],
        customerComplaints: 1
      },
      actions: [
        {
          type: 'MANUAL',
          description: 'Investigated database query performance',
          executedAt: new Date('2024-01-20T13:15:00'),
          executedBy: 'john.doe@company.com',
          result: 'SUCCESS'
        },
        {
          type: 'AUTOMATED',
          description: 'Added database index for slow query',
          executedAt: new Date('2024-01-20T13:30:00'),
          result: 'SUCCESS'
        }
      ],
      notifications: [
        {
          type: 'SLACK',
          enabled: true,
          recipients: ['#performance-alerts'],
          frequency: 'IMMEDIATE'
        },
        {
          type: 'EMAIL',
          enabled: true,
          recipients: ['dev-team@company.com'],
          frequency: 'HOURLY'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 600,
            recipients: ['dev-team@company.com'],
            notificationTypes: ['SLACK']
          }
        ],
        currentLevel: 1
      }
    },
    {
      id: '3',
      name: 'Critical Service Down',
      description: 'Payment service is completely unresponsive',
      severity: 'CRITICAL',
      status: 'OPEN',
      condition: {
        metric: 'availability.availability',
        operator: 'LESS_THAN',
        value: 95,
        duration: 60,
        evaluationWindow: '1m'
      },
      threshold: {
        warning: 99,
        critical: 95,
        recovery: 99.5
      },
      triggeredAt: new Date('2024-01-20T14:20:00'),
      impact: {
        usersAffected: 5000,
        revenueImpact: 15000,
        businessImpact: 'CRITICAL',
        affectedServices: ['payment-service', 'checkout-api'],
        customerComplaints: 25
      },
      actions: [
        {
          type: 'MANUAL',
          description: 'Attempted service restart',
          executedAt: new Date('2024-01-20T14:25:00'),
          executedBy: 'sre@company.com',
          result: 'FAILED'
        },
        {
          type: 'MANUAL',
          description: 'Engaged on-call engineer',
          executedAt: new Date('2024-01-20T14:30:00'),
          executedBy: 'manager@company.com',
          result: 'SUCCESS'
        }
      ],
      notifications: [
        {
          type: 'EMAIL',
          enabled: true,
          recipients: ['all-hands@company.com'],
          frequency: 'IMMEDIATE'
        },
        {
          type: 'SMS',
          enabled: true,
          recipients: ['+1234567890', '+0987654321'],
          frequency: 'IMMEDIATE'
        },
        {
          type: 'PAGERDUTY',
          enabled: true,
          recipients: ['oncall-payment'],
          frequency: 'IMMEDIATE'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 60,
            recipients: ['sre@company.com'],
            notificationTypes: ['EMAIL', 'SMS', 'PAGERDUTY']
          },
          {
            level: 2,
            delay: 300,
            recipients: ['manager@company.com', 'cto@company.com'],
            notificationTypes: ['EMAIL', 'SMS', 'PHONE']
          }
        ],
        currentLevel: 2,
        lastEscalatedAt: new Date('2024-01-20T14:25:00')
      }
    },
    {
      id: '4',
      name: 'Database Connection Pool Exhaustion',
      description: 'Database connection pool is at 95% capacity',
      severity: 'HIGH',
      status: 'RESOLVED',
      condition: {
        metric: 'database.connectionPool.usage',
        operator: 'GREATER_THAN',
        value: 90,
        duration: 120,
        evaluationWindow: '2m'
      },
      threshold: {
        warning: 80,
        critical: 95,
        recovery: 70
      },
      triggeredAt: new Date('2024-01-20T10:15:00'),
      acknowledgedAt: new Date('2024-01-20T10:30:00'),
      acknowledgedBy: 'db-admin@company.com',
      resolvedAt: new Date('2024-01-20T11:45:00'),
      resolvedBy: 'db-admin@company.com',
      duration: 5400,
      impact: {
        usersAffected: 2000,
        revenueImpact: 5000,
        businessImpact: 'MEDIUM',
        affectedServices: ['web-app', 'mobile-app'],
        customerComplaints: 8
      },
      actions: [
        {
          type: 'AUTOMATED',
          description: 'Increased connection pool size',
          executedAt: new Date('2024-01-20T10:45:00'),
          result: 'SUCCESS'
        },
        {
          type: 'MANUAL',
          description: 'Optimized slow queries',
          executedAt: new Date('2024-01-20T11:30:00'),
          executedBy: 'db-admin@company.com',
          result: 'SUCCESS'
        }
      ],
      notifications: [
        {
          type: 'EMAIL',
          enabled: true,
          recipients: ['db-admin@company.com', 'devops@company.com'],
          frequency: 'IMMEDIATE'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 300,
            recipients: ['db-admin@company.com'],
            notificationTypes: ['EMAIL']
          }
        ],
        currentLevel: 1
      }
    },
    {
      id: '5',
      name: 'Low User Satisfaction',
      description: 'User satisfaction score dropped below 4.0',
      severity: 'MEDIUM',
      status: 'OPEN',
      condition: {
        metric: 'userExperience.satisfactionScore',
        operator: 'LESS_THAN',
        value: 4.0,
        duration: 1800,
        evaluationWindow: '30m'
      },
      threshold: {
        warning: 4.2,
        critical: 3.5,
        recovery: 4.5
      },
      triggeredAt: new Date('2024-01-20T13:00:00'),
      impact: {
        usersAffected: 3000,
        revenueImpact: 3000,
        businessImpact: 'MEDIUM',
        affectedServices: ['web-app', 'mobile-app'],
        customerComplaints: 12
      },
      actions: [],
      notifications: [
        {
          type: 'EMAIL',
          enabled: true,
          recipients: ['product@company.com', 'ux@company.com'],
          frequency: 'DAILY'
        },
        {
          type: 'SLACK',
          enabled: true,
          recipients: ['#product-alerts'],
          frequency: 'HOURLY'
        }
      ],
      escalationPolicy: {
        levels: [
          {
            level: 1,
            delay: 3600,
            recipients: ['product@company.com'],
            notificationTypes: ['EMAIL', 'SLACK']
          }
        ],
        currentLevel: 1
      }
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [newAlertDialog, setNewAlertDialog] = useState(false);
  const [editAlertDialog, setEditAlertDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'ALL'>('ALL');
  
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    severity: 'MEDIUM' as AlertSeverity,
    metric: 'responseTime.average',
    operator: 'GREATER_THAN' as const,
    value: 1000,
    duration: 300,
    evaluationWindow: '5m',
    warningThreshold: 800,
    criticalThreshold: 1200,
    recoveryThreshold: 700
  });

  const availableMetrics = [
    'responseTime.average',
    'responseTime.p95',
    'responseTime.p99',
    'errorRate.errorRate',
    'throughput.requestsPerSecond',
    'availability.availability',
    'resourceUsage.cpu.percentage',
    'resourceUsage.memory.percentage',
    'resourceUsage.disk.percentage',
    'userExperience.satisfactionScore',
    'userExperience.apdex',
    'businessMetrics.conversionRate'
  ];

  const handleCreateAlert = async () => {
    if (!newAlert.name || !newAlert.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const alert: PerformanceAlert = {
        id: Date.now().toString(),
        name: newAlert.name,
        description: newAlert.description,
        severity: newAlert.severity,
        status: 'OPEN',
        condition: {
          metric: newAlert.metric,
          operator: newAlert.operator,
          value: newAlert.value,
          duration: newAlert.duration,
          evaluationWindow: newAlert.evaluationWindow
        },
        threshold: {
          warning: newAlert.warningThreshold,
          critical: newAlert.criticalThreshold,
          recovery: newAlert.recoveryThreshold
        },
        triggeredAt: new Date(),
        impact: {
          usersAffected: 0,
          revenueImpact: 0,
          businessImpact: 'LOW',
          affectedServices: [],
          customerComplaints: 0
        },
        actions: [],
        notifications: [
          {
            type: 'EMAIL',
            enabled: true,
            recipients: ['devops@company.com'],
            frequency: 'IMMEDIATE'
          }
        ],
        escalationPolicy: {
          levels: [
            {
              level: 1,
              delay: 300,
              recipients: ['devops@company.com'],
              notificationTypes: ['EMAIL']
            }
          ],
          currentLevel: 1
        }
      };

      setAlerts([alert, ...alerts]);
      setNewAlertDialog(false);
      setNewAlert({
        name: '',
        description: '',
        severity: 'MEDIUM',
        metric: 'responseTime.average',
        operator: 'GREATER_THAN',
        value: 1000,
        duration: 300,
        evaluationWindow: '5m',
        warningThreshold: 800,
        criticalThreshold: 1200,
        recoveryThreshold: 700
      });
      toast.success('Alert rule created successfully');
    } catch (error) {
      toast.error('Failed to create alert rule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async () => {
    if (!selectedAlert) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAlerts(alerts.map(alert => 
        alert.id === selectedAlert.id 
          ? selectedAlert
          : alert
      ));
      setEditAlertDialog(false);
      toast.success('Alert updated successfully');
    } catch (error) {
      toast.error('Failed to update alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      toast.success('Alert deleted successfully');
    } catch (error) {
      toast.error('Failed to delete alert');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'ACKNOWLEDGED' as const,
              acknowledgedAt: new Date(),
              acknowledgedBy: 'current-user@company.com'
            }
          : alert
      ));
      toast.success('Alert acknowledged successfully');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'RESOLVED' as const,
              resolvedAt: new Date(),
              resolvedBy: 'current-user@company.com',
              duration: alert.triggeredAt ? Date.now() - alert.triggeredAt.getTime() : undefined
            }
          : alert
      ));
      toast.success('Alert resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'ACKNOWLEDGED': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'RESOLVED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'SUPPRESSED': return <XCircle className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'ACKNOWLEDGED': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'SUPPRESSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'SMS': return <Phone className="h-4 w-4" />;
      case 'SLACK': return <MessageSquare className="h-4 w-4" />;
      case 'PAGERDUTY': return <Bell className="h-4 w-4" />;
      case 'WEBHOOK': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.condition.metric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const openAlerts = alerts.filter(a => a.status === 'OPEN');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'ACKNOWLEDGED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Alerts</h1>
          <p className="text-gray-600">Configure and manage performance monitoring alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={newAlertDialog} onOpenChange={setNewAlertDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Alert Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Alert Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alert Name</Label>
                    <Input
                      placeholder="Enter alert name"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={newAlert.severity} onValueChange={(value: AlertSeverity) => setNewAlert({...newAlert, severity: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the alert condition and impact"
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Metric</Label>
                    <Select value={newAlert.metric} onValueChange={(value) => setNewAlert({...newAlert, metric: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMetrics.map(metric => (
                          <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Operator</Label>
                    <Select value={newAlert.operator} onValueChange={(value: any) => setNewAlert({...newAlert, operator: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                        <SelectItem value="LESS_THAN">Less Than</SelectItem>
                        <SelectItem value="EQUALS">Equals</SelectItem>
                        <SelectItem value="PERCENTAGE_CHANGE">Percentage Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Threshold Value</Label>
                    <Input
                      type="number"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert({...newAlert, value: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={newAlert.duration}
                      onChange={(e) => setNewAlert({...newAlert, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Evaluation Window</Label>
                    <Select value={newAlert.evaluationWindow} onValueChange={(value) => setNewAlert({...newAlert, evaluationWindow: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1 minute</SelectItem>
                        <SelectItem value="5m">5 minutes</SelectItem>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="30m">30 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Warning Threshold</Label>
                    <Input
                      type="number"
                      value={newAlert.warningThreshold}
                      onChange={(e) => setNewAlert({...newAlert, warningThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Critical Threshold</Label>
                    <Input
                      type="number"
                      value={newAlert.criticalThreshold}
                      onChange={(e) => setNewAlert({...newAlert, criticalThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Recovery Threshold</Label>
                    <Input
                      type="number"
                      value={newAlert.recoveryThreshold}
                      onChange={(e) => setNewAlert({...newAlert, recoveryThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setNewAlertDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAlert} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Alert Rule'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openAlerts.length}</p>
                <p className="text-sm text-gray-600">Open Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acknowledgedAlerts.length}</p>
                <p className="text-sm text-gray-600">Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts by name, description, or metric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
                <option value="SUPPRESSED">Suppressed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No alerts found</p>
              <p className="text-sm">Create your first alert rule to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map(alert => (
            <Card key={alert.id} className={
              alert.severity === 'CRITICAL' ? 'border-red-200' : 
              alert.severity === 'HIGH' ? 'border-orange-200' : ''
            }>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.status === 'OPEN' ? 'bg-red-100' : 
                      alert.status === 'ACKNOWLEDGED' ? 'bg-yellow-100' : 
                      alert.status === 'RESOLVED' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(alert.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Triggered: {formatDistanceToNow(alert.triggeredAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Condition */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Condition:</span>
                    <code className="text-sm bg-white px-2 py-1 rounded">
                      {alert.condition.metric} {alert.condition.operator} {alert.condition.value} for {alert.condition.duration}s
                    </code>
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{alert.impact.usersAffected.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Users Affected</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">${alert.impact.revenueImpact.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue Impact</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{alert.impact.affectedServices.length}</p>
                    <p className="text-sm text-gray-600">Services Affected</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{alert.impact.customerComplaints}</p>
                    <p className="text-sm text-gray-600">Complaints</p>
                  </div>
                </div>

                {/* Notifications */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Notifications:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alert.notifications.map((notification, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded">
                        {getNotificationIcon(notification.type)}
                        <span>{notification.type}</span>
                        {notification.enabled ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {alert.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={loading}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                  {(alert.status === 'OPEN' || alert.status === 'ACKNOWLEDGED') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setEditAlertDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alert Name</Label>
                  <p className="font-medium">{selectedAlert.name}</p>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedAlert.status)}>
                    {selectedAlert.status}
                  </Badge>
                </div>
                <div>
                  <Label>Triggered At</Label>
                  <p className="font-medium">{selectedAlert.triggeredAt.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="font-medium">{selectedAlert.description}</p>
              </div>

              <div>
                <Label>Alert Condition</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(selectedAlert.condition, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <Label>Thresholds</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800">Warning</p>
                    <p className="text-2xl font-bold text-yellow-600">{selectedAlert.threshold.warning}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800">Critical</p>
                    <p className="text-2xl font-bold text-red-600">{selectedAlert.threshold.critical}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">Recovery</p>
                    <p className="text-2xl font-bold text-green-600">{selectedAlert.threshold.recovery}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Impact Analysis</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Users Affected</span>
                    <p className="font-medium">{selectedAlert.impact.usersAffected.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Revenue Impact</span>
                    <p className="font-medium">${selectedAlert.impact.revenueImpact.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Business Impact</span>
                    <p className="font-medium">{selectedAlert.impact.businessImpact}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Customer Complaints</span>
                    <p className="font-medium">{selectedAlert.impact.customerComplaints}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Alert
                </Button>
                {selectedAlert.status === 'OPEN' && (
                  <Button onClick={() => handleAcknowledgeAlert(selectedAlert.id)} disabled={loading}>
                    <Clock className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                {(selectedAlert.status === 'OPEN' || selectedAlert.status === 'ACKNOWLEDGED') && (
                  <Button onClick={() => handleResolveAlert(selectedAlert.id)} disabled={loading}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Alert Dialog */}
      <Dialog open={editAlertDialog} onOpenChange={setEditAlertDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <Label>Alert Name</Label>
                <Input
                  value={selectedAlert.name}
                  onChange={(e) => setSelectedAlert({...selectedAlert, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedAlert.description}
                  onChange={(e) => setSelectedAlert({...selectedAlert, description: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditAlertDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAlert} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Alert'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceAlertsPage;
