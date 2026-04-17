# EverX ERP + CRM — AI Development Prompt

> **Purpose:** This document is a structured, AI-feedable prompt for building the EverX ERP+CRM platform. Feed this to an AI coding assistant (GitHub Copilot, Claude, GPT, etc.) phase-by-phase to get implementation code. Each phase is self-contained with exact specifications, data models, API contracts, UI requirements, and acceptance criteria.

---

## PROJECT IDENTITY

- **Name:** EverX ERP + CRM Platform
- **Domain:** Global used & refurbished medical imaging equipment trading (CT, MRI, Ultrasound, Cath Lab, Mammography, C-Arm, PET-CT)
- **Company:** EverX Pty Ltd — offices in Australia (Northmead), USA (California), Japan (Kawasaki)
- **Legal Entities:** EverX Pty Ltd (AU, AUD), EverX USA LLC (US, USD), EverX Japan KK (JP, JPY)
- **Users:** ~15 (Sales, Finance, Warehouse, Service, Admin)
- **Base Currency:** AUD — all consolidated reporting in AUD
- **Supported Currencies:** AUD, USD, JPY, EUR, INR

---

## TECH STACK (Non-Negotiable)

| Layer | Technology | Version |
|---|---|---|
| Backend Runtime | Java LTS | 21 |
| Backend Framework | Spring Boot | 3.3.x |
| ORM | Spring Data JPA + Hibernate | Latest stable |
| Database | PostgreSQL (multi-schema) | 16 |
| Cache | Redis | Latest stable |
| Auth | Spring Security 6 + JWT + OAuth2 | — |
| API Style | REST with OpenAPI 3 / Swagger | — |
| DB Migrations | Flyway | Latest stable |
| Frontend | React + TypeScript + Vite | React 18, Vite 5 |
| Server State | TanStack React Query | v5 |
| Client State | Zustand | Latest |
| Forms | React Hook Form + Zod | Latest |
| UI Components | Tailwind CSS + shadcn/ui | Latest |
| Charts | Recharts or ECharts | Latest |
| Drag & Drop | @dnd-kit | Latest |
| File Storage | AWS S3 or Azure Blob | — |
| CI/CD | GitHub Actions | — |
| Deployment | Docker + Kubernetes (or AWS ECS) | — |

---

## ARCHITECTURE RULES

### Backend — Modular Monolith

```
Controller (REST endpoints — thin, validation only)
    ↓
Service (business logic + ApplicationEvent publishing)
    ↓
Repository (Spring Data JPA interfaces)
    ↓
Entity (JPA models with @EntityListeners(AuditingEntityListener.class))
```

**Mandatory patterns:**
1. Every entity extends a `BaseAuditEntity` with `createdBy`, `createdAt`, `updatedBy`, `updatedAt` — auto-populated via `AuditingEntityListener`.
2. Soft deletes only — `deleted` boolean flag + `deletedAt` timestamp. Never hard-delete.
3. `@PreAuthorize` role-based method security on every controller method.
4. Entity-level filtering by `companyCode` / `officeCode` where applicable.
5. `ApplicationEventPublisher` for downstream side-effects (e.g., deal won → create sales order prompt).
6. `@Scheduled` jobs for: warranty expiry alerts, FX rate sync, overdue invoice checks, reorder alerts.
7. Flyway migrations — every schema change is a versioned SQL file.
8. Global exception handler returning standardized error responses.
9. Number range service for auto-generating document numbers (e.g., `SO-AU-2026-00001`).

### Backend Package Structure

```
com.everx
├── config/              → SecurityConfig, CorsConfig, JpaConfig, SwaggerConfig
├── auth/                → JWT provider, UserDetailsService, Role/Permission entities
├── crm/
│   ├── contact/         → Controller, Service, Repository, Entity, DTO
│   ├── lead/            → Controller, Service, ConvertService, Repository, Entity, DTO
│   ├── account/         → Controller, Service, Repository, Entity, DTO
│   ├── deal/            → Controller, Service, Repository, Entity, DTO, StageEnum
│   ├── quote/           → Controller, Service, Repository, Entity, DTO, QuoteLineItem
│   ├── tradeshow/       → Controller, Service, Repository, Entity, DTO
│   └── activity/        → Controller, Service, Repository, Entity, DTO
├── erp/
│   ├── equipment/       → Controller, Service, Repository, Entity, DTO
│   ├── inventory/       → InventoryService, StockTransferService
│   ├── spareparts/      → Controller, Service, Repository, ReorderAlertService
│   ├── purchaseorder/   → Controller, Service, Repository, ApprovalWorkflow
│   ├── salesorder/      → Controller, Service, Repository, FulfilmentService
│   ├── suppliers/       → Controller, Service, Repository, Entity, DTO
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
├── App.tsx              → Router, AuthProvider, ThemeProvider, Toaster
├── api/                 → Axios instance (with JWT refresh interceptor), per-module API services
├── components/
│   ├── layout/          → MainLayout, Sidebar, TopBar
│   ├── ui/              → shadcn/ui components (Button, Input, Select, Modal, Table, Badge, etc.)
│   ├── form/            → InlineEdit, BulkEditBar, AuditLog, FieldLockIndicator
│   └── shared/          → CurrencyDisplay, StatusBadge, DocumentUploader, DocumentFlowChain, PermissionGuard
├── pages/               → One folder per module, each with ListPage + DetailPage
├── hooks/               → useAuth, usePagination, useInlineEdit, useCurrency
├── store/               → Zustand slices per module
├── types/               → TypeScript interfaces per module
└── utils/               → formatters, validators, constants
```

### Database — Multi-Schema PostgreSQL

| Schema | Purpose |
|---|---|
| `everx_auth` | Users, roles, permissions, refresh tokens, audit logs |
| `everx_crm` | Accounts, contacts, leads, deals, quotes, activities, trade shows |
| `everx_erp` | Equipment, spare parts, POs, SOs, deliveries, shipments, service tickets, warranties, suppliers, subcontractors |
| `everx_finance` | GL accounts, invoices, payments, currency rates, accounting documents, pricing procedures, number ranges |

