-- Flyway Migration V18: Field Work Management System
-- Created: April 2026
-- Purpose: Complete field work module with all 5 job types, checklists, costs, travel, reports, sign-off

-- ============================================================================
-- TABLE: field_jobs (Master Record)
-- ============================================================================
CREATE TABLE field_jobs (
    field_job_id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    job_number VARCHAR(50) NOT NULL UNIQUE,
    job_type VARCHAR(50) NOT NULL,
    job_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    priority VARCHAR(50) DEFAULT 'ROUTINE',
    
    -- Linked Entities
    linked_entity VARCHAR(100),
    linked_equipment_sku VARCHAR(100),
    linked_lead_id BIGINT,
    linked_po_id BIGINT,
    linked_sales_order_id BIGINT,
    linked_shipment_id BIGINT,
    linked_warranty_id BIGINT,
    linked_service_ticket_id BIGINT,
    
    -- Site & Client Info
    client_or_seller_name VARCHAR(255) NOT NULL,
    site_contact_name VARCHAR(255) NOT NULL,
    site_contact_phone VARCHAR(20),
    site_contact_email VARCHAR(255) NOT NULL,
    site_address_line1 VARCHAR(255) NOT NULL,
    site_address_line2 VARCHAR(255),
    site_city VARCHAR(100) NOT NULL,
    site_country VARCHAR(100),
    site_timezone VARCHAR(50),
    
    -- Scheduling
    scheduled_start_date DATE NOT NULL,
    scheduled_end_date DATE NOT NULL,
    estimated_duration_days INTEGER,
    actual_start_date DATE,
    actual_end_date DATE,
    actual_duration_days INTEGER,
    
    -- Engineer Assignment
    primary_engineer_type VARCHAR(50),
    primary_engineer_id BIGINT,
    primary_engineer_name VARCHAR(255),
    secondary_engineer_id BIGINT,
    secondary_engineer_name VARCHAR(255),
    engineer_assigned_date DATE,
    engineer_accepted BOOLEAN DEFAULT FALSE,
    engineer_accepted_date DATE,
    
    -- Notes
    internal_notes TEXT,
    client_brief_notes TEXT,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    CONSTRAINT check_dates CHECK (scheduled_end_date >= scheduled_start_date),
    CONSTRAINT check_actual_dates CHECK (actual_end_date IS NULL OR actual_end_date >= actual_start_date)
);

CREATE INDEX idx_field_jobs_job_type ON field_jobs(job_type);
CREATE INDEX idx_field_jobs_job_status ON field_jobs(job_status);
CREATE INDEX idx_field_jobs_primary_engineer ON field_jobs(primary_engineer_id);
CREATE INDEX idx_field_jobs_scheduled_dates ON field_jobs(scheduled_start_date, scheduled_end_date);

-- ============================================================================
-- TYPE 1: Site Assessment Details
-- ============================================================================
CREATE TABLE site_assessment_details (
    sa_detail_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    
    modality_requested VARCHAR(100),
    room_width_mm INTEGER,
    room_depth_mm INTEGER,
    room_height_mm INTEGER,
    floor_load_capacity_kg_m2 INTEGER,
    door_width_mm INTEGER,
    power_supply_voltage VARCHAR(50),
    power_supply_amps INTEGER,
    dedicated_circuit BOOLEAN,
    hvac_capacity_kw NUMERIC(10, 2),
    shielding_present BOOLEAN,
    shielding_type VARCHAR(100),
    rf_cage_required BOOLEAN,
    
    site_readiness_status VARCHAR(50),
    remedial_work_needed TEXT,
    estimated_ready_date DATE,
    site_photos_attached BOOLEAN DEFAULT FALSE,
    site_sketch_attached BOOLEAN DEFAULT FALSE,
    assessment_summary TEXT NOT NULL,
    recommended_equipment TEXT
);

-- ============================================================================
-- TYPE 2: De-Installation Details
-- ============================================================================
CREATE TABLE de_install_details (
    de_install_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    linked_po_id BIGINT NOT NULL,
    
    equipment_make VARCHAR(255),
    equipment_model VARCHAR(255),
    serial_number VARCHAR(255) NOT NULL,
    power_disconnect_date TIMESTAMP NOT NULL,
    data_wipe_completed BOOLEAN,
    data_wipe_method VARCHAR(255),
    anchoring_removed BOOLEAN,
    all_components_accounted BOOLEAN,
    missing_components TEXT,
    
    packaging_type VARCHAR(100),
    crate_count INTEGER,
    total_weight_kg NUMERIC(12, 2),
    ready_for_collection_date DATE,
    carrier_handover_date DATE,
    condition_at_de_install VARCHAR(50),
    de_install_notes TEXT
);

