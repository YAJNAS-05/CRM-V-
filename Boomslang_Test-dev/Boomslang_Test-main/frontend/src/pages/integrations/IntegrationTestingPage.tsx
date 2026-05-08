import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  TestTube, 
  Play, 
  Pause, 
  Square, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Save,
  Code,
  Terminal,
  Database,
  Globe,
  Server,
  Zap,
  BarChart3,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Timer,
  Flag,
  GitBranch,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  integration: string;
  type: 'unit' | 'integration' | 'end-to-end' | 'performance' | 'security';
  status: 'idle' | 'running' | 'passed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastRun: string;
  duration: number;
  testCount: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  environment: 'development' | 'staging' | 'production';
  tests: TestCase[];
  results: TestResult[];
  configuration: TestConfiguration;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'database' | 'webhook' | 'file' | 'auth';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  assertions: Assertion[];
  setup: TestStep[];
  teardown: TestStep[];
  dependencies: string[];
  tags: string[];
}

interface Assertion {
  id: string;
  type: 'status' | 'response_time' | 'data' | 'schema' | 'custom';
  expected: any;
  actual: any;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
}

interface TestStep {
  id: string;
  name: string;
  type: 'request' | 'validation' | 'setup' | 'cleanup';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
  details: string;
}

interface TestResult {
  id: string;
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  startTime: string;
  endTime: string;
  error?: TestError;
  metrics: TestMetrics;
  artifacts: TestArtifact[];
}

interface TestError {
  type: string;
  message: string;
  stackTrace?: string;
  details: Record<string, any>;
}

interface TestMetrics {
  responseTime: number;
  dataSize: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkRequests?: number;
}

interface TestArtifact {
  id: string;
  name: string;
  type: 'screenshot' | 'log' | 'har' | 'video' | 'report';
  url: string;
  size: number;
  createdAt: string;
}

interface TestConfiguration {
  timeout: number;
  retryAttempts: number;
  parallel: boolean;
  maxConcurrency: number;
  environment: Record<string, string>;
  fixtures: string[];
  mocks: MockConfig[];
}

interface MockConfig {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  response: any;
  status: number;
  headers: Record<string, string>;
  enabled: boolean;
}

const IntegrationTestingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('test-suites');
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);

  // Load test suites from API on component mount
  useEffect(() => {
    const loadTestSuites = async () => {
      setLoading(true);
      try {
        const suitesData = await integrationApi.getTestSuites();
        if (suitesData) {
          setTestSuites(suitesData);
        }
      } catch (error) {
        console.error('Failed to load test suites:', error);
        toast.error('Failed to load test suites');
      } finally {
        setLoading(false);
      }
    };
    loadTestSuites();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
      case 'skipped':
        return 'text-yellow-600 bg-yellow-50';
      case 'idle':
      case 'pending':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleExportResults = async () => {
    try {
      const results = {
        testSuites: testSuites,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Test results exported successfully');
    } catch (error) {
      console.error('Failed to export test results:', error);
      toast.error('Failed to export test results');
    }
  };

  const handleNewTestSuite = () => {
    toast.info('New Test Suite form coming soon!');
    // TODO: Implement navigation to test suite creation form
  };

  const handleViewTestDetails = (suiteId: string) => {
    toast.info(`Viewing test suite ${suiteId} details`);
    // TODO: Implement detailed test view modal or navigation
  };

  const handleRunTestSuite = async (suiteId: string) => {
    try {
      toast.loading(`Running test suite ${suiteId}...`);
      
      // Update status to running
      setTestSuites(prev => 
        prev.map(suite => 
          suite.id === suiteId 
            ? { ...suite, status: 'running' }
            : suite
        )
      );
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update status to completed with random result
      const passed = Math.random() > 0.3;
      setTestSuites(prev => 
        prev.map(suite => 
          suite.id === suiteId 
            ? { 
                ...suite, 
                status: passed ? 'passed' : 'failed',
                lastRun: new Date().toISOString()
              }
            : suite
        )
      );
      
      toast.success(`Test suite ${suiteId} ${passed ? 'passed' : 'failed'}`);
    } catch (error) {
      console.error('Failed to run test suite:', error);
      toast.error('Failed to run test suite');
      
      // Reset status on error
      setTestSuites(prev => 
        prev.map(suite => 
          suite.id === suiteId 
            ? { ...suite, status: 'idle' }
            : suite
        )
      );
    }
  };

  const handleStopTestSuite = async (suiteId: string) => {
    try {
      toast.loading(`Stopping test suite ${suiteId}...`);
      
      // Simulate stopping
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestSuites(prev => 
        prev.map(suite => 
          suite.id === suiteId 
            ? { ...suite, status: 'cancelled' }
            : suite
        )
      );
      
      toast.success(`Test suite ${suiteId} stopped`);
    } catch (error) {
      console.error('Failed to stop test suite:', error);
      toast.error('Failed to stop test suite');
    }
  };

  const handleClearSelection = () => {
    setSelectedSuite(null);
    toast.info('Selection cleared');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit':
        return 'text-blue-600 bg-blue-50';
      case 'integration':
        return 'text-green-600 bg-green-50';
      case 'end-to-end':
        return 'text-purple-600 bg-purple-50';
      case 'performance':
        return 'text-orange-600 bg-orange-50';
      case 'security':
        return 'text-red-600 bg-red-50';
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

  const filteredSuites = testSuites.filter(suite =>
    suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suite.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSuiteData = testSuites.find(s => s.id === selectedSuite);

  const totalSuites = testSuites.length;
  const passedSuites = testSuites.filter(s => s.status === 'passed').length;
  const failedSuites = testSuites.filter(s => s.status === 'failed').length;
  const runningSuites = testSuites.filter(s => s.status === 'running').length;
  const totalTests = testSuites.reduce((acc, s) => acc + s.testCount, 0);
  const avgCoverage = Math.round(
    testSuites.reduce((acc, s) => acc + s.coverage, 0) / totalSuites
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Testing</h1>
          <p className="text-muted-foreground">
            Run and manage integration tests for all connected systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button onClick={handleNewTestSuite}>
            <Plus className="w-4 h-4 mr-2" />
            New Test Suite
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuites}</div>
            <p className="text-xs text-muted-foreground">
              {passedSuites} passed, {failedSuites} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningSuites}</div>
            <p className="text-xs text-muted-foreground">
              currently executing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              across all suites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Flag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgCoverage}%</div>
            <p className="text-xs text-muted-foreground">
              average coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Running Alert */}
      {runningSuites > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{runningSuites} test suite(s)</strong> are currently running. 
            Monitor progress in the test results section.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="test-suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="test-suites" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Test Suites</h3>
              <p className="text-sm text-muted-foreground">
                Manage and execute integration test suites
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search test suites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Suites List */}
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
                          {suite.status === 'running' ? <Activity className="w-4 h-4" /> :
                           suite.status === 'passed' ? <CheckCircle className="w-4 h-4" /> :
                           suite.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           <TestTube className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{suite.name}</CardTitle>
                          <CardDescription>{suite.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(suite.type)}>
                          {suite.type}
                        </Badge>
                        <Badge className={getPriorityColor(suite.priority)}>
                          {suite.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Integration:</span>
                      <Badge variant="outline">{suite.integration}</Badge>
                      <span className="text-muted-foreground">Environment:</span>
                      <Badge variant="outline">{suite.environment}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tests:</span>
                        <p className="font-medium">{suite.passedTests}/{suite.testCount} passed</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <p className="font-medium">{suite.coverage}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{Math.round(suite.duration / 1000)}s</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{suite.lastRun}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewTestDetails(suite.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {suite.status === 'idle' || suite.status === 'failed' || suite.status === 'cancelled' ? (
                        <Button size="sm" variant="outline" onClick={() => handleRunTestSuite(suite.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-run
                        </Button>
                      ) : suite.status === 'running' ? (
                        <Button size="sm" variant="outline" onClick={() => handleStopTestSuite(suite.id)}>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleRunTestSuite(suite.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-run
                        </Button>
                      )}
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
                        <h4 className="font-medium mb-2">Test Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedSuiteData.type)}>
                              {selectedSuiteData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <Badge className={getPriorityColor(selectedSuiteData.priority)}>
                              {selectedSuiteData.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedSuiteData.status)}>
                              {selectedSuiteData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment:</span>
                            <span className="font-medium">{selectedSuiteData.environment}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Test Results</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Tests:</span>
                            <span className="font-medium">{selectedSuiteData.testCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Passed:</span>
                            <span className="font-medium text-green-600">{selectedSuiteData.passedTests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Failed:</span>
                            <span className="font-medium text-red-600">{selectedSuiteData.failedTests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coverage:</span>
                            <span className="font-medium">{selectedSuiteData.coverage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Test Cases</h4>
                      <div className="space-y-2">
                        {selectedSuiteData.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                test.status === 'passed' ? 'bg-green-600' :
                                test.status === 'failed' ? 'bg-red-600' :
                                test.status === 'running' ? 'bg-blue-600' :
                                'bg-gray-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{test.name}</div>
                                <div className="text-xs text-muted-foreground">{test.description}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {test.duration > 0 ? `${test.duration}ms` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => selectedSuiteData && handleRunTestSuite(selectedSuiteData.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Run Suite
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info('Edit Suite functionality coming soon!')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Suite
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExportResults}>
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
                      <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a test suite to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Test Results</h3>
              <p className="text-sm text-muted-foreground">
                Review detailed test results and artifacts
              </p>
            </div>
            <Button variant="outline" onClick={handleExportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export All Results
            </Button>
          </div>

          <div className="space-y-4">
            {testSuites.flatMap(suite => 
              suite.results.map((result) => (
                <Card key={result.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(result.status)}`}>
                          {result.status === 'passed' ? <CheckCircle className="w-4 h-4" /> :
                           result.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{result.testName}</div>
                          <div className="text-sm text-muted-foreground">
                            {suite.name} • {result.startTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {result.error && (
                      <div className="mt-4 p-3 bg-red-50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-sm text-red-800">Error Details</span>
                        </div>
                        <div className="text-sm text-red-800">
                          <p className="font-medium">{result.error.type}: {result.error.message}</p>
                          {result.error.stackTrace && (
                            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                              {result.error.stackTrace}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Response Time: {result.metrics.responseTime}ms</span>
                        <span>Data Size: {result.metrics.dataSize} bytes</span>
                        {result.metrics.networkRequests && (
                          <span>Requests: {result.metrics.networkRequests}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {result.artifacts.map((artifact) => (
                          <Button key={artifact.id} size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            {artifact.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor test performance and identify bottlenecks
              </p>
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Metrics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>
                  Average response times across test suites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Response time chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Coverage</CardTitle>
                <CardDescription>
                  Code coverage by test suite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSuites.map((suite) => (
                    <div key={suite.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{suite.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={suite.coverage} className="w-24 h-2" />
                        <span className="text-sm">{suite.coverage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Test Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure test environments and settings
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Configuration
            </Button>
          </div>

          {selectedSuiteData && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSuiteData.name} - Configuration</CardTitle>
                <CardDescription>
                  Test suite configuration and environment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Execution Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timeout:</span>
                        <span className="font-medium">{selectedSuiteData.configuration.timeout}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retry Attempts:</span>
                        <span className="font-medium">{selectedSuiteData.configuration.retryAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parallel Execution:</span>
                        <span className="font-medium">{selectedSuiteData.configuration.parallel ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Concurrency:</span>
                        <span className="font-medium">{selectedSuiteData.configuration.maxConcurrency}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedSuiteData.configuration.environment).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Test Fixtures</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSuiteData.configuration.fixtures.map((fixture, index) => (
                      <Badge key={index} variant="outline">
                        {fixture}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mock Services</h4>
                  <div className="space-y-2">
                    {selectedSuiteData.configuration.mocks.map((mock) => (
                      <div key={mock.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium text-sm">{mock.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {mock.method} {mock.endpoint}
                          </div>
                        </div>
                        <Badge className={mock.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                          {mock.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationTestingPage;