### Standard API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "errors": null,
  "timestamp": "2026-04-08T10:30:00"
}
```

All list endpoints return paginated responses. Default page size: 20.

### Security Baseline

- JWT: 15-min access token, 7-day refresh token (configurable via `application.yml`)
- Password hashing: BCrypt (strength 12)
- RBAC: 7 roles (Admin, Sales Manager, Sales Rep, Finance, Service Tech, Warehouse, Read-Only)
- Per-module permissions: View / Create / Edit / Delete / Export / Approve
- CORS: frontend origin only
- Rate limiting on auth endpoints
- Audit trail on every entity — field-level change tracking

---

## ORGANISATIONAL STRUCTURE (Tag Every Transaction)

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

## ROLES & PERMISSIONS MATRIX

| Role | CRM | Inventory | POs | SOs | Finance | Service | Warehouse | Admin |
|---|---|---|---|---|---|---|---|---|
| Admin | Full | Full | Full | Full | Full | Full | Full | Full |
| Sales Manager | Full | View | Approve | Full | View | View | View | — |
| Sales Rep | Own records | View | — | Own | — | — | — | — |
| Finance | View | View | View | View | Full | View | — | — |
| Service Tech | View | View | — | — | — | Full | — | — |
| Warehouse | — | Full | View | View | — | — | Full | — |
| Read-Only | View | View | View | View | View | View | View | — |

**Critical permission gates:**

| Action | Minimum Role |
|---|---|
| Delete any record | Admin |
| Approve PO | Sales Manager / Admin |
| Void Invoice | Finance / Admin |
| Create User | Admin |
| Export Data | Finance / Manager / Admin |
| View Financial Reports | Finance / Admin |
| Transfer Stock | Warehouse / Admin |

---

# PHASE 0 — FOUNDATION & SCAFFOLDING

**Timeline:** Week 1-2
**Goal:** Project skeleton, auth system, database schemas, CI/CD pipeline.

## Tasks

### 0.1 — Project Scaffolding

**Backend:**
- Initialize Spring Boot 3.3.x project with dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-validation, postgresql driver, flyway-core, jjwt, springdoc-openapi, lombok
- Configure multi-profile `application.yml` (dev, test, prod)
- Set up HikariCP connection pooling
- Configure Flyway with multi-schema support

**Frontend:**
- Initialize Vite + React 18 + TypeScript project
- Install: tailwindcss, @tanstack/react-query, zustand, react-hook-form, zod, axios, sonner (toasts), react-router-dom, lucide-react (icons)
- Set up shadcn/ui components
- Configure Axios instance with JWT interceptor (shared refresh promise pattern to prevent race conditions)
- Set up Zustand auth store with localStorage persistence

### 0.2 — Database Schema Foundation (Flyway Migrations)

Create versioned Flyway migrations:

```sql
-- V1__auth_schema.sql
CREATE SCHEMA IF NOT EXISTS everx_auth;

CREATE TABLE everx_auth.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,  -- ADMIN, SALES_MANAGER, SALES_REP, FINANCE, SERVICE_TECH, WAREHOUSE, READ_ONLY
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_auth.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id BIGINT REFERENCES everx_auth.roles(id),
    company_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_auth.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES everx_auth.users(id),
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_auth.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,  -- CREATE, UPDATE, DELETE
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    user_id BIGINT REFERENCES everx_auth.users(id),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

```sql
-- V2__crm_schema.sql
CREATE SCHEMA IF NOT EXISTS everx_crm;

CREATE TABLE everx_crm.accounts (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    account_type VARCHAR(50),  -- CUSTOMER, SUPPLIER, DEALER, PARTNER, PROSPECT
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'AUD',
    payment_terms VARCHAR(50),  -- NET_30, NET_60, LC, ADVANCE, COD
    credit_limit DECIMAL(15,2),
    rating VARCHAR(20),  -- COLD, WARM, HOT
    country VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    owner_id BIGINT REFERENCES everx_auth.users(id),
    parent_account_id BIGINT REFERENCES everx_crm.accounts(id),
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.contacts (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    job_title VARCHAR(100),
    department VARCHAR(100),
    linkedin_url VARCHAR(255),
    contact_type VARCHAR(50),  -- CUSTOMER, LEAD, SUPPLIER, DEALER, PARTNER
    lead_source VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    timezone VARCHAR(50),
    preferred_language VARCHAR(20),
    preferred_contact_method VARCHAR(30),
    do_not_contact BOOLEAN DEFAULT false,
    newsletter_subscription BOOLEAN DEFAULT false,
    region VARCHAR(50),  -- APAC, EMEA, AMERICAS, MIDDLE_EAST, SOUTH_ASIA
    tags TEXT,
    notes TEXT,
    account_id BIGINT REFERENCES everx_crm.accounts(id),
    assigned_rep_id BIGINT REFERENCES everx_auth.users(id),
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.leads (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    lead_source VARCHAR(50),  -- WEBSITE, TRADE_SHOW, REFERRAL, LINKEDIN, EMAIL_CAMPAIGN, PHONE_CALL, WALK_IN
    equipment_interest TEXT,   -- JSON array: ["CT","MRI","Ultrasound"]
    budget_range VARCHAR(50),  -- UNDER_50K, 50K_150K, 150K_500K, OVER_500K
    priority VARCHAR(20),      -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(30),        -- NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED
    country VARCHAR(100),
    region VARCHAR(50),
    notes TEXT,
    assigned_rep_id BIGINT REFERENCES everx_auth.users(id),
    trade_show_id BIGINT,
    converted_contact_id BIGINT,
    converted_account_id BIGINT,
    converted_deal_id BIGINT,
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.deals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    deal_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'AUD',
    stage VARCHAR(50),         -- ENQUIRY, QUALIFIED, QUOTE_SENT, NEGOTIATION, WON, LOST
    probability INTEGER,       -- 0-100
    expected_close_date DATE,
    actual_close_date DATE,
    loss_reason VARCHAR(100),  -- PRICE, COMPETITION, BUDGET, NO_DECISION, TECHNICAL_FIT, OTHER
    loss_notes TEXT,
    next_action TEXT,
    next_action_date DATE,
    account_id BIGINT REFERENCES everx_crm.accounts(id),
    contact_id BIGINT REFERENCES everx_crm.contacts(id),
    assigned_rep_id BIGINT REFERENCES everx_auth.users(id),
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    revision INTEGER DEFAULT 1,
    status VARCHAR(30),        -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, REVISED
    currency VARCHAR(3) DEFAULT 'AUD',
    exchange_rate DECIMAL(15,6) DEFAULT 1.0,
    subtotal DECIMAL(15,2),
    discount_total DECIMAL(15,2) DEFAULT 0,
    tax_total DECIMAL(15,2) DEFAULT 0,
    grand_total DECIMAL(15,2),
    valid_until DATE,
    terms_and_conditions TEXT,
    notes TEXT,
    deal_id BIGINT REFERENCES everx_crm.deals(id),
    account_id BIGINT REFERENCES everx_crm.accounts(id),
    contact_id BIGINT REFERENCES everx_crm.contacts(id),
    created_by_id BIGINT REFERENCES everx_auth.users(id),
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.quote_line_items (
    id BIGSERIAL PRIMARY KEY,
    quote_id BIGINT REFERENCES everx_crm.quotes(id) ON DELETE CASCADE,
    item_type VARCHAR(30),     -- EQUIPMENT, SPARE_PART, SERVICE, FREIGHT
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2),
    equipment_id BIGINT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE everx_crm.activities (
    id BIGSERIAL PRIMARY KEY,
    activity_type VARCHAR(30),  -- CALL, EMAIL, MEETING, TASK, NOTE
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    contact_id BIGINT REFERENCES everx_crm.contacts(id),
    account_id BIGINT REFERENCES everx_crm.accounts(id),
    deal_id BIGINT REFERENCES everx_crm.deals(id),
    lead_id BIGINT REFERENCES everx_crm.leads(id),
    assigned_to_id BIGINT REFERENCES everx_auth.users(id),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE everx_crm.trade_shows (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    start_date DATE,
    end_date DATE,
    booth_cost DECIMAL(15,2),
    travel_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    attending_staff TEXT,       -- JSON array of user IDs
    leads_generated INTEGER DEFAULT 0,
    deals_attributed INTEGER DEFAULT 0,
    revenue_attributed DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    company_code VARCHAR(10),
    deleted BOOLEAN DEFAULT false,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 0.3 — Authentication System

**Backend implementation:**

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Email + password → JWT access + refresh tokens | Public |
| `/api/v1/auth/refresh` | POST | Refresh token → new access token | Public |
| `/api/v1/auth/logout` | POST | Revoke refresh token | Authenticated |
| `/api/v1/auth/me` | GET | Current user profile | Authenticated |
| `/api/v1/auth/health` | GET | Health check | Public |

**Login request/response:**
```json
// POST /api/v1/auth/login
// Request:
{ "email": "admin@everx.com", "password": "password123" }

// Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "abc...",
    "user": {
      "id": 1,
      "email": "admin@everx.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "companyCode": "AU01"
    }
  }
}
```

**Frontend implementation:**
- Login page with email/password form (React Hook Form + Zod validation)
- Zustand auth store persisted to localStorage: `{ user, accessToken, refreshToken, isAuthenticated }`
- Axios interceptor: attach `Authorization: Bearer <token>` to every request
- Axios response interceptor: on 401, use shared refresh promise pattern (single concurrent refresh, queue other failed requests)
- Protected route wrapper: redirect to `/login` if not authenticated

**Seed data (Flyway migration):**

| Email | Password | Role | Company |
|---|---|---|---|
| admin@everx.com | password123 | ADMIN | AU01 |
| sales.manager@everx.com | password123 | SALES_MANAGER | AU01 |
| sales.rep@everx.com | password123 | SALES_REP | AU01 |
| finance@everx.com | password123 | FINANCE | AU01 |
| warehouse@everx.com | password123 | WAREHOUSE | AU01 |
| service@everx.com | password123 | SERVICE_TECH | AU01 |

### 0.4 — Layout & Navigation Shell

**Sidebar navigation (role-aware):**

```
Dashboard
─── CRM
    ├── Contacts
    ├── Accounts
    ├── Leads
    ├── Deals (Pipeline)
    ├── Quotes
    ├── Trade Shows
    └── Activities
─── ERP (Phase 2)
    ├── Equipment
    ├── Spare Parts
    ├── Purchase Orders
    ├── Sales Orders
    ├── Suppliers
    └── Shipments
─── Finance (Phase 2)
    ├── Invoices
    ├── Payments
    ├── Currency Rates
    └── Reports
─── Service (Phase 3)
    ├── Service Tickets
    ├── Warranties
    └── Subcontractors
─── Admin
    ├── User Management
    └── Audit Log
```

- Collapsible sidebar with icons
- Top bar with user avatar, company code badge, notification bell
- `<PermissionGuard>` component wrapping navigation items based on role
- Responsive: sidebar collapses to icon-only on mobile

### Acceptance Criteria — Phase 0
- [ ] `mvn spring-boot:run` starts backend on port 8080
- [ ] `npm run dev` starts frontend on port 5173
- [ ] Flyway runs all migrations successfully, creates all schemas and tables
- [ ] Login with `admin@everx.com / password123` returns JWT tokens
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Sidebar renders with correct navigation structure
- [ ] Swagger UI accessible at `/api/swagger-ui.html`

---

# PHASE 1 — CRM CORE

**Timeline:** Months 1-4
**Goal:** Full CRM functionality — Contacts, Accounts, Leads, Deals pipeline, Quotes, Trade Shows, Activities.

---

## Phase 1A — Contact & Account Management

### 1A.1 — Account CRUD

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/accounts` | List accounts (paginated, searchable, filterable) |
| GET | `/api/v1/crm/accounts/{id}` | Get account detail with linked contacts, deals, quotes |
| POST | `/api/v1/crm/accounts` | Create account |
| PUT | `/api/v1/crm/accounts/{id}` | Update account |
| DELETE | `/api/v1/crm/accounts/{id}` | Soft-delete account (Admin only) |

**Create/Update Account DTO fields:**
```
companyName* (required), tradingName, accountType (CUSTOMER|SUPPLIER|DEALER|PARTNER|PROSPECT),
registrationNumber, taxId, industry, companySize, website,
currency, paymentTerms (NET_30|NET_60|LC|ADVANCE|COD), creditLimit, rating (COLD|WARM|HOT),
country, city, state, address, postalCode, phone, email, notes,
ownerId, parentAccountId, companyCode
```

**Account List Page UI:**
- Table: Company Name, Type, Country, Rating (colored badge), Phone, Owner, Created
- Search bar (searches companyName, email, phone)
- Filters: Account Type, Rating, Country
- Bulk actions: Assign Owner, Export CSV
- Click row → Account Detail Page

**Account Detail Page UI:**
- Header: Company name, type badge, rating badge, edit button
- Tabs: Details | Contacts | Deals | Quotes | Invoices | Activities | History
- Details tab: Form with all account fields (inline-editable)
- Contacts tab: Table of linked contacts with "Add Contact" button
- Deals tab: Table of linked deals
- History tab: Audit log (field, old value, new value, user, timestamp)

### 1A.2 — Contact CRUD

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/contacts` | List contacts (paginated, searchable) |
| GET | `/api/v1/crm/contacts/{id}` | Get contact detail |
| POST | `/api/v1/crm/contacts` | Create contact |
| PUT | `/api/v1/crm/contacts/{id}` | Update contact |
| DELETE | `/api/v1/crm/contacts/{id}` | Soft-delete (Admin only) |

**Create/Update Contact DTO fields:**
```
firstName* (required), lastName* (required), email, phone, mobile,
jobTitle, department, linkedinUrl,
contactType (CUSTOMER|LEAD|SUPPLIER|DEALER|PARTNER), leadSource,
country, city, state, address, postalCode, timezone, preferredLanguage,
preferredContactMethod, doNotContact, newsletterSubscription,
region (APAC|EMEA|AMERICAS|MIDDLE_EAST|SOUTH_ASIA), tags, notes,
accountId, assignedRepId, companyCode
```

**Contact List Page UI:**
- Table: Name, Email, Phone, Job Title, Account (linked), Region, Assigned Rep
- Search + filter by account, region, contact type

**Contact Detail Page UI:**
- Header: Full name, job title, account link
- Tabs: Details | Activities | Deals | History
- "Send Email" button, "Log Call" button, "Schedule Meeting" button

---

## Phase 1B — Lead Management

### 1B.1 — Lead CRUD + Pipeline

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/leads` | List leads (paginated, filterable by status/priority/source) |
| GET | `/api/v1/crm/leads/{id}` | Get lead detail |
| POST | `/api/v1/crm/leads` | Create lead |
| PUT | `/api/v1/crm/leads/{id}` | Update lead |
| POST | `/api/v1/crm/leads/{id}/convert` | Convert lead → Contact + Account + Deal |
| DELETE | `/api/v1/crm/leads/{id}` | Soft-delete (Admin only) |

