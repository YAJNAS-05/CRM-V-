# EverX Enterprise ERP/CRM Platform PRD

## 1. Overview
EverX is a modular ERP/CRM platform with Project, HR, Field Work, ERP, CRM, Finance, Reporting, and Dashboard modules. The backend is Spring Boot (Java 21), the frontend is React/Vite (TypeScript), and the database is PostgreSQL. This PRD defines the complete enterprise-grade specification to finish all modules and deliver comprehensive cross-module integrations with real-time visibility, auditability, and scale to 1000+ concurrent users.

## 2. Objectives
- Complete all missing module features for 100% coverage across 8 modules.
- Deliver bidirectional cross-module integrations with visual UI tracking, automated workflows, and audit trails.
- Support multi-entity, multi-currency, and compliance-ready operations.
- Achieve enterprise reliability and performance targets.

## 3. Success Metrics
- 95%+ cross-module data sync accuracy.
- <2s dashboard load time (P95 on 1000 concurrent users).
- 99.9% uptime post-deployment.
- 100% module feature parity vs enterprise spec.
- Cross-module tests pass 100%.
- User adoption >90% in target business units.
- Forecast accuracy >85% and visible inventory turnover.

## 4. Stakeholders
- Product Owner: Arun (Coimbatore, IN) - approves requirements and priorities.
- Development Teams: Backend (Spring Boot), Frontend (React), DevOps.
- End Users: Sales (CRM), Finance (GL/AP/AR), HR (Payroll/Performance), Field Ops (Jobs), Admins (Reporting/Dashboards).
- External: Compliance auditors, integration partners (payment gateways, payroll, email, calendar).

## 5. Scope
### 5.1 In Scope
- Completion of all module feature gaps (Project, HR, Field Work, ERP, CRM, Finance, Reporting, Dashboard).
- Cross-module integrations and automated workflows.
- Enterprise non-functional requirements: security, compliance, performance, scalability, reliability.
- Observability and auditability.
- Data quality and reconciliation tooling.

### 5.2 Phase Scope (5 phases)
- Phase 1: Close remaining cross-module gaps (X-05, X-06) and baseline security hardening.
- Phase 2: Complete CRM/ERP/HR/Field Work core feature sets and role-based UX flows.
- Phase 3: Finance and Reporting expansion (AP/AR, GL consolidation, scheduled exports).
- Phase 4: Compliance and governance (MFA, RLS, audit hardening, data residency).
- Phase 5: Scale and optimization (performance targets, observability, load testing, DR readiness).


## 6. Current State Summary
- Core entities exist: CRM (Accounts/Deals), ERP (PO/SO/Field Jobs), Finance (Invoices), HR (Employees/Payroll).
- Cross-module fixes implemented in code: X-01 to X-04; X-05 and X-06 are implemented but require end-to-end verification.
- Missing: enterprise features per module, MFA, row-level security, and advanced reporting.

## 7. Functional Requirements by Module

### 7.1 Project Module
- Task Gantt view with dependencies and critical path.
- Resource allocation by employee/role with utilization heatmap.
- Milestone tracking with alerts for slip risk.
- Budget vs actual tracking by project phase.
- Cross-module ties:
  - ERP inventory items link to project materials.
  - HR employees link to project assignments and timesheets.

### 7.2 HR Module
- Performance management: OKRs, 360 feedback, rating scales, calibration.
- Recruitment ATS: job posting, pipeline stages, interview scheduling, offer workflow.
- Multi-country payroll: tax rules, statutory compliance, deductions, arrears.
- Leave accrual and carryover policies with rules engine.
- Employee self-service: leave, reimbursements, profile updates, document downloads.
- Cross-module ties:
  - Finance reimbursements -> payments (X-06).
  - Field Work technician assignment from HR employees.

## 7.2.1 Taxation and accounting - make the taxaation in hr and finance for AU , JApan , USA all 

### 7.3 Field Work Module
- Job scheduling with drag-and-drop calendar.
- GPS tracking and route optimization.
- Parts inventory linkage and reservation against ERP inventory.
- SLA timers and escalation rules.
- Field checklist and offline mode with sync.
- Cross-module ties:
  - ERP service tickets -> field jobs.
  - HR employee dispatch and availability.

### 7.4 ERP Module
- Full inventory ledger with serial and batch tracking.
- Warranty management workflows and expiring alerts.
- 3-way match for PO -> Goods Receipt -> Supplier Invoice.
- Stock adjustments, transfers, and bin locations.
- Procurement approvals and supplier performance metrics.
- Cross-module ties:
  - CRM quotes -> sales orders conversion.
  - Finance PO/receipt/invoice -> GL postings (X-05).

### 7.5 CRM Module
- Lead scoring with configurable rules and engagement signals.
- Pipeline forecasting with weighted probability and velocity metrics.
- Territory management and account hierarchies.
- Activity sync (email/calendar) and auto-logging.
- Win/loss analysis and performance benchmarks.
- Cross-module ties:
  - ERP sales order creation from closed-won deals.
  - Finance AR aging for account health.

