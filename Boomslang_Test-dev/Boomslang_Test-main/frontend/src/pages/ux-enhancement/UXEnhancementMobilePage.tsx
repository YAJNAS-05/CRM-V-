import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Smartphone, Tablet, Monitor, TouchPointer, SwipeUp, RotateCw, Download, Upload, Eye, EyeOff, Settings, Zap, AlertTriangle, CheckCircle, XCircle, BarChart3, PieChart, Activity, Users, Globe, Wifi, Battery, Cpu } from 'lucide-react';

interface MobileDevice {
  id: string;
  name: string;
  type: 'phone' | 'tablet';
  os: string;
  version: string;
  screen: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: string;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'enabled' | 'disabled' | 'testing';
  performance: number;
  usage: number;
  issues: number;
}

interface MobileTest {
  id: string;
  name: string;
  device: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  duration: number;
  timestamp: string;
}

const UXEnhancementMobilePage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedOS, setSelectedOS] = useState<string>('all');
  const [showOffline, setShowOffline] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const mobileDevices: MobileDevice[] = [
    { id: 'dev1', name: 'iPhone 14 Pro', type: 'phone', os: 'iOS', version: '17.2', screen: '393x852', status: 'online', lastSeen: '2024-01-15T10:30:00Z' },
    { id: 'dev2', name: 'Samsung Galaxy S23', type: 'phone', os: 'Android', version: '14', screen: '360x780', status: 'online', lastSeen: '2024-01-15T10:28:00Z' },
    { id: 'dev3', name: 'iPad Pro', type: 'tablet', os: 'iOS', version: '17.2', screen: '1024x1366', status: 'offline', lastSeen: '2024-01-14T18:45:00Z' },
    { id: 'dev4', name: 'Google Pixel 8', type: 'phone', os: 'Android', version: '14', screen: '393x851', status: 'busy', lastSeen: '2024-01-15T10:25:00Z' },
    { id: 'dev5', name: 'Surface Pro 9', type: 'tablet', os: 'Windows', version: '11', screen: '1368x912', status: 'online', lastSeen: '2024-01-15T10:29:00Z' },
  ];

  const mobileFeatures: MobileFeature[] = [
    { id: 'feat1', name: 'Touch Gestures', description: 'Swipe, pinch, and tap gestures', category: 'interaction', status: 'enabled', performance: 92, usage: 85, issues: 2 },
    { id: 'feat2', name: 'Push Notifications', description: 'Mobile push notifications', category: 'notifications', status: 'enabled', performance: 88, usage: 72, issues: 5 },
    { id: 'feat3', name: 'Offline Mode', description: 'Offline functionality and sync', category: 'connectivity', status: 'testing', performance: 75, usage: 45, issues: 8 },
    { id: 'feat4', name: 'Biometric Auth', description: 'Fingerprint and face recognition', category: 'security', status: 'enabled', performance: 95, usage: 68, issues: 1 },
    { id: 'feat5', name: 'Camera Integration', description: 'Photo capture and upload', category: 'media', status: 'disabled', performance: 0, usage: 0, issues: 0 },
    { id: 'feat6', name: 'Location Services', description: 'GPS and location tracking', category: 'connectivity', status: 'enabled', performance: 90, usage: 58, issues: 3 },
  ];

  const mobileTests: MobileTest[] = [
    { id: 'test1', name: 'Touch Responsiveness', device: 'iPhone 14 Pro', status: 'passed', duration: 45, timestamp: '2024-01-15T10:30:00Z' },
    { id: 'test2', name: 'Screen Rotation', device: 'Samsung Galaxy S23', status: 'passed', duration: 32, timestamp: '2024-01-15T10:25:00Z' },
    { id: 'test3', name: 'Offline Sync', device: 'iPad Pro', status: 'failed', duration: 120, timestamp: '2024-01-15T10:20:00Z' },
    { id: 'test4', name: 'Push Notifications', device: 'Google Pixel 8', status: 'running', duration: 0, timestamp: '2024-01-15T10:35:00Z' },
    { id: 'test5', name: 'Biometric Login', device: 'Surface Pro 9', status: 'pending', duration: 0, timestamp: '2024-01-15T10:40:00Z' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'enabled':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'disabled':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'busy':
      case 'testing':
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      online: 'default',
      offline: 'destructive',
      busy: 'secondary',
      enabled: 'default',
      disabled: 'destructive',
      testing: 'secondary',
      passed: 'default',
      failed: 'destructive',
      pending: 'outline',
      running: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'iOS':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'Android':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'Windows':
        return <Monitor className="h-4 w-4 text-purple-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const onlineDevices = mobileDevices.filter(device => device.status === 'online').length;
  const totalDevices = mobileDevices.length;
  const enabledFeatures = mobileFeatures.filter(feature => feature.status === 'enabled').length;
  const passedTests = mobileTests.filter(test => test.status === 'passed').length;

  const filteredDevices = mobileDevices.filter(device => {
    const matchesDevice = selectedDevice === 'all' || device.id === selectedDevice;
    const matchesOS = selectedOS === 'all' || device.os === selectedOS;
    const matchesStatus = showOffline || device.status !== 'offline';
    
    return matchesDevice && matchesOS && matchesStatus;
  });

  const handleRunTests = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mobile Experience</h1>
          <p className="text-muted-foreground">Optimize mobile UX and device compatibility</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleRunTests} disabled={isTesting}>
            {isTesting ? (
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isTesting ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">{onlineDevices}/{totalDevices}</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={(onlineDevices / totalDevices) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enabled Features</p>
                <p className="text-2xl font-bold">{enabledFeatures}</p>
              </div>
              <TouchPointer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed Tests</p>
                <p className="text-2xl font-bold">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={89} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mobile Devices</CardTitle>
                  <CardDescription>Connected mobile devices and their status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Show Offline</label>
                    <Switch checked={showOffline} onCheckedChange={setShowOffline} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    {mobileDevices.map(device => (
                      <SelectItem key={device.id} value={device.id}>{device.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedOS} onValueChange={setSelectedOS}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All OS</SelectItem>
                    <SelectItem value="iOS">iOS</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                    <SelectItem value="Windows">Windows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredDevices.map(device => (
                  <Card key={device.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getDeviceIcon(device.type)}
                            <h3 className="font-medium">{device.name}</h3>
                            {getStatusBadge(device.status)}
                            <Badge variant="outline">{device.os} {device.version}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Screen: {device.screen}</span>
                            <span>•</span>
                            <span>Last seen: {new Date(device.lastSeen).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm">
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Features</CardTitle>
              <CardDescription>Mobile-specific features and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mobileFeatures.map(feature => (
                  <div key={feature.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(feature.status)}
                          <h3 className="font-medium">{feature.name}</h3>
                          {getStatusBadge(feature.status)}
                          <Badge variant="outline">{feature.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Performance:</span>
                            <span className="ml-2 font-medium">{feature.performance}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Usage:</span>
                            <span className="ml-2 font-medium">{feature.usage}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issues:</span>
                            <span className="ml-2 font-medium">{feature.issues}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm">
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Tests</CardTitle>
              <CardDescription>Mobile-specific test results and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mobileTests.map(test => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(test.status)}
                          <h3 className="font-medium">{test.name}</h3>
                          {getStatusBadge(test.status)}
                          <Badge variant="outline">{test.device}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Duration: {test.duration}s</span>
                          <span>•</span>
                          <span>{new Date(test.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {test.status === 'failed' && (
                          <Button size="sm">
                            Retest
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Mobile device usage by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Phones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <span>Tablets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OS Distribution</CardTitle>
                <CardDescription>Operating system usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-500" />
                      <span>iOS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span>Android</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-purple-500" />
                      <span>Windows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementMobilePage;