-- ============================================================================
-- TYPE 3: Installation Details
-- ============================================================================
CREATE TABLE installation_details (
    install_detail_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    linked_sales_order_id BIGINT NOT NULL,
    linked_shipment_id BIGINT NOT NULL,
    linked_equipment_sku VARCHAR(100) NOT NULL,
    
    unpacking_complete_date DATE,
    all_components_present BOOLEAN,
    missing_on_delivery TEXT,
    civil_work_verified BOOLEAN,
    power_connection_date DATE,
    power_test_passed BOOLEAN,
    network_connection_done BOOLEAN,
    physical_install_date DATE,
    system_boot_successful BOOLEAN,
    
    calibration_date DATE,
    calibration_engineer VARCHAR(255) NOT NULL,
    calibration_cert_ref VARCHAR(255),
    phantom_test_completed BOOLEAN,
    image_quality_approved BOOLEAN,
    software_version VARCHAR(50),
    applications_software TEXT,
    
    staff_training_date DATE,
    staff_trained_count INTEGER,
    training_notes TEXT,
    handover_date DATE NOT NULL,
    warranty_start_confirmed DATE,
    install_notes TEXT
);

-- ============================================================================
-- TYPE 4: PPM Details
-- ============================================================================
CREATE TABLE ppm_details (
    ppm_detail_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    linked_warranty_id BIGINT NOT NULL,
    linked_equipment_sku VARCHAR(100) NOT NULL,
    
    ppm_type VARCHAR(50),
    ppm_visit_number INTEGER,
    previous_ppm_date DATE,
    tube_life_checked_pct INTEGER,
    cooling_system_checked BOOLEAN,
    cooling_system_status VARCHAR(50),
    filters_cleaned BOOLEAN,
    calibration_verified BOOLEAN,
    
    software_version_checked BOOLEAN,
    software_current_version VARCHAR(50),
    software_update_applied BOOLEAN,
    hardware_inspection VARCHAR(50),
    safety_checks_completed BOOLEAN,
    safety_check_standard VARCHAR(50),
    image_quality_test VARCHAR(50),
    
    parts_replaced_during_ppm TEXT,
    findings_summary TEXT NOT NULL,
    recommended_actions TEXT,
    ppm_cert_reference VARCHAR(255),
    ppm_cert_issue_date DATE,
    next_ppm_recommend_date DATE
);

-- ============================================================================
-- TYPE 5: Repair Details
-- ============================================================================
CREATE TABLE repair_details (
    repair_detail_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    linked_service_ticket_id BIGINT NOT NULL,
    linked_equipment_sku VARCHAR(100) NOT NULL,
    linked_warranty_id BIGINT,
    
    is_under_warranty BOOLEAN,
    fault_found_on_site TEXT NOT NULL,
    root_cause_category VARCHAR(100),
    root_cause_description TEXT NOT NULL,
    remote_attempted_first BOOLEAN,
    remote_resolution_result VARCHAR(255),
    parts_replaced TEXT,
    parts_ordered TEXT,
    
    repair_method_used TEXT NOT NULL,
    test_after_repair VARCHAR(50),
    image_quality_post_repair VARCHAR(50),
    equipment_status_post VARCHAR(50),
    downtime_hours INTEGER,
    sla_breach BOOLEAN DEFAULT FALSE,
    repair_notes TEXT
);

-- ============================================================================
-- TABLE: Checklist Templates (Config-Driven)
-- ============================================================================
CREATE TABLE checklist_templates (
    template_id BIGSERIAL PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL,
    modality VARCHAR(100),
    section_name VARCHAR(255) NOT NULL,
    item_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    sort_order INTEGER
);

CREATE INDEX idx_checklist_templates_job_type ON checklist_templates(job_type, modality);

-- ============================================================================
-- TABLE: Field Job Checklists (Instance per Job)
-- ============================================================================
CREATE TABLE field_job_checklists (
    checklist_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    generated_from_template BIGINT REFERENCES checklist_templates(template_id),
    
    overall_result VARCHAR(50),
    completed_by VARCHAR(255),
    completed_at TIMESTAMP
);

