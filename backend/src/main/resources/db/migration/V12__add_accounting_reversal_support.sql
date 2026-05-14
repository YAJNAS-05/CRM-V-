-- V12: Add accounting document reversal support
-- This migration adds fields to track invoice reversals and supports the VOID status

ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS reversal_of UUID REFERENCES everx_erp.invoices(id) ON DELETE SET NULL;
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS reversed_by VARCHAR(50);
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS reversal_reason VARCHAR(50);
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS reversal_note TEXT;

-- Create index for reversal lookups
CREATE INDEX IF NOT EXISTS idx_invoices_reversal_of ON everx_erp.invoices(reversal_of);
CREATE INDEX IF NOT EXISTS idx_invoices_void_status ON everx_erp.invoices(status) WHERE status = 'VOID';

-- Add COMMENT documentation for reversal fields
COMMENT ON COLUMN everx_erp.invoices.reversal_of IS 'UUID of the original invoice being reversed. NULL for non-reversal invoices.';
COMMENT ON COLUMN everx_erp.invoices.reversed_by IS 'Invoice number of the reversal document. Set when original invoice is voided.';
COMMENT ON COLUMN everx_erp.invoices.reversal_reason IS 'Reason code for the reversal (WRONG_AMOUNT, WRONG_CUSTOMER, etc.)';
COMMENT ON COLUMN everx_erp.invoices.reversal_note IS 'Free-text note explaining the reversal reason in detail.';
