-- ============================================================================
-- Security Tables for Authentication & Authorization Hardening
-- ============================================================================

-- Account Lockout Management
CREATE TABLE IF NOT EXISTS everx_auth.account_lockouts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    lockout_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_account_lockouts_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_user_id 
    ON everx_auth.account_lockouts(user_id);

-- API Key Management for Service-to-Service Authentication
CREATE TABLE IF NOT EXISTS everx_auth.api_keys (
    id UUID PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_name VARCHAR(120) NOT NULL,
    user_id UUID NOT NULL,
    description TEXT,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_whitelist TEXT,
    allowed_endpoints TEXT,
    rate_limit_per_minute INT DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_api_keys_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id 
    ON everx_auth.api_keys(user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash 
    ON everx_auth.api_keys(key_hash);

-- Multi-Factor Authentication Settings
CREATE TABLE IF NOT EXISTS everx_auth.mfa_settings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    mfa_type VARCHAR(50) NOT NULL,
    mfa_value VARCHAR(255) NOT NULL,
    backup_codes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_authenticated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_mfa_settings_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS everx_auth.password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
    ON everx_auth.password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash 
    ON everx_auth.password_reset_tokens(token_hash);

-- Session Management
CREATE TABLE IF NOT EXISTS everx_auth.user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_name VARCHAR(255),
    browser_type VARCHAR(50),
    os_type VARCHAR(50),
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
    ON everx_auth.user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token_hash 
    ON everx_auth.user_sessions(session_token_hash);

-- Rate Limiting Buckets
CREATE TABLE IF NOT EXISTS everx_auth.rate_limit_buckets (
    id BIGINT PRIMARY KEY,
    user_id UUID,
    ip_address VARCHAR(45),
    endpoint VARCHAR(255),
    tokens_remaining BIGINT NOT NULL,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_user_id 
    ON everx_auth.rate_limit_buckets(user_id);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_ip_address 
    ON everx_auth.rate_limit_buckets(ip_address);

-- Password History (to prevent reuse)
CREATE TABLE IF NOT EXISTS everx_auth.password_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    changed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) 
        REFERENCES everx_auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id 
    ON everx_auth.password_history(user_id);

-- Alter users table to add new security fields
ALTER TABLE everx_auth.users 
    ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255),
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS is_mfa_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(255),
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;
