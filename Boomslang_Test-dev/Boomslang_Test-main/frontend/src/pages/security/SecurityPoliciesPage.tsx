import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { 
  Shield, 
  Key, 
  Clock, 
  Users, 
  Lock,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Search,
  Filter,
  Globe,
  Database
} from 'lucide-react';
import { SecurityPolicy, PolicyCategory, PolicySettings, PolicyEnforcement } from '@/types/security';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

const SecurityPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(false);
      },
      enforcement: {
        action: 'BLOCK',
        exceptions: [],
        autoResolve: false
      },
      lastModified: new Date('2024-01-20T09:15:00'),
      modifiedBy: 'admin@company.com'
    },
    {
      id: '4',
      name: 'Access Control Policy',
      description: 'Restricts access based on IP ranges and geographic locations',
      category: 'ACCESS',
      enabled: false,
      settings: {
        allowedIpRanges: ['192.168.1.0/24', '10.0.0.0/8'],
        blockedCountries: ['CN', 'RU', 'KP']
      },
      enforcement: {
        action: 'BLOCK',
        exceptions: ['vpn-users'],
        autoResolve: false
      },
      lastModified: new Date('2024-01-10T16:45:00'),
      modifiedBy: 'security@company.com'
    },
    {
      id: '5',
      name: 'Data Protection Policy',
      description: 'Enforces encryption and data handling standards',
      category: 'DATA_PROTECTION',
      enabled: true,
      settings: {
        encryptionRequired: true,
        auditLogRetention: 365
      },
      enforcement: {
        action: 'ALERT',
        exceptions: [],
        autoResolve: true
      },
      lastModified: new Date('2024-01-12T11:30:00'),
      modifiedBy: 'compliance@company.com'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [filterCategory, setFilterCategory] = useState<PolicyCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);

  const [newPolicy, setNewPolicy] = useState<Partial<SecurityPolicy>>({
    name: '',
    description: '',
    category: 'PASSWORD',
    enabled: false,
    settings: {},
    enforcement: {
      action: 'WARN',
      exceptions: [],
      autoResolve: false
    }
  });

  const handleCreatePolicy = async () => {
    if (!newPolicy.name || !newPolicy.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use real securityApi to create policy
      const policy = await securityApi.createPolicy(newPolicy as SecurityPolicy);

      setPolicies([...policies, policy]);
      setCreateDialog(false);
      setNewPolicy({
        name: '',
        description: '',
        category: 'PASSWORD',
        enabled: false,
        settings: {},
        enforcement: {
          action: 'WARN',
          exceptions: [],
          autoResolve: false
        }
      });
      toast.success('Security policy created successfully');
    } catch (error) {
      console.error('Failed to create security policy:', error);
      toast.error('Failed to create security policy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async () => {
    if (!selectedPolicy) return;

    setLoading(true);
    try {
      // Use real securityApi to update policy
      await securityApi.updatePolicy(selectedPolicy.id, selectedPolicy);
      
      setPolicies(policies.map(p => 
        p.id === selectedPolicy.id 
          ? { ...selectedPolicy, lastModified: new Date(), modifiedBy: 'current-user' }
          : p
      ));
      setEditDialog(false);
      setSelectedPolicy(null);
      toast.success('Security policy updated successfully');
    } catch (error) {
      console.error('Failed to update security policy:', error);
      toast.error('Failed to update security policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to delete policy
      await securityApi.deletePolicy(policyId);
      
      setPolicies(policies.filter(p => p.id !== policyId));
      toast.success('Security policy deleted successfully');
    } catch (error) {
      console.error('Failed to delete security policy:', error);
      toast.error('Failed to delete security policy');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePolicy = async (policyId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to toggle policy
      const policy = policies.find(p => p.id === policyId);
      if (policy) {
        await securityApi.updatePolicy(policyId, { ...policy, enabled: !policy.enabled });
        setPolicies(policies.map(p => 
          p.id === policyId ? { ...p, enabled: !p.enabled } : p
        ));
      }
      toast.success('Policy status updated successfully');
    } catch (error) {
      console.error('Failed to update policy status:', error);
      toast.error('Failed to update policy status');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: PolicyCategory) => {
    switch (category) {
      case 'PASSWORD': return <Key className="h-5 w-5" />;
      case 'SESSION': return <Clock className="h-5 w-5" />;
      case 'MFA': return <Shield className="h-5 w-5" />;
      case 'ACCESS': return <Users className="h-5 w-5" />;
      case 'DATA_PROTECTION': return <Database className="h-5 w-5" />;
      case 'NETWORK': return <Globe className="h-5 w-5" />;
      case 'COMPLIANCE': return <Lock className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PolicyCategory) => {
    switch (category) {
      case 'PASSWORD': return 'bg-blue-100 text-blue-800';
      case 'SESSION': return 'bg-green-100 text-green-800';
      case 'MFA': return 'bg-purple-100 text-purple-800';
      case 'ACCESS': return 'bg-orange-100 text-orange-800';
      case 'DATA_PROTECTION': return 'bg-red-100 text-red-800';
      case 'NETWORK': return 'bg-gray-100 text-gray-800';
      case 'COMPLIANCE': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BLOCK': return 'bg-red-100 text-red-800';
      case 'WARN': return 'bg-yellow-100 text-yellow-800';
      case 'LOG': return 'bg-blue-100 text-blue-800';
      case 'ALERT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'ALL' || policy.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ENABLED' && policy.enabled) ||
                         (filterStatus === 'DISABLED' && !policy.enabled);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const enabledPolicies = policies.filter(p => p.enabled);
  const policiesNeedingAttention = policies.filter(p => !p.enabled && p.category !== 'NETWORK');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Policies</h1>
          <p className="text-gray-600">Configure and manage security policies across the platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export Policies
          </Button>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Security Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Policy Name</Label>
                    <Input
                      placeholder="Enter policy name"
                      value={newPolicy.name || ''}
                      onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newPolicy.category}
                      onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value as PolicyCategory })}
                    >
                      <option value="PASSWORD">Password</option>
                      <option value="SESSION">Session</option>
                      <option value="MFA">Multi-Factor Authentication</option>
                      <option value="ACCESS">Access Control</option>
                      <option value="DATA_PROTECTION">Data Protection</option>
                      <option value="NETWORK">Network</option>
                      <option value="COMPLIANCE">Compliance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the purpose and scope of this policy"
                    value={newPolicy.description || ''}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Enforcement Action</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newPolicy.enforcement?.action}
                      onChange={(e) => setNewPolicy({
                        ...newPolicy,
                        enforcement: { ...newPolicy.enforcement!, action: e.target.value as any }
                      })}
                    >
                      <option value="WARN">Warning</option>
                      <option value="BLOCK">Block</option>
                      <option value="LOG">Log Only</option>
                      <option value="ALERT">Alert</option>
                    </select>
                  </div>
                  <div>
                    <Label>Grace Period (days)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newPolicy.enforcement?.gracePeriodDays || 0}
                      onChange={(e) => setNewPolicy({
                        ...newPolicy,
                        enforcement: { ...newPolicy.enforcement!, gracePeriodDays: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newPolicy.enabled || false}
                    onCheckedChange={(checked) => setNewPolicy({ ...newPolicy, enabled: checked })}
                  />
                  <Label>Enable this policy</Label>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePolicy} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Policy'}
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
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledPolicies.length}</p>
                <p className="text-sm text-gray-600">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{policiesNeedingAttention.length}</p>
                <p className="text-sm text-gray-600">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{policies.length}</p>
                <p className="text-sm text-gray-600">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {policies.filter(p => p.enforcement.action === 'BLOCK').length}
                </p>
                <p className="text-sm text-gray-600">Blocking Policies</p>
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
                placeholder="Search policies by name or description..."
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
                <option value="PASSWORD">Password</option>
                <option value="SESSION">Session</option>
                <option value="MFA">MFA</option>
                <option value="ACCESS">Access</option>
                <option value="DATA_PROTECTION">Data Protection</option>
                <option value="NETWORK">Network</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ENABLED">Enabled</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPolicies.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No security policies found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredPolicies.map(policy => (
            <Card key={policy.id} className={policy.enabled ? 'border-green-200' : 'border-gray-200'}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      policy.enabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getCategoryIcon(policy.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(policy.category)}>
                      {policy.category.replace('_', ' ')}
                    </Badge>
                    {policy.enabled && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Badge className={getActionColor(policy.enforcement.action)}>
                          {policy.enforcement.action}
                        </Badge>
                        <span className="text-sm text-gray-600">enforcement</span>
                      </div>
                      {policy.enforcement.gracePeriodDays && policy.enforcement.gracePeriodDays > 0 && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {policy.enforcement.gracePeriodDays} days grace
                          </span>
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => handleTogglePolicy(policy.id)}
                      disabled={loading}
                    />
                  </div>

                  {policy.settings && Object.keys(policy.settings).length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Settings:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(policy.settings).slice(0, 4).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="ml-1 font-medium">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Modified by {policy.modifiedBy}</span>
                    <span>{policy.lastModified.toLocaleDateString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePolicy(policy.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Policy Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Security Policy</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Policy Name</Label>
                  <Input
                    value={selectedPolicy.name}
                    onChange={(e) => setSelectedPolicy({
                      ...selectedPolicy,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedPolicy.category}
                    onChange={(e) => setSelectedPolicy({
                      ...selectedPolicy,
                      category: e.target.value as PolicyCategory
                    })}
                  >
                    <option value="PASSWORD">Password</option>
                    <option value="SESSION">Session</option>
                    <option value="MFA">Multi-Factor Authentication</option>
                    <option value="ACCESS">Access Control</option>
                    <option value="DATA_PROTECTION">Data Protection</option>
                    <option value="NETWORK">Network</option>
                    <option value="COMPLIANCE">Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedPolicy.description}
                  onChange={(e) => setSelectedPolicy({
                    ...selectedPolicy,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedPolicy.enabled}
                  onCheckedChange={(checked) => setSelectedPolicy({
                    ...selectedPolicy,
                    enabled: checked
                  })}
                />
                <Label>Enable this policy</Label>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePolicy} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update Policy'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityPoliciesPage;
