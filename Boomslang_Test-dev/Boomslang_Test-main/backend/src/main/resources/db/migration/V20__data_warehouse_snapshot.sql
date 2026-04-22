-- FIX #6: Data Warehouse Snapshot Schema
-- Nightly snapshots for compliance, audit trail immutability, and tax reporting
-- Read-only replicas prevent operational queries from affecting OLTP performance

-- Create schema for data warehouse
CREATE SCHEMA IF NOT EXISTS everx_dw;

-- Audit Trail Snapshot (immutable, append-only)
CREATE TABLE IF NOT EXISTS everx_dw.audit_trail_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    audit_log_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL,
    hash VARCHAR(500),
    previous_hash VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_audit_trail_snapshot_date ON everx_dw.audit_trail_snapshot(snapshot_date);
CREATE INDEX idx_dw_audit_trail_entity ON everx_dw.audit_trail_snapshot(entity_type, entity_id);

-- Invoice Snapshot (for tax year-end reconciliation)
CREATE TABLE IF NOT EXISTS everx_dw.invoice_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    invoice_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    company_id UUID NOT NULL,
    account_id UUID NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_invoice_snapshot_date ON everx_dw.invoice_snapshot(snapshot_date);
CREATE INDEX idx_dw_invoice_company ON everx_dw.invoice_snapshot(company_id);

-- GL Entry Snapshot (for balance verification)
CREATE TABLE IF NOT EXISTS everx_dw.gl_entry_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    gl_id UUID NOT NULL,
    company_id UUID NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100),
    posting_date DATE NOT NULL,
    debit_amount DECIMAL(19, 2),
    credit_amount DECIMAL(19, 2),
    reference_type VARCHAR(50),
    reference_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_gl_snapshot_date ON everx_dw.gl_entry_snapshot(snapshot_date);
CREATE INDEX idx_dw_gl_company_account ON everx_dw.gl_entry_snapshot(company_id, account_code);

-- FX Rate Snapshot (for historical analysis)
CREATE TABLE IF NOT EXISTS everx_dw.fx_rate_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    rate_date DATE NOT NULL,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(19, 6) NOT NULL,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_fx_snapshot_date ON everx_dw.fx_rate_snapshot(snapshot_date);
CREATE INDEX idx_dw_fx_currency_pair ON everx_dw.fx_rate_snapshot(from_currency, to_currency, rate_date);

-- Posting Period Snapshot (lock down fiscal periods)
CREATE TABLE IF NOT EXISTS everx_dw.posting_period_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    company_id UUID NOT NULL,
    period_name VARCHAR(20) NOT NULL,
    period_status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_posting_period_snapshot_date ON everx_dw.posting_period_snapshot(snapshot_date);
CREATE INDEX idx_dw_posting_period_company ON everx_dw.posting_period_snapshot(company_id);

-- Scheduled Job Log (for scheduler diagnostics)
CREATE TABLE IF NOT EXISTS everx_dw.scheduler_log_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    job_name VARCHAR(100) NOT NULL,
    job_status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_ms BIGINT,
    records_processed BIGINT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_scheduler_log_snapshot_date ON everx_dw.scheduler_log_snapshot(snapshot_date);
CREATE INDEX idx_dw_scheduler_log_job ON everx_dw.scheduler_log_snapshot(job_name);

-- Data Warehouse Metadata
CREATE TABLE IF NOT EXISTS everx_dw.dw_metadata (
    metadata_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    audit_trail_count BIGINT,
    invoice_count BIGINT,
    gl_entry_count BIGINT,
    fx_rate_count BIGINT,
    posting_period_count BIGINT,
    snapshot_status VARCHAR(20),
    snapshot_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dw_metadata_snapshot_date ON everx_dw.dw_metadata(snapshot_date);

-- Grant read-only access to DW schema
-- In production, create DW_USER role with SELECT-only permissions
-- GRANT USAGE ON SCHEMA everx_dw TO dw_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA everx_dw TO dw_user;
