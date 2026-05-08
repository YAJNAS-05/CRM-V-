-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS everx_analytics;

-- Create dashboards table
CREATE TABLE everx_analytics.dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    layout TEXT,
    refresh_interval INTEGER NOT NULL DEFAULT 300,
    category VARCHAR(100),
    tags TEXT,
    view_count BIGINT NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_dashboards_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create dashboard_widgets table
CREATE TABLE everx_analytics.dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    widget_type VARCHAR(50) NOT NULL,
    description TEXT,
    data_source VARCHAR(200) NOT NULL,
    query TEXT,
    configuration TEXT,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 3,
    refresh_interval INTEGER NOT NULL DEFAULT 300,
    is_active BOOLEAN NOT NULL DEFAULT true,
    chart_type VARCHAR(50),
    aggregation_type VARCHAR(50),
    time_range VARCHAR(20) NOT NULL DEFAULT '7d',
    filters TEXT,
    drilldown_config TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_dashboard_widgets_dashboard FOREIGN KEY (dashboard_id) REFERENCES everx_analytics.dashboards(id) ON DELETE CASCADE
);

-- Create analytics_reports table
CREATE TABLE everx_analytics.analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    template_id UUID,
    query TEXT,
    parameters TEXT,
    schedule_config TEXT,
    recipients TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_scheduled BOOLEAN NOT NULL DEFAULT false,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    run_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    output_format VARCHAR(20) NOT NULL DEFAULT 'PDF',
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    execution_time_ms BIGINT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_analytics_reports_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create indexes for dashboards
CREATE INDEX idx_dashboards_tenant_id ON everx_analytics.dashboards(tenant_id);
CREATE INDEX idx_dashboards_created_by_user_id ON everx_analytics.dashboards(created_by_user_id);
CREATE INDEX idx_dashboards_is_active ON everx_analytics.dashboards(is_active);
CREATE INDEX idx_dashboards_is_public ON everx_analytics.dashboards(is_public);
CREATE INDEX idx_dashboards_is_default ON everx_analytics.dashboards(is_default);
CREATE INDEX idx_dashboards_category ON everx_analytics.dashboards(category);
CREATE INDEX idx_dashboards_last_viewed_at ON everx_analytics.dashboards(last_viewed_at);

-- Create indexes for dashboard_widgets
CREATE INDEX idx_dashboard_widgets_dashboard_id ON everx_analytics.dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_widget_type ON everx_analytics.dashboard_widgets(widget_type);
CREATE INDEX idx_dashboard_widgets_is_active ON everx_analytics.dashboard_widgets(is_active);
CREATE INDEX idx_dashboard_widgets_chart_type ON everx_analytics.dashboard_widgets(chart_type);
CREATE INDEX idx_dashboard_widgets_aggregation_type ON everx_analytics.dashboard_widgets(aggregation_type);
CREATE INDEX idx_dashboard_widgets_position ON everx_analytics.dashboard_widgets(position_y, position_x);

-- Create indexes for analytics_reports
CREATE INDEX idx_analytics_reports_tenant_id ON everx_analytics.analytics_reports(tenant_id);
CREATE INDEX idx_analytics_reports_created_by_user_id ON everx_analytics.analytics_reports(created_by_user_id);
CREATE INDEX idx_analytics_reports_report_type ON everx_analytics.analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_is_active ON everx_analytics.analytics_reports(is_active);
CREATE INDEX idx_analytics_reports_is_scheduled ON everx_analytics.analytics_reports(is_scheduled);
CREATE INDEX idx_analytics_reports_status ON everx_analytics.analytics_reports(status);
CREATE INDEX idx_analytics_reports_next_run_at ON everx_analytics.analytics_reports(next_run_at);
CREATE INDEX idx_analytics_reports_last_run_at ON everx_analytics.analytics_reports(last_run_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION everx_analytics.update_dashboards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboards_updated_at
    BEFORE UPDATE ON everx_analytics.dashboards
    FOR EACH ROW
    EXECUTE FUNCTION everx_analytics.update_dashboards_updated_at();

CREATE OR REPLACE FUNCTION everx_analytics.update_dashboard_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_widgets_updated_at
    BEFORE UPDATE ON everx_analytics.dashboard_widgets
    FOR EACH ROW
    EXECUTE FUNCTION everx_analytics.update_dashboard_widgets_updated_at();

CREATE OR REPLACE FUNCTION everx_analytics.update_analytics_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON everx_analytics.analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION everx_analytics.update_analytics_reports_updated_at();

-- Create views for analytics
CREATE OR REPLACE VIEW everx_analytics.dashboard_summary AS
SELECT 
    d.id,
    d.name,
    d.tenant_id,
    d.is_active,
    d.is_public,
    d.view_count,
    d.last_viewed_at,
    COUNT(dw.id) as widget_count,
    d.created_at,
    d.updated_at
FROM everx_analytics.dashboards d
LEFT JOIN everx_analytics.dashboard_widgets dw ON d.id = dw.dashboard_id AND dw.is_active = true
GROUP BY d.id, d.name, d.tenant_id, d.is_active, d.is_public, d.view_count, d.last_viewed_at, d.created_at, d.updated_at;

CREATE OR REPLACE VIEW everx_analytics.report_execution_stats AS
SELECT 
    ar.tenant_id,
    ar.report_type,
    COUNT(*) as total_reports,
    COUNT(CASE WHEN ar.is_scheduled = true THEN 1 END) as scheduled_reports,
    COUNT(CASE WHEN ar.status = 'COMPLETED' THEN 1 END) as completed_reports,
    COUNT(CASE WHEN ar.status = 'FAILED' THEN 1 END) as failed_reports,
    SUM(ar.run_count) as total_executions,
    AVG(ar.executionution_time_ms) as avg_execution_time_ms
FROM everx_analytics.analytics_reports ar
WHERE ar.is_active = true
GROUP BY ar.tenant_id, ar.report_type;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA everx_analytics TO everx_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA everx_analytics TO everx_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA everx_analytics TO everx_app;
