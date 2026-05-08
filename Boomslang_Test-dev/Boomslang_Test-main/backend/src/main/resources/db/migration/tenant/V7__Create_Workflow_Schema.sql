-- Create workflow schema
CREATE SCHEMA IF NOT EXISTS everx_workflow;

-- Create workflows table
CREATE TABLE everx_workflow.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id UUID NOT NULL,
    created_by_user_id UUID NOT NULL,
    category VARCHAR(100),
    tags TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    execution_count BIGINT NOT NULL DEFAULT 0,
    success_count BIGINT NOT NULL DEFAULT 0,
    failure_count BIGINT NOT NULL DEFAULT 0,
    last_executed_at TIMESTAMP,
    next_execution_at TIMESTAMP,
    timeout_minutes INTEGER NOT NULL DEFAULT 30,
    retry_count INTEGER NOT NULL DEFAULT 3,
    retry_delay_minutes INTEGER NOT NULL DEFAULT 5,
    variables TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_workflows_tenant FOREIGN KEY (tenant_id) REFERENCES everx_tenant.tenants(id)
);

-- Create workflow_steps table
CREATE TABLE everx_workflow.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    configuration TEXT,
    conditions TEXT,
    input_mapping TEXT,
    output_mapping TEXT,
    timeout_seconds INTEGER NOT NULL DEFAULT 300,
    retry_count INTEGER NOT NULL DEFAULT 3,
    retry_delay_seconds INTEGER NOT NULL DEFAULT 60,
    is_parallel BOOLEAN NOT NULL DEFAULT false,
    is_optional BOOLEAN NOT NULL DEFAULT false,
    error_handling VARCHAR(50) NOT NULL DEFAULT 'STOP',
    dependencies TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_workflow_steps_workflow FOREIGN KEY (workflow_id) REFERENCES everx_workflow.workflows(id) ON DELETE CASCADE
);

-- Create workflow_executions table
CREATE TABLE everx_workflow.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    execution_id VARCHAR(100) NOT NULL UNIQUE,
    triggered_by VARCHAR(100) NOT NULL,
    trigger_data TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    current_step INTEGER,
    total_steps INTEGER,
    completed_steps INTEGER NOT NULL DEFAULT 0,
    failed_steps INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    variables TEXT,
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    error_details TEXT,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    priority INTEGER NOT NULL DEFAULT 0,
    timeout_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_workflow_executions_workflow FOREIGN KEY (workflow_id) REFERENCES everx_workflow.workflows(id) ON DELETE CASCADE
);

-- Create workflow_step_executions table
CREATE TABLE everx_workflow.workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_execution_id UUID NOT NULL,
    workflow_step_id UUID NOT NULL,
    step_order INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    error_details TEXT,
    logs TEXT,
    timeout_at TIMESTAMP,
    next_retry_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT fk_workflow_step_executions_workflow_execution FOREIGN KEY (workflow_execution_id) REFERENCES everx_workflow.workflow_executions(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_step_executions_workflow_step FOREIGN KEY (workflow_step_id) REFERENCES everx_workflow.workflow_steps(id) ON DELETE CASCADE
);

-- Create indexes for workflows
CREATE INDEX idx_workflows_tenant_id ON everx_workflow.workflows(tenant_id);
CREATE INDEX idx_workflows_created_by_user_id ON everx_workflow.workflows(created_by_user_id);
CREATE INDEX idx_workflows_is_active ON everx_workflow.workflows(is_active);
CREATE INDEX idx_workflows_is_published ON everx_workflow.workflows(is_published);
CREATE INDEX idx_workflows_trigger_type ON everx_workflow.workflows(trigger_type);
CREATE INDEX idx_workflows_category ON everx_workflow.workflows(category);
CREATE INDEX idx_workflows_last_executed_at ON everx_workflow.workflows(last_executed_at);
CREATE INDEX idx_workflows_next_execution_at ON everx_workflow.workflows(next_execution_at);
CREATE INDEX idx_workflows_execution_count ON everx_workflow.workflows(execution_count);