**Lead fields:**
```
firstName*, lastName*, email, phone, companyName, jobTitle,
leadSource (WEBSITE|TRADE_SHOW|REFERRAL|LINKEDIN|EMAIL_CAMPAIGN|PHONE_CALL|WALK_IN),
equipmentInterest (multi-select: CT, MRI, Ultrasound, Cath Lab, Mammography, C-Arm, PET-CT, Parts),
budgetRange (UNDER_50K|50K_150K|150K_500K|OVER_500K),
priority (LOW|MEDIUM|HIGH|URGENT),
status (NEW|CONTACTED|QUALIFIED|UNQUALIFIED|CONVERTED),
country, region, notes, assignedRepId, tradeShowId
```

**Lead Status Flow:** `New → Contacted → Qualified → Unqualified` or `Qualified → Converted`

**Convert Lead logic (backend service):**
1. Create Contact from lead data (firstName, lastName, email, phone, jobTitle)
2. Create Account from lead data (companyName)
3. Create Deal linking contact + account (pre-fill equipment interest, budget as deal value estimate)
4. Update lead: status = CONVERTED, store `convertedContactId`, `convertedAccountId`, `convertedDealId`
5. Return all three created entity IDs

**Lead List Page UI:**
- Table: Name, Company, Source (badge), Priority (colored badge), Status (colored badge), Equipment Interest (tags), Assigned Rep, Created
- Filters: Status, Priority, Source, Date Range
- "Convert" button visible on Qualified leads

**Lead Detail Page UI:**
- Form with all lead fields
- "Convert to Contact + Account + Deal" button (only if status = QUALIFIED)
- Activity timeline

---

## Phase 1C — Sales Pipeline (Deals)

### 1C.1 — Deal CRUD + Kanban Board

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/deals` | List deals (paginated, filterable by stage/rep/account) |
| GET | `/api/v1/crm/deals/{id}` | Get deal detail |
| POST | `/api/v1/crm/deals` | Create deal |
| PUT | `/api/v1/crm/deals/{id}` | Update deal (including stage change) |
| PATCH | `/api/v1/crm/deals/{id}/stage` | Update stage only (for Kanban drag-drop) |
| DELETE | `/api/v1/crm/deals/{id}` | Soft-delete (Admin only) |

**Deal fields:**
```
title*, dealValue, currency, stage (ENQUIRY|QUALIFIED|QUOTE_SENT|NEGOTIATION|WON|LOST),
probability (auto-set by stage: Enquiry=10, Qualified=25, Quote Sent=50, Negotiation=75, Won=100, Lost=0),
expectedCloseDate, actualCloseDate,
lossReason (PRICE|COMPETITION|BUDGET|NO_DECISION|TECHNICAL_FIT|OTHER — required when stage=LOST),
lossNotes, nextAction, nextActionDate,
accountId*, contactId, assignedRepId
```

**Deal Kanban Page (primary view):**
- Columns: Enquiry | Qualified | Quote Sent | Negotiation | Won | Lost
- Each card shows: Title, Account name, Deal value + currency, Probability %, Expected close date, Assigned rep avatar
- Drag-and-drop between columns using @dnd-kit
- On drop to "Won" → modal: "Create Sales Order?" (Phase 2 — stub for now)
- On drop to "Lost" → modal: require Loss Reason + optional notes
- Column header shows: count of deals + total value (weighted by probability)
- Filters: Assigned Rep, Date Range, Value Range

**Deal List Page (secondary view):**
- Standard table view with all deal fields
- Toggle between Kanban and List view

**Deal Detail Page (slide-over panel):**
- Deal info form (all fields)
- Linked Account + Contact (clickable links)
- Activity timeline
- Linked Quotes table
- Document flow chain placeholder (for Phase 2 SO/Invoice linking)

---

## Phase 1D — Quote & Proposal Module

### 1D.1 — Quote CRUD with Line Items

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/quotes` | List quotes (paginated) |
| GET | `/api/v1/crm/quotes/{id}` | Get quote with line items |
| POST | `/api/v1/crm/quotes` | Create quote |
| PUT | `/api/v1/crm/quotes/{id}` | Update quote + line items |
| POST | `/api/v1/crm/quotes/{id}/send` | Mark as Sent |
| POST | `/api/v1/crm/quotes/{id}/revise` | Create new revision (clone with incremented revision number) |
| DELETE | `/api/v1/crm/quotes/{id}` | Soft-delete |

**Quote fields:**
```
quoteNumber (auto-generated: QT-{YEAR}-{SEQ}),
revision (auto-increment on revise), status (DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED|REVISED),
currency, exchangeRate (editable, default from currency rate table),
validUntil (date), termsAndConditions, notes,
dealId, accountId*, contactId, companyCode
```

**Quote Line Item fields:**
```
itemType (EQUIPMENT|SPARE_PART|SERVICE|FREIGHT),
description*, quantity (default 1), unitPrice*,
discountPercent (default 0), taxPercent (default 0),
lineTotal (auto-calc: (unitPrice * quantity) * (1 - discountPercent/100) * (1 + taxPercent/100)),
equipmentId (optional link), sortOrder
```

**Quote auto-calculations:**
```
subtotal = SUM(all lineTotal values before tax)
discountTotal = SUM(all line-level discounts)
taxTotal = SUM(all line-level tax amounts)
grandTotal = subtotal - discountTotal + taxTotal
```

**Quote Status Flow:** `Draft → Sent → Accepted / Rejected / Expired` or `Sent → Revised (creates new revision)`

**Quote Detail Page UI:**
- Header: Quote number + revision, status badge, account name, contact name
- Line items table: editable rows, add/remove rows, drag to reorder
- Totals section: Subtotal, Discount, Tax, Grand Total
- Action buttons: Save Draft, Send, Revise, "Convert to Sales Order" (Phase 2)
- PDF preview/download

---

## Phase 1E — Trade Shows & Activities

