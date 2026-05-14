-- Flyway Migration V25: Remove deprecated service tickets
-- Field jobs replace service tickets across ERP workflows

DROP TABLE IF EXISTS everx_erp.service_tickets CASCADE;