-- Create indexes for workflow_steps
CREATE INDEX idx_workflow_steps_workflow_id ON everx_workflow.workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_step_order ON everx_workflow.workflow_steps(step_order);
CREATE INDEX idx_workflow_steps_step_type ON everx_workflow.workflow_steps(step_type);
CREATE INDEX idx_workflow_steps_action_type ON everx_workflow.workflow_steps(action_type);
CREATE INDEX idx_workflow_steps_is_parallel ON everx_workflow.workflow_steps(is_parallel);
CREATE INDEX idx_workflow_steps_is_optional ON everx_workflow.workflow_steps(is_optional);
CREATE INDEX idx_workflow_steps_error_handling ON everx_workflow.workflow_steps(error_handling);

-- Create indexes for workflow_executions
CREATE INDEX idx_workflow_executions_workflow_id ON everx_workflow.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_execution_id ON everx_workflow.workflow_executions(execution_id);
CREATE INDEX idx_workflow_executions_status ON everx_workflow.workflow_executions(status);
CREATE INDEX idx_workflow_executions_triggered_by ON everx_workflow.workflow_executions(triggered_by);
CREATE INDEX idx_workflow_executions_started_at ON everx_workflow.workflow_executions(started_at);
CREATE INDEX idx_workflow_executions_completed_at ON everx_workflow.workflow_executions(completed_at);
CREATE INDEX idx_workflow_executions_scheduled_at ON everx_workflow.workflow_executions(scheduled_at);
CREATE INDEX idx_workflow_executions_timeout_at ON everx_workflow.workflow_executions(timeout_at);
CREATE INDEX idx_workflow_executions_priority ON everx_workflow.workflow_executions(priority);

-- Create indexes for workflow_step_executions
CREATE INDEX idx_workflow_step_executions_workflow_execution_id ON everx_workflow.workflow_step_executions(workflow_execution_id);
CREATE INDEX idx_workflow_step_executions_workflow_step_id ON everx_workflow.workflow_step_executions(workflow_step_id);
CREATE INDEX idx_workflow_step_executions_step_order ON everx_workflow.workflow_step_executions(step_order);
CREATE INDEX idx_workflow_step_executions_status ON everx_workflow.workflow_step_executions(status);
CREATE INDEX idx_workflow_step_executions_started_at ON everx_workflow.workflow_step_executions(started_at);
CREATE INDEX idx_workflow_step_executions_completed_at ON everx_workflow.workflow_step_executions(completed_at);
CREATE INDEX idx_workflow_step_executions_timeout_at ON everx_workflow.workflow_step_executions(timeout_at);
CREATE INDEX idx_workflow_step_executions_next_retry_at ON everx_workflow.workflow_step_executions(next_retry_at);

-- Create composite indexes for better query performance
CREATE INDEX idx_workflow_executions_status_scheduled ON everx_workflow.workflow_executions(status, scheduled_at);
CREATE INDEX idx_workflow_executions_workflow_status ON everx_workflow.workflow_executions(workflow_id, status);
CREATE INDEX idx_workflow_step_executions_execution_status ON everx_workflow.workflow_step_executions(workflow_execution_id, status);
CREATE INDEX idx_workflow_step_executions_execution_step ON everx_workflow.workflow_step_executions(workflow_execution_id, step_order);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION everx_workflow.update_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON everx_workflow.workflows
    FOR EACH ROW
    EXECUTE FUNCTION everx_workflow.update_workflows_updated_at();

CREATE OR REPLACE FUNCTION everx_workflow.update_workflow_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_steps_updated_at
    BEFORE UPDATE ON everx_workflow.workflow_steps
    FOR EACH ROW
    EXECUTE FUNCTION everx_workflow.update_workflow_steps_updated_at();

CREATE OR REPLACE FUNCTION everx_workflow.update_workflow_executions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_executions_updated_at
    BEFORE UPDATE ON everx_workflow.workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION everx_workflow.update_workflow_executions_updated_at();