-- ============================================================================
-- TABLE: Checklist Items (Instance per Checklist)
-- ============================================================================
CREATE TABLE field_job_checklist_items (
    item_instance_id BIGSERIAL PRIMARY KEY,
    checklist_id BIGINT NOT NULL REFERENCES field_job_checklists(checklist_id) ON DELETE CASCADE,
    template_item_id BIGINT REFERENCES checklist_templates(template_id),
    
    section_name VARCHAR(255) NOT NULL,
    item_text TEXT NOT NULL,
    result VARCHAR(50) NOT NULL,
    engineer_note TEXT,
    photo_attached BOOLEAN DEFAULT FALSE,
    photo BYTEA
);

CREATE INDEX idx_checklist_items_checklist ON field_job_checklist_items(checklist_id);

-- ============================================================================
-- TABLE: Field Job Costs (with OCC Locking)
-- ============================================================================
CREATE TABLE field_job_costs (
    cost_id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    field_job_id BIGINT NOT NULL REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    
    cost_category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    linked_part_id BIGINT,
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
    
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reversal_of_cost_id BIGINT,
    
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_unit_cost_positive CHECK (unit_cost_amount > 0)
);

CREATE INDEX idx_field_job_costs_field_job ON field_job_costs(field_job_id);
CREATE INDEX idx_field_job_costs_posting_date ON field_job_costs(posting_date);
CREATE INDEX idx_field_job_costs_category ON field_job_costs(cost_category);

-- ============================================================================
-- TABLE: Field Job Travel
-- ============================================================================
CREATE TABLE field_job_travel (
    travel_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    engineer_id BIGINT NOT NULL,
    
    leg_number INTEGER,
    travel_mode VARCHAR(50) NOT NULL,
    departure_city VARCHAR(255) NOT NULL,
    departure_country VARCHAR(100),
    departure_datetime TIMESTAMP NOT NULL,
    arrival_city VARCHAR(255) NOT NULL,
    arrival_country VARCHAR(100),
    arrival_datetime TIMESTAMP NOT NULL,
    
    flight_number VARCHAR(100),
    booking_reference VARCHAR(100),
    ticket_cost_amount NUMERIC(12, 2),
    ticket_cost_currency VARCHAR(10),
    
    accommodation_nights INTEGER,
    accommodation_cost NUMERIC(12, 2),
    accommodation_currency VARCHAR(10),
    per_diem_days INTEGER,
    per_diem_rate_usd NUMERIC(12, 2),
    
    visa_required BOOLEAN DEFAULT FALSE,
    visa_status VARCHAR(50),
    travel_notes TEXT,
    
    CONSTRAINT check_travel_dates CHECK (arrival_datetime >= departure_datetime)
);

CREATE INDEX idx_field_job_travel_field_job ON field_job_travel(field_job_id);

-- ============================================================================
-- TABLE: Field Job Reports (with OCC Locking & Immutability)
-- ============================================================================
CREATE TABLE field_job_reports (
    report_id BIGSERIAL PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    
    report_number VARCHAR(50) NOT NULL UNIQUE,
    report_generated_at TIMESTAMP NOT NULL,
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
    
    report_pdf_generated BOOLEAN DEFAULT FALSE,
    report_pdf_document BYTEA,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    
    reversal_of_report_id BIGINT,
    reversal_reason TEXT,
    reversed_at TIMESTAMP,
    reversed_by VARCHAR(255)
);

CREATE INDEX idx_field_job_reports_field_job ON field_job_reports(field_job_id);
CREATE INDEX idx_field_job_reports_is_locked ON field_job_reports(is_locked);

