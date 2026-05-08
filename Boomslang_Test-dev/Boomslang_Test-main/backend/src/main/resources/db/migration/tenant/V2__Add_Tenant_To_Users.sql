-- Add tenant_id column to users table
ALTER TABLE everx_auth.users 
ADD COLUMN tenant_id UUID;

-- Create index for tenant_id
CREATE INDEX idx_users_tenant_id ON everx_auth.users(tenant_id);

-- Add foreign key constraint to tenants table
ALTER TABLE everx_auth.users 
ADD CONSTRAINT fk_users_tenant 
FOREIGN KEY (tenant_id) 
REFERENCES everx_tenant.tenants(id) 
ON DELETE SET NULL;

-- Create unique constraint for email within tenant
ALTER TABLE everx_auth.users 
ADD CONSTRAINT uk_users_email_tenant 
UNIQUE (email, tenant_id);

-- Update existing users to have null tenant_id (they will need to be assigned during migration)
UPDATE everx_auth.users 
SET tenant_id = NULL 
WHERE tenant_id IS NULL;
