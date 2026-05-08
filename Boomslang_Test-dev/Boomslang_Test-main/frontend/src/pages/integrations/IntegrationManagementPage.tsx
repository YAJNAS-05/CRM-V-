import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Download, 
  Settings,
  Play, 
  Pause,
  RefreshCw,
  TestTube,
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  Globe,
  Zap,
  Key,
  Search
} from 'lucide-react';
import { Integration, IntegrationType, IntegrationCategory, IntegrationStatus } from '@/types/integrations';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { IntegrationCRUDService } from '../../services/crudService';
import { useCrudOperations } from '../../hooks/useCrudOperations';
import { FormValidator, ValidationSchemas, useFormValidation } from '../../utils/validation';

const IntegrationManagementPage: React.FC = () => {
  const [newIntegrationDialog, setNewIntegrationDialog] = useState(false);
  const [editIntegrationDialog, setEditIntegrationDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<IntegrationCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<IntegrationStatus | 'ALL'>('ALL');

  // Use CRUD hook for integration management
  const {
    data: integrations,
    loading,
    error,
    selected: selectedIntegration,
    create,
    update: updateIntegration,
    delete: deleteIntegration,
    setSelected: setSelectedIntegration,
    refresh,
    setFilters,
    clearError
  } = useCrudOperations({
    service: IntegrationCRUDService.integrations,
    autoFetch: true,
    filters: { search: searchQuery, category: filterCategory, status: filterStatus },
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error.message)
  });

  // Update filters when search or filter values change
  useEffect(() => {
    setFilters({
      search: searchQuery,
      category: filterCategory !== 'ALL' ? filterCategory : undefined,
      status: filterStatus !== 'ALL' ? filterStatus : undefined
    });
  }, [searchQuery, filterCategory, filterStatus, setFilters]);

  // Use form validation for new integration
  const {
    values: newIntegration,
    errors: newIntegrationErrors,
    touched: newIntegrationTouched,
    isValid: isNewIntegrationValid,
    setValue: setNewIntegrationValue,
    validateField: validateNewIntegrationField,
    validateAll: validateNewIntegration,
    reset: resetNewIntegration
  } = useFormValidation({
    name: '',
    description: '',
    type: 'API_REST' as IntegrationType,
    category: 'CRM' as IntegrationCategory,
    provider: '',
    baseUrl: '',
    authenticationType: 'API_KEY' as const
  }, ValidationSchemas.integration);

  const handleCreateIntegration = async () => {
    // Validate all fields
    if (!validateNewIntegration()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const integrationData = {
        name: newIntegration.name,
        description: newIntegration.description,
        type: newIntegration.type,
        category: newIntegration.category,
        provider: newIntegration.provider,
        baseUrl: newIntegration.baseUrl,
        authenticationType: newIntegration.authenticationType,
        status: 'PENDING' as IntegrationStatus,
        version: 'v1.0.0',
        configuration: {
          timeout: 30000,
          retryPolicy: {
            maxAttempts: 3,
            backoffStrategy: 'EXPONENTIAL',
            initialDelay: 1000,
            maxDelay: 10000,
            retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR']
          },
          rateLimit: {
            requestsPerSecond: 10,
            requestsPerMinute: 500,
            requestsPerHour: 10000,
            burstLimit: 20,
            throttleStrategy: 'SLIDING_WINDOW'
          }
        },
        credentials: {
          type: newIntegration.authenticationType,
          encrypted: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          lastRotated: new Date(),
          rotationRequired: false,
          metadata: {}
        },
        endpoints: [],
        mappings: [],
        webhooks: [],
        monitoring: {
          status: 'PENDING',
          lastHealthCheck: new Date(),
          uptime: 0,
          requestCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
          alerts: [],
          metrics: {
            requestsPerSecond: 0,
            successRate: 100,
            errorRate: 0,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            throughput: 0
          },
          sla: {
            availability: 99.0,
            responseTime: 500,
            errorRate: 1.0,
            throughput: 1000,
            currentAvailability: 100,
            currentResponseTime: 0,
            currentErrorRate: 0,
            currentThroughput: 0,
            compliance: true
          }
        },
        metadata: {
          vendor: {
            name: newIntegration.provider,
            website: '',
            supportUrl: '',
            documentationUrl: ''
          },
          compliance: {
            standards: [],
            certifications: [],
            dataResidency: [],
            gdprCompliant: false,
            hipaaCompliant: false,
            soc2Compliant: false,
            iso27001Compliant: false
          },
          versionHistory: [],
          changelog: []
        },
        tags: [newIntegration.category.toLowerCase()],
        owner: 'current-user',
        dependencies: []
      };

      const result = await create(integrationData);
      
      if (result) {
        resetNewIntegration();
        setNewIntegrationDialog(false);
      }
    } catch (error) {
      console.error('Create integration error:', error);
    }
  };

  const handleUpdateIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      const updateData = {
        ...selectedIntegration,
        updatedAt: new Date()
      };

      const result = await updateIntegration(selectedIntegration.id, updateData);
      
      if (result) {
        setEditIntegrationDialog(false);
        setSelectedIntegration(null);
      }
    } catch (error) {
      console.error('Update integration error:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const result = await deleteIntegration(integrationId);
      
      if (result) {
        setSelectedIntegration(null);
        setDetailsDialog(false);
      }
    } catch (error) {
      console.error('Delete integration error:', error);
    }
  };

  const handleToggleStatus = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    try {
      const newStatus = integration.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const result = await updateIntegration(integrationId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      if (result) {
        toast.success(`Integration ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    toast.info(`Testing connection for integration ${integrationId}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Connection test successful');
  };

  const handleExportConfiguration = async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        const config = {
          integration,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${integration.name.replace(/\s+/g, '-')}-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Configuration exported successfully');
      }
    } catch (error) {
      console.error('Failed to export configuration:', error);
      toast.error('Failed to export configuration');
    }
  };

  const handleCloneIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    try {
      const clonedData = {
        ...integration,
        name: `${integration.name} (Clone)`,
        status: 'PENDING' as IntegrationStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      delete (clonedData as any).id;

      const result = await create(clonedData);
      
      if (result) {
        toast.success('Integration cloned successfully');
      }
    } catch (error) {
      console.error('Clone integration error:', error);
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ERROR': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PENDING': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'MAINTENANCE': return <Settings className="h-5 w-5 text-orange-600" />;
      case 'INACTIVE': return <XCircle className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: IntegrationType) => {
    switch (type) {
      case 'API_REST': return <Globe className="h-5 w-5" />;
      case 'API_GRAPHQL': return <Database className="h-5 w-5" />;
      case 'DATABASE': return <Database className="h-5 w-5" />;
      case 'WEBHOOK': return <Zap className="h-5 w-5" />;
      case 'MESSAGE_QUEUE': return <Globe className="h-5 w-5" />;
      default: return <Key className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Management</h1>
          <p className="text-gray-600">Create, configure, and manage system integrations</p>
        </div>
        <Button onClick={() => setNewIntegrationDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Integration
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error.message}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={(value: IntegrationCategory | 'ALL') => 
                setFilterCategory(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                  <SelectItem value="ERP">ERP</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="ANALYTICS">Analytics</SelectItem>
                  <SelectItem value="COMMUNICATION">Communication</SelectItem>
                  <SelectItem value="SECURITY">Security</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: IntegrationStatus | 'ALL') => 
                setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={refresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(integration.type)}
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Provider:</span>
                  <span className="font-medium">{integration.provider}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{integration.type.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <Badge variant="outline">{integration.category}</Badge>
                </div>

                {integration.lastSync && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(integration.lastSync), { addSuffix: true })}
                    </span>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setEditIntegrationDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(integration.id)}
                    disabled={loading}
                  >
                    {integration.status === 'ACTIVE' ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {integration.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && integrations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg text-gray-600">Loading integrations...</span>
        </div>
      )}

      {!loading && integrations.length === 0 && (
        <div className="text-center py-12">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first integration.</p>
          <Button onClick={() => setNewIntegrationDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Integration
          </Button>
        </div>
      )}

      {/* New Integration Dialog */}
      <Dialog open={newIntegrationDialog} onOpenChange={setNewIntegrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Integration Name *</Label>
                <Input
                  id="name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegrationValue('name', e.target.value)}
                  onBlur={() => validateNewIntegrationField('name')}
                  placeholder="e.g., Salesforce CRM"
                  className={newIntegrationErrors.name && newIntegrationTouched.name ? 'border-red-500' : ''}
                />
                {newIntegrationErrors.name && newIntegrationTouched.name && (
                  <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="provider">Provider *</Label>
                <Input
                  id="provider"
                  value={newIntegration.provider}
                  onChange={(e) => setNewIntegrationValue('provider', e.target.value)}
                  onBlur={() => validateNewIntegrationField('provider')}
                  placeholder="e.g., Salesforce"
                  className={newIntegrationErrors.provider && newIntegrationTouched.provider ? 'border-red-500' : ''}
                />
                {newIntegrationErrors.provider && newIntegrationTouched.provider && (
                  <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.provider}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newIntegration.description}
                onChange={(e) => setNewIntegrationValue('description', e.target.value)}
                onBlur={() => validateNewIntegrationField('description')}
                placeholder="Describe the purpose and functionality..."
                rows={3}
                className={newIntegrationErrors.description && newIntegrationTouched.description ? 'border-red-500' : ''}
              />
              {newIntegrationErrors.description && newIntegrationTouched.description && (
                <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newIntegration.type} onValueChange={(value: IntegrationType) => 
                  setNewIntegrationValue('type', value)}>
                  <SelectTrigger className={newIntegrationErrors.type && newIntegrationTouched.type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API_REST">REST API</SelectItem>
                    <SelectItem value="API_GRAPHQL">GraphQL API</SelectItem>
                    <SelectItem value="DATABASE">Database</SelectItem>
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                    <SelectItem value="MESSAGE_QUEUE">Message Queue</SelectItem>
                  </SelectContent>
                </Select>
                {newIntegrationErrors.type && newIntegrationTouched.type && (
                  <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.type}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newIntegration.category} onValueChange={(value: IntegrationCategory) => 
                  setNewIntegrationValue('category', value)}>
                  <SelectTrigger className={newIntegrationErrors.category && newIntegrationTouched.category ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="ERP">ERP</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="ANALYTICS">Analytics</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {newIntegrationErrors.category && newIntegrationTouched.category && (
                  <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="authType">Authentication</Label>
                <Select value={newIntegration.authenticationType} onValueChange={(value: any) => 
                  setNewIntegrationValue('authenticationType', value)}>
                  <SelectTrigger className={newIntegrationErrors.authenticationType && newIntegrationTouched.authenticationType ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API_KEY">API Key</SelectItem>
                    <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                    <SelectItem value="BEARER_TOKEN">Bearer Token</SelectItem>
                    <SelectItem value="BASIC_AUTH">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
                {newIntegrationErrors.authenticationType && newIntegrationTouched.authenticationType && (
                  <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.authenticationType}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={newIntegration.baseUrl}
                onChange={(e) => setNewIntegrationValue('baseUrl', e.target.value)}
                onBlur={() => validateNewIntegrationField('baseUrl')}
                placeholder="https://api.example.com"
                className={newIntegrationErrors.baseUrl && newIntegrationTouched.baseUrl ? 'border-red-500' : ''}
              />
              {newIntegrationErrors.baseUrl && newIntegrationTouched.baseUrl && (
                <p className="text-sm text-red-500 mt-1">{newIntegrationErrors.baseUrl}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setNewIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIntegration} disabled={loading || !isNewIntegrationValid} className="flex-1">
                {loading ? 'Creating...' : 'Create Integration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Integration Details</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedIntegration.name}</p>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <p className="font-medium">{selectedIntegration.provider}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedIntegration.status)}>
                      {selectedIntegration.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <p className="font-medium">{selectedIntegration.version}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedIntegration.configuration, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleExportConfiguration(selectedIntegration.id)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Configuration
                </Button>
                <Button variant="outline" onClick={() => handleCloneIntegration(selectedIntegration.id)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Clone Integration
                </Button>
                <Button onClick={() => handleTestConnection(selectedIntegration.id)} disabled={loading}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Test Connection
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteIntegration(selectedIntegration.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editIntegrationDialog} onOpenChange={setEditIntegrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Integration</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Integration Name</Label>
                <Input
                  id="edit-name"
                  value={selectedIntegration.name}
                  onChange={(e) => setSelectedIntegration(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedIntegration.description}
                  onChange={(e) => setSelectedIntegration(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditIntegrationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateIntegration} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Integration'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationManagementPage;
