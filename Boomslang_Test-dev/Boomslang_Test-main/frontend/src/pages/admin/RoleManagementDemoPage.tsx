import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Shield, 
  Users, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Code,
  Play,
  BookOpen
} from 'lucide-react';
import { 
  RoleCheckboxContainer,
  RoleDetailsPanel,
  BulkAssignment,
  User,
  Role,
  DEFAULT_ROLES,
  ROLE_CATEGORIES
} from '@/components/roles';
import { roleApi } from '@/api/roleApi';

const RoleManagementDemoPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'bulk' | 'api'>('basic');

  // Mock users for demo
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 'demo-user-1',
        name: 'Alex Johnson',
        email: 'alex.johnson@company.com',
        department: 'Engineering',
        position: 'Senior Developer',
        isActive: true,
        roles: ['EMPLOYEE'],
        lastLogin: new Date()
      },
      {
        id: 'demo-user-2',
        name: 'Maria Garcia',
        email: 'maria.garcia@company.com',
        department: 'Sales',
        position: 'Sales Representative',
        isActive: true,
        roles: ['SALES_REP'],
        lastLogin: new Date()
      },
      {
        id: 'demo-user-3',
        name: 'David Chen',
        email: 'david.chen@company.com',
        department: 'Finance',
        position: 'Financial Analyst',
        isActive: true,
        roles: ['FINANCE_ANALYST'],
        lastLogin: new Date()
      }
    ];
    setDemoUsers(mockUsers);
  }, []);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
  };

  const handleBulkOperation = async (operation: any) => {
    // Simulate bulk operation
    console.log('Executing bulk operation:', operation);
    return {
      success: [`Successfully processed ${operation.targetUsers.length} users`],
      errors: [],
      warnings: [],
      summary: `Bulk ${operation.type.toLowerCase()} completed successfully`
    };
  };

  const getSelectedRoleDetails = () => {
    return roles.filter(role => selectedRoles.includes(role.id));
  };

  const getPermissionSummary = () => {
    const allPermissions = new Set<string>();
    selectedRoles.forEach(roleId => {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        role.permissions.forEach(perm => allPermissions.add(perm));
      }
    });
    return Array.from(allPermissions);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management UI Demo</h1>
          <p className="text-gray-600">
            Freshservice-style role checkbox UI control with advanced features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fully Functional
          </Badge>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-1" />
            Documentation
          </Button>
        </div>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Key Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Role Categories</p>
                <p className="text-xs text-gray-600">Executive, Management, Operational, Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Conflict Detection</p>
                <p className="text-xs text-gray-600">Automatic role conflict validation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Bulk Operations</p>
                <p className="text-xs text-gray-600">Assign/remove/copy roles in bulk</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Role Analytics</p>
                <p className="text-xs text-gray-600">Usage statistics and insights</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Basic Usage</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Advanced Features</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Bulk Assignment</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>API Integration</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Usage Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Role Selection</CardTitle>
                  <p className="text-sm text-gray-600">
                    Select roles to see detailed information and permissions
                  </p>
                </CardHeader>
                <CardContent>
                  <RoleCheckboxContainer
                    availableRoles={roles}
                    selectedRoles={selectedRoles}
                    onRoleToggle={handleRoleToggle}
                    showPermissions={true}
                    enableBulkActions={true}
                    conflictDetection={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Selection Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="mt-2 space-y-2">
                      {getSelectedRoleDetails().map(role => (
                        <div
                          key={role.id}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRoleClick(role)}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{role.icon}</span>
                            <span className="text-sm font-medium">{role.displayName}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {role.permissions.length} perms
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Total Permissions: {getPermissionSummary().length}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {getPermissionSummary().slice(0, 8).map(perm => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {getPermissionSummary().length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{getPermissionSummary().length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedRoles(roles.map(r => r.id))}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Select All Roles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedRoles([])}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const execRoles = roles.filter(r => r.category.id === 'EXECUTIVE');
                      setSelectedRoles(execRoles.map(r => r.id));
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Select Executive Roles
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Features Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role Categories</CardTitle>
                <p className="text-sm text-gray-600">
                  Roles are organized into logical categories
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(ROLE_CATEGORIES).map(category => {
                    const categoryRoles = roles.filter(r => r.category.id === category.id);
                    const selectedCount = categoryRoles.filter(r => selectedRoles.includes(r.id)).length;
                    
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        style={{ borderColor: category.color }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <p className="font-medium">{category.displayName}</p>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {selectedCount}/{categoryRoles.length}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {categoryRoles.length} roles
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Conflict Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conflict Detection</CardTitle>
                <p className="text-sm text-gray-600">
                  Automatic detection of role conflicts and dependencies
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>No conflicts detected</strong> for current selection
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Example Conflicts:</h4>
                    <div className="p-3 border border-red-200 bg-red-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Hierarchy Conflict</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        Sales Manager conflicts with Sales Representative (hierarchical)
                      </p>
                    </div>
                    <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Prerequisite Missing</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        CFO requires Finance Manager as prerequisite
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Assignment Tab */}
        <TabsContent value="bulk">
          <BulkAssignment
            users={demoUsers}
            roles={roles}
            selectedUsers={selectedUsers}
            selectedRoles={selectedRoles}
            onUserSelectionChange={setSelectedUsers}
            onRoleSelectionChange={setSelectedRoles}
            onExecuteBulkOperation={handleBulkOperation}
          />
        </TabsContent>

        {/* API Integration Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>API Integration</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Complete TypeScript API with comprehensive role management
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Core API Methods</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• getRoles() - Fetch all roles</li>
                    <li>• getUserRoles(userId) - Get user's roles</li>
                    <li>• assignRoles(userId, roleIds) - Assign roles</li>
                    <li>• bulkAssignRoles(operation) - Bulk operations</li>
                    <li>• detectRoleConflicts(roleIds) - Conflict detection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Role analytics and usage statistics</li>
                    <li>• Assignment history tracking</li>
                    <li>• Permission management</li>
                    <li>• Role hierarchy validation</li>
                    <li>• Search and filtering capabilities</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Example Usage:</h4>
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import { roleApi } from '@/api/roleApi';

// Get user roles
const userRoles = await roleApi.getUserRoles('user-123');

// Assign new roles
await roleApi.assignRoles('user-123', ['SALES_MANAGER', 'CRM_VIEW']);

// Bulk assignment
const result = await roleApi.bulkAssignRoles({
  type: 'ASSIGN',
  targetUsers: ['user-1', 'user-2'],
  targetRoles: ['EMPLOYEE']
});

// Detect conflicts
const conflicts = await roleApi.detectRoleConflicts(['SALES_MANAGER', 'SALES_REP']);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Details Panel */}
      {showRoleDetails && selectedRole && (
        <RoleDetailsPanel
          role={selectedRole}
          users={demoUsers.filter(user => user.roles.includes(selectedRole.id))}
          permissions={[]}
          conflicts={[]}
          analytics={{
            assignedUsers: demoUsers.filter(u => u.roles.includes(selectedRole.id)).length,
            usageFrequency: 85,
            avgSessionDuration: 45,
            lastModified: new Date(),
            satisfactionScore: 4.5,
            commonCombinations: []
          }}
          onClose={() => {
            setShowRoleDetails(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default RoleManagementDemoPage;
