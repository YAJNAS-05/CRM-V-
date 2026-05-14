import { supabase } from './supabaseClient';
export { supabase };

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, userData: {
  first_name: string;
  last_name: string;
  full_name: string;
  role?: string;
  office_location?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Database helpers with type safety
const dbMap = {
  users: 'users',
  accounts: 'accounts',
  contacts: 'contacts',
  leads: 'leads',
  deals: 'deals',
  activities: 'activities',
  quotes: 'quotes',
  quote_line_items: 'quote_line_items',
  equipment: 'equipment',
  inventory_items: 'inventory_items',
  purchase_orders: 'purchase_orders',
  suppliers: 'suppliers',
  invoices: 'invoices',
  payments: 'payments',
  departments: 'departments',
  employees: 'employees',
  roles: 'roles',
  permissions: 'permissions',
  user_roles: 'user_roles',
  role_permissions: 'role_permissions',
} as const;

export const db = {
  app_users: () => supabase.from('app_users'),
  accounts: () => supabase.from('accounts'),
  contacts: () => supabase.from('contacts'),
  leads: () => supabase.from('leads'),
  deals: () => supabase.from('deals'),
  activities: () => supabase.from('activities'),
  quotes: () => supabase.from('quotes'),
  quoteLineItems: () => supabase.from('quote_line_items'),
  equipment: () => supabase.from('equipment'),
  inventoryItems: () => supabase.from('inventory_items'),
  purchaseOrders: () => supabase.from('purchase_orders'),
  suppliers: () => supabase.from('suppliers'),
  invoices: () => supabase.from('invoices'),
  payments: () => supabase.from('payments'),
  departments: () => supabase.from('departments'),
  employees: () => supabase.from('employees'),
  roles: () => supabase.from('roles'),
  permissions: () => supabase.from('permissions'),
  userRoles: () => supabase.from('user_roles'),
  rolePermissions: () => supabase.from('role_permissions'),
};

// Realtime subscriptions
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table,
        filter: filter,
      },
      callback
    )
    .subscribe();

  return channel;
};

// Storage helpers
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error };
  },
  
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
  
  delete: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },
};

// RBAC helpers
export const rbac = {
  hasPermission: async (permissionKey: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('has_permission', {
      perm_key: permissionKey,
    });
    return data || false;
  },
  
  hasRole: async (roleName: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('has_role', {
      role_name: roleName,
    });
    return data || false;
  },
  
  getUserPermissions: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];
    
    const { data, error } = await supabase
      .from('permissions')
      .select('permission_key, module, action')
      .eq('is_active', true)
      .eq('role_permissions.role_id.user_roles.user_id', user.user.id);
    
    return data || [];
  },
};

export default supabase;
