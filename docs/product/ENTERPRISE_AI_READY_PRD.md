# EVERX Platform
## Enterprise AI-Ready Product Requirements Document

Version: 2.0
Last Updated: 2026-05-26
Status: Master implementation specification
Audience: Product, engineering, QA, architecture, and AI implementation agents

---

## 1. Purpose of This Document

This document is the implementation-grade PRD for the full EVERX platform. It is designed to be handed to an AI agent or engineering team to build, harden, and complete the platform without guesswork, dead UI, or placeholder behavior.

This PRD does four things:

1. Defines the full module scope already visible in the repository.
2. Raises each module to enterprise-grade target behavior.
3. States the non-negotiable acceptance criteria that prevent fake completion.
4. Provides delivery sequencing so the system can be implemented in a stable, working order.

If an implementation surface exists in navigation, routes, APIs, or backend packages, it is considered in scope unless this document explicitly marks it deferred.

---

## 2. Repo-Grounded Scope Baseline

This PRD is grounded in the current workspace, including the following implementation surfaces:

- Frontend module routes under `frontend/src/pages` for accounts, contacts, leads, deals, quotes, activities, equipment, equipment assessments, equipment QC, inventory, purchase orders, sales orders, shipments, spare parts, suppliers, subcontractors, warranties, service tickets, fieldwork, finance, invoices, payments, HR, employee workspace, onboarding, reports, insights, dashboard, admin, notifications, profile, and workspace.
- Frontend API modules under `frontend/src/api`, including admin, auth, CRM, ERP, finance, dashboards, fieldwork, reporting, insights, project, notifications, warranty, asset audit, and ERP mappings.
- Backend domains under `backend/src/main/java/com/everx`: auth, admin, crm, erp, finance, hr, insights, project, reporting, shared, and config.
- Existing SQL migrations and schema work for tenancy, auth alignment, project management, RBAC, and dashboard permissions.
- Existing product and technical documents, especially the technical reference, ERP enhancements guide, field work implementation guide, and custom reporting guide.

Important architectural note:

- The current repo contains mixed implementation paths, but the target platform must converge on Spring Boot plus PostgreSQL as the authoritative backend stack.
- Project management, workspace, identity, and invitation flows must be owned by the same backend security and data model as the rest of the platform.
- Existing legacy external-service code or schema artifacts should be treated as transitional and either migrated into the primary backend architecture or removed.

---

## 3. Product Vision

EVERX is an enterprise operating platform for global medical imaging equipment trading and service operations. It must unify CRM, ERP, finance, HR, field operations, reporting, and project execution into one system of record with no duplicate workflow ownership and no untraceable manual handoffs.

The target business outcome is a platform that fully supports:

- Lead-to-quote-to-order-to-cash
- Source-to-assess-to-refurbish-to-stock
- Order-to-ship-to-install-to-warranty
- Service-to-parts-to-billing-to-SLA compliance
- Hire-to-onboard-to-productive employee operations
- Project-to-task-to-timesheet-to-delivery tracking
- Multi-office, multi-role, and multi-entity operational control

---

## 4. Enterprise Product Objectives

### 4.1 Business Objectives

- Reduce quote turnaround to same-day for standard opportunities.
- Eliminate equipment double-selling and stock ambiguity.
- Provide real-time visibility into pipeline, inventory, cash flow, service capacity, and onboarding status.
- Enforce auditability for all financially or operationally material events.
- Support multi-office operations with role-aware and entity-aware access control.

### 4.2 Product Quality Objectives

- No navigation item may route to a partial or non-functional page in production mode.
- No button, export, workflow action, or dashboard widget may exist without a working backend path or explicitly enforced permission/precondition.
- All critical workflows must be executable end to end without spreadsheet, email, or manual database intervention.
- All high-value workflows must produce consistent audit events.
- All visible data must come from a real data source, not a placeholder or permanent mock fallback.

---

## 5. Core User Roles

The platform must support at minimum the following role families:

