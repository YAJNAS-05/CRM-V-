CREATE SCHEMA IF NOT EXISTS everx_shared;

CREATE TABLE IF NOT EXISTS everx_shared.custom_field_definitions (
    id UUID PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    field_key VARCHAR(60) NOT NULL,
    label VARCHAR(120) NOT NULL,
    data_type VARCHAR(30) NOT NULL,
    help_text TEXT,
    default_value TEXT,
    options_json TEXT,
    sort_order INT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_custom_field_definitions UNIQUE (module, entity, field_key)
);

CREATE TABLE IF NOT EXISTS everx_shared.custom_field_values (
    id UUID PRIMARY KEY,
    field_definition_id UUID NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_definition_entity
    ON everx_shared.custom_field_values(field_definition_id, entity_id);

CREATE TABLE IF NOT EXISTS everx_shared.layout_configs (
    id UUID PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    layout_json TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    version_number INT NOT NULL DEFAULT 1,
    applies_to_roles TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_layout_configs_module_entity_status
    ON everx_shared.layout_configs(module, entity, status);

ALTER TABLE everx_shared.layout_configs
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT';

ALTER TABLE everx_shared.layout_configs
    ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1;

ALTER TABLE everx_shared.layout_configs
    ADD COLUMN IF NOT EXISTS applies_to_roles TEXT;

ALTER TABLE everx_shared.layout_configs
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE everx_shared.layout_configs
    ADD COLUMN IF NOT EXISTS published_by UUID;
