-- Make title nullable since Zoho-style leads use first_name/last_name instead
ALTER TABLE everx_crm.leads ALTER COLUMN title DROP NOT NULL;
