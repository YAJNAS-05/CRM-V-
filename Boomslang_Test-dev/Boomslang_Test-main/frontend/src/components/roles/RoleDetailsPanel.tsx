import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Edit, 
  Users, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Shield,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleDetailsPanelProps, RoleAnalytics, PermissionSummary } from '@/types/roles';
import { formatDistanceToNow } from 'date-fns';

const RoleDetailsPanel: React.FC<RoleDetailsPanelProps> = ({
  role,
  users,
  permissions,
  conflicts = [],
  analytics,
  onEditRole,
  onViewUsers,
  onClose,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'users' | 'analytics'>('overview');

  const getPermissionBadgeColor = (permission: string) => {
    const category = permission.split('_').pop() || 'VIEW';
    const colors: Record<string, string> = {
      'VIEW': 'bg-blue-100 text-blue-800',
      'CREATE': 'bg-green-100 text-green-800',
      'EDIT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'APPROVE': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['VIEW'];
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'ERROR': 'text-red-600 bg-red-50 border-red-200',
      'WARNING': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'INFO': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || colors['INFO'];
  };

  const TabButton: React.FC<{
    id: typeof activeTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = ({ id, label, icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
        activeTab === id
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading role details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {role.icon && <span className="text-2xl">{role.icon}</span>}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{role.displayName}</h2>
                <p className="text-sm text-gray-600">{role.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {role.isSystem && (
                <Badge variant="secondary">System Role</Badge>
              )}
              {role.isActive ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEditRole && (
              <Button variant="outline" size="sm" onClick={onEditRole}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-4 border-b border-gray-200 bg-gray-50">
          <TabButton
            id="overview"
            label="Overview"
            icon={<Eye className="h-4 w-4" />}
          />
          <TabButton
            id="permissions"
            label="Permissions"
            icon={<Shield className="h-4 w-4" />}
            count={permissions.length}
          />
          <TabButton
            id="users"
            label="Users"
            icon={<Users className="h-4 w-4" />}
            count={users.length}
          />
          {analytics && (
            <TabButton
              id="analytics"
              label="Analytics"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{role.description}</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Role Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <div className="flex items-center space-x-1">
                        <span>{role.category.icon}</span>
                        <span className="text-sm font-medium">{role.category.displayName}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hierarchy Level</span>
                      <span className="text-sm font-medium">Level {role.hierarchy.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned Users</span>
                      <span className="text-sm font-medium">{role.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(role.metadata.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Usage Count</span>
                      <span className="text-sm font-medium">{role.metadata.usageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Modified</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(role.metadata.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                    {role.metadata.satisfactionScore && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Satisfaction</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {role.metadata.satisfactionScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conflicts */}
              {conflicts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Conflicts & Dependencies</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conflicts.map((conflict, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-md border",
                          getSeverityColor(conflict.severity)
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {conflict.severity === 'ERROR' && (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {conflict.severity === 'WARNING' && (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {conflict.severity === 'INFO' && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{conflict.type}</span>
                        </div>
                        <p className="text-sm mt-1">{conflict.description}</p>
                        {conflict.resolution && (
                          <p className="text-xs mt-2 italic">{conflict.resolution}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Prerequisites */}
              {role.prerequisites && role.prerequisites.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {role.prerequisites.map((prereq) => (
                        <Badge key={prereq} variant="outline">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Permissions ({permissions.length})</h3>
                <Badge variant="outline">
                  {permissions.filter(p => p.isGranted).length} granted
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={cn(
                      "p-3 rounded-md border",
                      permission.isGranted
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{permission.name}</span>
                      {permission.isGranted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                    <div className="mt-2">
                      <Badge className={cn("text-xs", getPermissionBadgeColor(permission.key))}>
                        {permission.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Assigned Users ({users.length})
                </h3>
                {onViewUsers && (
                  <Button variant="outline" size="sm" onClick={onViewUsers}>
                    <Users className="h-4 w-4 mr-1" />
                    View All Users
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      {user.position && (
                        <p className="text-xs text-gray-500">{user.position}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.isActive ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {users.length > 10 && (
                <div className="text-center">
                  <Button variant="outline" size="sm" onClick={onViewUsers}>
                    View All {users.length} Users
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Role Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.assignedUsers}
                        </p>
                        <p className="text-sm text-gray-600">Assigned Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.usageFrequency}
                        </p>
                        <p className="text-sm text-gray-600">Usage Frequency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.avgSessionDuration}m
                        </p>
                        <p className="text-sm text-gray-600">Avg Session</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.satisfactionScore.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-600">Satisfaction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Common Combinations */}
              {analytics.commonCombinations.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Common Role Combinations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.commonCombinations.map((combination, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex -space-x-1">
                            {combination.map((roleId) => (
                              <div
                                key={roleId}
                                className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                              >
                                <span className="text-xs font-medium text-blue-800">
                                  {roleId.charAt(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            Used together by {Math.floor(Math.random() * 20) + 5} users
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsPanel;
