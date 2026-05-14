-- Align Supabase JWT identity with application RBAC identity.
-- This migration maps auth.users.id -> app_users.auth_id, and makes helper
-- functions resolve app_users.id for permission and role checks.

-- Add auth_id if missing and ensure uniqueness for non-null values
ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS auth_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_auth_id_unique
    ON app_users(auth_id)
    WHERE auth_id IS NOT NULL;

-- Backfill auth_id using email match where possible
UPDATE app_users au
SET auth_id = su.id
FROM auth.users su
WHERE au.auth_id IS NULL
  AND lower(au.email) = lower(su.email);

-- Resolve current app user ID from JWT/auth.uid.
-- Returns app_users.id when mapping exists; falls back to auth user id.
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
    auth_user_id UUID;
    app_user_id UUID;
BEGIN
    BEGIN
        auth_user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
    EXCEPTION WHEN OTHERS THEN
        auth_user_id := NULL;
    END;

    IF auth_user_id IS NULL THEN
        auth_user_id := auth.uid();
    END IF;

    IF auth_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT u.id INTO app_user_id
    FROM app_users u
    WHERE u.auth_id = auth_user_id
      AND u.is_active = true
      AND u.is_deleted = false
    LIMIT 1;

    IF app_user_id IS NOT NULL THEN
        RETURN app_user_id;
    END IF;

    -- Compatibility fallback where app_users.id already equals auth user id
    RETURN auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate permission helper to use app user id resolved above.
CREATE OR REPLACE FUNCTION has_permission(perm_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    has_perm BOOLEAN;
BEGIN
    current_user_id := get_current_user_id();

    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.id = current_user_id AND r.name = 'SUPER_ADMIN' AND u.is_active = true
    ) INTO has_perm;

    IF has_perm THEN
        RETURN true;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = current_user_id
          AND p.permission_key = perm_key
          AND u.is_active = true
          AND p.is_active = true
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate role helper to use app user id resolved above.
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    has_role BOOLEAN;
BEGIN
    current_user_id := get_current_user_id();

    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM app_users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.id = current_user_id
          AND r.name = role_name
          AND u.is_active = true
          AND r.is_active = true
    ) INTO has_role;

    RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
