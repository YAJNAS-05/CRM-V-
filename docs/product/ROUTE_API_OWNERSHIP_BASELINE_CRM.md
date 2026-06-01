# Route to API Ownership Baseline (CRM Slice)

Scope: Phase 0.1 PRD baseline for CRM module family.

## Frontend Route Ownership

- Route: /crm/dashboard
  - UI component: DashboardRouteResolver -> DashboardPage
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute requiredPermissions DASHBOARD_SELF_VIEW, DASHBOARD_TEAM_VIEW

- Route: /crm/dashboard/user
  - UI component: redirect to /dashboard/crm/user
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute requiredPermissions DASHBOARD_SELF_VIEW

- Route: /crm/dashboard/team
  - UI component: redirect to /dashboard/crm/team
  - Route source: frontend/src/App.tsx
  - Access guard: ProtectedRoute requiredPermissions DASHBOARD_TEAM_VIEW

- Route: /crm/accounts, /crm/accounts/new, /crm/accounts/:id
  - UI components: AccountListPage, AccountDetailPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

- Route: /crm/contacts, /crm/contacts/new, /crm/contacts/:id
  - UI components: ContactListPage, ContactDetailPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

- Route: /crm/leads, /crm/leads/new, /crm/leads/:id
  - UI components: LeadListPage, LeadDetailPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

- Route: /crm/deals, /crm/deals/kanban, /crm/deals/new, /crm/deals/:id
  - UI components: DealListPage, DealKanbanPage, DealDetailPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

- Route: /crm/quotes, /crm/quotes/new, /crm/quotes/:id
  - UI components: QuoteListPage, QuoteDetailPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

- Route: /crm/reports
  - UI component: ReportListPage
  - Access guard: ProtectedRoute requiredPermissions REPORT_VIEW

- Route: /crm/activities
  - UI component: ActivityListPage
  - Access guard: ProtectedRoute requiredPermissions CRM_VIEW, CRM_CREATE, CRM_EDIT

## Frontend API Ownership

Primary CRM API client: frontend/src/api/crmApi.ts

- Accounts (accountApi)
  - /v1/crm/accounts
  - /v1/crm/accounts/search
  - /v1/crm/accounts/{id}

- Contacts (contactApi)
  - /v1/crm/contacts
  - /v1/crm/contacts/search
  - /v1/crm/contacts/{id}
  - /v1/crm/contacts/account/{accountId}

- Leads (leadApi)
  - /v1/crm/leads
  - /v1/crm/leads/search
  - /v1/crm/leads/{id}
  - /v1/crm/leads/status/{status}
  - /v1/crm/leads/{id}/convert
  - /v1/crm/leads/{id}/scores

- Deals (dealApi)
  - /v1/crm/deals
  - /v1/crm/deals/search
  - /v1/crm/deals/{id}
  - /v1/crm/deals/account/{accountId}
  - /v1/crm/deals/stage/{stage}
  - /v1/crm/deals/{id}/stage
  - /v1/crm/deals/{id}/weighted-revenue

- Quotes (quoteApi)
  - /v1/crm/quotes
  - /v1/crm/quotes/{id}
  - /v1/crm/quotes/deal/{dealId}
  - /v1/crm/quotes/{id}/convert-to-order

- Activities (activityApi)
  - /v1/crm/activities
  - /v1/crm/activities/{id}
  - /v1/crm/activities/deal/{dealId}
  - /v1/crm/activities/lead/{leadId}
  - /v1/crm/activities/contact/{contactId}
  - /v1/crm/activities/overdue
  - /v1/crm/activities/{id}/complete

- CRM Reporting (reportApi in crmApi.ts)
  - /v1/crm/reports/dashboard
  - /v1/crm/reports/dashboard/user
  - /v1/crm/reports/dashboard/team
  - /v1/crm/reports/pipeline
  - /v1/crm/reports/pipeline/user
  - /v1/crm/reports/pipeline/team
  - /v1/crm/reports/conversion
  - /v1/crm/reports/conversion/user
  - /v1/crm/reports/conversion/team
  - /v1/crm/reports/activities
  - /v1/crm/reports/activities/user
  - /v1/crm/reports/activities/team
  - /v1/crm/reports

## Findings

- CRM route surfaces are broad and mostly backed by API modules.
- Next validation required: each route's primary CTA set must be tested for real persistence and non-placeholder behavior.
- Permission checks appear route-level consistent with CRM_VIEW/CREATE/EDIT, but endpoint-level parity still needs backend verification.

## Next Slice

1. Build ERP and Finance route-to-API baseline documents.
2. Perform dead CTA sweep for CRM list/detail pages and record defects.
3. Add backend endpoint-to-authority matrix for CRM controllers.
