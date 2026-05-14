-- Create schemas
CREATE SCHEMA IF NOT EXISTS everx_auth;
CREATE SCHEMA IF NOT EXISTS everx_crm;
CREATE SCHEMA IF NOT EXISTS everx_erp;
CREATE SCHEMA IF NOT EXISTS everx_hr;
CREATE SCHEMA IF NOT EXISTS everx_reporting;

-- Auth schema tables
CREATE TABLE IF NOT EXISTS everx_auth.users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    auth_id UUID,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    office_location VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url VARCHAR(500),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id UUID,
    old_values TEXT,
    new_values TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID,
    token TEXT NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.permissions (
    id UUID PRIMARY KEY,
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS everx_auth.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- CRM schema tables
CREATE TABLE IF NOT EXISTS everx_crm.accounts (
    id UUID PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    phone VARCHAR(20),
    industry VARCHAR(100),
    account_size VARCHAR(50),
    account_revenue_range VARCHAR(50),
    account_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.contacts (
    id UUID PRIMARY KEY,
    account_id UUID,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    title VARCHAR(100),
    department VARCHAR(100),
    contact_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.leads (
    id UUID PRIMARY KEY,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    lead_source VARCHAR(100),
    lead_status VARCHAR(50),
    lead_rating VARCHAR(50),
    initial_interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.deals (
    id UUID PRIMARY KEY,
    deal_name VARCHAR(255) NOT NULL,
    account_id UUID,
    contact_id UUID,
    deal_value NUMERIC(19,2),
    currency VARCHAR(3),
    deal_status VARCHAR(50),
    deal_stage VARCHAR(100),
    probability NUMERIC(5,2),
    close_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.quotes (
    id UUID PRIMARY KEY,
    deal_id UUID,
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    issued_date DATE,
    expiry_date DATE,
    currency VARCHAR(3),
    subtotal NUMERIC(19,2),
    tax_amount NUMERIC(19,2),
    total_amount NUMERIC(19,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.quote_line_items (
    id UUID PRIMARY KEY,
    quote_id UUID,
    description VARCHAR(500),
    quantity NUMERIC(19,2),
    unit_price NUMERIC(19,2),
    line_total NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_crm.activities (
    id UUID PRIMARY KEY,
    account_id UUID,
    contact_id UUID,
    activity_type VARCHAR(50),
    subject VARCHAR(255),
    description TEXT,
    activity_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    outcome VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- ERP schema tables
CREATE TABLE IF NOT EXISTS everx_erp.equipment (
    id UUID PRIMARY KEY,
    internal_code VARCHAR(50),
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    status VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.spare_parts (
    id UUID PRIMARY KEY,
    part_number VARCHAR(50),
    description VARCHAR(500),
    category VARCHAR(100),
    unit_cost NUMERIC(19,2),
    quantity_on_hand INTEGER,
    reorder_level INTEGER,
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.suppliers (
    id UUID PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    payment_terms VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.subcontractors (
    id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    specialization VARCHAR(255),
    rating NUMERIC(3,1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.warranties (
    id UUID PRIMARY KEY,
    equipment_id UUID,
    warranty_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    supplier_id UUID,
    coverage_details TEXT,
    cost NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.field_jobs (
    id UUID PRIMARY KEY,
    job_number VARCHAR(50) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    job_status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    linked_entity VARCHAR(100),
    linked_equipment_sku VARCHAR(100),
    linked_lead_id UUID,
    linked_po_id UUID,
    linked_sales_order_id UUID,
    linked_shipment_id UUID,
    linked_warranty_id UUID,
    linked_invoice_id UUID,
    account_id UUID,
    equipment_id UUID,
    client_or_seller_name VARCHAR(255),
    site_contact_name VARCHAR(255),
    site_contact_phone VARCHAR(20),
    site_contact_email VARCHAR(255),
    site_address_line1 VARCHAR(255),
    site_address_line2 VARCHAR(255),
    site_city VARCHAR(100),
    site_country VARCHAR(100),
    site_timezone VARCHAR(50),
    scheduled_start_date TIMESTAMP WITH TIME ZONE,
    scheduled_end_date TIMESTAMP WITH TIME ZONE,
    estimated_duration_days INTEGER,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    actual_duration_days INTEGER,
    primary_engineer_type VARCHAR(50),
    primary_engineer_id UUID,
    primary_engineer_name VARCHAR(255),
    secondary_engineer_id UUID,
    secondary_engineer_name VARCHAR(255),
    engineer_assigned_date TIMESTAMP WITH TIME ZONE,
    engineer_accepted BOOLEAN,
    engineer_accepted_date TIMESTAMP WITH TIME ZONE,
    internal_notes TEXT,
    client_brief_notes TEXT,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    under_warranty BOOLEAN NOT NULL DEFAULT FALSE,
    cost_estimate NUMERIC(15,2),
    cost_actual NUMERIC(15,2),
    currency CHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.inventory_items (
    id UUID PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(50),
    category VARCHAR(100),
    unit_cost NUMERIC(19,2),
    quantity_available INTEGER,
    quantity_reserved INTEGER,
    warehouse_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.purchase_orders (
    id UUID PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID,
    order_date DATE,
    expected_delivery DATE,
    status VARCHAR(50),
    total_amount NUMERIC(19,2),
    currency VARCHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.purchase_order_items (
    id UUID PRIMARY KEY,
    po_id UUID,
    item_name VARCHAR(255),
    quantity NUMERIC(19,2),
    unit_price NUMERIC(19,2),
    line_total NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.sales_orders (
    id UUID PRIMARY KEY,
    so_number VARCHAR(50) NOT NULL UNIQUE,
    account_id UUID,
    order_date DATE,
    delivery_date DATE,
    status VARCHAR(50),
    total_amount NUMERIC(19,2),
    currency VARCHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.sales_order_items (
    id UUID PRIMARY KEY,
    so_id UUID,
    item_name VARCHAR(255),
    quantity NUMERIC(19,2),
    unit_price NUMERIC(19,2),
    line_total NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    sales_order_id UUID,
    account_id UUID,
    invoice_date DATE,
    due_date DATE,
    amount_due NUMERIC(19,2),
    amount_paid NUMERIC(19,2),
    status VARCHAR(50),
    currency VARCHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.payments (
    id UUID PRIMARY KEY,
    invoice_id UUID,
    payment_date DATE,
    amount NUMERIC(19,2),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.shipments (
    id UUID PRIMARY KEY,
    sales_order_id UUID,
    shipment_date DATE,
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.currency_rates (
    id UUID PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL,
    base_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(19,4) NOT NULL,
    rate_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.fx_rate_history (
    id UUID PRIMARY KEY,
    currency_code VARCHAR(3),
    rate_date DATE,
    rate NUMERIC(19,4),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.posting_periods (
    id UUID PRIMARY KEY,
    period_name VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_locked BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.account_determination (
    id UUID PRIMARY KEY,
    module_code VARCHAR(50),
    transaction_type VARCHAR(100),
    account_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.invoice_tolerance_config (
    id UUID PRIMARY KEY,
    currency_code VARCHAR(3),
    tolerance_amount NUMERIC(19,2),
    tolerance_percentage NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.intercompany_transactions (
    id UUID PRIMARY KEY,
    source_company_id UUID,
    target_company_id UUID,
    transaction_date DATE,
    amount NUMERIC(19,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- HR schema tables
CREATE TABLE IF NOT EXISTS everx_hr.departments (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_department_id UUID,
    manager_employee_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.positions (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    grade VARCHAR(50),
    min_salary NUMERIC(15,2),
    max_salary NUMERIC(15,2),
    currency CHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.employees (
    id UUID PRIMARY KEY,
    user_id UUID,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department_id UUID,
    position_id UUID,
    manager_id UUID,
    employment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    hire_date DATE,
    termination_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_profiles (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    pay_type VARCHAR(50) NOT NULL,
    pay_frequency VARCHAR(50) NOT NULL,
    salary_amount NUMERIC(15,2),
    hourly_rate NUMERIC(15,2),
    currency CHAR(3),
    tax_id VARCHAR(100),
    bank_account_masked VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_runs (
    id UUID PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    run_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_items (
    id UUID PRIMARY KEY,
    payroll_run_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    gross_pay NUMERIC(15,2),
    deductions NUMERIC(15,2),
    net_pay NUMERIC(15,2),
    currency CHAR(3),
    status VARCHAR(50) NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.timesheets (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    field_job_id UUID,
    work_date DATE NOT NULL,
    hours_worked NUMERIC(10,2),
    status VARCHAR(50) NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.leave_requests (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- Reporting schema tables
CREATE TABLE IF NOT EXISTS everx_reporting.report_definitions (
    id UUID PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    module_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_reporting.report_run_log (
    id UUID PRIMARY KEY,
    report_id UUID,
    run_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_reporting.dashboard_layouts (
    id UUID PRIMARY KEY,
    layout_name VARCHAR(255),
    layout_config TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_reporting.report_shares (
    id UUID PRIMARY KEY,
    report_id UUID,
    shared_with_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_reporting.report_filter_presets (
    id UUID PRIMARY KEY,
    report_id UUID,
    preset_name VARCHAR(255),
    filter_config TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_reporting.scheduled_reports (
    id UUID PRIMARY KEY,
    report_id UUID,
    schedule_type VARCHAR(50),
    schedule_expression VARCHAR(255),
    recipient_emails VARCHAR(1000),
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- FX rate locks
CREATE TABLE IF NOT EXISTS everx_erp.fx_rate_locks (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    base_currency VARCHAR(3) NOT NULL,
    quote_currency VARCHAR(3) NOT NULL,
    locked_rate NUMERIC(12,6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50),
    locked_at DATE NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- Purchase receipts for 3-way match
CREATE TABLE IF NOT EXISTS everx_erp.purchase_receipts (
    id UUID PRIMARY KEY,
    po_id UUID NOT NULL,
    received_date DATE NOT NULL,
    total_quantity INTEGER NOT NULL,
    total_amount NUMERIC(15,2),
    currency VARCHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- Add PO linkage to invoices
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS po_id UUID;

-- Saga orchestration state
CREATE SCHEMA IF NOT EXISTS everx_shared;

CREATE TABLE IF NOT EXISTS everx_shared.saga_states (
    id UUID PRIMARY KEY,
    saga_id VARCHAR(100) NOT NULL,
    reference_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    current_step VARCHAR(100) NOT NULL,
    context_json TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retry_count INTEGER
);

-- Cryptographic audit logs
CREATE TABLE IF NOT EXISTS everx_auth.cryptographic_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45) NOT NULL,
    hash VARCHAR(500) NOT NULL,
    previous_hash VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE
);
