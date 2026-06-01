-- ============================================
-- EVERX FINANCE MODULE - SCHEMA CREATION
-- ============================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS everx_finance;

-- ============================================
-- 1. CHART OF ACCOUNTS (GL_ACCOUNTS)
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.gl_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_SALES')),
    parent_account_id UUID REFERENCES everx_finance.gl_accounts(id) ON DELETE SET NULL,
    company_id UUID NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
    requires_cost_center BOOLEAN NOT NULL DEFAULT false,
    requires_department BOOLEAN NOT NULL DEFAULT false,
    allows_manual_entry BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(account_code, company_id),
    CONSTRAINT gl_accounts_hierarchy CHECK (parent_account_id IS NULL OR level > 1)
);

CREATE INDEX idx_gl_accounts_parent_account_id ON everx_finance.gl_accounts(parent_account_id);
CREATE INDEX idx_gl_accounts_company_id ON everx_finance.gl_accounts(company_id);
CREATE INDEX idx_gl_accounts_account_type ON everx_finance.gl_accounts(account_type);
CREATE INDEX idx_gl_accounts_is_deleted ON everx_finance.gl_accounts(is_deleted);

-- ============================================
-- 2. POSTING PERIODS (PERIOD MANAGEMENT)
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.posting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'LOCKED')),
    allow_manual_adjustments BOOLEAN NOT NULL DEFAULT false,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID,
    closing_notes TEXT,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(company_id, period_name),
    CONSTRAINT posting_periods_dates CHECK (start_date < end_date)
);

CREATE INDEX idx_posting_periods_company_id ON everx_finance.posting_periods(company_id);
CREATE INDEX idx_posting_periods_status ON everx_finance.posting_periods(status);
CREATE INDEX idx_posting_periods_dates ON everx_finance.posting_periods(start_date, end_date);

-- ============================================
-- 3. JOURNAL ENTRIES (GL MASTER RECORD)
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) NOT NULL UNIQUE,
    entry_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    posting_period_id UUID NOT NULL REFERENCES everx_finance.posting_periods(id),
    company_id UUID NOT NULL,
    reference VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED', 'VOID')),
    department_id UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    reversal_of_id UUID REFERENCES everx_finance.journal_entries(id) ON DELETE SET NULL,
    notes TEXT,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    CONSTRAINT je_approver_check CHECK (approved_by IS NULL OR approved_by != created_by)
);

CREATE INDEX idx_journal_entries_posting_period_id ON everx_finance.journal_entries(posting_period_id);
CREATE INDEX idx_journal_entries_company_id ON everx_finance.journal_entries(company_id);
CREATE INDEX idx_journal_entries_status ON everx_finance.journal_entries(status);
CREATE INDEX idx_journal_entries_posting_date ON everx_finance.journal_entries(posting_date);
CREATE INDEX idx_journal_entries_reversal_of_id ON everx_finance.journal_entries(reversal_of_id);

-- ============================================
-- 4. JOURNAL ENTRY LINES (GL DETAIL)
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES everx_finance.journal_entries(id) ON DELETE CASCADE,
    gl_account_id UUID NOT NULL REFERENCES everx_finance.gl_accounts(id),
    description TEXT,
    debit_amount NUMERIC(19, 2),
    credit_amount NUMERIC(19, 2),
    cost_center_id UUID,
    department_id UUID,
    project_id UUID,
    source_document_type VARCHAR(50),
    source_document_id UUID,
    reconciliation_status VARCHAR(30) DEFAULT 'UNRECONCILED' CHECK (reconciliation_status IN ('UNRECONCILED', 'RECONCILED', 'EXCEPTION')),
    
    -- Audit columns (immutable after posting)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT jel_amount_check CHECK ((debit_amount IS NOT NULL AND credit_amount IS NULL AND debit_amount > 0) 
                                        OR (credit_amount IS NOT NULL AND debit_amount IS NULL AND credit_amount > 0))
);

CREATE INDEX idx_journal_entry_lines_journal_entry_id ON everx_finance.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_gl_account_id ON everx_finance.journal_entry_lines(gl_account_id);
CREATE INDEX idx_journal_entry_lines_source_document ON everx_finance.journal_entry_lines(source_document_type, source_document_id);

