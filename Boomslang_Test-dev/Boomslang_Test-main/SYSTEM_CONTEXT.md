# EverX System Context

> **Attach this file to every Copilot prompt for full system context.**
> Start each prompt with: *"Read SYSTEM_CONTEXT.md first, then..."*

---

## System Overview

EverX is a combined enterprise business management platform with the following modules:

| Module | Purpose |
|--------|---------|
| **CRM** | Leads, contacts, accounts, deals, quotes, activities, pipelines |
| **ERP** | Equipment, inventory, purchase orders, sales orders, suppliers, shipments, subcontractors, warranties, spare parts, acquisitions |
| **Finance** | Invoices, payments, GL journals, FX rates, three-way matching, period close, financial reports |
| **HR** | Employees, departments, positions, leave, timesheets, payroll, payslips, training, reimbursements, offer letters, org chart, onboarding, exit |
| **Field Work** | Field jobs, site assessments, equipment assessments, equipment QC, technician dispatch |
| **Reporting** | Custom report builder, Jasper reports, dashboards, scheduled reports, multi-module analytics |
| **Admin** | Users, roles, permissions, audit logs, config studio |
| **Platform Config** | Custom fields, option sets, workflow engine, approval workflows, webhooks, layout config |
| **Insights** | Personalized role-based dashboards aggregating data from all modules |

---

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.3.0, Java 21
- **Database:** PostgreSQL (production), H2 (tests)
- **Migrations:** Flyway
- **ORM:** Spring Data JPA + Hibernate
- **Security:** Spring Security + JWT (jjwt 0.12.3)
- **Utilities:** Lombok, MapStruct 1.5.5
- **Storage:** AWS S3 (documents/files)
- **Rate Limiting:** Bucket4j
- **Resilience:** Spring AOP + Saga pattern for distributed transactions
- **Email:** Spring Mail
- **Reports:** Jasper Reports

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **State:** Zustand (4 stores: auth, notifications, settings, employeeWorkspace)
- **Forms:** React Hook Form + Zod (CRM, HR) — partially missing in Finance, ERP, FieldWork
- **Data Fetching:** Axios + TanStack React Query
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Export:** XLSX (Excel)
- **Build:** Vite

---

## Backend Package Structure

```
com.everx
├── admin/          audit/, dashboard/
├── auth/           User, Role, Permission, RefreshToken, JWT
├── backend/        security (lockout, rate-limit), config, shared infra
├── config/         initializers, seeder, JWT filter, SecurityConfig
├── crm/            account, contact, lead, deal, activity, quote, leadscore, webhook, report
├── erp/            acquisition, assessment, equipment, warranty, fieldwork, inventory,
│                   logistics, purchaseorder, salesorder, servicetickets, suppliers,
│                   subcontractors, spareparts, numbering, scheduling, mapping
├── finance/        account, close, consolidation, currency, fx, invoice, journal,
│                   payment, period, report, reversal, tolerance, scheduler
├── hr/             department, employee, position, document, leave, holiday, payroll,
│                   payslip, task, timesheet, timeentry, training, reimbursement, offer
├── insights/       MyInsights (cross-module personal dashboard)
├── platform/       config (customfields, options, workflows, webhooks, layouts)
├── reporting/      definition, dynamic, jasper, execution, cache, dashboard, scheduler
└── shared/         audit AOP, exceptions, saga, schedulers, mail, JWT utils
```

---

## Frontend Page Structure

```
/auth              Login, Register
/dashboard         Main dashboard, Technician dashboard
/admin             Users, Roles, Config Studio, Audit Logs
/crm               Accounts, Contacts, Leads, Deals (list+kanban), Quotes, Activities
/erp               Equipment, Spare Parts, Suppliers, Purchase Orders, Sales Orders,
                   Shipments, Subcontractors, Warranties, Acquisitions, Inventory,
                   Equipment Assessments, Site Assessments, Equipment QC, Service Tickets,
                   Field Jobs
/finance           Invoices, Payments, Currency Rates, Reports, Financial Close
/hr                Employees, Departments, Positions, Leave Requests, Leave Policies,
                   Leave Balances, Holidays, Timesheets, Payroll, Payroll Runs, Payroll Profiles,
                   Payslips, Reimbursements, Training, Documents, Offer Letters,
                   Recruitment, Candidates, Performance, Compliance, Analytics, Org Chart,
                   Onboarding, Exit/FNF, Attendance, Tasks
/employee          Self-service portal (dashboard, projects, tasks, timesheets, attendance)
/fieldwork         Field Jobs list + detail
/reports           Report list, Custom report builder, Templates
/insights          Personal insights dashboard
/profile           User profile
/notifications     Notification center
/workspace         Workspace settings
```

---

## Module Connections (Data Flows)

