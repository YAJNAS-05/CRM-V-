ALTER TABLE IF EXISTS everx_erp.invoices
  ADD COLUMN IF NOT EXISTS three_way_matched boolean DEFAULT false;

UPDATE everx_erp.invoices
SET three_way_matched = false
WHERE three_way_matched IS NULL;

ALTER TABLE IF EXISTS everx_erp.invoices
  ALTER COLUMN three_way_matched SET DEFAULT false,
  ALTER COLUMN three_way_matched SET NOT NULL;