- Super Admin
- Admin
- Sales Manager
- Sales Representative
- Finance Manager
- Finance Analyst
- Warehouse / Inventory Manager
- Service Technician
- Operations Manager
- HR Manager
- Employee / Individual Contributor
- Read Only / Viewer

Role assignment must be granular, permission-driven, and data-scope-aware. A role is not just UI visibility; it also controls API access, record scope, approvals, exports, and workflow transitions.

---

## 6. Canonical Domain Map

The full target platform consists of the following domain groups.

| Domain Group | Modules |
|---|---|
| Foundation | Authentication, organization setup, workspace, profile, notifications, admin, RBAC, data scope |
| CRM | Accounts, contacts, leads, deals, activities, quotes |
| ERP Asset Lifecycle | Acquisitions, equipment, equipment assessments, site assessments, equipment QC, inventory, asset audits |
| ERP Commercial Operations | Suppliers, subcontractors, purchase orders, spare parts, sales orders, shipments |
| After-Sales Operations | Warranties, service tickets, fieldwork |
| Finance | Invoices, payments, AR, AP, GL, FX, tax, financial reporting |
| HR and People Ops | Employees, departments, positions, leave, attendance, timesheets, payroll, reimbursements, onboarding, training, performance |
| Project and Employee Execution | Projects, epics, sprints, milestones, tasks, employee workspace, my tasks |
| Reporting and Intelligence | Dashboards, template reports, custom reports, insights, scheduled exports |

---

## 7. Cross-Module Enterprise Workflows

The platform is not complete unless these workflows are fully operational.

### 7.1 CRM to ERP Revenue Workflow

Lead -> qualified deal -> quote -> approval if needed -> accepted quote -> sales order -> reservation of equipment -> shipment -> installation/sign-off -> warranty creation -> invoice generation -> payment application -> revenue reporting

### 7.2 Procurement to Inventory Workflow

Acquisition opportunity -> supplier negotiation -> purchase order -> goods receipt -> equipment assessment -> QC/certification -> refurbishment or repair if needed -> stock intake -> ready-for-sale inventory visibility

### 7.3 Installation and Service Workflow

Site assessment -> shipment planning -> field job scheduling -> engineer assignment -> onsite execution -> sign-off -> warranty activation -> PPM schedule generation -> service ticket intake -> parts and labor tracking -> service billing or warranty claim closure

### 7.4 People and Work Management Workflow

New hire record -> onboarding plan -> task assignment -> role and workspace assignment -> attendance and time capture -> payroll and reimbursements -> performance tracking -> project and task execution

### 7.5 Reporting and Governance Workflow

Business events -> auditable persistence -> dashboard metrics -> custom report execution -> export or scheduled delivery -> management review -> action and follow-up

---

## 8. Domain Requirements

## 8.1 Foundation Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Authentication and Identity | Login, logout, refresh, current-user resolution, password change, role-aware session bootstrapping, invite-user flow, internal identity alignment, session invalidation | MFA, SSO via OIDC/SAML, session/device management, SCIM-ready user provisioning, breach detection alerts | No auth path may depend on localStorage-only fallbacks in normal mode. User identity and permissions must resolve consistently across frontend and backend modules. |
| Organization Setup and Workspace | Initial organization setup, office/entity setup, default role configuration, workspace landing page, current workspace context | Multi-entity hierarchy, legal entity defaults, warehouse defaults, default policy templates | Organization setup must unlock real downstream behavior such as invites, role management, and scoped data access. No setup wizard step may be decorative. |
| Admin and RBAC | User CRUD, role CRUD, permission assignment, office/location assignment, active/inactive management, data-scope enforcement | Segregation of duties, approval matrix builder, break-glass admin, delegated administration | Sidebar visibility, page rendering, and API access must all use the same permission model. Hidden UI alone is not sufficient. |
| Notifications | In-app notifications, unread counts, contextual deep links, workflow reminders, system alerts | Escalation rules, digest emails, SLA breach notifications, role-targeted broadcasts | Each notification must originate from a real event source and deep link to a valid record or workflow. |
| Profile and Personal Settings | Profile editing, avatar, password change, notification preferences, locale/currency/timezone preferences | Saved views, delegated approvals, availability calendars | Every editable setting must persist and be reflected in runtime behavior where relevant. |

