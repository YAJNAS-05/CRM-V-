-- Tenant isolation hardening for org onboarding + RBAC
-- Keeps system roles global while scoping custom roles and user management by org.

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);

-- audit_logs: add actor_id column if missing
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL;

-- app_users policies: remove legacy broad access and enforce same-org admin management.
DROP POLICY IF EXISTS "Users can view own profile" ON app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON app_users;
DROP POLICY IF EXISTS "Admins can create users" ON app_users;
DROP POLICY IF EXISTS "Admins can delete users" ON app_users;

CREATE POLICY "Users can view own or org users" ON app_users
  FOR SELECT
  USING (
    auth_id = auth.uid()
    OR (
      org_id = current_org_id()
      AND (
        is_super_admin()
        OR has_permission('admin', 'view')
      )
    )
  );

CREATE POLICY "Users can update own or org users" ON app_users
  FOR UPDATE
  USING (
    auth_id = auth.uid()
    OR (
      org_id = current_org_id()
      AND (
        is_super_admin()
        OR has_permission('admin', 'edit')
      )
    )
  )
  WITH CHECK (
    org_id = current_org_id()
    OR auth_id = auth.uid()
  );

CREATE POLICY "Admins can create org users" ON app_users
  FOR INSERT
  WITH CHECK (
    org_id = current_org_id()
    AND (
      is_super_admin()
      OR has_permission('admin', 'create')
    )
  );

CREATE POLICY "Admins can delete org users" ON app_users
  FOR DELETE
  USING (
    org_id = current_org_id()
    AND (
      is_super_admin()
      OR has_permission('admin', 'delete')
    )
  );

-- roles policies: keep global system roles readable, scope custom roles by org.
DROP POLICY IF EXISTS "Authenticated can view roles" ON roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Roles are readable by authenticated users" ON roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only admins can edit roles" ON roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;

CREATE POLICY "Users can read system or org roles" ON roles
  FOR SELECT
  USING (
    (org_id IS NULL AND is_system_role = TRUE)
    OR org_id = current_org_id()
    OR is_super_admin()
  );

CREATE POLICY "Admins can create org roles" ON roles
  FOR INSERT
  WITH CHECK (
    org_id = current_org_id()
    AND is_system_role = FALSE
    AND (
      is_super_admin()
      OR has_permission('admin', 'create')
    )
  );

CREATE POLICY "Admins can update org roles" ON roles
  FOR UPDATE
  USING (
    org_id = current_org_id()
    AND is_system_role = FALSE
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  )
  WITH CHECK (
    org_id = current_org_id()
    AND is_system_role = FALSE
  );

CREATE POLICY "Admins can delete org roles" ON roles
  FOR DELETE
  USING (
    org_id = current_org_id()
    AND is_system_role = FALSE
    AND (
      is_super_admin()
      OR has_permission('admin', 'delete')
    )
  );

-- role_permissions policies: restrict by role visibility/manageability.
DROP POLICY IF EXISTS "Admins can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Role permissions readable by all" ON role_permissions;
DROP POLICY IF EXISTS "Admins manage role permissions" ON role_permissions;

CREATE POLICY "Users can read role permissions in org" ON role_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM roles r
      WHERE r.id = role_permissions.role_id
        AND (
          (r.org_id IS NULL AND r.is_system_role = TRUE)
          OR r.org_id = current_org_id()
          OR is_super_admin()
        )
    )
  );

CREATE POLICY "Admins can manage org role permissions" ON role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM roles r
      WHERE r.id = role_permissions.role_id
        AND r.org_id = current_org_id()
        AND r.is_system_role = FALSE
    )
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM roles r
      WHERE r.id = role_permissions.role_id
        AND r.org_id = current_org_id()
        AND r.is_system_role = FALSE
    )
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  );

-- user_roles policies: remove broad legacy and enforce org alignment.
DROP POLICY IF EXISTS "Admins can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can see own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can assign roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON user_roles;

CREATE POLICY "Users can see own or org user roles" ON user_roles
  FOR SELECT
  USING (
    user_id = get_current_app_user_id()
    OR (
      EXISTS (
        SELECT 1
        FROM app_users u
        WHERE u.id = user_roles.user_id
          AND u.org_id = current_org_id()
      )
      AND (
        is_super_admin()
        OR has_permission('admin', 'view')
      )
    )
  );

CREATE POLICY "Admins can assign org user roles" ON user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM app_users u
      WHERE u.id = user_roles.user_id
        AND u.org_id = current_org_id()
    )
    AND EXISTS (
      SELECT 1
      FROM roles r
      WHERE r.id = user_roles.role_id
        AND (r.org_id = current_org_id() OR (r.org_id IS NULL AND r.is_system_role = TRUE))
    )
    AND (
      is_super_admin()
      OR has_permission('admin', 'create')
    )
  );

CREATE POLICY "Admins can remove org user roles" ON user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM app_users u
      WHERE u.id = user_roles.user_id
        AND u.org_id = current_org_id()
    )
    AND (
      is_super_admin()
      OR has_permission('admin', 'delete')
    )
  );

-- audit logs: avoid cross-org visibility.
DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;

CREATE POLICY "Admins read org audit logs" ON audit_logs
  FOR SELECT
  USING (
    is_super_admin()
    OR (
      has_permission('admin', 'view')
      AND (
        actor_id = get_current_app_user_id()
        OR EXISTS (
          SELECT 1
          FROM app_users actor_user
          WHERE actor_user.id = audit_logs.actor_id
            AND actor_user.org_id = current_org_id()
        )
      )
    )
  );
