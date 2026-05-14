# EverX Platform — Complete Technical Reference

This document is the definitive, accurate reference to every module, controller, service, API endpoint, input field, entity, frontend page, hook, and store in the EverX CRM/ERP platform. Nothing more, nothing less.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & RBAC Module](#2-authentication--rbac-module)
3. [CRM Module](#3-crm-module)
4. [ERP Module](#4-erp-module)
5. [Finance Module](#5-finance-module)
6. [HR Module](#6-hr-module)
7. [Dashboard & Reporting Module](#7-dashboard--reporting-module)
8. [Insights Module](#8-insights-module)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Global Infrastructure](#10-global-infrastructure)

---

## 1. Architecture Overview

### Data Flow
```
Browser (React/Vite :5173)
  → axiosInstance (interceptors, token refresh, error toasts)
    → Vite Proxy → Spring Boot REST API (:8080)
      → Controller → Service → Repository → PostgreSQL (everx_db)
```

### Backend Layer Pattern (per module)
| Layer | Role |
|---|---|
| **Controller** | `@RestController` — HTTP routing, validation, `@PreAuthorize` permission gating |
| **Service** | `@Service` — Business logic, transaction orchestration |
| **Repository** | `JpaRepository` — Database access via Spring Data JPA |
| **Entity** | `@Entity` — JPA-mapped PostgreSQL table |
| **DTO** | Request/Response objects — decoupled from entities |

### Frontend Layer Pattern (per module)
| Layer | Role |
|---|---|
| **Api file** (`src/api/*.ts`) | Axios calls to backend REST endpoints |
| **Type file** (`src/types/*.ts`) | TypeScript interfaces for request/response shapes |
| **Page** (`src/pages/**/*.tsx`) | React page components (list, detail, form) |
| **Store** (`src/store/*.ts`) | Zustand state management |
| **Hook** (`src/hooks/*.ts`) | Reusable logic (permissions, notifications, etc.) |

---

## 2. Authentication & RBAC Module

### Backend

#### Entities (Schema: `everx_auth`)

**User**
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| email | String | Unique, NotBlank |
| passwordHash | String | BCrypt encoded |
| firstName | String | |
| lastName | String | |
| fullName | String | |
| phone | String | |
| role | Enum (UserRole) | ADMIN, MANAGER, SALES_REP, etc. |
| assignedRoles | Set\<Role\> | ManyToMany → `user_roles` join table |
| officeLocation | Enum | USA, UK, INDIA, UAE, GERMANY, AUSTRALIA, SINGAPORE |
| isActive | Boolean | |
| isDeleted | Boolean | Soft delete flag |
| lastLogin | OffsetDateTime | |
| avatarUrl | String | |
| version | Long | Optimistic locking |

**Role**
| Field | Type |
|---|---|
| id | UUID, PK |
| name | String (Unique) |
| description | String |
| isSystem | Boolean |
| isActive | Boolean |
| permissions | Set\<Permission\> (ManyToMany) |

**Permission**
| Field | Type |
|---|---|
| id | UUID, PK |
| permissionKey | String (Unique) — e.g. `CRM_VIEW`, `FINANCE_CREATE` |
| module | String — e.g. `CRM`, `FINANCE`, `HR` |
| action | String — e.g. `VIEW`, `CREATE`, `DELETE` |
| description | String |

**RefreshToken**
| Field | Type |
|---|---|
| id | UUID, PK |
| token | String |
| userId | UUID → User FK |
| expiresAt | OffsetDateTime |
| revoked | Boolean |

#### Controllers & Endpoints

**AuthController** — `/api/v1/auth`
| Method | Endpoint | Input Fields | Returns | Auth |
|---|---|---|---|---|
| POST | `/login` | `email` (required, @Email), `password` (required) | `LoginResponse` (accessToken, refreshToken, user) | Public |
| POST | `/refresh` | `refreshToken` (required) | `LoginResponse` | Public |
| POST | `/logout` | `refreshToken` (required) | Message | Public |
| GET | `/me` | — | `UserDto` | Bearer Token |
| GET | `/health` | — | Health status | Public |

**UserController** — `/api/v1/admin/users`
| Method | Endpoint | Input Fields | Permission |
|---|---|---|---|
| GET | `/` | `page`, `size` (query) | USER_VIEW |
| GET | `/{userId}` | UUID path param | USER_VIEW |
| GET | `/role/{role}` | role name path param, pagination | USER_VIEW |
| POST | `/` | `email`*(req, @Email)*, `password`*(req, min 8)*, `fullName`*(req)*, `phone`, `role`, `roles[]`, `isActive`, `officeLocation`*(req)* | USER_CREATE |
| PUT | `/{userId}` | `email`, `fullName`, `phone`, `role`, `roles[]`, `officeLocation`, `isActive` | USER_EDIT |
| DELETE | `/{userId}` | UUID path param | USER_DELETE |
| POST | `/{userId}/change-password` | `currentPassword`*(req)*, `newPassword`*(req)* | USER_EDIT |
| PATCH | `/{userId}/toggle-status` | — | USER_EDIT |

**RoleController** — `/api/v1/admin/roles`
| Method | Endpoint | Input Fields | Permission |
|---|---|---|---|
| GET | `/` | — | ROLE_VIEW |
| GET | `/permissions` | — | ROLE_VIEW |
| GET | `/locations` | — | ROLE_VIEW |
| POST | `/` | `name`*(req)*, `description`, `isActive`, `permissionKeys[]` | ROLE_CREATE |
| PUT | `/{roleId}` | `description`, `isActive` | ROLE_EDIT |
| PUT | `/{roleId}/permissions` | `permissionKeys[]` | ROLE_ASSIGN_PERMISSION |
| DELETE | `/{roleId}` | UUID path param | ROLE_DELETE |

#### Services
| Service | Key Methods |
|---|---|
| `AuthService` | `login()`, `refreshAccessToken()`, `logout()`, `getCurrentUser()` |
| `UserService` | `getAllUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()`, `changePassword()`, `toggleUserStatus()`, `getUsersByRole()` |
| `RoleService` | `getAllRoles()`, `createRole()`, `updateRole()`, `updateRolePermissions()`, `deleteRole()`, `getAllPermissions()`, `getAllOfficeLocations()` |

#### Repositories
`UserRepository`, `RoleRepository`, `PermissionRepository`, `RefreshTokenRepository`

### 11 System Roles (seeded by `RbacDataInitializer`)
`SUPER_ADMIN` → `ADMIN` → `MANAGER` → `SALES_MANAGER` → `FINANCE` → `HR` → `SERVICE_TECH` → `SALES_REP` → `EMPLOYEE` → `VIEWER` → `READ_ONLY`

---

## 3. CRM Module

### Backend

#### Entities (Schema: `everx_crm`)

**Account** — Companies/Organizations
| Field | Type |
|---|---|
| id | UUID, PK |
| name | String (required) |
| industry, accountType, website, phone, email | String |
| billingStreet, billingCity, billingState, billingZip, billingCountry | String |
| annualRevenue | BigDecimal |
| employees | Integer |
| description | Text |
| ownerId | UUID |

**Contact** — People linked to Accounts
| Field | Type |
|---|---|
| id | UUID, PK |
| accountId | UUID → Account FK |
| salutation, firstName*(req)*, lastName*(req)* | String |
| email, phone, mobile, jobTitle, department | String |
| gender, dateOfBirth, leadSource | String |
| mailingStreet/City/State/Zip/Country | String |
| linkedinUrl, twitterHandle, description | String |
| doNotCall, emailOptOut | Boolean |
| ownerId | UUID |

**Lead** — Sales prospects
| Field | Type |
|---|---|
| id | UUID, PK |
| salutation, firstName*(req)*, lastName*(req)* | String |
| email, phone, mobile, company, jobTitle | String |
| leadSource, status*(req)*, rating | String/Integer |
| website, street/city/state/zip/country | String |
| annualRevenue, employees, description | Various |
| isConverted, convertedAt | Boolean/DateTime |
| convertedContactId, convertedAccountId, convertedDealId | UUID |

**Deal** — Sales opportunities
| Field | Type |
|---|---|
| id | UUID, PK |
| name*(req)*, stage*(req)* | String |
| amount, probability | BigDecimal/Integer |
| expectedCloseDate, actualCloseDate | Date |
| leadSource, accountId, primaryContactId | String/UUID |
| description, lossReason, nextStep, campaignSource | String |

**Quote** — Pricing proposals linked to Deals
| Field | Type |
|---|---|
| id | UUID, PK |
| dealId*(req)* | UUID → Deal FK |
| quoteNumber, version, status | String/Integer |
| issuedDate, expiryDate | Date |
| currency, subtotal, taxAmount, totalAmount | String/BigDecimal |
| notes, terms, pdfUrl | String |
| lineItems | List\<QuoteLineItem\> |

**QuoteLineItem** — `equipmentId`, `description`, `quantity`, `unitPrice`, `discountPct`, `lineTotal`

**Activity** — Tasks, calls, meetings, emails
| Field | Type |
|---|---|
| id | UUID, PK |
| type*(req)* | String (CALL, MEETING, TASK, EMAIL) |
| subject, description, status | String |
| dueDate, completedAt | DateTime |
| durationMins | Integer |
| contactId, dealId, leadId, accountId, assignedTo | UUID |

#### Controllers & Endpoints

**AccountController** — `/api/v1/crm/accounts`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/` | List paginated |
| GET | `/search?q=` | Search by name |
| GET | `/{id}` | Get by ID |
| POST | `/` | Create account |
| PUT | `/{id}` | Update account |
| DELETE | `/{id}` | Delete account |

**ContactController** — `/api/v1/crm/contacts`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/` | List paginated |
| GET | `/search?q=` | Search |
| GET | `/{id}` | Get by ID |
| GET | `/account/{accountId}` | Get contacts for account |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**LeadController** — `/api/v1/crm/leads`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/` | List paginated, sortable |
| GET | `/search?q=&status=&source=` | Full-text search with filters |
| GET | `/{id}` | Get by ID |
| GET | `/status/{status}` | Filter by status |
| POST | `/` | Create lead |
| PUT | `/{id}` | Update lead |
| DELETE | `/{id}` | Delete |
| POST | `/{id}/convert` | Convert lead → Contact/Account/Deal |

**Lead Convert Input:** `createAccount`(bool), `accountName`, `createDeal`(bool), `dealName`, `dealAmount`, `expectedCloseDate`

**DealController** — `/api/v1/crm/deals`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/search`, `/{id}`, `/account/{accountId}`, `/stage/{stage}` | List/Search/Get |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**QuoteController** — `/api/v1/crm/quotes`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}`, `/deal/{dealId}` | List/Get |
| POST | `/` | Create with line items |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**ActivityController** — `/api/v1/crm/activities`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}`, `/deal/{dealId}`, `/lead/{leadId}`, `/contact/{contactId}`, `/overdue` | List/Get/Filter |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| PATCH | `/{id}/complete` | Mark completed |
| DELETE | `/{id}` | Delete |

**ReportController** — `/api/v1/crm/reports`
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/dashboard` | `ReportDashboardKPIs` (org-wide) |
| GET | `/dashboard/user` | KPIs for logged-in user |
| GET | `/dashboard/team` | KPIs for user's team |
| GET | `/pipeline`, `/pipeline/user`, `/pipeline/team` | `ReportPipeline` |
| GET | `/conversion`, `/conversion/user`, `/conversion/team` | `ReportConversion` |
| GET | `/activities`, `/activities/user`, `/activities/team` | `ReportActivity` |
| GET | `/` | Full combined report |

#### Services
`AccountService`, `ContactService`, `LeadService` (+ `LeadConversionService`), `DealService`, `QuoteService` (+ `PdfService`), `ActivityService`, `ReportService`

---

## 4. ERP Module

### Backend

#### Sub-Modules & Controllers

**EquipmentController** — `/api/v1/erp/equipment`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}` | List/Get |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**Equipment Entity Fields:** `internalCode`, `make`, `model`, `serialNumber`, `category`, `sliceConfig`, `fieldStrength`, `conditionGrade`, `status`, `warehouseLocation`, `acquisitionCost`, `acquisitionCurrency`, `askingPrice`, `askingCurrency`, `yearOfManufacture`, `hoursOfUse`, `tgaCompliant`, `ceMarked`, `fdaCleared`, `locationCountry`, `software`, `softwareVersion`, `tubeType`, `installedOptions`, `detectorSize`, `tubeReplaced`, `tubeScanSeconds`, `numRxChannels`, `coils`, `choiceOfProbes`, `tubeManufactured`, `flatDetectorManufactured`, `notes`, `images[]`

**EquipmentQCController** — `/api/v1/erp/equipment/qc` — Quality control checks

**InventoryItemController** — `/api/v1/erp/inventory`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}` | List/Get |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**Inventory Item Fields:** `itemCode`*(req)*, `name`*(req)*, `description`, `category`*(req)*, `unitOfMeasure`*(req)*, `quantity`*(req)*, `minStockLevel`, `maxStockLevel`, `reorderPoint`, `unitPrice`, `supplierName`, `location`, `barcode`, `sku`, `status`

**InventoryStockController** — `/api/v1/erp/inventory/...`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/ledger` | Get stock ledger entries |
| GET | `/bins` | Get bin locations |
| GET | `/transfers` | List transfers |
| POST | `/transfers` | Create transfer |
| POST | `/adjustments` | Stock adjustment |
| GET | `/reorder-suggestions` | Auto-reorder suggestions |

**PurchaseOrderController** — `/api/v1/erp/purchase-orders`
| Method | Endpoint |
|---|---|
| GET/POST | `/`, `/{id}` |
| PUT/DELETE | `/{id}` |

**SalesOrderController** — `/api/v1/erp/sales-orders`
| Method | Endpoint |
|---|---|
| GET/POST | `/`, `/{id}` |
| PUT/DELETE | `/{id}` |
| PATCH | `/{id}/confirm`, `/{id}/cancel` |

**ShipmentController** — `/api/v1/erp/shipments` — Full CRUD

**SparePartController** — `/api/v1/erp/spareparts` — Full CRUD

**SubcontractorController** — `/api/v1/erp/subcontractors` — Full CRUD

**SupplierController** — `/api/v1/erp/suppliers` — Full CRUD

**WarrantyController** — `/api/v1/erp/warranties`
| Method | Endpoint |
|---|---|
| GET | `/`, `/{id}`, `/equipment/{equipmentId}`, `/account/{accountId}`, `/expiring` |
| POST/PUT/DELETE | `/`, `/{id}` |

**ServiceTicketController** — `/api/v1/erp/service-tickets` — Full CRUD
**ServiceTicketWorkflowController** — Workflow state transitions

**FieldJobController** — `/api/v1/erp/field-jobs`
| Method | Endpoint |
|---|---|
| GET | `/`, `/{id}`, `/technician/{techId}`, `/status/{status}`, `/stats` |
| POST/PUT/DELETE | `/`, `/{id}` |
| PATCH | `/{id}/status` |

**FieldJobWorkflowController** — `/api/v1/erp/field-jobs/{id}/workflow`
**FieldJobTestController** — `/api/v1/erp/field-jobs/test` (dev/QA)

**ERPFieldMappingController** — `/api/v1/erp/mappings` — Custom field mapping system

#### Services
`EquipmentService`, `EquipmentQCService`, `InventoryItemService`, `InventoryStockService`, `PurchaseOrderService`, `SalesOrderService`, `ShipmentService`, `SparePartService`, `SubcontractorService`, `SupplierService`, `WarrantyService`, `ServiceTicketService`, `FieldJobService`, `ERPFieldMappingService`, `CRMERPLinkingService`, `ErtpScheduledTasksService`

---

## 5. Finance Module

### Backend

#### Entities (Schema: `everx_finance`)

**Invoice**
| Field | Type |
|---|---|
| id | UUID, PK |
| invoiceNumber | String (unique) |
| accountId | UUID → Account FK |
| entity | Enum (USA, UK, INDIA, UAE, GERMANY, AUSTRALIA, SINGAPORE) |
| status | Enum (DRAFT, SENT, PAID, OVERDUE, VOID, PARTIALLY_PAID) |
| issueDate, dueDate | LocalDate |
| currency | String |
| subtotal, taxAmount, totalAmount, paidAmount | BigDecimal |
| notes | Text |

**Payment**
| Field | Type |
|---|---|
| id | UUID, PK |
| invoiceId | UUID → Invoice FK |
| amount | BigDecimal |
| paymentDate | LocalDate |
| paymentMethod | String |
| referenceNumber, notes | String |

**CurrencyRate** — `baseCurrency`, `targetCurrency`, `rate`, `effectiveDate`

#### Controllers & Endpoints

**InvoiceController** — `/api/v1/finance/invoices`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/` | List paginated |
| GET | `/{id}` | Get by ID |
| GET | `/number/{invoiceNumber}` | Get by invoice number |
| GET | `/account/{accountId}` | Get by account |
| GET | `/status/{status}` | Filter by status |
| GET | `/entity/{entity}` | Filter by legal entity |
| GET | `/overdue` | Get overdue invoices |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| PATCH | `/{id}/status?status=` | Change status |
| POST | `/{id}/reverse` | Reverse invoice |
| DELETE | `/{id}` | Delete |

**Invoice Create Fields:** `invoiceNumber`, `accountId`*(req)*, `entity`, `issueDate`, `dueDate`, `currency`, `subtotal`, `taxAmount`, `totalAmount`, `notes`

**PaymentController** — `/api/v1/finance/payments`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}` | List/Get |
| GET | `/invoice/{invoiceId}` | Payments for invoice |
| POST | `/` | Record payment |
| DELETE | `/{id}` | Delete |

**Payment Create Fields:** `invoiceId`*(req)*, `amount`*(req)*, `paymentDate`, `paymentMethod`, `referenceNumber`, `notes`

**CurrencyRateController** — `/api/v1/finance/currency-rates`
| Method | Endpoint |
|---|---|
| GET | `/`, `/{id}`, `/latest`, `/base/{baseCurrency}`, `/convert` |
| POST/PUT/DELETE | `/`, `/{id}` |

**FxRateHistoryController** — `/api/v1/finance/fx-rates`
| GET | `/`, `/current`, `/historical` |
| POST | `/`, `/calculate-gain-loss` |

**AccountDeterminationController** — `/api/v1/finance/account-determinations` — GL account mapping
**IntercompanyConsolidationController** — `/api/v1/finance/consolidation` — Multi-entity elimination
**PostingPeriodController** — `/api/v1/finance/posting-periods` — `/close`, `/open`
**InvoiceToleranceConfigController** — `/api/v1/finance/tolerance-config` — 3-way match tolerances

**Finance ReportController** — `/api/v1/finance/reports`
| GET | `/p-l` | Profit & Loss |
| GET | `/ar-aging` | Accounts Receivable aging |
| GET | `/cash-flow` | Cash flow report |

#### Services
`InvoiceService`, `PaymentService`, `CurrencyRateService`, `FxRateHistoryService`, `FxRateLockingService`, `AccountDeterminationService`, `IntercompanyEliminationService`, `PostingPeriodService`, `DocumentReversalService`, `ThreeWayMatchService`, `ReportService`

---

## 6. HR Module

### Backend

#### Entities (Schema: `everx_hr`)

**Employee**
| Field | Type |
|---|---|
| id | UUID, PK |
| employeeId | String (unique) |
| firstName, lastName, email, phone | String |
| departmentId | UUID → Department FK |
| positionId | UUID → Position FK |
| managerId | UUID (self-ref) |
| hireDate, terminationDate | LocalDate |
| status | Enum: ACTIVE, ON_LEAVE, TERMINATED, SUSPENDED |
| employmentType | Enum: FULL_TIME, PART_TIME, CONTRACT, INTERN |
| salary | BigDecimal |
| currency | String |

**Department** — `name`*(req)*, `code`, `description`, `managerId`, `parentDepartmentId`

**Position** — `title`*(req)*, `departmentId`, `description`, `grade`, `minSalary`, `maxSalary`, `currency`, `isActive`

**LeaveRequest**
| Field | Type |
|---|---|
| employeeId | UUID*(req)* |
| leaveType | Enum: ANNUAL, SICK, PERSONAL, MATERNITY, PATERNITY, UNPAID |
| startDate, endDate | LocalDate*(req)* |
| status | Enum: PENDING, APPROVED, REJECTED, CANCELLED |
| reason, notes, approvedBy | String |

**Timesheet**
| Field | Type |
|---|---|
| employeeId | UUID*(req)* |
| weekStartDate | LocalDate*(req)* |
| totalHours | BigDecimal |
| status | Enum: DRAFT, SUBMITTED, APPROVED, REJECTED |
| notes, approvedBy | String |

**PayrollProfile** — `employeeId`, `payType`, `payFrequency`, `baseSalary`, `currency`, etc.
**PayrollRun** — `periodStart`, `periodEnd`, `status` (DRAFT→APPROVED→PAID), `totalGross`, `totalDeductions`, `totalNet`, items[]

#### Controllers & Endpoints

**EmployeeController** — `/api/v1/hr/employees`
| Method | Endpoint |
|---|---|
| GET | `/`, `/{id}` |
| POST | `/` |
| PUT | `/{id}` |
| DELETE | `/{id}` |

**Employee Create Fields:** `employeeId`, `firstName`*(req)*, `lastName`*(req)*, `email`*(req)*, `phone`, `departmentId`, `positionId`, `managerId`, `hireDate`, `status`, `employmentType`, `salary`, `currency`

**DepartmentController** — `/api/v1/hr/departments` — Full CRUD
**PositionController** — `/api/v1/hr/positions` — Full CRUD

**LeaveController** — `/api/v1/hr/leave-requests`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}`, `/employee/{employeeId}` | List/Get |
| POST | `/` | Submit request |
| PUT | `/{id}` | Update |
| PATCH | `/{id}/approve?approvedBy=` | Approve |

**TimesheetController** — `/api/v1/hr/timesheets`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{id}`, `/employee/{employeeId}` | List/Get |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| PATCH | `/{id}/submit` | Submit for review |
| PATCH | `/{id}/approve?approvedBy=` | Approve |

**PayrollController** — `/api/v1/hr`
| Method | Endpoint | Action |
|---|---|---|
| PUT | `/payroll-profiles` | Create/Update payroll profile |
| GET | `/payroll-profiles/{employeeId}` | Get profile |
| POST | `/payroll-runs` | Create payroll run |
| GET | `/payroll-runs`, `/payroll-runs/{id}` | List/Get runs |
| PATCH | `/payroll-runs/{id}/approve` | Approve run |
| PATCH | `/payroll-runs/{id}/pay` | Mark as paid |

#### Services
`EmployeeService`, `DepartmentService`, `PositionService`, `LeaveService`, `TimesheetService`, `PayrollService`

---

## 7. Dashboard & Reporting Module

### Backend

**ReportingDashboardController** — `/api/v1/dashboards`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/` | List user dashboards |
| GET | `/default` | Get default dashboard |
| GET | `/{dashboardId}` | Get specific dashboard |
| POST | `/` | Create dashboard |
| PUT | `/{dashboardId}` | Update dashboard |
| DELETE | `/{dashboardId}` | Delete dashboard |
| GET | `/{dashboardId}/widgets` | List widgets |
| POST | `/{dashboardId}/widgets` | Add widget |
| PUT | `/{dashboardId}/widgets/{widgetId}` | Update widget |
| DELETE | `/{dashboardId}/widgets/{widgetId}` | Delete widget |
| POST | `/{dashboardId}/widgets/batch-update-positions` | Reorder widgets |

**RoleDashboardMetricsController** — `/api/v1/dashboards`
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/finance/metrics` | `FinanceDashboardMetrics` |
| GET | `/hr/metrics` | `HRDashboardMetrics` |
| GET | `/operations/metrics` | `OperationsDashboardMetrics` |

**ReportBuilderController** — `/api/v1/reports`
| Method | Endpoint | Action |
|---|---|---|
| GET | `/`, `/{reportId}` | List/Get report definitions |
| POST | `/` | Create report definition |
| PUT | `/{reportId}` | Update report |
| POST | `/{reportId}/clone` | Clone report |
| DELETE | `/{reportId}` | Delete report |
| POST | `/{reportId}/execute` | Execute dynamic query |
| POST | `/{reportId}/export` | Export CSV/Excel |
| POST | `/{reportId}/jasper/execute` | Run Jasper report |
| POST | `/{reportId}/jasper/export-pdf` | Export PDF |
| POST | `/{reportId}/jasper/export-excel` | Export Excel |
| GET | `/metadata/fields` | Available data fields |
| GET | `/metadata/modules` | Available modules |

**DashboardController** — `/api/v1/admin/dashboard/metrics` — Admin analytics

#### Services
`RoleDashboardMetricsService`, `ReportingDashboardService`, `ReportingDashboardWidgetService`, `ReportDefinitionService`, `ReportExecutionService`, `DynamicReportService`, `JasperReportService`, `JasperExecutionService`, `ReportCacheService`, `ReportMetadataService`, `CsvExportService`, `ExcelExportService`, `ExportService`

---

## 8. Insights Module

**MyInsightsController** — `/api/v1/me`
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/insights` | `MyInsightsResponse` — Personalized data summary for logged-in user |

**Service:** `MyInsightsService`

---

## 9. Frontend Architecture

### State Management — Zustand Stores (`src/store/`)

**authStore.ts** — Session management
| State | Type | Purpose |
|---|---|---|
| user | User \| null | Current user object |
| accessToken | string \| null | JWT access token |
| refreshToken | string \| null | JWT refresh token |
| isAuthenticated | boolean | Derived auth state |
| isLoading | boolean | Loading flag |

| Action | Purpose |
|---|---|
| `login(user, accessToken, refreshToken)` | Sets full session |
| `logout()` | Clears everything |
| `setUser()`, `setAccessToken()`, `setRefreshToken()` | Individual setters |

Persisted to `localStorage` under key `everx_auth_store`. Normalizes roles/permissions to uppercase on rehydration.

**notificationStore.ts** — In-app notification panel state
**settingsStore.ts** — UI preferences (theme, layout)

### Custom Hooks (`src/hooks/`)

**usePermissions.ts** — Central RBAC hook
| Export | Purpose |
|---|---|
| `hasPermission(key)` | Check single permission |
| `hasAnyPermission(keys[])` | Check if user has at least one |
| `hasAllPermissions(keys[])` | Check if user has all |
| `primaryRole` | Deterministic highest-priority role |
| `getDashboardRoute()` | Returns correct dashboard path for user's primary role |
| `canAccessModule(module)` | Module-level access check |

**Role Priority Order:** SUPER_ADMIN → ADMIN → MANAGER → SALES_MANAGER → FINANCE → HR → SERVICE_TECH → SALES_REP → EMPLOYEE → VIEWER → READ_ONLY

**useNotification.ts** — Toast notification helpers
**useMappedFields.ts** — Dynamic ERP field mapping
**useUnsavedChangesWarning.ts** — Blocks navigation on dirty forms

### API Layer (`src/api/`)

| File | Backend Module | Key Functions |
|---|---|---|
| `authApi.ts` | Auth | `login()`, `me()`, `refreshToken()`, `logout()` |
| `adminApi.ts` | Admin/RBAC | `getUsers()`, `createUser()`, `getRoles()`, `createRole()`, `updateRolePermissions()` |
| `crmApi.ts` | CRM | `accountApi`, `contactApi`, `leadApi`, `dealApi`, `quoteApi`, `activityApi`, `reportApi` |
| `erpApi.ts` | ERP | `erpApi`, `equipmentApi`, `inventoryApi`, `purchaseOrderApi`, `salesOrderApi`, `shipmentApi`, `sparePartApi`, `subcontractorApi`, `supplierApi`, `warrantyApi`, `serviceTicketApi` |
| `financeApi.ts` | Finance | `invoiceApi`, `paymentApi`, `currencyRateApi`, `reportApi` |
| `hrApi.ts` | HR | `employeeApi`, `departmentApi`, `positionApi`, `leaveRequestApi`, `timesheetApi`, `payrollApi` |
| `dashboardApi.ts` | Dashboard | `dashboardApi` (CRUD + widgets + role metrics) |
| `fieldworkApi.ts` | Fieldwork | Field job CRUD, workflow transitions, parts, scheduling |
| `fieldJobApi.ts` | Field Jobs | Simplified field job access |
| `reportApi.ts` | Reporting | Report builder, execution, export |
| `warrantyApi.ts` | Warranties | Dedicated warranty CRUD |
| `assetAuditApi.ts` | Asset Audits | Audit scheduling/tracking |
| `erpMappingApi.ts` | ERP Mappings | Custom field mappings |
| `insightsApi.ts` | Insights | `getMyInsights()` |
| `axiosInstance.ts` | Infrastructure | Base URL, Bearer token injection, refresh interceptor, global error toasts |

### Frontend Pages (`src/pages/`)

| Directory | Pages |
|---|---|
| `auth/` | LoginPage |
| `dashboard/` | DashboardPage, DashboardHomePage, FinanceDashboardPage, HRDashboardPage, OperationsDashboardPage, FieldworkDashboardPage, EmployeeDashboardPage, MyWorkDashboardPage, FreshworksDashboardPage |
| `accounts/` | AccountListPage, AccountDetailPage, AccountFormPage |
| `contacts/` | ContactListPage, ContactDetailPage, ContactFormPage |
| `leads/` | LeadListPage, LeadDetailPage, LeadFormPage |
| `deals/` | DealListPage, DealDetailPage, DealFormPage |
| `quotes/` | QuoteListPage, QuoteDetailPage, QuoteFormPage |
| `activities/` | ActivityListPage, ActivityDetailPage, ActivityFormPage |
| `equipment/` | EquipmentListPage, EquipmentDetailPage, EquipmentFormPage |
| `erp/inventory/` | InventoryList, InventoryDetail, InventoryForm, InventoryLedger, InventoryTransfers |
| `purchaseorders/` | POListPage, PODetailPage, POFormPage |
| `salesorders/` | SOListPage, SODetailPage, SOFormPage |
| `shipments/` | ShipmentListPage, ShipmentDetailPage, ShipmentFormPage |
| `spareparts/` | SparePartListPage, SparePartDetailPage, SparePartFormPage |
| `subcontractors/` | SubcontractorListPage, SubcontractorDetailPage, SubcontractorFormPage |
| `suppliers/` | SupplierListPage, SupplierDetailPage, SupplierFormPage |
| `warranties/` | WarrantyListPage, WarrantyDetailPage, WarrantyFormPage |
| `servicetickets/` | ServiceTicketsListPage, ServiceTicketDetailPage, ServiceTicketForm |
| `fieldwork/` | FieldworkListPage, FieldworkDetailPage, FieldworkFormPage |
| `invoices/` | InvoiceListPage, InvoiceDetailPage, InvoiceFormPage |
| `payments/` | PaymentListPage, PaymentDetailPage |
| `finance/` | FinanceReportsPage |
| `hr/` | Employee/Department/Position List/Detail/Form, LeaveRequest List/Detail/Form, Timesheet List/Detail/Form, PayrollRun List/Detail/Form, PayrollProfilePage, ReimbursementRequestPage |
| `reports/` | ReportListPage, CustomReportBuilderPage, TemplateReportPage |
| `admin/` | UserManagementPage, RoleManagementPage |
| `insights/` | MyInsightsPage |
| `workspace/` | WorkspaceHomePage |
| `notifications/` | NotificationsPage |
| `profile/` | UserProfilePage |

### Components (`src/components/`)

| Directory | Contains |
|---|---|
| `layout/` | Sidebar, TopBar, MainLayout |
| `rbac/` | `FeatureGate` — conditional rendering by permission |
| `dashboard/` | Dashboard widget components |
| `form/` | Shared form elements |
| `reports/` | Report builder UI components |
| `NotificationPanel.tsx` | Global notification overlay |

---

## 10. Global Infrastructure

### Backend Shared (`com.everx.shared/`, `com.everx.config/`, `com.everx.admin/`)

| Component | Purpose |
|---|---|
| `ApiResponse<T>` | Unified JSON envelope: `{ success, message, data, errors, timestamp }` |
| `GlobalExceptionHandler` | Catches all exceptions → standardized error responses |
| `JwtAuthenticationFilter` | Extracts JWT from `Authorization: Bearer` header |
| `SecurityConfig` | CORS, CSRF, session policy, endpoint security rules |
| `RbacDataInitializer` | Seeds 11 system roles + 40+ permissions on first boot |
| `AdminUserInitializer` | Creates `admin@everx.com` / `Admin@123!` on first boot |
| `MockOperationalDataInitializer` | Seeds demo employees, invoices, accounts |
| `AuditLogService` | Action audit trail |
| `CryptographicAuditLogService` | Tamper-proof audit log |
| `DataScopeService` | Row-level security (ORG / TEAM / OWN) |
| `MailService` | Email dispatch integration |
| `SagaOrchestrator` | Distributed transaction coordination |
| `DataWarehouseSnapshotScheduler` | Periodic data snapshots |

### Frontend Global

| Component | Purpose |
|---|---|
| `axiosInstance.ts` | Base Axios client with `baseURL: /api`, Bearer token injection, 401/403 → auto-refresh + force-logout, global `react-hot-toast` error notifications |
| `App.tsx` | 1400+ line router with `ProtectedRoute` + `DashboardLandingRoute` + `AuthSessionSync` + `Toaster` |
| `ProtectedRoute` | Infers required permissions from route path, redirects to login if unauthenticated |
| `DashboardLandingRoute` | Reads `primaryRole` from `usePermissions` → redirects to correct dashboard |

### PostgreSQL Schemas
| Schema | Module |
|---|---|
| `everx_auth` | Users, Roles, Permissions, Refresh Tokens |
| `everx_crm` | Accounts, Contacts, Leads, Deals, Quotes, Activities |
| `everx_erp` | Equipment, Inventory, POs, SOs, Shipments, Warranties, Field Jobs, Service Tickets |
| `everx_finance` | Invoices, Payments, Currency Rates, FX, Posting Periods |
| `everx_hr` | Employees, Departments, Positions, Leave, Timesheets, Payroll |
| `everx_reporting` | Report Definitions, Dashboards, Widgets |
| `everx_shared` | Saga States, Audit Logs |

---

*This document is auto-generated from the live EverX codebase. Last updated: April 2026.*
