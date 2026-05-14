-- Create AUTH schema
CREATE SCHEMA IF NOT EXISTS everx_auth;

-- Create users table
CREATE TABLE everx_auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'READ_ONLY',
    office_location VARCHAR(50) NOT NULL DEFAULT 'AUSTRALIA',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_users_email ON everx_auth.users(email);
CREATE INDEX idx_users_role ON everx_auth.users(role);
CREATE INDEX idx_users_is_deleted ON everx_auth.users(is_deleted);

-- Create refresh_tokens table
CREATE TABLE everx_auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES everx_auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_refresh_tokens_user_id ON everx_auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON everx_auth.refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON everx_auth.refresh_tokens(expires_at);

-- Create audit_logs table
CREATE TABLE everx_auth.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES everx_auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_audit_logs_user_id ON everx_auth.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type_id ON everx_auth.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON everx_auth.audit_logs(timestamp);
