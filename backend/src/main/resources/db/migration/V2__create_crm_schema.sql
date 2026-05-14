-- Create CRM schema
CREATE SCHEMA IF NOT EXISTS everx_crm;

-- Create accounts table
CREATE TABLE everx_crm.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    account_type VARCHAR(50),
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    assigned_to UUID REFERENCES everx_auth.users(id),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_accounts_company_name ON everx_crm.accounts(company_name);
CREATE INDEX idx_accounts_assigned_to ON everx_crm.accounts(assigned_to);
CREATE INDEX idx_accounts_created_at ON everx_crm.accounts(created_at);

-- Create contacts table
CREATE TABLE everx_crm.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    job_title VARCHAR(100),
    country VARCHAR(100),
    preferred_language VARCHAR(10),
    whatsapp_number VARCHAR(20),
    linkedin_url VARCHAR(255),
    source VARCHAR(50),
    assigned_to UUID REFERENCES everx_auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_contacts_account_id ON everx_crm.contacts(account_id);
CREATE INDEX idx_contacts_email ON everx_crm.contacts(email);
CREATE INDEX idx_contacts_assigned_to ON everx_crm.contacts(assigned_to);

-- Create leads table
CREATE TABLE everx_crm.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES everx_crm.contacts(id),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    source VARCHAR(50),
    equipment_interest TEXT[],
    estimated_value NUMERIC(15,2),
    currency CHAR(3),
    assigned_to UUID REFERENCES everx_auth.users(id),
    trade_show_id UUID,
    converted_deal_id UUID,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_leads_account_id ON everx_crm.leads(account_id);
CREATE INDEX idx_leads_contact_id ON everx_crm.leads(contact_id);
CREATE INDEX idx_leads_status ON everx_crm.leads(status);
CREATE INDEX idx_leads_assigned_to ON everx_crm.leads(assigned_to);

-- Create deals table
CREATE TABLE everx_crm.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES everx_crm.leads(id),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    contact_id UUID REFERENCES everx_crm.contacts(id),
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'ENQUIRY',
    deal_value NUMERIC(15,2),
    currency CHAR(3),
    probability INT DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to UUID REFERENCES everx_auth.users(id),
    lost_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_deals_account_id ON everx_crm.deals(account_id);
CREATE INDEX idx_deals_stage ON everx_crm.deals(stage);
CREATE INDEX idx_deals_assigned_to ON everx_crm.deals(assigned_to);
CREATE INDEX idx_deals_expected_close_date ON everx_crm.deals(expected_close_date);

-- Create quotes table
CREATE TABLE everx_crm.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES everx_crm.deals(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    issued_date DATE,
    expiry_date DATE,
    currency CHAR(3),
    subtotal NUMERIC(15,2),
    tax_amount NUMERIC(15,2),
    total_amount NUMERIC(15,2),
    notes TEXT,
    terms TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_quotes_deal_id ON everx_crm.quotes(deal_id);
CREATE INDEX idx_quotes_quote_number ON everx_crm.quotes(quote_number);
CREATE INDEX idx_quotes_status ON everx_crm.quotes(status);

-- Create quote_line_items table
CREATE TABLE everx_crm.quote_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES everx_crm.quotes(id) ON DELETE CASCADE,
    equipment_id UUID,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    discount_pct NUMERIC(5,2),
    line_total NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_quote_line_items_quote_id ON everx_crm.quote_line_items(quote_id);

-- Create activities table
CREATE TABLE everx_crm.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    description TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    contact_id UUID REFERENCES everx_crm.contacts(id),
    deal_id UUID REFERENCES everx_crm.deals(id),
    lead_id UUID REFERENCES everx_crm.leads(id),
    performed_by UUID REFERENCES everx_auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_activities_type ON everx_crm.activities(type);
CREATE INDEX idx_activities_performed_by ON everx_crm.activities(performed_by);
CREATE INDEX idx_activities_due_date ON everx_crm.activities(due_date);

-- Create trade_shows table
CREATE TABLE everx_crm.trade_shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    attendees UUID[],
    leads_captured INT DEFAULT 0,
    estimated_roi NUMERIC(15,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_trade_shows_start_date ON everx_crm.trade_shows(start_date);
