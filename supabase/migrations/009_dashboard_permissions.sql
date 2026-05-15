-- Seed dashboard-scoped permissions so role management can assign personal/team dashboard access.

INSERT INTO permissions (permission_key, module, action, description)
VALUES
  ('DASHBOARD_VIEW', 'dashboard', 'view', 'View dashboards'),
  ('DASHBOARD_SELF_VIEW', 'dashboard', 'self_view', 'View personal dashboard'),
  ('DASHBOARD_TEAM_VIEW', 'dashboard', 'team_view', 'View team dashboard'),
  ('DASHBOARD_FINANCE_VIEW', 'dashboard', 'finance_view', 'View finance dashboard'),
  ('DASHBOARD_HR_VIEW', 'dashboard', 'hr_view', 'View HR dashboard'),
  ('DASHBOARD_TECH_VIEW', 'dashboard', 'tech_view', 'View technician dashboard'),
  ('DASHBOARD_OPERATIONS_VIEW', 'dashboard', 'operations_view', 'View operations dashboard')
ON CONFLICT (permission_key) DO UPDATE
SET module = EXCLUDED.module,
    action = EXCLUDED.action,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Keep baseline system roles aligned with dashboard access.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_key IN (
  'DASHBOARD_VIEW',
  'DASHBOARD_SELF_VIEW',
  'DASHBOARD_TEAM_VIEW',
  'DASHBOARD_FINANCE_VIEW',
  'DASHBOARD_HR_VIEW',
  'DASHBOARD_TECH_VIEW',
  'DASHBOARD_OPERATIONS_VIEW'
)
WHERE r.name IN ('SUPER_ADMIN', 'Admin', 'ADMIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_key IN ('DASHBOARD_SELF_VIEW', 'DASHBOARD_TEAM_VIEW')
WHERE r.name IN ('MANAGER', 'Manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_key = 'DASHBOARD_SELF_VIEW'
WHERE r.name IN ('EMPLOYEE', 'Viewer', 'VIEWER')
ON CONFLICT (role_id, permission_id) DO NOTHING;
