-- ============================================
-- PROJECT MANAGEMENT MODULE
-- ============================================

-- Drop existing PM tables if they exist
DROP TABLE IF EXISTS project_comments CASCADE;
DROP TABLE IF EXISTS project_attachments CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS task_time_logs CASCADE;
DROP TABLE IF EXISTS task_watchers CASCADE;
DROP TABLE IF EXISTS task_custom_fields CASCADE;
DROP TABLE IF EXISTS custom_fields CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS epics CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- ============================================
-- WORKSPACES
-- ============================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES app_users(id),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- PORTFOLIOS
-- ============================================
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    owner_id UUID REFERENCES app_users(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    category VARCHAR(50),
    project_type VARCHAR(50) NOT NULL DEFAULT 'KANBAN',
    visibility VARCHAR(50) NOT NULL DEFAULT 'PRIVATE',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    owner_id UUID REFERENCES app_users(id),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

-- ============================================
-- PROJECT MEMBERS
-- ============================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ============================================
-- PROJECT TEMPLATES
-- ============================================
CREATE TABLE project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL,
    structure JSONB NOT NULL DEFAULT '{}',
    is_shared BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- MILESTONES
-- ============================================
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    progress INTEGER NOT NULL DEFAULT 0,
    owner_id UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- EPICS
-- ============================================
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    progress INTEGER NOT NULL DEFAULT 0,
    owner_id UUID REFERENCES app_users(id),
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- SPRINTS
-- ============================================
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    velocity DECIMAL(10,2),
    capacity DECIMAL(10,2),
    retrospective_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_number VARCHAR(50) NOT NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    
    -- Task Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL DEFAULT 'TASK',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    status_order INTEGER NOT NULL DEFAULT 0,
    
    -- Dates
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    
    -- Time Tracking
    time_estimate INTEGER,
    time_spent INTEGER DEFAULT 0,
    
    -- Assignment
    assignee_id UUID REFERENCES app_users(id),
    
    -- Additional
    story_points INTEGER,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_pattern VARCHAR(50),
    cover_image TEXT,
    
    -- Visibility
    is_private BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES app_users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    
    UNIQUE(project_id, task_number)
);

-- ============================================
-- TASK DEPENDENCIES
-- ============================================
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocking_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    blocked_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(blocking_task_id, blocked_task_id)
);

-- ============================================
-- TASK WATCHERS
-- ============================================
CREATE TABLE task_watchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- ============================================
-- TIME LOGS
-- ============================================
CREATE TABLE task_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    hours DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_billable BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES app_users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CUSTOM FIELDS
-- ============================================
CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_options JSONB DEFAULT '[]',
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TASK CUSTOM FIELD VALUES
-- ============================================
CREATE TABLE task_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    field_value TEXT,
    UNIQUE(task_id, field_id)
);

-- ============================================
-- ATTACHMENTS
-- ============================================
CREATE TABLE project_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_by UUID REFERENCES app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE project_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- INDEXES
-- ============================================

-- Workspaces
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- Portfolios
CREATE INDEX idx_portfolios_workspace ON portfolios(workspace_id);

-- Projects
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_portfolio ON projects(portfolio_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);

-- Project Members
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Milestones
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- Epics
CREATE INDEX idx_epics_project ON epics(project_id);
CREATE INDEX idx_epics_status ON epics(status);

-- Sprints
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);

-- Tasks
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_epic ON tasks(epic_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_task_number ON tasks(task_number);

-- Task Dependencies
CREATE INDEX idx_task_deps_blocking ON task_dependencies(blocking_task_id);
CREATE INDEX idx_task_deps_blocked ON task_dependencies(blocked_task_id);

-- Task Watchers
CREATE INDEX idx_task_watchers_task ON task_watchers(task_id);
CREATE INDEX idx_task_watchers_user ON task_watchers(user_id);

-- Time Logs
CREATE INDEX idx_time_logs_task ON task_time_logs(task_id);
CREATE INDEX idx_time_logs_user ON task_time_logs(user_id);
CREATE INDEX idx_time_logs_date ON task_time_logs(log_date);

-- Custom Fields
CREATE INDEX idx_custom_fields_project ON custom_fields(project_id);

-- Task Custom Fields
CREATE INDEX idx_task_custom_fields_task ON task_custom_fields(task_id);

-- Attachments
CREATE INDEX idx_attachments_task ON project_attachments(task_id);

-- Comments
CREATE INDEX idx_comments_task ON project_comments(task_id);
CREATE INDEX idx_comments_user ON project_comments(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-INCREMENT TASK NUMBERS
-- ============================================

CREATE SEQUENCE IF NOT EXISTS project_task_number_seq;

-- Function to generate task number
CREATE OR REPLACE FUNCTION generate_task_number(project_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    project_code TEXT;
    next_num INTEGER;
BEGIN
    SELECT COALESCE(UPPER(SUBSTRING(name FROM 1 FOR 3)), 'PRJ') INTO project_code FROM projects WHERE id = project_id_param;
    SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM '[0-9]+$') AS INTEGER)), 0) + 1 INTO next_num
    FROM tasks WHERE project_id = project_id_param;
    RETURN project_code || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Default task statuses
-- (Stored in project settings, but can also be here for reference)

-- Insert sample workspace
INSERT INTO workspaces (name, slug, description, owner_id)
SELECT 'Default Workspace', 'default', 'Default workspace for organization', id FROM app_users LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Insert sample project template
INSERT INTO project_templates (name, description, project_type, structure, is_shared)
VALUES (
    'Kanban Board',
    'Basic Kanban project with To Do, In Progress, Done columns',
    'KANBAN',
    '{
        "columns": ["To Do", "In Progress", "Done"],
        "defaultStatuses": ["TODO", "IN_PROGRESS", "DONE"]
    }'::jsonb,
    true
)
ON CONFLICT DO NOTHING;

-- Insert sample project template
INSERT INTO project_templates (name, description, project_type, structure, is_shared)
VALUES (
    'Scrum Sprint',
    'Scrum project with Sprint planning and backlog',
    'SCRUM',
    '{
        "sprintLength": 14,
        "defaultStatuses": ["BACKLOG", "TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
    }'::jsonb,
    true
)
ON CONFLICT DO NOTHING;
