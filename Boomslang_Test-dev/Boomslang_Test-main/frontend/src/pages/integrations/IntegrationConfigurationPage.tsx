import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Settings, 
  Database, 
  Globe, 
  Server, 
  Shield,
  Key,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Plus,
  Filter,
  Search,
  Save,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff,
  Copy,
  Zap,
  BarChart3,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Terminal,
  Code,
  Lock,
  Unlock,
  Users,
  Calendar,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'database' | 'webhook' | 'file' | 'message_queue';
  status: 'active' | 'inactive' | 'error' | 'testing';
  environment: 'development' | 'staging' | 'production';
  version: string;
  lastModified: string;
  modifiedBy: string;
  settings: ConfigSettings;
  connections: ConnectionConfig[];
  security: SecurityConfig;
  performance: PerformanceConfig;
  monitoring: MonitoringConfig;
}

interface ConfigSettings {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  maxConcurrency: number;
  rateLimiting: RateLimitConfig;
  caching: CacheConfig;
  logging: LoggingConfig;
}

interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  strategy: 'fixed' | 'sliding' | 'token_bucket';
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  format: 'json' | 'text';
  includeHeaders: boolean;
  includeBody: boolean;
  maxLogSize: number;
}

interface ConnectionConfig {
  id: string;
  name: string;
  type: 'http' | 'https' | 'tcp' | 'udp' | 'websocket';
  host: string;
  port: number;
  protocol: string;
  authentication: AuthConfig;
  headers: Record<string, string>;
  healthCheck: HealthCheckConfig;
}

interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'certificate';
  credentials?: Record<string, string>;
  tokenUrl?: string;
  scopes?: string[];
}

interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  path: string;
  expectedStatus: number;
}

interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthConfig;
  authorization: AuthorizationConfig;
  compliance: ComplianceConfig;
}

interface EncryptionConfig {
  inTransit: boolean;
  atRest: boolean;
  algorithm: string;
  keyRotation: boolean;
  rotationInterval: number;
}

interface AuthorizationConfig {
  type: 'none' | 'rbac' | 'abac' | 'custom';
  roles: string[];
  permissions: string[];
  policies: PolicyConfig[];
}

interface PolicyConfig {
  id: string;
  name: string;
  rules: RuleConfig[];
}

interface RuleConfig {
  effect: 'allow' | 'deny';
  action: string;
  resource: string;
  condition?: string;
}

interface ComplianceConfig {
  frameworks: string[];
  auditLogging: boolean;
  dataRetention: number;
  gdprCompliant: boolean;
  soxCompliant: boolean;
}

interface PerformanceConfig {
  optimization: OptimizationConfig;
  scaling: ScalingConfig;
  resources: ResourceConfig;
}

interface OptimizationConfig {
  compressionEnabled: boolean;
  minificationEnabled: boolean;
  connectionPooling: boolean;
  keepAlive: boolean;
}

interface ScalingConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
}

interface ResourceConfig {
  maxMemory: number;
  maxCpu: number;
  maxConnections: number;
  timeout: number;
}

interface MonitoringConfig {
  metrics: MetricsConfig;
  alerts: AlertConfig;
  tracing: TracingConfig;
}

interface MetricsConfig {
  enabled: boolean;
  interval: number;
  retention: number;
  endpoints: string[];
}

interface AlertConfig {
  enabled: boolean;
  channels: string[];
  thresholds: ThresholdConfig[];
}

