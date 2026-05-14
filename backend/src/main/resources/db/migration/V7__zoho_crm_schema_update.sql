-- ============================================================
-- V7: Align CRM schema to Zoho-like CRM spec (Prompt.md)
-- ============================================================

-- Enable pg_trgm for fast ILIKE search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. ALTER USERS TABLE — add first_name, last_name, rename role values
-- ============================================================
ALTER TABLE everx_auth.users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE everx_auth.users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Populate first_name / last_name from full_name
UPDATE everx_auth.users SET
    first_name = split_part(full_name, ' ', 1),
    last_name  = CASE WHEN position(' ' in full_name) > 0
                      THEN substring(full_name from position(' ' in full_name) + 1)
                      ELSE full_name END
WHERE first_name IS NULL;

ALTER TABLE everx_auth.users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE everx_auth.users ALTER COLUMN last_name SET NOT NULL;

-- Update roles to match new spec: SUPER_ADMIN, ADMIN, MANAGER, SALES_REP, VIEWER
UPDATE everx_auth.users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN';
UPDATE everx_auth.users SET role = 'MANAGER' WHERE role = 'SALES_MANAGER';
UPDATE everx_auth.users SET role = 'VIEWER' WHERE role = 'READ_ONLY';
-- SALES_REP stays, SERVICE_TECH & FINANCE are kept as-is for ERP

-- ============================================================
-- 2. ALTER ACCOUNTS TABLE — add Zoho fields
-- ============================================================
ALTER TABLE everx_crm.accounts RENAME COLUMN company_name TO name;
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS billing_street TEXT;
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS billing_state VARCHAR(100);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(18,2);
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS employees INTEGER;
ALTER TABLE everx_crm.accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE everx_crm.accounts RENAME COLUMN assigned_to TO owner_id;

-- ============================================================
-- 3. ALTER CONTACTS TABLE — add Zoho fields
-- ============================================================
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS salutation VARCHAR(10);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mobile VARCHAR(30);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS department VARCHAR(150);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS gender VARCHAR(30);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mailing_street TEXT;
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mailing_city VARCHAR(100);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mailing_state VARCHAR(100);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mailing_zip VARCHAR(20);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS mailing_country VARCHAR(100);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS do_not_call BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE everx_crm.contacts ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE everx_crm.contacts RENAME COLUMN assigned_to TO owner_id;
-- Rename source → lead_source if source column already exists
ALTER TABLE everx_crm.contacts RENAME COLUMN source TO lead_source_old;
UPDATE everx_crm.contacts SET lead_source = lead_source_old;
ALTER TABLE everx_crm.contacts DROP COLUMN IF EXISTS lead_source_old;

-- Make account_id nullable (contacts can exist without accounts)
ALTER TABLE everx_crm.contacts ALTER COLUMN account_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_tags ON everx_crm.contacts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm ON everx_crm.contacts USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- ============================================================
-- 4. ALTER LEADS TABLE — Zoho-style individual lead
-- ============================================================
-- Add new columns
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS salutation VARCHAR(10);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS mobile VARCHAR(30);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS job_title VARCHAR(150);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS rating SMALLINT;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS zip VARCHAR(20);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS annual_revenue NUMERIC(18,2);
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS employees INTEGER;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS is_converted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS converted_contact_id UUID;
ALTER TABLE everx_crm.leads ADD COLUMN IF NOT EXISTS converted_account_id UUID;
ALTER TABLE everx_crm.leads RENAME COLUMN assigned_to TO owner_id;
ALTER TABLE everx_crm.leads RENAME COLUMN estimated_value TO annual_revenue_old;

-- Populate first_name/last_name from title if possible
UPDATE everx_crm.leads SET
    first_name = COALESCE(split_part(title, ' ', 1), 'Unknown'),
    last_name = COALESCE(NULLIF(substring(title from position(' ' in title) + 1), ''), 'Lead')
WHERE first_name IS NULL;

-- Migrate source → lead_source
UPDATE everx_crm.leads SET lead_source = source WHERE lead_source IS NULL AND source IS NOT NULL;

-- Make account_id nullable (Zoho leads don't require account)
ALTER TABLE everx_crm.contacts ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE everx_crm.leads ALTER COLUMN account_id DROP NOT NULL;

-- Drop old columns that are replaced
ALTER TABLE everx_crm.leads DROP COLUMN IF EXISTS annual_revenue_old;

-- Add constraints
ALTER TABLE everx_crm.leads ADD CONSTRAINT chk_lead_rating CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5));

CREATE INDEX IF NOT EXISTS idx_leads_email ON everx_crm.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_name_trgm ON everx_crm.leads USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- Deferred FKs for circular lead → converted_* references
ALTER TABLE everx_crm.leads
    ADD CONSTRAINT fk_lead_converted_contact FOREIGN KEY (converted_contact_id) REFERENCES everx_crm.contacts(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE everx_crm.leads
    ADD CONSTRAINT fk_lead_converted_account FOREIGN KEY (converted_account_id) REFERENCES everx_crm.accounts(id) DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- 5. ALTER DEALS TABLE — Zoho-style
-- ============================================================
ALTER TABLE everx_crm.deals RENAME COLUMN title TO name;
ALTER TABLE everx_crm.deals RENAME COLUMN deal_value TO amount;
ALTER TABLE everx_crm.deals RENAME COLUMN contact_id TO primary_contact_id;
ALTER TABLE everx_crm.deals RENAME COLUMN assigned_to TO owner_id;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50);
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE everx_crm.deals ADD COLUMN IF NOT EXISTS campaign_source VARCHAR(255);
ALTER TABLE everx_crm.deals RENAME COLUMN lost_reason TO loss_reason;

-- Add probability constraint
ALTER TABLE everx_crm.deals ADD CONSTRAINT chk_deal_probability CHECK (probability IS NULL OR (probability BETWEEN 0 AND 100));

-- Create deal_contacts junction table
CREATE TABLE IF NOT EXISTS everx_crm.deal_contacts (
    deal_id     UUID NOT NULL REFERENCES everx_crm.deals(id) ON DELETE CASCADE,
    contact_id  UUID NOT NULL REFERENCES everx_crm.contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_deals_close ON everx_crm.deals(expected_close_date);

-- ============================================================
-- 6. ALTER ACTIVITIES TABLE — add status, duration_mins, account_id
-- ============================================================
ALTER TABLE everx_crm.activities ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE everx_crm.activities ADD COLUMN IF NOT EXISTS duration_mins INTEGER;
ALTER TABLE everx_crm.activities ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES everx_crm.accounts(id) ON DELETE CASCADE;
ALTER TABLE everx_crm.activities RENAME COLUMN performed_by TO assigned_to;

CREATE INDEX IF NOT EXISTS idx_activities_account ON everx_crm.activities(account_id);

-- ============================================================
-- 7. CREATE TAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS everx_crm.tags (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7)
);

-- ============================================================
-- 8. CREATE NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS everx_auth.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES everx_auth.users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. Seed updated admin user
-- ============================================================
-- Insert SUPER_ADMIN user
INSERT INTO everx_auth.users (email, password_hash, full_name, first_name, last_name, phone, role, office_location, is_active, is_deleted)
VALUES ('superadmin@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Super Administrator', 'Super', 'Administrator', '+61412345678', 'SUPER_ADMIN', 'AUSTRALIA', true, false)
ON CONFLICT (email) DO NOTHING;
