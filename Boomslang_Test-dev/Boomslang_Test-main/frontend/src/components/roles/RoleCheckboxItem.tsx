import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AlertTriangle, Info, Users, Eye, EyeOff } from 'lucide-react';
import { Role, RoleCheckboxItemProps } from '@/types/roles';
import { cn } from '@/lib/utils';

const RoleCheckboxItem: React.FC<RoleCheckboxItemProps> = ({
  role,
  isSelected,
  onToggle,
  showPermissions = false,
  showUserCount = true,
  disabled = false,
  conflictWarning,
  showDescription = true,
  compact = false
}) => {
  const [showPermissions, setShowPermissions] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (!disabled) {
      onToggle(checked);
    }
  };

  const getConflictIcon = () => {
    if (!conflictWarning) return null;
    
    if (conflictWarning.includes('conflicts')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Info className="h-4 w-4 text-yellow-500" />;
  };

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      'VIEW': 'bg-blue-100 text-blue-800',
      'CREATE': 'bg-green-100 text-green-800',
      'EDIT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'APPROVE': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-gray-100 text-gray-800'
    };

    const category = permission.split('_').pop() || 'VIEW';
    return colors[category] || colors['VIEW'];
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        isSelected && "bg-blue-50 border border-blue-200"
      )}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          disabled={disabled}
          id={`role-${role.id}`}
        />
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{role.displayName}</span>
          {role.icon && <span className="text-lg">{role.icon}</span>}
        </div>
        {conflictWarning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {getConflictIcon()}
              </TooltipTrigger>
              <TooltipContent>
                <p>{conflictWarning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-3 transition-all duration-200",
      disabled && "opacity-50 cursor-not-allowed bg-gray-50",
      isSelected && "border-blue-500 bg-blue-50 shadow-sm",
      !isSelected && "border-gray-200 hover:border-gray-300 hover:shadow-sm"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggle}
            disabled={disabled}
            id={`role-${role.id}`}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <label 
                htmlFor={`role-${role.id}`}
                className={cn(
                  "font-medium text-gray-900 cursor-pointer",
                  disabled && "cursor-not-allowed"
                )}
              >
                {role.displayName}
              </label>
              {role.icon && <span className="text-lg">{role.icon}</span>}
              {role.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
              {!role.isActive && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            
            {showDescription && role.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {role.description}
              </p>
            )}

            {/* User Count */}
            {showUserCount && (
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{role.userCount} users</span>
                </div>
                
                {role.metadata?.usageCount !== undefined && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{role.metadata.usageCount} uses</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictWarning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  {getConflictIcon()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{conflictWarning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Permissions */}
      {showPermissions && role.permissions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Permissions</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPermissions(!showPermissions)}
              className="h-6 px-2 text-xs"
            >
              {showPermissions ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show {role.permissions.length}
                </>
              )}
            </Button>
          </div>
          
          {showPermissions && (
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 6).map((permission) => (
                <Badge 
                  key={permission} 
                  variant="secondary" 
                  className={cn("text-xs", getPermissionBadge(permission))}
                >
                  {permission.replace(/_/g, ' ')}
                </Badge>
              ))}
              {role.permissions.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Prerequisites */}
      {role.prerequisites && role.prerequisites.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <span className="font-medium">Prerequisites:</span> {role.prerequisites.join(', ')}
        </div>
      )}

      {/* Conflicts */}
      {role.conflicts && role.conflicts.length > 0 && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          <span className="font-medium">Conflicts with:</span> {role.conflicts.join(', ')}
        </div>
      )}
    </div>
  );
};

export default RoleCheckboxItem;