### 1E.1 — Trade Show Tracking

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/trade-shows` | List trade shows |
| GET | `/api/v1/crm/trade-shows/{id}` | Get trade show with linked leads |
| POST | `/api/v1/crm/trade-shows` | Create trade show |
| PUT | `/api/v1/crm/trade-shows/{id}` | Update trade show |

**Trade Show fields:**
```
name*, location, country, startDate, endDate,
boothCost, travelCost, totalCost (auto-calc),
attendingStaff (multi-select users), notes
```

**Auto-calculated metrics (read-only):**
- `leadsGenerated` — COUNT of leads where tradeShowId matches
- `dealsAttributed` — COUNT of deals linked through converted leads
- `revenueAttributed` — SUM of deal values from converted leads with stage=WON
- **ROI** — `(revenueAttributed - totalCost) / totalCost * 100`

**Trade Show Detail Page:**
- Trade show info form
- Linked Leads table (with "Add Lead" button that pre-fills tradeShowId + leadSource="TRADE_SHOW")
- ROI metrics cards

### 1E.2 — Activity Logging

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/crm/activities` | List activities (filterable by type, contact, deal, date) |
| POST | `/api/v1/crm/activities` | Create activity |
| PUT | `/api/v1/crm/activities/{id}` | Update activity |

**Activity fields:**
```
activityType (CALL|EMAIL|MEETING|TASK|NOTE),
subject*, description, dueDate, completed, completedAt,
contactId, accountId, dealId, leadId, assignedToId
```

**Activity List Page:**
- Table: Type (icon), Subject, Related To (contact/account/deal link), Due Date, Status, Assigned To
- Filters: Type, Date Range, Assigned To, Completed/Open
- Calendar view toggle (shows activities on calendar by due date)

### Acceptance Criteria — Phase 1
- [ ] Full CRUD for Accounts, Contacts, Leads, Deals, Quotes, Trade Shows, Activities
- [ ] Lead conversion creates Contact + Account + Deal in single transaction
- [ ] Deal Kanban board with drag-and-drop stage transitions
- [ ] "Won" requires confirmation, "Lost" requires loss reason
- [ ] Quote line items with auto-calculated totals
- [ ] Quote revision system (clone + increment)
- [ ] Trade show ROI tracking from linked leads
- [ ] All list pages have search, filter, pagination
- [ ] Audit trail logs every create/update with field-level changes
- [ ] Toast notifications on every save/error
- [ ] All pages respect role-based access control
- [ ] Swagger API docs accessible and accurate

---

# PHASE 2 — ERP CORE + FINANCE

**Timeline:** Months 5-9
**Goal:** Equipment inventory, purchase orders, sales orders, multi-currency finance, AR/AP.

---

## Phase 2A — Equipment Inventory Management

### 2A.1 — Equipment Master CRUD

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/equipment` | List equipment (filterable by status, category, plant) |
| GET | `/api/v1/erp/equipment/{id}` | Get equipment detail (all views) |
| POST | `/api/v1/erp/equipment` | Create equipment record |
| PUT | `/api/v1/erp/equipment/{id}` | Update equipment |
| PATCH | `/api/v1/erp/equipment/{id}/status` | Change equipment status |
| POST | `/api/v1/erp/equipment/transfer` | Stock transfer between plants |

**Equipment Master fields (SAP Material Master views):**

```
-- Basic View
equipmentNumber (auto-generated), category* (CT|MRI|ULTRASOUND|CATH_LAB|MAMMOGRAPHY|C_ARM|PET_CT),
manufacturer*, model*, serialNumber* (unique), yearOfManufacture

-- Sales View
sellingPriceAud, sellingPriceUsd, sellingPriceJpy, minimumPriceFloor, taxClassification

-- Purchasing View
acquisitionCost*, acquisitionCurrency, acquisitionDate, acquisitionSource (SUPPLIER|HOSPITAL|AUCTION|DEALER),
linkedPurchaseOrderId

-- Warehouse View
currentPlant* (AU-WH01|US-WH01|JP-WH01), storageLocation (BAYA|BAYB|QUARANTINE|REFURB),
status* (AVAILABLE|RESERVED|IN_REFURBISHMENT|IN_TRANSIT|SOLD|SCRAPPED)

-- Accounting View
valuationClass, standardPrice, movingAveragePrice, lastRevaluationDate

-- Quality View
conditionGrade* (A|B|C|D), lastInspectionDate, refurbishmentNotes, hoursOfUse

-- Media
photos (up to 20 file uploads), documents (CE cert, service manual, test report)
```

**Equipment Status Flow:**
```
Available → Reserved (when SO confirmed)
Available → In Refurbishment → Available
Available ↔ In Transit (stock transfer)
Reserved → Sold (when delivered)
Any → Scrapped (Admin only)
```

**Equipment List Page UI:**
- Table: Equipment #, Category (icon), Manufacturer, Model, Serial #, Status (colored badge), Plant, Condition, Selling Price
- Filters: Category, Status, Plant, Condition Grade
- Quick status change dropdown on each row

**Equipment Detail Page UI:**
- Tabbed form matching the 6 views above
- Photo gallery with upload/delete
- Document upload section
- Linked records: Purchase Order, Sales Order, Service Tickets, Warranty
- Stock Transfer button (opens modal: select target plant + storage location)

### 2A.2 — Stock Transfer

**Transfer Request fields:**
```
equipmentId*, fromPlant*, fromStorageLocation, toPlant*, toStorageLocation,
transferDate, notes
```

**Transfer logic:**
1. Validate equipment status = AVAILABLE
2. Set equipment status = IN_TRANSIT
3. Create transfer record
4. Post accounting entries (Phase 2C): DR Stock in Transit (1210) / CR Inventory (1200) at supplying plant
5. On receipt confirmation: Set equipment status = AVAILABLE at target plant, reverse accounting

---

## Phase 2B — Spare Parts Inventory

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/spare-parts` | List spare parts (with stock levels) |
| GET | `/api/v1/erp/spare-parts/{id}` | Get spare part detail |
| POST | `/api/v1/erp/spare-parts` | Create spare part |
| PUT | `/api/v1/erp/spare-parts/{id}` | Update spare part |

**Spare Part fields:**
```
partNumber* (unique), name*, category (PROBE|COIL|INJECTOR|CR_DR|TUBE|OTHER),
description, manufacturer,
stockQuantity (per plant), reorderPoint, reorderQuantity, leadTimeDays,
movingAveragePrice, lastPurchasePrice, lastPurchaseDate
```

**Moving Average Price recalculation on Goods Receipt:**
```
New MAP = (Current Stock Value + New Receipt Value) / (Current Qty + Received Qty)
Example: 5 @ $1000 + 3 @ $1200 = $8600 / 8 = $1075
```

**Reorder Alert Scheduler (`@Scheduled` daily):**
- For each spare part where `stockQuantity <= reorderPoint` → create notification for Warehouse role
- Optionally auto-generate draft PO

---

