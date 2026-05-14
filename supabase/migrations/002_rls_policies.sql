-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to get from JWT claims first
    BEGIN
        user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
    EXCEPTION WHEN OTHERS THEN
        user_id := NULL;
    END;
    
    -- Fallback to auth.uid()
    IF user_id IS NULL THEN
        user_id := auth.uid();
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(perm_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    has_perm BOOLEAN;
BEGIN
    current_user_id := get_current_user_id();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user is SUPER_ADMIN (bypass all permissions)
    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.id = current_user_id AND r.name = 'SUPER_ADMIN' AND u.is_active = true
    ) INTO has_perm;
    
    IF has_perm THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = current_user_id 
        AND p.permission_key = perm_key
        AND u.is_active = true
        AND p.is_active = true
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    has_role BOOLEAN;
BEGIN
    current_user_id := get_current_user_id();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.id = current_user_id 
        AND r.name = role_name
        AND u.is_active = true
        AND r.is_active = true
    ) INTO has_role;
    
    RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================

CREATE POLICY "Users can view own profile" ON app_users
    FOR SELECT USING (
        id = get_current_user_id() 
        OR has_permission('users:read')
    );

CREATE POLICY "Users can update own profile" ON app_users
    FOR UPDATE USING (
        id = get_current_user_id() 
        OR has_permission('users:update')
    );

CREATE POLICY "Admins can create users" ON app_users
    FOR INSERT WITH CHECK (
        has_permission('users:create')
    );

CREATE POLICY "Admins can delete users" ON app_users
    FOR DELETE USING (
        has_permission('users:delete')
    );

-- ============================================
-- ROLES POLICIES
-- ============================================

CREATE POLICY "Authenticated can view roles" ON roles
    FOR SELECT USING (
        is_active = true 
        OR has_role('SUPER_ADMIN') 
        OR has_role('ADMIN')
    );

CREATE POLICY "Admins can manage roles" ON roles
    FOR ALL USING (
        has_permission('users:update')
    );

-- ============================================
-- PERMISSIONS POLICIES
-- ============================================

CREATE POLICY "Authenticated can view permissions" ON permissions
    FOR SELECT USING (
        is_active = true 
        OR has_role('SUPER_ADMIN') 
        OR has_role('ADMIN')
    );

-- ============================================
-- USER ROLES POLICIES
-- ============================================

CREATE POLICY "Admins can view user roles" ON user_roles
    FOR SELECT USING (
        has_permission('users:read')
    );

CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (
        has_permission('users:update')
    );

-- ============================================
-- ROLE PERMISSIONS POLICIES
-- ============================================

CREATE POLICY "Admins can view role permissions" ON role_permissions
    FOR SELECT USING (
        has_permission('users:read')
    );

CREATE POLICY "Admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        has_permission('users:update')
    );

-- ============================================
-- ACCOUNTS POLICIES
-- ============================================

CREATE POLICY "Users can view accounts" ON accounts
    FOR SELECT USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('accounts:read')
        )
    );

CREATE POLICY "Users can create accounts" ON accounts
    FOR INSERT WITH CHECK (
        has_permission('accounts:create')
    );

CREATE POLICY "Users can update own accounts or with permission" ON accounts
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('accounts:update')
        )
    );

CREATE POLICY "Users can delete accounts with permission" ON accounts
    FOR DELETE USING (
        is_deleted = false 
        AND has_permission('accounts:delete')
    );

-- ============================================
-- CONTACTS POLICIES
-- ============================================

CREATE POLICY "Users can view contacts" ON contacts
    FOR SELECT USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('contacts:read')
        )
    );

CREATE POLICY "Users can create contacts" ON contacts
    FOR INSERT WITH CHECK (
        has_permission('contacts:create')
    );

CREATE POLICY "Users can update own contacts or with permission" ON contacts
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('contacts:update')
        )
    );

CREATE POLICY "Users can delete contacts with permission" ON contacts
    FOR DELETE USING (
        is_deleted = false 
        AND has_permission('contacts:delete')
    );

-- ============================================
-- LEADS POLICIES
-- ============================================

CREATE POLICY "Users can view leads" ON leads
    FOR SELECT USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('leads:read')
        )
    );

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (
        has_permission('leads:create')
    );

CREATE POLICY "Users can update own leads or with permission" ON leads
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('leads:update')
        )
    );

CREATE POLICY "Users can delete leads with permission" ON leads
    FOR DELETE USING (
        is_deleted = false 
        AND has_permission('leads:delete')
    );

-- ============================================
-- DEALS POLICIES
-- ============================================

CREATE POLICY "Users can view deals" ON deals
    FOR SELECT USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('deals:read')
        )
    );

CREATE POLICY "Users can create deals" ON deals
    FOR INSERT WITH CHECK (
        has_permission('deals:create')
    );

CREATE POLICY "Users can update own deals or with permission" ON deals
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('deals:update')
        )
    );

CREATE POLICY "Users can delete deals with permission" ON deals
    FOR DELETE USING (
        is_deleted = false 
        AND has_permission('deals:delete')
    );

-- ============================================
-- ACTIVITIES POLICIES
-- ============================================

CREATE POLICY "Users can view activities" ON activities
    FOR SELECT USING (
        is_deleted = false 
        AND (
            assigned_to = get_current_user_id() 
            OR created_by = get_current_user_id()
            OR has_permission('activities:read')
        )
    );

CREATE POLICY "Users can create activities" ON activities
    FOR INSERT WITH CHECK (
        has_permission('activities:create')
    );

