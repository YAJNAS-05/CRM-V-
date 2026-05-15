-- V10__reporting_system.sql
-- EverX Enterprise Reporting System Schema

CREATE SCHEMA IF NOT EXISTS everx_reporting;

-- Report definitions (both standard and custom)
CREATE TABLE everx_reporting.report_definitions (
    report_id           BIGSERIAL PRIMARY KEY,
    report_name         VARCHAR(200) NOT NULL,
    report_key          VARCHAR(100) UNIQUE,
    report_type         VARCHAR(20) NOT NULL CHECK (report_type IN ('STANDARD','CUSTOM','SHARED')),
    module              VARCHAR(50) NOT NULL,
    description         TEXT,
    definition          JSONB NOT NULL,
    created_by          VARCHAR(100),
    owned_by            VARCHAR(100),
    is_system           BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at         TIMESTAMP,
    run_count           INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User saved filter presets per report
CREATE TABLE everx_reporting.report_filter_presets (
    preset_id           BIGSERIAL PRIMARY KEY,
    report_id           BIGINT NOT NULL REFERENCES everx_reporting.report_definitions(report_id),
    user_email          VARCHAR(100) NOT NULL,
    preset_name         VARCHAR(100) NOT NULL,
    filters             JSONB NOT NULL,
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scheduled report jobs
CREATE TABLE everx_reporting.scheduled_reports (
    schedule_id         BIGSERIAL PRIMARY KEY,
    report_id           BIGINT NOT NULL REFERENCES everx_reporting.report_definitions(report_id),
    schedule_name       VARCHAR(100) NOT NULL,
    cron_expression     VARCHAR(50) NOT NULL,
    frequency           VARCHAR(20) NOT NULL CHECK (frequency IN ('DAILY','WEEKLY','MONTHLY')),
    recipients          TEXT[] NOT NULL,
    export_format       VARCHAR(10) NOT NULL DEFAULT 'EXCEL'
                        CHECK (export_format IN ('CSV','EXCEL','PDF')),
    filters             JSONB,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    last_sent_at        TIMESTAMP,
    created_by          VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Report run history (audit + caching)
CREATE TABLE everx_reporting.report_run_log (
    run_id              BIGSERIAL PRIMARY KEY,
    report_id           BIGINT NOT NULL REFERENCES everx_reporting.report_definitions(report_id),
    run_by              VARCHAR(100),
    run_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    filters_applied     JSONB,
    row_count           INTEGER,
    duration_ms         INTEGER,
    export_format       VARCHAR(10),
    status              VARCHAR(10) NOT NULL DEFAULT 'SUCCESS'
                        CHECK (status IN ('SUCCESS','FAILED','TIMEOUT'))
);

-- User dashboard widget layout (per user)
CREATE TABLE everx_reporting.dashboard_layouts (
    layout_id           BIGSERIAL PRIMARY KEY,
    user_email          VARCHAR(100) NOT NULL UNIQUE,
    layout_config       JSONB NOT NULL,
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shared report access
CREATE TABLE everx_reporting.report_shares (
    share_id            BIGSERIAL PRIMARY KEY,
    report_id           BIGINT NOT NULL REFERENCES everx_reporting.report_definitions(report_id),
    shared_with_email   VARCHAR(100),
    shared_with_role    VARCHAR(50),
    can_edit            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_report_def_module   ON everx_reporting.report_definitions(module);
CREATE INDEX idx_report_def_type     ON everx_reporting.report_definitions(report_type);
CREATE INDEX idx_report_def_owner    ON everx_reporting.report_definitions(owned_by);
CREATE INDEX idx_report_def_system   ON everx_reporting.report_definitions(is_system);
CREATE INDEX idx_run_log_report_id   ON everx_reporting.report_run_log(report_id);
CREATE INDEX idx_run_log_run_by      ON everx_reporting.report_run_log(run_by);
CREATE INDEX idx_scheduled_active    ON everx_reporting.scheduled_reports(is_active);
CREATE INDEX idx_scheduled_report_id ON everx_reporting.scheduled_reports(report_id);
