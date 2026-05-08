import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Download,
  Plus,
  Filter,
  Search,
  Copy,
  Edit,
  Trash2,
  Save,
  Play,
  Pause,
  Square,
  Users,
  Globe,
  Database,
  Server,
  Wifi,
  WifiOff,
  Certificate,
  Fingerprint,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  FileText,
  Terminal
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'audit' | 'network';
  status: 'active' | 'inactive' | 'error' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  compliance: ComplianceStatus;
  rules: SecurityRule[];
  violations: PolicyViolation[];
  metrics: SecurityMetrics;
}

interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  lastAssessment: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  name: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  description: string;
  evidence: string[];
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface PolicyViolation {
  id: string;
  type: 'access' | 'data' | 'network' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface SecurityMetrics {
  totalViolations: number;
  criticalViolations: number;
  resolvedViolations: number;
  avgResolutionTime: number;
  complianceScore: number;
  riskScore: number;
  threatsBlocked: number;
  last30d: DailyMetrics[];
}

interface DailyMetrics {
  date: string;
  violations: number;
  threatsBlocked: number;
  complianceScore: number;
  riskScore: number;
}

interface ApiKey {
  id: string;
  name: string;
  description: string;
  key: string;
  type: 'read' | 'write' | 'admin';
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  rateLimit: number;
  allowedIPs: string[];
  permissions: string[];
}

interface Certificate {
  id: string;
  name: string;
  description: string;
  domain: string;
  issuer: string;
  status: 'valid' | 'expired' | 'expiring' | 'revoked';
  issuedAt: string;
  expiresAt: string;
  daysUntilExpiry: number;
  algorithm: string;
  keySize: number;
  autoRenew: boolean;
}

const IntegrationSecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(false);

  // Load security policies from API on component mount
  useEffect(() => {
    const loadSecurityPolicies = async () => {
      setLoading(true);
      try {
        const policiesData = await integrationApi.getSecurityPolicies();
        if (policiesData) {
          setSecurityPolicies(policiesData);
        }
      } catch (error) {
        console.error('Failed to load security policies:', error);
        toast.error('Failed to load security policies');
      } finally {
        setLoading(false);
      }
    };
    loadSecurityPolicies();
  }, []);
      priority: 'critical',
      lastUpdated: '2024-01-15 13:45:00',
      compliance: {
        framework: 'AES-256',
        status: 'compliant',
        score: 98,
        lastAssessment: '2024-01-15 13:45:00',
        requirements: [
          { id: 'req-4', name: 'TLS 1.3 for transit', status: 'compliant', description: 'All API calls must use TLS 1.3', evidence: ['Network logs'] },
          { id: 'req-5', name: 'AES-256 for storage', status: 'compliant', description: 'Database encryption with AES-256', evidence: ['Encryption config'] },
          { id: 'req-6', name: 'Key rotation', status: 'compliant', description: 'Keys rotated every 90 days', evidence: ['Key rotation logs'] }
        ]
      },
      rules: [
        { id: 'rule-4', name: 'Enforce HTTPS', condition: 'request.protocol == https', action: 'allow', severity: 'critical', enabled: true, triggerCount: 28900 },
        { id: 'rule-5', name: 'Block weak ciphers', condition: 'cipher.strength >= 256', action: 'deny', severity: 'high', enabled: true, triggerCount: 5 },
        { id: 'rule-6', name: 'Encrypt sensitive fields', condition: 'field.sensitive == true', action: 'encrypt', severity: 'high', enabled: true, triggerCount: 1234 }
      ],
      violations: [
        { id: 'vio-2', type: 'data', severity: 'low', description: 'Unencrypted backup detected', source: 'Backup Service', timestamp: '2024-01-15 12:30:00', resolved: true, resolvedBy: 'Ops Team', resolvedAt: '2024-01-15 13:00:00' }
      ],
      metrics: {
        totalViolations: 12,
        criticalViolations: 0,
        resolvedViolations: 12,
        avgResolutionTime: 30,
        complianceScore: 98,
        riskScore: 8,
        threatsBlocked: 156,
        last30d: [
          { date: '2024-01-01', violations: 3, threatsBlocked: 28, complianceScore: 97, riskScore: 10 },
          { date: '2024-01-02', violations: 2, threatsBlocked: 35, complianceScore: 98, riskScore: 8 },
          { date: '2024-01-03', violations: 1, threatsBlocked: 42, complianceScore: 99, riskScore: 6 }
        ]
      }
    },
    {
      id: 'policy-3',
      name: 'Network Access Control',
      description: 'Control and monitor network access for integrations',
      type: 'network',
      status: 'error',
      priority: 'high',
      lastUpdated: '2024-01-15 12:00:00',
      compliance: {
        framework: 'Zero Trust',
        status: 'partial',
        score: 82,
        lastAssessment: '2024-01-15 12:00:00',
        requirements: [
          { id: 'req-7', name: 'IP whitelisting', status: 'compliant', description: 'Only whitelisted IPs allowed', evidence: ['Firewall logs'] },
          { id: 'req-8', name: 'Rate limiting', status: 'compliant', description: 'Rate limits enforced per client', evidence: ['Rate limit logs'] },
          { id: 'req-9', name: 'Geographic restrictions', status: 'non-compliant', description: 'Block access from restricted regions', evidence: ['GeoIP config missing'] }
        ]
      },
      rules: [
        { id: 'rule-7', name: 'IP whitelist check', condition: 'ip.whitelisted == true', action: 'allow', severity: 'high', enabled: true, triggerCount: 15420 },
        { id: 'rule-8', name: 'Rate limit enforcement', condition: 'rate.limit == false', action: 'deny', severity: 'medium', enabled: true, triggerCount: 89 },
        { id: 'rule-9', name: 'Geographic blocking', condition: 'geo.allowed == true', action: 'allow', severity: 'medium', enabled: false, triggerCount: 0 }
      ],
      violations: [
        { id: 'vio-3', type: 'network', severity: 'high', description: 'Access from restricted geographic region', source: 'Firewall', timestamp: '2024-01-15 11:45:00', resolved: false },
        { id: 'vio-4', type: 'network', severity: 'medium', description: 'Rate limit exceeded by client', source: 'Rate Limiter', timestamp: '2024-01-15 10:30:00', resolved: true, resolvedBy: 'Security Team', resolvedAt: '2024-01-15 11:00:00' }
      ],
      metrics: {
        totalViolations: 78,
        criticalViolations: 12,
        resolvedViolations: 66,
        avgResolutionTime: 60,
        complianceScore: 82,
        riskScore: 35,
        threatsBlocked: 445,
        last30d: [
          { date: '2024-01-01', violations: 25, threatsBlocked: 65, complianceScore: 80, riskScore: 38 },
          { date: '2024-01-02', violations: 18, threatsBlocked: 72, complianceScore: 82, riskScore: 35 },
          { date: '2024-01-03', violations: 22, threatsBlocked: 68, complianceScore: 81, riskScore: 36 }
        ]
      }
    }
  ];

  const apiKeys: ApiKey[] = [
    {
      id: 'key-1',
      name: 'Salesforce Integration Key',
      description: 'API key for Salesforce CRM integration',
      key: 'sk_live_51H2K3K...abc123',
      type: 'write',
      status: 'active',
      createdAt: '2024-01-01 10:00:00',
      expiresAt: '2024-12-31 23:59:59',
      lastUsed: '2024-01-15 15:30:00',
      usageCount: 15420,
      rateLimit: 1000,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      permissions: ['read:accounts', 'write:contacts', 'read:opportunities']
    },
    {
      id: 'key-2',
      name: 'SAP ERP Access',
      description: 'API key for SAP ERP system access',
      key: 'sk_live_51H2K3K...def456',
      type: 'read',
      status: 'active',
      createdAt: '2024-01-05 14:00:00',
      lastUsed: '2024-01-15 14:45:00',
      usageCount: 8930,
      rateLimit: 500,
      allowedIPs: ['192.168.2.0/24'],
      permissions: ['read:financial', 'read:inventory', 'read:employees']
    },
    {
      id: 'key-3',
      name: 'HubSpot Marketing',
      description: 'API key for HubSpot marketing integration',
      key: 'sk_live_51H2K3K...ghi789',
      type: 'write',
      status: 'expired',
      createdAt: '2023-06-01 09:00:00',
      expiresAt: '2024-01-10 23:59:59',
      lastUsed: '2024-01-10 16:20:00',
      usageCount: 6780,
      rateLimit: 1500,
      allowedIPs: ['0.0.0.0/0'],
      permissions: ['read:contacts', 'write:deals', 'read:campaigns']
    }
  ];

  const certificates: Certificate[] = [
    {
      id: 'cert-1',
      name: 'API Gateway Certificate',
      description: 'SSL certificate for API gateway',
      domain: 'api.company.com',
      issuer: 'Let\'s Encrypt',
      status: 'valid',
      issuedAt: '2024-01-01 00:00:00',
      expiresAt: '2024-04-01 00:00:00',
      daysUntilExpiry: 76,
      algorithm: 'RSA',
      keySize: 2048,
      autoRenew: true
    },
    {
      id: 'cert-2',
      name: 'Database Certificate',
      description: 'SSL certificate for database connections',
      domain: 'db.company.com',
      issuer: 'Internal CA',
      status: 'expiring',
      issuedAt: '2023-07-01 00:00:00',
      expiresAt: '2024-01-30 00:00:00',
      daysUntilExpiry: 15,
      algorithm: 'RSA',
      keySize: 4096,
      autoRenew: false
    },
    {
      id: 'cert-3',
      name: 'Legacy System Cert',
      description: 'Certificate for legacy ERP system',
      domain: 'legacy.company.com',
      issuer: 'Old CA',
      status: 'expired',
      issuedAt: '2022-01-01 00:00:00',
      expiresAt: '2024-01-01 00:00:00',
      daysUntilExpiry: -14,
      algorithm: 'DSA',
      keySize: 1024,
      autoRenew: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid':
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'inactive':
      case 'expired':
      case 'non-compliant':
        return 'text-red-600 bg-red-50';
      case 'warning':
      case 'expiring':
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'revoked':
        return 'text-red-700 bg-red-100';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'authentication':
        return 'text-blue-600 bg-blue-50';
      case 'authorization':
        return 'text-purple-600 bg-purple-50';
      case 'encryption':
        return 'text-green-600 bg-green-50';
      case 'audit':
        return 'text-orange-600 bg-orange-50';
      case 'network':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPolicies = securityPolicies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPolicyData = securityPolicies.find(p => p.id === selectedPolicy);

  const totalPolicies = securityPolicies.length;
  const activePolicies = securityPolicies.filter(p => p.status === 'active').length;
  const criticalViolations = securityPolicies.reduce((acc, p) => acc + p.metrics.criticalViolations, 0);
  const avgComplianceScore = Math.round(
    securityPolicies.reduce((acc, p) => acc + p.compliance.score, 0) / totalPolicies
  );

  const handleSecurityReport = async () => {
    try {
      const report = {
        securityPolicies,
        certificates,
        threats,
        summary: {
          totalPolicies,
          activePolicies,
          criticalViolations,
          avgComplianceScore,
          generatedAt: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Security report exported successfully');
    } catch (error) {
      console.error('Failed to export security report:', error);
      toast.error('Failed to export security report');
    }
  };

  const handleFilterThreats = () => {
    toast.info('Filter threats functionality coming soon!');
    // TODO: Implement threat filtering modal
  };

  const handleViewPolicyDetails = (policyId: string) => {
    setSelectedPolicy(policyId);
    toast.info(`Viewing details for policy ${policyId}`);
  };

  const handleConfigurePolicy = (policyId: string) => {
    toast.info(`Configuring policy ${policyId}`);
    // TODO: Implement policy configuration
  };

  const handleViewMetrics = (policyId: string) => {
    toast.info(`Viewing metrics for policy ${policyId}`);
    // TODO: Implement detailed metrics view
  };

  const handleViewCertificate = (certId: string) => {
    toast.info(`Viewing certificate ${certId}`);
    // TODO: Implement certificate details view
  };

  const handleEditCertificate = (certId: string) => {
    toast.info(`Editing certificate ${certId}`);
    // TODO: Implement certificate editing
  };

  const handleDeleteCertificate = (certId: string) => {
    toast.info(`Deleting certificate ${certId}`);
    // TODO: Implement certificate deletion
  };

  const handleViewThreat = (threatId: string) => {
    toast.info(`Viewing threat details ${threatId}`);
    // TODO: Implement threat details view
  };

  const handleRenewCertificate = (certId: string) => {
    toast.info(`Renewing certificate ${certId}`);
    // TODO: Implement certificate renewal
  };

  const handleExportThreatReport = async () => {
    try {
      const threatReport = {
        threats,
        summary: {
          totalThreats: threats.length,
          criticalThreats: threats.filter(t => t.severity === 'critical').length,
          exportedAt: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(threatReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `threat-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Threat report exported successfully');
    } catch (error) {
      console.error('Failed to export threat report:', error);
      toast.error('Failed to export threat report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Security</h1>
          <p className="text-muted-foreground">
            Manage security policies, API keys, and certificates for integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSecurityReport}>
            <Download className="w-4 h-4 mr-2" />
            Security Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolicies}</div>
            <p className="text-xs text-muted-foreground">
              {activePolicies} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgComplianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              average compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Violations</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalViolations}</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {securityPolicies.reduce((acc, p) => acc + p.metrics.threatsBlocked, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalViolations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalViolations} critical security violations</strong> detected. 
            Immediate action required to maintain security compliance.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Policies</h3>
              <p className="text-sm text-muted-foreground">
                Manage and monitor security policies for integrations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleFilterThreats}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policies List */}
            <div className="space-y-4">
              {filteredPolicies.map((policy) => (
                <Card 
                  key={policy.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPolicy === policy.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPolicy(policy.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(policy.status)}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{policy.name}</CardTitle>
                          <CardDescription>{policy.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(policy.type)}>
                          {policy.type}
                        </Badge>
                        <Badge className={getPriorityColor(policy.priority)}>
                          {policy.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Compliance Score:</span>
                        <p className="font-medium">{policy.compliance.score}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Violations:</span>
                        <p className="font-medium">{policy.metrics.totalViolations}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <p className="font-medium">{policy.metrics.riskScore}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span>
                        <p className="font-medium">{policy.lastUpdated}</p>
                      </div>
                    </div>

                    {policy.violations.filter(v => !v.resolved).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Unresolved Violations</span>
                        </div>
                        {policy.violations.filter(v => !v.resolved).slice(0, 2).map((violation) => (
                          <div key={violation.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                violation.severity === 'critical' ? 'bg-red-600' :
                                violation.severity === 'high' ? 'bg-orange-600' :
                                violation.severity === 'medium' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }`} />
                              <span className="text-sm">{violation.description}</span>
                            </div>
                            <Badge className={getPriorityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewPolicyDetails(policy.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleConfigurePolicy(policy.id)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Policy Details */}
            <div>
              {selectedPolicyData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPolicyData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedPolicy(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedPolicyData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Policy Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedPolicyData.type)}>
                              {selectedPolicyData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <Badge className={getPriorityColor(selectedPolicyData.priority)}>
                              {selectedPolicyData.priority}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedPolicyData.status)}>
                              {selectedPolicyData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="font-medium">{selectedPolicyData.lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Compliance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Framework:</span>
                            <span className="font-medium">{selectedPolicyData.compliance.framework}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedPolicyData.compliance.status)}>
                              {selectedPolicyData.compliance.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-medium">{selectedPolicyData.compliance.score}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Assessment:</span>
                            <span className="font-medium">{selectedPolicyData.compliance.lastAssessment}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Security Rules</h4>
                      <div className="space-y-2">
                        {selectedPolicyData.rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                rule.enabled ? 'bg-green-600' : 'bg-gray-400'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{rule.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {rule.condition} → {rule.action}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(rule.severity)}>
                                {rule.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {rule.triggerCount} triggers
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recent Violations</h4>
                      <div className="space-y-2">
                        {selectedPolicyData.violations.slice(0, 3).map((violation) => (
                          <div key={violation.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                violation.resolved ? 'bg-green-600' : 'bg-red-600'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{violation.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  {violation.source} • {violation.timestamp}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(violation.severity)}>
                                {violation.severity}
                              </Badge>
                              <Badge className={violation.resolved ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                                {violation.resolved ? 'Resolved' : 'Open'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Policy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleViewMetrics(policy.id)}>
                        <Activity className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a policy to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage API keys and access credentials
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate API Key
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Usage</th>
                      <th className="text-left p-4 font-medium">Last Used</th>
                      <th className="text-left p-4 font-medium">Expires</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{apiKey.name}</div>
                            <div className="text-sm text-muted-foreground">{apiKey.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={
                            apiKey.type === 'admin' ? 'text-red-600 bg-red-50' :
                            apiKey.type === 'write' ? 'text-orange-600 bg-orange-50' :
                            'text-green-600 bg-green-50'
                          }>
                            {apiKey.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(apiKey.status)}>
                            {apiKey.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{apiKey.usageCount.toLocaleString()}</td>
                        <td className="p-4 text-sm">{apiKey.lastUsed || 'Never'}</td>
                        <td className="p-4 text-sm">{apiKey.expiresAt || 'Never'}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewCertificate(cert.id)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditCertificate(cert.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCertificate(cert.id)}>
                              <Trash2 className="w-4 h-4" />
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

        <TabsContent value="certificates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">SSL Certificates</h3>
              <p className="text-sm text-muted-foreground">
                Manage SSL/TLS certificates for secure connections
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Certificate
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                    <Badge className={getStatusColor(cert.status)}>
                      {cert.status}
                    </Badge>
                  </div>
                  <CardDescription>{cert.domain}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Issuer:</span>
                      <p className="font-medium">{cert.issuer}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Algorithm:</span>
                      <p className="font-medium">{cert.algorithm}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Key Size:</span>
                      <p className="font-medium">{cert.keySize} bits</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Auto Renew:</span>
                      <p className="font-medium">{cert.autoRenew ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">{cert.expiresAt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Days Until:</span>
                      <span className={`font-medium ${
                        cert.daysUntilExpiry < 30 ? 'text-red-600' :
                        cert.daysUntilExpiry < 90 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {cert.daysUntilExpiry > 0 ? `${cert.daysUntilExpiry} days` : 'Expired'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewThreat(threat.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRenewCertificate(threat.id)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Compliance Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Monitor compliance across security frameworks
              </p>
            </div>
            <Button variant="outline" onClick={handleExportThreatReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Scores</CardTitle>
                <CardDescription>
                  Overall compliance across all policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          policy.compliance.status === 'compliant' ? 'bg-green-600' :
                          policy.compliance.status === 'partial' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`} />
                        <div>
                          <div className="font-medium text-sm">{policy.name}</div>
                          <div className="text-xs text-muted-foreground">{policy.compliance.framework}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={policy.compliance.score} className="w-24 h-2" />
                        <span className="text-sm font-medium">{policy.compliance.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>
                  Key security performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Violations</span>
                    <span className="text-sm font-medium">
                      {securityPolicies.reduce((acc, p) => acc + p.metrics.totalViolations, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Critical Violations</span>
                    <span className="text-sm font-medium text-red-600">
                      {securityPolicies.reduce((acc, p) => acc + p.metrics.criticalViolations, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Resolution Time</span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        securityPolicies.reduce((acc, p) => acc + p.metrics.avgResolutionTime, 0) / securityPolicies.length
                      )} minutes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Threats Blocked</span>
                    <span className="text-sm font-medium text-green-600">
                      {securityPolicies.reduce((acc, p) => acc + p.metrics.threatsBlocked, 0)}
                    </span>
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

export default IntegrationSecurityPage;