## 8.2 CRM Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Accounts | Company master, addresses, hierarchy, owner assignment, related records, search and filters | Parent-child org structures, account health score, duplicate detection, compliance flags, credit hold | Accounts must function as a real shared master for deals, contacts, orders, warranties, service, and finance. |
| Contacts | Contact CRUD, account linking, role/title details, communication preferences, related activity history | Relationship graphs, buying committee modeling, duplicate merge, consent tracking | Contacts must be selectable in downstream workflows such as deals, quotes, shipments, and service communication. |
| Leads | Lead intake, status management, conversion, lead source, ownership, search | Scoring, routing rules, SLA timers, enrichment, campaign attribution | Converted leads must create or link real account/contact/deal records without orphaned references. |
| Deals | Pipeline stages, amount, expected close date, probability, owner, account/contact linkage, notes, next steps | Multi-pipeline support, approval gates, risk scoring, forecast categories, competitor tracking | Deal stage changes must be auditable and must integrate with quote and sales order creation. |
| Activities | Tasks, calls, emails, meetings, due dates, assignees, completion tracking, record timeline | Playbooks, reminders, recurring tasks, SLA timers, calendar sync | Activities must attach to actual CRM or ERP records and be visible in timeline/history views. |
| Quotes | Quote header and line items, versioning, totals, PDF generation, expiry handling, quote-to-order conversion | Discount approval thresholds, template catalog, e-sign integration, margin controls, bundle pricing | PDF generation, totals, taxes, and conversion to sales order must be real and reproducible. No fake preview/export actions. |

## 8.3 ERP Asset Lifecycle Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Acquisitions | Source candidate equipment, supplier details, commercial evaluation, landed cost estimate, negotiation notes, acquisition status | Refurbishment forecast, target resale margin, source analytics, broker network performance | Acquisitions must hand off cleanly into purchase order or equipment intake workflows. |
| Equipment Master | Serial-numbered asset records, model/specs, ownership, warehouse/location, lifecycle status, attachments, photos | Medical imaging specification packs, valuation history, refurbishment cost rollups, compliance exposure scoring | Equipment lifecycle states must be enforced server-side. Assets cannot be sold or reserved in invalid states. |
| Equipment Assessments | Technical inspection, defects, grading, repair recommendations, pass/fail, cost estimate | Scoring templates per modality, engineering approval, vendor dispute support | Assessment outcomes must update equipment readiness and procurement decisions. |
| Site Assessments | Site readiness forms, infrastructure checks, risk notes, customer approvals, scheduling linkage | Readiness scoring, dependency blocking, install risk heat map | Site assessment must influence installation scheduling and prevent invalid install progression where critical prerequisites are missing. |
| Equipment QC and Certification | QC checklist, test result capture, calibration/certification tracking, attachment vault | Standards packs by country, recertification alerts, batch QC metrics | QC completion must be required before certain sale or shipment transitions. |
| Inventory and Asset Audits | Stock ledger, warehouse bins, transfers, cycle counts, physical verification, asset audit jobs | Barcode or QR workflows, serialized chain-of-custody, shrinkage analytics, lot or bundle handling | Inventory balances must be traceable through ledger events. Transfers and counts must leave auditable deltas. |

## 8.4 ERP Commercial Operations Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Suppliers | Supplier master, contacts, terms, performance notes, compliance docs | Scorecards, approved vendor lists, spend analytics, risk rating | Suppliers must be reusable across acquisitions, purchase orders, and AP workflows. |
| Subcontractors | External engineer/service partner records, coverage area, skills, rates, compliance documents | Capacity planning, SLA scorecards, subcontractor portal readiness | Subcontractors must be assignable to field/service work and billable where applicable. |
| Purchase Orders | PO creation, approval, line items, status changes, supplier linkage, receipt tracking | Approval thresholds, blanket PO support, landed cost allocation, variance analytics | PO receipt status must connect to inventory updates and three-way match controls. |
| Spare Parts | Spare parts master, stock levels, reorder points, warehouse location, cost | Usage forecasting, kit management, field van stock, auto-replenishment | Parts issued to service or fieldwork must decrement stock and remain traceable to the job. |
| Sales Orders | Create from deal or quote, pricing snapshot, line items, status progression, reservation, fulfillment tracking | Order orchestration, credit check, approval routing, margin guardrails, split delivery support | Sales order confirmation must trigger real workflow orchestration, including equipment reservation and downstream invoicing rules. |
| Shipments and Logistics | Shipment records, carrier details, status, shipment contents, delivery milestones | Carrier API integration, customs documents, freight cost accrual, exception management | Shipment status must reflect actual order and equipment states. Delivery completion cannot be a disconnected toggle. |