```
CRM Pipeline:
  Lead → Contact → Account → Deal → Quote → Sales Order (ERP) → Invoice (Finance) → Payment

Purchase Pipeline:
  Supplier (ERP) → Purchase Order → Receipt → Invoice (Finance) → Three-Way Match → Payment

HR Pipeline:
  Employee → Leave Request → Approval (Workflow) → Leave Balance
  Employee → Timesheet → Approval → Payroll Run → Payslip
  Employee → Reimbursement → Approval → Finance Expense

Field Work Pipeline:
  Field Job (ERP/FieldWork) → Engineer Assignment (HR) → Site Assessment → Equipment QC

Finance Consolidation:
  All invoices/POs/expenses → GL Journal Entries → Period Close → Financial Reports

Reporting:
  CRM + ERP + HR + Finance + FieldWork → Custom Reports / Dashboards / Jasper Reports
```

### Cross-Module Integration Points

| Connection | How Linked |
|-----------|-----------|
| CRM ↔ ERP | `CRMERPLinkingService` — Deal links to Sales Order |
| ERP ↔ Finance | PO/Receipt → Invoice generation; expense recording |
| HR ↔ Finance | Payroll output → Finance expense entries |
| HR ↔ ERP (FieldWork) | Engineer assignment in Field Jobs |
| All ↔ Reporting | ReportBuilderController aggregates all module data |
| All ↔ Platform | Workflow approvals, custom fields, option sets |
| All ↔ Shared | Security (JWT), audit logging (AOP), mail, scheduling |
| All ↔ Insights | `MyInsightsService` aggregates per-user metrics |

---

## Security & Permissions

- **Authentication:** JWT bearer tokens with refresh token rotation
- **Authorization:** Spring Security + `@PreAuthorize` on all controllers
- **Account Lockout:** After failed login attempts (configurable)
- **Rate Limiting:** Bucket4j on auth endpoints
- **Audit Trail:** AOP-based `AuditAspect` + cryptographic audit log

### Frontend Permission Keys

| Module | Permissions |
|--------|------------|
| CRM | CRM_VIEW, CRM_CREATE, CRM_EDIT, CRM_DELETE |
| Finance | FINANCE_VIEW, FINANCE_CREATE, FINANCE_EDIT |
| HR | HR_VIEW (role hierarchies: ADMIN, MANAGER, PAYROLL, SELF_SERVICE) |
| ERP | ERP_VIEW, ERP_CREATE, ERP_EDIT |
| FieldWork | FIELDWORK_VIEW |
| Reports | REPORT_VIEW, REPORT_CREATE |
| Admin | ROLE_VIEW, USER_VIEW |

---

## Database

- **Type:** PostgreSQL (production)
- **Migrations:** Flyway versioned migrations
- **Multi-entity support:** Finance module supports multiple legal entities (AUSTRALIA, USA, JAPAN)
- **Test DB:** H2 in-memory

---

## Key Architectural Patterns

1. **Controller → Service → Repository** (strict layering in all modules)
2. **DTOs for all API surfaces** (MapStruct for entity↔DTO mapping)
3. **Global Exception Handler** (`EnterpriseGlobalExceptionHandler`) for all REST errors
4. **AOP Audit Logging** — all state-changing operations logged automatically
5. **Saga Pattern** — `SagaOrchestrator` for distributed transactions (e.g., invoice + journal)
6. **Workflow Engine** — `WorkflowEngineService` drives approval state machines
7. **Custom Fields** — Dynamic fields per entity per module via `CustomFieldService`
8. **Option Sets** — All dropdowns driven by `OptionSetService` (not hardcoded enums in UI)

---

## API Base URL Convention

All REST APIs are versioned under: `/api/v1/`

| Module | Base Path |
|--------|----------|
| Auth | `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles` |
| CRM | `/api/v1/crm/*` |
| ERP | `/api/v1/erp/*` |
| Finance | `/api/v1/finance/*` |
| HR | `/api/v1/hr/*` |
| Reporting | `/api/v1/reports/*` |
| Config | `/api/v1/config/*`, `/api/v1/admin/config/*` |
| Admin | `/admin/dashboard` |
| Insights | `/api/v1/insights/*` |

---

## Known Incomplete Areas (Quick Reference)

| Area | Gap | Priority |
|------|-----|----------|
| Finance frontend | Payment UI is view-only (no create/edit) | HIGH |
| HR frontend | Performance, Compliance, Recruitment pages are stubs | MEDIUM |
| HR frontend | Task Kanban uses mock data, no API | MEDIUM |
| ERP frontend | Acquisitions has no detail page | LOW |
| ERP frontend | Form validation missing Zod schemas | MEDIUM |
| Finance frontend | No three-way match exception UI | MEDIUM |
| FieldWork | localStorage fallback may cause data inconsistency | HIGH |
| Backend | SparePartReorderScheduler email alerts TODO | LOW |
| Reports | Schedule/email distribution not implemented | MEDIUM |
| Global | No real-time WebSocket notifications | MEDIUM |
| Global | No bulk operations (multi-select + actions) | MEDIUM |
