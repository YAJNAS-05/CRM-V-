import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Eye,
  Download,
  Target,
  Gauge,
  Cpu,
  Database,
  Globe,
  Server,
  HardDrive,
  MemoryStick,
  Network,
  BarChart3,
  LineChart,
  ArrowUp,
  ArrowDown,
  Info,
  Timer,
  Wrench,
  Shield,
  Activity,
  Code,
  FileText,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'resource' | 'cache' | 'database' | 'network';
  type: 'automatic' | 'manual' | 'scheduled';
  status: 'active' | 'inactive' | 'paused' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  conditions: OptimizationCondition[];
  actions: OptimizationAction[];
  schedule?: OptimizationSchedule;
  results: OptimizationResults;
  configuration: RuleConfiguration;
}

interface OptimizationCondition {
  id: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number;
}

interface OptimizationAction {
  id: string;
  type: 'scale' | 'restart' | 'clear_cache' | 'optimize_query' | 'adjust_config';
  parameters: Record<string, any>;
  order: number;
}

interface OptimizationSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  nextRun: string;
  lastRun?: string;
}

interface OptimizationResults {
  lastExecution?: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  avgImprovement: number;
  lastImprovement?: number;
  executionTime: number;
}

interface RuleConfiguration {
  enabled: boolean;
  dryRun: boolean;
  maxExecutions: number;
  cooldownPeriod: number;
  notifications: boolean;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  currentPerformance: number;
  expectedImprovement: number;
  implementation: ImplementationStep[];
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface ImplementationStep {
  id: string;
  description: string;
  type: 'configuration' | 'code' | 'infrastructure' | 'process';
  estimatedTime: number;
  completed: boolean;
  completedAt?: string;
}

interface PerformanceBenchmark {
  id: string;
  name: string;
  description: string;
  category: string;
  baseline: BenchmarkMetrics;
  current: BenchmarkMetrics;
  target: BenchmarkMetrics;
  improvement: number;
  status: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  history: BenchmarkHistory[];
}

interface BenchmarkMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
  userSatisfaction: number;
}

interface BenchmarkHistory {
  timestamp: string;
  metrics: BenchmarkMetrics;
}

const PerformanceOptimizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [loading, setLoading] = useState(false);

  // Load optimization rules from API on component mount
  useEffect(() => {
    const loadOptimizationRules = async () => {
      setLoading(true);
      try {
        const rulesData = await performanceApi.getOptimizationRules();
        if (rulesData) {
          setOptimizationRules(rulesData);
        }
      } catch (error) {
        console.error('Failed to load optimization rules:', error);
        toast.error('Failed to load optimization rules');
      } finally {
        setLoading(false);
      }
    };
    loadOptimizationRules();
  }, []);
      status: 'active',
      priority: 'medium',
      impact: 'medium',
      conditions: [
        { id: 'cond-2', metric: 'query_time', operator: 'greater_than', threshold: 1000, duration: 60 }
      ],
      actions: [
        { id: 'action-2', type: 'optimize_query', parameters: { analyze: true, suggest_indexes: true }, order: 1 }
      ],
      schedule: {
        frequency: 'daily',
        timezone: 'UTC',
        nextRun: '2024-01-16 02:00:00',
        lastRun: '2024-01-15 02:00:00'
      },
      results: {
        lastExecution: '2024-01-15 02:00:00',
        totalExecutions: 30,
        successCount: 28,
        failureCount: 2,
        avgImprovement: 15.8,
        lastImprovement: 12.4,
        executionTime: 120
      },
      configuration: {
        enabled: true,
        dryRun: false,
        maxExecutions: 5,
        cooldownPeriod: 3600,
        notifications: true
      }
    },
    {
      id: 'rule-3',
      name: 'Cache Management',
      description: 'Clear cache when memory usage exceeds threshold',
      category: 'cache',
      type: 'automatic',
      status: 'paused',
      priority: 'medium',
      impact: 'medium',
      conditions: [
        { id: 'cond-3', metric: 'memory_usage', operator: 'greater_than', threshold: 85, duration: 180 }
      ],
      actions: [
        { id: 'action-3', type: 'clear_cache', parameters: { type: 'all', force: false }, order: 1 }
      ],
      results: {
        totalExecutions: 45,
        successCount: 44,
        failureCount: 1,
        avgImprovement: 12.5,
        executionTime: 15
      },
      configuration: {
        enabled: false,
        dryRun: false,
        maxExecutions: 20,
        cooldownPeriod: 600,
        notifications: false
      }
    }
  ];

  const optimizationRecommendations: OptimizationRecommendation[] = [
    {
      id: 'rec-1',
      title: 'Implement Redis Caching Layer',
      description: 'Add Redis caching to reduce database load and improve response times',
      category: 'cache',
      impact: 'high',
      effort: 'medium',
      confidence: 92,
      currentPerformance: 245,
      expectedImprovement: 35,
      implementation: [
        { id: 'step-1', description: 'Install and configure Redis server', type: 'infrastructure', estimatedTime: 60, completed: false },
        { id: 'step-2', description: 'Update application to use Redis cache', type: 'code', estimatedTime: 180, completed: false },
        { id: 'step-3', description: 'Configure cache invalidation strategy', type: 'configuration', estimatedTime: 30, completed: false }
      ],
      status: 'pending',
      createdAt: '2024-01-15 10:00:00'
    },
    {
      id: 'rec-2',
      title: 'Optimize Database Indexes',
      description: 'Add missing indexes to improve query performance',
      category: 'database',
      impact: 'medium',
      effort: 'low',
      confidence: 88,
      currentPerformance: 1250,
      expectedImprovement: 25,
      implementation: [
        { id: 'step-4', description: 'Analyze slow query logs', type: 'configuration', estimatedTime: 30, completed: true, completedAt: '2024-01-15 11:00:00' },
        { id: 'step-5', description: 'Create missing indexes', type: 'code', estimatedTime: 45, completed: false }
      ],
      status: 'in_progress',
      createdAt: '2024-01-14 14:00:00',
      reviewedBy: 'DBA Team',
      reviewedAt: '2024-01-15 09:00:00'
    },
    {
      id: 'rec-3',
      title: 'Enable Gzip Compression',
      description: 'Enable gzip compression to reduce bandwidth usage',
      category: 'network',
      impact: 'low',
      effort: 'low',
      confidence: 95,
      currentPerformance: 850,
      expectedImprovement: 15,
      implementation: [
        { id: 'step-6', description: 'Configure gzip in web server', type: 'configuration', estimatedTime: 15, completed: false }
      ],
      status: 'pending',
      createdAt: '2024-01-15 12:00:00'
    }
  ];

  const performanceBenchmarks: PerformanceBenchmark[] = [
    {
      id: 'bench-1',
      name: 'API Response Time',
      description: 'Average API response time benchmark',
      category: 'application',
      baseline: {
        responseTime: 350,
        throughput: 1200,
        errorRate: 2.5,
        resourceUtilization: 65,
        userSatisfaction: 85
      },
      current: {
        responseTime: 245,
        throughput: 1450,
        errorRate: 0.8,
        resourceUtilization: 72,
        userSatisfaction: 92
      },
      target: {
        responseTime: 200,
        throughput: 1600,
        errorRate: 0.5,
        resourceUtilization: 75,
        userSatisfaction: 95
      },
      improvement: 30,
      status: 'improving',
      lastUpdated: '2024-01-15 15:30:00',
      history: [
        { timestamp: '2024-01-15 15:30:00', metrics: { responseTime: 245, throughput: 1450, errorRate: 0.8, resourceUtilization: 72, userSatisfaction: 92 } },
        { timestamp: '2024-01-15 14:30:00', metrics: { responseTime: 268, throughput: 1380, errorRate: 1.2, resourceUtilization: 70, userSatisfaction: 90 } },
        { timestamp: '2024-01-15 13:30:00', metrics: { responseTime: 289, throughput: 1320, errorRate: 1.5, resourceUtilization: 68, userSatisfaction: 88 } }
      ]
    },
    {
      id: 'bench-2',
      name: 'Database Performance',
      description: 'Database query performance benchmark',
      category: 'database',
      baseline: {
        responseTime: 1250,
        throughput: 800,
        errorRate: 1.8,
        resourceUtilization: 78,
        userSatisfaction: 80
      },
      current: {
        responseTime: 890,
        throughput: 950,
        errorRate: 0.6,
        resourceUtilization: 82,
        userSatisfaction: 88
      },
      target: {
        responseTime: 600,
        throughput: 1100,
        errorRate: 0.3,
        resourceUtilization: 85,
        userSatisfaction: 92
      },
      improvement: 28.8,
      status: 'improving',
      lastUpdated: '2024-01-15 15:30:00',
      history: [
        { timestamp: '2024-01-15 15:30:00', metrics: { responseTime: 890, throughput: 950, errorRate: 0.6, resourceUtilization: 82, userSatisfaction: 88 } },
        { timestamp: '2024-01-15 14:30:00', metrics: { responseTime: 945, throughput: 920, errorRate: 0.8, resourceUtilization: 80, userSatisfaction: 86 } }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'improving':
      case 'implemented':
        return 'text-green-600 bg-green-50';
      case 'inactive':
      case 'stable':
      case 'pending':
        return 'text-gray-600 bg-gray-50';
      case 'paused':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'declining':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'text-blue-600 bg-blue-50';
      case 'resource':
        return 'text-purple-600 bg-purple-50';
      case 'cache':
        return 'text-green-600 bg-green-50';
      case 'database':
        return 'text-orange-600 bg-orange-50';
      case 'network':
        return 'text-pink-600 bg-pink-50';
      case 'application':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const filteredRules = optimizationRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedRuleData = optimizationRules.find(r => r.id === selectedRule);

  const totalRules = optimizationRules.length;
  const activeRules = optimizationRules.filter(r => r.status === 'active').length;
  const avgImprovement = optimizationRules.reduce((acc, r) => acc + (r.results.avgImprovement || 0), 0) / optimizationRules.length;
  const pendingRecommendations = optimizationRecommendations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Optimization</h1>
          <p className="text-muted-foreground">
            Automated optimization rules and performance recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Optimization Rule
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              of {totalRules} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgImprovement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              performance gain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Recommendations</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              awaiting implementation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              rule execution success
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Optimization Rules</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Optimization Rules</h3>
              <p className="text-sm text-muted-foreground">
                Manage automated performance optimization rules
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rules..."
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
                <option value="performance">Performance</option>
                <option value="resource">Resource</option>
                <option value="cache">Cache</option>
                <option value="database">Database</option>
                <option value="network">Network</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rules List */}
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <Card 
                  key={rule.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRule === rule.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedRule(rule.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(rule.status)}`}>
                          {rule.status === 'active' ? <Zap className="w-4 h-4" /> :
                           rule.status === 'paused' ? <Pause className="w-4 h-4" /> :
                           rule.status === 'error' ? <XCircle className="w-4 h-4" /> :
                           <Settings className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(rule.category)}>
                          {rule.category}
                        </Badge>
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="capitalize">{rule.type}</Badge>
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority}
                      </Badge>
                      <span className="text-muted-foreground">Impact:</span>
                      <Badge className={getPriorityColor(rule.impact)}>
                        {rule.impact}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Executions:</span>
                        <p className="font-medium">{rule.results.totalExecutions}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">
                          {rule.results.totalExecutions > 0 
                            ? Math.round((rule.results.successCount / rule.results.totalExecutions) * 100) 
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Improvement:</span>
                        <p className="font-medium">{rule.results.avgImprovement.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{rule.results.lastExecution || 'Never'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {rule.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          {rule.status === 'inactive' ? 'Enable' : 'Resume'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rule Details */}
            <div>
              {selectedRuleData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedRuleData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedRule(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedRuleData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Rule Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedRuleData.category)}>
                              {selectedRuleData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">{selectedRuleData.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <Badge className={getPriorityColor(selectedRuleData.priority)}>
                              {selectedRuleData.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Impact:</span>
                            <Badge className={getPriorityColor(selectedRuleData.impact)}>
                              {selectedRuleData.impact}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Execution Results</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Executions:</span>
                            <span className="font-medium">{selectedRuleData.results.totalExecutions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Count:</span>
                            <span className="font-medium">{selectedRuleData.results.successCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Failure Count:</span>
                            <span className="font-medium">{selectedRuleData.results.failureCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Improvement:</span>
                            <span className="font-medium">{selectedRuleData.results.avgImprovement.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Conditions</h4>
                      <div className="space-y-2">
                        {selectedRuleData.conditions.map((condition) => (
                          <div key={condition.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{condition.metric}</div>
                              <div className="text-xs text-muted-foreground">
                                {condition.operator} {condition.threshold} for {condition.duration}s
                              </div>
                            </div>
                            <Badge variant="outline">Trigger</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        {selectedRuleData.actions.map((action) => (
                          <div key={action.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm capitalize">{action.type.replace('_', ' ')}</div>
                              <div className="text-xs text-muted-foreground">
                                Order: {action.order}
                              </div>
                            </div>
                            <Badge variant="outline">Step {action.order}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedRuleData.schedule && (
                      <div>
                        <h4 className="font-medium mb-2">Schedule</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <span className="ml-2 font-medium capitalize">{selectedRuleData.schedule.frequency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Timezone:</span>
                              <span className="ml-2 font-medium">{selectedRuleData.schedule.timezone}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Next Run:</span>
                              <span className="ml-2 font-medium">{selectedRuleData.schedule.nextRun}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Run:</span>
                              <span className="ml-2 font-medium">{selectedRuleData.schedule.lastRun || 'Never'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Test Rule
                      </Button>
                      <Button size="sm" variant="outline">
                        <Wrench className="w-4 h-4 mr-2" />
                        Edit Rule
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an optimization rule to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Optimization Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered performance improvement recommendations
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Recommendations
            </Button>
          </div>

          <div className="space-y-4">
            {optimizationRecommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(recommendation.status)}`}>
                        {recommendation.status === 'pending' ? <Target className="w-4 h-4" /> :
                         recommendation.status === 'in_progress' ? <Activity className="w-4 h-4" /> :
                         recommendation.status === 'implemented' ? <CheckCircle className="w-4 h-4" /> :
                         <XCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{recommendation.title}</div>
                        <div className="text-sm text-muted-foreground">{recommendation.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(recommendation.category)}>
                        {recommendation.category}
                      </Badge>
                      <Badge className={getStatusColor(recommendation.status)}>
                        {recommendation.status}
                      </Badge>
                      <Badge className={getPriorityColor(recommendation.impact)}>
                        {recommendation.impact} impact
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-medium">{recommendation.confidence}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <p className="font-medium">{recommendation.currentPerformance}ms</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected:</span>
                      <p className="font-medium text-green-600">{(recommendation.currentPerformance * (1 - recommendation.expectedImprovement / 100)).toFixed(0)}ms</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Improvement:</span>
                      <p className="font-medium text-green-600">-{recommendation.expectedImprovement}%</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Implementation Steps</h5>
                    <div className="space-y-1">
                      {recommendation.implementation.map((step) => (
                        <div key={step.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              step.completed ? 'bg-green-600' : 'bg-gray-400'
                            }`} />
                            <span>{step.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {step.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {step.estimatedTime}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {recommendation.status === 'pending' && (
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Start Implementation
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Benchmarks</h3>
              <p className="text-sm text-muted-foreground">
                Track performance improvements against benchmarks
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Benchmark
            </Button>
          </div>

          <div className="space-y-4">
            {performanceBenchmarks.map((benchmark) => (
              <Card key={benchmark.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{benchmark.name}</div>
                      <div className="text-sm text-muted-foreground">{benchmark.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(benchmark.category)}>
                        {benchmark.category}
                      </Badge>
                      <Badge className={getStatusColor(benchmark.status)}>
                        {benchmark.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Response Time</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{benchmark.current.responseTime}ms</span>
                        <ArrowDown className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">-{benchmark.improvement}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Throughput</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{benchmark.current.throughput}</span>
                        <ArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">+{Math.round((benchmark.current.throughput / benchmark.baseline.throughput - 1) * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Error Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{benchmark.current.errorRate}%</span>
                        <ArrowDown className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">-{Math.round((1 - benchmark.current.errorRate / benchmark.baseline.errorRate) * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resource Usage</span>
                      <div className="font-medium">{benchmark.current.resourceUtilization}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User Satisfaction</span>
                      <div className="font-medium">{benchmark.current.userSatisfaction}%</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to Target</span>
                      <span>{Math.round((benchmark.improvement / ((benchmark.baseline.responseTime - benchmark.target.responseTime) / benchmark.baseline.responseTime * 100)) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(benchmark.improvement / ((benchmark.baseline.responseTime - benchmark.target.responseTime) / benchmark.baseline.responseTime * 100)) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <LineChart className="w-4 h-4 mr-2" />
                      View Trends
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Adjust Target
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
              <h3 className="text-lg font-medium">Execution History</h3>
              <p className="text-sm text-muted-foreground">
                Historical execution data for optimization rules
              </p>
            </div>
            <Button variant="outline">
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
                      <th className="text-left p-4 font-medium">Rule Name</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Execution Time</th>
                      <th className="text-left p-4 font-medium">Improvement</th>
                      <th className="text-left p-4 font-medium">Duration</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizationRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">{rule.description}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={getCategoryColor(rule.category)}>
                            {rule.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{rule.results.lastExecution || 'Never'}</td>
                        <td className="p-4 text-sm">
                          {rule.results.lastImprovement ? `${rule.results.lastImprovement.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="p-4 text-sm">{rule.results.executionTime}s</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
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

export default PerformanceOptimizationPage;