## 8.5 After-Sales Operations Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Warranties | Warranty creation, warranty terms, start/end dates, linked equipment and SO, status, document attachments | Warranty accrual accounting, renewal quotes, entitlement engine, ROI analysis | Warranty records must be created automatically where workflow rules require it and must drive service eligibility. |
| Service Tickets | Ticket intake, severity, SLA, customer linkage, asset linkage, assignment, parts and labor capture, closure reason | SLA escalation engine, service contract coverage, root-cause analytics, customer portal readiness | Ticket state, ownership, SLA timers, and billing impact must be consistent and auditable. |
| Fieldwork | Job creation, engineer assignment, schedule, execution state machine, report generation, sign-off, downstream triggers | Route optimization, offline-ready mobile patterns, geotag evidence, subcontractor coordination, capacity planning | Sign-off must lock the operational record and trigger downstream updates such as warranty, equipment status, and invoice logic where applicable. |

## 8.6 Finance Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Invoices | Invoice creation, status, due dates, linked SO or service ticket, PDF export, credit notes | Recurring billing, revenue schedules, tax engine hooks, collections automation | Invoice totals, currency, and statuses must reconcile with linked operational records and payment application. |
| Payments | Payment capture, allocation to invoices, overpayment handling, underpayment handling, refunds, payment notes | Bank feed matching, gateway integration, remittance advice parsing, dispute handling | Payments must update outstanding balances and audit trail in real time. |
| AR and AP Control | Aging, collections queues, vendor bill intake, payable approval, vendor statement reconciliation | DSO management, cash forecasting, three-way match automation, payment run batching | Aging and payable status must derive from real invoices/bills, not static counters. |
| GL, FX, and Consolidation | Chart of accounts, journal posting, functional currency, transaction currency, exchange rates, period close | Multi-entity consolidation, intercompany, revaluation, realized/unrealized gains and losses | Financial postings must be reproducible and traceable to source operational transactions. |
| Finance Reporting | Cash flow, margin, receivables, payables, revenue by entity, warranty exposure | Board packs, forecast vs actual, exception alerts, covenant monitoring | Dashboard metrics must be query-backed and drillable to record-level detail. |

## 8.7 HR and People Operations Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Employee Core | Employee profile, department, position, reporting line, office, employment status | Skills matrix, document expiry, org chart, workforce planning | Employee identity must connect to permissions, task ownership, timesheets, and dashboards. |
| Leave and Attendance | Leave requests, approvals, balances, attendance logging, manager visibility | Shift patterns, holiday calendars, exception alerts, policy automation | Approval actions must persist and affect employee availability and dashboard metrics. |
| Timesheets and Reimbursements | Time capture, approval, reimbursement submission, reimbursement status | Project cost allocation, overtime rules, expense policy checks, export to payroll | Timesheet and reimbursement states must drive finance and project reporting. |
| Payroll | Payroll runs, payroll profiles, approval, run history, exception handling | Multi-country templates, statutory deductions, payroll lock periods, payslip generation | A payroll run cannot present as complete unless employee inputs, approvals, and outputs are all persisted. |
| Onboarding | Onboarding journeys, task templates, owner assignment, due dates, progress tracking | 30/60/90 day plans, buddy assignments, provisioning checklist, probation milestones | Onboarding tasks must be assignable, trackable, and completion-aware. No static checklist pages. |
| Training and Performance | Training records, goals, reviews, appraisal inputs | Competency frameworks, certification requirements, learning paths | Metrics and milestones must read from persisted employee data. |

