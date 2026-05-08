import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CRUDService, ApiResponse, PaginationParams, FilterParams } from '../services/crudService';

// Hook options
interface UseCrudOptions<T> {
  service: CRUDService<T>;
  initialData?: T[];
  autoFetch?: boolean;
  pagination?: PaginationParams;
  filters?: FilterParams;
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

// Hook return type
interface UseCrudReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  selected: T | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // CRUD operations
  create: (item: Partial<T>) => Promise<T | null>;
  read: (id?: string | number) => Promise<void>;
  update: (id: string | number, item: Partial<T>) => Promise<T | null>;
  delete: (id: string | number) => Promise<boolean>;
  
  // Bulk operations
  bulkCreate: (items: Partial<T>[]) => Promise<T[] | null>;
  bulkUpdate: (updates: { id: string | number; data: Partial<T> }[]) => Promise<T[] | null>;
  bulkDelete: (ids: (string | number)[]) => Promise<boolean>;
  
  // State management
  setSelected: (item: T | null) => void;
  refresh: () => Promise<void>;
  setFilters: (filters: FilterParams) => void;
  setPagination: (pagination: PaginationParams) => void;
  clearError: () => void;
}

export function useCrudOperations<T>({
  service,
  initialData = [],
  autoFetch = true,
  pagination: initialPagination = { page: 1, limit: 20 },
  filters: initialFilters = {},
  onSuccess,
  onError,
}: UseCrudOptions<T>): UseCrudReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selected, setSelected] = useState<T | null>(null);
  const [pagination, setPaginationState] = useState({
    page: initialPagination.page || 1,
    limit: initialPagination.limit || 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFiltersState] = useState<FilterParams>(initialFilters);

  // Handle success callback
  const handleSuccess = useCallback((message: string) => {
    if (onSuccess) {
      onSuccess(message);
    } else {
      toast.success(message);
    }
  }, [onSuccess]);

  // Handle error callback
  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    } else {
      toast.error(err.message);
    }
  }, [onError]);

  // Fetch data
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.getAll(
        { page: pagination.page, limit: pagination.limit },
        filters
      );
      
      if (response.success) {
        setData(response.data);
        // Update pagination info if available
        if (response.data && Array.isArray(response.data)) {
          setPaginationState(prev => ({
            ...prev,
            total: response.data.length,
            hasNext: response.data.length === pagination.limit,
            hasPrev: pagination.page > 1,
          }));
        }
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [service, pagination.page, pagination.limit, filters, handleError]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  // Create operation
  const create = useCallback(async (item: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.create(item);
      
      if (response.success) {
        setData(prev => [...prev, response.data]);
        handleSuccess('Item created successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create item');
      }
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleSuccess, handleError]);

  // Read operation
  const read = useCallback(async (id?: string | number) => {
    if (!id) {
      await fetch();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.getById(id);
      
      if (response.success) {
        setSelected(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch item');
      }
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [service, fetch, handleError]);

  // Update operation
  const update = useCallback(async (id: string | number, item: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.update(id, item);
      
      if (response.success) {
        setData(prev => prev.map(existing => 
          // Assuming items have an 'id' property
          (existing as any).id === id ? response.data : existing
        ));
        
        // Update selected if it's the same item
        if (selected && (selected as any).id === id) {
          setSelected(response.data);
        }
        
        handleSuccess('Item updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update item');
      }
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, selected, handleSuccess, handleError]);

  // Delete operation
  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.delete(id);
      
      if (response.success) {
        setData(prev => prev.filter(existing => (existing as any).id !== id));
        
        // Clear selected if it's the deleted item
        if (selected && (selected as any).id === id) {
          setSelected(null);
        }
        
        handleSuccess('Item deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete item');
      }
    } catch (err) {
      handleError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, selected, handleSuccess, handleError]);

  // Bulk create operation
  const bulkCreate = useCallback(async (items: Partial<T>[]): Promise<T[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.bulkCreate(items);
      
      if (response.success) {
        setData(prev => [...prev, ...response.data]);
        handleSuccess(`${items.length} items created successfully`);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create items');
      }
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleSuccess, handleError]);

  // Bulk update operation
  const bulkUpdate = useCallback(async (updates: { id: string | number; data: Partial<T> }[]): Promise<T[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.bulkUpdate(updates);
      
      if (response.success) {
        setData(prev => {
          let updated = [...prev];
          response.data.forEach(updatedItem => {
            const index = updated.findIndex(existing => (existing as any).id === (updatedItem as any).id);
            if (index !== -1) {
              updated[index] = updatedItem;
            }
          });
          return updated;
        });
        
        handleSuccess(`${updates.length} items updated successfully`);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update items');
      }
    } catch (err) {
      handleError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleSuccess, handleError]);

  // Bulk delete operation
  const bulkDelete = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.bulkDelete(ids);
      
      if (response.success) {
        setData(prev => prev.filter(existing => !ids.includes((existing as any).id)));
        
        // Clear selected if it's among deleted items
        if (selected && ids.includes((selected as any).id)) {
          setSelected(null);
        }
        
        handleSuccess(`${ids.length} items deleted successfully`);
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete items');
      }
    } catch (err) {
      handleError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, selected, handleSuccess, handleError]);

  // Update filters
  const setFilters = useCallback((newFilters: FilterParams) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const setPagination = useCallback((newPagination: PaginationParams) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    selected,
    pagination,
    create,
    read,
    update,
    delete: remove,
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    setSelected,
    refresh,
    setFilters,
    setPagination,
    clearError,
  };
}

export default useCrudOperations;
