import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  Copy, 
  Trash2, 
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowRight,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BulkAssignmentProps, 
  BulkOperation, 
  BulkOperationResult,
  User,
  Role 
} from '@/types/roles';

const BulkAssignment: React.FC<BulkAssignmentProps> = ({
  users,
  roles,
  selectedUsers,
  selectedRoles,
  onUserSelectionChange,
  onRoleSelectionChange,
  onExecuteBulkOperation,
  loading = false,
  disabled = false
}) => {
  const [operationType, setOperationType] = useState<'ASSIGN' | 'REMOVE' | 'COPY'>('ASSIGN');
  const [sourceUser, setSourceUser] = useState<string>('');
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Filter users and roles
  const filteredUsers = users.filter(user => user.isActive);
  const filteredRoles = roles.filter(role => role.isActive);

  // Calculate preview
  const preview = useMemo(() => {
    const changes: Array<{user: User, action: string, roles: string[]}> = [];
    
    selectedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let action = '';
      let affectedRoles: string[] = [];

      switch (operationType) {
        case 'ASSIGN':
          action = 'Add roles';
          affectedRoles = selectedRoles.filter(roleId => !user.roles.includes(roleId));
          break;
        case 'REMOVE':
          action = 'Remove roles';
          affectedRoles = selectedRoles.filter(roleId => user.roles.includes(roleId));
          break;
        case 'COPY':
          if (sourceUser) {
            const source = users.find(u => u.id === sourceUser);
            if (source) {
              action = `Copy roles from ${source.name}`;
              affectedRoles = source.roles.filter(roleId => !user.roles.includes(roleId));
            }
          }
          break;
      }

      if (affectedRoles.length > 0) {
        changes.push({ user, action, roles: affectedRoles });
      }
    });

    return changes;
  }, [selectedUsers, selectedRoles, operationType, sourceUser, users, operationType]);

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onUserSelectionChange([...selectedUsers, userId]);
    } else {
      onUserSelectionChange(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      onRoleSelectionChange([...selectedRoles, roleId]);
    } else {
      onRoleSelectionChange(selectedRoles.filter(id => id !== roleId));
    }
  };

  const handleSelectAllUsers = () => {
    const allUserIds = filteredUsers.map(u => u.id);
    const currentlySelected = selectedUsers.filter(id => 
      filteredUsers.some(u => u.id === id)
    );
    
    if (currentlySelected.length === filteredUsers.length) {
      onUserSelectionChange(selectedUsers.filter(id => 
        !filteredUsers.some(u => u.id === id)
      ));
    } else {
      onUserSelectionChange([...new Set([...selectedUsers, ...allUserIds])]);
    }
  };

  const handleSelectAllRoles = () => {
    const allRoleIds = filteredRoles.map(r => r.id);
    const currentlySelected = selectedRoles.filter(id => 
      filteredRoles.some(r => r.id === id)
    );
    
    if (currentlySelected.length === filteredRoles.length) {
      onRoleSelectionChange(selectedRoles.filter(id => 
        !filteredRoles.some(r => r.id === id)
      ));
    } else {
      onRoleSelectionChange([...new Set([...selectedRoles, ...allRoleIds])]);
    }
  };

  const executeOperation = async () => {
    if (selectedUsers.length === 0 || (operationType !== 'COPY' && selectedRoles.length === 0)) {
      return;
    }

    if (operationType === 'COPY' && !sourceUser) {
      return;
    }

    setIsExecuting(true);
    setOperationResult(null);

    try {
      const operation: BulkOperation = {
        type: operationType,
        targetUsers: selectedUsers,
        targetRoles: selectedRoles,
        sourceUser: operationType === 'COPY' ? sourceUser : undefined,
        dryRun: false
      };

      const result = await onExecuteBulkOperation(operation);
      setOperationResult(result);
      
      // Clear selections on success
      if (result.errors.length === 0) {
        onUserSelectionChange([]);
        onRoleSelectionChange([]);
        setSourceUser('');
      }
    } catch (error) {
      setOperationResult({
        success: [],
        errors: ['Operation failed: ' + (error as Error).message],
        warnings: [],
        summary: 'Operation failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const canExecute = () => {
    if (disabled || isExecuting) return false;
    if (selectedUsers.length === 0) return false;
    if (operationType === 'COPY') return sourceUser.length > 0;
    return selectedRoles.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Operation Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Bulk Role Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={operationType === 'ASSIGN' ? 'default' : 'outline'}
              onClick={() => setOperationType('ASSIGN')}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Assign Roles
            </Button>
            <Button
              variant={operationType === 'REMOVE' ? 'default' : 'outline'}
              onClick={() => setOperationType('REMOVE')}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Roles
            </Button>
            <Button
              variant={operationType === 'COPY' ? 'default' : 'outline'}
              onClick={() => setOperationType('COPY')}
              disabled={disabled}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Roles
            </Button>
          </div>

          {/* Source User Selection for Copy Operation */}
          {operationType === 'COPY' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Source User
              </label>
              <select
                value={sourceUser}
                onChange={(e) => setSourceUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={disabled}
              >
                <option value="">Select source user...</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.roles.length} roles)
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Selection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Select Users</span>
                <Badge variant="secondary">{selectedUsers.length}</Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllUsers}
                disabled={disabled}
              >
                {selectedUsers.filter(id => filteredUsers.some(u => u.id === id)).length === filteredUsers.length 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-md border",
                    selectedUsers.includes(user.id) 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                    disabled={disabled}
                  />
                  <Avatar className="h-6 w-6">
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
                      {user.email} • {user.roles.length} roles
                    </p>
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
          </CardContent>
        </Card>

        {/* Roles Selection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Select Roles</span>
                <Badge variant="secondary">{selectedRoles.length}</Badge>
              </CardTitle>
              {operationType !== 'COPY' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllRoles}
                  disabled={disabled}
                >
                  {selectedRoles.filter(id => filteredRoles.some(r => r.id === id)).length === filteredRoles.length 
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {operationType !== 'COPY' ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredRoles.map(role => (
                  <div
                    key={role.id}
                    className={cn(
                      "flex items-center space-x-3 p-2 rounded-md border",
                      selectedRoles.includes(role.id) 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                      disabled={disabled}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{role.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {role.displayName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {role.category.displayName} • {role.userCount} users
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Copy className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Roles will be copied from the selected source user</p>
                {!sourceUser && (
                  <p className="text-xs text-gray-400 mt-1">Please select a source user above</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {showPreview && preview.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview Changes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {preview.map((change, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <span className="font-medium text-gray-900 min-w-0 flex-1 truncate">
                    {change.user.name}
                  </span>
                  <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 min-w-0 flex-1">
                    {change.action}
                  </span>
                  <Badge variant="outline" className="flex-shrink-0">
                    {change.roles.length} role{change.roles.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Result */}
      {operationResult && (
        <Alert className={cn(
          operationResult.errors.length > 0 
            ? "border-red-200 bg-red-50" 
            : "border-green-200 bg-green-50"
        )}>
          {operationResult.errors.length > 0 ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{operationResult.summary}</p>
              {operationResult.success.length > 0 && (
                <div className="text-sm text-green-700">
                  <strong>Success:</strong> {operationResult.success.length} operations
                </div>
              )}
              {operationResult.errors.length > 0 && (
                <div className="text-sm text-red-700">
                  <strong>Errors:</strong> {operationResult.errors.length} operations
                  <ul className="mt-1 list-disc list-inside">
                    {operationResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {operationResult.errors.length > 3 && (
                      <li>...and {operationResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              {operationResult.warnings.length > 0 && (
                <div className="text-sm text-yellow-700">
                  <strong>Warnings:</strong> {operationResult.warnings.length} operations
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Execute Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          {operationType !== 'COPY' && selectedRoles.length > 0 && (
            <> • {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected</>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              onUserSelectionChange([]);
              onRoleSelectionChange([]);
              setSourceUser('');
              setOperationResult(null);
            }}
            disabled={disabled || isExecuting}
          >
            Clear Selection
          </Button>
          <Button
            onClick={executeOperation}
            disabled={!canExecute()}
            className="min-w-[120px]"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executing...
              </>
            ) : (
              <>
                {operationType === 'ASSIGN' && <Plus className="h-4 w-4 mr-1" />}
                {operationType === 'REMOVE' && <Trash2 className="h-4 w-4 mr-1" />}
                {operationType === 'COPY' && <Copy className="h-4 w-4 mr-1" />}
                Execute {operationType}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignment;
