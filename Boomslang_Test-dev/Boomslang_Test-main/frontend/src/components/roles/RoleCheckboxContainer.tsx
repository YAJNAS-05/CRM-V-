import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Eye,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Role, 
  RoleCheckboxContainerProps, 
  RoleConflict,
  PermissionSummary,
  ROLE_CATEGORIES 
} from '@/types/roles';
import RoleCategoryGroup from './RoleCategoryGroup';
import RoleCheckboxItem from './RoleCheckboxItem';

const RoleCheckboxContainer: React.FC<RoleCheckboxContainerProps> = ({
  availableRoles,
  selectedRoles,
  onRoleToggle,
  onBulkSelection,
  showPermissions = false,
  enableBulkActions = true,
  conflictDetection = true,
  loading = false,
  disabled = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(ROLE_CATEGORIES))
  );
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);

  // Filter and group roles
  const { filteredRoles, groupedRoles, categories } = useMemo(() => {
    let filtered = availableRoles;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(query) ||
        role.displayName.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.permissions.some(perm => perm.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(role => role.category.id === selectedCategory);
    }

    // Group by category
    const grouped = filtered.reduce((acc, role) => {
      const categoryId = role.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(role);
      return acc;
    }, {} as Record<string, Role[]>);

    // Get unique categories from filtered roles
    const uniqueCategories = Array.from(
      new Set(filtered.map(role => role.category))
    ).sort((a, b) => a.order - b.order);

    return {
      filteredRoles: filtered,
      groupedRoles: grouped,
      categories: uniqueCategories
    };
  }, [availableRoles, searchQuery, selectedCategory]);

  // Detect conflicts
  useEffect(() => {
    if (conflictDetection && selectedRoles.length > 0) {
      const detectedConflicts = detectConflicts(selectedRoles, availableRoles);
      setConflicts(detectedConflicts);
    } else {
      setConflicts([]);
    }
  }, [selectedRoles, availableRoles, conflictDetection]);

  const detectConflicts = (selectedRoleIds: string[], allRoles: Role[]): RoleConflict[] => {
    const conflicts: RoleConflict[] = [];
    
    selectedRoleIds.forEach(roleId => {
      const role = allRoles.find(r => r.id === roleId);
      if (!role) return;
      
      // Check hierarchy conflicts
      if (role.conflicts) {
        role.conflicts.forEach(conflictRoleId => {
          if (selectedRoleIds.includes(conflictRoleId)) {
            const conflictRole = allRoles.find(r => r.id === conflictRoleId);
            conflicts.push({
              type: 'HIERARCHY',
              conflictingRoles: [roleId, conflictRoleId],
              description: `${role.displayName} conflicts with ${conflictRole?.displayName || conflictRoleId}`,
              severity: 'ERROR'
            });
          }
        });
      }
      
      // Check prerequisite conflicts
      if (role.prerequisites) {
        role.prerequisites.forEach(prereqRoleId => {
          if (!selectedRoleIds.includes(prereqRoleId)) {
            const prereqRole = allRoles.find(r => r.id === prereqRoleId);
            conflicts.push({
              type: 'PREREQUISITE',
              conflictingRoles: [roleId],
              description: `${role.displayName} requires ${prereqRole?.displayName || prereqRoleId}`,
              severity: 'WARNING'
            });
          }
        });
      }
    });
    
    return conflicts;
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    onRoleToggle(roleId, checked);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSelectAll = () => {
    const allRoleIds = filteredRoles.map(role => role.id);
    const currentlySelected = selectedRoles.filter(id => 
      filteredRoles.some(role => role.id === id)
    );
    
    if (currentlySelected.length === filteredRoles.length) {
      // Deselect all filtered roles
      currentlySelected.forEach(id => onRoleToggle(id, false));
    } else {
      // Select all filtered roles
      allRoleIds.forEach(id => onRoleToggle(id, true));
    }
  };

  const handleClearSelection = () => {
    selectedRoles.forEach(id => onRoleToggle(id, false));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery.trim() || selectedCategory;
  const selectedCount = selectedRoles.length;
  const filteredCount = filteredRoles.length;
  const isAllSelected = selectedCount === filteredCount && filteredCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < filteredCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Role Assignment</h2>
          <p className="text-sm text-gray-600">
            {selectedCount} role{selectedCount !== 1 ? 's' : ''} selected
            {hasActiveFilters && ` (showing ${filteredCount} of ${availableRoles.length})`}
          </p>
        </div>
        
        {enableBulkActions && (
          <div className="flex items-center space-x-2">
            {selectedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            )}
            
            {filteredCount > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled}
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles by name, description, or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                disabled={disabled}
                className="h-8"
              >
                <span className="mr-1">{category.icon}</span>
                {category.displayName}
              </Button>
            ))}
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={disabled}
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflictDetection && conflicts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-red-800">
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowConflicts(!showConflicts)}
                className="ml-2 p-0 h-auto text-red-600"
              >
                {showConflicts ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            {conflicts.some(c => c.severity === 'ERROR') && (
              <Badge variant="destructive" className="text-xs">
                Action Required
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts Details */}
      {showConflicts && conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((conflict, index) => (
            <Alert 
              key={index}
              className={cn(
                "border",
                conflict.severity === 'ERROR' ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
              )}
            >
              <AlertTriangle className={cn(
                "h-4 w-4",
                conflict.severity === 'ERROR' ? "text-red-600" : "text-yellow-600"
              )} />
              <AlertDescription className="text-sm">
                {conflict.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading roles...</span>
        </div>
      )}

      {/* Roles List */}
      {!loading && (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No roles found matching your criteria</p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters to see all roles
                </Button>
              )}
            </div>
          ) : (
            categories.map((category) => (
              <RoleCategoryGroup
                key={category.id}
                category={category}
                roles={groupedRoles[category.id] || []}
                selectedRoles={selectedRoles}
                onRoleToggle={handleRoleToggle}
                expanded={expandedCategories.has(category.id)}
                showRoleCount={true}
                disabled={disabled}
                onToggleExpanded={handleCategoryToggle}
              />
            ))
          )}
        </div>
      )}

      {/* Footer Stats */}
      {!loading && filteredCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{filteredCount} roles available</span>
            </div>
            
            {selectedCount > 0 && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{selectedCount} selected</span>
              </div>
            )}
            
            {conflicts.length > 0 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>{conflicts.length} conflicts</span>
              </div>
            )}
          </div>
          
          {showPermissions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Show permission summary */}}
              disabled={disabled || selectedCount === 0}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Permissions ({selectedCount})
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleCheckboxContainer;
