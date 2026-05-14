-- Seed roles and admin user
INSERT INTO everx_auth.users (email, password_hash, full_name, phone, role, office_location, is_active, created_by, is_deleted)
VALUES 
    ('admin@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Administrator', '+61412345678', 'ADMIN', 'AUSTRALIA', true, NULL, false),
    ('sales.manager@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Sales Manager', '+61412345678', 'SALES_MANAGER', 'AUSTRALIA', true, NULL, false),
    ('sales.rep@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Sales Representative', '+61412345678', 'SALES_REP', 'AUSTRALIA', true, NULL, false),
    ('tech@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Service Technician', '+61412345678', 'SERVICE_TECH', 'AUSTRALIA', true, NULL, false),
    ('finance@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Finance Officer', '+61412345678', 'FINANCE', 'AUSTRALIA', true, NULL, false),
    ('readonly@everx.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZbGJ1G6', 'Read Only User', '+61412345678', 'READ_ONLY', 'AUSTRALIA', true, NULL, false);

-- Note: Password hash is for "password123" using BCrypt with strength 12
--       In production, change the default passwords immediately
