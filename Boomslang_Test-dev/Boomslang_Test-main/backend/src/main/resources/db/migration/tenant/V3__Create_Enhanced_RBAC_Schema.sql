-- Create enhanced security schema
CREATE SCHEMA IF NOT EXISTS everx_security;

-- Create enhanced_permissions table
CREATE TABLE everx_security.enhanced_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL,
    tenant_id UUID,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    level VARCHAR(20) NOT NULL DEFAULT 'READ',
    conditions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_enhanced_permissions_key_tenant UNIQUE (permission_key, tenant_id)
);

-- Create enhanced_roles table
CREATE TABLE everx_security.enhanced_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tenant_id UUID,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_enhanced_roles_name_tenant UNIQUE (name, tenant_id)
);

-- Create role_permissions junction table
CREATE TABLE everx_security.role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES everx_security.enhanced_roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES everx_security.enhanced_permissions(id) ON DELETE CASCADE
);

-- Create user_roles junction table
CREATE TABLE everx_security.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES everx_auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES everx_security.enhanced_roles(id) ON DELETE CASCADE
);

-- Create indexes for enhanced_permissions
CREATE INDEX idx_enhanced_permissions_tenant_id ON everx_security.enhanced_permissions(tenant_id);
CREATE INDEX idx_enhanced_permissions_module ON everx_security.enhanced_permissions(module);
CREATE INDEX idx_enhanced_permissions_action ON everx_security.enhanced_permissions(action);
CREATE INDEX idx_enhanced_permissions_resource_type ON everx_security.enhanced_permissions(resource_type);
CREATE INDEX idx_enhanced_permissions_is_active ON everx_security.enhanced_permissions(is_active);
CREATE INDEX idx_enhanced_permissions_is_system ON everx_security.enhanced_permissions(is_system);

-- Create indexes for enhanced_roles
CREATE INDEX idx_enhanced_roles_tenant_id ON everx_security.enhanced_roles(tenant_id);
CREATE INDEX idx_enhanced_roles_is_active ON everx_security.enhanced_roles(is_active);
CREATE INDEX idx_enhanced_roles_is_system ON everx_security.enhanced_roles(is_system);
CREATE INDEX idx_enhanced_roles_priority ON everx_security.enhanced_roles(priority);
CREATE INDEX idx_enhanced_roles_category ON everx_security.enhanced_roles(category);

-- Create indexes for junction tables
CREATE INDEX idx_role_permissions_role_id ON everx_security.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON everx_security.role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON everx_security.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON everx_security.user_roles(role_id);

-- Create trigger for updated_at on enhanced_permissions
CREATE OR REPLACE FUNCTION everx_security.update_enhanced_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enhanced_permissions_updated_at
    BEFORE UPDATE ON everx_security.enhanced_permissions
    FOR EACH ROW
    EXECUTE FUNCTION everx_security.update_enhanced_permissions_updated_at();

-- Create trigger for updated_at on enhanced_roles
CREATE OR REPLACE FUNCTION everx_security.update_enhanced_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enhanced_roles_updated_at
    BEFORE UPDATE ON everx_security.enhanced_roles
    FOR EACH ROW
    EXECUTE FUNCTION everx_security.update_enhanced_roles_updated_at();

-- Insert system permissions
INSERT INTO everx_security.enhanced_permissions (permission_key, module, action, resource_type, description, is_system, level) VALUES
('SUPER_ADMIN_ALL', 'ADMIN', 'ADMIN', null, 'Full system access', true, 'ADMIN'),
('SYSTEM_TENANT_MANAGEMENT', 'ADMIN', 'WRITE', 'tenants', 'Manage all tenants', true, 'WRITE'),
('SYSTEM_USER_MANAGEMENT', 'ADMIN', 'WRITE', 'system_users', 'Manage all system users', true, 'WRITE'),
('SYSTEM_CONFIGURATION', 'ADMIN', 'WRITE', 'system', 'System configuration', true, 'WRITE'),
('SYSTEM_MONITORING', 'ADMIN', 'READ', 'monitoring', 'System monitoring', true, 'READ'),
('SYSTEM_AUDIT', 'ADMIN', 'READ', 'audit', 'System audit logs', true, 'READ');

-- Insert system roles
INSERT INTO everx_security.enhanced_roles (name, display_name, description, is_system, priority, category) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system access with all privileges', true, 1000, 'SYSTEM'),
('SYSTEM_ADMIN', 'System Administrator', 'System administration access', true, 900, 'SYSTEM'),
('TENANT_ADMIN', 'Tenant Administrator', 'Full tenant administration access', true, 800, 'BUSINESS'),
('MANAGER', 'Manager', 'Management access with limitations', true, 700, 'BUSINESS'),
('EMPLOYEE', 'Employee', 'Basic employee access', true, 600, 'BUSINESS'),
('VIEWER', 'Viewer', 'Read-only access', true, 500, 'BUSINESS');

-- Assign all system permissions to SUPER_ADMIN role
INSERT INTO everx_security.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM everx_security.enhanced_roles r, everx_security.enhanced_permissions p 
WHERE r.name = 'SUPER_ADMIN' AND p.is_system = true;