## Phase 2C — Purchase Order Management

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/purchase-orders` | List POs |
| GET | `/api/v1/erp/purchase-orders/{id}` | Get PO with line items |
| POST | `/api/v1/erp/purchase-orders` | Create PO |
| PUT | `/api/v1/erp/purchase-orders/{id}` | Update PO |
| POST | `/api/v1/erp/purchase-orders/{id}/submit` | Submit for approval |
| POST | `/api/v1/erp/purchase-orders/{id}/approve` | Approve PO |
| POST | `/api/v1/erp/purchase-orders/{id}/reject` | Reject PO |
| POST | `/api/v1/erp/purchase-orders/{id}/receive` | Record goods receipt |

**PO Status Flow:** `Draft → Pending Approval → Approved → Sent to Supplier → Partially Received → Fully Received`

**Approval Workflow (configurable thresholds):**
- < $10,000 AUD → Sales Manager approves
- $10K – $50K → Director approves
- > $50K → Two-level: Director + Finance

**PO fields:**
```
poNumber (auto: PO-{CC}-{YEAR}-{SEQ}), status, supplierId*,
currency, exchangeRate, subtotal, taxTotal, grandTotal,
expectedDeliveryDate, shippingMethod, notes,
companyCode, plantCode
```

**PO Line Item fields:**
```
itemType (EQUIPMENT|SPARE_PART|SERVICE),
description*, quantity*, unitPrice*, taxPercent, lineTotal,
equipmentCategory, serialNumber (if known)
```

**On "Receive Items" (Goods Receipt):**
1. For EQUIPMENT items: Create Equipment Master record (status=AVAILABLE, fill serial number, acquisition details from PO)
2. For SPARE_PART items: Increase stock quantity, recalculate MAP
3. Post accounting: DR Inventory (1200) / CR GR/IR Clearing (2050)
4. Prompt: "Create supplier invoice?"

---

## Phase 2D — Sales Order Management

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/sales-orders` | List SOs |
| GET | `/api/v1/erp/sales-orders/{id}` | Get SO with line items |
| POST | `/api/v1/erp/sales-orders` | Create SO (usually from quote) |
| PUT | `/api/v1/erp/sales-orders/{id}` | Update SO |
| POST | `/api/v1/erp/sales-orders/{id}/confirm` | Confirm SO (triggers availability + credit check) |

**SO Status Flow:** `Confirmed → Packing → Dispatched → In Transit → Delivered`

**SO fields:**
```
soNumber (auto: SO-{CC}-{YEAR}-{SEQ}), status,
accountId*, contactId, dealId, quoteId (reference),
currency, exchangeRate, subtotal, taxTotal, grandTotal,
paymentTerms, requestedDeliveryDate, shippingAddress,
companyCode, salesOrg, distributionChannel
```

**On "Confirm Order" (automated checks):**
1. **Availability check:** Verify all line item equipment = AVAILABLE → if not, block with warning
2. **Credit check:** `Customer Credit Limit - Open AR Invoices - Open SOs = Available Credit` → if negative, block order, notify Finance
3. **Reserve inventory:** Set equipment status = RESERVED

**Linked actions (buttons on SO detail page):**
- "Generate Invoice" → pre-fills invoice from SO data
- "Create Shipment" → pre-fills shipment from SO data
- "Create Warranty" → pre-fills warranty from SO equipment + customer

---

## Phase 2E — Supplier Management

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/suppliers` | List suppliers |
| GET | `/api/v1/erp/suppliers/{id}` | Get supplier detail |
| POST | `/api/v1/erp/suppliers` | Create supplier |
| PUT | `/api/v1/erp/suppliers/{id}` | Update supplier |

**Supplier fields:**
```
name*, country*, supplierType (HOSPITAL|DEALER|AUCTION_HOUSE|MANUFACTURER|DISTRIBUTOR),
contactName, contactEmail, contactPhone,
paymentTerms, bankDetails (encrypted), categoriesSupplied (multi-select),
performanceRating (1-5 stars), notes, companyCode
```

---

## Phase 2F — Finance & Accounting

### 2F.1 — Chart of Accounts (Seed Data)

Seed the GL account structure via Flyway migration:
```
ASSETS:      1000-Cash(AUD), 1001-Cash(USD), 1002-Cash(JPY), 1100-AR, 1200-Inventory Equipment, 1201-Inventory Parts, 1210-Stock in Transit, 1300-Prepayments
LIABILITIES: 2000-AP, 2050-GR/IR Clearing, 2100-GST Collected, 2101-GST Paid, 2200-Accrued Expenses
REVENUE:     4000-Equipment Sales, 4001-Parts Revenue, 4002-Service Revenue, 4003-Freight Revenue
COGS:        5000-Cost Equipment Sold, 5001-Cost Parts Sold, 5002-Refurb Costs, 5003-Freight In, 5010-Purchase Price Variance
OPEX:        6000-Salaries, 6100-Rent, 6200-Travel, 6300-Marketing, 6400-IT
OTHER:       7000-FX Gain, 7001-FX Loss, 8000-Intercompany Revenue, 8001-Intercompany Expense
```

### 2F.2 — Invoice (Accounts Receivable)

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/finance/invoices` | List invoices |
| GET | `/api/v1/finance/invoices/{id}` | Get invoice detail |
| POST | `/api/v1/finance/invoices` | Create invoice (usually from SO) |
| PUT | `/api/v1/finance/invoices/{id}` | Update draft invoice |
| POST | `/api/v1/finance/invoices/{id}/send` | Release + send invoice |
| POST | `/api/v1/finance/invoices/{id}/void` | Void invoice (Finance/Admin only) |

**Invoice Status Flow:** `Draft → Sent → Partially Paid → Paid → Overdue (auto)` or `Draft → Void`

**Invoice fields:**
```
invoiceNumber (auto: INV-{CC}-{YEAR}-{SEQ}), status,
accountId*, contactId, salesOrderId (reference),
currency, exchangeRate, subtotal, taxTotal, grandTotal,
issueDate, dueDate (auto-calc from payment terms),
companyCode
```

**On invoice release, auto-post accounting:**
```
DR — Accounts Receivable (1100)    [gross amount in local currency]
CR — Revenue (4000/4001/4002)      [net amount]
CR — GST Collected (2100)          [tax amount]
```

**Overdue Scheduler (`@Scheduled` daily at midnight):**
- Find all invoices where `status = SENT` AND `dueDate < today`
- Update status → OVERDUE
- Send notification to Finance + Account Owner

### 2F.3 — Payments

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/finance/payments` | List payments |
| POST | `/api/v1/finance/payments` | Record payment against invoice |

**Payment fields:**
```
paymentNumber (auto: PAY-{YEAR}-{SEQ}),
invoiceId*, amount*, currency, exchangeRate,
paymentDate*, paymentMethod (WIRE|LC|CHEQUE|CREDIT_CARD),
reference, notes
```

**Payment logic:**
1. Record payment amount against invoice
2. If `total payments >= invoice grand total` → invoice status = PAID
3. If `total payments < grand total` → invoice status = PARTIALLY_PAID
4. Post accounting: DR Cash/Bank (1000/1001/1002) / CR Accounts Receivable (1100)
5. If payment in foreign currency: calculate and post FX gain/loss (7000/7001)

### 2F.4 — Currency Rates

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/finance/currency-rates` | List current rates |
| POST | `/api/v1/finance/currency-rates/sync` | Manually trigger rate sync |

**Rate sync scheduler (`@Scheduled` daily):**
- Fetch from Open Exchange Rates API (or ECB)
- Store: `{fromCurrency, toCurrency, rate, effectiveDate}`
- Cache in Redis for fast lookups

