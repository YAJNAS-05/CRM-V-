-- Flyway Migration V26: HR Module (everx_hr schema)
-- Creates core HR tables for departments, employees, payroll, timesheets, and leave requests

CREATE SCHEMA IF NOT EXISTS everx_hr;

CREATE TABLE IF NOT EXISTS everx_hr.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_department_id UUID REFERENCES everx_hr.departments(id),
    manager_employee_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    grade VARCHAR(50),
    min_salary NUMERIC(15,2),
    max_salary NUMERIC(15,2),
    currency CHAR(3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department_id UUID REFERENCES everx_hr.departments(id),
    position_id UUID REFERENCES everx_hr.positions(id),
    manager_id UUID REFERENCES everx_hr.employees(id),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    hire_date DATE,
    termination_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES everx_hr.employees(id),
    pay_type VARCHAR(50) NOT NULL DEFAULT 'SALARY',
    pay_frequency VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    salary_amount NUMERIC(15,2),
    hourly_rate NUMERIC(15,2),
    currency CHAR(3),
    tax_id VARCHAR(100),
    bank_account_masked VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    run_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES everx_hr.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    gross_pay NUMERIC(15,2),
    deductions NUMERIC(15,2),
    net_pay NUMERIC(15,2),
    currency CHAR(3),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paid_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    field_job_id UUID REFERENCES everx_erp.field_jobs(id),
    work_date DATE NOT NULL,
    hours_worked NUMERIC(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_hr.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES everx_hr.employees(id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

ALTER TABLE everx_hr.departments
    ADD CONSTRAINT fk_departments_manager
    FOREIGN KEY (manager_employee_id)
    REFERENCES everx_hr.employees(id);

CREATE INDEX IF NOT EXISTS idx_departments_code ON everx_hr.departments(code);
CREATE INDEX IF NOT EXISTS idx_positions_title ON everx_hr.positions(title);
CREATE INDEX IF NOT EXISTS idx_employees_department ON everx_hr.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON everx_hr.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON everx_hr.employees(status);
CREATE INDEX IF NOT EXISTS idx_payroll_profiles_employee ON everx_hr.payroll_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON everx_hr.payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON everx_hr.payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON everx_hr.payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON everx_hr.timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON everx_hr.timesheets(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON everx_hr.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON everx_hr.leave_requests(status);
