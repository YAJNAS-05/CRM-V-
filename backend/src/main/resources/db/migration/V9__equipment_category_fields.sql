-- Add category-specific fields to equipment table
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS location_country VARCHAR(100);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS software VARCHAR(255);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS software_version VARCHAR(255);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS tube_type VARCHAR(255);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS installed_options TEXT;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS detector_size VARCHAR(100);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS tube_replaced VARCHAR(100);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS tube_scan_seconds INTEGER;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS num_rx_channels INTEGER;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS coils TEXT;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS choice_of_probes TEXT;
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS tube_manufactured VARCHAR(100);
ALTER TABLE everx_erp.equipment ADD COLUMN IF NOT EXISTS flat_detector_manufactured VARCHAR(100);

-- Add manufacturer, location, year fields to spare_parts
ALTER TABLE everx_erp.spare_parts ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
ALTER TABLE everx_erp.spare_parts ADD COLUMN IF NOT EXISTS location_country VARCHAR(100);
ALTER TABLE everx_erp.spare_parts ADD COLUMN IF NOT EXISTS year_of_manufacture INTEGER;
