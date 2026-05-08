ALTER TABLE everx_hr.reimbursement_requests
    ADD COLUMN IF NOT EXISTS paid_by UUID,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_reimbursement_paid_by
    ON everx_hr.reimbursement_requests (paid_by);

CREATE INDEX IF NOT EXISTS idx_reimbursement_paid_at
    ON everx_hr.reimbursement_requests (paid_at);