## 8.8 Project and Employee Execution Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Projects | Project list, detail, ownership, members, status, timeline, description | Portfolio views, dependency tracking, budget vs effort, delivery risk score | Projects must be backed by persisted project records and not UI-only drafts. |
| Epics, Sprints, Milestones, Tasks | Create, assign, move, prioritize, comment, due dates, board view, list view, milestone linkage | Burndown, WIP limits, planning cadence, blockers, workload balancing | Drag-and-drop or status change actions must persist and update all relevant views. |
| Employee Workspace | My tasks, my timesheets, attendance, dashboard, personal workload view | Focus mode, approvals inbox, personal KPIs, productivity coaching | Workspace widgets must come from real task, time, HR, and project data. |

## 8.9 Reporting and Intelligence Domain

| Module | Required Working Scope | Advanced Enterprise Capabilities | Non-Negotiable Acceptance Criteria |
|---|---|---|---|
| Role-Based Dashboards | Executive, finance, HR, operations, employee, fieldwork, and self/team views | Composable widgets, cross-domain drilldowns, anomaly alerts, forecast cards | Every widget must be powered by a real query or service method and must degrade gracefully on empty data. |
| Custom Reports | Report builder, saved definitions, widgets, parameterized execution, exports, access control | Scheduling, caching, execution logs, sharing, report templates by role | No report widget or export action may be exposed without a working backend execution path. |
| Template Documents | Jasper or equivalent document generation for quote, invoice, PO, delivery note, warranty documents | Branded packs, document version control, signing support | Document generation must use live data and produce stored or downloadable output. |
| Insights | Personal insights, trend summaries, role-specific highlights | Predictive analytics, anomaly detection, smart recommendations, next-best-action | Insight content must be grounded in current platform data, not static copy. |

---

## 9. Shared Enterprise Capabilities

The following capabilities apply across all modules.

### 9.1 Workflow and State Management

- All critical state transitions must be enforced server-side.
- State transition rules must be explicit, testable, and auditable.
- Cross-module orchestration must be transactional where required and compensating where necessary.
- Optimistic locking or equivalent concurrency controls must be used where multiple actors can update the same record.

### 9.2 Audit and Compliance

- Create, update, delete, approve, export, sign-off, and status-change actions must generate audit events.
- Soft delete is allowed only where retention policy requires it, and deleted records must remain historically traceable.
- Compliance-sensitive modules must support attachment storage for certificates, sign-offs, inspection evidence, and finance documents.
- Export control, medical compliance, and warranty documentation must be attachable and searchable.

### 9.3 Attachments and Document Vault

- Attachments must support secure upload, retrieval, metadata, and role-aware access.
- Equipment, QC, site assessments, fieldwork, warranties, invoices, purchase orders, suppliers, employees, and service tickets must all support attachments where operationally needed.
- The system must provide a shared document vault pattern instead of ad hoc one-off upload behavior.

### 9.4 Search, Filter, Sort, and Export

- Every primary list screen must support pagination, filtering, search, and sane default sorting.
- Exports must work against the same filtered dataset the user sees.
- Bulk actions may only be offered where permissions, auditability, and rollback expectations are clear.

### 9.5 Integrations

- Email and notification dispatch
- Carrier integrations
- FX rate ingestion
- Document storage
- User invitation and identity lifecycle management
- Future-ready hooks for ERP/accounting exchange, SSO, and external portals

### 9.6 Multi-Entity and Data Scope

- Record visibility must be scoped by entity, office, team, or ownership where applicable.
- Reports and dashboards must respect the same data-scope rules as record pages.
- Cross-entity views must be explicitly permissioned and auditable.

---

## 10. Non-Functional Requirements

### 10.1 Reliability

- Critical workflows must be idempotent where retry is plausible.
- The platform must fail safely, with user-visible error states and no silent data loss.
- Background jobs and schedulers must be observable and retry-safe.

### 10.2 Performance

