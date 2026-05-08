-- Create tenant schema
CREATE SCHEMA IF NOT EXISTS everx_tenant;

-- Create tenants table
CREATE TABLE everx_tenant.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    custom_domain VARCHAR(200) UNIQUE,
    industry VARCHAR(100),
    company_size INTEGER,
    description TEXT,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(10) NOT NULL DEFAULT 'en_US',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/dd/yyyy',
    time_format VARCHAR(10) DEFAULT '12h',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_trial BOOLEAN NOT NULL DEFAULT true,
    trial_end_date TIMESTAMP,
    subscription_plan VARCHAR(50),
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 5,
    features_enabled TEXT,
    billing_email VARCHAR(200),
    technical_contact_email VARCHAR(200),
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(200),
    setup_completed BOOLEAN NOT NULL DEFAULT false,
    setup_step INTEGER NOT NULL DEFAULT 0,
    created_by_user_id UUID,
    last_login_at TIMESTAMP,
    user_count INTEGER DEFAULT 0,
    storage_used_gb DOUBLE PRECISION DEFAULT 0.0,
    api_calls_monthly INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create indexes
CREATE INDEX idx_tenants_subdomain ON everx_tenant.tenants(subdomain);
CREATE INDEX idx_tenants_custom_domain ON everx_tenant.tenants(custom_domain);
CREATE INDEX idx_tenants_is_active ON everx_tenant.tenants(is_active);
CREATE INDEX idx_tenants_is_trial ON everx_tenant.tenants(is_trial);
CREATE INDEX idx_tenants_trial_end_date ON everx_tenant.tenants(trial_end_date);
CREATE INDEX idx_tenants_subscription_plan ON everx_tenant.tenants(subscription_plan);
CREATE INDEX idx_tenants_created_at ON everx_tenant.tenants(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION everx_tenant.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON everx_tenant.tenants
    FOR EACH ROW
    EXECUTE FUNCTION everx_tenant.update_updated_at_column();

-- Insert default trial plan configuration
INSERT INTO everx_tenant.tenants (
    name, 
    subdomain, 
    subscription_plan, 
    max_users, 
    max_storage_gb,
    features_enabled,
    is_trial,
    trial_end_date
) VALUES (
    'System Default',
    'system',
    'ENTERPRISE',
    1000,
    1000,
    'all',
    false,
    NULL
) ON CONFLICT (subdomain) DO NOTHING;
