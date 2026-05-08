import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role, RoleCategory, RoleCategoryGroupProps } from '@/types/roles';
import RoleCheckboxItem from './RoleCheckboxItem';

const RoleCategoryGroup: React.FC<RoleCategoryGroupProps> = ({
  category,
  roles,
  selectedRoles,
  onRoleToggle,
  expanded: controlledExpanded,
  showRoleCount = true,
  disabled = false,
  onToggleExpanded
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded(category.id);
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const selectedCount = roles.filter(role => selectedRoles.includes(role.id)).length;
  const totalCount = roles.length;

  const handleSelectAll = () => {
    const unselectedRoles = roles.filter(role => !selectedRoles.includes(role.id));
    if (unselectedRoles.length > 0) {
      // Select all unselected roles
      unselectedRoles.forEach(role => onRoleToggle(role.id, true));
    } else {
      // Deselect all roles
      roles.forEach(role => onRoleToggle(role.id, false));
    }
  };

  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer transition-colors",
          "bg-gray-50 hover:bg-gray-100 border-b border-gray-200"
        )}
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-6 h-6">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">{category.icon}</span>
            <h3 className="font-semibold text-gray-900">{category.displayName}</h3>
            {showRoleCount && (
              <Badge variant="secondary" className="text-xs">
                {selectedCount}/{totalCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Selection Status */}
          {totalCount > 0 && (
            <div className="flex items-center space-x-2">
              {isAllSelected && (
                <Badge variant="default" className="text-xs bg-green-600">
                  All Selected
                </Badge>
              )}
              {isPartiallySelected && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  Partially Selected
                </Badge>
              )}
            </div>
          )}

          {/* Select All Button */}
          {totalCount > 1 && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              className="h-7 px-2 text-xs"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
      </div>

      {/* Category Description */}
      {category.description && isExpanded && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-800">{category.description}</p>
        </div>
      )}

      {/* Roles List */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No roles available in this category</p>
            </div>
          ) : (
            roles.map((role) => (
              <RoleCheckboxItem
                key={role.id}
                role={role}
                isSelected={selectedRoles.includes(role.id)}
                onToggle={(checked) => onRoleToggle(role.id, checked)}
                showPermissions={false}
                showUserCount={true}
                disabled={disabled}
                showDescription={true}
                compact={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoleCategoryGroup;
