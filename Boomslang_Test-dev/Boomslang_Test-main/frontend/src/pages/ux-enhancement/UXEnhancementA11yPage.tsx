import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Keyboard, Mouse, Volume2, VolumeX, Contrast, Text, Search, Filter, Download, Upload, RefreshCw, Settings, Info, Zap, Shield, Users, Monitor, Smartphone, Headphones } from 'lucide-react';

interface A11yTest {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'not-tested';
  severity: 'low' | 'medium' | 'high' | 'critical';
  wcagLevel: 'A' | 'AA' | 'AAA';
  impact: number;
  elements: number;
  lastTested: string;
}

interface A11yRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  level: 'A' | 'AA' | 'AAA';
  automated: boolean;
}

interface A11yReport {
  id: string;
  name: string;
  date: string;
  score: number;
  issues: number;
  passed: number;
  total: number;
  status: 'completed' | 'in-progress' | 'failed';
}

const UXEnhancementA11yPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [autoTest, setAutoTest] = useState(true);
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const a11yTests: A11yTest[] = [
    {
      id: 'test1',
      name: 'Image Alt Text',
      description: 'All images have appropriate alt text',
      category: 'images',
      status: 'pass',
      severity: 'high',
      wcagLevel: 'A',
      impact: 85,
      elements: 24,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test2',
      name: 'Color Contrast',
      description: 'Text has sufficient color contrast',
      category: 'color',
      status: 'fail',
      severity: 'high',
      wcagLevel: 'AA',
      impact: 92,
      elements: 156,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test3',
      name: 'Keyboard Navigation',
      description: 'All interactive elements are keyboard accessible',
      category: 'keyboard',
      status: 'warning',
      severity: 'medium',
      wcagLevel: 'A',
      impact: 78,
      elements: 45,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test4',
      name: 'Focus Indicators',
      description: 'Clear focus indicators for keyboard users',
      category: 'keyboard',
      status: 'pass',
      severity: 'medium',
      wcagLevel: 'AA',
      impact: 88,
      elements: 38,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test5',
      name: 'ARIA Labels',
      description: 'Proper ARIA labels for custom components',
      category: 'aria',
      status: 'fail',
      severity: 'high',
      wcagLevel: 'A',
      impact: 95,
      elements: 12,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test6',
      name: 'Heading Structure',
      description: 'Proper heading hierarchy and structure',
      category: 'structure',
      status: 'pass',
      severity: 'medium',
      wcagLevel: 'A',
      impact: 82,
      elements: 28,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test7',
      name: 'Form Labels',
      description: 'All form inputs have proper labels',
      category: 'forms',
      status: 'pass',
      severity: 'high',
      wcagLevel: 'A',
      impact: 90,
      elements: 18,
      lastTested: '2024-01-15T10:30:00Z'
    },
    {
      id: 'test8',
      name: 'Link Purpose',
      description: 'Links have descriptive text or context',
      category: 'links',
      status: 'warning',
      severity: 'medium',
      wcagLevel: 'A',
      impact: 75,
      elements: 67,
      lastTested: '2024-01-15T10:30:00Z'
    }
  ];

  const a11yRules: A11yRule[] = [
    { id: 'rule1', name: 'WCAG 1.1.1 - Non-text Content', description: 'All non-text content has alt text', category: 'images', enabled: true, level: 'A', automated: true },
    { id: 'rule2', name: 'WCAG 1.4.3 - Contrast', description: 'Minimum color contrast ratios', category: 'color', enabled: true, level: 'AA', automated: true },
    { id: 'rule3', name: 'WCAG 2.1.1 - Keyboard', description: 'All functionality available via keyboard', category: 'keyboard', enabled: true, level: 'A', automated: false },
    { id: 'rule4', name: 'WCAG 2.4.7 - Focus Visible', description: 'Visible focus indicators', category: 'keyboard', enabled: true, level: 'AA', automated: true },
    { id: 'rule5', name: 'WCAG 4.1.2 - Name, Role, Value', description: 'ARIA properties for custom components', category: 'aria', enabled: true, level: 'A', automated: false },
  ];

  const a11yReports: A11yReport[] = [
    { id: 'report1', name: 'Full Site Audit', date: '2024-01-15T10:30:00Z', score: 82, issues: 12, passed: 68, total: 80, status: 'completed' },
    { id: 'report2', name: 'Homepage Check', date: '2024-01-14T15:45:00Z', score: 91, issues: 3, passed: 27, total: 30, status: 'completed' },
    { id: 'report3', name: 'Dashboard Review', date: '2024-01-13T09:20:00Z', score: 78, issues: 8, passed: 22, total: 30, status: 'completed' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'not-tested':
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      'not-tested': 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive'
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images':
        return <Eye className="h-4 w-4" />;
      case 'color':
        return <Contrast className="h-4 w-4" />;
      case 'keyboard':
        return <Keyboard className="h-4 w-4" />;
      case 'aria':
        return <Info className="h-4 w-4" />;
      case 'structure':
        return <Text className="h-4 w-4" />;
      case 'forms':
        return <Settings className="h-4 w-4" />;
      case 'links':
        return <Search className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const overallScore = Math.round(
    a11yTests.reduce((acc, test) => acc + test.impact, 0) / a11yTests.length
  );

  const passedTests = a11yTests.filter(test => test.status === 'pass').length;
  const failedTests = a11yTests.filter(test => test.status === 'fail').length;
  const warningTests = a11yTests.filter(test => test.status === 'warning').length;

  const filteredTests = a11yTests.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || test.wcagLevel === selectedLevel;
    const matchesStatus = !showOnlyFailures || test.status === 'fail';
    
    return matchesCategory && matchesLevel && matchesStatus;
  });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Testing</h1>
          <p className="text-muted-foreground">WCAG compliance and accessibility testing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{overallScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed Tests</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Tests</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningTests}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Accessibility Tests</CardTitle>
                  <CardDescription>WCAG compliance test results</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Test</label>
                    <Switch checked={autoTest} onCheckedChange={setAutoTest} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Failures Only</label>
                    <Switch checked={showOnlyFailures} onCheckedChange={setShowOnlyFailures} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="keyboard">Keyboard</SelectItem>
                    <SelectItem value="aria">ARIA</SelectItem>
                    <SelectItem value="structure">Structure</SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="links">Links</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="A">Level A</SelectItem>
                    <SelectItem value="AA">Level AA</SelectItem>
                    <SelectItem value="AAA">Level AAA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredTests.map(test => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(test.status)}
                          <h3 className="font-medium">{test.name}</h3>
                          {getSeverityBadge(test.severity)}
                          <Badge variant="outline">{test.wcagLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(test.category)}
                            <span className="capitalize">{test.category}</span>
                          </div>
                          <span>•</span>
                          <span>{test.elements} elements</span>
                          <span>•</span>
                          <span>Impact: {test.impact}%</span>
                          <span>•</span>
                          <span>Last tested: {new Date(test.lastTested).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm">
                          Retest
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WCAG Rules</CardTitle>
              <CardDescription>Configure accessibility testing rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {a11yRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant="outline">{rule.level}</Badge>
                        {rule.automated && (
                          <Badge variant="secondary">Automated</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.enabled} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Reports</CardTitle>
              <CardDescription>Historical accessibility audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {a11yReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{report.name}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Score: {report.score}%</span>
                          <span>•</span>
                          <span>Issues: {report.issues}</span>
                          <span>•</span>
                          <span>Passed: {report.passed}/{report.total}</span>
                          <span>•</span>
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                        </div>
                        <Progress value={report.score} className="mt-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Screen Reader
                </CardTitle>
                <CardDescription>Test screen reader compatibility</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Launch Screen Reader</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Navigation
                </CardTitle>
                <CardDescription>Test keyboard-only navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Keyboard Test</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contrast className="h-5 w-5" />
                  Color Contrast
                </CardTitle>
                <CardDescription>Analyze color contrast ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Check Contrast</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Focus Order
                </CardTitle>
                <CardDescription>Visualize focus order</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Show Focus Order</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Text className="h-5 w-5" />
                  Text Scaling
                </CardTitle>
                <CardDescription>Test text resizing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Test Text Scaling</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Audio Descriptions
                </CardTitle>
                <CardDescription>Test audio content accessibility</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Test Audio</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementA11yPage;
