import { useEffect, useState, useCallback } from 'react';
import { supabase, db } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata: {
    first_name: string;
    last_name: string;
    full_name: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return { user, session, loading, signIn, signUp, signOut };
};

// Generic data fetching hook
export function useSupabaseQuery(
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    page?: number;
    pageSize?: number;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(options?.select || '*', { count: 'exact' });

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options?.page !== undefined && options?.pageSize) {
        const from = options.page * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      } else if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: queryError, count: totalCount } = await query;

      if (queryError) throw queryError;

      setData(result || []);
      setCount(totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [table, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, count, refetch: fetchData };
}

// Single item query hook
export function useSupabaseItem(
  table: string,
  id: string | null,
  options?: {
    select?: string;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id || options?.enabled === false) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: result, error: queryError } = await supabase.from(table)
          .select(options?.select || '*')
          .eq('id', id)
          .single();

        if (queryError) throw queryError;

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [table, id, options?.select, options?.enabled]);

  return { data, loading, error };
}

// Realtime subscription hook
export function useSupabaseRealtime(
  table: string,
  filter?: string,
  onChange?: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_realtime`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          onChange?.(payload);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, filter, onChange]);
}

// CRUD operations hook
export function useSupabaseMutations(table: string) {
  const create = useCallback(async (item: any) => {
    const { data, error } = await supabase.from(table).insert(item).select().single();
    return { data, error };
  }, [table]);

  const update = useCallback(async (id: string, item: any) => {
    const { data, error } = await supabase.from(table)
      .update(item)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }, [table]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  }, [table]);

  const softDelete = useCallback(async (id: string) => {
    const { data, error } = await supabase.from(table)
      .update({ is_deleted: true } as any)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }, [table]);

  return { create, update, remove, softDelete };
}

// Search hook
export function useSupabaseSearch(
  table: string,
  searchColumn: string,
  searchTerm: string,
  options?: {
    debounceMs?: number;
    limit?: number;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || options?.enabled === false) {
      setData([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);

      const { data: result, error } = await supabase.from(table)
        .select('*')
        .ilike(searchColumn, `%${searchTerm}%`)
        .limit(options?.limit || 20);

      if (!error) {
        setData(result || []);
      }

      setLoading(false);
    }, options?.debounceMs || 300);

    return () => clearTimeout(timeoutId);
  }, [table, searchColumn, searchTerm, options?.debounceMs, options?.limit, options?.enabled]);

  return { data, loading };
}

// RBAC hooks
export const useRBAC = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRBAC = async () => {
      const { data: permData } = await supabase.rpc('has_permission', { perm_key: 'users:read' });
      
      // Fetch user roles
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.user.id);
        
        const roleNames = roleData?.map((r: any) => r.roles.name) || [];
        setRoles(roleNames);
      }

      setLoading(false);
    };

    fetchRBAC();
  }, []);

  const hasPermission = useCallback(async (permissionKey: string) => {
    const { data } = await supabase.rpc('has_permission', { perm_key: permissionKey });
    return data || false;
  }, []);

  const hasRole = useCallback(async (roleName: string) => {
    const { data } = await supabase.rpc('has_role', { role_name: roleName });
    return data || false;
  }, []);

  const isSuperAdmin = roles.includes('SUPER_ADMIN');
  const isAdmin = roles.includes('ADMIN') || isSuperAdmin;

  return { permissions, roles, loading, hasPermission, hasRole, isSuperAdmin, isAdmin };
};

// File storage hook
export const useStorage = (bucket: string) => {
  const upload = useCallback(async (file: File, path?: string) => {
    const filePath = path || `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error, path: filePath };
  }, [bucket]);

  const getPublicUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, [bucket]);

  const remove = useCallback(async (paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  }, [bucket]);

  return { upload, getPublicUrl, remove };
};
