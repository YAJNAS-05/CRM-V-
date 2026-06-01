# Traceability Matrix — Partial (auto-generated)

This partial matrix maps visible modules to the primary frontend route/page, the backend controller or package, and an example API surface. Use this as the starting point for full traceability and owner assignment.

| Module | Frontend (example file) | Backend (controller/service) | Example API path | Notes/Owner |
|---|---|---|---|---|
| Accounts | [frontend/src/pages/accounts/AccountListPage.tsx](frontend/src/pages/accounts/AccountListPage.tsx) | [backend/src/main/java/com/everx/crm/account/AccountController.java](backend/src/main/java/com/everx/crm/account/AccountController.java) | `GET /v1/crm/accounts` | UI → backend CRUD; owner: crm/team |
| Contacts | [frontend/src/pages/contacts/ContactDetailPage.tsx](frontend/src/pages/contacts/ContactDetailPage.tsx) | [backend/src/main/java/com/everx/crm/contact/ContactController.java](backend/src/main/java/com/everx/crm/contact/ContactController.java) | `GET /v1/crm/contacts/{id}` | Ensure contact → account linkage persisted |
| Leads | [frontend/src/pages/leads/LeadListPage.tsx](frontend/src/pages/leads/LeadListPage.tsx) | [backend/src/main/java/com/everx/crm/lead/LeadController.java](backend/src/main/java/com/everx/crm/lead/LeadController.java) | `POST /v1/crm/leads` | Conversion must create account/contact/deal records |
| Deals | [frontend/src/pages/deals/DealListPage.tsx](frontend/src/pages/deals/DealListPage.tsx) | [backend/src/main/java/com/everx/crm/deal/DealController.java](backend/src/main/java/com/everx/crm/deal/DealController.java) | `GET /v1/crm/deals` | Stage transitions audited server-side |
| Quotes | [frontend/src/pages/quotes/QuoteListPage.tsx](frontend/src/pages/quotes/QuoteListPage.tsx) | [backend/src/main/java/com/everx/crm/quote/QuoteController.java](backend/src/main/java/com/everx/crm/quote/QuoteController.java) | `POST /v1/crm/quotes` | PDF generation: [PdfService](backend/src/main/java/com/everx/crm/quote/PdfService.java) |
| Sales Orders | [frontend/src/pages/salesorders/SalesOrdersListPage.tsx](frontend/src/pages/salesorders/SalesOrdersListPage.tsx) | [backend/src/main/java/com/everx/erp/salesorder/SalesOrderController.java](backend/src/main/java/com/everx/erp/salesorder/SalesOrderController.java) | `POST /v1/erp/salesorders` | Conversion from quote endpoint exists in CRM API |
| Warranties | [frontend/src/pages/warranties/WarrantiesListPage.tsx](frontend/src/pages/warranties/WarrantiesListPage.tsx) | [backend/src/main/java/com/everx/erp/warranty/WarrantyController.java](backend/src/main/java/com/everx/erp/warranty/WarrantyController.java) | `GET /v1/erp/warranties` | Must be created automatically on accepted installs/orders |
| Inventory | [frontend/src/pages/inventory/InventoryListPage.tsx](frontend/src/pages/inventory/InventoryListPage.tsx) | [backend/src/main/java/com/everx/erp/inventory/InventoryItemController.java](backend/src/main/java/com/everx/erp/inventory/InventoryItemController.java) | `GET /v1/erp/inventory` | Ledger-backed; adjustments via `/v1/erp/inventory/adjustments` |
| Purchase Orders | [frontend/src/pages/purchaseorders/PurchaseOrderListPage.tsx](frontend/src/pages/purchaseorders/PurchaseOrderListPage.tsx) | [backend/src/main/java/com/everx/erp/purchaseorder/PurchaseOrderController.java](backend/src/main/java/com/everx/erp/purchaseorder/PurchaseOrderController.java) | `POST /v1/erp/purchaseorders` | Receipt flow must post inventory and ledger entries |
| Service Tickets / Fieldwork | [frontend/src/pages/servicetickets/ServiceTicketForm.tsx](frontend/src/pages/servicetickets/ServiceTicketForm.tsx) | [backend/src/main/java/com/everx/erp/service/ServiceTicketController.java](backend/src/main/java/com/everx/erp/service/ServiceTicketController.java) | `POST /v1/erp/service-tickets` | SLA timers and sign-off must trigger warranty/finance actions |
| Projects / Tasks | [frontend/src/pages/projects/ProjectListPage.tsx](frontend/src/pages/projects/ProjectListPage.tsx) | [backend/src/main/java/com/everx/project/controller/PMProjectController.java](backend/src/main/java/com/everx/project/controller/PMProjectController.java) | `GET /v1/projects` | Employee workspace syncs with PM APIs |
| Reports / Dashboards | [frontend/src/pages/reports/ReportsPage.tsx](frontend/src/pages/reports/ReportsPage.tsx) | [backend/src/main/java/com/everx/crm/report/ReportController.java](backend/src/main/java/com/everx/crm/report/ReportController.java) and [reporting controllers](backend/src/main/java/com/everx/reporting/controller) | `POST /v1/reporting/execute` or `GET /v1/reporting/widgets` | Jasper report services under `reporting/service` |
| Auth / RBAC | [frontend/src/pages/profile/UserProfilePage.tsx](frontend/src/pages/profile/UserProfilePage.tsx) | [backend/src/main/java/com/everx/auth/controller/AuthController.java](backend/src/main/java/com/everx/auth/controller/AuthController.java) and `UserController` | `POST /v1/auth/login`, `POST /v1/auth/refresh` | JWT flows and permission resolution enforced in `config/SecurityConfig.java`

Notes:
- This is a partial, automated mapping created from scanning `frontend/src` and `backend/src/main/java` for common route and controller names. It should be completed by assigning owners and confirming the canonical API contracts for each module.
- Where multiple backend controllers or services contribute to a feature (reports, finance), list the primary controller and add service links under Notes.

---

## Navigation Gating Policy (recommended)

To prevent dead routes and exposed UI without backend support, implement the following mandatory checks as part of CI and runtime feature gating:

1. Feature-flag rule: Any route listed in the primary sidebar must map to a backend controller and at least one `GET` or `POST` API used by the page. If not, the route is hidden behind a feature flag.
2. CI check: Add a lightweight script that parses `frontend/src/App.tsx` routes and verifies each route's api call roots (e.g., `/v1/crm/accounts`) are present in `backend/src/main/java` controllers (search for matching `@RequestMapping` or path strings). Fail the build if unmatched routes are found.
3. Smoke tests: Each visible route must have a smoke test asserting `200` from the primary API endpoint and that the frontend page renders the main list or detail container.

Example CI command (placeholder):

```
node scripts/check-route-mapping.js --routes frontend/src/App.tsx --backend backend/src/main/java
```

Outcome: these additions improve PRD traceability, reduce dead navigation exposure, and provide a clear path for assigning owners and writing acceptance tests.
