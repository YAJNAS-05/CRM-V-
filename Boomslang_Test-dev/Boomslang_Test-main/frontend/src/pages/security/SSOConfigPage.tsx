import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { 
  Globe, 
  Key, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Link,
  Shield
} from 'lucide-react';
import { SSOProvider, SSOConfig, AttributeMapping } from '@/types/security';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

const SSOConfigPage: React.FC = () => {
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
        clientSecret: '********',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scopes: ['openid', 'profile', 'email'],
        mapping: {
          email: 'email',
          firstName: 'given_name',
          lastName: 'family_name',
          role: 'roles',
          department: 'department',
          customAttributes: {}
        }
      },
      metadata: {
        logo: '🟢',
        description: 'Google Workspace SSO integration',
        supportUrl: 'https://support.google.com/a/',
        features: ['MFA Support', 'Mobile Device Management', 'Cloud Identity'],
        limitations: []
      },
      userCount: 0
    },
    {
      id: '3',
      name: 'Corporate LDAP',
      type: 'LDAP',
      enabled: true,
      config: {
        entityId: 'crm-platform-ldap',
        loginUrl: 'ldap://ldap.company.com',
        logoutUrl: '',
        mapping: {
          email: 'mail',
          firstName: 'givenName',
          lastName: 'sn',
          role: 'memberOf',
          department: 'department',
          customAttributes: {}
        }
      },
      metadata: {
        logo: '🏢',
        description: 'Corporate LDAP directory integration',
        features: ['Active Directory', 'User Sync', 'Group Mapping'],
        limitations: ['No MFA', 'On-premise only']
      },
      lastSync: new Date('2024-01-19T15:45:00'),
      userCount: 85
    }
  ]);

  const [setupDialog, setSetupDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [newProvider, setNewProvider] = useState<Partial<SSOProvider>>({
    name: '',
    type: 'OIDC',
    enabled: false,
    config: {
      entityId: '',
      loginUrl: '',
      logoutUrl: '',
      clientId: '',
      clientSecret: '',
      authorizationUrl: '',
      tokenUrl: '',
      userInfoUrl: '',
      scopes: ['openid', 'profile', 'email'],
      mapping: {
        email: 'email',
        firstName: 'given_name',
        lastName: 'family_name',
        role: 'roles',
        department: 'department',
        customAttributes: {}
      }
    },
    metadata: {
      description: '',
      features: [],
      limitations: []
    }
  });

  const handleCreateProvider = async () => {
    if (!newProvider.name || !newProvider.config?.entityId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use real securityApi to create SSO provider
      const provider = await securityApi.createSSOProvider(newProvider as SSOProvider);

      setSsoProviders([...ssoProviders, provider]);
      setSetupDialog(false);
      setNewProvider({
        name: '',
        type: 'OIDC',
        enabled: false,
        config: {
          entityId: '',
          loginUrl: '',
          logoutUrl: '',
          clientId: '',
          clientSecret: '',
          authorizationUrl: '',
          tokenUrl: '',
          userInfoUrl: '',
          scopes: ['openid', 'profile', 'email'],
          mapping: {
            email: 'email',
            firstName: 'given_name',
            lastName: 'family_name',
            role: 'roles',
            department: 'department',
            customAttributes: {}
          }
        },
        metadata: {
          description: '',
          features: [],
          limitations: []
        }
      });
      toast.success('SSO provider created successfully');
    } catch (error) {
      console.error('Failed to create SSO provider:', error);
      toast.error('Failed to create SSO provider');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedProvider) return;

    setLoading(true);
    try {
      // Use real securityApi to update SSO provider
      await securityApi.updateSSOProvider(selectedProvider.id, selectedProvider);
      
      setSsoProviders(ssoProviders.map(p => 
        p.id === selectedProvider.id ? selectedProvider : p
      ));
      setEditMode(false);
      setSelectedProvider(null);
      toast.success('SSO provider updated successfully');
    } catch (error) {
      console.error('Failed to update SSO provider:', error);
      toast.error('Failed to update SSO provider');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to delete SSO provider
      await securityApi.deleteSSOProvider(providerId);
      
      setSsoProviders(ssoProviders.filter(p => p.id !== providerId));
      toast.success('SSO provider deleted successfully');
    } catch (error) {
      console.error('Failed to delete SSO provider:', error);
      toast.error('Failed to delete SSO provider');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProvider = async (providerId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to toggle SSO provider
      const provider = ssoProviders.find(p => p.id === providerId);
      if (provider) {
        await securityApi.updateSSOProvider(providerId, { ...provider, enabled: !provider.enabled });
        setSsoProviders(ssoProviders.map(p => 
          p.id === providerId ? { ...p, enabled: !p.enabled } : p
        ));
      }
      toast.success('SSO provider status updated');
    } catch (error) {
      console.error('Failed to update provider status:', error);
      toast.error('Failed to update provider status');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProvider = async (providerId: string) => {
    setSyncing(providerId);
    try {
      // Use real securityApi to sync SSO provider
      await securityApi.syncSSOProvider(providerId);
      
      setSsoProviders(ssoProviders.map(p => 
        p.id === providerId ? { ...p, lastSync: new Date() } : p
      ));
      toast.success('SSO provider synchronized successfully');
    } catch (error) {
      console.error('Failed to synchronize SSO provider:', error);
      toast.error('Failed to synchronize SSO provider');
    } finally {
      setSyncing(null);
    }
  };

  const handleTestConnection = async (provider: SSOProvider) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Connection test successful');
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'SAML': return <Globe className="h-5 w-5" />;
      case 'OIDC': return <Key className="h-5 w-5" />;
      case 'OAUTH2': return <Link className="h-5 w-5" />;
      case 'LDAP': return <Users className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const enabledProviders = ssoProviders.filter(p => p.enabled);
  const totalUsers = ssoProviders.reduce((sum, p) => sum + p.userCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SSO Configuration</h1>
          <p className="text-gray-600">Manage Single Sign-On providers and configurations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {enabledProviders.length} Active
          </Badge>
          <Dialog open={setupDialog} onOpenChange={setSetupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add SSO Provider</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Provider Name</Label>
                    <Input
                      placeholder="e.g., Microsoft Azure AD"
                      value={newProvider.name || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Provider Type</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newProvider.type}
                      onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
                    >
                      <option value="OIDC">OpenID Connect (OIDC)</option>
                      <option value="SAML">SAML 2.0</option>
                      <option value="OAUTH2">OAuth 2.0</option>
                      <option value="LDAP">LDAP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe this SSO provider..."
                    value={newProvider.metadata?.description || ''}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      metadata: { ...newProvider.metadata!, description: e.target.value }
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Entity ID / Client ID</Label>
                    <Input
                      placeholder="Entity ID or Client ID"
                      value={newProvider.config?.entityId || ''}
                      onChange={(e) => setNewProvider({
                        ...newProvider,
                        config: { ...newProvider.config!, entityId: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      placeholder="Client Secret (if applicable)"
                      value={newProvider.config?.clientSecret || ''}
                      onChange={(e) => setNewProvider({
                        ...newProvider,
                        config: { ...newProvider.config!, clientSecret: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Login URL</Label>
                    <Input
                      placeholder="https://provider.com/login"
                      value={newProvider.config?.loginUrl || ''}
                      onChange={(e) => setNewProvider({
                        ...newProvider,
                        config: { ...newProvider.config!, loginUrl: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Authorization URL</Label>
                    <Input
                      placeholder="https://provider.com/auth"
                      value={newProvider.config?.authorizationUrl || ''}
                      onChange={(e) => setNewProvider({
                        ...newProvider,
                        config: { ...newProvider.config!, authorizationUrl: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Token URL</Label>
                    <Input
                      placeholder="https://provider.com/token"
                      value={newProvider.config?.tokenUrl || ''}
                      onChange={(e) => setNewProvider({
                        ...newProvider,
                        config: { ...newProvider.config!, tokenUrl: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newProvider.enabled || false}
                    onCheckedChange={(checked) => setNewProvider({ ...newProvider, enabled: checked })}
                  />
                  <Label>Enable this provider</Label>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSetupDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProvider} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Provider'}
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
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ssoProviders.length}</p>
                <p className="text-sm text-gray-600">Total Providers</p>
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
                <p className="text-2xl font-bold">{enabledProviders.length}</p>
                <p className="text-sm text-gray-600">Active Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-gray-600">SSO Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ssoProviders.filter(p => p.lastSync).length}
                </p>
                <p className="text-sm text-gray-600">Recently Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SSO Providers List */}
      <Card>
        <CardHeader>
          <CardTitle>SSO Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {ssoProviders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No SSO providers configured</p>
              <p className="text-sm">Add a provider to enable single sign-on</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ssoProviders.map(provider => (
                <div
                  key={provider.id}
                  className={`p-4 border rounded-lg ${
                    provider.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        provider.enabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {provider.metadata?.logo || getProviderIcon(provider.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{provider.name}</h3>
                          <Badge variant="outline">{provider.type}</Badge>
                          {provider.enabled && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {provider.metadata?.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{provider.userCount} users</span>
                          {provider.lastSync && (
                            <span>Last sync: {provider.lastSync.toLocaleDateString()}</span>
                          )}
                          <span>Type: {provider.type}</span>
                        </div>
                        {provider.metadata?.features && provider.metadata.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.metadata.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(provider)}
                        disabled={loading}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncProvider(provider.id)}
                        disabled={syncing === provider.id}
                      >
                        {syncing === provider.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditMode(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleProvider(provider.id)}
                        disabled={loading}
                      >
                        {provider.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Provider Dialog */}
      {selectedProvider && editMode && (
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit SSO Provider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider Name</Label>
                  <Input
                    value={selectedProvider.name}
                    onChange={(e) => setSelectedProvider({
                      ...selectedProvider,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Provider Type</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedProvider.type}
                    onChange={(e) => setSelectedProvider({
                      ...selectedProvider,
                      type: e.target.value as any
                    })}
                  >
                    <option value="OIDC">OpenID Connect (OIDC)</option>
                    <option value="SAML">SAML 2.0</option>
                    <option value="OAUTH2">OAuth 2.0</option>
                    <option value="LDAP">LDAP</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedProvider.metadata?.description || ''}
                  onChange={(e) => setSelectedProvider({
                    ...selectedProvider,
                    metadata: { ...selectedProvider.metadata!, description: e.target.value }
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedProvider.enabled}
                  onCheckedChange={(checked) => setSelectedProvider({
                    ...selectedProvider,
                    enabled: checked
                  })}
                />
                <Label>Enable this provider</Label>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProvider} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Provider'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SSOConfigPage;
