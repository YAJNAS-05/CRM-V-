CREATE TABLE IF NOT EXISTS everx_hr.onboarding_tasks (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    due_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    assigned_to VARCHAR(255),
    completed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_employee_id ON everx_hr.onboarding_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_status ON everx_hr.onboarding_tasks(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_category ON everx_hr.onboarding_tasks(category);

CREATE TABLE IF NOT EXISTS everx_hr.appraisal_goals (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    owner_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    progress INTEGER NOT NULL DEFAULT 0,
    parent_goal_id VARCHAR(100),
    parent_goal_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_appraisal_goals_owner_id ON everx_hr.appraisal_goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_goals_status ON everx_hr.appraisal_goals(status);
