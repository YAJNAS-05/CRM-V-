# EVERX ERP + CRM Platform
## Product Requirements Document (PRD)

> Superseded as the primary implementation brief by `docs/product/ENTERPRISE_AI_READY_PRD.md`.
> Use that document for enterprise-grade, AI-ready delivery requirements and functional completeness rules.

**Version:** 1.0  
**Last Updated:** April 15, 2026  
**Status:** In Development  
**Document Owner:** Product Team  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Strategy](#product-vision--strategy)
3. [Business Objectives](#business-objectives)
4. [Target Users & Personas](#target-users--personas)
5. [Feature Set & Modules](#feature-set--modules)
6. [User Stories & Requirements](#user-stories--requirements)
7. [Success Metrics & KPIs](#success-metrics--kpis)
8. [Technical Requirements](#technical-requirements)
9. [Architecture & Design](#architecture--design)
10. [Implementation Timeline](#implementation-timeline)
11. [Risk Assessment](#risk-assessment)
12. [Dependencies & Constraints](#dependencies--constraints)
13. [Appendix](#appendix)

---

## Executive Summary

### Overview

**EVERX** is an enterprise-grade, integrated ERP+CRM web platform purpose-built for **EverX Pty Ltd**—a global used and refurbished medical imaging equipment trading company.

**Product Name:** EVERX Platform  
**Primary Vertical:** Medical Imaging Equipment (B2B)  
**Target Users:** ~15 employees across 3 global locations  
**Launch Target:** Q3 2026  

### Problem Statement

EverX Pty Ltd currently operates across multiple disconnected systems:
- Spreadsheets for inventory tracking
- Email for sales pipeline management
- Manual invoicing and payment tracking
- No centralized audit trail or compliance records
- Limited visibility into international operations across Australia, USA, and Japan

### Solution

EVERX is an integrated, modular platform that consolidates:
- **CRM functionality** (leads, contacts, deals, quotes, pipeline management)
- **ERP core** (inventory, purchase orders, sales orders, multi-currency finance)
- **Operations** (logistics, after-sales service, warranty management, compliance)
- **Analytics** (real-time dashboards, financial reporting, KPI tracking)

### Key Business Value

| Benefit | Impact |
|---------|--------|
| Centralized data | Single source of truth across all locations |
| Process automation | 30% reduction in manual data entry |
| Real-time visibility | Live inventory, cash flow, and pipeline tracking |
| Compliance & audit | Complete audit trail for regulatory requirements |
| Multi-currency & multi-entity | Seamless operation across AU/US/JP |

---

## Product Vision & Strategy

### Vision Statement

*"To be the operating system for global B2B equipment trading—enabling seamless order-to-cash, procure-to-pay, and after-sales service workflows with complete financial control and regulatory compliance."*

### Core Pillars

1. **Integration** - All business processes in one unified platform
2. **Scalability** - From 15 users to 150+ with minimal infrastructure changes
3. **Compliance** - Multi-entity, multi-currency accounting with audit trail
4. **Automation** - Intelligent workflows reducing manual effort
5. **Analytics** - Real-time insights via dashboards and reports

### Strategic Goals

- **Immediate** (Months 1-4): Replace email-based CRM with sophisticated pipeline management
- **Short-term** (Months 5-9): Enable financial control through integrated accounting
- **Medium-term** (Months 10-14): Automate operations and international logistics
- **Long-term** (Year 2+): SaaS offering for similar B2B equipment trading companies

---

## Business Objectives

### Primary Objectives

1. **Operational Efficiency**
   - Reduce quote-to-order turnaround from 5 days to 1 day
   - Minimize data entry errors to <1%
   - Automate 80% of routine workflows

2. **Financial Control**
   - Real-time cash flow visibility across all entities
   - Eliminate revenue recognition delays
   - Reduce DSO (Days Sales Outstanding) by 10%
   - Enable daily multi-currency consolidation

3. **Compliance & Risk Management**
   - Complete audit trail for all transactions
   - Automated compliance checks for international sales
   - Warranty obligation tracking and accrual accounting
   - Secure document vault for PDFs, certificates, compliance records

4. **User Adoption**
   - Achieve 95%+ user adoption within 3 months
   - <2 support tickets per user per week
   - Average login frequency: 3+ times per day

### Secondary Objectives

- Prepare for future geographies (EU, APAC expansion)
- Build foundation for mobile app (Year 2)
- Enable data-driven decision making through analytics

---

## Target Users & Personas

### User Base

**Total Users:** ~15 across 3 offices

| Role | Count | Key Needs |
|------|-------|-----------|
| Sales Manager | 1 | Pipeline visibility, quote creation, win/loss analysis |
| Sales Rep | 4 | Lead tracking, opportunity management, quick quotes |
| Finance Manager | 1 | Cash flow, AR/AP, multi-currency accounting, consolidation |
| Warehouse Manager | 2 | Inventory tracking, stock transfers, receiving, shipping |
| Service Technician | 3 | Warranty tracking, service scheduling, parts management |
| Admin/Operations | 2 | User management, compliance, reporting, system configuration |
| Executive | 1 | Executive dashboard, KPIs, financial reports, forecasts |

### Personas

#### Persona 1: Sarah (Sales Manager)
- **Goals:** Close deals faster, maintain pipeline visibility, forecast revenue
- **Pain Points:** Can't track which opportunities are stalled, creating quotes is manual
- **Needs:** Kanban dashboard, quote templates, win/loss reports, activity reminders

#### Persona 2: Ali (Finance Manager)
- **Goals:** Maintain financial control, meet tax deadlines, reduce manual reconciliation
- **Pain Points:** Invoices scattered across email, multi-currency calculations done in Excel, month-end close takes 5 days
- **Needs:** Integrated invoicing, automatic GL posting, currency conversion, consolidated financials

#### Persona 3: Raj (Warehouse Manager)
- **Goals:** Know what's in stock, ship efficiently, minimize shrinkage
- **Pain Points:** Spreadsheet inventory doesn't match physical stock, can't track where equipment is located
- **Needs:** Real-time inventory position, barcode scanning, warehouse locator, stock transfer workflow

#### Persona 4: Emma (Service Technician)
- **Goals:** Resolve issues quickly, track warranty obligations, schedule work efficiently
- **Pain Points:** Can't find equipment specs quickly, warranty status unclear, manual timesheets
- **Needs:** Quick equipment lookup, warranty calendar, task scheduler, parts availability check

---

## Feature Set & Modules

### Phase 1: CRM Core (Months 1-4)

#### 1.1 Contact Management
- **Contacts** - Store company and individual contact details with custom fields
- **Accounts** - Company hierarchy, billing/shipping addresses, contact relationships
- **Activities** - Track calls, emails, meetings, notes on all contacts
- **Email Integration** - Auto-log sent emails as activities
- **Bulk Actions** - Tag, segment, and bulk update contacts

#### 1.2 Lead Management
- **Lead Capture** - Web form integration, trade show scanner, CSV import
- **Lead Qualification** - Qualification score (Budget, Authority, Need, Timeline)
- **Lead Routing** - Automatic assignment based on geography/product type
- **Lead Conversion** - Convert qualified leads to opportunities
- **Lead Source Tracking** - Track conversion rates by source

#### 1.3 Sales Pipeline
- **Opportunities/Deals** - Multi-stage pipeline with custom field mapping
- **Kanban View** - Drag-and-drop deal management across stages
- **Deal Probability** - Win probability based on stage
- **Sales Forecast** - Automatic revenue forecast by rep and month
- **Deal Aging** - Alerts for opportunities stalled > 30 days
- **Won/Lost Analysis** - Track conversion rates, loss reasons, cycle time

#### 1.4 Quote Management
- **Quote Templates** - Pre-built templates with equipment configurations
- **Bulk Quote Creation** - Create quotes for multiple equipment types
- **Quote Versioning** - Track quote history and changes
- **PDF Generation** - Professional quote PDFs with company branding
- **Quote-to-Order** - Convert accepted quotes to sales orders
- **Quote Expiry Alerts** - Automatic reminders before quote expires

#### 1.5 Trade Shows & Events
- **Event Management** - Create and track trade show events
- **Lead Capture at Event** - Scan attendee badges, register leads on-site
- **Follow-up Workflow** - Automated email sequences post-event
- **Event ROI** - Track leads generated, deals won per event

#### 1.6 Reporting & Analytics
- **Dashboard** - Sales rep performance, pipeline health, conversion funnel
- **Reports** - Weekly/monthly sales report, forecast accuracy, lead source analysis
- **Export** - CSV, Excel, PDF export for all reports

---

### Phase 2: ERP Core & Finance (Months 5-9)

#### 2.1 Inventory Management
- **Equipment Master** - Product database with specs, photos, acquisition cost, useful life
- **Inventory Tracking** - Real-time stock position by warehouse location
- **Stock Transfer** - Inter-warehouse transfers with approval workflow
- **Physical Inventory** - Cycle counting, variance analysis, reconciliation
- **Reorder Management** - Automated reorder alerts based on minimum stock levels
- **Equipment Lifecycle** - Used → Refurbished → Certified → Warranty phases

#### 2.2 Purchase Order Management
- **Supplier Management** - Supplier master, contact info, payment terms, certifications
- **Purchase Orders** - PO creation with line items, approval routing, delivery tracking
- **PO to GRN** - Goods receipt against PO, three-way match (PO-GRN-Invoice)
- **Expedite Alerts** - Automatic alerts for delayed deliveries
- **Supplier Performance** - On-time delivery, quality, cost analysis

#### 2.3 Sales Order Management
- **Sales Orders** - Create from quotes or manually, line items with pricing
- **Fulfillment Workflow** - Pick → Pack → Ship → Invoice sequence
- **Backorder Management** - Partial shipments, backorder tracking and fulfillment
- **Sales Order Status** - Real-time visibility from SO creation to invoice
- **Delivery Tracking** - Integration with logistics partners for shipment tracking

#### 2.4 Multi-Currency Finance
- **Currency Master** - Configure supported currencies (AUD, USD, JPY, EUR, INR)
- **Exchange Rates** - Daily FX rate updates from Bloomberg/OANDA API
- **Transaction Currency** - All sales/purchase transactions in transaction currency
- **Functional Currency** - Each entity has functional currency (AUD, USD, JPY)
- **Revaluation** - Month-end revaluation gains/losses on foreign currency AR/AP
- **Realized Gains/Losses** - Track realized FX gains/losses on collections

#### 2.5 Accounting & General Ledger
- **Chart of Accounts** - Configurable GL accounts, cost centers, profit centers
- **Manual Journal Entries** - GL posting with audit trail, approval workflow
- **Multi-Entity GL** - Separate GL per legal entity with consolidation
- **GL Reporting** - Trial balance, income statement, balance sheet, cash flow

#### 2.6 Accounts Receivable
- **Invoicing** - Create from sales orders, manual invoices, credit notes
- **Invoice Tracking** - Invoice status, payment history, aging reports
- **Collections** - Outstanding balance tracking, dunning letters
- **Payment Application** - Apply cash receipts to invoices (automatic and manual)
- **Disputes & Adjustments** - Record disputes, apply credit notes, write-offs
- **DSO Analysis** - Track average days sales outstanding by customer and period

#### 2.7 Accounts Payable
- **Bill Entry** - Vendor bills with three-way match (PO-GRN-Invoice)
- **Payment Processing** - Batch payment creation, payment schedule, bank transfer prep
- **Expense Accruals** - Accrue estimated expenses month-end
- **Vendor Statements** - Reconcile vendor statements with GL
- **1099 Reporting** - Track 1099-eligible vendors and amounts (US)

#### 2.8 Bank & Cash Management
- **Bank Account Master** - Configure bank accounts by entity and location
- **Bank Reconciliation** - Match bank statement lines to GL transactions
- **Outstanding Items** - Track unclearedchecks and deposits, aging analysis
- **Cash Flow Forecast** - Project cash position based on AR/AP schedules

---

### Phase 3: Operations, Logistics & After-Sales (Months 10-14)

#### 3.1 Logistics & Shipment Management
- **Shipment Creation** - Create shipments from multiple sales orders
- **Shipping Carrier Integration** - UPS, FedEx, DHL APIs for rates and labels
- **Customs Documentation** - BOL, commercial invoices, HS code tagging, export licensing
- **Shipment Tracking** - Real-time tracking updates, customer notifications
- **Freight Accrual** - Accrue freight costs on invoices

#### 3.2 After-Sales Service
- **Service Tickets** - Create from equipment installation, customer request, or warranty event
- **Ticket Status** - Open → In Progress → On Hold → Resolved → Closed
- **Service Technician Assignment** - Assign based on skills, location, availability
- **Technician Schedule** - Calendar view, job scheduling, travel time calculation
- **Service Bill-of-Materials** - Required parts for common repairs, spare part checking
- **Labor & Parts Tracking** - Record labor hours and parts used per ticket
- **Service Invoice** - Auto-generate from service tickets (billable vs. warranty)

#### 3.3 Warranty Management
- **Warranty Creation** - Record warranty terms and conditions per equipment sale
- **Warranty Types** - Full coverage, limited coverage, parts-only, labor-only, extended
- **Warranty Accrual** - Month-end accrual of expected warranty costs (percentage of revenue)
- **Warranty Claims** - Process warranty service requests
- **Warranty Expiry Alert** - Notify customers of warranty expiration
- **Warranty ROI** - Track cost of warranty claims vs. accrual, margin impact

#### 3.4 Sub-contractor Management
- **Sub-contractor Master** - Service provider database, rates, certifications, coverage areas
- **Sub-contractor Assignment** - Outsource service tickets when in-house unavailable
- **Sub-contractor Invoicing** - Track sub-contractor costs, invoice processing
- **Performance Metrics** - On-time completion, quality ratings, turnaround time

#### 3.5 Equipment Compliance & Documentation Vault
- **Compliance Certificates** - FDA, TGA, CE, IEC, KFDA, PMDA, HSA certifications
- **Equipment Specifications** - Imaging parameters, field strength, tube type, detector size
- **Compliance Checklist** - Pre-shipment compliance verification
- **Document Storage** - Secure vault for PDFs, certificates, compliance reports
- **Export Licensing** - Track ITAR/EAR restrictions per destination country
- **Audit Trail** - Who accessed what document, when

#### 3.6 Reporting & Analytics (Executive Dashboard)
- **KPI Dashboard** - Revenue YTD vs. target, gross margin %, inventory turnover, DSO
- **Sales Analytics** - Top customers, top products, sales by rep, sales by entity
- **Financial Dashboards** - Revenue, COGS, gross profit, operating expenses, EBITDA
- **Warranty Dashboard** - Warranty claims count, warranty costs vs. accrual, cost per equipment
- **Service Dashboard** - Open tickets by technician, average resolution time, customer satisfaction
- **Inventory Dashboard** - Stock position, aging equipment, reorder alerts, slow-moving items
- **Custom Reports** - Ad-hoc query builder, saved reports, scheduled email delivery

---

### System-Wide Features

#### 4.1 User Management & Access Control
- **Role-Based Access Control (RBAC)** - Admin, Manager, Sales Rep, Technician, Finance, Viewer roles
- **Permission Framework** - Granular permissions per feature/entity
- **Office-Based Filtering** - Users see data for their office only (with executive override)
- **User Provisioning** - Create, activate, deactivate, reset password
- **Multi-Tenant Support** - Single platform instance, data isolation by legal entity and office

#### 4.2 Audit & Compliance
- **Audit Trail** - Every create, update, delete action logged with timestamp, user, IP address
- **Soft Deletes** - Deleted data retained for compliance and audit
- **Activity Log** - User login/logout, system configuration changes
- **Data Privacy** - PII encryption at rest, compliance with GDPR, CCPA (as applicable)
- **SOC 2 Readiness** - Access controls, encryption, backup, disaster recovery

#### 4.3 System Administration
- **Configuration** - Master data setup (chart of accounts, tax rates, currencies, terms)
- **Backup & Restore** - Automated daily backups, user-initiated restores (sandboxed)
- **Data Import/Export** - CSV/Excel imports for initial data load, exports for analysis
- **API Key Management** - Issue API keys for integrations, revoke compromised keys
- **System Health** - Uptime monitoring, performance metrics, storage utilization

#### 4.4 Integrations
- **Email Integration** - Gmail/Outlook API for auto-logging emails
- **Calendar Integration** - Sync activities to Google Calendar/Outlook
- **FX Rate API** - Daily exchange rate updates (Bloomberg/OANDA)
- **Shipping Carrier APIs** - UPS, FedEx, DHL rate and tracking APIs
- **Payment Gateway** - Stripe/PayPal integration for online payments (future)
- **Webhook Support** - Trigger workflows on external events, push notifications to external systems

#### 4.5 Mobile Experience
- **Responsive Design** - Fully responsive web interface (Phase 1-2)
- **Mobile App** - iOS/Android native app for sales reps and technicians (Phase 4 - future)
- **Offline Capability** - Sync data when reconnected (Phase 4 - future)

---

## User Stories & Requirements

### CRM Module Stories

#### US-CRM-001: Sales Rep - Manage Sales Pipeline
**As a** sales rep  
**I want to** view all my opportunities in a Kanban pipeline  
**So that** I can prioritize follow-up and forecast my commissions

**Acceptance Criteria:**
- Kanban board shows 5 stages: Lead, Qualified, Proposal, Negotiation, Closed-Won/Lost
- Card displays deal name, amount, probability, last activity date
- Drag-and-drop move between stages
- Automatic stage transition triggers email notification
- Deal details modal shows full history and activities
- Filter by product type, amount, stage

#### US-CRM-002: Sales Manager - Forecast Revenue
**As a** sales manager  
**I want to** see a revenue forecast for next 3 months  
**So that** I can report to executive on expected cash inflow

**Acceptance Criteria:**
- Forecast = Sum of (opportunity amount × win probability) by month
- Filter by sales rep, product type, office
- Show best-case, likely-case, worst-case scenarios
- Compare to historical accuracy
- Download as PDF/Excel

#### US-CRM-003: Marketing - Lead Scoring
**As a** marketing coordinator  
**I want to** automatically score leads based on activity  
**So that** we can prioritize hot leads

**Acceptance Criteria:**
- BANT scoring: Budget, Authority, Need, Timeline
- Auto-increment score on activities (email open +1, form fill +5, demo attended +10)
- Score > 70 triggers auto-assignment to sales rep
- Sales rep can manually override score

---

### ERP Module Stories

#### US-ERP-001: Warehouse Manager - Inventory Tracking
**As a** warehouse manager  
**I want to** see exactly what equipment is in stock at each location  
**So that** I can tell sales reps what we can ship immediately

**Acceptance Criteria:**
- Real-time inventory dashboard by location
- Drill-down to equipment detail: serial number, acquisition date, refurbishment status
- Low stock alerts when quantity < reorder point
- Filter by product type, condition, warehouse location
- Show aging (how long in inventory)
- Update inventory via barcode scan

#### US-ERP-002: Procurement - Purchase Orders
**As a** procurement manager  
**I want to** create POs against suppliers  
**So that** we have authorized purchasing and AP control

**Acceptance Criteria:**
- PO template with standard terms
- Multi-line items with quantity, unit price, total
- 3-way match enforcement: PO → GRN → Invoice
- PO approval routing (manager, director approval)
- Auto-create GL entry when GRN received
- Order status tracking: Draft → Approved → Partial Receipt → Receipted → Invoiced

#### US-ERP-003: Finance - Multi-Currency Accounting
**As a** finance manager  
**I want to** transact in USD/JPY but consolidate to AUD  
**So that** we can operate globally with single chart of accounts

**Acceptance Criteria:**
- Transaction entry in foreign currency automatically converts to AUD
- Daily FX rates pulled automatically
- Month-end revaluation of foreign currency AR/AP with FX gain/loss
- Consolidated GL by legal entity with inter-company elimination
- Trial balance, income statement, balance sheet in AUD

---

### Finance Module Stories

#### US-FIN-001: Finance - Invoicing
**As a** finance administrator  
**I want to** create invoices from sales orders  
**So that** we can bill customers and track receivables

**Acceptance Criteria:**
- Auto-draft invoice from approved SO
- Manual invoice creation with line items
- Configurable invoice line items (product, qty, rate, amount, description)
- Tax calculation (GST in AU, sales tax in US, consumption tax in JP)
- PDF invoice generation with company logo and terms
- Invoice number auto-generation per legal entity
- Invoice status: Draft → Sent → Overdue → Paid

#### US-FIN-002: Finance - Collections
**As a** finance manager  
**I want to** track all unpaid invoices and send reminders  
**So that** we improve cash collection

**Acceptance Criteria:**
- Aging report: 0-30 days, 31-60 days, 61-90 days, 90+ days
- Auto-generate dunning emails at 30, 60, 90 days overdue
- Record payments manually or from bank reconciliation
- Apply payment to specific invoice or use AI matching
- Track payment exceptions and disputes
- DSO (Days Sales Outstanding) metric

---

### After-Sales & Warranty Stories

#### US-SVC-001: Service Technician - Service Ticket Management
**As a** service technician  
**I want to** see my assigned service tickets for the day  
**So that** I can schedule my route efficiently

**Acceptance Criteria:**
- Daily schedule shows assigned tickets by appointment time
- Ticket detail shows customer info, equipment specs, issue description, parts needed
- Check warranty status before starting work
- Confirm completion with photo/signature
- Log labor hours and parts used
- Auto-generate service invoice if not covered by warranty

#### US-SVC-002: Service Manager - Warranty Accrual
**As a** service manager  
**I want to** accrue warranty costs monthly  
**So that** financials reflect expected warranty expenses

**Acceptance Criteria:**
- Accrual percentage configurable per equipment type (e.g., 12% of sale price)
- Auto-calculate accrual based on equipment sold in period
- GL entry: Debit Service Expense, Credit Warranty Liability
- Track actual warranty claims vs. accrual reserve
- Calculate warranty ROI per product line

---

## Success Metrics & KPIs

### Business Metrics

| KPI | Current | Target (6mo) | Target (12mo) |
|-----|---------|-------------|---------------|
| Sales Cycle (days) | 8 | 5 | 3 |
| Quote-to-Order Rate | 25% | 40% | 50% |
| DSO (Days Sales Outstanding) | 65 | 50 | 45 |
| Inventory Turnover | 2.1x | 2.8x | 3.5x |
| On-time Delivery | 92% | 97% | 98% |
| Gross Margin % | 42% | 44% | 46% |
| Customer Satisfaction (NPS) | TBD | 45+ | 50+ |

### Operational Metrics

| Metric | Target |
|--------|--------|
| System Uptime | 99.5% |
| User Adoption | >95% within 3 months |
| Average Training Time per User | <4 hours |
| Support Tickets per User per Week | <2 |
| Data Entry Error Rate | <1% |
| Quote Generation Time | <15 minutes |

### Financial Metrics

| Metric | Target |
|--------|--------|
| Implementation Cost | $150K - $200K |
| Annual License Cost per User | $2,400 |
| ROI Payback Period | <18 months |
| Annual OpEx Savings | $120K (labor efficiency) |

---

## Technical Requirements

### Non-Functional Requirements (NFRs)

#### Performance
- Page load time: <3 seconds (95th percentile)
- API response time: <500ms (95th percentile)
- Dashboard load: <5 seconds
- Support 500 concurrent users
- Database query: <2 seconds for all daily queries

#### Scalability
- Horizontal scaling for frontend (stateless)
- RDS read replicas for reporting queries
- Redis caching for dashboards and FX rates
- Async processing for heavy operations (imports, report generation)

#### Reliability
- 99.5% uptime SLA
- Automated daily backups, 30-day retention
- Disaster recovery: RTO <4 hours, RPO <1 hour
- Health checks and alerting on critical components

#### Security
- End-to-end encryption (TLS 1.2+)
- AES-256 encryption at rest for sensitive fields (PII, financial data)
- JWT token-based authentication with 1-hour expiration
- Role-based access control (RBAC)
- Audit trail for all data access and modifications
- PCI DSS compliance for payment processing (future)
- SOC 2 Type II compliance target

#### Availability
- Multi-region deployment (AU, US, JP)
- Database replication across regions
- CDN for static assets
- Maintenance window: 2am-3am UTC on Sundays (minimum)

#### Data Integrity
- ACID compliance for all transactions
- Referential integrity with foreign keys
- Soft deletes for audit trail
- No data loss on unplanned failure

---

### Functional Requirements

#### Authentication & Authorization
- Multi-factor authentication (MFA) for sensitive operations
- OAuth2 for third-party integrations
- SSO support for future enterprise customers
- Session timeout: 30 minutes idle, 8 hours absolute

#### Data Management
- Support for 50+ GB initial data load
- Annual growth: 20% data volume increase
- Data backup: Daily incremental, Weekly full backup
- Data retention: 7 years for financial records
- GDPR compliance: Right to be forgotten, data portability

#### Internationalization
- Multi-currency support (AUD, USD, JPY, EUR, INR, GBP)
- Multi-language UI (English initially; Spanish, Japanese future)
- Regional date/time formatting
- Tax compliance by country (GST AU, Sales Tax US, Consumption Tax JP)

#### API & Integration
- RESTful API with OpenAPI 3 documentation
- Webhook support for event-driven workflows
- Rate limiting: 10,000 requests/hour per API key
- API versioning strategy (v1, v2, etc.)
- CORS support for SPA frontend

---

## Architecture & Design

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend | Java 21 + Spring Boot 3 | Enterprise stability, strong ecosystem |
| Database | PostgreSQL 16 | Powerful for complex queries, JSONB support |
| Cache | Redis | Fast caching for FX rates, sessions, dashboards |
| Frontend | React 18 + TypeScript | Type safety, component reusability |
| Frontend State | Zustand + React Query | Lightweight, performant state management |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, consistent design |
| Deployment | Docker + Kubernetes | Container orchestration, easy scaling |
| CI/CD | GitHub Actions | Integrated with GitHub, free for public repos |

### Database Schema - Multi-Schema Postgres

```
everx_auth/
├── users
├── roles
├── permissions
└── audit_logs

everx_crm/
├── contacts
├── accounts
├── leads
├── deals
├── quotes
├── quote_line_items
├── activities
├── trade_shows
└── event_registrations

everx_erp/
├── equipment_master
├── inventory_items
├── suppliers
├── purchase_orders
├── sales_orders
├── inventory_transactions
├── spare_parts
└── equipment_qc_results

everx_finance/
├── chart_of_accounts
├── gl_journal_entries
├── invoices
├── payments
├── fx_rates
└── posting_periods

everx_operations/
├── service_tickets
├── warranty_master
├── subcontractors
├── shipments
└── compliance_certificates
```

### API Design - RESTful

#### Endpoint Namespacing
```
GET    /api/v1/crm/contacts
POST   /api/v1/crm/contacts
GET    /api/v1/crm/contacts/:id
PUT    /api/v1/crm/contacts/:id
DELETE /api/v1/crm/contacts/:id

GET    /api/v1/erp/inventory?warehouse=AU&status=AVAILABLE
GET    /api/v1/finance/invoices/:id/aged/:period

POST   /api/v1/integrations/webhooks
```

#### Response Format
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation completed successfully",
  "timestamp": "2026-01-15T10:30:00Z",
  "traceId": "abc123xyz"
}
```

---

## Implementation Timeline

### Phase 1: CRM Core (Months 1-4)
**Milestone 1.1 (EOD Month 1):** Foundation
- User management and RBAC
- Contact and Account management
- Activity logging
- Basic dashboard

**Milestone 1.2 (EOD Month 2):** Pipeline
- Lead capture and qualification
- Opportunity/Deal management
- Kanban board

**Milestone 1.3 (EOD Month 3):** Sales Operations
- Quote management and templates
- Approval workflows
- Email integration

**Milestone 1.4 (EOD Month 4):** Go-Live
- Trade show module
- Analytics and reporting
- UAT and training
- **Production Launch**

### Phase 2: ERP Core & Finance (Months 5-9)
**Milestone 2.1 (EOD Month 5):** Inventory
- Equipment master
- Inventory tracking
- Physical inventory cycle counting

**Milestone 2.2 (EOD Month 6):** Purchasing
- Supplier management
- Purchase order creation and approval
- GRN (goods receipt) processing

**Milestone 2.3 (EOD Month 7):** Sales Order
- Sales order creation from quotes
- Fulfillment workflow (pick, pack, ship)
- Delivery tracking

**Milestone 2.4 (EOD Month 8):** Accounting
- Multi-currency support
- GL and journal entries
- AR and AP modules
- Bank reconciliation

**Milestone 2.5 (EOD Month 9):** Financial Reporting
- Trial balance, income statement, cash flow
- Multi-entity consolidation
- Go-Live Phase 2

### Phase 3: Operations & Logistics (Months 10-14)
**Milestone 3.1 (EOD Month 10):** Service Management
- Service tickets
- Technician scheduling
- Labor and parts tracking

**Milestone 3.2 (EOD Month 11):** Warranty Management
- Warranty creation and tracking
- Warranty accrual accounting
- Warranty claims processing

**Milestone 3.3 (EOD Month 12):** Logistics
- Shipment management
- Customs documentation
- Carrier integration

**Milestone 3.4 (EOD Month 13):** Compliance Vault
- Document storage and retrieval
- Compliance certificate tracking
- Export licensing

**Milestone 3.5 (EOD Month 14):** Reporting & Analytics
- Executive dashboards
- Warranty analytics
- Operational KPI dashboards
- **Go-Live Phase 3**

---

## Risk Assessment

### High-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| User adoption delays | Medium | High | Early training, UI/UX focus, executive sponsor |
| Data migration errors | Medium | High | Data validation framework, parallel run 2 weeks |
| Multi-currency complexity | Medium | High | Dedicated FX module spec, third-party FX data |
| Supplier/custom API integration | Medium | High | API mock during development, vendor SLAs |
| Geographic latency (AU-US-JP) | Low | Medium | Multi-region RDS replicas, CDN deployment |

### Medium-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Scope creep | High | Medium | Strict change request process, Phase 4 backlog |
| Budget overrun | Medium | Medium | Fixed-price vendor contracts, buffer contingency |
| Performance degradation | Low | Medium | Load testing monthly, auto-scaling policies |
| Cybersecurity breach | Low | High | Penetration testing, SOC 2 compliance, insurance |

---

## Dependencies & Constraints

### External Dependencies

1. **FX Rate Data Provider** - Bloomberg/OANDA for daily exchange rates
   - **Constraint:** APIs rate-limited, need caching strategy
   - **Risk:** Provider outage → use 1-day-old rates

2. **Shipping Carrier APIs** - UPS, FedEx, DHL for tracking
   - **Constraint:** Different API standards per carrier
   - **Risk:** Carrier outage → fallback to manual tracking

3. **Email Providers** - Gmail/Outlook for email integration
   - **Constraint:** Rate limits, OAuth token expiration
   - **Risk:** Email integration failure → manual logging

4. **AWS/Cloud Infrastructure** - EC2, RDS, S3
   - **Constraint:** Regional availability, data residency
   - **Risk:** Service outage → failover to secondary region

### Internal Constraints

1. **Team Size** - 2 backend engineers, 1 frontend, 1 QA, 1 PM
   - **Impact:** Parallel development limited, code review bottleneck
   - **Mitigation:** Pair programming, junior contractor for QA

2. **Budget** - $200K implementation + $24K/year ops + $36K/year licenses
   - **Impact:** Limited budget for premium vendors, tools
   - **Mitigation:** Open-source where possible, discount negotiation

3. **Timeline** - 14-month delivery
   - **Impact:** No time for major rework or scope expansion
   - **Mitigation:** Agile with 2-week sprints, weekly steering meetings

4. **Client Users** - ~15 users, limited IT support
   - **Impact:** Training and change management critical
   - **Mitigation:** Superuser model, vendor documentation, help desk

---

## Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| **ERP** | Enterprise Resource Planning - integrated system for business processes |
| **CRM** | Customer Relationship Management - system for managing customer interactions |
| **UX/UI** | User Experience/Interface - design and usability of software |
| **API** | Application Programming Interface - software connection method |
| **NFR** | Non-Functional Requirements - performance, security, scalability |
| **RBAC** | Role-Based Access Control - permission model based on user roles|
| **IAR** | Inventory Aging Report - report of slow-moving stock |

### B. Success Criteria Checklist

#### Go-Live Phase 1 (Month 4)
- [ ] 95% CRM module test coverage
- [ ] 100% user training completion
- [ ] UAT sign-off from business sponsor
- [ ] <5 critical bugs in production 1st week
- [ ] 80% user adoption in 2 weeks

#### Go-Live Phase 2 (Month 9)
- [ ] ERP and Finance modules fully functional
- [ ] Multi-currency transactions validated
- [ ] GL consolidation tested across entities
- [ ] AR/AP module validated against existing invoices
- [ ] 90% user adoption across finance team

#### Go-Live Phase 3 (Month 14)
- [ ] All modules integrated end-to-end
- [ ] Service and warranty workflows operational
- [ ] Executive dashboards delivering real-time KPIs
- [ ] System uptime 99%+ in production
- [ ] <1% data entry error rate
- [ ] ROI plan established for Year 2

### C. References & Resources

- OpenAPI 3.0 Spec: https://spec.openapis.org/oas/3.0.0
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Spring Boot Reference: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev
- SAP SD (Sales & Distribution) Concepts
- SAP MM (Materials Management) Concepts
- IFRS 16 Lease Accounting Standard
- IAS 21 Foreign Exchange Accounting

### D. Stakeholders

| Name | Role | Email |
|------|------|-------|
| [CEO Name] | Executive Sponsor | ceo@everx.com |
| [CFO Name] | Finance Stakeholder | cfo@everx.com |
| [Product Owner] | Product Owner | po@everx.com |
| [Sales Manager] | Business Lead | sales@everx.com |

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-04-15 | Product Team | Initial PRD |

---

**Confidential - For Internal Use Only**
