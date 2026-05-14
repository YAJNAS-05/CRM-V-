-- V13: Add posting period enforcement
-- This migration creates the posting_periods table for controlling transaction posting by fiscal period

CREATE TABLE IF NOT EXISTS everx_erp.posting_periods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code        VARCHAR(10) NOT NULL,
    fiscal_year         INTEGER NOT NULL,
    period              INTEGER NOT NULL CHECK (period BETWEEN 1 AND 12),
    status              VARCHAR(10) NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN', 'CLOSED', 'LOCKED')),
    opened_at           TIMESTAMP,
    closed_at           TIMESTAMP,
    closed_by           VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE (company_code, fiscal_year, period)
);

CREATE INDEX IF NOT EXISTS idx_posting_periods_company_year 
    ON everx_erp.posting_periods(company_code, fiscal_year);

CREATE INDEX IF NOT EXISTS idx_posting_periods_status 
    ON everx_erp.posting_periods(status);

-- Seed initial posting periods for 3 entities, current year
INSERT INTO everx_erp.posting_periods (company_code, fiscal_year, period, status, opened_at)
VALUES
    ('AU01', 2026, 1,  'CLOSED', NOW()),
    ('AU01', 2026, 2,  'CLOSED', NOW()),
    ('AU01', 2026, 3,  'CLOSED', NOW()),
    ('AU01', 2026, 4,  'OPEN',   NOW()),
    ('US01', 2026, 1,  'CLOSED', NOW()),
    ('US01', 2026, 2,  'CLOSED', NOW()),
    ('US01', 2026, 3,  'CLOSED', NOW()),
    ('US01', 2026, 4,  'OPEN',   NOW()),
    ('JP01', 2026, 1,  'CLOSED', NOW()),
    ('JP01', 2026, 2,  'CLOSED', NOW()),
    ('JP01', 2026, 3,  'CLOSED', NOW()),
    ('JP01', 2026, 4,  'OPEN',   NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE everx_erp.posting_periods IS 'Controls which fiscal periods are open for transaction posting. Prevents backdating.';
COMMENT ON COLUMN everx_erp.posting_periods.status IS 'OPEN=can post, CLOSED=cannot post, LOCKED=cannot reopen';
