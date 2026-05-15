-- Migration: Create Custom Reports and Widgets tables
-- Description: Support for widget-based custom reporting system

-- Create custom_reports table
CREATE TABLE IF NOT EXISTS custom_reports (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    refresh_rate INT,
    filters JSON,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' COMMENT 'ACTIVE, DRAFT, ARCHIVED',
    access_type VARCHAR(50) NOT NULL DEFAULT 'PRIVATE' COMMENT 'PRIVATE, SHARED, PUBLIC',
    INDEX idx_created_by (created_by),
    INDEX idx_status (status),
    INDEX idx_access_type (access_type),
    INDEX idx_created_at (created_at)
);

-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'chart, metric, table, text',
    title VARCHAR(255) NOT NULL,
    config JSON,
    position INT NOT NULL,
    data_source JSON,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id),
    INDEX idx_type (type),
    INDEX idx_position (position)
);

-- Create report_access table for sharing functionality
CREATE TABLE IF NOT EXISTS report_access (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100),
    role_id VARCHAR(100),
    access_level VARCHAR(50) NOT NULL COMMENT 'VIEW, EDIT, MANAGE',
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(100),
    FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_access (report_id, user_id),
    UNIQUE KEY unique_role_access (report_id, role_id),
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- Create report_execution_log table for audit/performance tracking
CREATE TABLE IF NOT EXISTS report_execution_log (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    executed_by VARCHAR(100) NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms BIGINT,
    total_records INT,
    status VARCHAR(50) NOT NULL COMMENT 'SUCCESS, FAILED, TIMEOUT',
    error_message LONGTEXT,
    FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id),
    INDEX idx_executed_by (executed_by),
    INDEX idx_executed_at (executed_at)
);
