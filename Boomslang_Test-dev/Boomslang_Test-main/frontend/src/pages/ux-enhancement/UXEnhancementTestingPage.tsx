import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertTriangle, Play, Pause, RotateCcw, Download, Upload, Eye, EyeOff, Bug, TestTube, Users, Monitor, Smartphone, Tablet, Globe, Zap, Target, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  lastRun: string;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
}

interface TestEnvironment {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  resolution: string;
  status: 'online' | 'offline' | 'busy';
}

const UXEnhancementTestingPage: React.FC = () => {
  const [selectedSuite, setSelectedSuite] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const testSuites: TestSuite[] = [
    {
      id: 'accessibility',
      name: 'Accessibility Tests',
      description: 'WCAG compliance and screen reader compatibility',
      status: 'completed',
      progress: 100,
      totalTests: 45,
      passedTests: 43,
      failedTests: 2,
      duration: 120,
      lastRun: '2024-01-15T10:30:00Z'
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Load times and resource optimization',
      status: 'running',
      progress: 65,
      totalTests: 32,
      passedTests: 20,
      failedTests: 0,
      duration: 180,
      lastRun: '2024-01-15T09:45:00Z'
    },
    {
      id: 'usability',
      name: 'Usability Tests',
      description: 'User interaction and workflow testing',
      status: 'pending',
      progress: 0,
      totalTests: 28,
      passedTests: 0,
      failedTests: 0,
      duration: 0,
      lastRun: '2024-01-14T16:20:00Z'
    },
    {
      id: 'responsive',
      name: 'Responsive Design Tests',
      description: 'Cross-device compatibility testing',
      status: 'failed',
      progress: 80,
      totalTests: 24,
      passedTests: 18,
      failedTests: 6,
      duration: 95,
      lastRun: '2024-01-15T11:15:00Z'
    },
    {
      id: 'compatibility',
      name: 'Browser Compatibility Tests',
      description: 'Cross-browser functionality verification',
      status: 'completed',
      progress: 100,
      totalTests: 18,
      passedTests: 17,
      failedTests: 1,
      duration: 75,
      lastRun: '2024-01-15T08:30:00Z'
    }
  ];

  const testCases: TestCase[] = [
    { id: 'tc1', name: 'Keyboard Navigation', description: 'Test keyboard-only navigation', category: 'accessibility', status: 'passed', duration: 2.5 },
    { id: 'tc2', name: 'Screen Reader Support', description: 'Verify screen reader compatibility', category: 'accessibility', status: 'failed', duration: 3.2, errorMessage: 'ARIA labels missing on navigation elements' },
    { id: 'tc3', name: 'Color Contrast', description: 'Check color contrast ratios', category: 'accessibility', status: 'passed', duration: 1.8 },
    { id: 'tc4', name: 'Page Load Speed', description: 'Measure initial page load time', category: 'performance', status: 'passed', duration: 5.1 },
    { id: 'tc5', name: 'Image Optimization', description: 'Verify image compression and formats', category: 'performance', status: 'passed', duration: 2.3 },
    { id: 'tc6', name: 'Mobile Responsiveness', description: 'Test mobile layout adaptation', category: 'responsive', status: 'failed', duration: 3.7, errorMessage: 'Navigation menu overlaps content on small screens' },
    { id: 'tc7', name: 'Touch Interactions', description: 'Verify touch gesture support', category: 'usability', status: 'passed', duration: 4.2 },
    { id: 'tc8', name: 'Form Validation', description: 'Test form validation feedback', category: 'usability', status: 'passed', duration: 2.8 },
  ];

  const testEnvironments: TestEnvironment[] = [
    { id: 'env1', name: 'Chrome Desktop', type: 'desktop', browser: 'Chrome 120', resolution: '1920x1080', status: 'online' },
    { id: 'env2', name: 'Firefox Desktop', type: 'desktop', browser: 'Firefox 121', resolution: '1920x1080', status: 'online' },
    { id: 'env3', name: 'Safari Mobile', type: 'mobile', browser: 'Safari 17', resolution: '390x844', status: 'busy' },
    { id: 'env4', name: 'Chrome Mobile', type: 'mobile', browser: 'Chrome 120', resolution: '412x915', status: 'online' },
    { id: 'env5', name: 'iPad Tablet', type: 'tablet', browser: 'Safari 17', resolution: '1024x1366', status: 'offline' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline',
      skipped: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 5000);
  };

  const handleStopTests = () => {
    setIsRunning(false);
  };

  const filteredSuites = selectedSuite === 'all' 
    ? testSuites 
    : testSuites.filter(suite => suite.id === selectedSuite);

  const filteredEnvironments = selectedEnvironment === 'all'
    ? testEnvironments
    : testEnvironments.filter(env => env.id === selectedEnvironment);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UX Enhancement Testing</h1>
          <p className="text-muted-foreground">Automated testing for UX enhancements and features</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          {isRunning ? (
            <Button variant="destructive" onClick={handleStopTests}>
              <Pause className="h-4 w-4 mr-2" />
              Stop Tests
            </Button>
          ) : (
            <Button onClick={handleRunTests}>
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Test Suites</p>
                <p className="text-2xl font-bold">{testSuites.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">87.3%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Environments</p>
                <p className="text-2xl font-bold">{testEnvironments.filter(env => env.status === 'online').length}</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Tests</p>
                <p className="text-2xl font-bold">{testSuites.reduce((acc, suite) => acc + suite.failedTests, 0)}</p>
              </div>
              <Bug className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="cases">Test Cases</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedSuite} onValueChange={setSelectedSuite}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suites</SelectItem>
                {testSuites.map(suite => (
                  <SelectItem key={suite.id} value={suite.id}>{suite.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-run">Auto Run</Label>
              <Switch id="auto-run" checked={autoRun} onCheckedChange={setAutoRun} />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredSuites.map(suite => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(suite.status)}
                        {suite.name}
                      </CardTitle>
                      <CardDescription>{suite.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(suite.status)}
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{suite.progress}%</span>
                      </div>
                      <Progress value={suite.progress} />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Tests:</span>
                        <span className="ml-2 font-medium">{suite.totalTests}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passed:</span>
                        <span className="ml-2 font-medium text-green-600">{suite.passedTests}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="ml-2 font-medium text-red-600">{suite.failedTests}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">{suite.duration}s</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Detailed test case results and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCases.map(testCase => (
                  <div key={testCase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(testCase.status)}
                          <h3 className="font-medium">{testCase.name}</h3>
                          <Badge variant="outline">{testCase.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{testCase.description}</p>
                        {testCase.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            {testCase.errorMessage}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{testCase.duration}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                {testEnvironments.map(env => (
                  <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnvironments.map(env => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getEnvironmentIcon(env.type)}
                      {env.name}
                    </CardTitle>
                    <Badge variant={env.status === 'online' ? 'default' : env.status === 'busy' ? 'secondary' : 'destructive'}>
                      {env.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Browser:</span>
                      <span>{env.browser}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution:</span>
                      <span>{env.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{env.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Reports</CardTitle>
              <CardDescription>Comprehensive testing reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reports Available</h3>
                <p className="text-muted-foreground">Run tests to generate detailed reports</p>
                <Button className="mt-4" onClick={handleRunTests}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementTestingPage;