CREATE OR REPLACE FUNCTION everx_workflow.update_workflow_step_executions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_step_executions_updated_at
    BEFORE UPDATE ON everx_workflow.workflow_step_executions
    FOR EACH ROW
    EXECUTE FUNCTION everx_workflow.update_workflow_step_executions_updated_at();

-- Create views for workflow analytics
CREATE OR REPLACE VIEW everx_workflow.workflow_summary AS
SELECT 
    w.id,
    w.name,
    w.tenant_id,
    w.trigger_type,
    w.is_active,
    w.is_published,
    w.execution_count,
    w.success_count,
    w.failure_count,
    CASE WHEN w.execution_count > 0 THEN ROUND((w.success_count::NUMERIC / w.execution_count) * 100, 2) ELSE 0 END as success_rate,
    w.last_executed_at,
    w.next_execution_at,
    COUNT(ws.id) as step_count,
    w.created_at,
    w.updated_at
FROM everx_workflow.workflows w
LEFT JOIN everx_workflow.workflow_steps ws ON w.id = ws.workflow_id
GROUP BY w.id, w.name, w.tenant_id, w.trigger_type, w.is_active, w.is_published, w.execution_count, w.success_count, w.failure_count, w.last_executed_at, w.next_execution_at, w.created_at, w.updated_at;

CREATE OR REPLACE VIEW everx_workflow.execution_stats AS
SELECT 
    we.workflow_id,
    we.status,
    COUNT(*) as execution_count,
    AVG(we.duration_ms) as avg_duration_ms,
    MIN(we.duration_ms) as min_duration_ms,
    MAX(we.duration_ms) as max_duration_ms,
    AVG(we.progress_percentage) as avg_progress_percentage,
    COUNT(CASE WHEN we.status = 'COMPLETED' THEN 1 END) as completed_count,
    COUNT(CASE WHEN we.status = 'FAILED' THEN 1 END) as failed_count,
    COUNT(CASE WHEN we.status = 'RUNNING' THEN 1 END) as running_count
FROM everx_workflow.workflow_executions we
GROUP BY we.workflow_id, we.status;

CREATE OR REPLACE VIEW everx_workflow.step_execution_stats AS
SELECT 
    wse.workflow_step_id,
    wse.status,
    COUNT(*) as execution_count,
    AVG(wse.duration_ms) as avg_duration_ms,
    COUNT(CASE WHEN wse.attempt_count > 1 THEN 1 END) as retry_count,
    COUNT(CASE WHEN wse.status = 'COMPLETED' THEN 1 END) as completed_count,
    COUNT(CASE WHEN wse.status = 'FAILED' THEN 1 END) as failed_count,
    COUNT(CASE WHEN wse.status = 'SKIPPED' THEN 1 END) as skipped_count
FROM everx_workflow.workflow_step_executions wse
GROUP BY wse.workflow_step_id, wse.status;

-- Create functions for workflow management
CREATE OR REPLACE FUNCTION everx_workflow.calculate_workflow_success_rate(workflow_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_executions BIGINT;
    successful_executions BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_executions
    FROM everx_workflow.workflow_executions
    WHERE workflow_id = workflow_uuid;
    
    SELECT COUNT(*) INTO successful_executions
    FROM everx_workflow.workflow_executions
    WHERE workflow_id = workflow_uuid AND status = 'COMPLETED';
    
    IF total_executions = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((successful_executions::NUMERIC / total_executions) * 100, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION everx_workflow.get_workflow_execution_progress(execution_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
BEGIN
    SELECT total_steps INTO total_steps
    FROM everx_workflow.workflow_executions
    WHERE id = execution_uuid;
    
    SELECT completed_steps INTO completed_steps
    FROM everx_workflow.workflow_executions
    WHERE id = execution_uuid;
    
    IF total_steps = 0 OR total_steps IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_steps::NUMERIC / total_steps) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA everx_workflow TO everx_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA everx_workflow TO everx_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA everx_workflow TO everx_app;
