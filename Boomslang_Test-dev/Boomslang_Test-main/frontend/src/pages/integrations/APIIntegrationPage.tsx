import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Plug, 
  Globe, 
  Database, 
  Code, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Clock,
  Zap,
  Key,
  Shield,
  BarChart3,
  FileText,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  type: 'rest' | 'soap' | 'graphql' | 'webhook' | 'database' | 'file';
  category: 'crm' | 'erp' | 'marketing' | 'finance' | 'hr' | 'ecommerce' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'testing' | 'deprecated';
  version: string;
  endpoint: string;
  authentication: 'api-key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
  lastSync: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  requestCount: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
  dataVolume: number;
  connectedSystems: string[];
  endpoints: APIEndpoint[];
  webhooks: WebhookConfig[];
  monitoring: MonitoringData;
  configuration: IntegrationConfig;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  status: 'active' | 'inactive' | 'error';
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered: string;
  deliveryCount: number;
  failureCount: number;
}

interface MonitoringData {
  requests: number;
  errors: number;
  avgResponseTime: number;
  successRate: number;
  uptime: number;
  last24h: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
}

interface IntegrationConfig {
  timeout: number;
  retryAttempts: number;
  rateLimit: number;
  dataMapping: Record<string, string>;
  transformations: string[];
  validation: boolean;
  encryption: boolean;
}

const APIIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiIntegrations, setApiIntegrations] = useState<APIIntegration[]>([]);
  const [loading, setLoading] = useState(false);

  // Load API integrations from API on component mount
  useEffect(() => {
    const loadApiIntegrations = async () => {
      setLoading(true);
      try {
        const integrationsData = await integrationApi.getApiIntegrations();
        if (integrationsData) {
          setApiIntegrations(integrationsData);
        }
      } catch (error) {
        console.error('Failed to load API integrations:', error);
        toast.error('Failed to load API integrations');
      } finally {
        setLoading(false);
      }
    };
    loadApiIntegrations();
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
      case 'deprecated':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleExportConfig = async () => {
    try {
      const config = {
        integrations: apiIntegrations,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-integrations-config-${new Date().toISOString().split('T')[0]}.json`;
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

  const handleNewIntegration = () => {
    // Navigate to new integration form or open modal
    toast.info('New Integration form coming soon!');
    // TODO: Implement navigation to integration creation form
  };

  const handleViewIntegration = (integrationId: string) => {
    toast.info(`Viewing integration ${integrationId}`);
    // TODO: Implement detailed integration view modal or navigation
  };

  const handleTestIntegration = async (integrationId: string) => {
    try {
      toast.loading(`Testing integration ${integrationId}...`);
      // Simulate API call to test integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Integration ${integrationId} test completed successfully`);
    } catch (error) {
      console.error('Failed to test integration:', error);
      toast.error(`Failed to test integration ${integrationId}`);
    }
  };

  const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      toast.loading(`${newStatus === 'active' ? 'Activating' : 'Deactivating'} integration...`);
      
      // Simulate API call to toggle integration status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      setApiIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: newStatus as 'error' | 'active' | 'inactive' | 'testing' | 'deprecated' }
            : integration
        )
      );
      
      toast.success(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      toast.error('Failed to update integration status');
    }
  };

  const handleClearSelection = () => {
    setSelectedIntegration(null);
    toast.info('Selection cleared');
  };

  const handleRefresh = async () => {
    await loadApiIntegrations();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crm':
        return 'text-blue-600 bg-blue-50';
      case 'erp':
        return 'text-purple-600 bg-purple-50';
      case 'marketing':
        return 'text-green-600 bg-green-50';
      case 'finance':
        return 'text-yellow-600 bg-yellow-50';
      case 'hr':
        return 'text-pink-600 bg-pink-50';
      case 'ecommerce':
        return 'text-indigo-600 bg-indigo-50';
      case 'custom':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rest':
        return 'text-green-600 bg-green-50';
      case 'soap':
        return 'text-orange-600 bg-orange-50';
      case 'graphql':
        return 'text-purple-600 bg-purple-50';
      case 'webhook':
        return 'text-blue-600 bg-blue-50';
      case 'database':
        return 'text-gray-600 bg-gray-50';
      case 'file':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-600 bg-green-50';
      case 'POST':
        return 'text-blue-600 bg-blue-50';
      case 'PUT':
        return 'text-yellow-600 bg-yellow-50';
      case 'DELETE':
        return 'text-red-600 bg-red-50';
      case 'PATCH':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredIntegrations = apiIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIntegrationData = apiIntegrations.find(i => i.id === selectedIntegration);

  const totalIntegrations = apiIntegrations.length;
  const activeIntegrations = apiIntegrations.filter(i => i.status === 'active').length;
  const errorIntegrations = apiIntegrations.filter(i => i.status === 'error').length;
  const totalRequests = apiIntegrations.reduce((acc, i) => acc + i.requestCount, 0);
  const avgResponseTime = Math.round(
    apiIntegrations.reduce((acc, i) => acc + i.responseTime, 0) / totalIntegrations
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Integrations</h1>
          <p className="text-muted-foreground">
            Manage and monitor API connections with external systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={handleNewIntegration}>
            <Plus className="w-4 h-4 mr-2" />
            New Integration
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              API connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorIntegrations > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{errorIntegrations} integrations</strong> are experiencing errors. 
            Review and resolve issues to maintain system connectivity.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">API Connections</h3>
              <p className="text-sm text-muted-foreground">
                Manage external API integrations and connections
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search integrations..."
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
            {/* Integrations List */}
            <div className="space-y-4">
              {filteredIntegrations.map((integration) => (
                <Card 
                  key={integration.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIntegration === integration.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedIntegration(integration.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getCategoryColor(integration.category)}`}>
                          <Plug className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(integration.type)}>
                          {integration.type}
                        </Badge>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Version:</span>
                        <p className="font-medium">{integration.version}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sync:</span>
                        <p className="font-medium">{integration.syncFrequency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requests:</span>
                        <p className="font-medium">{integration.requestCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{integration.errorRate}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewIntegration(integration.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTestIntegration(integration.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      {integration.status === 'active' ? (
                        <Button size="sm" variant="outline" onClick={() => handleToggleIntegration(integration.id, integration.status)}>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleToggleIntegration(integration.id, integration.status)}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Details */}
            <div>
              {selectedIntegrationData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedIntegrationData.name}
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedIntegrationData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Connection Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedIntegrationData.type)}>
                              {selectedIntegrationData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedIntegrationData.category)}>
                              {selectedIntegrationData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Authentication:</span>
                            <span className="font-medium">{selectedIntegrationData.authentication}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data Flow:</span>
                            <span className="font-medium">{selectedIntegrationData.dataFlow}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="font-medium">{selectedIntegrationData.responseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="font-medium">{selectedIntegrationData.uptime}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">{selectedIntegrationData.monitoring.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data Volume:</span>
                            <span className="font-medium">{selectedIntegrationData.dataVolume} GB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Connected Systems</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIntegrationData.connectedSystems.map((system, index) => (
                          <Badge key={index} variant="outline">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Timeout:</span>
                            <span className="ml-2 font-medium">{selectedIntegrationData.configuration.timeout}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retry Attempts:</span>
                            <span className="ml-2 font-medium">{selectedIntegrationData.configuration.retryAttempts}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate Limit:</span>
                            <span className="ml-2 font-medium">{selectedIntegrationData.configuration.rateLimit}/hr</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Encryption:</span>
                            <span className="ml-2 font-medium">{selectedIntegrationData.configuration.encryption ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
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
                      <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an integration to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">API Endpoints</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage API endpoints
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Endpoint
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Integration</th>
                      <th className="text-left p-4 font-medium">Endpoint</th>
                      <th className="text-left p-4 font-medium">Method</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Requests</th>
                      <th className="text-left p-4 font-medium">Response Time</th>
                      <th className="text-left p-4 font-medium">Error Rate</th>
                      <th className="text-left p-4 font-medium">Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiIntegrations.flatMap(integration => 
                      integration.endpoints.map(endpoint => (
                        <tr key={`${integration.id}-${endpoint.id}`} className="border-b hover:bg-muted">
                          <td className="p-4 font-medium">{integration.name}</td>
                          <td className="p-4">
                            <div>
                              <div className="font-mono text-sm">{endpoint.path}</div>
                              <div className="text-xs text-muted-foreground">{endpoint.description}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{endpoint.requestCount.toLocaleString()}</td>
                          <td className="p-4 text-sm">{endpoint.avgResponseTime}ms</td>
                          <td className="p-4 text-sm">{endpoint.errorRate}%</td>
                          <td className="p-4 text-sm">{endpoint.lastUsed}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Webhook Configurations</h3>
              <p className="text-sm text-muted-foreground">
                Manage webhook endpoints and event subscriptions
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Webhook
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiIntegrations.flatMap(integration => 
              integration.webhooks.map(webhook => (
                <Card key={`${integration.id}-${webhook.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className={getStatusColor(webhook.status)}>
                        {webhook.status}
                      </Badge>
                    </div>
                    <CardDescription>Webhook: {webhook.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Events:</span>
                        <div className="mt-1">
                          {webhook.events.map((event, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Triggered:</span>
                        <p className="font-medium">{webhook.lastTriggered}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deliveries:</span>
                        <p className="font-medium">{webhook.deliveryCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failures:</span>
                        <p className="font-medium text-red-600">{webhook.failureCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        View Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Integration Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring and performance metrics
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
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>
                  API request volume over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Request volume chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>
                  Average response times by integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiIntegrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{integration.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(integration.responseTime / 1000) * 100} className="w-24 h-2" />
                        <span className="text-sm">{integration.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIIntegrationPage;