### 7.6 Finance Module
- AP/AR aging, dunning workflows, and credit limits.
- GL consolidation, multi-entity eliminations, and FX revaluation.
- 3-way match exception resolution UI with audit trail.
- Cash flow, balance sheet, and P&L with drill-down.
- Tax management (GST/VAT/TDS) and compliance calendar.
- Cross-module ties:
  - HR payroll -> expense and GL postings.
  - ERP receipts -> GL postings (X-05).

### 7.7 Reporting Module
- Self-service BI: drag-and-drop report builder, ad-hoc queries.
- Jasper exports (PDF/Excel) with scheduling and distribution.
- Unified data warehouse with facts/dimensions and SCDs.
- Report scheduling, delivery, and audit logs.
- Cross-module ties:
  - All modules feed a unified analytics model.

### 7.8 Dashboard Module
- Role-based dashboards with real-time KPIs.
- Widget customization, layout persistence, and drill-down.
- Cross-module metrics (deal funnel, inventory turnover, payroll spend).
- Alerting widgets with thresholds and anomalies.

## 8. Cross-Module Integrations
- Visual linking on all detail pages (linked records with status badges).
- Automated workflows:
  - Deal CLOSED_WON -> create Sales Order -> notify Field Work.
  - Payroll PAID -> GL post -> finance dashboards update.
  - Goods Receipt -> GL post (X-05).
  - Reimbursement approved -> payment (X-06).
- Bidirectional sync with WebSocket updates (real-time status refresh).
- Reconciliation UI for 3-way match exceptions with Resolve/Waive actions.
- Immutable audit trails for all cross-module flows (who/what/when/before/after).

## 9. Data Model and Integration Contracts
- Standardized API response envelope for all services.
- Event-driven integration for cross-module workflows using domain events.
- Idempotency keys for all create/update endpoints.
- Data ownership boundaries with explicit sync rules and conflict resolution.
- Shared reference data: entity, currency, tax codes, users/roles.

## 10. Security and Compliance
- MFA for all admin and finance users.
- Row-level security (ORG/TEAM/OWN) and field-level masking (PII/salary).
- Encryption at rest for sensitive columns; secrets vault integration.
- Audit logging: immutable records, before/after snapshots, export tracking.
- GDPR features: data export, right-to-forget workflows, consent tracking.
- SOC2-ready controls (access reviews, change tracking, monitoring).

## 11. Non-Functional Requirements
- Performance: <500ms API response (P95), <2s dashboard load (P95).
- Scalability: 1000+ concurrent users; multi-entity, multi-currency.
- Reliability: 99.9% uptime, automated backups, circuit breakers.
- Observability: structured logs, tracing, metrics, alerting.
- Usability: responsive UI, keyboard navigation, dark mode, i18n (EN/Hindi).

## 12. UX and Accessibility
- WCAG 2.1 AA compliance.
- Keyboard-first navigation for power users.
- Consistent status badges and cross-module link panels.
- Contextual drill-down from dashboards to detail pages.

## 13. Reporting and Analytics
- Standardized KPI library with definitions and data lineage.
- Report scheduling with email and portal distribution.
- Data quality monitoring with freshness and completeness metrics.
- Predictive analytics: churn risk, deal win probability, demand forecasting.

## 14. Testing Strategy
- Unit tests: 70%+ coverage for services and validators.
- Integration tests: API contract coverage for all modules.
- Cross-module workflow tests for all automation paths.
- E2E tests for core user journeys.
- Performance and load testing for 1000+ users.
- Security tests: OWASP top 10 and role validation.

## 15. Risks and Dependencies
- Data migration inconsistencies (mitigation: phased rollout, reconciliation tools).
- Integration delays (mitigation: API contracts first, event schemas locked early).
- External dependency changes (payment gateways, email providers).
- Dependency: PostgreSQL upgrades and Jasper reporting libraries.

## 16. Delivery Phases (High-Level)
- Phase 1 (2 weeks): X-05 Goods Receipt -> GL, X-06 Reimbursements -> Payments, security hardening.
- Phase 2 (4 weeks): Module completions for CRM/ERP/HR/Field Work.
- Phase 3 (6 weeks): Enterprise polish (analytics, dashboards, compliance, scale).

## 17. Acceptance Criteria
- All module feature gaps closed and verified by automated tests.
- All cross-module workflows operational with audit logs and UI linking.
- Non-functional targets met in staging benchmarks.
- Security and compliance controls verified by internal audit checklist.

## 18. Open Questions
- Final list of supported countries and tax regimes for Phase 1? australia , japan , USA - taxation for all , 
- Multi-tenant isolation model (schema per tenant vs shared schema)?
- Preferred event bus for domain events (Kafka vs RabbitMQ)?
- SLA requirements for mobile field ops in low-connectivity regions?
