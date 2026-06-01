# Finance Module - Comprehensive Implementation Guide

## Overview
The Finance Module provides comprehensive financial management capabilities including:
- Chart of Accounts (COA) with hierarchical structure
- General Ledger (GL) with posting and approval workflows
- Accounts Payable (AP) with vendor invoice management
- Accounts Receivable (AR) with customer invoice management
- Automated integration between AP/AR and GL
- Financial reporting and aging analysis
- Batch jobs for automated operations

## Architecture

### Backend Stack
- **Framework**: Spring Boot 3.3
- **Database**: PostgreSQL
- **ORM**: Jakarta Persistence (JPA)
- **Build**: Maven
- **Security**: RBAC

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand + @tanstack/react-query
- **Styling**: Tailwind CSS

## Module Components

### 1. Chart of Accounts (COA)
**Purpose**: Master list of GL accounts with hierarchical structure

**Files**:
- Entity: `GlAccount.java`
- Repository: `GlAccountRepository.java`
- DTO: `GlAccountDto.java`
- Service: `GlAccountService.java`
- Controller: `GlAccountController.java`
- Frontend: `CoaPage.tsx`, `CoaTree.tsx`, `CoaList.tsx`, `CoaForm.tsx`

**API Endpoints**:
```
POST   /api/finance/coa                - Create account
PUT    /api/finance/coa/{id}           - Update account
GET    /api/finance/coa/{id}           - Get account
GET    /api/finance/coa                - List accounts
GET    /api/finance/coa/tree           - Get account tree
DELETE /api/finance/coa/{id}           - Delete account
```

**Key Features**:
- Hierarchical account structure (parent-child relationships)
- Account types: Asset, Liability, Equity, Revenue, Expense
- Normal balance (Debit/Credit)
- Account validation and constraints

### 2. General Ledger (GL)
**Purpose**: Core double-entry bookkeeping system

**Files**:
- Entities: `JournalEntry.java`, `JournalEntryLine.java`, `PostingPeriod.java`
- Repositories: `JournalEntryRepository.java`, `JournalEntryLineRepository.java`
- Service: `GlJournalService.java`
- Controller: `GlJournalController.java`
- Frontend: `GlTrialBalance.tsx`

**API Endpoints**:
```
POST   /api/finance/gl/{journalId}/post      - Post journal
POST   /api/finance/gl/{journalId}/approve   - Approve journal
POST   /api/finance/gl/{journalId}/reject    - Reject journal
GET    /api/finance/gl/trial-balance?asOfDate - Get trial balance
GET    /api/finance/gl/account-balances      - Get account balances
```

**Key Features**:
- Journal entry creation with multiple lines
- Approval workflow (Draft → Approved → Posted)
- Trial balance calculation
- Account balance tracking
- Period-based posting control

### 3. Accounts Payable (AP)
**Purpose**: Vendor invoice and payment management

**Files**:
- Entity: `VendorInvoice.java`, `ApPayment.java`
- Repositories: `VendorInvoiceRepository.java`, `ApPaymentRepository.java`
- Service: `ApService.java`
- Controller: `ApController.java`
- Frontend: `ApAgingReport.tsx`
- Batch Job: `ApAgingJob.java`

**API Endpoints**:
```
POST   /api/finance/ap/invoices         - Record invoice
POST   /api/finance/ap/payments         - Record payment
GET    /api/finance/ap/aging            - Get aging report
GET    /api/finance/ap/vendor/{id}      - Get vendor invoices
GET    /api/finance/ap/payment-schedule - Get payment schedule
```

**Key Features**:
- Vendor invoice recording and tracking
- Payment recording with partial payment support
- Aging report generation (30+ days overdue)
- Automatic late fee calculation
- Payment scheduling

### 4. Accounts Receivable (AR)
**Purpose**: Customer invoice and receipt management

**Files**:
- Entity: `CustomerInvoice.java`, `ArPayment.java`, `ArCreditLimit.java`
- Repositories: `CustomerInvoiceRepository.java`, `ArPaymentRepository.java`
- Service: `ArService.java`
- Controller: `ArController.java`
- Frontend: `ArAgingReport.tsx`
- Batch Job: `ArReminderJob.java`

**API Endpoints**:
```
POST   /api/finance/ar/invoices              - Create invoice
POST   /api/finance/ar/payments              - Record payment
GET    /api/finance/ar/aging                 - Get aging report
GET    /api/finance/ar/customer/{id}         - Get customer invoices
PUT    /api/finance/ar/credit-limits/{id}    - Update credit limit
```

**Key Features**:
- Customer invoice creation with credit limit validation
- Receipt recording with partial payment support
- Aging report generation
- Credit limit management and enforcement
- Automatic reminder job for overdue invoices

### 5. Integration & Auto-Posting
**Purpose**: Automated GL posting for AP/AR transactions

**Files**:
- Service: `ApArGlIntegrationService.java`

**Key Features**:
- AP invoice → GL posting (Debit Expense, Credit Payable)
- AP payment → GL posting (Debit Payable, Credit Bank)
- AR invoice → GL posting (Debit Receivable, Credit Revenue)
- AR receipt → GL posting (Debit Bank, Credit Receivable)

### 6. Reports & Analytics
**Purpose**: Financial reporting and analysis

**Files**:
- Service: `FinanceReportService.java`
- Controller: `FinanceReportController.java`

