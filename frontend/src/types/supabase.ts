export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Users & Auth
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: string;
          office_location: string;
          is_active: boolean;
          avatar_url: string | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_system: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Row']>;
      };
      
      permissions: {
        Row: {
          id: string;
          permission_key: string;
          module: string;
          action: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['permissions']['Row']>;
      };
      
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
      
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['role_permissions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>;
      };
      
      // CRM - Accounts
      accounts: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          account_type: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          billing_street: string | null;
          billing_city: string | null;
          billing_state: string | null;
          billing_zip: string | null;
          billing_country: string | null;
          annual_revenue: number | null;
          employees: number | null;
          description: string | null;
          owner_id: string | null;
          country: string | null;
          region: string | null;
          notes: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database['public']['Tables']['accounts']['Row']>;
      };
      
      // CRM - Contacts
      contacts: {
        Row: {
          id: string;
          account_id: string | null;
          salutation: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          job_title: string | null;
          department: string | null;
          gender: string | null;
          date_of_birth: string | null;
          lead_source: string | null;
          mailing_street: string | null;
          mailing_city: string | null;
          mailing_state: string | null;
          mailing_zip: string | null;
          mailing_country: string | null;
          linkedin_url: string | null;
          twitter_handle: string | null;
          description: string | null;
          do_not_call: boolean;
          email_opt_out: boolean;
          owner_id: string | null;
          country: string | null;
          preferred_language: string | null;
          whatsapp_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database['public']['Tables']['contacts']['Row']>;
      };
      
      // CRM - Leads
      leads: {
        Row: {
          id: string;
          salutation: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          company: string | null;
          job_title: string | null;
          lead_source: string | null;
          status: string;
          rating: number | null;
          website: string | null;
          street: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          country: string | null;
          annual_revenue: number | null;
          employees: number | null;
          description: string | null;
          is_converted: boolean;
          converted_at: string | null;
          converted_contact_id: string | null;
          converted_account_id: string | null;
          converted_deal_id: string | null;
          owner_id: string | null;
          account_id: string | null;
          contact_id: string | null;
          source: string | null;
          equipment_interest: string[] | null;
          currency: string | null;
          follow_up_date: string | null;
          title: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database['public']['Tables']['leads']['Row']>;
      };
      
      // CRM - Deal Stages
      deal_stages: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          probability: number;
          sort_order: number;
          is_active: boolean;
          is_closed: boolean;
          is_won: boolean;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['deal_stages']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deal_stages']['Row']>;
      };
      
      // CRM - Deals
      deals: {
        Row: {
          id: string;
          name: string;
          stage_id: string | null;
          stage: string;
          amount: number | null;
          probability: number | null;
          days_in_stage: number | null;
          days_in_pipeline: number | null;
          expected_revenue_weighted: number | null;
          expected_close_date: string | null;
          actual_close_date: string | null;
          lead_source: string | null;
          account_id: string | null;
          primary_contact_id: string | null;
          description: string | null;
          loss_reason: string | null;
          next_step: string | null;
          campaign_source: string | null;
          owner_id: string | null;
          lead_id: string | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      
      // CRM - Activities
      activities: {
        Row: {
          id: string;
          type: string;
          subject: string | null;
          description: string | null;
          due_date: string | null;
          completed_at: string | null;
          status: string | null;
          duration_mins: number | null;
          contact_id: string | null;
          deal_id: string | null;
          lead_id: string | null;
          account_id: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
          version: number;
        };
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'created_at' | 'updated_at' | 'version'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database['public']['Tables']['activities']['Row']>;
      };
      
      // Quotes
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          deal_id: string | null;
          account_id: string | null;
          contact_id: string | null;
          status: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          valid_until: string | null;
          terms: string | null;
          notes: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Row']>;
      };
      
      quote_line_items: {
        Row: {
          id: string;
          quote_id: string;
          product_name: string;
          description: string | null;
          quantity: number;
          unit_price: number;
          discount_percent: number;
          tax_percent: number;
          total_price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quote_line_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quote_line_items']['Row']>;
      };
      
      // Lead Scores
      lead_scores: {
        Row: {
          id: string;
          lead_id: string;
          score: number;
          factors: Json | null;
          calculated_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lead_scores']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lead_scores']['Row']>;
      };
      
      // ERP - Equipment
      equipment: {
        Row: {
          id: string;
          equipment_code: string;
          name: string;
          category: string | null;
          manufacturer: string | null;
          model: string | null;
          serial_number: string | null;
          description: string | null;
          purchase_date: string | null;
          purchase_cost: number | null;
          current_value: number | null;
          status: string;
          location: string | null;
          assigned_to: string | null;
          warranty_expiry: string | null;
          maintenance_due_date: string | null;
          condition: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['equipment']['Row']>;
      };
      
      // ERP - Inventory
      inventory_items: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          category: string | null;
          unit_of_measure: string | null;
          cost_price: number | null;
          selling_price: number | null;
          reorder_level: number;
          reorder_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>;
      };
      
      inventory_bins: {
        Row: {
          id: string;
          bin_code: string;
          location: string;
          zone: string | null;
          aisle: string | null;
          rack: string | null;
          shelf: string | null;
          max_capacity: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_bins']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_bins']['Row']>;
      };
      
      inventory_stock: {
        Row: {
          id: string;
          item_id: string;
          bin_id: string | null;
          quantity_on_hand: number;
          quantity_reserved: number;
          quantity_available: number;
          last_counted_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_stock']['Row'], 'id'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_stock']['Row']>;
      };
      
      // ERP - Purchase Orders
      purchase_orders: {
        Row: {
          id: string;
          po_number: string;
          supplier_id: string | null;
          status: string;
          order_date: string;
          expected_delivery_date: string | null;
          actual_delivery_date: string | null;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          total_amount: number;
          currency: string;
          notes: string | null;
          terms: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['purchase_orders']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['purchase_orders']['Row']>;
      };
      
      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          item_id: string | null;
          description: string;
          quantity_ordered: number;
          quantity_received: number;
          unit_price: number;
          total_price: number;
          expected_delivery_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_order_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['purchase_order_items']['Row']>;
      };
      
      // ERP - Suppliers
      suppliers: {
        Row: {
          id: string;
          supplier_code: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          postal_code: string | null;
          payment_terms: string | null;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>;
      };
      
      // Finance - Invoices
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          account_id: string | null;
          deal_id: string | null;
          order_id: string | null;
          status: string;
          issue_date: string;
          due_date: string;
          paid_date: string | null;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          amount_paid: number;
          balance_due: number;
          currency: string;
          notes: string | null;
          terms: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          is_deleted: boolean;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Row']>;
      };
      
      // Finance - Payments
      payments: {
        Row: {
          id: string;
          payment_number: string;
          invoice_id: string | null;
          account_id: string | null;
          amount: number;
          payment_date: string;
          payment_method: string;
          reference_number: string | null;
          currency: string;
          notes: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
      
      // HR - Departments
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          manager_id: string | null;
          parent_department_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['departments']['Row']>;
      };
      
      // HR - Employees
      employees: {
        Row: {
          id: string;
          user_id: string;
          employee_code: string;
          department_id: string | null;
          job_title: string | null;
          employment_type: string;
          employment_status: string;
          hire_date: string;
          termination_date: string | null;
          base_salary: number | null;
          currency: string;
          manager_id: string | null;
          office_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['employees']['Row']>;
      };
    };
    
    Functions: {
      get_current_user_id: {
        Returns: string;
      };
      has_permission: {
        Args: { perm_key: string };
        Returns: boolean;
      };
      has_role: {
        Args: { role_name: string };
        Returns: boolean;
      };
    };
  };
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Entity types
export type User = Tables<'users'>;
export type Role = Tables<'roles'>;
export type Permission = Tables<'permissions'>;
export type Account = Tables<'accounts'>;
export type Contact = Tables<'contacts'>;
export type Lead = Tables<'leads'>;
export type Deal = Tables<'deals'>;
export type DealStage = Tables<'deal_stages'>;
export type Activity = Tables<'activities'>;
export type Quote = Tables<'quotes'>;
export type Equipment = Tables<'equipment'>;
export type InventoryItem = Tables<'inventory_items'>;
export type PurchaseOrder = Tables<'purchase_orders'>;
export type Supplier = Tables<'suppliers'>;
export type Invoice = Tables<'invoices'>;
export type Payment = Tables<'payments'>;
export type Department = Tables<'departments'>;
export type Employee = Tables<'employees'>;
