-- ============================================================================
-- Audit & Compliance Tables for Immutable Audit Trail
-- ============================================================================

-- Immutable Audit Logs (cannot be updated or deleted)
CREATE TABLE IF NOT EXISTS everx_auth.audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    request_id VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    operation_type VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    change_summary TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id UUID,
    correlation_id VARCHAR(255),
    error_code VARCHAR(50),
    error_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    response_time_ms INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

-- Create index for immutability - add constraint that prevents updates/deletes
-- PostgreSQL doesn't support this directly, but we'll enforce in application
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
    ON everx_auth.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id 
    ON everx_auth.audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
    ON everx_auth.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id 
    ON everx_auth.audit_logs(request_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id 
    ON everx_auth.audit_logs(correlation_id);

-- Data Access Logs (who accessed what data and when)
CREATE TABLE IF NOT EXISTS everx_auth.data_access_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    request_id VARCHAR(255),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    access_type VARCHAR(20) NOT NULL,
    purpose VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id UUID,
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_data_access_logs_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id 
    ON everx_auth.data_access_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_entity_type_entity_id 
    ON everx_auth.data_access_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_accessed_at 
    ON everx_auth.data_access_logs(accessed_at DESC);

-- Compliance Event Logs (GDPR, data export, deletion tracking)
CREATE TABLE IF NOT EXISTS everx_auth.compliance_event_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    data_subject_id VARCHAR(255),
    affected_entity_type VARCHAR(100),
    affected_record_count INT,
    compliance_requirement VARCHAR(50),
    gdpr_category VARCHAR(50),
    data_processor UUID,
    consent_obtained BOOLEAN DEFAULT FALSE,
    data_retention_until TIMESTAMP WITH TIME ZONE,
    exported_to VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_compliance_event_logs_event_type 
    ON everx_auth.compliance_event_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_compliance_event_logs_created_at 
    ON everx_auth.compliance_event_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_event_logs_data_subject_id 
    ON everx_auth.compliance_event_logs(data_subject_id);

-- Security Event Logs (failed logins, permission changes, etc.)
CREATE TABLE IF NOT EXISTS everx_auth.security_event_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id UUID,
    action_taken VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_security_event_logs_user_id 
    ON everx_auth.security_event_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_security_event_logs_event_type 
    ON everx_auth.security_event_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_security_event_logs_severity 
    ON everx_auth.security_event_logs(severity);

CREATE INDEX IF NOT EXISTS idx_security_event_logs_created_at 
    ON everx_auth.security_event_logs(created_at DESC);

-- Change Tracking (detailed before/after for audit)
CREATE TABLE IF NOT EXISTS everx_shared.change_tracking (
    id UUID PRIMARY KEY,
    audit_log_id UUID NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    value_type VARCHAR(50),
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_change_tracking_audit FOREIGN KEY (audit_log_id) 
        REFERENCES everx_auth.audit_logs(id)
);

CREATE INDEX IF NOT EXISTS idx_change_tracking_audit_log_id 
    ON everx_shared.change_tracking(audit_log_id);

CREATE INDEX IF NOT EXISTS idx_change_tracking_field_name 
    ON everx_shared.change_tracking(field_name);

-- Audit Settings (retention, rules, etc.)
CREATE TABLE IF NOT EXISTS everx_shared.audit_settings (
    id UUID PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value VARCHAR(500),
    setting_type VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

-- Insert default audit settings
INSERT INTO everx_shared.audit_settings (id, setting_key, setting_value, setting_type, description, is_active, created_at, updated_at, created_by, version)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'retention_days', '365', 'INT', 'Audit logs retention period in days', TRUE, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'immutable_mode', 'true', 'BOOLEAN', 'Audit logs cannot be deleted', TRUE, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'log_sensitive_data', 'false', 'BOOLEAN', 'Log PII fields masked', TRUE, NOW(), NOW(), NULL, 0),
    ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'notification_on_security_event', 'true', 'BOOLEAN', 'Send alerts on security events', TRUE, NOW(), NOW(), NULL, 0)
ON CONFLICT (setting_key) DO NOTHING;
