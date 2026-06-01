# Route to API Ownership Baseline (Admin Slice)

Scope: Phase 0.1 PRD baseline for Admin and RBAC module family.

## Frontend Route Ownership

- Route: /admin/users
  - UI component: frontend/src/pages/admin/users
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute + AdminAccessGate

- Route: /admin/roles
  - UI component: frontend/src/pages/admin/roles
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute + AdminAccessGate

- Route: /admin/roles/create
  - UI component: frontend/src/pages/admin/roles/create
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute + AdminAccessGate

- Route: /admin/roles/:id
  - UI component: frontend/src/pages/admin/roles/[id]
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute + AdminAccessGate

- Route: /admin/audit
  - UI component: frontend/src/pages/admin/AuditLogPage
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute requiredRoles SUPER_ADMIN, ADMIN

## Frontend API Ownership

Primary admin API client: frontend/src/api/adminApi.ts

- Users
  - GET /v1/admin/users
  - GET /v1/admin/users/{id}
  - GET /v1/admin/users/role/{role}
  - POST /v1/admin/users
  - PUT /v1/admin/users/{id}
  - PATCH /v1/admin/users/{id}/toggle-status
  - DELETE /v1/admin/users/{id}

- Roles and permissions
  - GET /v1/admin/roles
  - GET /v1/admin/roles/permissions
  - GET /v1/admin/roles/locations
  - POST /v1/admin/roles
  - PUT /v1/admin/roles/{id}
  - PUT /v1/admin/roles/{id}/permissions
  - DELETE /v1/admin/roles/{id}

- Audit and analytics
  - GET /v1/admin/audit/logs
  - GET /v1/admin/dashboard/analytics

## Findings

- Legacy duplicate role page removed from source to prevent implementation drift.
- Active role surfaces now converge on one route family and one API client.
- Role create and role edit flows expose all backend permissions as selectable checkboxes.

## Next Slice

1. Extend this baseline to CRM module routes and APIs.
2. Extend to ERP and Finance route/API ownership.
3. Add backend endpoint map and authority annotation matrix per module.
