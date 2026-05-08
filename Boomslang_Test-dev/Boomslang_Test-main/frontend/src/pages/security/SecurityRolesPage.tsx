import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Shield, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Settings,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  UserPlus,
  UserMinus,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

interface SecurityRole {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom' | 'temporary';
  permissions: SecurityPermission[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  createdBy: string;
  modifiedBy: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  accessLevel: 'read' | 'write' | 'admin' | 'super-admin';
}

interface SecurityPermission {
  id: string;
  name: string;
  description: string;
  category: 'access' | 'modify' | 'admin' | 'audit' | 'system';
  isGranted: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RoleAssignment {
  id: string;
  roleId: string;
  roleName: string;
  userId: string;
  userName: string;
  userEmail: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
  reason: string;
}

interface SecurityAudit {
  id: string;
  action: string;
  targetType: 'role' | 'permission' | 'assignment';
  targetId: string;
  targetName: string;
  performedBy: string;
  performedAt: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

const SecurityRolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [securityRoles, setSecurityRoles] = useState<SecurityRole[]>([]);
  const [loading, setLoading] = useState(false);

  // Load security roles from API on component mount
  useEffect(() => {
    const loadSecurityRoles = async () => {
      setLoading(true);
      try {
        const rolesData = await securityApi.getRoles();
        if (rolesData) {
          setSecurityRoles(rolesData);
        }
      } catch (error) {
        console.error('Failed to load security roles:', error);
        toast.error('Failed to load security roles');
      } finally {
        setLoading(false);
      }
    };
    loadSecurityRoles();
  }, []);
      userCount: 8,
      isActive: true,
      createdAt: '2024-01-01',
      lastModified: '2024-01-08',
      createdBy: 'System',
      modifiedBy: 'Sarah Johnson',
      riskLevel: 'high',
      accessLevel: 'admin'
    },
    {
      id: 'role-3',
      name: 'Incident Responder',
      description: 'Limited access for incident response and containment actions',
      type: 'custom',
      permissions: [],
      userCount: 12,
      isActive: true,
      createdAt: '2024-01-05',
      lastModified: '2024-01-12',
      createdBy: 'Mike Wilson',
      modifiedBy: 'Mike Wilson',
      riskLevel: 'medium',
      accessLevel: 'write'
    },
    {
      id: 'role-4',
      name: 'Security Auditor',
      description: 'Read-only access to security logs, audits, and compliance reports',
      type: 'system',
      permissions: [],
      userCount: 5,
      isActive: true,
      createdAt: '2024-01-01',
      lastModified: '2024-01-06',
      createdBy: 'System',
      modifiedBy: 'David Lee',
      riskLevel: 'low',
      accessLevel: 'read'
    },
    {
      id: 'role-5',
      name: 'Temporary Emergency Access',
      description: 'Emergency access granted for critical system maintenance',
      type: 'temporary',
      permissions: [],
      userCount: 2,
      isActive: true,
      createdAt: '2024-01-15',
      lastModified: '2024-01-15',
      createdBy: 'John Smith',
      modifiedBy: 'John Smith',
      riskLevel: 'critical',
      accessLevel: 'admin'
    }
  ];

  const roleAssignments: RoleAssignment[] = [
    {
      id: 'assignment-1',
      roleId: 'role-1',
      roleName: 'Security Administrator',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@company.com',
      assignedAt: '2024-01-01',
      assignedBy: 'System',
      isActive: true,
      reason: 'System Administrator'
    },
    {
      id: 'assignment-2',
      roleId: 'role-2',
      roleName: 'Security Analyst',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@company.com',
      assignedAt: '2024-01-02',
      assignedBy: 'John Smith',
      isActive: true,
      reason: 'Security Team Member'
    },
    {
      id: 'assignment-3',
      roleId: 'role-3',
      roleName: 'Incident Responder',
      userId: 'user-3',
      userName: 'Mike Wilson',
      userEmail: 'mike.wilson@company.com',
      assignedAt: '2024-01-05',
      assignedBy: 'Sarah Johnson',
      expiresAt: '2024-06-05',
      isActive: true,
      reason: 'Incident Response Team'
    },
    {
      id: 'assignment-4',
      roleId: 'role-5',
      roleName: 'Temporary Emergency Access',
      userId: 'user-4',
      userName: 'David Lee',
      userEmail: 'david.lee@company.com',
      assignedAt: '2024-01-15',
      assignedBy: 'John Smith',
      expiresAt: '2024-01-16',
      isActive: true,
      reason: 'Emergency system maintenance'
    }
  ];

