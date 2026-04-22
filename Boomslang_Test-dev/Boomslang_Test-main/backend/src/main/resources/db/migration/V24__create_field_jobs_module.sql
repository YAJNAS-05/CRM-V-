-- Flyway Migration V24: Field Jobs Module (ERP)
-- Creates enterprise-grade field job tracking in everx_erp schema

CREATE TABLE IF NOT EXISTS everx_erp.field_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    job_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(50) NOT NULL DEFAULT 'ROUTINE',

    linked_entity VARCHAR(100),
    linked_equipment_sku VARCHAR(100),
    linked_lead_id UUID,
    linked_po_id UUID,
    linked_sales_order_id UUID,
    linked_shipment_id UUID,
    linked_warranty_id UUID REFERENCES everx_erp.warranties(id),
    linked_invoice_id UUID REFERENCES everx_finance.invoices(id),

    account_id UUID REFERENCES everx_crm.accounts(id),
    equipment_id UUID REFERENCES everx_erp.equipment(id),

    client_or_seller_name VARCHAR(255),
    site_contact_name VARCHAR(255),
    site_contact_phone VARCHAR(20),
    site_contact_email VARCHAR(255),
    site_address_line1 VARCHAR(255),
    site_address_line2 VARCHAR(255),
    site_city VARCHAR(100),
    site_country VARCHAR(100),
    site_timezone VARCHAR(50),

    scheduled_start_date TIMESTAMPTZ,
    scheduled_end_date TIMESTAMPTZ,
    estimated_duration_days INTEGER,
    actual_start_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    actual_duration_days INTEGER,

    primary_engineer_type VARCHAR(50),
    primary_engineer_id UUID,
    primary_engineer_name VARCHAR(255),
    secondary_engineer_id UUID,
    secondary_engineer_name VARCHAR(255),
    engineer_assigned_date TIMESTAMPTZ,
    engineer_accepted BOOLEAN,
    engineer_accepted_date TIMESTAMPTZ,

    internal_notes TEXT,
    client_brief_notes TEXT,

    billable BOOLEAN NOT NULL DEFAULT true,
    under_warranty BOOLEAN NOT NULL DEFAULT false,
    cost_estimate NUMERIC(15,2),
    cost_actual NUMERIC(15,2),
    currency CHAR(3),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_field_jobs_status ON everx_erp.field_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_field_jobs_priority ON everx_erp.field_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_field_jobs_equipment ON everx_erp.field_jobs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_field_jobs_account ON everx_erp.field_jobs(account_id);
