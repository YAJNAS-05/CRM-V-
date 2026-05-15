-- Create Finance tables (within everx_erp schema)

-- Create invoices table
CREATE TABLE everx_erp.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    so_id UUID REFERENCES everx_erp.sales_orders(id),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    entity VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'TAX_INVOICE',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    issue_date DATE,
    due_date DATE,
    currency CHAR(3),
    subtotal NUMERIC(15,2),
    tax_amount NUMERIC(15,2),
    total_amount NUMERIC(15,2),
    paid_amount NUMERIC(15,2) DEFAULT 0,
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_invoices_invoice_number ON everx_erp.invoices(invoice_number);
CREATE INDEX idx_invoices_account_id ON everx_erp.invoices(account_id);
CREATE INDEX idx_invoices_status ON everx_erp.invoices(status);
CREATE INDEX idx_invoices_due_date ON everx_erp.invoices(due_date);

-- Create payments table
CREATE TABLE everx_erp.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES everx_erp.invoices(id),
    amount NUMERIC(15,2) NOT NULL,
    currency CHAR(3),
    payment_date DATE NOT NULL,
    method VARCHAR(50),
    reference VARCHAR(255),
    exchange_rate NUMERIC(12,6),
    aud_equivalent NUMERIC(15,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_payments_invoice_id ON everx_erp.payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON everx_erp.payments(payment_date);

-- Create currency_rates table
CREATE TABLE everx_erp.currency_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency CHAR(3) NOT NULL,
    target_currency CHAR(3) NOT NULL,
    rate NUMERIC(12,6) NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(base_currency, target_currency)
);

CREATE INDEX idx_currency_rates_base_currency ON everx_erp.currency_rates(base_currency);
CREATE INDEX idx_currency_rates_fetched_at ON everx_erp.currency_rates(fetched_at);
