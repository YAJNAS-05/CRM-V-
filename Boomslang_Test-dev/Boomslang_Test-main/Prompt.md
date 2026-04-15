# 🧠 MASTER PROMPT — Zoho-like CRM System (Leads · Contacts · Deals)

> **Feed this entire document to your AI code generator or dev team.**
> It covers: DB schema (PostgreSQL 16), full backend spec (Java 21 + Spring Boot 3.3), full frontend spec (React 18 + TypeScript + Tailwind + shadcn/ui), every UI element, every form field, every button, every placeholder, search bar, modal, and a reporting dashboard.

---

## 0. PROJECT CONTEXT

Build a **CRM + ERP dual-module enterprise web application** that visually and functionally replicates Zoho CRM. The system must have:

- A **CRM Module** covering: Leads, Contacts, Deals (Opportunities), Accounts, Activities, Reports, Dashboard.
- An **ERP Module** (separate nav section, out of scope for this prompt — scaffold only).
- Role-based access (Super Admin, Admin, Manager, Sales Rep, Viewer).
- JWT-secured REST API (Spring Security 6).
- PostgreSQL 16 backend with Flyway migrations.
- React 18 + TypeScript SPA (Vite, Tailwind CSS, shadcn/ui, React Query v5, React Hook Form + Zod, Zustand).

The UI must feel **identical to Zoho CRM**: left sidebar navigation, top header bar, list views with sortable columns, Kanban pipeline board, detail pages with tabbed sections, inline editing, activity timelines, and a KPI dashboard.

---

## 1. POSTGRESQL 16 — COMPLETE DATABASE SCHEMA

Run all migrations via Flyway. Use `UUID` as primary keys. Enable `pgcrypto` extension.

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast ILIKE search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE lead_status     AS ENUM ('NEW','CONTACTED','QUALIFIED','UNQUALIFIED','CONVERTED');
CREATE TYPE lead_source     AS ENUM ('WEB','REFERRAL','COLD_CALL','EMAIL_CAMPAIGN','SOCIAL_MEDIA','TRADE_SHOW','OTHER');
CREATE TYPE deal_stage      AS ENUM ('PROSPECTING','QUALIFICATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST');
CREATE TYPE activity_type   AS ENUM ('CALL','EMAIL','MEETING','TASK','NOTE');
CREATE TYPE activity_status AS ENUM ('PENDING','COMPLETED','CANCELLED');
CREATE TYPE user_role       AS ENUM ('SUPER_ADMIN','ADMIN','MANAGER','SALES_REP','VIEWER');
CREATE TYPE gender_type     AS ENUM ('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY');

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'SALES_REP',
    avatar_url      TEXT,
    phone           VARCHAR(30),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS (Companies)
-- ============================================================
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    website         TEXT,
    phone           VARCHAR(30),
    email           VARCHAR(255),
    billing_street  TEXT,
    billing_city    VARCHAR(100),
    billing_state   VARCHAR(100),
    billing_zip     VARCHAR(20),
    billing_country VARCHAR(100),
    annual_revenue  NUMERIC(18,2),
    employees       INTEGER,
    description     TEXT,
    owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salutation      VARCHAR(10),                  -- Mr, Ms, Dr, etc.
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(30),
    mobile          VARCHAR(30),
    company         VARCHAR(255),
    job_title       VARCHAR(150),
    lead_source     lead_source,
    status          lead_status NOT NULL DEFAULT 'NEW',
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    website         TEXT,
    street          TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip             VARCHAR(20),
    country         VARCHAR(100),
    annual_revenue  NUMERIC(18,2),
    employees       INTEGER,
    description     TEXT,
    is_converted    BOOLEAN NOT NULL DEFAULT FALSE,
    converted_at    TIMESTAMPTZ,
    converted_contact_id UUID,        -- FK added after contacts table
    converted_account_id UUID,        -- FK added after accounts table
    converted_deal_id    UUID,        -- FK added after deals table
    owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status   ON leads(status);
CREATE INDEX idx_leads_owner    ON leads(owner_id);
CREATE INDEX idx_leads_email    ON leads(email);
CREATE INDEX idx_leads_name_trgm ON leads USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salutation      VARCHAR(10),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(30),
    mobile          VARCHAR(30),
    job_title       VARCHAR(150),
    department      VARCHAR(150),
    gender          gender_type,
    date_of_birth   DATE,
    account_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
    lead_source     lead_source,
    mailing_street  TEXT,
    mailing_city    VARCHAR(100),
    mailing_state   VARCHAR(100),
    mailing_zip     VARCHAR(20),
    mailing_country VARCHAR(100),
    linkedin_url    TEXT,
    twitter_handle  VARCHAR(100),
    tags            TEXT[],           -- array of tag strings
    description     TEXT,
    do_not_call     BOOLEAN NOT NULL DEFAULT FALSE,
    email_opt_out   BOOLEAN NOT NULL DEFAULT FALSE,
    owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_account ON contacts(account_id);
CREATE INDEX idx_contacts_owner   ON contacts(owner_id);
CREATE INDEX idx_contacts_email   ON contacts(email);
CREATE INDEX idx_contacts_tags    ON contacts USING gin(tags);
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- ============================================================
-- DEALS (Opportunities)
-- ============================================================
CREATE TABLE deals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    stage               deal_stage NOT NULL DEFAULT 'PROSPECTING',
    amount              NUMERIC(18,2),
    probability         SMALLINT CHECK (probability BETWEEN 0 AND 100),
    expected_close_date DATE,
    lead_source         lead_source,
    account_id          UUID REFERENCES accounts(id) ON DELETE SET NULL,
    primary_contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
    description         TEXT,
    loss_reason         TEXT,
    next_step           TEXT,
    campaign_source     VARCHAR(255),
    owner_id            UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_stage   ON deals(stage);
CREATE INDEX idx_deals_owner   ON deals(owner_id);
CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_close   ON deals(expected_close_date);

-- Deal ↔ Contact many-to-many
CREATE TABLE deal_contacts (
    deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_id, contact_id)
);