- Standard list pages should render first meaningful data within 2.5 seconds for common filtered loads.
- Dashboard widgets should degrade individually and not block entire page render.
- Reports with larger datasets must execute asynchronously when needed and provide status feedback.

### 10.3 Security

- JWT or equivalent token security with robust refresh behavior
- Role and permission enforcement on both UI and API layers
- Encryption for sensitive data at rest and in transit
- Tamper-resistant audit logs for high-risk events
- No exposure of service-role credentials in frontend code paths

### 10.4 Observability

- Structured application logging
- Error monitoring with record context where safe
- Metrics for auth failures, workflow failures, export failures, scheduler failures, and report execution failures
- Operational dashboards for queue, scheduler, and integration health

### 10.5 UX and Accessibility

- Every page must define loading, empty, error, and success states.
- Forms must validate before submission and surface field-level and form-level errors.
- Tables and dashboards must remain usable on laptop screens and support responsive behavior where practical.
- Keyboard accessibility and focus handling must not be broken by modal or drawer patterns.

### 10.6 Testability

- Each module must have unit tests for core business logic.
- Each workflow must have integration tests for key transitions.
- Each primary route must have an end-to-end smoke path.
- Regression tests are required for permission gating and cross-module orchestration.

---

## 11. AI Build Contract

Any AI agent implementing this platform must obey the following rules.

### 11.1 No Placeholder Rule

- Do not add buttons, cards, exports, menu items, widgets, or routes unless the full action path is implemented.
- If functionality is not ready, remove it from navigation or hard-block it behind an explicit feature flag not enabled in production.
- Do not use fake success toasts, dummy counts, or permanent mock data to simulate completion.

### 11.2 No Dead Workflow Rule

- Every create action must persist.
- Every update action must reload or reconcile state.
- Every status transition must be validated server-side.
- Every list item must navigate to a real detail view or a justified inline workflow.
- Every export button must download a real file or job token.

### 11.3 Single Source of Truth Rule

- Each business entity must have one authoritative persistence path.
- Local draft state is allowed only as transient UX state, not as a silent replacement for backend persistence.
- All modules must resolve identity, authorization, and ownership consistently through the primary backend and database model.

### 11.4 Navigation Integrity Rule

- If a module is shown in sidebar or route definitions, it must be production-usable.
- If a module lacks backend completion, either implement the backend in the same delivery slice or remove the route from exposed navigation.

### 11.5 Definition of Done for Every Visible Screen

Every visible screen is done only when all of the following are true:

- The route loads under correct permissions.
- The page uses a real data source.
- Loading, empty, and error states are handled.
- Primary actions persist correctly.
- Secondary actions are either functional or absent.
- Validation errors are surfaced clearly.
- Success and failure toasts or banners reflect actual outcomes.
- Audit-sensitive actions are logged.
- Responsive layout remains usable.
- The route has at least one automated smoke test.

### 11.6 Definition of Done for Every Workflow

Every cross-module workflow is done only when all of the following are true:

- Trigger event is persisted.
- Downstream records are created or updated correctly.
- Permissions are enforced.
- Duplicate execution is prevented or safely handled.
- Failure paths are visible and recoverable.
- Audit trail shows who did what and when.
- Reports and dashboards reflect the result within the expected data refresh model.

---

## 12. Delivery Sequence

The system should be delivered in the following order.

### Phase 0: Stabilization and Truth Alignment

- Remove or hide dead routes, dead buttons, and non-functional widgets.
- Consolidate auth, permission, and user identity behavior into the primary backend stack and remove parallel auth paths.
- Normalize API contracts, error envelopes, and pagination conventions.
- Ensure foundational admin, RBAC, workspace, and notifications are trustworthy.

### Phase 1: Core Functional Completeness

- Complete CRM core.
- Complete equipment lifecycle, inventory, purchasing, sales orders, shipments, warranties, service tickets, and fieldwork.
- Complete invoice and payment workflows.
- Complete HR employee, leave, timesheets, payroll, and onboarding modules.
- Complete project, task, milestone, and employee workspace flows.

