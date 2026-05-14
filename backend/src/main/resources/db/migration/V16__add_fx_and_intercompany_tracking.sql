-- V16: Add FX rate history and intercompany support
-- Tracks daily FX rates for historical FX gain/loss calculations

CREATE TABLE IF NOT EXISTS everx_erp.fx_rate_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency       VARCHAR(3) NOT NULL,
    to_currency         VARCHAR(3) NOT NULL,
    rate                NUMERIC(18,6) NOT NULL,
    rate_date           DATE NOT NULL,
    source              VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_currency, to_currency, rate_date)
);

CREATE INDEX IF NOT EXISTS idx_fx_rate_lookup 
    ON everx_erp.fx_rate_history (from_currency, to_currency, rate_date DESC);

-- Intercompany transaction tracking
CREATE TABLE IF NOT EXISTS everx_erp.intercompany_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selling_entity      VARCHAR(10) NOT NULL,
    buying_entity       VARCHAR(10) NOT NULL,
    transaction_type    VARCHAR(30) NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL,
    amount_aud          NUMERIC(15,2) NOT NULL,
    source_document     VARCHAR(50),
    transaction_date    DATE NOT NULL,
    elimination_status  VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                        CHECK (elimination_status IN ('PENDING','ELIMINATED')),
    elimination_period  VARCHAR(7),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ic_elimination_status 
    ON everx_erp.intercompany_transactions(elimination_status);

COMMENT ON TABLE everx_erp.fx_rate_history IS 'Historical FX rates for accurate gain/loss calculation on payment dates';
COMMENT ON TABLE everx_erp.intercompany_transactions IS 'Tracks IC transactions for consolidation elimination';
