import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plug, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Plus,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Database,
  Globe,
  Shield,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { Integration, IntegrationStatus, IntegrationCategory } from '@/types/integrations';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { integrationApi } from '../../api/integrationApi';

const IntegrationDashboardPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadIntegrations = async () => {
      setLoading(true);
      try {
        const integrationsData = await integrationApi.getIntegrations();
        if (integrationsData) {
          setIntegrations(integrationsData);
        }
      } catch (error) {
        console.error('Failed to load integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  const handleRefreshIntegrations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Integrations refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Connection test successful');
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIntegrations(integrations.map(integration => 
        integration.id === integrationId 
          ? { ...integration, lastSync: new Date(), nextSync: new Date(Date.now() + 60 * 60 * 1000) }
          : integration
      ));
      toast.success('Integration sync completed');
    } catch (error) {
      toast.error('Integration sync failed');
    } finally {
      setLoading(false);
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

  const getCategoryIcon = (category: IntegrationCategory) => {
    switch (category) {
      case 'CRM': return <Database className="h-5 w-5" />;
      case 'COMMUNICATION': return <Globe className="h-5 w-5" />;
      case 'FINANCE': return <BarChart3 className="h-5 w-5" />;
      case 'SECURITY': return <Shield className="h-5 w-5" />;
      default: return <Plug className="h-5 w-5" />;
    }
  };

  const getMonitoringStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'ALL' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || integration.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE');
  const errorIntegrations = integrations.filter(i => i.status === 'ERROR');
  const totalRequests = integrations.reduce((sum, i) => sum + i.monitoring.metrics.requestsPerSecond, 0);
  const averageUptime = integrations.reduce((sum, i) => sum + i.monitoring.uptime, 0) / integrations.length;

  const handleAddIntegration = () => {
    toast.info('Add Integration functionality coming soon!');
    // TODO: Implement add integration modal or navigation
  };

  const handleViewIssues = () => {
    toast.info(`Viewing ${errorIntegrations.length} integration issues`);
    setFilterStatus('ERROR');
    // TODO: Implement detailed issues view
  };

  const handleViewDetails = (integrationId: string) => {
    toast.info(`Viewing details for integration ${integrationId}`);
    // TODO: Implement integration details view
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all system integrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshIntegrations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddIntegration}>
            <Plus className="h-4 w-4 mr-1" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {errorIntegrations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                CRITICAL: {errorIntegrations.length} integration(s) require attention
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-800" onClick={handleViewIssues}>
              View Issues
            </Button>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Plug className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{integrations.length}</p>
                <p className="text-sm text-gray-600">Total Integrations</p>
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
                <p className="text-2xl font-bold">{activeIntegrations.length}</p>
                <p className="text-sm text-gray-600">Active</p>
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
                <p className="text-2xl font-bold">{errorIntegrations.length}</p>
                <p className="text-sm text-gray-600">Errors</p>
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
                <p className="text-2xl font-bold">{averageUptime.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Uptime</p>
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
                placeholder="Search integrations by name, provider, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <option value="ALL">All Categories</option>
                <option value="CRM">CRM</option>
                <option value="ERP">ERP</option>
                <option value="FINANCE">Finance</option>
                <option value="HR">HR</option>
                <option value="MARKETING">Marketing</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="ANALYTICS">Analytics</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ERROR">Error</option>
                <option value="PENDING">Pending</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <Plug className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No integrations found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredIntegrations.map(integration => (
            <Card key={integration.id} className={
              integration.status === 'ERROR' ? 'border-red-200' : 
              integration.status === 'PENDING' ? 'border-yellow-200' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      integration.status === 'ACTIVE' ? 'bg-green-100' : 
                      integration.status === 'ERROR' ? 'bg-red-100' : 
                      integration.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {getCategoryIcon(integration.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Badge variant="outline">{integration.category}</Badge>
                      <Badge variant="outline">{integration.type.replace(/_/g, ' ')}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">{integration.version}</span>
                  </div>

                  {/* Monitoring Status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">System Health</span>
                      <span className={`text-sm font-medium ${getMonitoringStatusColor(integration.monitoring.status)}`}>
                        {integration.monitoring.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium">{integration.monitoring.uptime.toFixed(1)}%</p>
                        <p className="text-gray-600">Uptime</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{integration.monitoring.metrics.successRate.toFixed(1)}%</p>
                        <p className="text-gray-600">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{integration.monitoring.metrics.averageResponseTime}ms</p>
                        <p className="text-gray-600">Avg Response</p>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {integration.monitoring.alerts.filter(a => !a.acknowledged).length > 0 && (
                    <div className="p-2 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          {integration.monitoring.alerts.filter(a => !a.acknowledged).length} Active Alert(s)
                        </span>
                      </div>
                      <div className="text-xs text-red-700">
                        {integration.monitoring.alerts.filter(a => !a.acknowledged)[0]?.message}
                      </div>
                    </div>
                  )}

                  {/* Sync Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Last sync: {integration.lastSync ? formatDistanceToNow(integration.lastSync, { addSuffix: true }) : 'Never'}
                    </span>
                    <span>
                      Next sync: {integration.nextSync ? formatDistanceToNow(integration.nextSync, { addSuffix: true }) : 'Not scheduled'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(integration.id)}
                      disabled={loading}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncIntegration(integration.id)}
                      disabled={loading || integration.status !== 'ACTIVE'}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default IntegrationDashboardPage;