### Phase 2: Enterprise Hardening

- Add approval workflows, audit strengthening, document vault consistency, SLA escalations, and role-aware dashboards.
- Add financial controls such as AP, GL linkage, FX handling, and close-cycle behavior.
- Add custom report execution governance, scheduling, sharing, and performance tuning.

### Phase 3: Advanced Enterprise Features

- Predictive maintenance and service optimization
- Advanced forecast and anomaly insights
- Carrier and email/calendar integrations
- SSO and advanced identity governance
- Portfolio analytics, capacity planning, and executive board packs

---

## 13. Acceptance KPIs

The implementation is considered enterprise-ready only when the following are demonstrably true:

- 100% of production-visible navigation items route to functional pages.
- 0 dead primary CTAs in exposed modules.
- 100% of key workflows have auditable end-to-end execution.
- 95% or better successful completion rate for standard quote, order, shipment, warranty, invoice, payment, onboarding, and task workflows in QA validation.
- Role and data-scope violations found in test or review are zero at release candidate stage.
- Dashboard and report exports produce real data with correct scoping.
- Seed/demo fallback behavior is disabled in normal production mode.

---

## 14. Explicit In-Scope Modules for Implementation

To remove ambiguity, the following visible module families are all in scope for full implementation quality:

- Accounts
- Acquisitions
- Activities
- Admin
- Auth
- Contacts
- Dashboard
- Deals
- Employee workspace
- Equipment
- Equipment assessments
- Equipment QC
- Inventory and ERP operational pages
- Fieldwork
- Finance
- HR
- Insights
- Invoices
- Leads
- Notifications
- Organization onboarding
- Payments
- Profile
- Project management
- Purchase orders
- Quotes
- Reports
- Sales orders
- Service tickets
- Shipments
- Site assessments
- Spare parts
- Subcontractors
- Suppliers
- Warranties
- Workspace

Any module on this list must either be fully working or explicitly hidden from production navigation until complete.

---

## 15. Implementation Instructions for the AI Agent

When using this document as the build brief, the implementation agent must proceed as follows:

1. Start from the current repo implementation and preserve working behavior.
2. Treat the existing technical reference as the low-level inventory and this PRD as the target operating contract.
3. Do not introduce new UI affordances without wiring backend behavior, permissions, and validation.
4. Close the highest-value workflow gaps before adding cosmetic enhancements.
5. Validate every module with real data paths, not mocked happy paths.
6. Remove ambiguity by adding tests, comments only where necessary, and concise admin/operator documentation for complex flows.
7. If a module is only partially present today, complete it or remove it from exposed navigation. Do not leave it in limbo.

This is the governing principle:

The system is not done when it looks complete. It is done when every exposed module behaves like an enterprise product under real permissions, real data, real failure states, and real operational workflows.

---

## 16. Step-by-Step Build Plan (Execution Checklist)

This section converts the PRD into a deterministic execution sequence. Each step must be completed and verified before advancing.

### Step 0.1: Baseline Audit and Scope Lock

- Deliverables
	- Inventory of routes, APIs, and backend endpoints mapped to PRD modules.
	- List of dead routes, non-functional buttons, and placeholder widgets.
	- Priority list of workflow breaks blocking end-to-end flows.
- Verification
	- All modules in Section 14 have a known source of truth or a scoped deprecation decision.

### Step 0.2: Backend Ownership Consolidation

- Deliverables
	- One authoritative backend stack: Spring Boot plus PostgreSQL.
	- Project management, onboarding, workspace, and identity flows served by backend APIs.
	- Removal or migration of external-service dependencies used as primary data stores.
	- Frontend service layer aligned to backend endpoints only.
- Verification
	- No external-service client code required for core record CRUD in production.
	- Smoke tests pass for project, onboarding, and workspace flows using backend endpoints.

### Step 0.3: Auth and RBAC Unification

- Deliverables
	- Unified JWT session behavior for all modules.
	- Permission checks enforced server-side across all endpoints.
	- Consistent data-scope enforcement for list and detail queries.
