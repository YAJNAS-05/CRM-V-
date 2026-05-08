import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  Target,
  Radio,
  Cpu,
  Database,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

interface Threat {
  id: string;
  name: string;
  type: 'malware' | 'phishing' | 'ddos' | 'injection' | 'brute-force' | 'data-breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'mitigated' | 'investigating' | 'false-positive';
  confidence: number;
  source: string;
  target: string;
  detected: string;
  description: string;
  affectedAssets: number;
  recommendedAction: string;
}

interface ThreatRule {
  id: string;
  name: string;
  type: 'detection' | 'prevention' | 'response';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  lastTriggered: string;
  triggerCount: number;
  falsePositiveRate: number;
}

interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'ioc' | 'signature' | 'pattern' | 'campaign';
  threat: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'expired' | 'suppressed';
}

const ThreatDetectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);

  // Load threats from API on component mount
  useEffect(() => {
    const loadThreats = async () => {
      setLoading(true);
      try {
        const threatsData = await securityApi.getThreats();
        if (threatsData) {
          setThreats(threatsData);
        }
      } catch (error) {
        console.error('Failed to load threats:', error);
        toast.error('Failed to load threats');
      } finally {
        setLoading(false);
      }
    };
    loadThreats();
  }, []);
      confidence: 95,
      source: 'External Web Request',
      target: 'Customer Database',
      detected: '2024-01-15 13:15:00',
      description: 'SQL injection payload detected in web application input',
      affectedAssets: 1,
      recommendedAction: 'Block malicious IP and update WAF rules'
    },
    {
      id: 'threat-3',
      name: 'Phishing Email Campaign',
      type: 'phishing',
      severity: 'medium',
      status: 'active',
      confidence: 72,
      source: 'External Email',
      target: 'Employee Inboxes',
      detected: '2024-01-15 12:45:00',
      description: 'Bulk phishing emails targeting finance department',
      affectedAssets: 15,
      recommendedAction: 'Update email filters and send security alert'
    },
    {
      id: 'threat-4',
      name: 'DDoS Attack',
      type: 'ddos',
      severity: 'high',
      status: 'mitigated',
      confidence: 98,
      source: 'Multiple Botnets',
      target: 'Web Application Servers',
      detected: '2024-01-15 11:30:00',
      description: 'Distributed denial of service attack on public APIs',
      affectedAssets: 5,
      recommendedAction: 'Activate DDoS mitigation and update rate limits'
    },
    {
      id: 'threat-5',
      name: 'Malware Detection',
      type: 'malware',
      severity: 'critical',
      status: 'investigating',
      confidence: 91,
      source: 'File Upload',
      target: 'File Storage System',
      detected: '2024-01-15 10:20:00',
      description: 'Suspicious executable file detected in upload',
      affectedAssets: 1,
      recommendedAction: 'Quarantine file and scan system for infections'
    }
  ];

  const threatRules: ThreatRule[] = [
    {
      id: 'rule-1',
      name: 'Brute Force Detection',
      type: 'detection',
      enabled: true,
      severity: 'high',
      description: 'Detects multiple failed login attempts',
      lastTriggered: '2024-01-15 14:32:00',
      triggerCount: 156,
      falsePositiveRate: 2.3
    },
    {
      id: 'rule-2',
      name: 'SQL Injection Prevention',
      type: 'prevention',
      enabled: true,
      severity: 'critical',
      description: 'Blocks SQL injection attempts',
      lastTriggered: '2024-01-15 13:15:00',
      triggerCount: 23,
      falsePositiveRate: 0.8
    },
    {
      id: 'rule-3',
      name: 'Phishing Detection',
      type: 'detection',
      enabled: true,
      severity: 'medium',
      description: 'Identifies phishing email patterns',
      lastTriggered: '2024-01-15 12:45:00',
      triggerCount: 89,
      falsePositiveRate: 5.2
    },
    {
      id: 'rule-4',
      name: 'DDoS Mitigation',
      type: 'prevention',
      enabled: true,
      severity: 'high',
      description: 'Automatically mitigates DDoS attacks',
      lastTriggered: '2024-01-15 11:30:00',
      triggerCount: 12,
      falsePositiveRate: 1.1
    }
  ];

  const threatIntelligence: ThreatIntelligence[] = [
    {
      id: 'intel-1',
      source: 'VirusTotal',
      type: 'ioc',
      threat: 'Malicious IP Range',
      confidence: 94,
      severity: 'high',
      firstSeen: '2024-01-14',
      lastSeen: '2024-01-15',
      status: 'active'
    },
    {
      id: 'intel-2',
      source: 'MISP',
      type: 'signature',
      threat: 'APT28 Campaign',
      confidence: 88,
      severity: 'critical',
      firstSeen: '2024-01-13',
      lastSeen: '2024-01-15',
      status: 'active'
    },
    {
      id: 'intel-3',
      source: 'AlienVault OTX',
      type: 'pattern',
      threat: 'Ransomware Pattern',
      confidence: 76,
      severity: 'high',
      firstSeen: '2024-01-12',
      lastSeen: '2024-01-14',
      status: 'expired'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-50';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-50';
      case 'mitigated':
        return 'text-green-600 bg-green-50';
      case 'false-positive':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'malware':
        return <Cpu className="w-4 h-4" />;
      case 'phishing':
        return <Globe className="w-4 h-4" />;
      case 'ddos':
        return <Activity className="w-4 h-4" />;
      case 'injection':
        return <Database className="w-4 h-4" />;
      case 'brute-force':
        return <Lock className="w-4 h-4" />;
      case 'data-breach':
        return <Unlock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const activeThreats = threats.filter(t => t.status === 'active' || t.status === 'investigating');
  const criticalThreats = threats.filter(t => t.severity === 'critical');
  const mitigatedThreats = threats.filter(t => t.status === 'mitigated');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Threat Detection</h1>
          <p className="text-muted-foreground">
            Real-time threat monitoring and security incident response
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Scanning
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Scanning
              </>
            )}
          </Button>
          <Button>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigated Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mitigatedThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              threats resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              accuracy rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalThreats.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalThreats.length} critical threats</strong> detected and require immediate attention. 
            View the threats tab for detailed information and recommended actions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="rules">Detection Rules</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Threats */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Threats</CardTitle>
                <CardDescription>
                  Latest security threats detected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {threats.slice(0, 5).map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                        {getTypeIcon(threat.type)}
                      </div>
                      <div>
                        <div className="font-medium">{threat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {threat.detected} • {threat.target}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {threat.conferity}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Threat Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Distribution</CardTitle>
                <CardDescription>
                  Threats by type and severity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['malware', 'phishing', 'ddos', 'injection', 'brute-force'].map((type) => {
                    const count = threats.filter(t => t.type === type).length;
                    const percentage = (count / threats.length) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Overall security system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Radio className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-lg font-medium">Detection Engine</div>
                  <div className="text-sm text-green-600">Operational</div>
                  <div className="text-xs text-muted-foreground">Last scan: 2 min ago</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-lg font-medium">Threat Database</div>
                  <div className="text-sm text-green-600">Updated</div>
                  <div className="text-xs text-muted-foreground">Last update: 1 hour ago</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-lg font-medium">Protection Status</div>
                  <div className="text-sm text-yellow-600">Partial</div>
                  <div className="text-xs text-muted-foreground">2 rules inactive</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">All Threats</h3>
              <p className="text-sm text-muted-foreground">
                Complete list of detected security threats
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button size="sm">
                <Target className="w-4 h-4 mr-2" />
                Take Action
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {threats.map((threat) => (
              <Card key={threat.id} className={`border-l-4 ${getSeverityColor(threat.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                        {getTypeIcon(threat.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{threat.name}</CardTitle>
                        <CardDescription>
                          {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)} • {threat.detected}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{threat.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Source:</span>
                      <p className="font-medium">{threat.source}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="font-medium">{threat.target}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confspanfidence:</span>
                      <p className="font-medium">{threat.conference}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Affected Assets:</span>
                      <p className="font-medium">{threat.affectedAssets}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Recommended Action</span>
                    </div>
                    <p className="text-sm">{threat.recommendedAction}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Investigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Mitigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Detection Rules</h3>
              <p className="text-sm text-muted-foreground">
                Manage threat detection and prevention rules
              </p>
            </div>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configure Rules
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threatRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} Rule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{rule.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Triggered:</span>
                      <p className="font-medium">{rule.lastTriggered}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trigger Count:</span>
                      <p className="font-medium">{rule.triggerCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">False Positive Rate:</span>
                      <p className="font-medium">{rule.falsePositiveRate}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button size="sm" variant="outline">
                      {rule.enabled ? 'Pause' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Threat Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                External threat feeds and intelligence data
              </p>
            </div>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Feeds
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threatIntelligence.map((intel) => (
              <Card key={intel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{intel.threat}</CardTitle>
                    <Badge className={getSeverityColor(intel.severity)}>
                      {intel.severity}
                    </Badge>
                  </div>
                  <CardDescription>
                    {intel.source} • {intel.type.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confspanfidence:</span>
                      <span className="font-medium">{intel.conference}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">First Seen:</span>
                      <span className="font-medium">{intel.firstSeen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Seen:</span>
                      <span className="font-medium">{intel.lastSeen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(intel.status)}>
                        {intel.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Target className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Trends</CardTitle>
                <CardDescription>
                  Threat detection trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Analytics visualization would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detection Performance</CardTitle>
                <CardDescription>
                  Rule effectiveness and accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>False Positive Rate</span>
                    <span className="font-medium">2.8%</span>
                  </div>
                  <Progress value={2.8} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Detection Speed</span>
                    <span className="font-medium">1.2s avg</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreatDetectionPage;
