-- Add auth_id mapping to link local users with Supabase auth subjects
ALTER TABLE everx_auth.users
    ADD COLUMN IF NOT EXISTS auth_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_id
    ON everx_auth.users(auth_id)
    WHERE auth_id IS NOT NULL;