**Report Types**:
1. **Trial Balance**: Account balances as of a date
2. **AP Aging**: Vendor invoice aging analysis
3. **AR Aging**: Customer invoice aging analysis
4. **Cash Flow**: Projected inflows/outflows

**API Endpoints**:
```
GET /api/finance/reports/trial-balance?asOfDate       - Trial balance
GET /api/finance/reports/ap-aging                      - AP aging
GET /api/finance/reports/ar-aging                      - AR aging
GET /api/finance/reports/cash-flow?startDate&endDate   - Cash flow
```

### 7. Batch Jobs
**Purpose**: Automated scheduled operations

**Jobs**:
1. **ApAgingJob** (Daily 2 AM)
   - Calculate AP aging
   - Apply late fees (1% for 30+ days overdue)
   
2. **ArReminderJob** (Daily 3 AM)
   - Identify overdue AR invoices (15+ days)
   - Send reminders to customers

## Database Schema

### Core Tables
- `gl_accounts` - Chart of Accounts master
- `journal_entries` - GL journal entries
- `journal_entry_lines` - GL journal line items
- `posting_periods` - Period control and status
- `vendor_invoices` - AP invoices
- `ap_payments` - AP payment records
- `customer_invoices` - AR invoices
- `ar_payments` - AR receipt records
- `ar_credit_limits` - Customer credit limits

### Key Columns
All tables include:
- `id` (Primary Key)
- `created_date` (Audit)
- `created_by` (Audit)
- `updated_date` (Audit)
- `updated_by` (Audit)
- `version` (Optimistic Locking)

## Configuration

### Application Properties
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/finance_db
spring.datasource.username=postgres
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Scheduling
spring.task.scheduling.pool.size=2
spring.task.scheduling.thread-name-prefix=finance-batch-
```

### Enable Scheduling
Add `@EnableScheduling` annotation to main application class

## Usage Guide

### Creating Chart of Accounts
```bash
curl -X POST http://localhost:8080/api/finance/coa \
  -H "Content-Type: application/json" \
  -d '{
    "code": "1010",
    "name": "Cash",
    "accountType": "ASSET",
    "normalBalance": "DEBIT"
  }'
```

### Recording Vendor Invoice
```bash
curl -X POST http://localhost:8080/api/finance/ap/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-001",
    "vendorId": 1,
    "totalAmount": 1000,
    "dueDate": "2026-06-30"
  }'
```

### Recording Customer Invoice
```bash
curl -X POST http://localhost:8080/api/finance/ar/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "CI-001",
    "customerId": 1,
    "totalAmount": 2000,
    "dueDate": "2026-07-15"
  }'
```

### Posting Journal Entry
```bash
# 1. Create journal entry
# 2. Approve journal entry
curl -X POST http://localhost:8080/api/finance/gl/1/approve

# 3. Post journal entry
curl -X POST http://localhost:8080/api/finance/gl/1/post
```

### Generating Reports
```bash
# Trial Balance
curl http://localhost:8080/api/finance/reports/trial-balance?asOfDate=2026-05-30

# AP Aging
curl http://localhost:8080/api/finance/reports/ap-aging

# AR Aging
curl http://localhost:8080/api/finance/reports/ar-aging

# Cash Flow
curl http://localhost:8080/api/finance/reports/cash-flow?startDate=2026-05-01&endDate=2026-06-30
```

## Frontend Usage

### Chart of Accounts Page
Navigate to `/finance/coa` to view:
- Account tree (hierarchical view)
- Account list (flat view)
- Create/edit form for accounts

### Reporting Pages
Navigate to `/finance/reports` to view:
- Trial balance
- AP aging
- AR aging
- Cash flow

## Testing

### Unit Tests
Located in `backend/src/test/java/com/everx/finance/service/`
- `GlAccountServiceTest.java`
- `ApServiceTest.java`
- `ArServiceTest.java`

Run tests:
```bash
mvn test
```

## Error Handling

Common error codes and messages:
- `404` - Account/Invoice/Payment not found
- `400` - Invalid input (e.g., unbalanced journal)
- `409` - Business rule violation (e.g., credit limit exceeded)
- `422` - Operation not allowed in current state

## Performance Considerations

1. **Index Strategy**
   - Account code (unique index)
   - Journal date (range queries)
   - Invoice number (unique index)

2. **Query Optimization**
   - Trial balance uses materialized view
   - Aging queries use date-based partitioning
   - Batch operations for bulk posting

3. **Caching**
   - COA accounts cached in memory
   - Posting periods cached
   - Report data cached for 1 hour

## Future Enhancements

1. **Multi-Currency Support**
   - Exchange rate management
   - Multi-currency GL accounts
   - Revaluation adjustments

2. **Advanced Features**
   - Budget vs. Actual analysis
   - Cash flow forecasting
   - Depreciation calculations
   - Tax compliance reports

3. **Integration**
   - Bank feed integration
   - ERPNext/Odoo sync
   - Tax authority reporting
   - Email notifications for AR/AP

## Support & Troubleshooting

### Common Issues

**Q: Journal entry won't post**
A: Verify journal is approved, posting period is open, and all amounts balance

**Q: AR invoice creation fails**
A: Check customer credit limit is set and sufficient

**Q: Aging report shows no results**
A: Verify invoices have due dates in the past

## Version History

- **1.0.0** (May 30, 2026)
  - Initial release
  - Core GL, AP, AR functionality
  - Basic reporting
  - Batch jobs for AP/AR

## Contact & Support

For issues or questions, contact: finance-dev@company.com
