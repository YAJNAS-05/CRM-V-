-- RBAC foundation: roles, permissions and many-to-many mappings

CREATE TABLE IF NOT EXISTS everx_auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS everx_auth.role_permissions (
    role_id UUID NOT NULL REFERENCES everx_auth.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES everx_auth.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS everx_auth.user_roles (
    user_id UUID NOT NULL REFERENCES everx_auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES everx_auth.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON everx_auth.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_active ON everx_auth.roles(is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON everx_auth.permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON everx_auth.permissions(is_active, is_deleted);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON everx_auth.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON everx_auth.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON everx_auth.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON everx_auth.user_roles(role_id);
