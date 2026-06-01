# EVERX PRD Implementation Execution

Source of truth: ENTERPRISE_AI_READY_PRD.md
Target: execute the PRD in deterministic phases with verifiable outcomes.

## Execution Mode

- No placeholder UI in exposed navigation.
- No dead workflow action.
- One backend source of truth (Spring Boot + PostgreSQL).
- Permission checks in UI and API must match.
- Every phase must have testable acceptance outputs.

## Current Implementation Snapshot

### Completed in this stream

- Admin role management list page refactored to fresh-style workspace UI.
- Role detail page refactored to fresh-style workspace UI.
- Role edit modal now supports grouped multi-select permissions.
- Create role page now exposes all backend permissions as checkboxes, including non-matrix permissions.
- Duplicate/legacy role management page removed from frontend source.
- Admin route-to-API ownership baseline documented.
- CRM route-to-API ownership baseline documented.
- ERP and Finance route-to-API ownership baseline documented.

### Remaining large PRD scope

- Foundation hardening and cross-module consistency checks.
- CRM to ERP to Finance end-to-end orchestration validation.
- Service and fieldwork SLA-complete workflows.
- HR, project, reporting, and insights full acceptance coverage.

## Phase Plan (PRD Aligned)

## Phase 0: Stabilization and Truth Alignment

### 0.1 Baseline audit and scope lock

- [ ] Build a module-by-module route -> API -> backend ownership map. (admin and CRM slices completed)
- [ ] Identify dead routes, dead CTAs, and fake data surfaces.
- [ ] Mark each visible module as Working, Partial, or Hidden.

### 0.2 Backend ownership consolidation

- [ ] Verify no production path depends on external transitional stores.
- [ ] Ensure onboarding/workspace/project ownership is backend-served.
- [ ] Remove duplicate service paths where the same entity has multiple authorities.

### 0.3 Auth and RBAC unification

- [ ] Verify UI gating and API authority checks match for all admin routes.
- [ ] Verify data-scope enforcement for list/detail APIs.
- [ ] Add missing server-side checks where only UI checks exist.

### 0.4 Navigation integrity sweep

- [x] Remove unused legacy RoleManagementPage frontend surface.
- [ ] Remove or hide all remaining dead or non-functional module actions.
- [ ] Ensure every exposed route has loading, empty, and error states.

### 0.5 Data model alignment

- [ ] Validate foreign-key and lifecycle-state integrity for CRM, ERP, finance, HR, projects.
- [ ] Publish migration delta list with owners.

## Phase 1: Core Functional Completeness

- [ ] CRM core completion (accounts, contacts, leads, deals, activities, quotes).
- [ ] Equipment lifecycle completion (acquisitions, assessments, QC, inventory, audits).
- [ ] Order-to-cash completion (SO, shipment, warranty, invoice, payment).
- [ ] Service and field operations completion (tickets, fieldwork, spare parts, subcontractors).
- [ ] Finance core completion (AR/AP/GL/FX/reporting).
- [ ] HR completion (employee, leave, attendance, payroll, onboarding, training).
- [ ] Project/workspace completion (projects, milestones, tasks, employee workspace).
- [ ] Reporting/insights completion (widgets, custom reports, exports, access control).

## Phase 2: Enterprise Hardening

- [ ] Approval workflows and immutable audit strengthening.
- [ ] Document vault consistency across all modules.
- [ ] SLA escalation, retry-safe jobs, and observability hardening.

## Phase 3: Advanced Enterprise Features

- [ ] Predictive maintenance and anomaly detection.
- [ ] SSO and advanced identity governance.
- [ ] Carrier and ecosystem integrations.

## Acceptance Gates

- [ ] 100% exposed navigation routes are functional.
- [ ] 0 dead primary CTAs in production-visible UI.
- [ ] End-to-end workflow execution for quote/order/shipment/warranty/invoice/payment.
- [ ] Role and data-scope violations = 0 at release candidate.
- [ ] Exports and dashboards produce real scoped data.

## Immediate Next Slice

Next implementation slice after this update:

1. Build backend endpoint-to-authority matrix for CRM, ERP, and Finance.
2. Identify dead routes/CTAs and patch or hide them for CRM/ERP/Finance pages.
3. Add baseline smoke tests for admin role CRUD and permission assignment flow.
