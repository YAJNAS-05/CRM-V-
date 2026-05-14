-- FX rate locks, purchase receipts, and PO linkage for invoices

-- FX rate locks per invoice
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

CREATE INDEX IF NOT EXISTS idx_fx_rate_locks_invoice ON everx_erp.fx_rate_locks(invoice_id);

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

CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po ON everx_erp.purchase_receipts(po_id);

-- Add PO reference to invoices for AP matching
ALTER TABLE everx_erp.invoices
    ADD COLUMN IF NOT EXISTS po_id UUID;

CREATE INDEX IF NOT EXISTS idx_invoice_po_id ON everx_erp.invoices(po_id);