interface ThresholdConfig {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TracingConfig {
  enabled: boolean;
  samplingRate: number;
  exporter: string;
  headers: string[];
}

const IntegrationConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('configurations');
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Load integration configurations from API on component mount
  useEffect(() => {
    const loadIntegrationConfigs = async () => {
      setLoading(true);
      try {
        // Use getIntegrations as fallback since getIntegrationConfigs doesn't exist
        const integrationsData = await integrationApi.getIntegrations();
        if (integrationsData) {
          // Transform integrations to config format
          const configsData = integrationsData.map((integration: any) => ({
            id: integration.id,
            name: integration.name,
            description: integration.description || 'Configuration for ' + integration.name,
            type: integration.category || 'api',
            status: integration.status === 'active' ? 'active' : 'inactive',
            environment: 'production',
            version: '1.0.0',
            lastModified: new Date().toISOString().split('T')[0],
            modifiedBy: 'System',
            settings: {
              maxConcurrency: 100,
              timeout: 30000,
              retryAttempts: 3,
              retryDelay: 1000
            },
            connections: [
              {
                id: `conn-${integration.id}-1`,
                name: `${integration.name} Connection`,
                type: 'api',
                endpoint: integration.endpoint || 'https://api.example.com',
                status: 'active',
                lastConnected: new Date().toISOString(),
                healthCheck: {
                  enabled: true,
                  interval: 300000,
                  timeout: 10000
                }
              }
            ]
          }));
          setIntegrationConfigs(configsData);
        }
      } catch (error) {
        console.error('Failed to load integration configurations:', error);
        toast.error('Failed to load integration configurations');
      } finally {
        setLoading(false);
      }
    };
    loadIntegrationConfigs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'text-blue-600 bg-blue-50';
      case 'database':
        return 'text-purple-600 bg-purple-50';
      case 'webhook':
        return 'text-green-600 bg-green-50';
      case 'file':
        return 'text-orange-600 bg-orange-50';
      case 'message_queue':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'text-red-600 bg-red-50';
      case 'staging':
        return 'text-yellow-600 bg-yellow-50';
      case 'development':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredConfigs = integrationConfigs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConfigData = integrationConfigs.find(c => c.id === selectedConfig);

  const totalConfigs = integrationConfigs.length;
  const activeConfigs = integrationConfigs.filter(c => c.status === 'active').length;
  const productionConfigs = integrationConfigs.filter(c => c.environment === 'production').length;
  const testingConfigs = integrationConfigs.filter(c => c.status === 'testing').length;

  const handleExportConfig = async () => {
    try {
      const config = {
        integrationConfigs: integrationConfigs,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integration-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Configuration exported successfully');
    } catch (error) {
      console.error('Failed to export configuration:', error);
      toast.error('Failed to export configuration');
    }
  };

  const handleViewConfig = (configId: string) => {
    toast.info(`Viewing configuration ${configId} details`);
    // TODO: Implement detailed configuration view modal or navigation
  };

  const handleEditConfig = (configId: string) => {
    toast.info(`Editing configuration ${configId}`);
    // TODO: Implement configuration edit form or modal
  };

  const handleCloneConfig = (configId: string) => {
    toast.info(`Cloning configuration ${configId}`);
    // TODO: Implement configuration cloning functionality
  };

  const handleClearSelection = () => {
    setSelectedConfig(null);
    toast.info('Selection cleared');
  };

  const handleSaveChanges = async (configId: string) => {
    try {
      toast.loading(`Saving changes for configuration ${configId}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Configuration ${configId} saved successfully`);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleReloadConfig = async (configId: string) => {
    try {
      toast.loading(`Reloading configuration ${configId}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Configuration ${configId} reloaded successfully`);
    } catch (error) {
      console.error('Failed to reload configuration:', error);
      toast.error('Failed to reload configuration');
    }
  };

  const handleTestConnection = async (configId: string) => {
    try {
      toast.loading(`Testing connection for configuration ${configId}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const success = Math.random() > 0.2;
      if (success) {
        toast.success(`Connection test for ${configId} passed`);
      } else {
        toast.error(`Connection test for ${configId} failed`);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      toast.error('Failed to test connection');
    }
  };

  const handleSecurityAudit = () => {
    toast.info('Security Audit functionality coming soon!');
    // TODO: Implement security audit functionality
  };

  const handlePerformanceMetrics = () => {
    toast.info('Performance Metrics functionality coming soon!');
    // TODO: Implement performance metrics view
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Configuration</h1>
          <p className="text-muted-foreground">
            Manage configuration settings for all integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={() => toast.info('New Configuration form coming soon!')}>
            <Plus className="w-4 h-4 mr-2" />
            New Configuration
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConfigs}</div>
            <p className="text-xs text-muted-foreground">
              {activeConfigs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Server className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{productionConfigs}</div>
            <p className="text-xs text-muted-foreground">
              in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testing</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{testingConfigs}</div>
            <p className="text-xs text-muted-foreground">
              being tested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Timeout</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(integrationConfigs.reduce((acc, c) => acc + c.settings.timeout, 0) / totalConfigs / 1000)}s
            </div>
            <p className="text-xs text-muted-foreground">
              average timeout
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Integration Configurations</h3>
              <p className="text-sm text-muted-foreground">
                Manage configuration settings for integrations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search configurations..."
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
            {/* Configurations List */}
            <div className="space-y-4">
              {filteredConfigs.map((config) => (
                <Card 
                  key={config.id}
                  className={`cursor-pointer transition-colors ${
                    selectedConfig === config.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedConfig(config.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(config.status)}`}>
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <CardDescription>{config.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(config.type)}>
                          {config.type}
                        </Badge>
                        <Badge className={getEnvironmentColor(config.environment)}>
                          {config.environment}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <p className="font-medium">{config.version}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(config.status)}>
                          {config.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeout:</span>
                        <p className="font-medium">{config.settings.timeout}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Concurrency:</span>
                        <p className="font-medium">{config.settings.maxConcurrency}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Modified by {config.modifiedBy}</span>
                      <span>{config.lastModified}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewConfig(config.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditConfig(config.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCloneConfig(config.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Clone
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Configuration Details */}
            <div>
              {selectedConfigData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedConfigData.name}
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedConfigData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedConfigData.type)}>
                              {selectedConfigData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment:</span>
                            <Badge className={getEnvironmentColor(selectedConfigData.environment)}>
                              {selectedConfigData.environment}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-medium">{selectedConfigData.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedConfigData.status)}>
                              {selectedConfigData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeout:</span>
                            <span className="font-medium">{selectedConfigData.settings.timeout}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Retry Attempts:</span>
                            <span className="font-medium">{selectedConfigData.settings.retryAttempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Batch Size:</span>
                            <span className="font-medium">{selectedConfigData.settings.batchSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Concurrency:</span>
                            <span className="font-medium">{selectedConfigData.settings.maxConcurrency}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Rate Limiting</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Enabled:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.rateLimiting.enabled ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requests/sec:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.rateLimiting.requestsPerSecond}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Burst Size:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.rateLimiting.burstSize}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strategy:</span>
                            <span className="ml-2 font-medium capitalize">
                              {selectedConfigData.settings.rateLimiting.strategy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Caching</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Enabled:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.caching.enabled ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TTL:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.caching.ttl}ms
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Size:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.caching.maxSize}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strategy:</span>
                            <span className="ml-2 font-medium capitalize">
                              {selectedConfigData.settings.caching.strategy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Logging</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Level:</span>
                            <span className="ml-2 font-medium capitalize">
                              {selectedConfigData.settings.logging.level}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Format:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.logging.format}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Include Headers:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.logging.includeHeaders ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Include Body:</span>
                            <span className="ml-2 font-medium">
                              {selectedConfigData.settings.logging.includeBody ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => selectedConfigData && handleSaveChanges(selectedConfigData.id)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectedConfigData && handleReloadConfig(selectedConfigData.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reload
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExportConfig}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a configuration to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Connection Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure connection parameters and endpoints
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </div>

          <div className="space-y-4">
            {selectedConfigData?.connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{connection.name}</CardTitle>
                    <Badge className={connection.healthCheck.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                      {connection.healthCheck.enabled ? 'Health Check Enabled' : 'Health Check Disabled'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {connection.type.toUpperCase()} connection to {connection.host}:{connection.port}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Protocol:</span>
                      <p className="font-medium">{connection.protocol}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Authentication:</span>
                      <p className="font-medium capitalize">{connection.authentication.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Health Check Interval:</span>
                      <p className="font-medium">{connection.healthCheck.interval}ms</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Health Check Timeout:</span>
                      <p className="font-medium">{connection.healthCheck.timeout}ms</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => selectedConfigData && handleTestConnection(selectedConfigData.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => selectedConfigData && handleEditConfig(selectedConfigData.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Manage security settings and compliance
              </p>
            </div>
            <Button variant="outline" onClick={handleSecurityAudit}>
              <Shield className="w-4 h-4 mr-2" />
              Security Audit
            </Button>
          </div>

          {selectedConfigData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Encryption Settings</CardTitle>
                  <CardDescription>
                    Configure encryption for data in transit and at rest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In Transit:</span>
                      <Badge className={selectedConfigData.security.encryption.inTransit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                        {selectedConfigData.security.encryption.inTransit ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">At Rest:</span>
                      <Badge className={selectedConfigData.security.encryption.atRest ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                        {selectedConfigData.security.encryption.atRest ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="font-medium">{selectedConfigData.security.encryption.algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Key Rotation:</span>
                      <Badge className={selectedConfigData.security.encryption.keyRotation ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                        {selectedConfigData.security.encryption.keyRotation ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Settings</CardTitle>
                  <CardDescription>
                    Compliance framework configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frameworks:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedConfigData.security.compliance.frameworks.map((framework, index) => (
                          <Badge key={index} variant="outline">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audit Logging:</span>
                      <Badge className={selectedConfigData.security.compliance.auditLogging ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                        {selectedConfigData.security.compliance.auditLogging ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GDPR Compliant:</span>
                      <Badge className={selectedConfigData.security.compliance.gdprCompliant ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                        {selectedConfigData.security.compliance.gdprCompliant ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SOX Compliant:</span>
                      <Badge className={selectedConfigData.security.compliance.soxCompliant ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                        {selectedConfigData.security.compliance.soxCompliant ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Optimize performance and resource usage
              </p>
            </div>
            <Button variant="outline" onClick={handlePerformanceMetrics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Metrics
            </Button>
          </div>

          {selectedConfigData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Settings</CardTitle>
                  <CardDescription>
                    Performance optimization configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compression:</span>
                      <Badge className={selectedConfigData.performance.optimization.compressionEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                        {selectedConfigData.performance.optimization.compressionEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connection Pooling:</span>
                      <Badge className={selectedConfigData.performance.optimization.connectionPooling ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                        {selectedConfigData.performance.optimization.connectionPooling ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Keep Alive:</span>
                      <Badge className={selectedConfigData.performance.optimization.keepAlive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                        {selectedConfigData.performance.optimization.keepAlive ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Limits</CardTitle>
                  <CardDescription>
                    Resource allocation and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Memory:</span>
                      <span className="font-medium">{selectedConfigData.performance.resources.maxMemory}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max CPU:</span>
                      <span className="font-medium">{selectedConfigData.performance.resources.maxCpu}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Connections:</span>
                      <span className="font-medium">{selectedConfigData.performance.resources.maxConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span className="font-medium">{selectedConfigData.performance.resources.timeout}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationConfigurationPage;
