-- Create subscription schema
CREATE SCHEMA IF NOT EXISTS everx_subscription;

-- Create subscription_features table
CREATE TABLE everx_subscription.subscription_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    feature_type VARCHAR(50) NOT NULL DEFAULT 'BOOLEAN',
    default_value TEXT,
    validation_rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create subscription_plans table
CREATE TABLE everx_subscription.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10,2) NOT NULL,
    price_yearly NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    max_users INTEGER NOT NULL,
    max_storage_gb INTEGER NOT NULL,
    max_api_calls_monthly INTEGER NOT NULL,
    trial_days INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    features_list TEXT,
    limitations TEXT,
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    setup_fee NUMERIC(10,2),
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_enterprise BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create plan_features junction table
CREATE TABLE everx_subscription.plan_features (
    plan_id UUID NOT NULL,
    feature_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (plan_id, feature_id),
    CONSTRAINT fk_plan_features_plan FOREIGN KEY (plan_id) REFERENCES everx_subscription.subscription_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_plan_features_feature FOREIGN KEY (feature_id) REFERENCES everx_subscription.subscription_features(id) ON DELETE CASCADE
);

-- Create subscriptions table
CREATE TABLE everx_subscription.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    subscription_plan_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TRIAL',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE,
    trial_end_date DATE,
    next_billing_date DATE,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_auto_renew BOOLEAN NOT NULL DEFAULT true,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    paused_at TIMESTAMP,
    pause_reason TEXT,
    max_users_override INTEGER,
    max_storage_gb_override INTEGER,
    max_api_calls_override INTEGER,
    custom_features TEXT,
    notes TEXT,
    payment_method_id UUID,
    last_payment_at TIMESTAMP,
    last_payment_amount NUMERIC(10,2),
    last_payment_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (subscription_plan_id) REFERENCES everx_subscription.subscription_plans(id),
    CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create indexes for subscription_features
CREATE INDEX idx_subscription_features_category ON everx_subscription.subscription_features(category);
CREATE INDEX idx_subscription_features_is_active ON everx_subscription.subscription_features(is_active);
CREATE INDEX idx_subscription_features_sort_order ON everx_subscription.subscription_features(sort_order);

-- Create indexes for subscription_plans
CREATE INDEX idx_subscription_plans_is_active ON everx_subscription.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_is_public ON everx_subscription.subscription_plans(is_public);
CREATE INDEX idx_subscription_plans_sort_order ON everx_subscription.subscription_plans(sort_order);
CREATE INDEX idx_subscription_plans_is_popular ON everx_subscription.subscription_plans(is_popular);
CREATE INDEX idx_subscription_plans_is_enterprise ON everx_subscription.subscription_plans(is_enterprise);

-- Create indexes for subscriptions
CREATE INDEX idx_subscriptions_tenant_id ON everx_subscription.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON everx_subscription.subscriptions(status);
CREATE INDEX idx_subscriptions_is_active ON everx_subscription.subscriptions(is_active);
CREATE INDEX idx_subscriptions_next_billing_date ON everx_subscription.subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_trial_end_date ON everx_subscription.subscriptions(trial_end_date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION everx_subscription.update_subscription_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_features_updated_at
    BEFORE UPDATE ON everx_subscription.subscription_features
    FOR EACH ROW
    EXECUTE FUNCTION everx_subscription.update_subscription_features_updated_at();

CREATE OR REPLACE FUNCTION everx_subscription.update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON everx_subscription.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION everx_subscription.update_subscription_plans_updated_at();

CREATE OR REPLACE FUNCTION everx_subscription.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON everx_subscription.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION everx_subscription.update_subscriptions_updated_at();

-- Insert default subscription features
INSERT INTO everx_subscription.subscription_features (feature_key, name, description, category, icon, sort_order) VALUES
('CRM_ACCESS', 'CRM Access', 'Full access to CRM module', 'CRM', 'users', 100),
('ERP_ACCESS', 'ERP Access', 'Full access to ERP module', 'ERP', 'package', 200),
('FINANCE_ACCESS', 'Finance Access', 'Full access to Finance module', 'FINANCE', 'dollar-sign', 300),
('HR_ACCESS', 'HR Access', 'Full access to HR module', 'HR', 'user-check', 400),
('PM_ACCESS', 'PM Access', 'Full access to Project Management module', 'PM', 'briefcase', 500),
('API_ACCESS', 'API Access', 'Programmatic API access', 'API', 'code', 600),
('REPORTING_ACCESS', 'Reporting Access', 'Advanced reporting and analytics', 'REPORTING', 'bar-chart', 700),
('INTEGRATION_ACCESS', 'Integration Access', 'Third-party integrations', 'INTEGRATION', 'link', 800),
('CUSTOM_BRANDING', 'Custom Branding', 'Custom logo and colors', 'CUSTOMIZATION', 'palette', 900),
('ADVANCED_SUPPORT', 'Advanced Support', 'Priority customer support', 'SUPPORT', 'headphones', 1000);

-- Insert default subscription plans
INSERT INTO everx_subscription.subscription_plans (name, display_name, description, price_monthly, price_yearly, currency, max_users, max_storage_gb, max_api_calls_monthly, trial_days, sort_order, is_popular) VALUES
('STARTER', 'Starter', 'Perfect for small teams getting started', 29.00, 290.00, 'USD', 5, 10, 1000, 14, 100, false),
('PROFESSIONAL', 'Professional', 'Ideal for growing businesses', 99.00, 990.00, 'USD', 25, 50, 5000, 14, 200, true),
('ENTERPRISE', 'Enterprise', 'Complete solution for large organizations', 299.00, 2990.00, 'USD', 100, 200, 20000, 30, 300, false);
