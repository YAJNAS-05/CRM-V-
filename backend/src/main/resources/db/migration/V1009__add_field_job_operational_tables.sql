CREATE TABLE IF NOT EXISTS everx_erp.field_job_checklists (
    checklist_id BIGSERIAL PRIMARY KEY,
    field_job_id UUID NOT NULL UNIQUE REFERENCES everx_erp.field_jobs(id) ON DELETE CASCADE,
    generated_from_template BIGINT,
    overall_result VARCHAR(50),
    completed_by VARCHAR(255),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS everx_erp.field_job_checklist_items (
    item_instance_id BIGSERIAL PRIMARY KEY,
    checklist_id BIGINT NOT NULL REFERENCES everx_erp.field_job_checklists(checklist_id) ON DELETE CASCADE,
    template_item_id BIGINT,
    section_name VARCHAR(255) NOT NULL,
    item_text TEXT NOT NULL,
    result VARCHAR(50) NOT NULL,
    engineer_note TEXT,
    photo_attached BOOLEAN NOT NULL DEFAULT FALSE,
    photo BYTEA
);

CREATE INDEX IF NOT EXISTS idx_field_job_checklist_items_checklist ON everx_erp.field_job_checklist_items(checklist_id);

CREATE TABLE IF NOT EXISTS everx_erp.field_job_costs (
    cost_id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    field_job_id UUID NOT NULL REFERENCES everx_erp.field_jobs(id) ON DELETE CASCADE,
    cost_category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    linked_part_id VARCHAR(255),
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(50),
    unit_cost_amount NUMERIC(12, 2) NOT NULL,
    cost_currency VARCHAR(10),
    fx_rate_to_usd NUMERIC(10, 6),
    total_cost_local NUMERIC(12, 2),
    total_cost_usd NUMERIC(12, 2),
    receipt_reference VARCHAR(255),
    receipt_attached BYTEA,
    gl_account VARCHAR(50),
    posting_date DATE NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date DATE,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reversal_of_cost_id BIGINT,
    CONSTRAINT check_field_job_cost_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_field_job_cost_amount_positive CHECK (unit_cost_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_field_job_costs_field_job ON everx_erp.field_job_costs(field_job_id);
CREATE INDEX IF NOT EXISTS idx_field_job_costs_posting_date ON everx_erp.field_job_costs(posting_date);

CREATE TABLE IF NOT EXISTS everx_erp.field_job_travel (
    travel_id BIGSERIAL PRIMARY KEY,
    field_job_id UUID NOT NULL REFERENCES everx_erp.field_jobs(id) ON DELETE CASCADE,
    engineer_id VARCHAR(255) NOT NULL,
    leg_number INTEGER,
    travel_mode VARCHAR(50) NOT NULL,
    departure_city VARCHAR(255) NOT NULL,
    departure_country VARCHAR(100),
    departure_datetime TIMESTAMPTZ NOT NULL,
    arrival_city VARCHAR(255) NOT NULL,
    arrival_country VARCHAR(100),
    arrival_datetime TIMESTAMPTZ NOT NULL,
    flight_number VARCHAR(100),
    booking_reference VARCHAR(100),
    ticket_cost_amount NUMERIC(12, 2),
    ticket_cost_currency VARCHAR(10),
    accommodation_nights INTEGER,
    accommodation_cost NUMERIC(12, 2),
    accommodation_currency VARCHAR(10),
    per_diem_days INTEGER,
    per_diem_rate_usd NUMERIC(12, 2),
    visa_required BOOLEAN NOT NULL DEFAULT FALSE,
    visa_status VARCHAR(50),
    travel_notes TEXT,
    CONSTRAINT check_field_job_travel_dates CHECK (arrival_datetime >= departure_datetime)
);

CREATE INDEX IF NOT EXISTS idx_field_job_travel_field_job ON everx_erp.field_job_travel(field_job_id);

CREATE TABLE IF NOT EXISTS everx_erp.field_job_reports (
    report_id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    field_job_id UUID NOT NULL UNIQUE REFERENCES everx_erp.field_jobs(id) ON DELETE CASCADE,
    report_number VARCHAR(50) NOT NULL UNIQUE,
    report_generated_at TIMESTAMPTZ NOT NULL,
    report_generated_by VARCHAR(255),
    job_summary TEXT NOT NULL,
    work_performed_summary TEXT NOT NULL,
    equipment_condition VARCHAR(100),
    post_job_equipment_status VARCHAR(100),
    checklist_summary_result VARCHAR(50),
    parts_used_summary TEXT,
    total_job_cost_usd NUMERIC(12, 2),
    issues_found_during_job TEXT,
    recommendations_to_client TEXT,
    next_service_due_date DATE,
    report_pdf_generated BOOLEAN NOT NULL DEFAULT FALSE,
    report_pdf_document BYTEA,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_of_report_id BIGINT,
    reversal_reason TEXT,
    reversed_at TIMESTAMPTZ,
    reversed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_field_job_reports_field_job ON everx_erp.field_job_reports(field_job_id);

CREATE TABLE IF NOT EXISTS everx_erp.field_job_sign_offs (
    sign_off_id BIGSERIAL PRIMARY KEY,
    field_job_id UUID NOT NULL UNIQUE REFERENCES everx_erp.field_jobs(id) ON DELETE CASCADE,
    report_id BIGINT NOT NULL REFERENCES everx_erp.field_job_reports(report_id),
    sign_off_status VARCHAR(50) NOT NULL DEFAULT 'NOT_OBTAINED',
    client_representative VARCHAR(255) NOT NULL,
    client_designation VARCHAR(255) NOT NULL,
    signed_off_date DATE NOT NULL,
    signed_off_time TIME NOT NULL,
    client_signature_image BYTEA,
    client_comments TEXT,
    client_satisfaction INTEGER,
    dispute_reason TEXT,
    dispute_resolution TEXT,
    dispute_resolved_date DATE,
    waiver_reason TEXT,
    waiver_approved_by VARCHAR(255),
    everx_representative VARCHAR(255),
    sign_off_location VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_job_sign_offs_status ON everx_erp.field_job_sign_offs(sign_off_status);