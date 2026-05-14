-- V14: Add config-driven GL account determination
-- This migration enables GL accounts to be configured per company/transaction/valuation class

CREATE TABLE IF NOT EXISTS everx_erp.account_determination (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code        VARCHAR(10) NOT NULL,
    transaction_key     VARCHAR(10) NOT NULL,
    valuation_class     VARCHAR(20) NOT NULL,
    gl_account          VARCHAR(10) NOT NULL,
    description         TEXT,
    effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to        DATE,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    version             BIGINT NOT NULL DEFAULT 0,
    UNIQUE (company_code, transaction_key, valuation_class)
);

CREATE INDEX IF NOT EXISTS idx_account_det_company_trans_val 
    ON everx_erp.account_determination(company_code, transaction_key, valuation_class);

CREATE INDEX IF NOT EXISTS idx_account_det_active 
    ON everx_erp.account_determination(is_active);

-- Seed AU01 (Australia) account determination
INSERT INTO everx_erp.account_determination (company_code, transaction_key, valuation_class, gl_account, description)
VALUES
    ('AU01', 'BSX', 'EQUIP',   '1200', 'Equipment inventory'),
    ('AU01', 'BSX', 'PARTS',   '1201', 'Spare parts inventory'),
    ('AU01', 'GBB', 'EQUIP',   '5000', 'Cost of equipment sold'),
    ('AU01', 'GBB', 'PARTS',   '5001', 'Cost of parts sold'),
    ('AU01', 'PRD', 'EQUIP',   '5010', 'Purchase price variance'),
    ('AU01', 'FRE', 'EQUIP',   '5003', 'Freight in'),
    ('AU01', 'WRX', 'EQUIP',   '2050', 'GR/IR clearing'),
    ('AU01', 'ARC', 'TRADE',   '1100', 'Accounts receivable'),
    ('AU01', 'REV', 'EQUIP',   '4000', 'Equipment sales revenue'),
    ('AU01', 'REV', 'PARTS',   '4001', 'Spare parts revenue'),
    ('AU01', 'REV', 'SERVICE', '4002', 'Service revenue'),
    ('AU01', 'TAX', 'GST_OUT', '2100', 'GST collected output tax'),
    ('AU01', 'TAX', 'GST_IN',  '2101', 'GST paid input tax credit'),
    ('AU01', 'APL', 'TRADE',   '2000', 'Accounts payable'),
    ('AU01', 'FXG', 'FX',      '7000', 'FX gain'),
    ('AU01', 'FXL', 'FX',      '7001', 'FX loss'),
    
-- Seed US01 (United States)
    ('US01', 'BSX', 'EQUIP',   '1200', 'Equipment inventory'),
    ('US01', 'BSX', 'PARTS',   '1201', 'Spare parts inventory'),
    ('US01', 'GBB', 'EQUIP',   '5000', 'Cost of equipment sold'),
    ('US01', 'GBB', 'PARTS',   '5001', 'Cost of parts sold'),
    ('US01', 'ARC', 'TRADE',   '1100', 'Accounts receivable'),
    ('US01', 'REV', 'EQUIP',   '4000', 'Equipment sales revenue'),
    ('US01', 'REV', 'PARTS',   '4001', 'Spare parts revenue'),
    ('US01', 'REV', 'SERVICE', '4002', 'Service revenue'),
    ('US01', 'APL', 'TRADE',   '2000', 'Accounts payable'),
    ('US01', 'FXG', 'FX',      '7000', 'FX gain'),
    ('US01', 'FXL', 'FX',      '7001', 'FX loss'),
    
-- Seed JP01 (Japan)
    ('JP01', 'BSX', 'EQUIP',   '1200', 'Equipment inventory'),
    ('JP01', 'BSX', 'PARTS',   '1201', 'Spare parts inventory'),
    ('JP01', 'GBB', 'EQUIP',   '5000', 'Cost of equipment sold'),
    ('JP01', 'GBB', 'PARTS',   '5001', 'Cost of parts sold'),
    ('JP01', 'ARC', 'TRADE',   '1100', 'Accounts receivable'),
    ('JP01', 'REV', 'EQUIP',   '4000', 'Equipment sales revenue'),
    ('JP01', 'REV', 'PARTS',   '4001', 'Spare parts revenue'),
    ('JP01', 'REV', 'SERVICE', '4002', 'Service revenue'),
    ('JP01', 'APL', 'TRADE',   '2000', 'Accounts payable'),
    ('JP01', 'FXG', 'FX',      '7000', 'FX gain'),
    ('JP01', 'FXL', 'FX',      '7001', 'FX loss')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE everx_erp.account_determination IS 'Maps transaction types to GL accounts per company. Enables config-driven account assignments.';
COMMENT ON COLUMN everx_erp.account_determination.transaction_key IS 'Transaction classification (BSX=inventory, GBB=COGS, REV=revenue, TAX=tax, etc.)';
COMMENT ON COLUMN everx_erp.account_determination.valuation_class IS 'Product/transaction classification (EQUIP, PARTS, SERVICE, TRADE, FX, etc.)';
