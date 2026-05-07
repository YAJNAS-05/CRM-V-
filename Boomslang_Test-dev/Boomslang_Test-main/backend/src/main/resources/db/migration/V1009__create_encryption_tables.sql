-- ============================================================================
-- Encryption & Data Protection Tables
-- ============================================================================

-- Encryption Key Management
CREATE TABLE IF NOT EXISTS everx_shared.encryption_keys (
    id UUID PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    key_version INT NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_material BYTEA NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    rotation_scheduled_at TIMESTAMP WITH TIME ZONE,
    rotated_at TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_encryption_keys_name_version UNIQUE (key_name, key_version)
);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_key_name 
    ON everx_shared.encryption_keys(key_name);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_is_active 
    ON everx_shared.encryption_keys(is_active);

-- Encrypted Field Registry (tracks which fields are encrypted)
CREATE TABLE IF NOT EXISTS everx_shared.encrypted_field_registry (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    encryption_key_id UUID NOT NULL,
    encryption_algorithm VARCHAR(50) NOT NULL,
    is_searchable BOOLEAN DEFAULT FALSE,
    search_hash_algorithm VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_encrypted_fields UNIQUE (entity_type, field_name),
    CONSTRAINT fk_encrypted_field_registry_key FOREIGN KEY (encryption_key_id) 
        REFERENCES everx_shared.encryption_keys(id)
);

CREATE INDEX IF NOT EXISTS idx_encrypted_field_registry_entity_type 
    ON everx_shared.encrypted_field_registry(entity_type);

CREATE INDEX IF NOT EXISTS idx_encrypted_field_registry_key_id 
    ON everx_shared.encrypted_field_registry(encryption_key_id);

-- Data Classification (for masking and access control)
CREATE TABLE IF NOT EXISTS everx_shared.data_classification (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    classification_level VARCHAR(50) NOT NULL,
    pii_type VARCHAR(50),
    masking_pattern VARCHAR(100),
    requires_consent BOOLEAN DEFAULT FALSE,
    retention_days INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_data_classification UNIQUE (entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_data_classification_entity_type 
    ON everx_shared.data_classification(entity_type);

CREATE INDEX IF NOT EXISTS idx_data_classification_classification_level 
    ON everx_shared.data_classification(classification_level);

-- Field-Level Permissions
CREATE TABLE IF NOT EXISTS everx_auth.field_level_permissions (
    id UUID PRIMARY KEY,
    role_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    is_masked_on_view BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_field_level_permissions UNIQUE (role_id, entity_type, field_name),
    CONSTRAINT fk_field_level_permissions_role FOREIGN KEY (role_id) 
        REFERENCES everx_auth.roles(id)
);

CREATE INDEX IF NOT EXISTS idx_field_level_permissions_role_id 
    ON everx_auth.field_level_permissions(role_id);

CREATE INDEX IF NOT EXISTS idx_field_level_permissions_entity_type 
    ON everx_auth.field_level_permissions(entity_type);

-- Row-Level Security Rules
CREATE TABLE IF NOT EXISTS everx_auth.row_level_security_rules (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_expression TEXT NOT NULL,
    role_id UUID,
    org_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_rls_rules UNIQUE (entity_type, rule_name),
    CONSTRAINT fk_rls_rules_role FOREIGN KEY (role_id) 
        REFERENCES everx_auth.roles(id)
);

CREATE INDEX IF NOT EXISTS idx_rls_rules_entity_type 
    ON everx_auth.row_level_security_rules(entity_type);

CREATE INDEX IF NOT EXISTS idx_rls_rules_is_active 
    ON everx_auth.row_level_security_rules(is_active);

-- Consent & Data Preferences
CREATE TABLE IF NOT EXISTS everx_shared.consent_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    consent_text TEXT,
    version VARCHAR(50),
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_consent_records_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id 
    ON everx_shared.consent_records(user_id);

CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type 
    ON everx_shared.consent_records(consent_type);

-- Insert default encryption key
INSERT INTO everx_shared.encryption_keys (id, key_name, key_version, algorithm, key_material, key_hash, is_active, created_at, updated_at, created_by, version)
VALUES (
    '550e8400-e29b-41d4-a716-446655440011'::UUID,
    'default_aes_256',
    1,
    'AES-256-GCM',
    'E\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'::BYTEA,
    'default_hash_placeholder',
    TRUE,
    NOW(),
    NOW(),
    NULL,
    0
) ON CONFLICT (key_hash) DO NOTHING;

-- Insert default data classification rules
INSERT INTO everx_shared.data_classification (id, entity_type, field_name, classification_level, pii_type, masking_pattern, requires_consent, retention_days, created_at, updated_at, created_by, version)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440021'::UUID, 'Employee', 'ssn', 'HIGHLY_SENSITIVE', 'SSN', 'XXX-XX-****', TRUE, 2555, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440022'::UUID, 'Employee', 'salary', 'HIGHLY_SENSITIVE', 'SALARY', '*****.*', TRUE, 2555, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440023'::UUID, 'Contact', 'email', 'SENSITIVE', 'EMAIL', '***@**.***', TRUE, 365, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440024'::UUID, 'Contact', 'phone_number', 'SENSITIVE', 'PHONE', 'XXX-XXX-****', TRUE, 365, NOW(), NOW(), NULL, 0)
ON CONFLICT (entity_type, field_name) DO NOTHING;
