-- Settings module: personal user preferences and role defaults

CREATE TABLE IF NOT EXISTS everx_auth.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES everx_auth.users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(50) NOT NULL DEFAULT 'light',
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    in_app_notifications BOOLEAN NOT NULL DEFAULT true,
    auto_refresh BOOLEAN NOT NULL DEFAULT true,
    items_per_page INTEGER NOT NULL DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.role_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES everx_auth.roles(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(50) NOT NULL DEFAULT 'light',
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    in_app_notifications BOOLEAN NOT NULL DEFAULT true,
    auto_refresh BOOLEAN NOT NULL DEFAULT true,
    items_per_page INTEGER NOT NULL DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SETTINGS_VIEW', 'SETTINGS', 'VIEW', 'View personal and admin settings', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SETTINGS_VIEW'
);

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SETTINGS_EDIT', 'SETTINGS', 'EDIT', 'Edit personal settings', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SETTINGS_EDIT'
);

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SETTINGS_ADMIN_VIEW', 'SETTINGS', 'ADMIN_VIEW', 'View role-based settings defaults', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SETTINGS_ADMIN_VIEW'
);

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SETTINGS_ADMIN_EDIT', 'SETTINGS', 'ADMIN_EDIT', 'Edit role-based settings defaults', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SETTINGS_ADMIN_EDIT'
);

INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'SETTINGS_VIEW'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'SETTINGS_EDIT'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'SETTINGS_ADMIN_VIEW'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key = 'SETTINGS_ADMIN_EDIT'
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);