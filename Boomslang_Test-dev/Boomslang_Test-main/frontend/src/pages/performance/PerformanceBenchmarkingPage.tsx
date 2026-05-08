import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  LineChart,
  PieChart,
  Activity,
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
  Settings,
  Calendar,
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
  FileText,
  Trophy,
  Medal,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'load' | 'stress' | 'endurance' | 'scalability';
  status: 'active' | 'inactive' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  nextRun?: string;
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
  tests: BenchmarkTest[];
  results: BenchmarkResults;
  configuration: BenchmarkConfiguration;
}

interface BenchmarkTest {
  id: string;
  name: string;
  description: string;
  type: 'response_time' | 'throughput' | 'concurrency' | 'memory' | 'cpu' | 'network';
  parameters: TestParameters;
  baseline: number;
  target: number;
  unit: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: number;
  deviation?: number;
}

interface TestParameters {
  duration: number;
  concurrency: number;
  rampUp: number;
  thinkTime: number;
  dataSize: number;
  iterations: number;
}

interface BenchmarkResults {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  passed: number;
  failed: number;
  total: number;
  executionTime: number;
  timestamp: string;
  metrics: BenchmarkMetric[];
}

interface BenchmarkMetric {
  name: string;
  value: number;
  baseline: number;
  target: number;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
  improvement: number;
}

interface BenchmarkConfiguration {
  environment: 'development' | 'staging' | 'production';
  endpoints: string[];
  authentication: boolean;
  dataVolume: string;
  monitoring: boolean;
  alerts: boolean;
}

interface BenchmarkHistory {
  id: string;
  suiteId: string;
  suiteName: string;
  timestamp: string;
  score: number;
  grade: string;
  duration: number;
  passed: number;
  failed: number;
  trends: HistoryTrend[];
}

interface HistoryTrend {
  metric: string;
  value: number;
  previous: number;
  change: number;
}

interface BenchmarkComparison {
  id: string;
  name: string;
  description: string;
  suites: ComparisonSuite[];
  metrics: ComparisonMetric[];
  insights: string[];
  recommendations: string[];
}

interface ComparisonSuite {
  suiteId: string;
  suiteName: string;
  score: number;
  grade: string;
  timestamp: string;
}

interface ComparisonMetric {
  name: string;
  values: number[];
  average: number;
  best: number;
  worst: number;
  improvement: number;
}

const PerformanceBenchmarkingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('suites');
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [benchmarkSuites, setBenchmarkSuites] = useState<BenchmarkSuite[]>([]);
  const [loading, setLoading] = useState(false);

  // Load benchmark suites from API on component mount
  useEffect(() => {
    const loadBenchmarkSuites = async () => {
      setLoading(true);
      try {
        const suitesData = await performanceApi.getBenchmarkSuites();
        if (suitesData) {
          setBenchmarkSuites(suitesData);
            concurrency: 50,
            rampUp: 60,
            thinkTime: 500,
            dataSize: 2048,
            iterations: 5000
          },
          baseline: 100,
          target: 150,
          unit: 'req/s',
          status: 'completed',
          result: 168,
          deviation: 68
        },
        {
          id: 'test-3',
          name: 'Concurrent User Load',
          description: 'Test system under concurrent user load',
          type: 'concurrency',
          parameters: {
            duration: 900,
            concurrency: 500,
            rampUp: 120,
            thinkTime: 2000,
            dataSize: 4096,
            iterations: 10000
          },
          baseline: 200,
          target: 500,
          unit: 'users',
          status: 'completed',
          result: 520,
          deviation: 160
        }
      ],
      results: {
        overallScore: 92,
        grade: 'A',
        passed: 3,
        failed: 0,
        total: 3,
        executionTime: 1800,
        timestamp: '2024-01-15 14:30:00',
        metrics: [
          { name: 'Response Time', value: 245, baseline: 500, target: 300, unit: 'ms', status: 'pass', improvement: 51 },
          { name: 'Throughput', value: 168, baseline: 100, target: 150, unit: 'req/s', status: 'pass', improvement: 68 },
          { name: 'Concurrency', value: 520, baseline: 200, target: 500, unit: 'users', status: 'pass', improvement: 160 }
        ]
      },
      configuration: {
        environment: 'staging',
        endpoints: ['/api/users', '/api/orders', '/api/products'],
        authentication: true,
        dataVolume: 'medium',
        monitoring: true,
        alerts: true
      }
    },
    {
      id: 'suite-2',
      name: 'Load Testing Suite',
      description: 'Heavy load testing for system capacity',
      category: 'load',
      status: 'running',
      lastRun: '2024-01-15 13:00:00',
      nextRun: '2024-01-15 16:00:00',
      frequency: 'hourly',
      tests: [
        {
          id: 'test-4',
          name: 'Peak Load Simulation',
          description: 'Simulate peak load conditions',
          type: 'throughput',
          parameters: {
            duration: 1800,
            concurrency: 1000,
            rampUp: 300,
            thinkTime: 100,
            dataSize: 8192,
            iterations: 50000
          },
          baseline: 500,
          target: 800,
          unit: 'req/s',
          status: 'running'
        },
        {
          id: 'test-5',
          name: 'Memory Stress Test',
          description: 'Test memory usage under stress',
          type: 'memory',
          parameters: {
            duration: 3600,
            concurrency: 200,
            rampUp: 600,
            thinkTime: 0,
            dataSize: 16384,
            iterations: 100000
          },
          baseline: 2048,
          target: 4096,
          unit: 'MB',
          status: 'pending'
        }
      ],
      results: {
        overallScore: 0,
        grade: 'F',
        passed: 0,
        failed: 0,
        total: 2,
        executionTime: 0,
        timestamp: '',
        metrics: []
      },
      configuration: {
        environment: 'production',
        endpoints: ['/api/*'],
        authentication: true,
        dataVolume: 'large',
        monitoring: true,
        alerts: true
      }
    },
    {
      id: 'suite-3',
      name: 'Database Performance Suite',
      description: 'Database-specific performance benchmarks',
      category: 'performance',
      status: 'inactive',
      frequency: 'weekly',
      tests: [
        {
          id: 'test-6',
          name: 'Query Performance',
          description: 'Test database query performance',
          type: 'response_time',
          parameters: {
            duration: 600,
            concurrency: 50,
            rampUp: 30,
            thinkTime: 100,
            dataSize: 512,
            iterations: 5000
          },
          baseline: 1000,
          target: 500,
          unit: 'ms',
          status: 'pending'
        }
      ],
      results: {
        overallScore: 0,
        grade: 'F',
        passed: 0,
        failed: 0,
        total: 1,
        executionTime: 0,
        timestamp: '',
        metrics: []
      },
      configuration: {
        environment: 'staging',
        endpoints: ['/api/db/*'],
        authentication: true,
        dataVolume: 'medium',
        monitoring: true,
        alerts: false
      }
    }
  ];

  const benchmarkHistory: BenchmarkHistory[] = [
    {
      id: 'history-1',
      suiteId: 'suite-1',
      suiteName: 'API Performance Suite',
      timestamp: '2024-01-15 14:30:00',
      score: 92,
      grade: 'A',
      duration: 1800,
      passed: 3,
      failed: 0,
      trends: [
        { metric: 'Response Time', value: 245, previous: 268, change: -8.6 },
        { metric: 'Throughput', value: 168, previous: 155, change: 8.4 },
        { metric: 'Concurrency', value: 520, previous: 480, change: 8.3 }
      ]
    },
    {
      id: 'history-2',
      suiteId: 'suite-1',
      suiteName: 'API Performance Suite',
      timestamp: '2024-01-14 14:30:00',
      score: 88,
      grade: 'B',
      duration: 1750,
      passed: 2,
      failed: 1,
      trends: [
        { metric: 'Response Time', value: 268, previous: 285, change: -6.0 },
        { metric: 'Throughput', value: 155, previous: 142, change: 9.2 },
        { metric: 'Concurrency', value: 480, previous: 450, change: 6.7 }
      ]
    },
    {
      id: 'history-3',
      suiteId: 'suite-1',
      suiteName: 'API Performance Suite',
      timestamp: '2024-01-13 14:30:00',
      score: 85,
      grade: 'B',
      duration: 1820,
      passed: 2,
      failed: 1,
      trends: [
        { metric: 'Response Time', value: 285, previous: 295, change: -3.4 },
        { metric: 'Throughput', value: 142, previous: 138, change: 2.9 },
        { metric: 'Concurrency', value: 450, previous: 435, change: 3.4 }
      ]
    }
  ];

  const benchmarkComparisons: BenchmarkComparison[] = [
    {
      id: 'comp-1',
      name: 'Environment Comparison',
      description: 'Compare performance across different environments',
      suites: [
        { suiteId: 'suite-1', suiteName: 'API Performance Suite', score: 92, grade: 'A', timestamp: '2024-01-15 14:30:00' },
        { suiteId: 'suite-2', suiteName: 'Load Testing Suite', score: 78, grade: 'B', timestamp: '2024-01-15 13:00:00' },
        { suiteId: 'suite-3', suiteName: 'Database Performance Suite', score: 85, grade: 'B', timestamp: '2024-01-14 10:00:00' }
      ],
      metrics: [
        { name: 'Response Time', values: [245, 320, 280], average: 282, best: 245, worst: 320, improvement: 12.5 },
        { name: 'Throughput', values: [168, 145, 155], average: 156, best: 168, worst: 145, improvement: 8.2 },
        { name: 'Concurrency', values: [520, 450, 480], average: 483, best: 520, worst: 450, improvement: 6.8 }
      ],
      insights: [
        'Staging environment shows best overall performance',
        'Production environment shows 15% slower response times',
        'Database performance is consistent across environments'
      ],
      recommendations: [
        'Optimize production environment configuration',
        'Investigate production database bottlenecks',
        'Consider scaling production resources'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'running':
      case 'pending':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'failed':
      case 'fail':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'text-blue-600 bg-blue-50';
      case 'load':
        return 'text-orange-600 bg-orange-50';
      case 'stress':
        return 'text-red-600 bg-red-50';
      case 'endurance':
        return 'text-purple-600 bg-purple-50';
      case 'scalability':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-50';
      case 'B':
        return 'text-blue-600 bg-blue-50';
      case 'C':
        return 'text-yellow-600 bg-yellow-50';
      case 'D':
        return 'text-orange-600 bg-orange-50';
      case 'F':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'B':
        return <Medal className="w-4 h-4 text-blue-600" />;
      case 'C':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'D':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'F':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredSuites = benchmarkSuites.filter(suite => {
    const matchesSearch = suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suite.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || suite.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || suite.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedSuiteData = benchmarkSuites.find(s => s.id === selectedSuite);

  const totalSuites = benchmarkSuites.length;
  const activeSuites = benchmarkSuites.filter(s => s.status === 'active' || s.status === 'running').length;
  const avgScore = benchmarkSuites.reduce((acc, s) => acc + (s.results.overallScore || 0), 0) / benchmarkSuites.filter(s => s.results.overallScore > 0).length;
  const runningTests = benchmarkSuites.reduce((acc, s) => acc + s.tests.filter(t => t.status === 'running').length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Benchmarking</h1>
          <p className="text-muted-foreground">
            Comprehensive performance testing and benchmarking suite
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Benchmark Suite
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suites</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuites}</div>
            <p className="text-xs text-muted-foreground">
              of {totalSuites} total suites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgScore.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              benchmark score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Tests</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{runningTests}</div>
            <p className="text-xs text-muted-foreground">
              tests in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Grade</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">A</div>
            <p className="text-xs text-muted-foreground">
              best performance grade
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="suites">Benchmark Suites</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Benchmark Suites</h3>
              <p className="text-sm text-muted-foreground">
                Manage and execute performance benchmark suites
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search suites..."
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
                <option value="load">Load</option>
                <option value="stress">Stress</option>
                <option value="endurance">Endurance</option>
                <option value="scalability">Scalability</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Suites List */}
            <div className="space-y-4">
              {filteredSuites.map((suite) => (
                <Card 
                  key={suite.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSuite === suite.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedSuite(suite.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(suite.status)}`}>
                          {suite.status === 'running' ? <Play className="w-4 h-4" /> :
                           suite.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                           suite.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           suite.status === 'inactive' ? <Pause className="w-4 h-4" /> :
                           <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{suite.name}</CardTitle>
                          <CardDescription>{suite.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(suite.category)}>
                          {suite.category}
                        </Badge>
                        <Badge className={getStatusColor(suite.status)}>
                          {suite.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <Badge variant="outline" className="capitalize">{suite.frequency}</Badge>
                      <span className="text-muted-foreground">Tests:</span>
                      <Badge variant="outline">{suite.tests.length}</Badge>
                    </div>

                    {suite.results.overallScore > 0 && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{suite.results.overallScore}</span>
                            {getGradeIcon(suite.results.grade)}
                            <Badge className={getGradeColor(suite.results.grade)}>
                              {suite.results.grade}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tests:</span>
                          <p className="font-medium">{suite.results.passed}/{suite.results.total} passed</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{suite.lastRun || 'Never'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Run:</span>
                        <p className="font-medium">{suite.nextRun || 'Manual'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {suite.status === 'running' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Run Suite
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

            {/* Suite Details */}
            <div>
              {selectedSuiteData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedSuiteData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedSuite(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedSuiteData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Suite Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedSuiteData.category)}>
                              {selectedSuiteData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedSuiteData.status)}>
                              {selectedSuiteData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Frequency:</span>
                            <span className="font-medium capitalize">{selectedSuiteData.frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment:</span>
                            <span className="font-medium">{selectedSuiteData.configuration.environment}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Test Results</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overall Score:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{selectedSuiteData.results.overallScore}</span>
                              {getGradeIcon(selectedSuiteData.results.grade)}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade:</span>
                            <Badge className={getGradeColor(selectedSuiteData.results.grade)}>
                              {selectedSuiteData.results.grade}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tests Passed:</span>
                            <span className="font-medium">{selectedSuiteData.results.passed}/{selectedSuiteData.results.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Execution Time:</span>
                            <span className="font-medium">{selectedSuiteData.results.executionTime}s</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tests</h4>
                      <div className="space-y-2">
                        {selectedSuiteData.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{test.name}</div>
                              <div className="text-xs text-muted-foreground">{test.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                              {test.result && (
                                <span className="text-sm font-medium">
                                  {test.result}{test.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedSuiteData.results.metrics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2">
                          {selectedSuiteData.results.metrics.map((metric) => (
                            <div key={metric.name} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium text-sm">{metric.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Target: {metric.target}{metric.unit} • Baseline: {metric.baseline}{metric.unit}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{metric.value}{metric.unit}</div>
                                <div className={`text-xs ${metric.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {metric.improvement > 0 ? '+' : ''}{metric.improvement}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Run Suite
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
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
                        Select a benchmark suite to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Execution History</h3>
              <p className="text-sm text-muted-foreground">
                Historical benchmark execution results
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
          </div>

          <div className="space-y-4">
            {benchmarkHistory.map((history) => (
              <Card key={history.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getGradeColor(history.grade)}`}>
                        {getGradeIcon(history.grade)}
                      </div>
                      <div>
                        <div className="font-medium">{history.suiteName}</div>
                        <div className="text-sm text-muted-foreground">{history.timestamp}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getGradeColor(history.grade)}>
                        Grade {history.grade}
                      </Badge>
                      <Badge variant="outline">
                        Score: {history.score}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{history.duration}s</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tests Passed:</span>
                      <p className="font-medium">{history.passed}/{history.failed + history.passed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <p className="font-medium">{Math.round((history.passed / (history.failed + history.passed)) * 100)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metrics:</span>
                      <p className="font-medium">{history.trends.length} trends</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Performance Trends</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {history.trends.map((trend) => (
                        <div key={trend.metric} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="font-medium">{trend.metric}</span>
                          <div className="flex items-center gap-1">
                            <span>{trend.value}</span>
                            {trend.change > 0 ? 
                              <ArrowUp className="w-3 h-3 text-green-600" /> :
                              <ArrowDown className="w-3 h-3 text-red-600" />
                            }
                            <span className={`text-xs ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Benchmark Comparisons</h3>
              <p className="text-sm text-muted-foreground">
                Compare performance across different scenarios
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Comparison
            </Button>
          </div>

          <div className="space-y-4">
            {benchmarkComparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{comparison.name}</div>
                      <div className="text-sm text-muted-foreground">{comparison.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comparison.suites.length} suites</Badge>
                      <Badge variant="outline">{comparison.metrics.length} metrics</Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Compared Suites</h5>
                    <div className="flex gap-2">
                      {comparison.suites.map((suite) => (
                        <div key={suite.suiteId} className="flex items-center gap-1 p-2 border rounded">
                          {getGradeIcon(suite.grade)}
                          <span className="text-sm">{suite.suiteName}</span>
                          <Badge className={getGradeColor(suite.grade)}>
                            {suite.score}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Metric Comparison</h5>
                    <div className="space-y-2">
                      {comparison.metrics.map((metric) => (
                        <div key={metric.name} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium text-sm">{metric.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Best: {metric.best} • Worst: {metric.worst} • Average: {metric.average.toFixed(1)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{metric.improvement.toFixed(1)}%</div>
                            <div className="text-xs text-green-600">improvement</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Key Insights</h5>
                    <div className="space-y-1">
                      {comparison.insights.map((insight, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Comparison
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Benchmark Reports</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive benchmark analysis reports
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends Report</CardTitle>
                <CardDescription>
                  Analyze performance trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  <LineChart className="w-8 h-8" />
                  <p className="ml-2 text-sm">Trend analysis chart</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparative Analysis</CardTitle>
                <CardDescription>
                  Compare performance across environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-8 h-8" />
                  <p className="ml-2 text-sm">Comparison chart</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
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

export default PerformanceBenchmarkingPage;
