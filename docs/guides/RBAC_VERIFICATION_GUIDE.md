# RBAC Verification Guide

This guide validates the new Supabase RBAC implementation end-to-end.

## 1) Prerequisites

- Apply migration `supabase/migrations/006_erp_rbac_roles_permissions.sql`.
- Apply migration `supabase/migrations/007_org_onboarding_bootstrap.sql`.
- Apply migration `supabase/migrations/008_org_rbac_tenant_isolation.sql`.
- Deploy edge function `supabase/functions/invite-user/index.ts`.
- Set function env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Start frontend:
  - `cd frontend`
  - `npm run dev`

## 2) Backend Startup Verification

Use diagnostics script with non-conflicting port:

```powershell
cd backend
./scripts/diagnose-startup.ps1 -Profile h2 -ServerPort 8085
```

Expected:
- No `UnknownEntityException` for PM entities.
- No `UnsatisfiedDependencyException` for `TaskRepository`.
- If startup still fails, summary should indicate exact cause (commonly port conflict).

## 3) RBAC Data Integrity Checks (Supabase SQL)

Run in Supabase SQL editor.

### 3.0 Organization bootstrap checks

```sql
select id, name, slug, owner_auth_id, is_active
from organizations
order by created_at desc
limit 10;

select u.id, u.auth_id, u.email, u.full_name, u.org_id, r.name as role_name
from app_users u
left join user_roles ur on ur.user_id = u.id
left join roles r on r.id = ur.role_id
where u.org_id is not null
order by u.created_at desc;

select id, name, org_id, is_system_role
from roles
order by created_at desc
limit 20;
```

### 3.1 Roles seeded

```sql
select name, is_system_role
from roles
where name in ('SUPER_ADMIN', 'ADMIN', 'PM Manager', 'PM Viewer')
order by name;
```

### 3.2 Permissions seeded

```sql
select module, action, permission_key
from permissions
where module in ('admin','pm','finance','hr','fieldwork','crm')
order by module, action;
```

### 3.3 Admin role permissions

```sql
select r.name, p.module, p.action
from role_permissions rp
join roles r on r.id = rp.role_id
join permissions p on p.id = rp.permission_id
where r.name in ('ADMIN','SUPER_ADMIN')
order by r.name, p.module, p.action;
```

## 4) Frontend Access Flow Verification

Login with a user that has admin access.

### 4.1 Route access

- Open `/admin/users` -> should load user management.
- Open `/admin/roles` -> should load role management.
- Open `/admin/roles/{id}` -> should load role detail.
- Open legacy routes:
  - `/admin/rbac/users` redirects to `/admin/users`.
  - `/admin/rbac/roles` redirects to `/admin/roles`.

### 4.2 Unauthorized behavior

Use a non-admin user.

- Open `/admin/users`.
- Expected: redirect to `/unauthorized`.

## 5) Invite User Flow Verification

From `/admin/users`:

1. Click `Invite User`.
2. Enter email and select one or more roles.
3. Submit invite.

Expected:
- New auth invite is created.
- `app_users` upserted with `auth_id`.
- `app_users.org_id` must match inviter organization.
- `user_roles` inserted using `app_users.id`.
- Audit entry exists in `audit_logs`.

Validation SQL:

```sql
select id, auth_id, email, full_name
from app_users
where email = '<invited-email>';

select ur.user_id, ur.role_id
from user_roles ur
join app_users u on u.id = ur.user_id
where u.email = '<invited-email>';

select inviter.email as inviter_email, invited.email as invited_email, inviter.org_id as inviter_org, invited.org_id as invited_org
from app_users inviter
join audit_logs al on al.actor_id = inviter.id and al.action = 'invite_user'
join app_users invited on invited.id = al.target_id
where invited.email = '<invited-email>'
order by al.created_at desc
limit 1;
```

## 6) Compatibility Verification (Legacy + New RBAC)

- Legacy permission users (`USER_VIEW`/`ROLE_VIEW`) should still access admin pages.
- New module-based RBAC users (`admin:view`) should access the same pages.
- Sidebar `SETTINGS` should show `Users` and `Roles & Permissions` for either model.

## 7) Known Non-Blocking Notes

- Vite warns about large chunks during production build; this is not a functional RBAC failure.
- If backend fails with `Port 8080 was already in use`, rerun diagnostics with `-ServerPort 8085` or stop the process using 8080.
