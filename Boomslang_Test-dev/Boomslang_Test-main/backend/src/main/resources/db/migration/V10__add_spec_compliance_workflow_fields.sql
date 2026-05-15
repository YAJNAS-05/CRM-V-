-- V10: Add spec-compliant workflow fields to Equipment and ServiceTicket
-- This migration adds support for the comprehensive EverX specification workflow triggers

-- Equipment enhancements for spec compliance
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS physical_status VARCHAR(50) DEFAULT 'AVAILABLE';
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS commercial_status VARCHAR(50) DEFAULT 'LEAD';
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS modality VARCHAR(50);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS compliance_standard VARCHAR(50);

-- Equipment QC workflow fields
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS qc_test_result VARCHAR(20);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS qc_test_date DATE;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS qc_notes TEXT;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS refurb_start_date DATE;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS refurb_end_date DATE;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS lead_refurb_engineer VARCHAR(100);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS tube_life_remaining INTEGER;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS image_quality_rating INTEGER;

-- ServiceTicket workflow fields for invoice trigger and billable tracking
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT FALSE;
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS is_under_warranty BOOLEAN DEFAULT FALSE;
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS linked_warranty_id UUID;
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS linked_invoice_id UUID;
ALTER TABLE everx_erp.service_tickets ADD COLUMN IF NOT EXISTS parts_used_ids TEXT[];

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_equipment_physical_status ON everx_erp.equipment(physical_status);
CREATE INDEX IF NOT EXISTS idx_equipment_commercial_status ON everx_erp.equipment(commercial_status);
CREATE INDEX IF NOT EXISTS idx_equipment_modality ON everx_erp.equipment(modality);
CREATE INDEX IF NOT EXISTS idx_equipment_compliance ON everx_erp.equipment(compliance_standard);
CREATE INDEX IF NOT EXISTS idx_service_ticket_billable ON everx_erp.service_tickets(is_billable);
CREATE INDEX IF NOT EXISTS idx_service_ticket_warranty ON everx_erp.service_tickets(is_under_warranty);

-- Add foreign key constraints for referential integrity
-- Note: Only add constraints if referenced tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'everx_erp' AND table_name = 'warranties') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'service_tickets' AND constraint_name = 'fk_service_ticket_warranty') THEN
      ALTER TABLE everx_erp.service_tickets ADD CONSTRAINT fk_service_ticket_warranty 
        FOREIGN KEY (linked_warranty_id) REFERENCES everx_erp.warranties(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Only add invoice FK if finance schema exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'everx_finance' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'service_tickets' AND constraint_name = 'fk_service_ticket_invoice') THEN
      ALTER TABLE everx_erp.service_tickets ADD CONSTRAINT fk_service_ticket_invoice 
        FOREIGN KEY (linked_invoice_id) REFERENCES everx_finance.invoices(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add comment documentation for spec compliance
COMMENT ON COLUMN everx_erp.equipment.physical_status IS 'Equipment physical state (AVAILABLE, RESERVED, IN_TRANSIT, INSTALLED, IN_MAINTENANCE, SCRAPPED, ON_CONSIGNMENT, IN_REFURBISHMENT)';
COMMENT ON COLUMN everx_erp.equipment.commercial_status IS 'Equipment commercial lifecycle (LEAD, QUOTED, NEGOTIATING, SOLD, WARRANTY_ACTIVE, WARRANTY_EXPIRED, LEASED, RENTED, DISPOSED)';
COMMENT ON COLUMN everx_erp.equipment.modality IS 'Medical equipment modality type (CT, MRI, ULTRASOUND, CATH_ANGIO, MAMMOGRAPHY, MOLECULAR_IMAGING, XRAY_FLUOROSCOPY, C_ARM_OPG_DEXA)';
COMMENT ON COLUMN everx_erp.service_tickets.is_billable IS 'Auto-set to true if NOT under warranty; triggers invoice creation on ticket resolution';
COMMENT ON COLUMN everx_erp.service_tickets.linked_invoice_id IS 'Auto-populated when invoice is created on ticket resolution (workflow trigger)';
