-- Add saga orchestration state and cryptographic audit logs

-- Schema for shared workflow state
CREATE SCHEMA IF NOT EXISTS everx_shared;

-- Saga state table
CREATE TABLE IF NOT EXISTS everx_shared.saga_states (
    id UUID PRIMARY KEY,
    saga_id VARCHAR(100) NOT NULL UNIQUE,
    reference_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    current_step VARCHAR(100) NOT NULL,
    context_json TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    retry_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_saga_reference ON everx_shared.saga_states(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_saga_status ON everx_shared.saga_states(status);

-- Cryptographic audit logs (write-once)
CREATE TABLE IF NOT EXISTS everx_auth.cryptographic_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45) NOT NULL,
    hash VARCHAR(500) NOT NULL,
    previous_hash VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_crypt_audit_entity ON everx_auth.cryptographic_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crypt_audit_user ON everx_auth.cryptographic_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crypt_audit_timestamp ON everx_auth.cryptographic_audit_logs(timestamp);

-- Prevent updates to locked cryptographic audit rows
CREATE OR REPLACE FUNCTION everx_auth.prevent_crypt_audit_update()
RETURNS trigger AS $$
BEGIN
    IF OLD.is_locked THEN
        RAISE EXCEPTION 'Cryptographic audit logs are immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_crypt_audit_update ON everx_auth.cryptographic_audit_logs;
CREATE TRIGGER trg_prevent_crypt_audit_update
BEFORE UPDATE ON everx_auth.cryptographic_audit_logs
FOR EACH ROW
EXECUTE FUNCTION everx_auth.prevent_crypt_audit_update();