-- ============================================================
-- ACTIVITIES (Calls, Emails, Meetings, Tasks, Notes)
-- ============================================================
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            activity_type NOT NULL,
    status          activity_status NOT NULL DEFAULT 'PENDING',
    subject         VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    duration_mins   INTEGER,
    -- polymorphic associations
    lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id         UUID REFERENCES deals(id) ON DELETE CASCADE,
    account_id      UUID REFERENCES accounts(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_lead    ON activities(lead_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal    ON activities(deal_id);
CREATE INDEX idx_activities_due     ON activities(due_date);

-- ============================================================
-- TAGS (master list, optional normalised approach)
-- ============================================================
CREATE TABLE tags (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) -- hex color
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,   -- 'LEAD','CONTACT','DEAL', etc.
    entity_id   UUID NOT NULL,
    action      VARCHAR(20) NOT NULL,   -- 'CREATE','UPDATE','DELETE','CONVERT'
    changed_by  UUID REFERENCES users(id),
    old_values  JSONB,
    new_values  JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ============================================================
-- DEFERRED FKs for circular lead → converted_* references
-- ============================================================
ALTER TABLE leads
    ADD CONSTRAINT fk_lead_converted_contact FOREIGN KEY (converted_contact_id) REFERENCES contacts(id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_lead_converted_account FOREIGN KEY (converted_account_id) REFERENCES accounts(id) DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_lead_converted_deal    FOREIGN KEY (converted_deal_id)    REFERENCES deals(id)    DEFERRABLE INITIALLY DEFERRED;
```

---

## 2. BACKEND — Java 21 + Spring Boot 3.3

### 2.1 Project Structure

```
src/main/java/com/yourcompany/crm/
├── config/
│   ├── SecurityConfig.java        # JWT filter chain, CORS, role matchers
│   ├── JwtConfig.java
│   └── AuditConfig.java
├── auth/
│   ├── AuthController.java        # POST /api/v1/auth/login, /refresh, /logout
│   ├── AuthService.java
│   ├── JwtService.java
│   └── dto/ (LoginRequest, TokenResponse, RefreshRequest)
├── user/
│   ├── UserController.java        # GET/POST/PUT/DELETE /api/v1/users
│   ├── UserService.java
│   ├── UserRepository.java
│   └── dto/
├── lead/
│   ├── LeadController.java
│   ├── LeadService.java
│   ├── LeadRepository.java
│   ├── LeadConversionService.java # handles Lead → Contact + Account + Deal
│   └── dto/
├── contact/
│   ├── ContactController.java
│   ├── ContactService.java
│   ├── ContactRepository.java
│   └── dto/
├── deal/
│   ├── DealController.java
│   ├── DealService.java
│   ├── DealRepository.java
│   └── dto/
├── account/
│   ├── AccountController.java
│   ├── AccountService.java
│   ├── AccountRepository.java
│   └── dto/
├── activity/
│   ├── ActivityController.java
│   ├── ActivityService.java
│   ├── ActivityRepository.java
│   └── dto/
├── report/
│   ├── ReportController.java      # dashboard KPIs, pipeline, conversion
│   └── ReportService.java
├── notification/
│   └── NotificationService.java
└── common/
    ├── audit/AuditLogService.java
    ├── exception/GlobalExceptionHandler.java
    └── dto/ (PageResponse, ApiResponse, ErrorResponse)
```

### 2.2 REST API Endpoints

#### AUTH
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Email + password → access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |
| GET  | `/api/v1/auth/me` | Current user profile |

#### LEADS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/leads` | Paginated list (filter by status, source, owner, search) |
| POST | `/api/v1/leads` | Create lead |
| GET | `/api/v1/leads/{id}` | Get single lead with activities |
| PUT | `/api/v1/leads/{id}` | Update lead |
| DELETE | `/api/v1/leads/{id}` | Delete lead |
| PUT | `/api/v1/leads/{id}/assign` | Assign to sales rep |
| POST | `/api/v1/leads/{id}/convert` | Convert lead → contact + account + deal |
| PATCH | `/api/v1/leads/{id}/status` | Quick status update |
| GET | `/api/v1/leads/{id}/activities` | Activity timeline for lead |
| POST | `/api/v1/leads/{id}/activities` | Log activity on lead |

#### CONTACTS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/contacts` | Paginated list (filter by account, owner, tags, search) |
| POST | `/api/v1/contacts` | Create contact |
| GET | `/api/v1/contacts/{id}` | Get contact with deals + activities |
| PUT | `/api/v1/contacts/{id}` | Update contact |
| DELETE | `/api/v1/contacts/{id}` | Delete contact |
| POST | `/api/v1/contacts/{id}/tags` | Add tags |
| DELETE | `/api/v1/contacts/{id}/tags/{tag}` | Remove tag |
| GET | `/api/v1/contacts/{id}/activities` | Activity timeline |
| POST | `/api/v1/contacts/{id}/activities` | Log activity |

#### DEALS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/deals` | Paginated list (filter by stage, owner, close date range) |
| GET | `/api/v1/deals/pipeline` | Kanban data grouped by stage |
| POST | `/api/v1/deals` | Create deal |
| GET | `/api/v1/deals/{id}` | Get deal with contacts + activities |
| PUT | `/api/v1/deals/{id}` | Update deal |
| DELETE | `/api/v1/deals/{id}` | Delete deal |
| PATCH | `/api/v1/deals/{id}/stage` | Move stage (drag-drop) |
| POST | `/api/v1/deals/{id}/contacts` | Link contact to deal |
| DELETE | `/api/v1/deals/{id}/contacts/{cid}` | Unlink contact |
| GET | `/api/v1/deals/{id}/activities` | Activity timeline |
| POST | `/api/v1/deals/{id}/activities` | Log activity |

#### ACCOUNTS
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/accounts` | Paginated list |
| POST | `/api/v1/accounts` | Create account |
| GET | `/api/v1/accounts/{id}` | Get with contacts + deals |
| PUT | `/api/v1/accounts/{id}` | Update |
| DELETE | `/api/v1/accounts/{id}` | Delete |

#### REPORTS / DASHBOARD
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/dashboard` | All KPI cards in one call |
| GET | `/api/v1/reports/pipeline` | Pipeline by stage (value + count) |
| GET | `/api/v1/reports/conversion` | Lead conversion rate over time |
| GET | `/api/v1/reports/activities` | Activity summary by type |
| GET | `/api/v1/reports/sales-performance` | Per-rep revenue + deal count |
| GET | `/api/v1/reports/deal-forecast` | Expected revenue by close month |

### 2.3 DTO Examples

**LeadCreateRequest:**
```java
record LeadCreateRequest(
    String salutation,
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email String email,
    String phone, String mobile,
    String company, String jobTitle,
    LeadSource leadSource,
    LeadStatus status,
    Integer rating,
    String website,
    String street, String city, String state, String zip, String country,
    BigDecimal annualRevenue, Integer employees,
    String description,
    UUID ownerId
) {}
```

**LeadConvertRequest:**
```java
record LeadConvertRequest(
    boolean createContact,
    boolean createAccount,
    boolean createDeal,
    String accountName,         // if new account
    UUID existingAccountId,     // if linking existing
    String dealName,
    BigDecimal dealAmount,
    DealStage dealStage,
    LocalDate expectedCloseDate
) {}
```

**DashboardResponse:**
```java
record DashboardResponse(
    long totalLeads, long newLeadsThisMonth,
    double leadConversionRate,
    long totalContacts,
    long openDeals,
    BigDecimal totalPipelineValue,
    BigDecimal closedWonThisMonth,
    List<PipelineStageDto> pipelineByStage,
    List<SalesRepPerformanceDto> topPerformers,
    List<MonthlyRevenueDto> monthlyRevenue,
    List<ActivitySummaryDto> activityBreakdown
) {}
```

### 2.4 Security Config (Role Matrix)

| Endpoint Pattern | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | VIEWER |
|-----------------|-------------|-------|---------|-----------|--------|
| DELETE any record | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign leads/deals | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all records | ✅ | ✅ | ✅ | Own only | Own only |
| Create records | ✅ | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ✅ | Limited | ❌ |
| User management | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. FRONTEND — React 18 + TypeScript

### 3.1 Application Layout (Zoho-identical)

```
┌──────────────────────────────────────────────────────────┐
│ TOP HEADER BAR (fixed, 56px)                             │
│ [≡ Logo] [Global Search 🔍]  [🔔 Bell] [👤 Avatar ▾]    │
├──────────┬───────────────────────────────────────────────┤
│ LEFT     │ MAIN CONTENT AREA                             │
│ SIDEBAR  │                                               │
│ (240px)  │  Breadcrumb > Page Title  [+ New Button]      │
│          │  ─────────────────────────────────────        │
│ CRM ▾    │  [Filters Bar] [Search] [Sort ▾] [View 🔲☰]  │
│  Dashboard│                                              │
│  Leads   │  [TABLE or KANBAN content]                    │
│  Contacts│                                               │
│  Deals   │                                               │
│  Accounts│                                               │
│  Reports │                                               │
│ ────────  │                                               │
│ ERP ▾    │                                               │
│  ...     │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### 3.2 Pages & Routes

```
/                           → redirect to /crm/dashboard
/login                      → LoginPage
/crm/dashboard              → DashboardPage
/crm/leads                  → LeadsListPage
/crm/leads/new              → LeadFormPage (create)
/crm/leads/:id              → LeadDetailPage
/crm/leads/:id/edit         → LeadFormPage (edit)
/crm/leads/:id/convert      → LeadConvertModal (opened from detail)
/crm/contacts               → ContactsListPage
/crm/contacts/new           → ContactFormPage
/crm/contacts/:id           → ContactDetailPage
/crm/contacts/:id/edit      → ContactFormPage
/crm/deals                  → DealsListPage  (default: Kanban view)
/crm/deals/new              → DealFormPage
/crm/deals/:id              → DealDetailPage
/crm/deals/:id/edit         → DealFormPage
/crm/accounts               → AccountsListPage
/crm/accounts/:id           → AccountDetailPage
/crm/reports                → ReportsPage
/settings/users             → UserManagementPage
/settings/profile           → ProfilePage
```

### 3.3 Component Library (ALL UI Elements)

#### 3.3.1 TOP HEADER BAR

```tsx
<TopHeader>
  {/* Left: Hamburger + Logo */}
  <IconButton icon={Menu} onClick={toggleSidebar} />
  <Logo src="/logo.svg" alt="CRM" />

  {/* Center: Global Search */}
  <GlobalSearchBar
    placeholder="Search leads, contacts, deals, accounts..."
    onSearch={handleGlobalSearch}
    shortcut="Ctrl+K"
    // shows dropdown with categorized results
  />

  {/* Right: actions */}
  <QuickCreateButton label="+ New" options={[
    { label: 'Lead',    icon: UserPlus,  href: '/crm/leads/new' },
    { label: 'Contact', icon: User,      href: '/crm/contacts/new' },
    { label: 'Deal',    icon: DollarSign,href: '/crm/deals/new' },
    { label: 'Account', icon: Building2, href: '/crm/accounts/new' },
  ]} />
  <NotificationBell count={unreadCount} onClick={openNotificationPanel} />
  <AvatarMenu user={currentUser} items={['Profile','Settings','Logout']} />
</TopHeader>
```

#### 3.3.2 SIDEBAR NAVIGATION

```tsx
<Sidebar>
  <NavSection label="CRM">
    <NavItem icon={LayoutDashboard} label="Dashboard"  to="/crm/dashboard" />
    <NavItem icon={Users}           label="Leads"       to="/crm/leads"     badge={newLeadCount} />
    <NavItem icon={UserCheck}       label="Contacts"    to="/crm/contacts" />
    <NavItem icon={TrendingUp}      label="Deals"       to="/crm/deals" />
    <NavItem icon={Building2}       label="Accounts"    to="/crm/accounts" />
    <NavItem icon={Activity}        label="Activities"  to="/crm/activities" />
    <NavItem icon={BarChart3}       label="Reports"     to="/crm/reports" />
  </NavSection>
  <NavSection label="ERP">
    <NavItem icon={Package}         label="Inventory"   to="/erp/inventory" disabled />
    <NavItem icon={FileText}        label="Invoices"    to="/erp/invoices"  disabled />
  </NavSection>
  <NavSection label="Settings" bottom>
    <NavItem icon={Settings}        label="Settings"    to="/settings" />
  </NavSection>
</Sidebar>
```

#### 3.3.3 LIST PAGE TOOLBAR (Leads / Contacts / Deals / Accounts)

```tsx
<ListToolbar>
  <SearchInput
    placeholder="Search by name, email, phone..."
    value={searchQuery}
    onChange={setSearchQuery}
    debounceMs={300}
  />

  <FilterDropdown label="Status" options={LEAD_STATUS_OPTIONS}  value={filters.status}  onChange={...} />
  <FilterDropdown label="Source" options={LEAD_SOURCE_OPTIONS}  value={filters.source}  onChange={...} />
  <FilterDropdown label="Owner"  options={salesRepOptions}      value={filters.ownerId} onChange={...} />
  <DateRangePicker label="Created Date" value={filters.dateRange} onChange={...} />

  <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>

  {/* Right side */}
  <SortMenu options={[
    { label: 'Name A–Z',       value: 'firstName,asc' },
    { label: 'Name Z–A',       value: 'firstName,desc' },
    { label: 'Newest First',   value: 'createdAt,desc' },
    { label: 'Oldest First',   value: 'createdAt,asc' },
    { label: 'Last Modified',  value: 'updatedAt,desc' },
  ]} />

  <ViewToggle
    views={['table', 'kanban']}   // kanban only for Deals
    current={viewMode}
    onChange={setViewMode}
  />

  <Button variant="primary" leftIcon={Plus} href="/crm/leads/new">
    New Lead
  </Button>

  <ExportButton formats={['CSV','Excel','PDF']} onExport={handleExport} />
</ListToolbar>
```

#### 3.3.4 DATA TABLE (List View)

```tsx
<DataTable
  columns={[
    { key: 'checkbox',    header: <Checkbox />,         width: 40,  sticky: true },
    { key: 'name',        header: 'Name',               sortable: true, render: (row) =>
        <Link to={`/crm/leads/${row.id}`}>{row.firstName} {row.lastName}</Link> },
    { key: 'company',     header: 'Company',            sortable: true },
    { key: 'email',       header: 'Email',              render: (row) => <a href={`mailto:${row.email}`}>{row.email}</a> },
    { key: 'phone',       header: 'Phone' },
    { key: 'status',      header: 'Status',             render: (row) => <StatusBadge status={row.status} /> },
    { key: 'leadSource',  header: 'Source' },
    { key: 'owner',       header: 'Owner',              render: (row) => <UserAvatar user={row.owner} showName /> },
    { key: 'createdAt',   header: 'Created',            sortable: true, render: (row) => formatDate(row.createdAt) },
    { key: 'actions',     header: '',                   width: 60,  render: (row) =>
        <RowActionMenu items={['Edit','Convert','Delete','Assign']} /> },
  ]}
  data={leads}
  loading={isLoading}
  pagination={pagination}
  onRowClick={(row) => navigate(`/crm/leads/${row.id}`)}
  onSelectAll={handleSelectAll}
  selectedRows={selectedRows}
  bulkActions={[
    { label: 'Assign To',   icon: UserPlus,  onClick: openBulkAssign },
    { label: 'Change Status', icon: Edit,    onClick: openBulkStatus },
    { label: 'Delete',      icon: Trash2,    onClick: openBulkDelete, destructive: true },
    { label: 'Export',      icon: Download,  onClick: exportSelected },
  ]}
  emptyState={<EmptyState icon={Users} title="No Leads Found" description="Get started by adding your first lead." action={<Button href="/crm/leads/new">New Lead</Button>} />}
/>

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  pageSize={pageSize}
  pageSizeOptions={[10, 25, 50, 100]}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  showingLabel="Showing {from}–{to} of {total} records"
/>
```

#### 3.3.5 STATUS BADGES (Color-coded)

```tsx
const LEAD_STATUS_COLORS = {
  NEW:          'bg-blue-100   text-blue-800',
  CONTACTED:    'bg-yellow-100 text-yellow-800',
  QUALIFIED:    'bg-green-100  text-green-800',
  UNQUALIFIED:  'bg-red-100    text-red-800',
  CONVERTED:    'bg-purple-100 text-purple-800',
};

const DEAL_STAGE_COLORS = {
  PROSPECTING:   'bg-gray-100   text-gray-700',
  QUALIFICATION: 'bg-blue-100   text-blue-700',
  PROPOSAL:      'bg-yellow-100 text-yellow-700',
  NEGOTIATION:   'bg-orange-100 text-orange-700',
  CLOSED_WON:    'bg-green-100  text-green-700',
  CLOSED_LOST:   'bg-red-100    text-red-700',
};
```

---

### 3.4 LEAD FORM — All Fields

```tsx
// Route: /crm/leads/new  |  /crm/leads/:id/edit
<LeadForm>
  {/* Section: Personal Information */}
  <FormSection title="Personal Information">
    <SelectField name="salutation"  label="Salutation"   options={['Mr','Ms','Mrs','Dr','Prof']}  placeholder="Select" />
    <TextField   name="firstName"   label="First Name*"  placeholder="e.g. John"         required />
    <TextField   name="lastName"    label="Last Name*"   placeholder="e.g. Doe"          required />
    <TextField   name="email"       label="Email"        placeholder="john@company.com"  type="email" />
    <TextField   name="phone"       label="Phone"        placeholder="+91 98765 43210" />
    <TextField   name="mobile"      label="Mobile"       placeholder="+91 98765 43210" />
  </FormSection>

  {/* Section: Company Information */}
  <FormSection title="Company Information">
    <TextField   name="company"       label="Company"        placeholder="Acme Corporation" />
    <TextField   name="jobTitle"      label="Job Title"      placeholder="Sales Manager" />
    <TextField   name="website"       label="Website"        placeholder="https://company.com" />
    <NumberField name="annualRevenue" label="Annual Revenue" placeholder="0.00" prefix="₹" />
    <NumberField name="employees"     label="No. of Employees" placeholder="e.g. 50" />
  </FormSection>

  {/* Section: Lead Details */}
  <FormSection title="Lead Details">
    <SelectField name="leadSource" label="Lead Source"  options={LEAD_SOURCE_OPTIONS}  placeholder="Select source" />
    <SelectField name="status"     label="Status*"      options={LEAD_STATUS_OPTIONS}  placeholder="Select status" required defaultValue="NEW" />
    <StarRating  name="rating"     label="Rating"       max={5} />
    <UserSelect  name="ownerId"    label="Lead Owner"   placeholder="Assign to sales rep" />
  </FormSection>

  {/* Section: Address */}
  <FormSection title="Address Information" collapsible defaultCollapsed>
    <TextField   name="street"  label="Street"  placeholder="123 Main Street" />
    <TextField   name="city"    label="City"    placeholder="Mumbai" />
    <TextField   name="state"   label="State"   placeholder="Maharashtra" />
    <TextField   name="zip"     label="ZIP"     placeholder="400001" />
    <SelectField name="country" label="Country" options={COUNTRY_LIST} placeholder="Select country" />
  </FormSection>

  {/* Section: Description */}
  <FormSection title="Additional Information" collapsible>
    <TextareaField name="description" label="Description" placeholder="Enter any notes about this lead..." rows={4} />
  </FormSection>

  {/* Footer Buttons */}
  <FormActions>
    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
    <Button variant="secondary" onClick={handleSaveAndNew}>Save & New</Button>
    <Button variant="primary" type="submit" loading={isSubmitting}>
      {isEdit ? 'Update Lead' : 'Create Lead'}
    </Button>
  </FormActions>
</LeadForm>
```

---

### 3.5 LEAD DETAIL PAGE

```tsx
<DetailPage>
  {/* Top Action Bar */}
  <DetailTopBar>
    <Breadcrumb items={['Leads', `${lead.firstName} ${lead.lastName}`]} />
    <div className="flex gap-2">
      <Button variant="outline" leftIcon={Edit}         onClick={() => navigate(`edit`)}>Edit</Button>
      <Button variant="outline" leftIcon={UserPlus}     onClick={openAssignModal}>Assign</Button>
      <Button variant="primary" leftIcon={ArrowRight}   onClick={openConvertModal}
              disabled={lead.isConverted}>
        {lead.isConverted ? 'Converted ✓' : 'Convert'}
      </Button>
      <Button variant="outline" leftIcon={Phone}        onClick={openLogCall}>Log Call</Button>
      <MoreActionsMenu items={['Log Email','Schedule Meeting','Add Task','Delete Lead']} />
    </div>
  </DetailTopBar>

  {/* Summary Card */}
  <LeadSummaryCard>
    <Avatar name={`${lead.firstName} ${lead.lastName}`} size="lg" />
    <h1>{lead.firstName} {lead.lastName}</h1>
    <p className="text-muted">{lead.jobTitle} @ {lead.company}</p>
    <StatusBadge status={lead.status} />
    <div className="contact-links">
      <a href={`mailto:${lead.email}`}><Mail /> {lead.email}</a>
      <a href={`tel:${lead.phone}`}><Phone /> {lead.phone}</a>
      {lead.website && <a href={lead.website} target="_blank"><Globe /> {lead.website}</a>}
    </div>
    <KeyValueGrid items={[
      { label: 'Lead Source', value: lead.leadSource },
      { label: 'Lead Owner',  value: <UserChip user={lead.owner} /> },
      { label: 'Created',     value: formatDate(lead.createdAt) },
      { label: 'Rating',      value: <StarDisplay value={lead.rating} /> },
      { label: 'Annual Rev.', value: formatCurrency(lead.annualRevenue) },
      { label: 'Employees',   value: lead.employees },
    ]} />
  </LeadSummaryCard>

  {/* Tabbed Sections */}
  <Tabs defaultTab="details">
    <Tab key="details" label="Details">
      <InfoSection title="Company" fields={[company, jobTitle, website, annualRevenue, employees]} />
      <InfoSection title="Address" fields={[street, city, state, zip, country]} />
    </Tab>
    <Tab key="activities" label={`Activities (${activitiesCount})`}>
      <ActivityTimeline activities={activities} onAdd={openActivityModal} />
    </Tab>
    <Tab key="notes" label="Notes">
      <NotesEditor lead={lead} />
    </Tab>
    <Tab key="history" label="History">
      <AuditLogTable logs={auditLogs} />
    </Tab>
  </Tabs>
</DetailPage>
```

---

### 3.6 LEAD CONVERSION MODAL

```tsx
<ConvertLeadModal open={open} onClose={onClose} lead={lead}>
  <h2>Convert Lead: {lead.firstName} {lead.lastName}</h2>
  <p className="text-muted">Select what to create when converting this lead.</p>

  {/* Contact Section */}
  <ConversionSection>
    <Toggle label="Create Contact" name="createContact" defaultChecked />
    <InfoBox>A contact will be created with lead's personal information.</InfoBox>
  </ConversionSection>

  {/* Account Section */}
  <ConversionSection>
    <Toggle label="Create / Link Account" name="createAccount" defaultChecked />
    <RadioGroup name="accountAction" options={[
      { label: 'Create new account', value: 'create' },
      { label: 'Use existing account', value: 'existing' },
    ]} />
    <ConditionalField showWhen="create">
      <TextField name="accountName" label="Account Name*" defaultValue={lead.company} />
    </ConditionalField>
    <ConditionalField showWhen="existing">
      <AccountSearch name="existingAccountId" placeholder="Search and select account..." />
    </ConditionalField>
  </ConversionSection>

  {/* Deal Section */}
  <ConversionSection>
    <Toggle label="Create Deal" name="createDeal" defaultChecked />
    <TextField   name="dealName"          label="Deal Name*"            defaultValue={`${lead.company} - Deal`} />
    <NumberField name="dealAmount"        label="Deal Value"             prefix="₹" placeholder="0.00" />
    <SelectField name="dealStage"         label="Deal Stage"             options={DEAL_STAGE_OPTIONS} defaultValue="PROSPECTING" />
    <DateField   name="expectedCloseDate" label="Expected Close Date"    placeholder="Select date" />
  </ConversionSection>

  <FormActions>
    <Button variant="outline"  onClick={onClose}>Cancel</Button>
    <Button variant="primary"  type="submit" loading={isConverting}>Convert Lead</Button>
  </FormActions>
</ConvertLeadModal>
```

---

### 3.7 CONTACTS FORM — All Fields

```tsx
<ContactForm>
  <FormSection title="Personal Information">
    <SelectField name="salutation"   label="Salutation"     options={['Mr','Ms','Mrs','Dr','Prof']}   placeholder="Select" />
    <TextField   name="firstName"    label="First Name*"    placeholder="Jane"   required />
    <TextField   name="lastName"     label="Last Name*"     placeholder="Smith"  required />
    <TextField   name="email"        label="Email"          placeholder="jane@company.com" />
    <TextField   name="phone"        label="Phone"          placeholder="+91 98765 43210" />
    <TextField   name="mobile"       label="Mobile"         placeholder="+91 98765 43210" />
    <SelectField name="gender"       label="Gender"         options={GENDER_OPTIONS} placeholder="Select" />
    <DateField   name="dateOfBirth"  label="Date of Birth"  placeholder="DD/MM/YYYY" />
  </FormSection>

  <FormSection title="Professional Information">
    <TextField   name="jobTitle"     label="Job Title"      placeholder="Product Manager" />
    <TextField   name="department"   label="Department"     placeholder="Engineering" />
    <AccountSearch name="accountId"  label="Account*"       placeholder="Search company..." />
    <SelectField name="leadSource"   label="Lead Source"    options={LEAD_SOURCE_OPTIONS} placeholder="Select" />
  </FormSection>

  <FormSection title="Social Profiles" collapsible>
    <TextField name="linkedinUrl"   label="LinkedIn URL"   placeholder="https://linkedin.com/in/..." />
    <TextField name="twitterHandle" label="Twitter Handle" placeholder="@handle" />
  </FormSection>

  <FormSection title="Mailing Address" collapsible defaultCollapsed>
    <TextField   name="mailingStreet"  label="Street"  placeholder="123 Business Park" />
    <TextField   name="mailingCity"    label="City"    placeholder="Bengaluru" />
    <TextField   name="mailingState"   label="State"   placeholder="Karnataka" />
    <TextField   name="mailingZip"     label="ZIP"     placeholder="560001" />
    <SelectField name="mailingCountry" label="Country" options={COUNTRY_LIST} placeholder="Select country" />
  </FormSection>

  <FormSection title="Preferences">
    <Checkbox name="doNotCall"   label="Do Not Call" />
    <Checkbox name="emailOptOut" label="Email Opt Out" />
  </FormSection>

  <FormSection title="Tags">
    <TagInput name="tags" placeholder="Add tags and press Enter..." />
  </FormSection>

  <FormSection title="Description" collapsible>
    <TextareaField name="description" label="Description" rows={4} placeholder="Notes about this contact..." />
  </FormSection>

  <FormSection title="Ownership">
    <UserSelect name="ownerId" label="Contact Owner" placeholder="Assign to a rep..." />
  </FormSection>

  <FormActions>
    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
    <Button variant="primary" type="submit" loading={isSubmitting}>
      {isEdit ? 'Update Contact' : 'Create Contact'}
    </Button>
  </FormActions>
</ContactForm>
```

---

### 3.8 DEALS KANBAN BOARD

```tsx
<KanbanBoard>
  {DEAL_STAGES.map(stage => (
    <KanbanColumn
      key={stage}
      title={STAGE_LABELS[stage]}
      count={stageDeals[stage].length}
      totalValue={formatCurrency(stageTotals[stage])}
      color={STAGE_COLORS[stage]}
      onDrop={(dealId) => handleStageDrop(dealId, stage)}
    >
      {stageDeals[stage].map(deal => (
        <DealCard key={deal.id} deal={deal}
          onClick={() => navigate(`/crm/deals/${deal.id}`)}
          draggable
          onDragStart={(e) => handleDragStart(e, deal.id)}
        >
          <DealCardHeader>
            <span className="font-semibold truncate">{deal.name}</span>
            <span className="text-primary font-bold">{formatCurrency(deal.amount)}</span>
          </DealCardHeader>
          <DealCardBody>
            {deal.account && <Chip icon={Building2}>{deal.account.name}</Chip>}
            {deal.expectedCloseDate && (
              <Chip icon={Calendar} variant={isPastDue(deal.expectedCloseDate) ? 'danger' : 'default'}>
                {formatDate(deal.expectedCloseDate)}
              </Chip>
            )}
            <ProgressBar value={deal.probability} label={`${deal.probability}%`} />
          </DealCardBody>
          <DealCardFooter>
            <UserAvatar user={deal.owner} size="xs" />
            <span className="text-xs text-muted">{timeAgo(deal.updatedAt)}</span>
          </DealCardFooter>
        </DealCard>
      ))}
      <Button variant="ghost" leftIcon={Plus} onClick={() => openNewDealInStage(stage)}>
        Add Deal
      </Button>
    </KanbanColumn>
  ))}
</KanbanBoard>
```

---

### 3.9 DEAL FORM — All Fields

```tsx
<DealForm>
  <FormSection title="Deal Information">
    <TextField   name="name"              label="Deal Name*"           placeholder="Acme Corp - Enterprise Plan"  required />
    <SelectField name="stage"             label="Stage*"               options={DEAL_STAGE_OPTIONS}    defaultValue="PROSPECTING" required />
    <NumberField name="amount"            label="Deal Value"            prefix="₹"  placeholder="0.00" />
    <NumberField name="probability"       label="Probability (%)"      min={0} max={100}  placeholder="0–100" />
    <DateField   name="expectedCloseDate" label="Expected Close Date*" placeholder="DD/MM/YYYY" required />
    <SelectField name="leadSource"        label="Lead Source"          options={LEAD_SOURCE_OPTIONS} placeholder="Select" />
  </FormSection>

  <FormSection title="Related Records">
    <AccountSearch  name="accountId"       label="Account"          placeholder="Search account..." />
    <ContactSearch  name="primaryContactId" label="Primary Contact" placeholder="Search contact..." />
    <TextField      name="campaignSource"  label="Campaign Source"  placeholder="e.g. Google Ads Q4" />
  </FormSection>

  <FormSection title="Additional Details" collapsible>
    <TextField     name="nextStep"    label="Next Step"      placeholder="Schedule demo call" />
    <TextareaField name="description" label="Description"    rows={3} placeholder="Deal notes..." />
    <TextareaField name="lossReason"  label="Loss Reason"    rows={2} placeholder="Why was deal lost? (if applicable)" />
  </FormSection>

  <FormSection title="Ownership">
    <UserSelect name="ownerId" label="Deal Owner" placeholder="Assign to rep..." />
  </FormSection>

  <FormActions>
    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
    <Button variant="primary" type="submit" loading={isSubmitting}>
      {isEdit ? 'Update Deal' : 'Create Deal'}
    </Button>
  </FormActions>
</DealForm>
```

---

### 3.10 ACTIVITY LOG MODAL (All Modules)

```tsx
<ActivityModal open={open} onClose={onClose} linkedEntity={entity}>
  <Tabs defaultTab="CALL">
    {['CALL','EMAIL','MEETING','TASK','NOTE'].map(type => (
      <Tab key={type} label={type}>
        <TextField   name="subject"      label="Subject*"      placeholder={`${type} subject...`} required />
        <DateTimePicker name="dueDate"   label="Date & Time"   placeholder="Select date and time" />
        <NumberField name="durationMins" label="Duration (min)" placeholder="30"
                     showWhen={['CALL','MEETING'].includes(type)} />
        <UserSelect  name="assignedTo"   label="Assigned To"   placeholder="Assign to..." />
        <TextareaField name="description" label="Notes"        rows={4} placeholder="Add details..." />
        <SelectField name="status"       label="Status"        options={ACTIVITY_STATUS_OPTIONS}
                     defaultValue="PENDING" />
      </Tab>
    ))}
  </Tabs>
  <FormActions>
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="primary" type="submit">Save Activity</Button>
  </FormActions>
</ActivityModal>
```

---

## 4. DASHBOARD & REPORTS PAGE

### 4.1 Dashboard Layout

```tsx
<DashboardPage>
  {/* Row 1: KPI Cards */}
  <KPIGrid columns={4}>
    <KPICard icon={Users}        color="blue"   title="Total Leads"       value={kpi.totalLeads}
             delta={+12}  deltaLabel="vs last month" />
    <KPICard icon={UserCheck}    color="green"  title="Converted Leads"   value={kpi.convertedLeads}
             delta={+5}   deltaLabel="vs last month" />
    <KPICard icon={TrendingUp}   color="purple" title="Open Deals"        value={kpi.openDeals} />
    <KPICard icon={DollarSign}   color="amber"  title="Pipeline Value"    value={formatCurrency(kpi.pipelineValue)} />
    <KPICard icon={CheckCircle}  color="green"  title="Closed Won (MTD)"  value={formatCurrency(kpi.closedWonMTD)} />
    <KPICard icon={XCircle}      color="red"    title="Closed Lost (MTD)" value={kpi.closedLostMTD} />
    <KPICard icon={Activity}     color="orange" title="Activities Today"  value={kpi.activitiesToday} />
    <KPICard icon={Percent}      color="teal"   title="Conversion Rate"   value={`${kpi.conversionRate}%`} />
  </KPIGrid>

  {/* Row 2: Pipeline Bar + Monthly Revenue */}
  <GridRow columns={2}>
    <Card title="Pipeline by Stage">
      <HorizontalBarChart
        data={pipelineByStage}
        xKey="value"
        yKey="stage"
        color={STAGE_COLORS}
        formatValue={formatCurrency}
        formatLabel={(d) => `${d.count} deals · ${formatCurrency(d.value)}`}
      />
    </Card>
    <Card title="Monthly Revenue (Closed Won)">
      <AreaChart
        data={monthlyRevenue}
        xKey="month"
        yKey="revenue"
        color="#4f46e5"
        formatY={formatCurrency}
      />
    </Card>
  </GridRow>

  {/* Row 3: Lead Status Donut + Top Performers */}
  <GridRow columns={2}>
    <Card title="Leads by Status">
      <DonutChart
        data={leadsByStatus}
        nameKey="status"
        valueKey="count"
        colors={LEAD_STATUS_CHART_COLORS}
      />
    </Card>
    <Card title="Top Sales Performers">
      <LeaderboardTable
        rows={topPerformers}
        columns={['Rank','Rep Name','Deals Won','Revenue','Win Rate']}
        highlightTop={3}
      />
    </Card>
  </GridRow>

  {/* Row 4: Recent Activities + Upcoming Tasks */}
  <GridRow columns={2}>
    <Card title="Recent Activities" action={<Link to="/crm/activities">View all</Link>}>
      <ActivityFeed activities={recentActivities} />
    </Card>
    <Card title="Upcoming Tasks & Reminders" action={<Button size="sm" onClick={openTaskModal}>+ Task</Button>}>
      <TaskList tasks={upcomingTasks} onComplete={completeTask} />
    </Card>
  </GridRow>

  {/* Row 5: Lead Source Funnel */}
  <Card title="Lead Source Breakdown">
    <HorizontalBarChart
      data={leadsBySource}
      xKey="count"
      yKey="source"
      showPercentage
    />
  </Card>
</DashboardPage>
```

### 4.2 Reports Page

```tsx
<ReportsPage>
  {/* Report Selector */}
  <ReportSidebar>
    <ReportNavItem label="Conversion Funnel"     icon={Filter} />
    <ReportNavItem label="Pipeline Analysis"     icon={BarChart2} />
    <ReportNavItem label="Sales Performance"     icon={TrendingUp} />
    <ReportNavItem label="Deal Forecast"         icon={Calendar} />
    <ReportNavItem label="Activity Summary"      icon={Activity} />
    <ReportNavItem label="Lead Source Analysis"  icon={PieChart} />
  </ReportSidebar>

  <ReportCanvas>
    {/* Date Range & Filter Controls */}
    <ReportFilters>
      <DateRangePicker label="Period" value={dateRange} onChange={setDateRange}
                       presets={['This Week','This Month','Last Month','This Quarter','This Year']} />
      <UserSelect      label="Sales Rep" placeholder="All Reps" value={repFilter} onChange={setRepFilter} />
      <Button variant="primary" onClick={runReport}>Run Report</Button>
      <Button variant="outline" leftIcon={Download} onClick={exportReport}>Export</Button>
    </ReportFilters>

    {/* CONVERSION FUNNEL REPORT */}
    <FunnelChart data={[
      { stage: 'Total Leads',     count: report.totalLeads },
      { stage: 'Contacted',       count: report.contacted },
      { stage: 'Qualified',       count: report.qualified },
      { stage: 'Deal Created',    count: report.dealCreated },
      { stage: 'Closed Won',      count: report.closedWon },
    ]} />

    {/* Summary Metrics Grid */}
    <MetricsGrid>
      <Metric label="Conversion Rate"        value={`${report.conversionRate}%`} />
      <Metric label="Avg Deal Size"          value={formatCurrency(report.avgDealSize)} />
      <Metric label="Avg Sales Cycle"        value={`${report.avgSalesCycleDays} days`} />
      <Metric label="Win Rate"               value={`${report.winRate}%`} />
    </MetricsGrid>

    {/* Detailed Data Table */}
    <ReportTable data={reportRows} columns={reportColumns} />
  </ReportCanvas>
</ReportsPage>
```

---

## 5. ZOD VALIDATION SCHEMAS

```typescript
// Lead
const leadSchema = z.object({
  salutation:    z.string().optional(),
  firstName:     z.string().min(1, 'First name is required'),
  lastName:      z.string().min(1, 'Last name is required'),
  email:         z.string().email('Invalid email').optional().or(z.literal('')),
  phone:         z.string().optional(),
  mobile:        z.string().optional(),
  company:       z.string().optional(),
  jobTitle:      z.string().optional(),
  leadSource:    z.enum(LEAD_SOURCES).optional(),
  status:        z.enum(LEAD_STATUSES).default('NEW'),
  rating:        z.number().min(1).max(5).optional(),
  website:       z.string().url().optional().or(z.literal('')),
  annualRevenue: z.number().nonnegative().optional(),
  employees:     z.number().int().nonnegative().optional(),
  description:   z.string().optional(),
  ownerId:       z.string().uuid().optional(),
  street: z.string().optional(), city: z.string().optional(),
  state: z.string().optional(),  zip: z.string().optional(), country: z.string().optional(),
});

// Deal
const dealSchema = z.object({
  name:               z.string().min(1, 'Deal name is required'),
  stage:              z.enum(DEAL_STAGES).default('PROSPECTING'),
  amount:             z.number().nonnegative().optional(),
  probability:        z.number().min(0).max(100).optional(),
  expectedCloseDate:  z.string().min(1, 'Close date is required'),
  leadSource:         z.enum(LEAD_SOURCES).optional(),
  accountId:          z.string().uuid().optional(),
  primaryContactId:   z.string().uuid().optional(),
  description:        z.string().optional(),
  nextStep:           z.string().optional(),
  lossReason:         z.string().optional(),
  campaignSource:     z.string().optional(),
  ownerId:            z.string().uuid().optional(),
});
```

---

## 6. ZUSTAND STORE STRUCTURE

```typescript
interface CRMStore {
  // Auth
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Lead Module
  leadFilters: LeadFilters;
  leadViewMode: 'table' | 'kanban';
  setLeadFilters: (f: Partial<LeadFilters>) => void;
  setLeadViewMode: (m: 'table' | 'kanban') => void;

  // Deal Module
  dealFilters: DealFilters;
  dealViewMode: 'table' | 'kanban';
  setDealFilters: (f: Partial<DealFilters>) => void;
  setDealViewMode: (m: 'table' | 'kanban') => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}
```

---

## 7. IMPLEMENTATION CHECKLIST

### Phase 1 — Foundation (Week 1–2)
- [ ] DB schema + Flyway V1 migration
- [ ] Spring Security JWT setup (login, refresh, logout)
- [ ] User management API + Role guard
- [ ] React app scaffold (Vite + TS + Tailwind + shadcn/ui)
- [ ] Layout: Sidebar + TopHeader + routing

### Phase 2 — Leads Module (Week 3)
- [ ] Lead CRUD API + repository + service
- [ ] Lead conversion service (transactional)
- [ ] LeadsListPage with table + filters + search + sort + pagination
- [ ] LeadFormPage (create + edit) with all fields + Zod validation
- [ ] LeadDetailPage with tabs + activity timeline
- [ ] LeadConvertModal with all 3-way creation

### Phase 3 — Contacts + Accounts (Week 4)
- [ ] Contact CRUD API
- [ ] Account CRUD API
- [ ] ContactsListPage + form + detail
- [ ] AccountsListPage + form + detail
- [ ] Tag system on contacts
- [ ] Activity log modal (shared across modules)

### Phase 4 — Deals + Pipeline (Week 5)
- [ ] Deal CRUD API
- [ ] Drag-drop stage update endpoint
- [ ] DealsKanbanBoard (DnD)
- [ ] DealsListPage (table view)
- [ ] DealFormPage + DealDetailPage

### Phase 5 — Dashboard + Reports (Week 6)
- [ ] Report service with all 6 report queries
- [ ] Dashboard API endpoint (single call)
- [ ] DashboardPage with all charts
- [ ] ReportsPage with 6 report types
- [ ] Export to CSV/Excel

### Phase 6 — Polish (Week 7)
- [ ] Notification system
- [ ] Bulk actions (assign, delete, export)
- [ ] Audit log viewer
- [ ] Role-based UI guards
- [ ] Responsive mobile layout
- [ ] ERP scaffold (empty pages)

---

## 8. ENVIRONMENT VARIABLES

```env
# Backend (application.yml)
spring.datasource.url=jdbc:postgresql://localhost:5432/crm_db
spring.datasource.username=crm_user
spring.datasource.password=crm_password
jwt.secret=<256-bit-secret>
jwt.access-token-expiry=15m
jwt.refresh-token-expiry=7d
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=CRM Pro
```

---

*End of Master Prompt — Feed this document in full to your AI code generator or engineering team.*