### 2F.5 — Financial Reports

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/finance/reports/ar-aging` | AR Aging report (0-30, 31-60, 61-90, 90+) |
| GET | `/api/v1/finance/reports/revenue` | Revenue summary by period/entity |
| GET | `/api/v1/finance/reports/pnl` | P&L by entity |

Filters on all reports: Date Range, Company Code, Currency.
Export: CSV, PDF.

### Acceptance Criteria — Phase 2
- [ ] Equipment Master with full CRUD, status flow, photo/document uploads
- [ ] Stock transfer between plants with accounting entries
- [ ] Spare parts with MAP recalculation and reorder alerts
- [ ] Purchase Orders with approval workflow (threshold-based)
- [ ] Goods Receipt creates Equipment Master records, updates stock
- [ ] Sales Orders with automated availability + credit checks
- [ ] Sales Order confirmation reserves inventory
- [ ] Invoice generation from SO, with auto accounting (DR AR / CR Revenue / CR GST)
- [ ] Payment recording with partial/full payment tracking
- [ ] FX gain/loss calculation on foreign currency payments
- [ ] Daily currency rate sync with Redis caching
- [ ] Overdue invoice scheduler with notifications
- [ ] AR Aging, Revenue, P&L reports with entity filters
- [ ] Document flow chain visible on SO/Invoice/PO: clickable links between chained documents
- [ ] All document numbers auto-generated from number range service

---

# PHASE 3 — OPERATIONS, SERVICE, REPORTING

**Timeline:** Months 10-14
**Goal:** Logistics, after-sales service, warranty, subcontractors, compliance, dashboards, full reporting suite.

---

## Phase 3A — Freight & Shipment Tracking

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/shipments` | List shipments |
| GET | `/api/v1/erp/shipments/{id}` | Get shipment detail |
| POST | `/api/v1/erp/shipments` | Create shipment (usually from SO) |
| PUT | `/api/v1/erp/shipments/{id}` | Update shipment |
| PATCH | `/api/v1/erp/shipments/{id}/status` | Update shipment status |

**Shipment Status Flow:** `Preparing → Booked → In Transit → Customs Clearance → Out for Delivery → Delivered → Exception`

**Shipment fields:**
```
shipmentNumber (auto), status, salesOrderId*,
freightMode (AIR|SEA|ROAD|COURIER), carrier, trackingNumber,
incoterms, weight, volume, numberOfPackages,
originAddress, destinationAddress,
estimatedDeliveryDate, actualDeliveryDate,
companyCode
```

**Required document uploads:** Commercial Invoice, Packing List, Bill of Lading/Airway Bill, Certificate of Origin, Export Permit, Insurance Certificate, Customs Declaration.

**On "Mark Delivered":**
1. Update SO status → Delivered
2. Update equipment status → SOLD
3. Set warranty start date = delivery date
4. Prompt: "Create installation service ticket?"

---

## Phase 3B — Customs & Compliance Vault

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/compliance-documents` | List compliance docs |
| POST | `/api/v1/erp/compliance-documents` | Upload compliance doc |

**Compliance Document fields:**
```
documentType (CE_CERTIFICATE|TGA_REGISTRATION|FDA_CLEARANCE|EXPORT_PERMIT|ISO_CERTIFICATE|IMPORT_PERMIT),
equipmentId (link by serial number), shipmentId,
issuedDate, expiryDate, documentFile (S3 upload),
status (VALID|EXPIRING_SOON|EXPIRED), notes
```

**Expiry Alert Scheduler (`@Scheduled` daily):**
- 90/60/30 days before expiry → alert Logistics/Compliance user
- On expiry → status = EXPIRED, logged

---

## Phase 3C — Service Ticket System

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/service-tickets` | List tickets (filterable by status, priority, type) |
| GET | `/api/v1/erp/service-tickets/{id}` | Get ticket detail |
| POST | `/api/v1/erp/service-tickets` | Create ticket |
| PUT | `/api/v1/erp/service-tickets/{id}` | Update ticket |
| POST | `/api/v1/erp/service-tickets/{id}/resolve` | Resolve ticket |

**Ticket fields:**
```
ticketNumber (auto), ticketType (SERVICE_REQUEST|REPAIR|ANNUAL_CHECK|INSTALLATION|REMOTE_SUPPORT|WARRANTY_CLAIM),
priority (LOW|MEDIUM|HIGH|CRITICAL),
status (OPEN|IN_PROGRESS|AWAITING_PARTS|AWAITING_CUSTOMER|RESOLVED|CLOSED),
subject*, description, resolutionNotes,
equipmentId*, accountId*, contactId,
assignedToId (service tech or subcontractor),
warrantyId (optional link),
partsUsed (JSON: [{partId, quantity}]),
laborHours, laborRate,
companyCode
```

**On "Resolve":**
1. Save resolution notes
2. Deduct parts from spare parts inventory
3. Log labor time
4. If linked warranty → check if warranty covers this: if yes, no charge; if no, billable
5. Email customer summary

**"Check Warranty" button:** Auto-lookup active warranty for the linked equipment → display warranty type, coverage, expiry date.

---

## Phase 3D — Warranty Tracking

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/warranties` | List warranties |
| GET | `/api/v1/erp/warranties/{id}` | Get warranty detail |
| POST | `/api/v1/erp/warranties` | Create warranty (usually from SO delivery) |
| PUT | `/api/v1/erp/warranties/{id}` | Update warranty |

**Warranty fields:**
```
warrantyNumber (auto), warrantyType (PARTS_ONLY|LABOUR_ONLY|PARTS_AND_LABOUR|FULL_COMPREHENSIVE),
status (ACTIVE|EXPIRING_SOON|EXPIRED),
startDate, endDate, durationMonths,
equipmentId*, accountId*, salesOrderId,
terms, notes
```

**Alert Scheduler (`@Scheduled` daily):**
- 90/60/30 days before `endDate` → alert sales rep (account owner)
- On expiry → status = EXPIRED, audit log entry

---

## Phase 3E — Subcontractor & Partner Management

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/erp/subcontractors` | List subcontractors |
| GET | `/api/v1/erp/subcontractors/{id}` | Get subcontractor detail |
| POST | `/api/v1/erp/subcontractors` | Create subcontractor |
| PUT | `/api/v1/erp/subcontractors/{id}` | Update subcontractor |

**Subcontractor fields:**
```
name*, country*, coverageCountries (multi-select),
equipmentTypesServiced (multi-select), certifications,
rateType (FIXED|HOURLY|DAY_RATE), rateAmount, rateCurrency,
contactName, contactEmail, contactPhone,
performanceRating (1-5 stars), notes
```

---

## Phase 3F — Dashboard & Reporting

### Dashboard Page (landing page after login)

**Widgets (live data, auto-refresh):**

