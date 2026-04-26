-- Flyway Migration V1002: Add Boomslang workflow modules
-- Adds acquisitions, equipment assessments, site assessments, and equipment QC records.

CREATE TABLE IF NOT EXISTS everx_erp.equipment_acquisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acquisition_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID,
    supplier_id UUID,
    purchase_order_id UUID,
    equipment_source VARCHAR(50) NOT NULL,
    seller_name VARCHAR(255),
    stage VARCHAR(50) NOT NULL DEFAULT 'SOURCED',
    warehouse_location VARCHAR(100),
    refurb_cost NUMERIC(15,2),
    shipment_tracking VARCHAR(100),
    sourced_date DATE,
    assessed_date DATE,
    po_raised_date DATE,
    deinstalled_date DATE,
    arrived_warehouse_date DATE,
    refurbished_date DATE,
    qc_passed_date DATE,
    available_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.equipment_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_number VARCHAR(50) UNIQUE NOT NULL,
    acquisition_id UUID,
    equipment_id UUID,
    assessment_type VARCHAR(50) NOT NULL,
    inspection_date DATE,
    engineer_assigned VARCHAR(255),
    tube_life_remaining INTEGER,
    image_quality_rating INTEGER,
    condition_grade VARCHAR(20),
    outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.site_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_number VARCHAR(50) UNIQUE NOT NULL,
    sales_order_id UUID,
    account_id UUID NOT NULL,
    assessment_method VARCHAR(50),
    room_dimensions VARCHAR(100),
    power_compliant BOOLEAN,
    shielding_type VARCHAR(50),
    cooling_capacity VARCHAR(100),
    network_readiness VARCHAR(100),
    overall_readiness VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    remediation_required TEXT,
    assessed_date DATE,
    room_sign_off_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_erp.equipment_qc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL,
    acquisition_id UUID,
    qc_date DATE NOT NULL,
    engineer_assigned VARCHAR(255),
    phantom_scan_result VARCHAR(20) NOT NULL,
    image_quality_rating INTEGER,
    overall_result VARCHAR(50) NOT NULL,
    qc_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'everx_erp'
          AND table_name = 'shipments'
          AND column_name = 'site_assessment_id'
    ) THEN
        ALTER TABLE everx_erp.shipments ADD COLUMN site_assessment_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'everx_erp'
          AND table_name = 'shipments'
          AND column_name = 'site_readiness_confirmed'
    ) THEN
        ALTER TABLE everx_erp.shipments ADD COLUMN site_readiness_confirmed BOOLEAN DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_equipment_acquisitions_stage ON everx_erp.equipment_acquisitions(stage);
CREATE INDEX IF NOT EXISTS idx_equipment_acquisitions_supplier ON everx_erp.equipment_acquisitions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assessments_acquisition ON everx_erp.equipment_assessments(acquisition_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assessments_outcome ON everx_erp.equipment_assessments(outcome);
CREATE INDEX IF NOT EXISTS idx_site_assessments_sales_order ON everx_erp.site_assessments(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_site_assessments_readiness ON everx_erp.site_assessments(overall_readiness);
CREATE INDEX IF NOT EXISTS idx_equipment_qc_records_equipment ON everx_erp.equipment_qc_records(equipment_id);
