import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  Settings,
  Filter,
  Download,
  Upload,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  RoleCheckboxContainer,
  RoleDetailsPanel,
  BulkAssignment,
  User,
  Role,
  BulkOperation,
  BulkOperationResult,
  DEFAULT_ROLES
} from '@/components/roles';
import { toast } from 'sonner';

const EnhancedUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRoleAssignments, setUserRoleAssignments] = useState<Record<string, string[]>>({});

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        avatar: '',
        department: 'Sales',
        position: 'Sales Manager',
        isActive: true,
        roles: ['SALES_MANAGER'],
        lastLogin: new Date('2024-01-15T10:30:00')
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        avatar: '',
        department: 'HR',
        position: 'HR Manager',
        isActive: true,
        roles: ['HR_MANAGER'],
        lastLogin: new Date('2024-01-15T09:15:00')
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        avatar: '',
        department: 'Sales',
        position: 'Sales Representative',
        isActive: true,
        roles: ['SALES_REP'],
        lastLogin: new Date('2024-01-14T16:45:00')
      },
      {
        id: '4',
        name: 'Lisa Brown',
        email: 'lisa.brown@company.com',
        avatar: '',
        department: 'Finance',
        position: 'Finance Analyst',
        isActive: true,
        roles: ['FINANCE_ANALYST'],
        lastLogin: new Date('2024-01-15T11:20:00')
      },
      {
        id: '5',
        name: 'Tom Wilson',
        email: 'tom.wilson@company.com',
        avatar: '',
        department: 'IT',
        position: 'IT Support',
        isActive: false,
        roles: ['EMPLOYEE'],
        lastLogin: new Date('2024-01-10T14:30:00')
      }
    ];

    const mockAssignments: Record<string, string[]> = {
      '1': ['SALES_MANAGER'],
      '2': ['HR_MANAGER'],
      '3': ['SALES_REP'],
      '4': ['FINANCE_ANALYST'],
      '5': ['EMPLOYEE']
    };

    setUsers(mockUsers);
    setUserRoleAssignments(mockAssignments);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelection = (userIds: string[]) => {
    setSelectedUsers(userIds);
  };

  const handleRoleSelection = (roleIds: string[]) => {
    setSelectedRoles(roleIds);
  };

  const handleRoleToggle = (userId: string, roleId: string, checked: boolean) => {
    const currentRoles = userRoleAssignments[userId] || [];
    let newRoles: string[];

    if (checked) {
      newRoles = [...currentRoles, roleId];
    } else {
      newRoles = currentRoles.filter(id => id !== roleId);
    }

    setUserRoleAssignments(prev => ({
      ...prev,
      [userId]: newRoles
    }));

    // Update user object
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, roles: newRoles } : user
    ));

    toast.success(`Role ${checked ? 'assigned' : 'removed'} successfully`);
  };

  const executeBulkOperation = async (operation: BulkOperation): Promise<BulkOperationResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result: BulkOperationResult = {
      success: [],
      errors: [],
      warnings: [],
      summary: ''
    };

    for (const userId of operation.targetUsers) {
      try {
        let newRoles: string[] = [];

        switch (operation.type) {
          case 'ASSIGN':
            newRoles = [...(userRoleAssignments[userId] || []), ...operation.targetRoles];
            break;
          case 'REMOVE':
            newRoles = (userRoleAssignments[userId] || []).filter(
              role => !operation.targetRoles.includes(role)
            );
            break;
          case 'COPY':
            if (operation.sourceUser) {
              const sourceRoles = userRoleAssignments[operation.sourceUser] || [];
              newRoles = [...new Set([...(userRoleAssignments[userId] || []), ...sourceRoles])];
            }
            break;
        }

        setUserRoleAssignments(prev => ({
          ...prev,
          [userId]: newRoles
        }));

        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, roles: newRoles } : user
        ));

        result.success.push(`Roles updated for user ${userId}`);
      } catch (error) {
        result.errors.push(`Failed to update user ${userId}: ${(error as Error).message}`);
      }
    }

    result.summary = `Processed ${operation.targetUsers.length} users. Success: ${result.success.length}, Errors: ${result.errors.length}`;
    return result;
  };

  const getUserRoles = (userId: string): Role[] => {
    const userRoleIds = userRoleAssignments[userId] || [];
    return roles.filter(role => userRoleIds.includes(role.id));
  };

  const getStatusIcon = (user: User) => {
    if (user.isActive) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getRoleBadges = (user: User) => {
    const userRoles = getUserRoles(user.id);
    return userRoles.slice(0, 3).map(role => (
      <Badge key={role.id} variant="secondary" className="text-xs">
        <span className="mr-1">{role.icon}</span>
        {role.displayName}
      </Badge>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and their role assignments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, department, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'individual' | 'bulk')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Individual Assignment</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Bulk Assignment</span>
          </TabsTrigger>
        </TabsList>

        {/* Individual Assignment Tab */}
        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 border-b cursor-pointer hover:bg-gray-50",
                          selectedUser?.id === user.id && "bg-blue-50 border-blue-200"
                        )}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user.position}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            {getStatusIcon(user)}
                            <span className="text-xs text-gray-500">
                              {user.roles.length} role{user.roles.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Assignment */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedUser.avatar} />
                          <AvatarFallback>
                            {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedUser.position} • {selectedUser.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit User
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Roles */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Current Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {getRoleBadges(selectedUser)}
                          {selectedUser.roles.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedUser.roles.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Role Selection */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Assign Roles</h4>
                        <RoleCheckboxContainer
                          availableRoles={roles}
                          selectedRoles={userRoleAssignments[selectedUser.id] || []}
                          onRoleToggle={(roleId, checked) => 
                            handleRoleToggle(selectedUser.id, roleId, checked)
                          }
                          showPermissions={true}
                          enableBulkActions={false}
                          conflictDetection={true}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Select a user to manage their role assignments</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Bulk Assignment Tab */}
        <TabsContent value="bulk">
          <BulkAssignment
            users={users}
            roles={roles}
            selectedUsers={selectedUsers}
            selectedRoles={selectedRoles}
            onUserSelectionChange={handleUserSelection}
            onRoleSelectionChange={handleRoleSelection}
            onExecuteBulkOperation={executeBulkOperation}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Role Details Panel */}
      {showRoleDetails && selectedRole && (
        <RoleDetailsPanel
          role={selectedRole}
          users={users.filter(user => user.roles.includes(selectedRole.id))}
          permissions={[]}
          conflicts={[]}
          onClose={() => {
            setShowRoleDetails(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedUserManagementPage;
