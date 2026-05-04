-- PM, CRM, HR, Finance enhancements

-- =========================
-- HR: Project management
-- =========================
CREATE TABLE IF NOT EXISTS everx_hr.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50),
    project_name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES everx_auth.users(id),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15,2),
    currency CHAR(3) DEFAULT 'AUD',
    linked_field_job_id UUID REFERENCES everx_erp.field_jobs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON everx_hr.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON everx_hr.projects(status);

CREATE TABLE IF NOT EXISTS everx_hr.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    role VARCHAR(50),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_project_member UNIQUE(project_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON everx_hr.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee ON everx_hr.project_members(employee_id);

CREATE TABLE IF NOT EXISTS everx_hr.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES everx_auth.users(id),
    assignee_id UUID REFERENCES everx_auth.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'TO_DO',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    estimated_hours NUMERIC(10,2),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON everx_hr.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON everx_hr.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON everx_hr.tasks(status);

CREATE TABLE IF NOT EXISTS everx_hr.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    task_id UUID REFERENCES everx_hr.tasks(id),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    work_date DATE,
    description VARCHAR(255),
    billable BOOLEAN NOT NULL DEFAULT false,
    rate_per_hour NUMERIC(10,2),
    timesheet_id UUID REFERENCES everx_hr.timesheets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON everx_hr.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON everx_hr.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON everx_hr.time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_timesheet ON everx_hr.time_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_work_date ON everx_hr.time_entries(work_date);

CREATE TABLE IF NOT EXISTS everx_hr.project_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES everx_hr.projects(id) ON DELETE CASCADE,
    cost_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    description VARCHAR(255),
    recorded_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_costs_project ON everx_hr.project_costs(project_id);

ALTER TABLE everx_hr.timesheets ADD COLUMN IF NOT EXISTS week_start_date DATE;
ALTER TABLE everx_hr.timesheets ADD COLUMN IF NOT EXISTS total_billable_hours NUMERIC(10,2);
ALTER TABLE everx_hr.timesheets ADD COLUMN IF NOT EXISTS total_non_billable_hours NUMERIC(10,2);
ALTER TABLE everx_hr.timesheets ADD COLUMN IF NOT EXISTS total_hours NUMERIC(10,2);

-- =========================
-- CRM: Stage workflow + lead scoring + quote conversion
-- =========================
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS days_in_stage INTEGER;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS days_in_pipeline INTEGER;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS expected_revenue_weighted NUMERIC(15,2);

CREATE TABLE IF NOT EXISTS everx_crm.lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES everx_crm.leads(id) ON DELETE CASCADE,
    score_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_lead ON everx_crm.lead_scores(lead_id);

CREATE TABLE IF NOT EXISTS everx_crm.deal_stage_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_name VARCHAR(50) NOT NULL,
    stage_order INTEGER NOT NULL,
    color_code VARCHAR(10),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uk_deal_stage_name UNIQUE(stage_name)
);

CREATE TABLE IF NOT EXISTS everx_crm.quote_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES everx_crm.quotes(id) ON DELETE CASCADE,
    sales_order_id UUID REFERENCES everx_erp.sales_orders(id),
    converted_by UUID REFERENCES everx_auth.users(id),
    converted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quote_conversions_quote ON everx_crm.quote_conversions(quote_id);

-- =========================
-- Finance: 3-way match exceptions + GL journals + invoice flag
-- =========================
ALTER TABLE everx_erp.invoices ADD COLUMN IF NOT EXISTS three_way_matched BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS everx_erp.three_way_match_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID,
    invoice_id UUID REFERENCES everx_erp.invoices(id) ON DELETE SET NULL,
    receipt_id UUID REFERENCES everx_erp.purchase_receipts(id) ON DELETE SET NULL,
    exception_type VARCHAR(50) NOT NULL,
    variance_amount NUMERIC(15,2),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    period_end DATE,
    notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_twm_exceptions_status ON everx_erp.three_way_match_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_twm_exceptions_period ON everx_erp.three_way_match_exceptions(period_end);

CREATE TABLE IF NOT EXISTS everx_erp.gl_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity VARCHAR(50),
    journal_source VARCHAR(50) NOT NULL,
    ref_document_id VARCHAR(50),
    debit_account_code VARCHAR(20),
    credit_account_code VARCHAR(20),
    debit_amount NUMERIC(15,2),
    credit_amount NUMERIC(15,2),
    currency CHAR(3),
    description TEXT,
    journal_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AUTO_GENERATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gl_journal_date ON everx_erp.gl_journal_entries(journal_date);
CREATE INDEX IF NOT EXISTS idx_gl_journal_entity ON everx_erp.gl_journal_entries(entity);