- Verification
	- Role visibility and API access match for at least three distinct role profiles.
	- Attempts to access unauthorized routes or endpoints are blocked and logged.

### Step 0.4: Navigation Integrity Sweep

- Deliverables
	- Remove or hide dead routes and CTAs.
	- Replace placeholder widgets with real data or remove them.
	- Standardize empty and error states on high-traffic pages.
- Verification
	- 0 dead primary actions in exposed navigation.
	- Each visible route returns real data or a clean empty state.

### Step 0.5: Data Model Alignment and Migration Plan

- Deliverables
	- Canonical entity model and migration plan for all modules.
	- Mapping for legacy or transitional schema artifacts.
	- Data integrity rules aligned with workflow transitions.
- Verification
	- All core workflows can be executed without violating referential integrity.

---

### Step 1.1: CRM Core Completion

- Modules: Accounts, Contacts, Leads, Deals, Activities, Quotes
- Deliverables: end-to-end lead-to-quote flow, PDF generation, approvals where required
- Verification: full CRM revenue workflow up to quote acceptance is executable

### Step 1.2: Equipment and Inventory Lifecycle

- Modules: Acquisitions, Equipment, Assessments, QC, Inventory, Asset Audits
- Deliverables: enforce equipment state machine, stock ledger, assessment-to-stock path
- Verification: assets cannot be reserved, sold, or shipped in invalid states

### Step 1.3: Order-to-Cash Completion

- Modules: Sales Orders, Shipments, Warranties, Invoices, Payments
- Deliverables: sales order orchestration, shipment tracking, warranty creation, invoice generation
- Verification: confirmed SO produces valid shipment, warranty, and invoice trail

### Step 1.4: Service and Field Operations

- Modules: Service Tickets, Fieldwork, Spare Parts, Subcontractors
- Deliverables: SLA timers, assignment, parts usage, sign-off, billing impact
- Verification: service job can be completed with parts and labor tracked and reported

### Step 1.5: Finance Core

- Modules: AR, AP, GL, FX, Finance Reports
- Deliverables: payment allocation, FX handling, basic GL posting, aging and cash flow reports
- Verification: invoices and payments reconcile to financial reports

### Step 1.6: HR and People Operations

- Modules: Employee, Leave, Attendance, Timesheets, Payroll, Onboarding, Training
- Deliverables: onboarding task tracking, approvals, payroll run with validation
- Verification: HR dashboards reflect real employee lifecycle data

### Step 1.7: Project and Employee Execution

- Modules: Projects, Epics, Sprints, Milestones, Tasks, Employee Workspace
- Deliverables: board and list operations persist, task ownership and status changes audit
- Verification: project and task changes are reflected across workspace and reports

### Step 1.8: Reporting and Insights

- Modules: Dashboards, Custom Reports, Template Reports, Insights
- Deliverables: live widgets, report execution, export pipeline, role-based access
- Verification: each widget and export is query-backed and scoped

---

### Step 2.1: Enterprise Hardening

- Deliverables: approval workflows, audit strengthening, document vault consolidation, SLA escalations
- Verification: high-risk actions require approvals and produce immutable audit trails

### Step 2.2: Financial Controls

- Deliverables: AP workflow, close-cycle support, revaluation, intercompany handling
- Verification: month-end close can be executed without manual overrides

### Step 2.3: Reporting Governance

- Deliverables: report scheduling, execution logs, sharing controls, caching
- Verification: report sharing and scheduled exports respect permissions and scopes

---

### Step 3.1: Advanced Enterprise Features

- Deliverables: predictive maintenance, advanced forecasting, carrier and calendar integrations, SSO
- Verification: advanced features use real operational data and integrate with core workflows

## Appendix: Traceability Matrix (reference)

The project-level partial traceability matrix has been generated and is available here:

- [docs/product/TRACEABILITY_MATRIX_PARTIAL.md](docs/product/TRACEABILITY_MATRIX_PARTIAL.md)

Use the referenced file to view per-module frontend→backend mappings, example API paths, and the recommended Navigation Gating Policy. Update the matrix with owners and exact file/line mappings as implementation progresses.
