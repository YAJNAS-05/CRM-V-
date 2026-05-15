-- Enforce two dashboard permissions model for existing PostgreSQL databases.
-- Keeps generic DASHBOARD_VIEW only for admin roles; business roles use explicit SELF/TEAM permissions.

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'DASHBOARD_SELF_VIEW', 'CRM', 'SELF_VIEW', 'View CRM user dashboard', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'DASHBOARD_SELF_VIEW'
);

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'DASHBOARD_TEAM_VIEW', 'CRM', 'TEAM_VIEW', 'View CRM team dashboard', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'DASHBOARD_TEAM_VIEW'
);

-- Role mappings: SELF view
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'DASHBOARD_SELF_VIEW'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER', 'SALES_REP', 'FINANCE', 'VIEWER', 'READ_ONLY')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Role mappings: TEAM view
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'DASHBOARD_TEAM_VIEW'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_MANAGER')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Remove generic DASHBOARD_VIEW from non-admin roles to avoid bypassing the two-permission model.
DELETE FROM everx_auth.role_permissions rp
USING everx_auth.roles r, everx_auth.permissions p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND p.permission_key = 'DASHBOARD_VIEW'
  AND r.name NOT IN ('SUPER_ADMIN', 'ADMIN');