-- ============================================================================
-- TABLE: Field Job Sign-Off
-- ============================================================================
CREATE TABLE field_job_sign_offs (
    sign_off_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL UNIQUE REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    report_id BIGINT NOT NULL REFERENCES field_job_reports(report_id),
    
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
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_field_job_sign_offs_status ON field_job_sign_offs(sign_off_status);

-- ============================================================================
-- TABLE: Engineer Availability (Dispatch Board)
-- ============================================================================
CREATE TABLE engineer_availability (
    availability_id BIGSERIAL PRIMARY KEY,
    subcontractor_id BIGINT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    
    availability_status VARCHAR(50) NOT NULL,
    linked_field_job_id BIGINT REFERENCES field_jobs(field_job_id) ON DELETE SET NULL,
    country VARCHAR(100),
    notes TEXT,
    
    CONSTRAINT check_availability_dates CHECK (to_date >= from_date)
);

CREATE INDEX idx_engineer_availability_subcontractor ON engineer_availability(subcontractor_id);
CREATE INDEX idx_engineer_availability_dates ON engineer_availability(from_date, to_date);
CREATE INDEX idx_engineer_availability_status ON engineer_availability(availability_status);

-- ============================================================================
-- TABLE: Posting Period Config (Finance Gate)
-- ============================================================================
CREATE TABLE posting_period_config (
    period_id BIGSERIAL PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    entity VARCHAR(100) NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    
    opened_at TIMESTAMP,
    opened_by VARCHAR(255),
    closed_at TIMESTAMP,
    closed_by VARCHAR(255),
    
    UNIQUE (fiscal_year, period_month, entity),
    CONSTRAINT check_month CHECK (period_month BETWEEN 1 AND 12)
);

-- ============================================================================
-- TABLE: Account Determination (GL Mapping)
-- ============================================================================
CREATE TABLE account_determination (
    acct_det_id BIGSERIAL PRIMARY KEY,
    cost_category VARCHAR(50) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    gl_account_code VARCHAR(50) NOT NULL,
    gl_account_name VARCHAR(255) NOT NULL,
    
    UNIQUE (cost_category, entity)
);

-- ============================================================================
-- TABLE: FX Rate History
-- ============================================================================
CREATE TABLE fx_rate_history (
    fx_rate_id BIGSERIAL PRIMARY KEY,
    rate_date DATE NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(10, 6) NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (rate_date, from_currency, to_currency)
);

CREATE INDEX idx_fx_rate_history_date ON fx_rate_history(rate_date);

-- ============================================================================
-- TABLE: Field Job Audit Log
-- ============================================================================
CREATE TABLE field_job_audit (
    audit_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_type VARCHAR(50)
);

CREATE INDEX idx_field_job_audit_field_job ON field_job_audit(field_job_id);
CREATE INDEX idx_field_job_audit_changed_at ON field_job_audit(changed_at);

-- ============================================================================
-- TABLE: SLA Breach Log
-- ============================================================================
CREATE TABLE sla_breach_log (
    breach_id BIGSERIAL PRIMARY KEY,
    field_job_id BIGINT NOT NULL REFERENCES field_jobs(field_job_id) ON DELETE CASCADE,
    service_ticket_id BIGINT,
    
    sla_hours INTEGER,
    actual_hours INTEGER,
    breach_amount_hours INTEGER,
    breach_detected_at TIMESTAMP NOT NULL,
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_to VARCHAR(255),
    notes TEXT
);

CREATE INDEX idx_sla_breach_log_field_job ON sla_breach_log(field_job_id);
CREATE INDEX idx_sla_breach_log_detected_at ON sla_breach_log(breach_detected_at);

-- ============================================================================
-- SEED DATA: Checklist Templates
-- ============================================================================

-- INSTALLATION templates - CT
INSERT INTO checklist_templates (job_type, modality, section_name, item_text, is_mandatory, sort_order) VALUES
('INSTALLATION', 'CT', 'Pre-Power Checks', 'Room dimensions verified vs spec', true, 1),
('INSTALLATION', 'CT', 'Pre-Power Checks', 'Floor load capacity confirmed', true, 2),
('INSTALLATION', 'CT', 'Pre-Power Checks', 'Dedicated power circuit verified', true, 3),
('INSTALLATION', 'CT', 'Pre-Power Checks', 'All crates received and counted', true, 4),
('INSTALLATION', 'CT', 'Pre-Power Checks', 'No visible shipping damage', true, 5),
('INSTALLATION', 'CT', 'Mechanical Installation', 'Gantry positioned and levelled', true, 6),
('INSTALLATION', 'CT', 'Mechanical Installation', 'Patient table installed and aligned', true, 7),
('INSTALLATION', 'CT', 'Mechanical Installation', 'All covers and panels fitted', true, 8),
('INSTALLATION', 'CT', 'Mechanical Installation', 'Anchor bolts tightened to spec', true, 9),
('INSTALLATION', 'CT', 'Electrical', 'Earth bonding verified', true, 10),
('INSTALLATION', 'CT', 'Electrical', 'Voltage at supply point confirmed', true, 11),
('INSTALLATION', 'CT', 'Electrical', 'PDU installed and connected', true, 12),
('INSTALLATION', 'CT', 'Software & Calibration', 'System boot successful', true, 13),
('INSTALLATION', 'CT', 'Software & Calibration', 'Software version verified', true, 14),
('INSTALLATION', 'CT', 'Software & Calibration', 'Air calibration completed', true, 15),
('INSTALLATION', 'CT', 'Software & Calibration', 'Water phantom scan performed', true, 16),
('INSTALLATION', 'CT', 'Software & Calibration', 'Image quality approved by engineer', true, 17),
('INSTALLATION', 'CT', 'Safety', 'Radiation warning signs posted', true, 18),
('INSTALLATION', 'CT', 'Safety', 'Lead aprons provided', true, 19),
('INSTALLATION', 'CT', 'Safety', 'Emergency stop tested', true, 20);

-- ============================================================================
-- SEED DATA: Account Determination Mapping
-- ============================================================================

INSERT INTO account_determination (cost_category, entity, gl_account_code, gl_account_name) VALUES
('LABOUR', 'EVERX_AU', '6100-AU', 'Field Labour - AU'),
('LABOUR', 'EVERX_USA', '6100-US', 'Field Labour - USA'),
('LABOUR', 'NIPPON_EVERX', '6100-JP', 'Field Labour - JP'),
('TRAVEL', 'EVERX_AU', '6200-AU', 'Travel & Flights - AU'),
('TRAVEL', 'EVERX_USA', '6200-US', 'Travel & Flights - USA'),
('TRAVEL', 'NIPPON_EVERX', '6200-JP', 'Travel & Flights - JP'),
('ACCOMMODATION', 'EVERX_AU', '6300-AU', 'Accommodation - AU'),
('ACCOMMODATION', 'EVERX_USA', '6300-US', 'Accommodation - USA'),
('ACCOMMODATION', 'NIPPON_EVERX', '6300-JP', 'Accommodation - JP'),
('SPARE_PARTS', 'EVERX_AU', '5100', 'Parts COGS'),
('SPARE_PARTS', 'EVERX_USA', '5100', 'Parts COGS'),
('SPARE_PARTS', 'NIPPON_EVERX', '5100', 'Parts COGS'),
('CUSTOMS_DUTY', 'EVERX_AU', '6400', 'Import Duties'),
('CUSTOMS_DUTY', 'EVERX_USA', '6400', 'Import Duties'),
('CUSTOMS_DUTY', 'NIPPON_EVERX', '6400', 'Import Duties'),
('MISC', 'EVERX_AU', '6900-AU', 'Misc Field Costs - AU'),
('MISC', 'EVERX_USA', '6900-US', 'Misc Field Costs - USA'),
('MISC', 'NIPPON_EVERX', '6900-JP', 'Misc Field Costs - JP');

-- ============================================================================
-- SEED DATA: FX Rates (Sample Data - should be updated by scheduler)
-- ============================================================================

INSERT INTO fx_rate_history (rate_date, from_currency, to_currency, rate, source) VALUES
(CURRENT_DATE, 'AUD', 'USD', 0.65, 'RBA'),
(CURRENT_DATE, 'JPY', 'USD', 0.0067, 'ECB'),
(CURRENT_DATE - INTERVAL '1 day', 'AUD', 'USD', 0.6498, 'RBA'),
(CURRENT_DATE - INTERVAL '1 day', 'JPY', 'USD', 0.00671, 'ECB');

-- ============================================================================
-- SEED DATA: Posting Period Config (Current Year Open)
-- ============================================================================

INSERT INTO posting_period_config (fiscal_year, period_month, entity, is_open, opened_at, opened_by) VALUES
(2026, 1, 'EVERX_AU', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 1, 'EVERX_USA', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 1, 'NIPPON_EVERX', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 2, 'EVERX_AU', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 2, 'EVERX_USA', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 2, 'NIPPON_EVERX', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 3, 'EVERX_AU', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 3, 'EVERX_USA', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 3, 'NIPPON_EVERX', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 4, 'EVERX_AU', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 4, 'EVERX_USA', true, CURRENT_TIMESTAMP, 'SYSTEM'),
(2026, 4, 'NIPPON_EVERX', true, CURRENT_TIMESTAMP, 'SYSTEM');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
