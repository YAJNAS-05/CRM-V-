<![CDATA[<div align="center">

# EverX ERP + CRM Platform

### Enterprise Resource Planning & Customer Relationship Management
**For Global Medical Imaging Equipment Trading**

[![Java 21](https://img.shields.io/badge/Java-21_LTS-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red)]()

</div>

---

## Table of Contents

- [Overview](#overview)
- [Business Context](#business-context)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Organisational Structure](#organisational-structure)
- [Module Reference](#module-reference)
  - [CRM Layer (Phase 1)](#crm-layer-phase-1)
  - [ERP Layer (Phase 2)](#erp-layer-phase-2)
  - [Finance & Accounting (Phase 2)](#finance--accounting-phase-2)
  - [Logistics & Compliance (Phase 3)](#logistics--compliance-phase-3)
  - [After-Sales Service (Phase 3)](#after-sales-service-phase-3)
  - [Reporting & Analytics (Phase 3)](#reporting--analytics-phase-3)
  - [User & Access Management](#user--access-management)
- [End-to-End Process Flows](#end-to-end-process-flows)
  - [Order-to-Cash (SAP SD)](#1-order-to-cash-sap-sd-equivalent)
  - [Procure-to-Pay (SAP MM)](#2-procure-to-pay-sap-mm-equivalent)
  - [Inventory Lifecycle](#3-inventory-lifecycle-sap-mmwm-equivalent)
  - [Service & Warranty Lifecycle](#4-service--warranty-lifecycle)
- [Master Data Model](#master-data-model)
- [Financial Accounting Engine](#financial-accounting-engine)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security](#security)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Documentation Index](#documentation-index)

---

## Overview

EverX is a production-grade, modular monolithic ERP+CRM web application purpose-built for **EverX Pty Ltd** — a global used & refurbished medical imaging equipment trading company operating across **Australia, USA, and Japan** with ~15 users.

The system manages the complete business lifecycle: from lead capture and sales pipeline through inventory management, multi-entity finance, international logistics, and after-sales service — with SAP-equivalent accounting logic, document flow chains, and automated workflows.

---

## Business Context

| Attribute | Detail |
|---|---|
| **Industry** | Used & refurbished medical imaging equipment (CT, MRI, Ultrasound, Cath Lab, Mammography, C-Arm, PET-CT) |
| **Offices** | Australia (Northmead), USA (California), Japan (Kawasaki) |
| **Legal Entities** | EverX Pty Ltd (AU), EverX USA LLC (US), EverX Japan KK (JP) |
| **Users** | ~15 (Sales, Finance, Warehouse, Service, Admin) |
| **Currencies** | AUD (base), USD, JPY, EUR, INR |
| **Base Currency** | AUD — all consolidated reporting in AUD |

### Phased Rollout

| Phase | Timeframe | Scope |
|---|---|---|
| **Phase 1** | Months 1–4 | CRM Core — Contacts, Leads, Pipeline, Quotes, Email Integration, Trade Shows |
| **Phase 2** | Months 5–9 | ERP Core — Inventory, Purchase Orders, Sales Orders, Multi-Currency Finance, AR/AP |
| **Phase 3** | Months 10–14 | Operations — Logistics, After-Sales Service, Warranty, Sub-contractor, Compliance Vault, Reporting |

### Revenue Model

- SaaS monthly subscription (per user + per module)
- One-time implementation and data migration fee
- Annual support and maintenance retainer

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 LTS + Spring Boot 3.3.x |
| **ORM** | Spring Data JPA + Hibernate |
| **Database** | PostgreSQL 16 (multi-schema) |
| **Cache** | Redis (exchange rates, sessions, dashboard aggregates) |
| **Auth** | Spring Security 6 + JWT + OAuth2 |
| **API** | REST (OpenAPI 3 / Swagger) |
| **Migrations** | Flyway |
| **Frontend** | React 18 + TypeScript + Vite |
| **Server State** | TanStack React Query v5 |
| **UI State** | Zustand |
| **Forms** | React Hook Form + Zod |
| **UI Components** | Tailwind CSS + shadcn/ui |
| **Charts** | Recharts / ECharts |
| **Drag & Drop** | @dnd-kit (Kanban pipeline) |
| **File Storage** | AWS S3 / Azure Blob |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker + Kubernetes (or AWS ECS) |

---

## Architecture

### Backend — Modular Monolith

```
Controller (REST endpoints)
    ↓
Service (business logic + events)
    ↓
Repository (data access)
    ↓
Entity (JPA models)
```

**Key patterns:**
- `@EntityListeners(AuditingEntityListener.class)` — audit trail on every entity
- Spring Security with JWT + `@PreAuthorize` role-based method security
- Spring Data JPA with entity-level filtering by office/company code
- Spring `ApplicationEventPublisher` for loose-coupled downstream processing
- `@Scheduled` jobs for warranty expiry alerts, FX rate sync, overdue invoice checks, reorder alerts
- Flyway for version-controlled database migrations
- OpenAPI/Swagger for API documentation

### Backend Package Structure

```
com.everx
├── config/              → SecurityConfig, CorsConfig, JpaConfig, SwaggerConfig
├── auth/                → JWT, OAuth2, UserDetails, Role/Permission
├── crm/
│   ├── contact/         → ContactController, ContactService, ContactRepository
│   ├── lead/            → LeadController, LeadService, LeadConvertService
│   ├── account/         → AccountController, AccountService
│   ├── deal/            → DealController, DealService, StageEnum
│   ├── quote/           → QuoteController, QuoteService, QuoteLineItem
│   ├── tradeshow/       → EventController, EventLeadService
│   └── activity/        → ActivityController, ActivityService
├── erp/
│   ├── equipment/       → EquipmentController, EquipmentMasterService
│   ├── inventory/       → InventoryService, StockTransferService
│   ├── spareparts/      → SparePartController, ReorderAlertService
│   ├── purchaseorder/   → PurchaseOrderController, POApprovalWorkflow
│   ├── salesorder/      → SalesOrderController, FulfilmentService
│   ├── suppliers/       → SupplierController, SupplierService
│   ├── logistics/       → ShipmentController, FreightIntegrationService
│   ├── service/         → ServiceTicketController, TicketAssignmentService
│   ├── subcontractors/  → PartnerController, PartnerService
│   └── warranty/        → WarrantyController, WarrantyAlertScheduler
├── finance/
│   ├── invoice/         → InvoiceController, PaymentTrackingService
│   ├── payment/         → PaymentRunController, PaymentRunService
│   ├── currency/        → CurrencyRateService, FxGainLossCalculator
│   ├── report/          → FinancialReportService, BASReportService
│   └── scheduler/       → OverdueInvoiceScheduler, FxRevaluationScheduler
├── admin/               → DashboardController, DashboardService
└── shared/
    ├── audit/           → AuditEntity, AuditLogRepository
    ├── document/        → DocumentUploadService, S3StorageService
    ├── notification/    → EmailNotificationService, AlertService
    ├── workflow/        → WorkflowEngine, ApprovalService
    ├── numbering/       → NumberRangeService
    └── exception/       → GlobalExceptionHandler, ErrorResponse
```

### Frontend Structure

```
src/
├── App.tsx              → Router, AuthProvider, ThemeProvider
├── api/                 → Axios instance, per-module API services
├── components/
│   ├── layout/          → MainLayout, Sidebar, TopBar
│   ├── ui/              → Button, Input, Select, Modal, SlideOver, Badge, Table
│   ├── form/            → InlineEdit, BulkEditBar, AuditLog, FieldLockIndicator
│   └── shared/          → CurrencyDisplay, StatusBadge, DocumentUploader,
│                          DocumentFlowChain, PermissionGuard
├── pages/
│   ├── auth/            → LoginPage
│   ├── dashboard/       → DashboardPage
│   ├── contacts/        → ContactListPage, ContactDetailPage
│   ├── accounts/        → AccountListPage, AccountDetailPage
│   ├── leads/           → LeadListPage, LeadDetailPage, LeadBoard
│   ├── deals/           → DealPipeline (Kanban), DealSlideOver
│   ├── quotes/          → QuoteListPage, QuoteBuilder
│   ├── tradeshows/      → EventListPage, LeadCaptureForm
│   ├── equipment/       → EquipmentListPage, EquipmentDetailPage
│   ├── spareparts/      → PartsTable, ReorderAlertView
│   ├── inventory/       → InventoryOverview, StockTransferModal
│   ├── purchaseorders/  → POListPage, POFormPage, POApprovalFlow
│   ├── salesorders/     → SOListPage, SODetailPage, FulfilmentTracker
│   ├── suppliers/       → SupplierListPage, SupplierDetailPage
│   ├── invoices/        → InvoiceListPage, InvoiceBuilder
│   ├── payments/        → PaymentRunPage, PaymentModal
│   ├── logistics/       → ShipmentTrackerPage, ComplianceVault
│   ├── servicetickets/  → TicketBoard, TicketDetailPage
│   ├── warranties/      → WarrantyListPage, WarrantyDetailPage
│   ├── subcontractors/  → PartnerDirectoryPage
│   ├── finance/         → P&LReport, CashFlowReport, ARAgingReport
│   └── admin/           → UserManagementPage, RolePermissionsPage
├── hooks/               → useAuth, usePagination, useInlineEdit, useCurrency
├── store/               → Zustand slices per module
├── types/               → TypeScript interfaces per module
└── utils/               → formatters, validators, constants
```

---

## Organisational Structure

Every transaction is tagged to an organisational unit (SAP-equivalent hierarchy):

```
CLIENT: EverX Global
│
├── COMPANY CODE: AU01 — EverX Pty Ltd (AUD)
│     ├── Plant: AU-WH01 — Northmead Warehouse
│     │     └── Storage Locations: BayA / BayB / Quarantine / Refurb
│     └── Sales Org: AU-SO01 — Australia Sales
│           └── Distribution Channels: DIRECT / DEALER / TENDER
│
├── COMPANY CODE: US01 — EverX USA LLC (USD)
│     ├── Plant: US-WH01 — California Warehouse
│     └── Sales Org: US-SO01 — North America Sales
│
└── COMPANY CODE: JP01 — EverX Japan KK (JPY)
      ├── Plant: JP-WH01 — Kawasaki Warehouse
      └── Sales Org: JP-SO01 — Asia Pacific Sales
```

Every transaction carries: **Company Code + Plant + Sales Org + Fiscal Year + Posting Period**.

---

## Module Reference

### CRM Layer (Phase 1)

#### 1. Contact & Account Management

Central database of customers, leads, suppliers, and dealers. An **Account** is the company; **Contacts** are individuals linked to an account.

**Contact Form Fields:**
- Basic: First Name*, Last Name*, Email*, Phone (country code), Mobile/WhatsApp, Job Title, Department, LinkedIn URL, Profile Photo
- Location: Country*, City, State, Address, Postal Code, Timezone (auto-suggest), Preferred Language
- CRM: Contact Type (Customer/Lead/Supplier/Dealer/Partner), Lead Source, Assigned Sales Rep, Region (APAC/EMEA/Americas/Middle East/South Asia), Tags, Notes
- Preferences: Preferred Contact Method, Do Not Contact toggle, Newsletter Subscription toggle

**Account Form Fields:**
- Company: Account Name*, Trading Name, Registration Number, ABN/VAT/Tax ID, Industry, Company Size, Annual Revenue, Website, Logo
- Financial: Currency, Payment Terms (Net 30/Net 60/LC/Advance/COD), Credit Limit, Rating (Cold/Warm/Hot)
- Linking: Account Type, Account Owner, Parent Account (for subsidiaries)

**Account Detail Page shows all linked data:** Contacts, Deals, Quotes, Invoices, Service Tickets, Equipment Purchased, Communication Timeline.

#### 2. Lead Management

| Field | Detail |
|---|---|
| Lead Source | Website / Trade Show / Referral / LinkedIn / Email Campaign / Phone Call / Walk-in |
| Equipment Interest | Multi-select: CT, MRI, Ultrasound, Cath Lab, Mammography, C-Arm, PET-CT, Parts |
| Budget Range | <$50K / $50K–$150K / $150K–$500K / $500K+ |
| Priority | Low / Medium / High / Urgent |
| Status Flow | New → Contacted → Qualified → Unqualified → **Converted** |

**Convert Lead** action simultaneously creates → **Contact** + **Account** + **Deal** (all pre-filled).

#### 3. Sales Pipeline

Visual Kanban board with drag-and-drop stage transitions:

```
Enquiry → Qualified → Quote Sent → Negotiation → Won / Lost
```

Each deal tracks: Deal Value, Currency, Probability %, Expected Close Date, Linked Equipment, Next Action + Date.

**On "Mark Won"** → prompts "Create Sales Order?" → pre-fills Sales Order form.
**On "Mark Lost"** → requires Loss Reason (Price / Competition / Budget / No Decision / Technical Fit / Other).

#### 4. Quote & Proposal Module

- Auto-generated quote number with versioning (revision auto-increment)
- Multi-currency support with live exchange rate (overridable)
- Line items: Equipment / Spare Part / Service / Freight — each with quantity, unit price, discount %, tax %
- Auto-calculated totals: Subtotal → Discount → Tax → Grand Total
- Status: Draft → Sent → Accepted → Rejected → Expired → Revised
- **"Convert to Sales Order"** passes all line items, customer, currency, and payment terms

#### 5. Trade Show & Event Tracking

Track events (Arab Health, RSNA, IRIA, etc.) with booth costs, travel costs, attending staff. Leads captured per event are auto-counted with ROI tracking (leads generated → deals → revenue attributed).

#### 6. Email & Activity Integration

- Two-way sync with Microsoft 365 / Outlook (Graph API)
- Auto-log emails against contacts and deals
- Log calls, meetings, tasks with calendar integration
- @mention support in notes for colleague tagging

---

### ERP Layer (Phase 2)

#### 7. Equipment Inventory Management

Each unit is a unique record with SAP Material Master-equivalent views:

| View | Fields |
|---|---|
| **Basic** | Equipment Number (auto), Category*, Manufacturer*, Model*, Serial Number* (unique), Year of Manufacture |
| **Sales** | Selling Price (per currency), Minimum Price Floor, Tax Classification |
| **Purchasing** | Acquisition Cost*, Currency, Date, Source (Supplier/Hospital/Auction/Dealer), Linked PO |
| **Warehouse** | Current Plant/Warehouse*, Storage Location, Equipment Status* |
| **Accounting** | Valuation Class, Standard/Moving Average Price, Last Revaluation Date |
| **Quality** | Condition Grade* (A–D), Last Inspection Date, Refurbishment Notes, Hours of Use |
| **Media** | Photos (up to 20), Documents (CE cert, service manual, test report) |

**Status Flow:**
```
Available → Reserved → In Refurbishment → In Transit → Sold → Scrapped
```

**Stock Transfer** between warehouses creates a transfer record, updates stock at both locations, and posts accounting entries (DR Stock in Transit / CR Inventory → reversed on receipt).

#### 8. Spare Parts Inventory

Separate catalogue for probes, coils, injectors, CR/DR systems with:
- Stock levels per warehouse + reorder points + lead times
- **Moving Average Price (MAP)** — auto-recalculates on every Goods Receipt
- Reorder alerts trigger automatic PO suggestions

#### 9. Purchase Order Management

| Status Flow | Draft → Pending Approval → Approved → Sent to Supplier → Partially Received → Fully Received |
|---|---|

**Approval Workflow (configurable thresholds):**
- < $10,000 AUD → Sales Manager approves
- $10K – $50K → Director approves
- \> $50K → Two-level: Director + Finance

**On "Receive Items"** → creates Equipment Master records (with serial numbers), increases inventory stock, prompts "Create supplier invoice?"

#### 10. Sales Order Management

Created from Quote (primary) or manually (admin only).

| Status Flow | Confirmed → Packing → Dispatched → In Transit → Delivered |
|---|---|

**On "Confirm Order"** auto-triggers:
- Availability check → reserves inventory
- Credit check against customer credit limit → blocks if exceeded
- Equipment status → Available to Reserved

**Linked actions:** Generate Invoice, Create Shipment, Create Warranty — each pre-fills the downstream form.

#### 11. Supplier Management

Supplier records with: name, country, type (Hospital/Dealer/Auction House/Manufacturer/Distributor), payment terms, bank details, categories supplied, performance rating (1–5 stars). Linked to purchase orders and parts catalogue.

---

### Finance & Accounting (Phase 2)

#### 12. Accounts Receivable

Invoice generated from Sales Order. Auto-populated line items editable before sending.

| Status Flow | Draft → Sent → Partially Paid → Paid → Overdue (auto) → Void |
|---|---|

- **Record Payment** → captures amount, date, method (Wire/LC/Cheque/Credit Card), reference
- **Credit Note** → reverses accounting entries
- **Overdue Scheduler** (`@Scheduled` daily) → auto-marks past-due invoices, alerts finance

**Accounting (auto-posted on invoice release):**
```
DR — Accounts Receivable (1100)    [gross amount]
CR — Revenue (4000)                [net amount]
CR — GST Collected (2100)          [tax amount]
```

#### 13. Accounts Payable

Created from PO receipt or manual entry. **3-Way Match** (PO quantity vs GR quantity vs Vendor Invoice) with tolerance checks:
- Within 5% variance → auto-post with price difference to GL
- Exceeds 5% → BLOCKED → Finance must manually release

#### 14. Multi-Currency Accounting

- Transactions recorded in local currency (AUD, USD, JPY)
- Daily exchange rate sync via API (Open Exchange Rates / ECB)
- **Foreign Currency Revaluation** (`@Scheduled` month-end):
  - Revalues open AR/AP items at current rate
  - Posts FX Gain/Loss entries
  - Auto-reversed first day of next month (standard SAP approach)
- Consolidated reporting in AUD (base currency)

#### 15. Multi-Entity Finance

Separate books per legal entity with:
- Intercompany transaction tracking
- GR/IR clearing account (goods receipt ≠ immediate AP — matched when vendor invoice arrives)
- Consolidated P&L, Balance Sheet, Cash Flow
- BAS/GST reporting (AU entity only)

#### 16. Payment Runs

Automatic vendor payment processing:
- Select all invoices due by date, filter by vendor/country
- Preview proposal before posting
- Manual exclusion per line
- Posts: DR Accounts Payable / CR Bank / DR or CR FX Gain/Loss

---

### Logistics & Compliance (Phase 3)

#### 17. Freight & Shipment Tracking

Created from Sales Order with pre-filled items and addresses.

| Status Flow | Preparing → Booked → In Transit → Customs Clearance → Out for Delivery → Delivered → Exception |
|---|---|

Fields: freight mode (Air/Sea/Road/Courier), carrier, tracking number, Incoterms, weight/volume, packages. Integration with DHL, FedEx, Toll freight APIs.

**Required Documents** (file upload): Commercial Invoice, Packing List, Bill of Lading/Airway Bill, Certificate of Origin, Export Permit, Insurance Certificate, Customs Declaration.

**On "Mark Delivered"** → updates SO status → confirms warranty start date → suggests installation ticket.

#### 18. Customs & Compliance Vault

Document types: CE Certificate, TGA Registration, FDA Clearance, Export Permit, ISO Certificate, Country Import Permit. Linked to equipment (by serial number) and shipments. **Expiry alert scheduler** checks daily, notifies configurable days before expiry (30/60/90).

---

### After-Sales Service (Phase 3)

#### 19. Service Ticket System

| Ticket Types | Service Request / Repair / Annual Safety Check / Installation / Remote Support / Warranty Claim |
|---|---|
| Priority Levels | Low / Medium / High / Critical |
| Status Flow | Open → In Progress → Awaiting Parts → Awaiting Customer → Resolved → Closed |

**On "Resolve"** → saves resolution notes, deducts parts from spare parts inventory, logs time, emails customer summary via MS365.

**"Check Warranty"** button auto-verifies if linked equipment is under active warranty.

#### 20. Warranty Tracking

Created from Sales Order (equipment serial + customer + sale date = warranty start). Types: Parts Only / Labour Only / Parts & Labour / Full Comprehensive.

**Alert Scheduler** (`@Scheduled` daily):
- 90 / 60 / 30 days before expiry → alerts sales rep
- On expiry → status → Expired, logged in audit

#### 21. Sub-contractor & Partner Management

Partner records with coverage countries, equipment types serviced, certifications, rate type (Fixed/Hourly/Day Rate), rating. Assigned to service tickets for field work.

---

### Reporting & Analytics (Phase 3)

#### Dashboard Widgets (live data)

| Widget | Source |
|---|---|
| Pipeline Value by Stage | Deal records |
| Revenue This Month | Paid AR Invoices |
| Outstanding Receivables | AR Invoice aging |
| Inventory by Warehouse | Equipment inventory |
| Open Service Tickets | Ticket module |
| Overdue POs | Purchase orders |
| Expiring Warranties (30 days) | Warranty records |
| Expiring Compliance Docs | Compliance vault |

#### Report Suite (SAP-equivalent)

| Category | Reports |
|---|---|
| **AR** | AR Aging (0–30/31–60/61–90/90+ days), Customer Statement, Days Sales Outstanding, Revenue by Customer |
| **AP** | AP Aging, Payment Forecast, Vendor Statement |
| **Inventory** | Stock Overview per Plant, Inventory Valuation at MAP, Slow-Moving Stock (>90 days), Stock Transfer History |
| **Financial** | P&L by Entity, Balance Sheet, Cash Flow, Consolidated P&L (AUD), Trial Balance, BAS/GST (AU01 only) |
| **Sales** | Sales by Rep, Sales by Region, Pipeline Value (weighted), Quote Conversion Rate, Trade Show ROI |

All reports support: date range + entity + rep + region + category filters, CSV export, PDF export, scheduled auto-email (daily/weekly/monthly).

---

### User & Access Management

#### Roles

| Role | Scope |
|---|---|
| **Admin** | Full access — all modules, user management, audit logs |
| **Sales Manager** | CRM + Pipeline + Quotes + approvals for team |
| **Sales Rep** | Own leads, deals, quotes, contacts |
| **Finance** | Invoices, Payments, AP, AR, Financial Reports |
| **Service Tech** | Service tickets, warranty lookup, parts |
| **Warehouse** | Inventory, stock transfers, goods receipt |
| **Read-Only** | View access only — no create/edit/delete |

#### Permission Matrix

Per-module toggles: **View / Create / Edit / Delete / Export / Approve**

Frontend: `<PermissionGuard role={['ADMIN','FINANCE']}><Button>Void</Button></PermissionGuard>`
Backend: `@PreAuthorize("hasAnyRole('ADMIN','FINANCE')")` on controller methods.

#### Permission Gates (key actions)

| Action | Minimum Role |
|---|---|
| Delete any record | Admin |
| Approve PO | Sales Manager / Admin |
| Void Invoice | Finance / Admin |
| Create User | Admin |
| Export Data | Finance / Manager / Admin |
| View Financial Reports | Finance / Admin |
| Assign Sub-contractor | Service Manager / Admin |
| Transfer Stock | Warehouse / Admin |

---

## End-to-End Process Flows

### Master Flow

```
LEAD → CONTACT/ACCOUNT → DEAL → QUOTE → SALES ORDER → INVOICE → PAYMENT
                                           ↓                ↓
                                      INVENTORY          SHIPMENT
                                           ↓                ↓
                                      WARRANTY       COMPLIANCE DOCS
                                           ↓
                                     SERVICE TICKET
```

### 1. Order-to-Cash (SAP SD Equivalent)

Every step creates a document. Every document references the previous (**Document Flow Chain** — visible and clickable on every record).

```
INQUIRY → QUOTATION → SALES ORDER → DELIVERY → GOODS ISSUE → INVOICE → PAYMENT
```

**Document Flow Example:**
```
[Inquiry INQ-2026-00001] → [Quotation QT-2026-00001] → [Sales Order SO-AU-2026-00001]
                                                                ↓
                                                    [Delivery DEL-2026-00001]
                                                                ↓
                                                    [Invoice INV-AU-2026-00001]
                                                                ↓
                                                    [Payment PAY-2026-00001 ✓]
```

| Step | SAP Equiv | Created From | Auto-Triggers |
|---|---|---|---|
| **Inquiry** | VA11 | Lead conversion or manual | — |
| **Quotation** | VA21 | Inquiry | Pricing procedure runs (gross → discounts → freight → tax → total) |
| **Sales Order** | VA01 | Quotation (accepted) | Availability check, credit check, inventory reservation |
| **Delivery** | VL01N | Sales Order | Pick → Pack → Post Goods Issue (inventory reduced, COGS posted) |
| **Invoice** | VF01 | Delivery / Sales Order | Accounting document auto-created (DR AR / CR Revenue / CR GST) |
| **Payment** | F-28 | Manual or bank import | Clears open AR item, posts FX gain/loss if applicable |

**Credit Check Logic (SAP FD32):**
```
Customer Credit Limit (BP master)
- Open AR Invoices (unpaid)
- Open Sales Orders (not yet invoiced)
= Available Credit

If Available Credit < New Order Value → ORDER BLOCKED
→ Finance notified → "Release Credit Block" after review
```

**Pricing Procedure (applied on every line item):**
```
Step 10 — PR00 — Gross Price
Step 20 — K007 — Customer Discount (%)
Step 30 — K008 — Trade Show Discount (%)
Step 40 — KF00 — Freight (fixed)
Step 50 — KI00 — Insurance (%)
Step 60 — Net Value (subtotal)
Step 70 — MWST — Tax (% on net)
Step 80 — Invoice Amount (total)
```

### 2. Procure-to-Pay (SAP MM Equivalent)

```
PURCHASE REQUISITION → PURCHASE ORDER → GOODS RECEIPT → INVOICE VERIFICATION → PAYMENT
```

| Step | SAP Equiv | Auto-Triggers |
|---|---|---|
| **Purchase Requisition** | ME51N | Approval workflow based on amount threshold |
| **Purchase Order** | ME21N | Notification to supplier, approval chain |
| **Goods Receipt** | MIGO | Equipment Master created (serial number), stock increased, accounting: DR Inventory / CR GR/IR Clearing |
| **Invoice Verification** | MIRO | 3-way match (PO ↔ GR ↔ Invoice), tolerance check, accounting: DR GR/IR Clearing / CR Accounts Payable |
| **Vendor Payment** | F110 | Payment run clears AP, posts: DR AP / CR Bank / DR or CR FX |

**GR/IR Clearing Account (critical SAP concept):**
```
On Goods Receipt:     DR Inventory (1200) / CR GR/IR Clearing (2050)
On Invoice Verified:  DR GR/IR Clearing (2050) / CR Accounts Payable (2000)
→ AP only created when invoice arrives, matched to GR
```

### 3. Inventory Lifecycle (SAP MM/WM Equivalent)

**Stock Types per Plant + Storage Location:**

| Type | Description |
|---|---|
| UNRESTRICTED | Available to sell / reserve |
| RESERVED | Committed to a sales order |
| IN REFURBISHMENT | Quality/refurb work in progress |
| IN TRANSIT | Between plants or to customer |
| BLOCKED | Hold — quality issue |
| SOLD | Ownership transferred |
| SCRAPPED | Written off |

**Stock Transfer Order (STO):**
```
On Goods Issue (supplying plant):   DR Stock in Transit (1210) / CR Inventory (1200)
On Goods Receipt (receiving plant):  DR Inventory (1200) / CR Stock in Transit (1210)
```

**Moving Average Price (spare parts) — recalculated on every GR:**
```
Current: 5 probes @ $1,000 = $5,000
Receipt: 3 probes @ $1,200 = $3,600
New MAP = ($5,000 + $3,600) / 8 = $1,075 per probe
```

### 4. Service & Warranty Lifecycle

```
Equipment Delivered → Warranty Created → Service Ticket Raised → Parts Ordered → Resolved → Closed
                                              ↓
                                    Check Warranty (auto) → In Warranty? → No charge / Billable
```

---

## Master Data Model

### Business Partner (SAP BP — unified entity)

One record, multiple roles. A hospital can be both **customer** (buying) and **vendor** (selling old equipment) — no duplicates.

| Role | Purpose |
|---|---|
| **SOLD-TO** | Customer placing the order |
| **SHIP-TO** | Delivery address (can differ) |
| **BILL-TO** | Invoicing address (can differ) |
| **PAYER** | Who pays (can be parent company) |
| **VENDOR** | Supplier/creditor role |
| **PROSPECT** | Pre-sales / CRM only |

### Equipment Master (SAP Material Master — views)

| View | Purpose |
|---|---|
| Basic | Identity — number, category, make, model, serial |
| Sales | Selling price per currency, tax classification |
| Purchasing | Acquisition cost, preferred vendor |
| Warehouse | Current plant, status, storage location |
| Accounting | Valuation class, MAP price |
| Quality | Condition grade, certifications |

---

## Financial Accounting Engine

### Chart of Accounts

```
ASSETS
  1000 — Cash & Bank (AUD)
  1001 — Cash & Bank (USD)
  1002 — Cash & Bank (JPY)
  1100 — Accounts Receivable (Trade)
  1200 — Inventory — Equipment Stock
  1201 — Inventory — Spare Parts
  1210 — Stock in Transit
  1300 — Prepayments to Vendors

LIABILITIES
  2000 — Accounts Payable (Trade)
  2050 — GR/IR Clearing
  2100 — GST Collected
  2101 — GST Paid (Input Tax)
  2200 — Accrued Expenses

REVENUE
  4000 — Equipment Sales Revenue
  4001 — Spare Parts Revenue
  4002 — Service Revenue
  4003 — Freight & Handling Revenue

COST OF GOODS SOLD
  5000 — Cost of Equipment Sold
  5001 — Cost of Parts Sold
  5002 — Refurbishment Costs
  5003 — Freight In
  5010 — Purchase Price Variance

OPERATING EXPENSES
  6000 — Salaries & Wages
  6100 — Rent & Occupancy
  6200 — Travel & Trade Shows
  6300 — Marketing
  6400 — IT & Software

OTHER
  7000 — FX Gain
  7001 — FX Loss
  8000 — Intercompany Revenue
  8001 — Intercompany Expense
```

### Automatic Account Determination (SAP OBYC)

Configuration-driven — no hardcoded GL accounts:

```
Transaction Key + Valuation Class + Company Code → GL Account

BSX + EQUIP + AU01 → GL 1200 (Equipment Inventory)
BSX + PARTS + AU01 → GL 1201 (Parts Inventory)
GBB + EQUIP + AU01 → GL 5000 (Cost of Equipment Sold)
GBB + PARTS + AU01 → GL 5001 (Cost of Parts Sold)
PRD + EQUIP + AU01 → GL 5010 (Purchase Price Variance)
```

### Month-End Closing Checklist

1. Post all recurring entries (rent, depreciation)
2. Revalue open foreign currency items (AR + AP + bank) → FX Gain/Loss posted
3. GR/IR clearing reconciliation
4. Reconcile AR subledger to GL 1100
5. Reconcile AP subledger to GL 2000
6. Reconcile inventory subledger to GL 1200
7. Run BAS/GST report (AU01 only)
8. Close posting period (lock prior month)
9. Generate P&L, Balance Sheet, Cash Flow per entity
10. Run intercompany reconciliation
11. Generate consolidated financials (AUD)

### Cost Centre & Profit Centre (Phase 3)

```
Cost Centres:                    Profit Centres:
  CC-AU-SALES                     PC-CT (CT Scanner business)
  CC-AU-WH                        PC-MRI
  CC-US-SALES                     PC-ULTRASOUND
  CC-JP-SALES                     PC-PARTS
  CC-GLOBAL-IT                    PC-SERVICE
```

Every revenue and cost line tagged to Profit Centre → P&L per product line.

---

## Database Schema

Multi-schema PostgreSQL design:

| Schema | Tables |
|---|---|
| **everx_auth** | Users, roles, permissions, audit logs |
| **everx_crm** | Business partners, contacts, leads, deals, quotes, activities, trade shows |
| **everx_erp** | Equipment master, spare parts, sales documents (inquiry/quotation/SO), delivery documents, purchase orders, goods receipts, shipments, service tickets, warranties |
| **everx_finance** | Accounting documents, accounting line items, GL accounts, invoices, payments, currency rates, account determination config, pricing procedures, number ranges |

### Key Entity Relationships

```
business_partner (BP roles: SOLD-TO / SHIP-TO / BILL-TO / VENDOR / PROSPECT)
    ↕
sales_document (doc_type: INQUIRY / QUOTATION / SALES_ORDER)
    → sales_document_item → equipment_master (serial number link)
    → reference_doc_id (FK → self — document chain)
    ↕
delivery_document → delivery_item → equipment_master
    ↕
accounting_document → accounting_line_item → gl_account
    ↕
purchase_order → goods_receipt → equipment_master (created on receipt)
    ↕
service_ticket → equipment_master + warranty + business_partner
    ↕
audit_log (entity_type + entity_id + field + old/new value + user + timestamp)
```

### Number Ranges (SAP NR)

Each document type per company code gets its own auto-incrementing range:

```
INQ-2026-00001    QT-2026-00001     SO-AU-2026-00001
PO-JP-2026-00001  GR-2026-00001    INV-AU-2026-00001
DEL-2026-00001    PAY-2026-00001   STO-2026-00001
```

### Workflow Engine

Configurable approval workflows with escalation:

```
workflow_definition → workflow_step (ordered, per role/threshold)
                   → workflow_instance (running approval: PENDING/APPROVED/REJECTED/ESCALATED)
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login with email/password → returns JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Logout / invalidate token |

### Standard Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "errors": null,
  "timestamp": "2026-04-08T10:30:00"
}
```

All endpoints require `Bearer` token authentication except login/refresh. Pagination on all list endpoints (default 20 items/page). Full OpenAPI docs at `/api/swagger-ui.html`.

---

## Security

| Feature | Detail |
|---|---|
| JWT tokens | 15-min access token, 7-day refresh token |
| Password hashing | BCrypt (strength 12) |
| RBAC | 7 roles with per-module permission matrix |
| Soft deletes | Data integrity — no hard deletes |
| CORS | Configured for frontend origin only |
| Rate limiting | Auth endpoints |
| 2FA | Optional per-user (enable/disable) |
| Audit trail | Every field change logged — never deletable |
| Locked fields | Invoice amount after payment, serial number after sale — override requires admin + reason |

---

## Getting Started

### Prerequisites
- Java 21 LTS
- Node.js 20+
- PostgreSQL 16
- Redis (optional — for caching)

### Demo Credentials
```
Email:    admin@everx.com
Password: password123
```

### Backend
```bash
cd backend
mvn clean package
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DB_URL=jdbc:postgresql://localhost:5432/everx
DB_USER=everx_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your-secret-key-minimum-256-bits
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USERNAME=your-email@office365.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@everx.com
S3_BUCKET=everx-documents
S3_KEY=your-aws-access-key
S3_SECRET=your-aws-secret-key
SPRING_PROFILES_ACTIVE=dev
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:8080/api
```

---

## Deployment

### CI/CD Pipeline (GitHub Actions)

1. **Backend**: Lint → Unit Tests → Integration Tests → Build JAR
2. **Frontend**: Lint → Type Check → Build Bundle
3. **Deploy**: Auto-deploy to staging on `develop` branch, production on `main` (manual approval required)

### Environments
- **Staging**: Auto-deploys from `develop` branch
- **Production**: Manual approval from `main` branch

---

## Documentation Index

Project documents were reorganized for maintainability. Use the index below to find guides quickly:

- `docs/README.md` — full document map
- `docs/getting-started/` — setup and startup references
- `docs/guides/` — implementation and usage guides
- `docs/reports/` — verification, fixes, and delivery reports
- `docs/product/` — product planning and enhancement notes
- `docs/prompts/` — development prompt artifacts

---

## Cross-Module Notification Map

Every status change triggers a notification (in-app bell icon + email via MS365):

| Trigger | Notifies |
|---|---|
| Deal → Won | Sales Manager |
| Invoice → Overdue | Finance + Account Owner |
| Warranty → Expiring | Sales Rep (account owner) |
| PO → Pending Approval | Approving Manager |
| Ticket → Critical | Service Manager |
| Stock → Below Reorder | Warehouse Manager |
| Compliance Doc → Expiring | Logistics/Compliance User |
| Shipment → Delivered | Sales Rep + Customer (email) |
| Payment → Received | Sales Rep |

---

## Global UI Patterns

These interaction patterns are consistent across every module:

| Pattern | Behaviour |
|---|---|
| **Inline Edit** | Click any field → edit in place → Enter to save, Escape to cancel. Pencil icon on hover. |
| **Bulk Edit** | Checkbox selection → top bar with: Assign To / Change Status / Add Tag / Export / Delete (confirmation modal) |
| **Record Edit** | Slide-over panel or modal (not separate page). Unsaved changes warning on navigate away. |
| **Audit Log** | Every save → background log: field, old value, new value, user, timestamp. Collapsible "History" tab on every record. |
| **Document Uploader** | Drag-and-drop + browse. Supports PDF, JPG, PNG, DOCX, XLSX. Max 25MB. Progress bar. |
| **Currency Input** | Number field with currency prefix. Shows AUD equivalent in small grey text below. |
| **Status Badge** | Coloured pill → click opens dropdown of valid next statuses only (workflow-aware). |
| **Linked Record Search** | Type-ahead search across related records. Mini-card preview on hover. |
| **Comment / Note Box** | Rich text with @mention support. Timestamped. Cannot delete — only retract. |
| **Document Flow Chain** | SAP-style clickable chain at top of every document. Green = complete, Blue = in progress, Grey = not yet created. |

---

## Integrations

| Integration | Purpose | Phase |
|---|---|---|
| Microsoft 365 Graph API | Email sync, calendar, notifications | 1 |
| WooCommerce REST API | Inventory sync to website | 2 |
| Open Exchange Rates / ECB | Daily currency rate sync | 2 |
| DHL / FedEx / Toll API | Shipment tracking | 3 |
| DocuSign API | E-signature on contracts | 3 |
| AWS S3 / Azure Blob | Document storage | 1 |

---

## Performance Considerations

- Pagination on all list endpoints (default 20/page)
- HikariCP database connection pooling
- Lazy loading for large entity relationships
- Indexed frequently queried columns
- React Query caching with background refetch
- S3 pre-signed URLs for file uploads
- Redis caching for exchange rates and dashboard aggregates

---

## License

**Proprietary** — EverX Pty Ltd. All rights reserved.

## Version

**v1.0.0** — Phase 1 Foundation

---

*Last Updated: April 10, 2026*
]]>
