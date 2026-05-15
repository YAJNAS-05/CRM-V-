-- Remove deprecated Trade Show artifacts from CRM schema
ALTER TABLE IF EXISTS everx_crm.leads DROP COLUMN IF EXISTS trade_show_id;
DROP TABLE IF EXISTS everx_crm.trade_shows;