CREATE POLICY "Users can update own activities or with permission" ON activities
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            assigned_to = get_current_user_id() 
            OR created_by = get_current_user_id()
            OR has_permission('activities:update')
        )
    );

CREATE POLICY "Users can delete activities with permission" ON activities
    FOR DELETE USING (
        is_deleted = false 
        AND (
            created_by = get_current_user_id()
            OR has_permission('activities:delete')
        )
    );

-- ============================================
-- QUOTES POLICIES
-- ============================================

CREATE POLICY "Users can view quotes" ON quotes
    FOR SELECT USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('quotes:read')
        )
    );

CREATE POLICY "Users can create quotes" ON quotes
    FOR INSERT WITH CHECK (
        has_permission('quotes:create')
    );

CREATE POLICY "Users can update quotes" ON quotes
    FOR UPDATE USING (
        is_deleted = false 
        AND (
            owner_id = get_current_user_id() 
            OR has_permission('quotes:update')
        )
    );

CREATE POLICY "Users can delete quotes" ON quotes
    FOR DELETE USING (
        is_deleted = false 
        AND has_permission('quotes:delete')
    );

-- Quote line items inherit from parent quote
CREATE POLICY "Users can view quote line items" ON quote_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotes q 
            WHERE q.id = quote_line_items.quote_id 
            AND q.is_deleted = false
            AND (q.owner_id = get_current_user_id() OR has_permission('quotes:read'))
        )
    );

CREATE POLICY "Users can manage quote line items" ON quote_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quotes q 
            WHERE q.id = quote_line_items.quote_id 
            AND q.is_deleted = false
            AND (q.owner_id = get_current_user_id() OR has_permission('quotes:update'))
        )
    );

-- ============================================
-- INVENTORY & EQUIPMENT POLICIES
-- ============================================

CREATE POLICY "Users can view inventory" ON inventory_items
    FOR SELECT USING (
        is_deleted = false 
        AND has_permission('inventory:read')
    );

CREATE POLICY "Users can manage inventory" ON inventory_items
    FOR ALL USING (
        has_permission('inventory:update')
    );

CREATE POLICY "Users can view equipment" ON equipment
    FOR SELECT USING (
        is_deleted = false 
        AND has_permission('inventory:read')
    );

CREATE POLICY "Users can manage equipment" ON equipment
    FOR ALL USING (
        has_permission('inventory:update')
    );

-- ============================================
-- PURCHASE ORDERS POLICIES
-- ============================================

CREATE POLICY "Users can view purchase orders" ON purchase_orders
    FOR SELECT USING (
        is_deleted = false 
        AND has_permission('inventory:read')
    );

CREATE POLICY "Users can create purchase orders" ON purchase_orders
    FOR INSERT WITH CHECK (
        has_permission('inventory:create')
    );

CREATE POLICY "Users can update purchase orders" ON purchase_orders
    FOR UPDATE USING (
        is_deleted = false 
        AND has_permission('inventory:update')
    );

-- ============================================
-- SUPPLIERS POLICIES
-- ============================================

CREATE POLICY "Users can view suppliers" ON suppliers
    FOR SELECT USING (
        is_deleted = false 
        AND has_permission('inventory:read')
    );

CREATE POLICY "Users can manage suppliers" ON suppliers
    FOR ALL USING (
        has_permission('inventory:update')
    );

-- ============================================
-- INVOICES & PAYMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view invoices" ON invoices
    FOR SELECT USING (
        is_deleted = false 
        AND has_permission('invoices:read')
    );

CREATE POLICY "Users can create invoices" ON invoices
    FOR INSERT WITH CHECK (
        has_permission('invoices:create')
    );

CREATE POLICY "Users can update invoices" ON invoices
    FOR UPDATE USING (
        is_deleted = false 
        AND has_permission('invoices:update')
    );

CREATE POLICY "Users can view payments" ON payments
    FOR SELECT USING (
        has_permission('invoices:read')
    );

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (
        has_permission('invoices:create')
    );

-- ============================================
-- HR POLICIES
-- ============================================

CREATE POLICY "Users can view departments" ON departments
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view employees" ON employees
    FOR SELECT USING (
        has_role('HR') 
        OR has_role('ADMIN') 
        OR has_role('SUPER_ADMIN')
        OR user_id = get_current_user_id()
    );

-- ============================================
-- REALTIME SUBSCRIPTIONS SETUP
-- ============================================

CREATE POLICY "HR can manage employees" ON employees
    FOR ALL USING (
        has_role('HR') 
        OR has_role('ADMIN') 
        OR has_role('SUPER_ADMIN')
    );

-- ============================================
-- LEAD SCORES POLICIES
-- ============================================

CREATE POLICY "Users can view lead scores" ON lead_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads l 
            WHERE l.id = lead_scores.lead_id 
            AND l.is_deleted = false
            AND (l.owner_id = get_current_user_id() OR has_permission('leads:read'))
        )
    );

-- ============================================
-- REALTIME SUBSCRIPTIONS SETUP
-- ============================================

-- Add tables to realtime publication
BEGIN;
  -- Drop existing publication if exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication
  CREATE PUBLICATION supabase_realtime;
  
  -- Add tables for realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
  ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
  ALTER PUBLICATION supabase_realtime ADD TABLE leads;
  ALTER PUBLICATION supabase_realtime ADD TABLE deals;
  ALTER PUBLICATION supabase_realtime ADD TABLE activities;
  ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
  ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
  ALTER PUBLICATION supabase_realtime ADD TABLE payments;
  ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
  ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
COMMIT;
