-- ERP RBAC extension for Supabase
-- This migration is additive/compatible with existing schema in 001/002/005.

-- ============================================================
-- 1) ENUMS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_name') THEN
    CREATE TYPE module_name AS ENUM ('pm', 'finance', 'hr', 'fieldwork', 'crm', 'admin');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_action') THEN
    CREATE TYPE permission_action AS ENUM ('view', 'create', 'edit', 'delete', 'approve', 'export', 'assign');
  END IF;
END$$;

-- ============================================================
-- 2) TABLE SHAPE ALIGNMENT
-- ============================================================
ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT FALSE;

-- Keep old and new flags aligned
UPDATE roles
SET is_system_role = COALESCE(is_system, is_system_role, FALSE)
WHERE is_system_role IS DISTINCT FROM COALESCE(is_system, is_system_role, FALSE);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES app_users(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES app_users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure permissions table has the target fields
ALTER TABLE permissions
  ADD COLUMN IF NOT EXISTS module TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Best-effort backfill from legacy permission_key format: module:action or MODULE_ACTION
UPDATE permissions
SET module = lower(split_part(permission_key, ':', 1)),
    action = lower(split_part(permission_key, ':', 2))
WHERE permission_key LIKE '%:%'
  AND (module IS NULL OR action IS NULL);

UPDATE permissions
SET module = lower(split_part(permission_key, '_', 1)),
    action = CASE lower(split_part(permission_key, '_', 2))
      WHEN 'read' THEN 'view'
      WHEN 'update' THEN 'edit'
      WHEN 'write' THEN 'edit'
      ELSE lower(split_part(permission_key, '_', 2))
    END
WHERE permission_key LIKE '%_%'
  AND (module IS NULL OR action IS NULL);

-- Enforce module/action uniqueness in a non-breaking manner
CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_module_action_unique
  ON permissions(module, action)
  WHERE module IS NOT NULL AND action IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);

-- ============================================================
-- 3) SEED ROLES
-- ============================================================
INSERT INTO roles (name, description, is_system_role)
VALUES
  ('SUPER_ADMIN',     'Full system access across all modules', TRUE),
  ('ADMIN',           'Can manage users and roles', TRUE),
  ('PM Manager',      'Full access to Project Management module', FALSE),
  ('PM Viewer',       'Read-only access to PM module', FALSE),
  ('Finance Manager', 'Full access to Finance module including approve', FALSE),
  ('Finance Viewer',  'Read-only access to Finance module', FALSE),
  ('HR Manager',      'Full access to HR module', FALSE),
  ('HR Viewer',       'Read-only access to HR module', FALSE),
  ('Field Supervisor','Can assign, edit, and close fieldwork tasks', FALSE),
  ('Field Technician','Can view and update assigned fieldwork tasks', FALSE),
  ('CRM Manager',     'Full access to CRM module', FALSE),
  ('CRM Agent',       'Can create and edit CRM leads/contacts', FALSE),
  ('CRM Viewer',      'Read-only access to CRM', FALSE)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    is_system_role = EXCLUDED.is_system_role,
    updated_at = NOW();

-- ============================================================
-- 4) SEED PERMISSIONS
-- ============================================================
INSERT INTO permissions (permission_key, module, action, description)
VALUES
  ('ADMIN_VIEW', 'admin', 'view', 'View admin panel'),
  ('ADMIN_CREATE', 'admin', 'create', 'Create users/roles'),
  ('ADMIN_EDIT', 'admin', 'edit', 'Edit users/roles'),
  ('ADMIN_DELETE', 'admin', 'delete', 'Delete users/roles'),

  ('PM_VIEW', 'pm', 'view', 'View projects and tasks'),
  ('PM_CREATE', 'pm', 'create', 'Create projects and tasks'),
  ('PM_EDIT', 'pm', 'edit', 'Edit projects and tasks'),
  ('PM_DELETE', 'pm', 'delete', 'Delete projects and tasks'),
  ('PM_ASSIGN', 'pm', 'assign', 'Assign tasks to users'),
  ('PM_EXPORT', 'pm', 'export', 'Export project reports'),

  ('FINANCE_VIEW', 'finance', 'view', 'View financial records'),
  ('FINANCE_CREATE', 'finance', 'create', 'Create invoices/budgets'),
  ('FINANCE_EDIT', 'finance', 'edit', 'Edit financial records'),
  ('FINANCE_DELETE', 'finance', 'delete', 'Delete financial records'),
  ('FINANCE_APPROVE', 'finance', 'approve', 'Approve payments and budgets'),
  ('FINANCE_EXPORT', 'finance', 'export', 'Export financial reports'),

  ('HR_VIEW', 'hr', 'view', 'View HR records and employees'),
  ('HR_CREATE', 'hr', 'create', 'Create employee records'),
  ('HR_EDIT', 'hr', 'edit', 'Edit employee records'),
  ('HR_DELETE', 'hr', 'delete', 'Delete employee records'),
  ('HR_APPROVE', 'hr', 'approve', 'Approve leave and payroll'),
  ('HR_EXPORT', 'hr', 'export', 'Export HR reports'),

  ('FIELDWORK_VIEW', 'fieldwork', 'view', 'View fieldwork jobs and assignments'),
  ('FIELDWORK_CREATE', 'fieldwork', 'create', 'Create fieldwork jobs'),
  ('FIELDWORK_EDIT', 'fieldwork', 'edit', 'Edit fieldwork job details'),
  ('FIELDWORK_DELETE', 'fieldwork', 'delete', 'Delete fieldwork jobs'),
  ('FIELDWORK_ASSIGN', 'fieldwork', 'assign', 'Assign jobs to technicians'),
  ('FIELDWORK_EXPORT', 'fieldwork', 'export', 'Export fieldwork reports'),

  ('CRM_VIEW', 'crm', 'view', 'View leads, contacts, and deals'),
  ('CRM_CREATE', 'crm', 'create', 'Create leads, contacts, and deals'),
  ('CRM_EDIT', 'crm', 'edit', 'Edit CRM records'),
  ('CRM_DELETE', 'crm', 'delete', 'Delete CRM records'),
  ('CRM_ASSIGN', 'crm', 'assign', 'Assign CRM records to agents'),
  ('CRM_EXPORT', 'crm', 'export', 'Export CRM data')
