import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Settings,
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  RefreshCw,
  Download,
  GitBranch,
  Timer,
  Users,
  FileText,
  Code,
  Database,
  Mail,
  MessageSquare,
  Phone,
  Globe
} from 'lucide-react';
import { Workflow, WorkflowCategory, WorkflowStatus, WorkflowExecution, RunStatus } from '@/types/workflow';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const WorkflowDashboardPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Customer Onboarding Process',
      description: 'Automated onboarding workflow for new customers including welcome emails, account setup, and training scheduling',
      category: 'AUTOMATION',
      status: 'ACTIVE',
      priority: 'HIGH',
      version: '2.1.0',
      trigger: {
        id: 'trigger-1',
        type: 'EVENT',
        config: {
          eventType: 'customer.created'
        },
        enabled: true,
        description: 'Triggered when new customer is created'
      },
      actions: [
        {
          id: 'action-1',
          type: 'SEND_EMAIL',
          name: 'Send Welcome Email',
          description: 'Send personalized welcome email to new customer',
          config: {
            template: 'welcome-email-template',
            recipients: ['{{customer.email}}'],
            subject: 'Welcome to Our Platform!'
          },
          order: 1,
          enabled: true,
          dependencies: [],
          errorHandling: {
            strategy: 'RETRY',
            retryOnFailure: true,
            continueOnError: false,
            errorNotifications: []
          }
        },
        {
          id: 'action-2',
          type: 'CREATE_TASK',
          name: 'Create Onboarding Tasks',
          description: 'Create tasks for account manager',
          config: {
            template: 'onboarding-task-template',
            assignee: '{{customer.accountManager}}'
          },
          order: 2,
          enabled: true,
          dependencies: ['action-1'],
          errorHandling: {
            strategy: 'CONTINUE',
            retryOnFailure: true,
            continueOnError: true,
            errorNotifications: []
          }
        }
      ],
      conditions: [],
      variables: [
        {
          id: 'var-1',
          name: 'customerEmail',
          type: 'EMAIL',
          value: '',
          required: true,
          description: 'Customer email address',
          scope: 'WORKFLOW'
        }
      ],
      settings: {
        concurrency: {
          maxConcurrent: 5,
          queueSize: 100,
          strategy: 'FIFO'
        },
        logging: {
          enabled: true,
          level: 'INFO',
          includePayloads: false,
          retentionDays: 30,
          destinations: ['DATABASE']
        },
        security: {
          encryption: true,
          authentication: {
            required: true,
            method: 'API_KEY'
          },
          authorization: {
            required: true,
            roles: ['admin', 'workflow-manager'],
            permissions: ['execute']
          },
          audit: true
        },
        notifications: {
          onSuccess: [],
          onFailure: [
            {
              type: 'EMAIL',
              recipients: ['admin@company.com'],
              enabled: true
            }
          ],
          onTimeout: []
        }
      },
      metadata: {
        version: '2.1.0',
        environment: 'production',
        category: 'AUTOMATION',
        tags: ['customer', 'onboarding', 'automation'],
        changelog: [
          {
            version: '2.1.0',
            date: new Date('2024-01-15'),
            author: 'john.doe',
            changes: ['Added training scheduling', 'Improved error handling'],
            type: 'MINOR'
          }
        ],
        dependencies: []
      },
      statistics: {
        totalRuns: 1250,
        successfulRuns: 1180,
        failedRuns: 45,
        averageRunTime: 45.5,
        lastRun: new Date('2024-01-20T14:30:00'),
        lastRunStatus: 'COMPLETED',
        successRate: 94.4,
        errorRate: 3.6,
        runsByStatus: {
          'PENDING': 5,
          'RUNNING': 2,
          'COMPLETED': 1180,
          'FAILED': 45,
          'CANCELLED': 3,
          'TIMEOUT': 15
        },
        runsByDate: {
          '2024-01-20': 25,
          '2024-01-19': 30,
          '2024-01-18': 28
        },
        performance: {
          averageExecutionTime: 45.5,
          minExecutionTime: 12.3,
          maxExecutionTime: 120.8,
          p95ExecutionTime: 85.2,
          p99ExecutionTime: 110.5,
          throughput: 25.5,
          errorRate: 3.6
        }
      },
      createdAt: new Date('2023-06-15T00:00:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      createdBy: 'john.doe',
      updatedBy: 'john.doe',
      publishedAt: new Date('2024-01-15T10:30:00'),
      publishedBy: 'john.doe',
      tags: ['customer', 'onboarding', 'automation']
    },
    {
      id: '2',
      name: 'Invoice Processing Automation',
      description: 'Automated invoice processing including validation, approval routing, and payment scheduling',
      category: 'AUTOMATION',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      version: '1.5.2',
      trigger: {
        id: 'trigger-2',
        type: 'EVENT',
        config: {
          eventType: 'invoice.uploaded'
        },
        enabled: true,
        description: 'Triggered when invoice is uploaded'
      },
      actions: [
        {
          id: 'action-3',
          type: 'VALIDATE_DATA',
          name: 'Validate Invoice Data',
          description: 'Validate invoice format and required fields',
          config: {
            validationRules: ['required_fields', 'format_check', 'duplicate_check']
          },
          order: 1,
          enabled: true,
          dependencies: [],
          errorHandling: {
            strategy: 'STOP',
            retryOnFailure: false,
            continueOnError: false,
            errorNotifications: []
          }
        }
      ],
      conditions: [],
      variables: [],
      settings: {
        concurrency: {
          maxConcurrent: 10,
          queueSize: 200,
          strategy: 'PARALLEL'
        },
        logging: {
          enabled: true,
          level: 'DEBUG',
          includePayloads: true,
          retentionDays: 90,
          destinations: ['DATABASE', 'FILE']
        },
        security: {
          encryption: true,
          authentication: {
            required: true,
            method: 'OAUTH'
          },
          authorization: {
            required: true,
            roles: ['finance', 'admin'],
            permissions: ['execute']
          },
          audit: true
        },
        notifications: {
          onSuccess: [],
          onFailure: [
            {
              type: 'EMAIL',
              recipients: ['finance@company.com'],
              enabled: true
            }
          ],
          onTimeout: []
        }
      },
      metadata: {
        version: '1.5.2',
        environment: 'production',
        category: 'AUTOMATION',
        tags: ['invoice', 'finance', 'automation'],
        changelog: [],
        dependencies: []
      },
      statistics: {
        totalRuns: 3200,
        successfulRuns: 3050,
        failedRuns: 120,
        averageRunTime: 32.8,
        lastRun: new Date('2024-01-20T13:15:00'),
        lastRunStatus: 'COMPLETED',
        successRate: 95.3,
        errorRate: 3.8,
        runsByStatus: {
          'PENDING': 8,
          'RUNNING': 3,
          'COMPLETED': 3050,
          'FAILED': 120,
          'CANCELLED': 12,
          'TIMEOUT': 7
        },
        runsByDate: {
          '2024-01-20': 45,
          '2024-01-19': 52,
          '2024-01-18': 48
        },
        performance: {
          averageExecutionTime: 32.8,
          minExecutionTime: 8.5,
          maxExecutionTime: 95.2,
          p95ExecutionTime: 65.8,
          p99ExecutionTime: 85.3,
          throughput: 45.2,
          errorRate: 3.8
        }
      },
      createdAt: new Date('2023-08-20T00:00:00'),
      updatedAt: new Date('2024-01-10T15:45:00'),
      createdBy: 'sarah.finance',
      updatedBy: 'sarah.finance',
      publishedAt: new Date('2024-01-10T15:45:00'),
      publishedBy: 'sarah.finance',
      tags: ['invoice', 'finance', 'automation']
    },
    {
      id: '3',
      name: 'Daily Sales Report',
      description: 'Generate and distribute daily sales reports to stakeholders',
      category: 'REPORTING',
      status: 'PAUSED',
      priority: 'LOW',
      version: '1.2.0',
      trigger: {
        id: 'trigger-3',
        type: 'SCHEDULE',
        config: {
          schedule: '0 8 * * *'
        },
        enabled: false,
        description: 'Runs daily at 8:00 AM'
      },
      actions: [
        {
          id: 'action-4',
          type: 'DATABASE_QUERY',
          name: 'Fetch Sales Data',
          description: 'Query sales data from database',
          config: {
            query: 'SELECT * FROM sales WHERE date = CURRENT_DATE',
            parameters: {}
          },
          order: 1,
          enabled: true,
          dependencies: [],
          errorHandling: {
            strategy: 'RETRY',
            retryOnFailure: true,
            continueOnError: false,
            errorNotifications: []
          }
        }
      ],
      conditions: [],
      variables: [],
      settings: {
        concurrency: {
          maxConcurrent: 1,
          queueSize: 10,
          strategy: 'SEQUENTIAL'
        },
        logging: {
          enabled: true,
          level: 'INFO',
          includePayloads: false,
          retentionDays: 60,
          destinations: ['DATABASE']
        },
        security: {
          encryption: false,
          authentication: {
            required: false,
            method: 'API_KEY'
          },
          authorization: {
            required: true,
            roles: ['sales', 'management'],
            permissions: ['execute']
          },
          audit: false
        },
        notifications: {
          onSuccess: [
            {
              type: 'EMAIL',
              recipients: ['sales@company.com'],
              enabled: true
            }
          ],
          onFailure: [],
          onTimeout: []
        }
      },
      metadata: {
        version: '1.2.0',
        environment: 'production',
        category: 'REPORTING',
        tags: ['sales', 'reporting', 'daily'],
        changelog: [],
        dependencies: []
      },
      statistics: {
        totalRuns: 180,
        successfulRuns: 165,
        failedRuns: 10,
        averageRunTime: 120.5,
        lastRun: new Date('2024-01-19T08:00:00'),
        lastRunStatus: 'COMPLETED',
        successRate: 91.7,
        errorRate: 5.6,
        runsByStatus: {
          'PENDING': 0,
          'RUNNING': 0,
          'COMPLETED': 165,
          'FAILED': 10,
          'CANCELLED': 5,
          'TIMEOUT': 0
        },
        runsByDate: {
          '2024-01-19': 1,
          '2024-01-18': 1,
          '2024-01-17': 1
        },
        performance: {
          averageExecutionTime: 120.5,
          minExecutionTime: 95.3,
          maxExecutionTime: 180.2,
          p95ExecutionTime: 165.8,
          p99ExecutionTime: 175.5,
          throughput: 0.04,
          errorRate: 5.6
        }
      },
      createdAt: new Date('2023-10-05T00:00:00'),
      updatedAt: new Date('2024-01-05T09:20:00'),
      createdBy: 'mike.sales',
      updatedBy: 'mike.sales',
      publishedAt: new Date('2024-01-05T09:20:00'),
      publishedBy: 'mike.sales',
      tags: ['sales', 'reporting', 'daily']
    }
  ]);

  const [executions, setExecutions] = useState<WorkflowExecution[]>([
    {
      id: 'exec-1',
      workflowId: '1',
      workflowName: 'Customer Onboarding Process',
      workflowVersion: '2.1.0',
      status: 'COMPLETED',
      triggeredBy: 'system',
      triggeredAt: new Date('2024-01-20T14:30:00'),
      startedAt: new Date('2024-01-20T14:30:05'),
      completedAt: new Date('2024-01-20T14:30:48'),
      duration: 43.2,
      input: {
        customerId: 'cust-123',
        customerEmail: 'newcustomer@example.com',
        customerName: 'John Doe'
      },
      output: {
        emailSent: true,
        tasksCreated: 3,
        trainingScheduled: true
      },
      steps: [
        {
          id: 'step-1',
          actionId: 'action-1',
          actionName: 'Send Welcome Email',
          status: 'COMPLETED',
          startedAt: new Date('2024-01-20T14:30:05'),
          completedAt: new Date('2024-01-20T14:30:25'),
          duration: 20.1,
          input: {
            template: 'welcome-email-template',
            recipients: ['newcustomer@example.com']
          },
          output: {
            emailId: 'email-456',
            delivered: true
          },
          retries: 0,
          logs: []
        },
        {
          id: 'step-2',
          actionId: 'action-2',
          actionName: 'Create Onboarding Tasks',
          status: 'COMPLETED',
          startedAt: new Date('2024-01-20T14:30:26'),
          completedAt: new Date('2024-01-20T14:30:47'),
          duration: 21.3,
          input: {
            template: 'onboarding-task-template',
            assignee: 'account.manager@company.com'
          },
          output: {
            tasksCreated: 3,
            taskIds: ['task-789', 'task-790', 'task-791']
          },
          retries: 0,
          logs: []
        }
      ],
      variables: {
        customerEmail: 'newcustomer@example.com',
        customerName: 'John Doe'
      },
      logs: [
        {
          id: 'log-1',
          level: 'INFO',
          message: 'Workflow execution started',
          timestamp: new Date('2024-01-20T14:30:00'),
          source: 'workflow-engine'
        }
      ],
      metadata: {
        environment: 'production',
        version: '2.1.0',
        instanceId: 'instance-123',
        correlationId: 'corr-456',
        userId: 'system',
        sessionId: 'session-789'
      }
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [executionDialog, setExecutionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<WorkflowCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | 'ALL'>('ALL');

  const handleExecuteWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Workflow execution started successfully');
    } catch (error) {
      toast.error('Failed to start workflow execution');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkflows(workflows.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'PAUSED' as const }
          : w
      ));
      toast.success('Workflow paused successfully');
    } catch (error) {
      toast.error('Failed to pause workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkflows(workflows.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'ACTIVE' as const }
          : w
      ));
      toast.success('Workflow resumed successfully');
    } catch (error) {
      toast.error('Failed to resume workflow');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'ACTIVE': return <Play className="h-4 w-4 text-green-600" />;
      case 'PAUSED': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'DRAFT': return <FileText className="h-4 w-4 text-gray-600" />;
      case 'FAILED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'CANCELLED': return <Square className="h-4 w-4 text-orange-600" />;
      case 'ARCHIVED': return <Database className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: WorkflowCategory) => {
    switch (category) {
      case 'AUTOMATION': return <Zap className="h-4 w-4 text-blue-600" />;
      case 'APPROVAL': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'NOTIFICATION': return <Mail className="h-4 w-4 text-purple-600" />;
      case 'DATA_SYNC': return <Database className="h-4 w-4 text-orange-600" />;
      case 'INTEGRATION': return <Globe className="h-4 w-4 text-cyan-600" />;
      case 'REPORTING': return <BarChart3 className="h-4 w-4 text-indigo-600" />;
      default: return <GitBranch className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRunStatusColor = (status: RunStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-orange-100 text-orange-800';
      case 'TIMEOUT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'ALL' || workflow.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || workflow.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeWorkflows = workflows.filter(w => w.status === 'ACTIVE');
  const totalExecutions = workflows.reduce((sum, w) => sum + w.statistics.totalRuns, 0);
  const averageSuccessRate = workflows.reduce((sum, w) => sum + w.statistics.successRate, 0) / workflows.length;
  const recentExecutions = executions.filter(e => 
    e.triggeredAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
          <p className="text-gray-600">Monitor and manage automated workflows and processes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.length}</p>
                <p className="text-sm text-gray-600">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeWorkflows.length}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExecutions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageSuccessRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Success Rate</p>
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
                placeholder="Search workflows by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <option value="ALL">All Categories</option>
                <option value="AUTOMATION">Automation</option>
                <option value="APPROVAL">Approval</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="DATA_SYNC">Data Sync</option>
                <option value="INTEGRATION">Integration</option>
                <option value="REPORTING">Reporting</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="DRAFT">Draft</option>
                <option value="FAILED">Failed</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Overview Tabs */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No workflows found</p>
                <p className="text-sm">Create your first workflow to get started</p>
              </div>
            ) : (
              filteredWorkflows.map(workflow => (
                <Card key={workflow.id} className={
                  workflow.status === 'FAILED' ? 'border-red-200' : 
                  workflow.status === 'PAUSED' ? 'border-yellow-200' : ''
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          workflow.status === 'ACTIVE' ? 'bg-green-100' : 
                          workflow.status === 'PAUSED' ? 'bg-yellow-100' : 
                          workflow.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(workflow.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(workflow.category)}
                              <span className="text-sm text-gray-600">{workflow.category}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              v{workflow.version}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{workflow.statistics.successRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{workflow.statistics.totalRuns}</p>
                        <p className="text-sm text-gray-600">Total Runs</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{workflow.statistics.averageRunTime.toFixed(1)}s</p>
                        <p className="text-sm text-gray-600">Avg Runtime</p>
                      </div>
                    </div>

                    {/* Trigger Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Trigger: {workflow.trigger.type} - {workflow.trigger.description}
                        </span>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>
                        Last run: {workflow.statistics.lastRun 
                          ? formatDistanceToNow(workflow.statistics.lastRun, { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                      <span>
                        Created by {workflow.createdBy}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {workflow.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseWorkflow(workflow.id)}
                          disabled={loading}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {workflow.status === 'PAUSED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResumeWorkflow(workflow.id)}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        disabled={loading || workflow.status !== 'ACTIVE'}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Execute
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No recent executions</p>
                  <p className="text-sm">Workflow executions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              executions.map(execution => (
                <Card key={execution.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          execution.status === 'COMPLETED' ? 'bg-green-100' : 
                          execution.status === 'FAILED' ? 'bg-red-100' : 
                          execution.status === 'RUNNING' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(execution.status as any)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{execution.workflowName}</h3>
                          <p className="text-sm text-gray-600">Execution ID: {execution.id}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getRunStatusColor(execution.status)}>
                              {execution.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Duration: {execution.duration?.toFixed(2)}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Execution Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Triggered:</span>
                        <p className="text-sm font-medium">
                          {formatDistanceToNow(execution.triggeredAt, { addSuffix: true })}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Version:</span>
                        <p className="text-sm font-medium">{execution.workflowVersion}</p>
                      </div>
                    </div>

                    {/* Steps Summary */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <GitBranch className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Steps: {execution.steps.length}</span>
                      </div>
                      <div className="space-y-1">
                        {execution.steps.slice(0, 3).map(step => (
                          <div key={step.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <span>{step.actionName}</span>
                            <Badge className={getRunStatusColor(step.status)} variant="outline">
                              {step.status}
                            </Badge>
                          </div>
                        ))}
                        {execution.steps.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{execution.steps.length - 3} more steps
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflows.find(w => w.id === execution.workflowId) || null);
                          setExecutionDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {execution.status === 'FAILED' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Top Performing Workflows</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows
                    .sort((a, b) => b.statistics.successRate - a.statistics.successRate)
                    .slice(0, 5)
                    .map(workflow => (
                      <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">{workflow.statistics.totalRuns} runs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {workflow.statistics.successRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {workflow.statistics.averageRunTime.toFixed(1)}s avg
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Workflows Needing Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows
                    .filter(w => w.statistics.successRate < 90)
                    .sort((a, b) => a.statistics.successRate - b.statistics.successRate)
                    .slice(0, 5)
                    .map(workflow => (
                      <div key={workflow.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-red-800">{workflow.name}</h4>
                          <p className="text-sm text-red-600">{workflow.statistics.failedRuns} failed runs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {workflow.statistics.successRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-red-500">
                            {workflow.statistics.errorRate.toFixed(1)}% error rate
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workflow Engine</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Queue Processing</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Services</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Slow</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Queue Depth</span>
                      <span className="text-sm">23</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">API Response Time</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      Average response time increased by 25%
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Workflow Failure</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Invoice Processing failed 3 times
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow Details</DialogTitle>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Workflow Name</Label>
                  <p className="font-medium">{selectedWorkflow.name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="font-medium">{selectedWorkflow.category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status}
                  </Badge>
                </div>
                <div>
                  <Label>Version</Label>
                  <p className="font-medium">{selectedWorkflow.version}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
              </div>

              <div>
                <Label>Actions ({selectedWorkflow.actions.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedWorkflow.actions.map(action => (
                    <div key={action.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{action.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {action.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Workflow
                </Button>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
                <Button onClick={() => handleExecuteWorkflow(selectedWorkflow.id)} disabled={loading}>
                  <Play className="h-4 w-4 mr-1" />
                  Execute
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Execution Details Dialog */}
      <Dialog open={executionDialog} onOpenChange={setExecutionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
          </DialogHeader>
          {selectedWorkflow && executions.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Workflow</Label>
                  <p className="font-medium">{selectedWorkflow.name}</p>
                </div>
                <div>
                  <Label>Execution ID</Label>
                  <p className="font-medium">{executions[0].id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getRunStatusColor(executions[0].status)}>
                    {executions[0].status}
                  </Badge>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="font-medium">{executions[0].duration?.toFixed(2)}s</p>
                </div>
              </div>

              <div>
                <Label>Execution Steps</Label>
                <div className="mt-2 space-y-3">
                  {executions[0].steps.map(step => (
                    <div key={step.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{step.actionName}</span>
                        <Badge className={getRunStatusColor(step.status)} variant="outline">
                          {step.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Started:</span>
                          <p className="font-medium">{step.startedAt.toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{step.duration?.toFixed(2)}s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Logs
                </Button>
                {executions[0].status === 'FAILED' && (
                  <Button variant="outline">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry Execution
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowDashboardPage;
