import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Play, 
  Pause,
  RefreshCw,
  TestTube,
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  Key,
  Activity,
  Calendar,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { Webhook as WebhookType, RetryPolicy, WebhookDeliveryStatus } from '@/types/integrations';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { integrationApi } from '../../api/integrationApi';
import { IntegrationCRUDService } from '../../services/crudService';
import { useCrudOperations } from '../../hooks/useCrudOperations';
import { FormValidator, ValidationSchemas, useFormValidation } from '../../utils/validation';

const WebhookManagementPage: React.FC = () => {
  const [newWebhookDialog, setNewWebhookDialog] = useState(false);
  const [editWebhookDialog, setEditWebhookDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [testDialog, setTestDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Use CRUD hook for webhook management
  const {
    data: webhooks,
    loading,
    error,
    selected: selectedWebhook,
    create,
    update: updateWebhook,
    delete: deleteWebhook,
    setSelected: setSelectedWebhook,
    refresh,
    clearError
  } = useCrudOperations({
    service: IntegrationCRUDService.webhooks,
    autoFetch: true,
    filters: { search: searchQuery, status: filterStatus },
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error.message)
  });
  
  // Use form validation for new webhook
  const {
    values: newWebhook,
    errors: newWebhookErrors,
    touched: newWebhookTouched,
    isValid: isNewWebhookValid,
    setValue: setNewWebhookValue,
    validateField: validateNewWebhookField,
    validateAll: validateNewWebhook,
    reset: resetNewWebhook
  } = useFormValidation({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    active: true,
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'EXPONENTIAL' as const,
      initialDelay: 1000,
      maxDelay: 10000,
      retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR', 'SERVER_ERROR']
    },
    headers: {}
  }, ValidationSchemas.webhook);

  const [testPayload, setTestPayload] = useState({
    event: 'user.created',
    data: {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      timestamp: new Date().toISOString()
    }
  });

  const [editWebhook, setEditWebhook] = useState<WebhookType | null>(null);

  const availableEvents = [
    'user.created',
    'user.updated',
    'user.deleted',
    'deal.created',
    'deal.won',
    'deal.lost',
    'lead.created',
    'lead.assigned',
    'task.completed',
    'task.created',
    'project.milestone',
    'budget.exceeded',
    'support.ticket.created',
    'support.ticket.resolved',
    'opportunity.stage.changed',
    'customer.churn.risk',
    'page.view',
    'user.login',
    'feature.usage'
  ];

  const handleCreateWebhook = async () => {
    // Validate all fields
    if (!validateNewWebhook()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      const webhookData = {
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        secret: newWebhook.secret || `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        active: newWebhook.active,
        retryPolicy: newWebhook.retryPolicy,
        lastTriggered: undefined,
        deliveryStatus: {
          totalDelivered: 0,
          totalFailed: 0,
          averageDeliveryTime: 0
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CRM-Webhook/1.0'
        }
      };

      const result = await create(webhookData);
      
      if (result) {
        resetNewWebhook();
        setNewWebhookDialog(false);
      }
    } catch (error) {
      // Error is already handled by the CRUD hook
      console.error('Create webhook error:', error);
    }
  };

  const handleUpdateWebhook = async () => {
    if (!selectedWebhook) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWebhooks(webhooks.map(webhook => 
        webhook.id === selectedWebhook.id 
          ? selectedWebhook
          : webhook
      ));
      setEditWebhookDialog(false);
      toast.success('Webhook updated successfully');
    } catch (error) {
      toast.error('Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const result = await deleteWebhook(webhookId);
      
      if (result) {
        setSelectedWebhook(null);
        setDetailsDialog(false);
      }
    } catch (error) {
      // Error is already handled by the CRUD hook
      console.error('Delete webhook error:', error);
    }
  };

  const handleToggleWebhook = async (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    try {
      const result = await updateWebhook(webhookId, { 
        active: !webhook.active,
        updatedAt: new Date()
      });
      
      if (result) {
        toast.success(`Webhook ${!webhook.active ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      // Error is already handled by the CRUD hook
      console.error('Toggle webhook error:', error);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setWebhooks(webhooks.map(webhook => 
        webhook.id === webhookId 
          ? { 
              ...webhook, 
              lastTriggered: new Date(),
              deliveryStatus: {
                ...webhook.deliveryStatus,
                totalDelivered: webhook.deliveryStatus.totalDelivered + 1,
                lastDelivery: new Date()
              }
            }
          : webhook
      ));
      toast.success('Test webhook sent successfully');
      setTestDialog(false);
    } catch (error) {
      toast.error('Failed to send test webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSecret = async (webhookId: string) => {
    if (!confirm('Are you sure you want to regenerate the webhook secret? This will invalidate the current secret.')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      setWebhooks(webhooks.map(webhook => 
        webhook.id === webhookId 
          ? { ...webhook, secret: newSecret }
          : webhook
      ));
      toast.success('Webhook secret regenerated successfully');
    } catch (error) {
      toast.error('Failed to regenerate webhook secret');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneWebhook = async () => {
    if (!selectedWebhook) return;

    setLoading(true);
    try {
      // Simulate API call to clone webhook
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const clonedWebhook: Webhook = {
        ...selectedWebhook,
        id: `webhook-${Date.now()}`,
        name: `${selectedWebhook.name} (Clone)`,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        deliveryStatus: {
          totalDelivered: 0,
          totalFailed: 0,
          lastDelivery: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setWebhooks([...webhooks, clonedWebhook]);
      toast.success('Webhook cloned successfully');
    } catch (error) {
      toast.error('Failed to clone webhook');
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = (deliveryStatus: WebhookDeliveryStatus) => {
    const total = deliveryStatus.totalDelivered + deliveryStatus.totalFailed;
    return total > 0 ? (deliveryStatus.totalDelivered / total * 100) : 0;
  };

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         webhook.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         webhook.events.some(event => event.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && webhook.active) ||
                         (filterStatus === 'INACTIVE' && !webhook.active);
    
    return matchesSearch && matchesStatus;
  });

  const activeWebhooks = webhooks.filter(w => w.active);
  const totalDeliveries = webhooks.reduce((sum, w) => sum + w.deliveryStatus.totalDelivered, 0);
  const totalFailures = webhooks.reduce((sum, w) => sum + w.deliveryStatus.totalFailed, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Management</h1>
          <p className="text-gray-600">Configure and manage webhook endpoints for real-time event notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={newWebhookDialog} onOpenChange={setNewWebhookDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Webhook Name</Label>
                  <Input
                    placeholder="Enter webhook name"
                    value={newWebhook.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWebhookValue('name', e.target.value)}
                    onBlur={() => validateNewWebhookField('name')}
                    className={newWebhookErrors.name && newWebhookTouched.name ? 'border-red-500' : ''}
                  />
                  {newWebhookErrors.name && newWebhookTouched.name && (
                    <p className="text-sm text-red-500 mt-1">{newWebhookErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label>Endpoint URL</Label>
                  <Input
                    placeholder="https://your-domain.com/webhook"
                    value={newWebhook.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWebhookValue('url', e.target.value)}
                    onBlur={() => validateNewWebhookField('url')}
                    className={newWebhookErrors.url && newWebhookTouched.url ? 'border-red-500' : ''}
                  />
                  {newWebhookErrors.url && newWebhookTouched.url && (
                    <p className="text-sm text-red-500 mt-1">{newWebhookErrors.url}</p>
                  )}
                </div>
                <div>
                  <Label>Events</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {availableEvents.map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          checked={newWebhook.events.includes(event)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const updatedEvents = e.target.checked 
                              ? [...newWebhook.events, event]
                              : newWebhook.events.filter(e => e !== event);
                            setNewWebhookValue('events', updatedEvents);
                            validateNewWebhookField('events');
                          }}
                          className="rounded"
                        />
                        <label htmlFor={event} className="text-sm">{event}</label>
                      </div>
                    ))}
                  </div>
                  {newWebhookErrors.events && newWebhookTouched.events && (
                    <p className="text-sm text-red-500 mt-1">{newWebhookErrors.events}</p>
                  )}
                </div>
                <div>
                  <Label>Secret (Optional)</Label>
                  <Input
                    type="password"
                    placeholder="Leave empty to auto-generate"
                    value={newWebhook.secret}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWebhookValue('secret', e.target.value)}
                    onBlur={() => validateNewWebhookField('secret')}
                    className={newWebhookErrors.secret && newWebhookTouched.secret ? 'border-red-500' : ''}
                  />
                  {newWebhookErrors.secret && newWebhookTouched.secret && (
                    <p className="text-sm text-red-500 mt-1">{newWebhookErrors.secret}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Retry Attempts</Label>
                    <Input
                      type="number"
                      value={newWebhook.retryPolicy.maxAttempts}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWebhookValue('retryPolicy', {
                        ...newWebhook.retryPolicy, 
                        maxAttempts: parseInt(e.target.value)
                      })}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label>Backoff Strategy</Label>
                    <Select 
                      value={newWebhook.retryPolicy.backoffStrategy} 
                      onValueChange={(value: any) => setNewWebhookValue('retryPolicy', {
                        ...newWebhook.retryPolicy, 
                        backoffStrategy: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LINEAR">Linear</SelectItem>
                        <SelectItem value="EXPONENTIAL">Exponential</SelectItem>
                        <SelectItem value="FIXED">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newWebhook.active}
                    onCheckedChange={(checked: boolean) => setNewWebhookValue('active', checked)}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setNewWebhookDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWebhook} disabled={loading || !isNewWebhookValid} className="flex-1">
                    {loading ? 'Creating...' : 'Create Webhook'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Webhook className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{webhooks.length}</p>
                <p className="text-sm text-gray-600">Total Webhooks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeWebhooks.length}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDeliveries}</p>
                <p className="text-sm text-gray-600">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFailures}</p>
                <p className="text-sm text-gray-600">Failed Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search webhooks by name, URL, or events..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      <div className="space-y-4">
        {filteredWebhooks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Webhook className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No webhooks found</p>
              <p className="text-sm">Create your first webhook to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredWebhooks.map(webhook => (
            <Card key={webhook.id} className={!webhook.active ? 'opacity-75' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      webhook.active ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Zap className={`h-5 w-5 ${webhook.active ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-md">{webhook.url}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={webhook.active ? 'default' : 'secondary'}>
                          {webhook.active ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.secret && (
                          <Badge variant="outline" className="text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Secured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={webhook.active}
                      onCheckedChange={() => handleToggleWebhook(webhook.id)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Events */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Events</h4>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.slice(0, 5).map((event, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                    {webhook.events.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{webhook.events.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Delivery Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      {getSuccessRate(webhook.deliveryStatus).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">
                      {webhook.deliveryStatus.totalDelivered}
                    </p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">
                      {webhook.deliveryStatus.totalFailed}
                    </p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">
                      {webhook.deliveryStatus.averageDeliveryTime}ms
                    </p>
                    <p className="text-sm text-gray-600">Avg Time</p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    Last triggered: {webhook.lastTriggered 
                      ? formatDistanceToNow(webhook.lastTriggered, { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                  <span>
                    Retry attempts: {webhook.retryPolicy.maxAttempts}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setTestDialog(true);
                    }}
                    disabled={!webhook.active}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setEditWebhookDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {webhook.secret && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateSecret(webhook.id)}
                      disabled={loading}
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Regenerate Secret
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Webhook Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Webhook Name</Label>
                  <p className="font-medium">{selectedWebhook.name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedWebhook.active ? 'default' : 'secondary'}>
                    {selectedWebhook.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label>URL</Label>
                  <p className="font-medium text-sm break-all">{selectedWebhook.url}</p>
                </div>
                <div>
                  <Label>Secret</Label>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-sm">
                      {selectedWebhook.secret ? '••••••••••••••••' : 'No secret configured'}
                    </p>
                    {selectedWebhook.secret && (
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(selectedWebhook.secret!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Events</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedWebhook.events.map((event, index) => (
                    <Badge key={index} variant="outline">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Retry Policy</Label>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Max Attempts:</span>
                    <span className="ml-2 font-medium">{selectedWebhook.retryPolicy.maxAttempts}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Backoff Strategy:</span>
                    <span className="ml-2 font-medium">{selectedWebhook.retryPolicy.backoffStrategy}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Initial Delay:</span>
                    <span className="ml-2 font-medium">{selectedWebhook.retryPolicy.initialDelay}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Delay:</span>
                    <span className="ml-2 font-medium">{selectedWebhook.retryPolicy.maxDelay}ms</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Headers</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(selectedWebhook.headers, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCloneWebhook} disabled={loading}>
                  <Copy className="h-4 w-4 mr-1" />
                  Clone Webhook
                </Button>
                <Button onClick={() => handleTestWebhook(selectedWebhook.id)} disabled={loading || !selectedWebhook.active}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Test Webhook
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div>
                <Label>Event Type</Label>
                <Select 
                  value={testPayload.event} 
                  onValueChange={(value) => setTestPayload({...testPayload, event: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedWebhook.events.map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Test Payload</Label>
                <Textarea
                  value={JSON.stringify(testPayload.data, null, 2)}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestPayload({...testPayload, data: JSON.parse(e.target.value)})
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setTestDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleTestWebhook(selectedWebhook.id)} 
                  disabled={loading || !selectedWebhook.active}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send Test Webhook'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={editWebhookDialog} onOpenChange={setEditWebhookDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div>
                <Label>Webhook Name</Label>
                <Input
                  value={selectedWebhook.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedWebhook({...selectedWebhook, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input
                  value={selectedWebhook.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedWebhook({...selectedWebhook, url: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditWebhookDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateWebhook} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Webhook'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhookManagementPage;
