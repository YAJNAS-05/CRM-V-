-- V15: Add configurable AP tolerance per company
-- Enables different tolerance rules for each legal entity

CREATE TABLE IF NOT EXISTS everx_erp.invoice_tolerance_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code        VARCHAR(10) NOT NULL UNIQUE,
    tolerance_pct       NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    tolerance_abs       NUMERIC(15,2) NOT NULL DEFAULT 100.00,
    updated_by          VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    version             BIGINT NOT NULL DEFAULT 0
);

INSERT INTO everx_erp.invoice_tolerance_config (company_code, tolerance_pct, tolerance_abs)
VALUES
    ('AU01', 5.00,  100.00),
    ('US01', 3.00,   75.00),
    ('JP01', 2.00,   50.00)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE everx_erp.invoice_tolerance_config IS 'GR/IR tolerance rules per company for 3-way matching';
COMMENT ON COLUMN everx_erp.invoice_tolerance_config.tolerance_pct IS 'Percentage variance allowed (variance/poAmount * 100)';
COMMENT ON COLUMN everx_erp.invoice_tolerance_config.tolerance_abs IS 'Absolute amount variance allowed in company currency';