ON CONFLICT (permission_key) DO UPDATE
SET module = EXCLUDED.module,
    action = EXCLUDED.action,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================
-- 5) ROLE-PERMISSION DEFAULTS
-- ============================================================
-- Super Admin gets everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('SUPER_ADMIN', 'Super Admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets admin module permissions only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'admin'
WHERE r.name IN ('ADMIN', 'Admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PM Manager / Viewer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'pm'
WHERE r.name = 'PM Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'pm' AND p.action = 'view'
WHERE r.name = 'PM Viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Finance Manager / Viewer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'finance'
WHERE r.name = 'Finance Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'finance' AND p.action = 'view'
WHERE r.name = 'Finance Viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Manager / Viewer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'hr'
WHERE r.name = 'HR Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'hr' AND p.action = 'view'
WHERE r.name = 'HR Viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Field Supervisor / Technician
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'fieldwork'
WHERE r.name = 'Field Supervisor'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'fieldwork' AND p.action IN ('view', 'edit')
WHERE r.name = 'Field Technician'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CRM Manager / Agent / Viewer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'crm'
WHERE r.name = 'CRM Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'crm' AND p.action IN ('view', 'create', 'edit')
WHERE r.name = 'CRM Agent'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module = 'crm' AND p.action = 'view'
WHERE r.name = 'CRM Viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 6) HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION has_permission(
  p_module module_name,
  p_action permission_action
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_app_user_id UUID;
BEGIN
  current_app_user_id := get_current_user_id();

  IF current_app_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = current_app_user_id
      AND lower(COALESCE(p.module, '')) = p_module::text
      AND lower(COALESCE(p.action, '')) = p_action::text
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = get_current_user_id()
      AND r.name IN ('SUPER_ADMIN', 'Super Admin')
  );
END;
$$;

-- ============================================================
-- 7) RLS + POLICIES FOR NEW ADMIN DATA SHAPE
-- ============================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid() OR is_super_admin() OR has_permission('admin','view'));

DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (is_super_admin() OR has_permission('admin','create'));

DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  USING (is_super_admin() OR has_permission('admin','edit'));

DROP POLICY IF EXISTS "Roles are readable by authenticated users" ON roles;
CREATE POLICY "Roles are readable by authenticated users"
  ON roles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
CREATE POLICY "Only admins can insert roles"
  ON roles FOR INSERT WITH CHECK (is_super_admin() OR has_permission('admin','create'));

DROP POLICY IF EXISTS "Only admins can edit roles" ON roles;
CREATE POLICY "Only admins can edit roles"
  ON roles FOR UPDATE USING (is_super_admin() OR has_permission('admin','edit'));

DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;
CREATE POLICY "Only admins can delete roles"
  ON roles FOR DELETE USING (is_super_admin() OR has_permission('admin','delete'));

DROP POLICY IF EXISTS "Permissions readable by all" ON permissions;
CREATE POLICY "Permissions readable by all"
  ON permissions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Role permissions readable by all" ON role_permissions;
CREATE POLICY "Role permissions readable by all"
  ON role_permissions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage role permissions" ON role_permissions;
CREATE POLICY "Admins manage role permissions"
  ON role_permissions FOR ALL
  USING (is_super_admin() OR has_permission('admin','edit'));

DROP POLICY IF EXISTS "Users can see own roles" ON user_roles;
CREATE POLICY "Users can see own roles"
  ON user_roles FOR SELECT
  USING (
    user_id = get_current_user_id()
    OR is_super_admin()
    OR has_permission('admin','view')
  );

DROP POLICY IF EXISTS "Admins can assign roles" ON user_roles;
CREATE POLICY "Admins can assign roles"
  ON user_roles FOR INSERT
  WITH CHECK (is_super_admin() OR has_permission('admin','create'));

DROP POLICY IF EXISTS "Admins can remove roles" ON user_roles;
CREATE POLICY "Admins can remove roles"
  ON user_roles FOR DELETE
  USING (is_super_admin() OR has_permission('admin','delete'));

DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs"
  ON audit_logs FOR SELECT
  USING (is_super_admin() OR has_permission('admin','view'));

DROP POLICY IF EXISTS "System inserts audit logs" ON audit_logs;
CREATE POLICY "System inserts audit logs"
  ON audit_logs FOR INSERT WITH CHECK (TRUE);
