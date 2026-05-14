-- V11__add_dashboard_widgets.sql
-- Dashboard Widgets System - Freshworks-style dashboard

-- Dashboard configurations (per user, per report/dashboard)
CREATE TABLE everx_reporting.dashboard_configs (
    dashboard_id        BIGSERIAL PRIMARY KEY,
    user_email          VARCHAR(100) NOT NULL,
    dashboard_name      VARCHAR(200) NOT NULL,
    dashboard_key       VARCHAR(100),
    description         TEXT,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    is_shared           BOOLEAN NOT NULL DEFAULT FALSE,
    grid_columns        INTEGER NOT NULL DEFAULT 12,
    widgets_count       INTEGER NOT NULL DEFAULT 0,
    shared_with_emails  TEXT[],
    shared_with_roles   VARCHAR(50)[],
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_email, dashboard_name)
);

-- Individual widgets on dashboard
CREATE TABLE everx_reporting.dashboard_widgets (
    widget_id           BIGSERIAL PRIMARY KEY,
    dashboard_id        BIGINT NOT NULL REFERENCES everx_reporting.dashboard_configs(dashboard_id) ON DELETE CASCADE,
    report_id           BIGINT REFERENCES everx_reporting.report_definitions(report_id),
    widget_type         VARCHAR(50) NOT NULL CHECK (widget_type IN ('CHART','METRIC','TABLE','KPI','GAUGE','HEATMAP','TIMELINE','NUMBER','CUSTOM')),
    widget_title        VARCHAR(200) NOT NULL,
    widget_key          VARCHAR(100),
    description         TEXT,
    
    -- Layout and appearance
    col_index           INTEGER NOT NULL DEFAULT 0,
    row_index           INTEGER NOT NULL DEFAULT 0,
    col_span            INTEGER NOT NULL DEFAULT 3,
    row_span            INTEGER NOT NULL DEFAULT 2,
    background_color    VARCHAR(7) DEFAULT '#FFFFFF',
    font_size           VARCHAR(20) DEFAULT 'medium',
    
    -- Widget configuration
    config              JSONB NOT NULL,
    chart_type          VARCHAR(50),
    metric_field        VARCHAR(100),
    metric_label        VARCHAR(200),
    metric_format       VARCHAR(50),
    filters_applied     JSONB,
    sort_config         JSONB,
    
    -- Data handling
    refresh_interval    INTEGER DEFAULT 300,
    cache_duration      INTEGER DEFAULT 0,
    is_cached           BOOLEAN NOT NULL DEFAULT FALSE,
    last_refreshed_at   TIMESTAMP,
    
    -- Visibility and access
    is_visible          BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
    widget_order        INTEGER NOT NULL DEFAULT 0,
    
    created_by          VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Widget filter history (for analytics)
CREATE TABLE everx_reporting.widget_interactions (
    interaction_id      BIGSERIAL PRIMARY KEY,
    widget_id           BIGINT NOT NULL REFERENCES everx_reporting.dashboard_widgets(widget_id) ON DELETE CASCADE,
    user_email          VARCHAR(100) NOT NULL,
    interaction_type    VARCHAR(50) CHECK (interaction_type IN ('VIEW','FILTER','DRILL_DOWN','EXPORT','REFRESH')),
    filters_used        JSONB,
    timestamp           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Widget templates for quick creation
CREATE TABLE everx_reporting.widget_templates (
    template_id         BIGSERIAL PRIMARY KEY,
    template_name       VARCHAR(200) NOT NULL,
    widget_type         VARCHAR(50) NOT NULL,
    default_config      JSONB NOT NULL,
    icon                VARCHAR(50),
    category            VARCHAR(50),
    is_system           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_dashboard_user ON everx_reporting.dashboard_configs(user_email);
CREATE INDEX idx_dashboard_shared ON everx_reporting.dashboard_configs(is_shared);
CREATE INDEX idx_dashboard_default ON everx_reporting.dashboard_configs(user_email, is_default);
CREATE INDEX idx_widget_dashboard ON everx_reporting.dashboard_widgets(dashboard_id);
CREATE INDEX idx_widget_report ON everx_reporting.dashboard_widgets(report_id);
CREATE INDEX idx_widget_type ON everx_reporting.dashboard_widgets(widget_type);
CREATE INDEX idx_widget_order ON everx_reporting.dashboard_widgets(dashboard_id, widget_order);
CREATE INDEX idx_widget_interactions_widget ON everx_reporting.widget_interactions(widget_id);
CREATE INDEX idx_widget_interactions_user ON everx_reporting.widget_interactions(user_email);
CREATE INDEX idx_template_type ON everx_reporting.widget_templates(widget_type);
CREATE INDEX idx_template_system ON everx_reporting.widget_templates(is_system);

-- Insert default widget templates
INSERT INTO everx_reporting.widget_templates (template_name, widget_type, default_config, icon, category, is_system) VALUES
('Bar Chart', 'CHART', '{"chartType":"bar","xAxis":"","yAxis":"","aggregation":"sum"}', 'BarChart3', 'Charts', true),
('Line Chart', 'CHART', '{"chartType":"line","xAxis":"","yAxis":"","aggregation":"sum"}', 'LineChart', 'Charts', true),
('Pie Chart', 'CHART', '{"chartType":"pie","dataField":"","valueField":""}', 'PieChart', 'Charts', true),
('Area Chart', 'CHART', '{"chartType":"area","xAxis":"","yAxis":"","aggregation":"sum"}', 'AreaChart', 'Charts', true),
('KPI Card', 'KPI', '{"format":"number","prefix":"","suffix":"","decimals":0}', 'TrendingUp', 'Metrics', true),
('Number Metric', 'NUMBER', '{"format":"number","prefix":"","suffix":""}', 'Hash', 'Metrics', true),
('Data Table', 'TABLE', '{"pageSize":10,"sortable":true,"filterable":true}', 'Table', 'Data', true),
('Gauge Chart', 'GAUGE', '{"min":0,"max":100,"thresholds":[]}', 'Gauge', 'Charts', true),
('Custom HTML', 'CUSTOM', '{"html":"<div></div>"}', 'Code', 'Custom', true);