  const securityAudits: SecurityAudit[] = [
    {
      id: 'audit-1',
      action: 'Role Created',
      targetType: 'role',
      targetId: 'role-3',
      targetName: 'Incident Responder',
      performedBy: 'Mike Wilson',
      performedAt: '2024-01-05 10:30:00',
      details: 'Created new custom role for incident response team',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'audit-2',
      action: 'Permission Modified',
      targetType: 'permission',
      targetId: 'perm-1',
      targetName: 'Threat Detection Access',
      performedBy: 'Sarah Johnson',
      performedAt: '2024-01-08 14:15:00',
      details: 'Granted read access to threat detection dashboard',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'audit-3',
      action: 'Role Assigned',
      targetType: 'assignment',
      targetId: 'assignment-4',
      targetName: 'David Lee - Temporary Emergency Access',
      performedBy: 'John Smith',
      performedAt: '2024-01-15 16:45:00',
      details: 'Assigned temporary emergency access for system maintenance',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'super-admin':
        return 'text-purple-600 bg-purple-50';
      case 'admin':
        return 'text-red-600 bg-red-50';
      case 'write':
        return 'text-blue-600 bg-blue-50';
      case 'read':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-blue-600 bg-blue-50';
      case 'custom':
        return 'text-purple-600 bg-purple-50';
      case 'temporary':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRoles = securityRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoleData = securityRoles.find(r => r.id === selectedRole);
  const selectedAssignments = roleAssignments.filter(a => a.roleId === selectedRole);

  const totalRoles = securityRoles.length;
  const activeRoles = securityRoles.filter(r => r.isActive).length;
  const criticalRoles = securityRoles.filter(r => r.riskLevel === 'critical').length;
  const totalAssignments = roleAssignments.filter(a => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Roles</h1>
          <p className="text-muted-foreground">
            Manage security roles, permissions, and access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Role
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              security roles defined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRoles}</div>
            <p className="text-xs text-muted-foreground">
              currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Roles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRoles}</div>
            <p className="text-xs text-muted-foreground">
              high risk access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              user assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalRoles > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalRoles} critical security roles</strong> detected. 
            Ensure proper monitoring and regular access reviews for these roles.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Roles</h3>
              <p className="text-sm text-muted-foreground">
                Manage security roles and their configurations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search roles..."
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
            {/* Roles List */}
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRole === role.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getRiskColor(role.riskLevel)}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(role.type)}>
                          {role.type}
                        </Badge>
                        <Badge className={getAccessLevelColor(role.accessLevel)}>
                          {role.accessLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Users:</span>
                        <p className="font-medium">{role.userCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Level:</span>
                        <Badge className={getRiskColor(role.riskLevel)}>
                          {role.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={role.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Modified:</span>
                        <p className="font-medium">{role.lastModified}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Users ({role.userCount})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Role Details */}
            <div>
              {selectedRoleData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedRoleData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedRole(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedRoleData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Role Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedRoleData.type)}>
                              {selectedRoleData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Access Level:</span>
                            <Badge className={getAccessLevelColor(selectedRoleData.accessLevel)}>
                              {selectedRoleData.accessLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Level:</span>
                            <Badge className={getRiskColor(selectedRoleData.riskLevel)}>
                              {selectedRoleData.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={selectedRoleData.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                              {selectedRoleData.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Assignment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Users:</span>
                            <span className="font-medium">{selectedRoleData.userCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{selectedRoleData.createdAt}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created By:</span>
                            <span className="font-medium">{selectedRoleData.createdBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Modified By:</span>
                            <span className="font-medium">{selectedRoleData.modifiedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Assignments */}
                    <div>
                      <h4 className="font-medium mb-3">Recent Assignments</h4>
                      <div className="space-y-2">
                        {selectedAssignments.slice(0, 3).map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{assignment.userName}</div>
                              <div className="text-xs text-muted-foreground">{assignment.userEmail}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">{assignment.assignedAt}</div>
                              <Badge className={assignment.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                                {assignment.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Role
                      </Button>
                      <Button size="sm" variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Users
                      </Button>
                      <Button size="sm" variant="outline">
                        <Key className="w-4 h-4 mr-2" />
                        Manage Permissions
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
                        Select a role to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Role Assignments</h3>
              <p className="text-sm text-muted-foreground">
                Manage user role assignments and access
              </p>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Assigned By</th>
                      <th className="text-left p-4 font-medium">Assigned At</th>
                      <th className="text-left p-4 font-medium">Expires At</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleAssignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{assignment.userName}</div>
                            <div className="text-sm text-muted-foreground">{assignment.userEmail}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor('custom')}>
                            {assignment.roleName}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{assignment.assignedBy}</td>
                        <td className="p-4 text-sm">{assignment.assignedAt}</td>
                        <td className="p-4 text-sm">
                          {assignment.expiresAt || 'Never'}
                        </td>
                        <td className="p-4">
                          <Badge className={assignment.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                            {assignment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserMinus className="w-4 h-4" />
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

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Manage security permissions and access controls
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Permission
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['access', 'modify', 'admin', 'audit', 'system'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Permissions</CardTitle>
                  <CardDescription>
                    {category} related security permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Read', 'Write', 'Delete', 'Admin'].map((perm) => (
                      <div key={perm} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{perm} {category}</span>
                        <Badge className="bg-green-50 text-green-600">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Security Audit Log</h3>
              <p className="text-sm text-muted-foreground">
                Track all security-related activities
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Log
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Action</th>
                      <th className="text-left p-4 font-medium">Target</th>
                      <th className="text-left p-4 font-medium">Performed By</th>
                      <th className="text-left p-4 font-medium">Timestamp</th>
                      <th className="text-left p-4 font-medium">IP Address</th>
                      <th className="text-left p-4 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityAudits.map((audit) => (
                      <tr key={audit.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <Badge className="bg-blue-50 text-blue-600">
                            {audit.action}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{audit.targetName}</div>
                            <div className="text-sm text-muted-foreground">{audit.targetType}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{audit.performedBy}</td>
                        <td className="p-4 text-sm">{audit.performedAt}</td>
                        <td className="p-4 text-sm">{audit.ipAddress}</td>
                        <td className="p-4 text-sm max-w-xs truncate">{audit.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityRolesPage;
