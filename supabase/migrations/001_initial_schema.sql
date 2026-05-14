-- EverX CRM/ERP Supabase Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS lead_scores CASCADE;
DROP TABLE IF EXISTS quote_line_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS deal_stages CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS inventory_stock CASCADE;
DROP TABLE IF EXISTS inventory_bins CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- ============================================
-- AUTH & RBAC TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    office_location VARCHAR(50) NOT NULL DEFAULT 'MAIN_OFFICE',
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-Role junction table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Role-Permission junction table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_revoked BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- CRM TABLES
-- ============================================

-- Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    account_type VARCHAR(50),
    website TEXT,
    phone VARCHAR(30),
    email VARCHAR(255),
    billing_street TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_zip VARCHAR(20),
    billing_country VARCHAR(100),
    annual_revenue DECIMAL(15,2),
    employees INTEGER,
    description TEXT,
    owner_id UUID REFERENCES app_users(id),
    country VARCHAR(100),
    region VARCHAR(100),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    job_title VARCHAR(150),
    department VARCHAR(100),
    gender VARCHAR(20),
    date_of_birth DATE,
    lead_source VARCHAR(50),
    mailing_street TEXT,
    mailing_city VARCHAR(100),
    mailing_state VARCHAR(100),
    mailing_zip VARCHAR(20),
    mailing_country VARCHAR(100),
    linkedin_url TEXT,
    twitter_handle VARCHAR(100),
    description TEXT,
    do_not_call BOOLEAN NOT NULL DEFAULT false,
    email_opt_out BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID REFERENCES app_users(id),
    country VARCHAR(100),
    preferred_language VARCHAR(50),
    whatsapp_number VARCHAR(30),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    company VARCHAR(255),
    job_title VARCHAR(150),
    lead_source VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    rating INTEGER,
    website TEXT,
    street TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100),
    annual_revenue DECIMAL(15,2),
    employees INTEGER,
    description TEXT,
    is_converted BOOLEAN NOT NULL DEFAULT false,
    converted_at TIMESTAMPTZ,
    converted_contact_id UUID REFERENCES contacts(id),
    converted_account_id UUID REFERENCES accounts(id),
    converted_deal_id UUID,
    owner_id UUID REFERENCES app_users(id),
    account_id UUID REFERENCES accounts(id),
    contact_id UUID REFERENCES contacts(id),
    source VARCHAR(50),
    equipment_interest TEXT[],
    currency VARCHAR(3),
    follow_up_date DATE,
    title VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Deal stages enum as table for flexibility
CREATE TABLE deal_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    probability INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    is_won BOOLEAN NOT NULL DEFAULT false,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stage_id UUID REFERENCES deal_stages(id),
    stage VARCHAR(50) NOT NULL DEFAULT 'PROSPECTING',
    amount DECIMAL(15,2),
    probability INTEGER,
    days_in_stage INTEGER,
    days_in_pipeline INTEGER,
    expected_revenue_weighted DECIMAL(15,2),
    expected_close_date DATE,
    actual_close_date DATE,
    lead_source VARCHAR(50),
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    description TEXT,
    loss_reason TEXT,
    next_step VARCHAR(255),
    campaign_source VARCHAR(100),
    owner_id UUID REFERENCES app_users(id),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status VARCHAR(20),
    duration_mins INTEGER,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- Quote tables
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(100) NOT NULL UNIQUE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    valid_until DATE,
    terms TEXT,
    notes TEXT,
    owner_id UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lead scoring
CREATE TABLE lead_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    factors JSONB,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ERP TABLES - Equipment & Inventory
-- ============================================

-- Equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    description TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(15,2),
    current_value DECIMAL(15,2),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(255),
    assigned_to UUID REFERENCES app_users(id),
    warranty_expiry DATE,
    maintenance_due_date DATE,
    condition VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Inventory items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(20),
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    reorder_level INTEGER NOT NULL DEFAULT 0,
    reorder_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Inventory bins/locations
CREATE TABLE inventory_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    zone VARCHAR(50),
    aisle VARCHAR(20),
    rack VARCHAR(20),
    shelf VARCHAR(20),
    max_capacity DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory stock levels
CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES inventory_bins(id) ON DELETE SET NULL,
    quantity_on_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_reserved DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_available DECIMAL(10,2) NOT NULL DEFAULT 0,
    last_counted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, bin_id)
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    approved_by UUID REFERENCES app_users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id),
    description TEXT NOT NULL,
    quantity_ordered DECIMAL(10,2) NOT NULL,
    quantity_received DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    expected_delivery_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    payment_terms VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- HR TABLES
