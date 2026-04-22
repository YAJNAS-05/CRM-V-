-- Flyway Migration V27: Inventory stock ledger, bins, transfers

CREATE TABLE IF NOT EXISTS everx_erp.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(50),
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER,
    maximum_stock INTEGER,
    reorder_point INTEGER,
    unit_cost NUMERIC(15,2),
    selling_price NUMERIC(15,2),
    supplier_id UUID,
    supplier_name VARCHAR(255),
    location VARCHAR(100),
    barcode VARCHAR(150),
    sku VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

ALTER TABLE everx_erp.inventory_items
    ADD COLUMN IF NOT EXISTS reorder_point INTEGER;

ALTER TABLE everx_erp.inventory_items
    ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255);

ALTER TABLE everx_erp.inventory_items
    ADD COLUMN IF NOT EXISTS barcode VARCHAR(150);

ALTER TABLE everx_erp.inventory_items
    ADD COLUMN IF NOT EXISTS sku VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_inventory_item_code ON everx_erp.inventory_items(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON everx_erp.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON everx_erp.inventory_items(status);

CREATE TABLE IF NOT EXISTS everx_erp.inventory_bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    location VARCHAR(100) NOT NULL,
    on_hand INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER,
    min_stock INTEGER,
    max_stock INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_inventory_bin UNIQUE (item_id, location)
);

CREATE INDEX IF NOT EXISTS idx_inventory_bins_item ON everx_erp.inventory_bins(item_id);

CREATE TABLE IF NOT EXISTS everx_erp.inventory_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    location VARCHAR(100),
    quantity_change INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    entry_type VARCHAR(30) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    unit_cost NUMERIC(15,2),
    total_cost NUMERIC(15,2),
    notes TEXT,
    transaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inventory_ledger_item ON everx_erp.inventory_ledger_entries(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_location ON everx_erp.inventory_ledger_entries(location);

CREATE TABLE IF NOT EXISTS everx_erp.inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    item_id UUID NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inventory_transfers_item ON everx_erp.inventory_transfers(item_id);