-- ============================================
-- 5. GL POSTING AUDIT (IMMUTABLE AUDIT LOG)
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.gl_posting_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL,
    gl_account_id UUID NOT NULL REFERENCES everx_finance.gl_accounts(id),
    debit_amount NUMERIC(19, 2),
    credit_amount NUMERIC(19, 2),
    posting_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('POSTED', 'REVERSED')),
    reversed_by_entry_id UUID REFERENCES everx_finance.journal_entries(id) ON DELETE SET NULL,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    posted_by UUID NOT NULL,
    
    INDEX idx_gl_posting_audit_journal_entry ON (journal_entry_id),
    INDEX idx_gl_posting_audit_gl_account ON (gl_account_id),
    INDEX idx_gl_posting_audit_posting_date ON (posting_date)
);

-- ============================================
-- 6. ACCOUNTS PAYABLE - VENDOR INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    expected_payment_date DATE,
    po_id UUID,
    description TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    gross_amount NUMERIC(19, 2) NOT NULL CHECK (gross_amount > 0),
    tax_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(19, 2) NOT NULL CHECK (net_amount >= 0),
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(19, 2) DEFAULT 0,
    
    -- Posting & Reconciliation
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RECEIVED', 'APPROVED', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
    gl_account_id UUID REFERENCES everx_finance.gl_accounts(id),
    posting_date TIMESTAMP WITH TIME ZONE,
    matching_status VARCHAR(30) NOT NULL DEFAULT 'UNMATCHED' CHECK (matching_status IN ('UNMATCHED', 'MATCHED_PO', 'MATCHED_RECEIPT', 'THREE_WAY_MATCHED', 'EXCEPTION')),
    
    -- Approval
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    
    -- Aging & Compliance
    days_overdue INTEGER DEFAULT 0,
    late_fee_applicable BOOLEAN DEFAULT false,
    late_fee_amount NUMERIC(19, 2) DEFAULT 0,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(vendor_id, invoice_number),
    CONSTRAINT vi_dates_check CHECK (invoice_date <= due_date)
);

CREATE INDEX idx_vendor_invoices_vendor_id ON everx_finance.vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_status ON everx_finance.vendor_invoices(status);
CREATE INDEX idx_vendor_invoices_due_date ON everx_finance.vendor_invoices(due_date);
CREATE INDEX idx_vendor_invoices_matching_status ON everx_finance.vendor_invoices(matching_status);

-- ============================================
-- 7. ACCOUNTS PAYABLE - PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.ap_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_invoice_id UUID NOT NULL REFERENCES everx_finance.vendor_invoices(id),
    payment_date DATE NOT NULL,
    payment_amount NUMERIC(19, 2) NOT NULL CHECK (payment_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'ACH', 'LC', 'BARTER')),
    bank_account_id UUID,
    reference_number VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'PROCESSED', 'CLEARED', 'FAILED')),
    
    -- FX Tracking
    exchange_rate NUMERIC(19, 4) DEFAULT 1,
    amount_in_base_currency NUMERIC(19, 2),
    
    -- GL Posting
    payment_journal_entry_id UUID REFERENCES everx_finance.journal_entries(id),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_ap_payments_vendor_invoice_id ON everx_finance.ap_payments(vendor_invoice_id);
CREATE INDEX idx_ap_payments_status ON everx_finance.ap_payments(status);
CREATE INDEX idx_ap_payments_payment_date ON everx_finance.ap_payments(payment_date);

-- ============================================
-- 8. ACCOUNTS PAYABLE - AGING
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.ap_aging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    company_id UUID NOT NULL,
    as_of_date DATE NOT NULL,
    current NUMERIC(19, 2) DEFAULT 0,
    aging_30_60 NUMERIC(19, 2) DEFAULT 0,
    aging_60_90 NUMERIC(19, 2) DEFAULT 0,
    aging_90plus NUMERIC(19, 2) DEFAULT 0,
    total_due NUMERIC(19, 2) DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(vendor_id, as_of_date),
    INDEX idx_ap_aging_company_id (company_id),
    INDEX idx_ap_aging_as_of_date (as_of_date)
);

