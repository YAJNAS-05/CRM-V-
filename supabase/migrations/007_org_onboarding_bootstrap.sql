-- Organization onboarding bootstrap
-- Creates organization model and auto-bootstraps org owner as SUPER_ADMIN on signup.

-- Helper function: Get current app user ID
CREATE OR REPLACE FUNCTION get_current_app_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id
  FROM app_users
  WHERE auth_id = auth.uid()
    AND is_deleted = FALSE
  LIMIT 1;
$$;

-- Helper function: Check if current user is SUPER_ADMIN
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_app_user_id()
      AND r.name = 'SUPER_ADMIN'
  );
$$;

-- Helper function: Check if current user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions perm ON rp.permission_id = perm.id
    WHERE ur.user_id = get_current_app_user_id()
      AND perm.module = p_module
      AND perm.action = p_action
  );
$$;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_org_id ON app_users(org_id);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);

CREATE OR REPLACE FUNCTION normalize_org_slug(value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  base_slug := lower(regexp_replace(COALESCE(value, ''), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN
    base_slug := 'organization';
  END IF;

  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  END LOOP;

  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT u.org_id
  FROM app_users u
  WHERE u.auth_id = auth.uid()
    AND u.is_deleted = FALSE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION bootstrap_org_owner_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata JSONB;
  org_name TEXT;
  provided_org_id UUID;
  resolved_org_id UUID;
  role_id UUID;
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
  app_user_id UUID;
BEGIN
  metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  org_name := NULLIF(trim(metadata ->> 'org_name'), '');
  full_name := NULLIF(trim(metadata ->> 'full_name'), '');

  BEGIN
    provided_org_id := NULLIF(metadata ->> 'org_id', '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    provided_org_id := NULL;
  END;

  IF full_name IS NULL THEN
    full_name := split_part(COALESCE(NEW.email, ''), '@', 1);
  END IF;

  first_name := split_part(full_name, ' ', 1);
  last_name := NULLIF(trim(substr(full_name, length(first_name) + 1)), '');
  IF last_name IS NULL THEN
    last_name := 'User';
  END IF;

  IF org_name IS NOT NULL THEN
    INSERT INTO organizations (name, slug, owner_auth_id)
    VALUES (org_name, normalize_org_slug(org_name), NEW.id)
    RETURNING id INTO resolved_org_id;
  ELSE
    resolved_org_id := provided_org_id;
  END IF;

  INSERT INTO app_users (
    auth_id,
    first_name,
    last_name,
    email,
    full_name,
    phone,
    role,
    office_location,
    is_active,
    avatar_url,
    created_at,
    updated_at,
    is_deleted,
    org_id
  ) VALUES (
    NEW.id,
    COALESCE(first_name, 'Owner'),
    COALESCE(last_name, 'User'),
    NEW.email,
    COALESCE(full_name, NEW.email),
    NULLIF(trim(metadata ->> 'phone'), ''),
    CASE WHEN org_name IS NOT NULL THEN 'ADMIN' ELSE 'EMPLOYEE' END,
    'MAIN_OFFICE',
    TRUE,
    NULLIF(trim(metadata ->> 'avatar_url'), ''),
    NOW(),
    NOW(),
    FALSE,
    resolved_org_id
  )
  ON CONFLICT (auth_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), app_users.full_name),
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), app_users.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), app_users.last_name),
    phone = COALESCE(EXCLUDED.phone, app_users.phone),
    org_id = COALESCE(app_users.org_id, EXCLUDED.org_id),
    updated_at = NOW()
  RETURNING id INTO app_user_id;

  IF resolved_org_id IS NOT NULL THEN
    INSERT INTO organization_members (org_id, user_id, membership_role)
    VALUES (resolved_org_id, app_user_id, CASE WHEN org_name IS NOT NULL THEN 'OWNER' ELSE 'MEMBER' END)
    ON CONFLICT (org_id, user_id) DO NOTHING;
  END IF;

  IF org_name IS NOT NULL THEN
    SELECT id INTO role_id
    FROM roles
    WHERE name = 'SUPER_ADMIN'
    LIMIT 1;

    IF role_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id, assigned_at)
      VALUES (app_user_id, role_id, NOW())
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    BEGIN
      INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata)
      VALUES (
        app_user_id,
        'org_onboarded',
        'organization',
        resolved_org_id,
        jsonb_build_object('org_name', org_name, 'email', NEW.email, 'auth_user_id', NEW.id)
      );
    EXCEPTION WHEN OTHERS THEN
      -- audit_logs may not exist in all environments; skip safely
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_org_owner_from_auth_user ON auth.users;
CREATE TRIGGER trg_bootstrap_org_owner_from_auth_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION bootstrap_org_owner_from_auth_user();

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read their organization" ON organizations;
CREATE POLICY "Org members can read their organization"
  ON organizations FOR SELECT
  USING (
    id = current_org_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Org owners can update their organization" ON organizations;
CREATE POLICY "Org owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    id = current_org_id()
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  );

DROP POLICY IF EXISTS "Members can read their org membership" ON organization_members;
CREATE POLICY "Members can read their org membership"
  ON organization_members FOR SELECT
  USING (
    org_id = current_org_id()
    OR user_id = get_current_app_user_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Admins can manage org members" ON organization_members;
CREATE POLICY "Admins can manage org members"
  ON organization_members FOR ALL
  USING (
    org_id = current_org_id()
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  )
  WITH CHECK (
    org_id = current_org_id()
    AND (
      is_super_admin()
      OR has_permission('admin', 'edit')
    )
  );