| Widget | Data Source | Visual |
|---|---|---|
| Pipeline Value by Stage | Deals grouped by stage | Horizontal bar chart |
| Revenue This Month | Paid invoices this month | Large number + sparkline |
| Outstanding Receivables | Unpaid invoices total | Number + trend arrow |
| Inventory by Warehouse | Equipment count per plant | Stacked bar chart |
| Open Service Tickets | Tickets by priority | Donut chart |
| Overdue POs | POs past expected delivery | Number (red if > 0) |
| Expiring Warranties (30d) | Warranties expiring in 30 days | Number + list |
| Expiring Compliance Docs | Compliance docs expiring in 30 days | Number + list |
| Recent Activities | Last 10 activities across CRM | Timeline list |
| Top Deals | Top 5 deals by value | Table |

### Report Suite

| Report | Endpoint | Filters |
|---|---|---|
| AR Aging | `/api/v1/finance/reports/ar-aging` | Date, Entity, Customer |
| AP Aging | `/api/v1/finance/reports/ap-aging` | Date, Entity, Supplier |
| Customer Statement | `/api/v1/finance/reports/customer-statement` | Customer, Date Range |
| Revenue by Customer | `/api/v1/finance/reports/revenue-by-customer` | Date, Entity |
| Sales by Rep | `/api/v1/finance/reports/sales-by-rep` | Date, Rep |
| Sales by Region | `/api/v1/finance/reports/sales-by-region` | Date, Region |
| Pipeline Value | `/api/v1/finance/reports/pipeline` | Rep, Date |
| Inventory Valuation | `/api/v1/erp/reports/inventory-valuation` | Plant, Category |
| Stock Overview | `/api/v1/erp/reports/stock-overview` | Plant |
| Slow-Moving Stock | `/api/v1/erp/reports/slow-moving` | Days threshold |
| P&L by Entity | `/api/v1/finance/reports/pnl` | Date, Entity |
| Cash Flow | `/api/v1/finance/reports/cash-flow` | Date, Entity |
| Trade Show ROI | `/api/v1/crm/reports/trade-show-roi` | Date Range |

All reports support: CSV export, PDF export.

### Acceptance Criteria — Phase 3
- [ ] Shipment tracking with full status flow and document uploads
- [ ] "Mark Delivered" updates equipment status, sets warranty start date
- [ ] Compliance vault with document upload and expiry alerts (90/60/30 days)
- [ ] Service tickets with parts deduction, labor tracking, warranty check
- [ ] Warranty creation from SO with auto-expiry alerts
- [ ] Subcontractor directory with assignment to service tickets
- [ ] Dashboard with 10 live widgets using Recharts/ECharts
- [ ] Full report suite with filters and CSV/PDF export
- [ ] All schedulers running: overdue invoices, warranty expiry, compliance expiry, FX rates, reorder alerts

---

# CROSS-CUTTING CONCERNS (All Phases)

## Global UI Patterns (Implement Consistently)

| Pattern | Implementation |
|---|---|
| **Inline Edit** | Click any field → edit in place → Enter saves, Escape cancels. Pencil icon on hover. |
| **Bulk Edit** | Checkbox selection on list pages → top bar: Assign To / Change Status / Export / Delete |
| **Toast Notifications** | sonner `<Toaster richColors position="top-right" />` in App.tsx. `toast.success()` on save, `toast.error()` on fail. |
| **Audit Log** | Collapsible "History" tab on every detail page. Shows: field, old value, new value, user, timestamp. |
| **Document Upload** | Drag-and-drop + browse. PDF, JPG, PNG, DOCX, XLSX. Max 25MB. Progress bar. |
| **Currency Display** | Number field with currency prefix. Small grey text below showing AUD equivalent. |
| **Status Badge** | Colored pill (green=active, yellow=pending, red=overdue/expired, grey=draft). Click for valid transitions. |
| **Document Flow Chain** | Clickable chain at top of SO/Invoice/PO: Green=complete, Blue=in progress, Grey=not yet. |
| **Permission Guard** | `<PermissionGuard roles={['ADMIN','FINANCE']}><Button>Void</Button></PermissionGuard>` |

## Notification Map

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

## End-to-End Document Flow

```
LEAD → CONTACT/ACCOUNT → DEAL → QUOTE → SALES ORDER → INVOICE → PAYMENT
                                           ↓                ↓
                                      INVENTORY          SHIPMENT
                                           ↓                ↓
                                      WARRANTY       COMPLIANCE DOCS
                                           ↓
                                     SERVICE TICKET
```

**Number Range Format:**
```
INQ-{YEAR}-{5-digit SEQ}         → INQ-2026-00001
QT-{YEAR}-{5-digit SEQ}          → QT-2026-00001
SO-{CC}-{YEAR}-{5-digit SEQ}     → SO-AU-2026-00001
PO-{CC}-{YEAR}-{5-digit SEQ}     → PO-JP-2026-00001
INV-{CC}-{YEAR}-{5-digit SEQ}    → INV-AU-2026-00001
PAY-{YEAR}-{5-digit SEQ}         → PAY-2026-00001
DEL-{YEAR}-{5-digit SEQ}         → DEL-2026-00001
STO-{YEAR}-{5-digit SEQ}         → STO-2026-00001
GR-{YEAR}-{5-digit SEQ}          → GR-2026-00001
```

---

# HOW TO USE THIS PROMPT

## For Phase-by-Phase Development

Feed the AI assistant one phase at a time:

1. **Start with:** "Implement Phase 0 — Foundation & Scaffolding. Here are the specs: [paste Phase 0 section]"
2. **Then:** "Implement Phase 1A — Account & Contact Management. The project already has [auth, sidebar, database]. Here are the specs: [paste Phase 1A section]"
3. **Continue** through each sub-phase sequentially.

## For Specific Module Implementation

Extract the relevant section and feed:

> "I need you to implement the Equipment Inventory module for my Spring Boot + React application. Here is the tech stack: [paste Tech Stack section]. Here are the exact specifications: [paste Phase 2A section]. The database schema already has these tables: [paste relevant schema]. Follow the architecture rules: [paste Architecture Rules section]."

## For Bug Fixes / Modifications

> "Here is my project specification: [paste relevant phase section]. The current issue is [describe]. The relevant code is [paste]. Fix it according to the spec."

## Key Rules for AI

1. **Match field names exactly** between TypeScript interfaces, React forms, API DTOs, and database columns. Use camelCase in Java/TypeScript, snake_case in SQL.
2. **Every list endpoint** must support pagination (`page`, `size`, `sort`), search (`search` query param), and relevant filters.
3. **Every mutation** (create/update/delete) must return the full updated entity wrapped in the standard response format.
4. **Every entity** must have soft-delete, audit fields, and company code filtering.
5. **Toast on every action**: `toast.success("Account created")`, `toast.error("Failed to create account")`.
6. **Validate at boundaries**: Zod schemas on forms, `@Valid` on controller request bodies, DB constraints as last line of defense.

---

*Generated from EverX README.md — April 2026*