-- ============================================
-- 9. ACCOUNTS RECEIVABLE - CUSTOMER INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.customer_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    expected_payment_date DATE,
    so_id UUID,
    description TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    gross_amount NUMERIC(19, 2) NOT NULL CHECK (gross_amount > 0),
    tax_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(19, 2) NOT NULL CHECK (net_amount >= 0),
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(19, 2) DEFAULT 0,
    
    -- Posting & Reconciliation
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'OVERDUE', 'PARTIALLY_PAID', 'PAID', 'WRITTEN_OFF', 'CANCELLED')),
    gl_account_id UUID REFERENCES everx_finance.gl_accounts(id),
    posting_date TIMESTAMP WITH TIME ZONE,
    
    -- AR-Specific
    last_reminder_sent_date DATE,
    reminder_count INTEGER DEFAULT 0,
    credit_memo_linked_id UUID REFERENCES everx_finance.customer_invoices(id),
    
    -- Aging & Collections
    days_overdue INTEGER DEFAULT 0,
    late_fee_applicable BOOLEAN DEFAULT false,
    late_fee_amount NUMERIC(19, 2) DEFAULT 0,
    writeoff_eligible BOOLEAN DEFAULT false,
    writeoff_amount NUMERIC(19, 2) DEFAULT 0,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(customer_id, invoice_number),
    CONSTRAINT ci_dates_check CHECK (invoice_date <= due_date)
);

CREATE INDEX idx_customer_invoices_customer_id ON everx_finance.customer_invoices(customer_id);
CREATE INDEX idx_customer_invoices_status ON everx_finance.customer_invoices(status);
CREATE INDEX idx_customer_invoices_due_date ON everx_finance.customer_invoices(due_date);

-- ============================================
-- 10. ACCOUNTS RECEIVABLE - PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.ar_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_invoice_id UUID NOT NULL REFERENCES everx_finance.customer_invoices(id),
    payment_date DATE NOT NULL,
    payment_amount NUMERIC(19, 2) NOT NULL CHECK (payment_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'ACH', 'CASH')),
    reference_number VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLEARED', 'FAILED', 'REVERSED')),
    
    -- FX & GL
    exchange_rate NUMERIC(19, 4) DEFAULT 1,
    amount_in_base_currency NUMERIC(19, 2),
    bank_deposit_id UUID,
    payment_journal_entry_id UUID REFERENCES everx_finance.journal_entries(id),
    
    -- Reconciliation
    reconciled_at TIMESTAMP WITH TIME ZONE,
    bank_statement_id UUID,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_ar_payments_customer_invoice_id ON everx_finance.ar_payments(customer_invoice_id);
CREATE INDEX idx_ar_payments_status ON everx_finance.ar_payments(status);
CREATE INDEX idx_ar_payments_payment_date ON everx_finance.ar_payments(payment_date);

-- ============================================
-- 11. ACCOUNTS RECEIVABLE - CREDIT LIMITS
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.ar_credit_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE,
    credit_limit NUMERIC(19, 2) NOT NULL CHECK (credit_limit > 0),
    available_credit NUMERIC(19, 2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    approved_by UUID,
    approved_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'EXPIRED')),
    suspension_reason TEXT,
    
    -- Audit columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_ar_credit_limits_status ON everx_finance.ar_credit_limits(status);

-- ============================================
-- 12. ACCOUNTS RECEIVABLE - AGING
-- ============================================
CREATE TABLE IF NOT EXISTS everx_finance.ar_aging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    as_of_date DATE NOT NULL,
    current NUMERIC(19, 2) DEFAULT 0,
    aging_30_60 NUMERIC(19, 2) DEFAULT 0,
    aging_60_90 NUMERIC(19, 2) DEFAULT 0,
    aging_90plus NUMERIC(19, 2) DEFAULT 0,
    total_due NUMERIC(19, 2) DEFAULT 0,
    days_of_sales_outstanding INTEGER,
    last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(customer_id, as_of_date),
    INDEX idx_ar_aging_as_of_date (as_of_date)
);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
ALTER SCHEMA everx_finance OWNER TO postgres;
