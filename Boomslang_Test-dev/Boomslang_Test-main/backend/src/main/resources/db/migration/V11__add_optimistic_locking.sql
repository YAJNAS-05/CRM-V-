-- V11: Add optimistic locking support via @Version field
-- This migration adds the version column to all JPA entities for concurrent modification detection

-- ERP Tables
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.purchase_orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.purchase_order_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.sales_orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.sales_order_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.shipments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.warranties ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.spare_parts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.spare_part_orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.suppliers ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.subcontractors ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Finance Tables
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.payments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_erp.currency_rates ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- CRM Tables
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_crm.quotes ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE everx_crm.quote_line_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add COMMENT for documentation
COMMENT ON COLUMN everx_erp.equipment.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.purchase_orders.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.sales_orders.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.shipments.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.warranties.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.service_tickets.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.invoices.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_erp.payments.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_crm.accounts.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_crm.leads.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_crm.deals.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
COMMENT ON COLUMN everx_crm.quotes.version IS 'Optimistic locking version for concurrent modification detection. Incremented on each update.';
