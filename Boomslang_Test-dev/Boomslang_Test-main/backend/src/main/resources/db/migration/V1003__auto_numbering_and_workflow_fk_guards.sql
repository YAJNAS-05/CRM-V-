-- Flyway Migration V1003: Auto numbering support and workflow FK guardrails

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'everx_erp'
          AND table_name = 'equipment_qc_records'
          AND column_name = 'qc_number'
    ) THEN
        ALTER TABLE everx_erp.equipment_qc_records
            ADD COLUMN qc_number VARCHAR(50);
    END IF;
END $$;

WITH ranked_qc_records AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS seq
    FROM everx_erp.equipment_qc_records
    WHERE qc_number IS NULL
)
UPDATE everx_erp.equipment_qc_records q
SET qc_number = 'QC-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(r.seq::TEXT, 4, '0')
FROM ranked_qc_records r
WHERE q.id = r.id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'everx_erp'
          AND table_name = 'equipment_qc_records'
          AND column_name = 'qc_number'
    ) THEN
        ALTER TABLE everx_erp.equipment_qc_records
            ALTER COLUMN qc_number SET NOT NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_equipment_qc_records_qc_number'
    ) THEN
        ALTER TABLE everx_erp.equipment_qc_records
            ADD CONSTRAINT uk_equipment_qc_records_qc_number UNIQUE (qc_number);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_acquisitions_equipment'
    ) THEN
        ALTER TABLE everx_erp.equipment_acquisitions
            ADD CONSTRAINT fk_equipment_acquisitions_equipment
                FOREIGN KEY (equipment_id) REFERENCES everx_erp.equipment(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_acquisitions_supplier'
    ) THEN
        ALTER TABLE everx_erp.equipment_acquisitions
            ADD CONSTRAINT fk_equipment_acquisitions_supplier
                FOREIGN KEY (supplier_id) REFERENCES everx_erp.suppliers(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_acquisitions_purchase_order'
    ) THEN
        ALTER TABLE everx_erp.equipment_acquisitions
            ADD CONSTRAINT fk_equipment_acquisitions_purchase_order
                FOREIGN KEY (purchase_order_id) REFERENCES everx_erp.purchase_orders(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_assessments_equipment'
    ) THEN
        ALTER TABLE everx_erp.equipment_assessments
            ADD CONSTRAINT fk_equipment_assessments_equipment
                FOREIGN KEY (equipment_id) REFERENCES everx_erp.equipment(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_assessments_acquisition'
    ) THEN
        ALTER TABLE everx_erp.equipment_assessments
            ADD CONSTRAINT fk_equipment_assessments_acquisition
                FOREIGN KEY (acquisition_id) REFERENCES everx_erp.equipment_acquisitions(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_site_assessments_sales_order'
    ) THEN
        ALTER TABLE everx_erp.site_assessments
            ADD CONSTRAINT fk_site_assessments_sales_order
                FOREIGN KEY (sales_order_id) REFERENCES everx_erp.sales_orders(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_qc_records_equipment'
    ) THEN
        ALTER TABLE everx_erp.equipment_qc_records
            ADD CONSTRAINT fk_equipment_qc_records_equipment
                FOREIGN KEY (equipment_id) REFERENCES everx_erp.equipment(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_qc_records_acquisition'
    ) THEN
        ALTER TABLE everx_erp.equipment_qc_records
            ADD CONSTRAINT fk_equipment_qc_records_acquisition
                FOREIGN KEY (acquisition_id) REFERENCES everx_erp.equipment_acquisitions(id) NOT VALID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_shipments_site_assessment'
    ) THEN
        ALTER TABLE everx_erp.shipments
            ADD CONSTRAINT fk_shipments_site_assessment
                FOREIGN KEY (site_assessment_id) REFERENCES everx_erp.site_assessments(id) NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_equipment_acquisitions_equipment ON everx_erp.equipment_acquisitions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assessments_equipment ON everx_erp.equipment_assessments(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_qc_records_acquisition ON everx_erp.equipment_qc_records(acquisition_id);
CREATE INDEX IF NOT EXISTS idx_site_assessments_account ON everx_erp.site_assessments(account_id);
