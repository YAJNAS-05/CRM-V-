-- PM module expansion: sprints, milestones, risks, issues, dependencies, resource plans

CREATE TABLE IF NOT EXISTS everx_hr.pm_sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE,
    capacity_hours NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pm_sprints_project ON everx_hr.pm_sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_sprints_status ON everx_hr.pm_sprints(status);

CREATE TABLE IF NOT EXISTS everx_hr.pm_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pm_milestones_project ON everx_hr.pm_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_milestones_status ON everx_hr.pm_milestones(status);

CREATE TABLE IF NOT EXISTS everx_hr.pm_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    owner_id UUID REFERENCES everx_auth.users(id),
    mitigation_plan TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pm_risks_project ON everx_hr.pm_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_risks_status ON everx_hr.pm_risks(status);
CREATE INDEX IF NOT EXISTS idx_pm_risks_severity ON everx_hr.pm_risks(severity);

CREATE TABLE IF NOT EXISTS everx_hr.pm_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assignee_id UUID REFERENCES everx_auth.users(id),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pm_issues_project ON everx_hr.pm_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_issues_status ON everx_hr.pm_issues(status);
CREATE INDEX IF NOT EXISTS idx_pm_issues_priority ON everx_hr.pm_issues(priority);

CREATE TABLE IF NOT EXISTS everx_hr.pm_resource_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    role VARCHAR(50),
    allocation_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    billable BOOLEAN NOT NULL DEFAULT false,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pm_resource_plans_project ON everx_hr.pm_resource_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_resource_plans_employee ON everx_hr.pm_resource_plans(employee_id);

CREATE TABLE IF NOT EXISTS everx_hr.pm_task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    predecessor_task_id UUID NOT NULL REFERENCES everx_hr.tasks(id) ON DELETE CASCADE,
    successor_task_id UUID NOT NULL REFERENCES everx_hr.tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS',
    lag_days INTEGER NOT NULL DEFAULT 0,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_pm_task_dependency UNIQUE(project_id, predecessor_task_id, successor_task_id)
);

CREATE INDEX IF NOT EXISTS idx_pm_dependencies_project ON everx_hr.pm_task_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_dependencies_predecessor ON everx_hr.pm_task_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_pm_dependencies_successor ON everx_hr.pm_task_dependencies(successor_task_id);

ALTER TABLE everx_hr.tasks
    ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES everx_hr.pm_sprints(id);

CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON everx_hr.tasks(sprint_id);