-- ============================================

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES app_users(id),
    parent_department_id UUID REFERENCES departments(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee details (extends users)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    job_title VARCHAR(150),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
    employment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    hire_date DATE NOT NULL,
    termination_date DATE,
    base_salary DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    manager_id UUID REFERENCES employees(id),
    office_location VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FINANCE TABLES
-- ============================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    account_id UUID REFERENCES accounts(id),
    deal_id UUID REFERENCES deals(id),
    order_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON app_users(email);
CREATE INDEX idx_users_role ON app_users(role);
CREATE INDEX idx_users_is_active ON app_users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_is_deleted ON app_users(is_deleted) WHERE is_deleted = false;

-- CRM indexes
CREATE INDEX idx_accounts_name ON accounts(name);
CREATE INDEX idx_accounts_owner ON accounts(owner_id);
CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
CREATE INDEX idx_activities_due_date ON activities(due_date);

-- ERP indexes
CREATE INDEX idx_equipment_code ON equipment(equipment_code);
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_supplier_code ON suppliers(supplier_code);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = COALESCE(NEW.version, 0) + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all main tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default deal stages
INSERT INTO deal_stages (name, display_name, probability, sort_order, color) VALUES
('PROSPECTING', 'Prospecting', 10, 1, '#6B7280'),
('QUALIFICATION', 'Qualification', 25, 2, '#3B82F6'),
('PROPOSAL', 'Proposal', 50, 3, '#8B5CF6'),
('NEGOTIATION', 'Negotiation', 75, 4, '#F59E0B'),
('CLOSED_WON', 'Closed Won', 100, 5, '#10B981'),
('CLOSED_LOST', 'Closed Lost', 0, 6, '#EF4444');

-- Insert default roles
INSERT INTO roles (name, description, is_system) VALUES
('SUPER_ADMIN', 'Full system access', true),
('ADMIN', 'Administrator with most privileges', true),
('MANAGER', 'Manager role with team oversight', true),
('SALES_REP', 'Sales representative', true),
('SALES_MANAGER', 'Sales team manager', true),
('HR', 'Human Resources', true),
('FINANCE', 'Finance and accounting', true),
('VIEWER', 'Read-only access', true),
('EMPLOYEE', 'Standard employee', true);

-- Insert default permissions
INSERT INTO permissions (permission_key, module, action, description) VALUES
-- Users
('users:read', 'users', 'read', 'View users'),
('users:create', 'users', 'create', 'Create users'),
('users:update', 'users', 'update', 'Update users'),
('users:delete', 'users', 'delete', 'Delete users'),
-- Accounts
('accounts:read', 'accounts', 'read', 'View accounts'),
('accounts:create', 'accounts', 'create', 'Create accounts'),
('accounts:update', 'accounts', 'update', 'Update accounts'),
('accounts:delete', 'accounts', 'delete', 'Delete accounts'),
-- Contacts
('contacts:read', 'contacts', 'read', 'View contacts'),
('contacts:create', 'contacts', 'create', 'Create contacts'),
('contacts:update', 'contacts', 'update', 'Update contacts'),
('contacts:delete', 'contacts', 'delete', 'Delete contacts'),
-- Leads
('leads:read', 'leads', 'read', 'View leads'),
('leads:create', 'leads', 'create', 'Create leads'),
('leads:update', 'leads', 'update', 'Update leads'),
('leads:delete', 'leads', 'delete', 'Delete leads'),
('leads:convert', 'leads', 'convert', 'Convert leads'),
-- Deals
('deals:read', 'deals', 'read', 'View deals'),
('deals:create', 'deals', 'create', 'Create deals'),
('deals:update', 'deals', 'update', 'Update deals'),
('deals:delete', 'deals', 'delete', 'Delete deals'),
-- Activities
('activities:read', 'activities', 'read', 'View activities'),
('activities:create', 'activities', 'create', 'Create activities'),
('activities:update', 'activities', 'update', 'Update activities'),
('activities:delete', 'activities', 'delete', 'Delete activities'),
-- Inventory
('inventory:read', 'inventory', 'read', 'View inventory'),
('inventory:create', 'inventory', 'create', 'Create inventory items'),
('inventory:update', 'inventory', 'update', 'Update inventory'),
('inventory:delete', 'inventory', 'delete', 'Delete inventory'),
-- Quotes
('quotes:read', 'quotes', 'read', 'View quotes'),
('quotes:create', 'quotes', 'create', 'Create quotes'),
('quotes:update', 'quotes', 'update', 'Update quotes'),
('quotes:delete', 'quotes', 'delete', 'Delete quotes'),
-- Invoices
('invoices:read', 'invoices', 'read', 'View invoices'),
('invoices:create', 'invoices', 'create', 'Create invoices'),
('invoices:update', 'invoices', 'update', 'Update invoices'),
('invoices:delete', 'invoices', 'delete', 'Delete invoices');

-- Assign all permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN';

-- Assign read permissions to VIEWER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'VIEWER' AND p.action = 'read';
