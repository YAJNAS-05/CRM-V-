-- Create API management schema
CREATE SCHEMA IF NOT EXISTS everx_api;

-- Create api_keys table
CREATE TABLE everx_api.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_value VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count BIGINT NOT NULL DEFAULT 0,
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
    rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
    rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,
    allowed_ips TEXT,
    allowed_origins TEXT,
    permissions TEXT,
    api_version VARCHAR(20) NOT NULL DEFAULT 'v1',
    key_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    is_readonly BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_api_keys_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create api_usage table
CREATE TABLE everx_api.api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID,
    tenant_id UUID NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms BIGINT NOT NULL,
    request_size_bytes BIGINT,
    response_size_bytes BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_id VARCHAR(100),
    error_message TEXT,
    timestamp TIMESTAMP NOT NULL,
    api_version VARCHAR(20),
    is_success BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_api_usage_api_key FOREIGN KEY (api_key_id) REFERENCES everx_api.api_keys(id) ON DELETE SET NULL,
    CONSTRAINT fk_api_usage_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create indexes for api_keys
CREATE INDEX idx_api_keys_tenant_id ON everx_api.api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_value ON everx_api.api_keys(key_value);
CREATE INDEX idx_api_keys_is_active ON everx_api.api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON everx_api.api_keys(expires_at);
CREATE INDEX idx_api_keys_last_used_at ON everx_api.api_keys(last_used_at);
CREATE INDEX idx_api_keys_key_type ON everx_api.api_keys(key_type);
CREATE INDEX idx_api_keys_created_by_user_id ON everx_api.api_keys(created_by_user_id);

-- Create indexes for api_usage
CREATE INDEX idx_api_usage_tenant_id ON everx_api.api_usage(tenant_id);
CREATE INDEX idx_api_usage_api_key_id ON everx_api.api_usage(api_key_id);
CREATE INDEX idx_api_usage_timestamp ON everx_api.api_usage(timestamp);
CREATE INDEX idx_api_usage_endpoint ON everx_api.api_usage(endpoint);
CREATE INDEX idx_api_usage_method ON everx_api.api_usage(method);
CREATE INDEX idx_api_usage_status_code ON everx_api.api_usage(status_code);
CREATE INDEX idx_api_usage_ip_address ON everx_api.api_usage(ip_address);
CREATE INDEX idx_api_usage_is_success ON everx_api.api_usage(is_success);

-- Create composite indexes for better query performance
CREATE INDEX idx_api_usage_tenant_timestamp ON everx_api.api_usage(tenant_id, timestamp DESC);
CREATE INDEX idx_api_usage_key_timestamp ON everx_api.api_usage(api_key_id, timestamp DESC);
CREATE INDEX idx_api_usage_status_timestamp ON everx_api.api_usage(status_code, timestamp DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION everx_api.update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON everx_api.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION everx_api.update_api_keys_updated_at();

-- Create partitioned table for api_usage (optional for high-volume systems)
-- This is commented out as it's optional and can be enabled later if needed
/*
-- Create partitioned api_usage table by month
CREATE TABLE everx_api.api_usage_partitioned (
    LIKE everx_api.api_usage INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create current month partition
CREATE TABLE everx_api.api_usage_y2024m01 PARTITION OF everx_api.api_usage_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
*/

-- Create view for API usage statistics
CREATE OR REPLACE VIEW everx_api.api_usage_stats AS
SELECT 
    tenant_id,
    api_key_id,
    DATE_TRUNC('day', timestamp) as usage_date,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN is_success = true THEN 1 END) as success_requests,
    COUNT(CASE WHEN is_success = false THEN 1 END) as error_requests,
    ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
    MIN(response_time_ms) as min_response_time_ms,
    MAX(response_time_ms) as max_response_time_ms,
    SUM(request_size_bytes) as total_request_bytes,
    SUM(response_size_bytes) as total_response_bytes
FROM everx_api.api_usage
GROUP BY tenant_id, api_key_id, DATE_TRUNC('day', timestamp);

-- Create view for API key performance metrics
CREATE OR REPLACE VIEW everx_api.api_key_metrics AS
SELECT 
    ak.id,
    ak.name,
    ak.tenant_id,
    ak.is_active,
    ak.expires_at,
    ak.last_used_at,
    ak.usage_count,
    COALESCE(stats.total_requests_today, 0) as requests_today,
    COALESCE(stats.total_requests_this_month, 0) as requests_this_month,
    COALESCE(stats.avg_response_time_today, 0) as avg_response_time_today,
    COALESCE(stats.success_rate_today, 100) as success_rate_today
FROM everx_api.api_keys ak
LEFT JOIN (
    SELECT 
        api_key_id,
        COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END) as total_requests_today,
        COUNT(CASE WHEN timestamp >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as total_requests_this_month,
        AVG(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN response_time_ms END) as avg_response_time_today,
        CASE 
            WHEN COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END) > 0 
            THEN ROUND(COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE AND is_success = true THEN 1 END) * 100.0 / COUNT(CASE WHEN DATE(timestamp) = CURRENT_DATE THEN 1 END), 2)
            ELSE 100 
        END as success_rate_today
    FROM everx_api.api_usage
    WHERE timestamp >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY api_key_id
) stats ON ak.id = stats.api_key_id;

-- Create function to clean up old API usage records
CREATE OR REPLACE FUNCTION everx_api.cleanup_old_api_usage(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM everx_api.api_usage 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to deactivate expired API keys
CREATE OR REPLACE FUNCTION everx_api.deactivate_expired_keys()
RETURNS INTEGER AS $$
DECLARE
    deactivated_count INTEGER;
BEGIN
    UPDATE everx_api.api_keys 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE is_active = true 
    AND expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deactivated_count = ROW_COUNT;
    
    RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA everx_api TO everx_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA everx_api TO everx_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA everx_api TO everx_app;
