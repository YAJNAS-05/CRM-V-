# Project Issues — EverX Working Checklist

> Living document. Check off items as they are fixed.
> Last audited: 2026-05-05

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete / Working |
| ⚠️ | Incomplete / Partial |
| ❌ | Broken / Missing |
| 🔗 | Cross-module dependency issue |

---

## MODULE 1: CRM

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ✅ MOSTLY COMPLETE

### Dependencies
- → ERP (Deal links to Sales Order via `CRMERPLinkingService`)
- → Finance (Quote → Sales Order → Invoice)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| CRM-01 | Frontend | No bulk operations (multi-select present but no actions: bulk delete, bulk export, bulk status change) | MEDIUM | ✅ |
| CRM-02 | Frontend | No activity history timeline on record detail pages | LOW | ✅ |
| CRM-03 | Frontend | Quote PDF generation: `pdfUrl` stored but no generate/preview action in UI | MEDIUM | ✅ |
| CRM-04 | Frontend | No lead scoring visual indicator on lead list/detail | LOW | ✅ |
| CRM-05 | Frontend | No email/communication history on contacts or accounts | LOW | ✅ |
| CRM-06 | Frontend | No inline editing on list pages | LOW | ✅ |

---

## MODULE 2: ERP

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ MIXED

### Dependencies
- → Finance (PO/Sales Order → Invoice)
- → HR (Field engineer assignment)
- ← CRM (Deal → Sales Order)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| ERP-01 | Frontend | Acquisitions: no detail page (list + form only) | LOW | ✅ |
| ERP-02 | Frontend | Inventory: no stock level warnings / reorder alerts UI | MEDIUM | ✅ |
| ERP-03 | Frontend | Equipment assessments: related equipment not shown on form | MEDIUM | ✅ |
| ERP-04 | Frontend | Service tickets: no technician assignment UI | HIGH | ✅ |
| ERP-05 | Frontend | No warranty claim processing workflow UI | MEDIUM | ✅ |
| ERP-06 | Frontend | No equipment → spare parts mapping visible in UI | MEDIUM | ✅ |
| ERP-07 | Frontend | Most ERP forms lack Zod validation (no real-time field errors) | HIGH | ✅ |
| ERP-08 | Frontend | No inter-module relationships displayed (e.g. equipment used in field jobs) | MEDIUM | ✅ |

---

## MODULE 3: FINANCE

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ PARTIAL

### Dependencies
- ← ERP (PO/Receipt → Invoice; three-way match)
- ← HR (Payroll → Finance expense)
- ← CRM (Quote → Invoice)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| FIN-01 | Frontend | Payment list is view-only — no create, edit, or delete actions | HIGH | ✅ |
| FIN-02 | Frontend | No three-way match exception UI (backend has tolerance/exception handling, not surfaced) | HIGH | ✅ |
| FIN-03 | Frontend | Financial close page exists but functionality not implemented | HIGH | ✅ |
| FIN-04 | Frontend | No payment reconciliation / matching UI | HIGH | ✅ |
| FIN-05 | Frontend | No AR aging report visible in UI (backend has it) | MEDIUM | ✅ |
| FIN-06 | Frontend | No cash flow forecasting | LOW | ✅ |
| FIN-07 | Frontend | InvoiceForm lacks Zod validation (manual validation only) | MEDIUM | ✅ |
| FIN-08 | Frontend | Currency page — functionality unclear / limited | MEDIUM | ✅ |
| FIN-09 | Backend | `SparePartReorderScheduler`: 2 TODO comments — email alerts not sent | LOW | ✅ |

---

## MODULE 4: HR

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ MOSTLY COMPLETE (several stub pages)

### Dependencies
- → Finance (Payroll → expense entries)
- → ERP (Engineer assignment in FieldJobs)
- → Platform (Approval workflows for leave, timesheets)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| HR-01 | Frontend | Performance page: stub only — no appraisal form or workflow | HIGH | ✅ |
| HR-02 | Frontend | Compliance page: stub only — no content | MEDIUM | ✅ |
| HR-03 | Frontend | Recruitment page: stub only — no job posting management | HIGH | ✅ |
| HR-04 | Frontend | Candidates page: pipeline exists but no interview scheduling | MEDIUM | ✅ |
| HR-05 | Frontend | Task Kanban: uses mock data — no API integration | HIGH | ✅ |
| HR-06 | Frontend | Exit / F&F settlement page: partially implemented — no settlement calculation UI | MEDIUM | ✅ |
| HR-07 | Frontend | No salary structure visualization | LOW | ✅ |
| HR-08 | Frontend | No benefit enrollment workflow | LOW | ✅ |
| HR-09 | Frontend | Analytics page: exists but implementation unclear | MEDIUM | ✅ |

---

## MODULE 5: FIELD WORK

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ PARTIAL

### Dependencies
- ← HR (Technician/engineer sourced from employees)
- → ERP (Jobs linked to equipment, spare parts)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| FW-01 | Frontend | localStorage fallback may cause data inconsistency if user switches devices | HIGH | ✅ |
| FW-02 | Frontend | Site assessment forms incomplete | MEDIUM | ✅ |
| FW-03 | Frontend | Equipment assessment forms minimal | MEDIUM | ✅ |
| FW-04 | Frontend | No technician time tracking on job | MEDIUM | ✅ |
| FW-05 | Frontend | No GPS/location tracking UI | LOW | ✅ |
| FW-06 | Frontend | No photo upload for field jobs | LOW | ✅ |
| FW-07 | Frontend | Field job forms lack Zod validation | MEDIUM | ✅ |

---

## MODULE 6: REPORTS

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ✅ MOSTLY COMPLETE

### Dependencies
- ← All modules (CRM, HR, Finance, ERP, FieldWork)

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| RPT-01 | Frontend | Scheduled report generation not implemented (backend supports it) | MEDIUM | ✅ |
| RPT-02 | Frontend | Email distribution for reports not implemented | MEDIUM | ✅ |
| RPT-03 | Frontend | Report sharing / permissions not visible | LOW | ✅ |
| RPT-04 | Frontend | No export to PDF (only table export) | MEDIUM | ✅ |
| RPT-05 | Frontend | Chart customization limited (no color/legend controls) | LOW | ✅ |

---

## MODULE 7: ADMIN

**Backend Status:** ✅ COMPLETE  
**Frontend Status:** ⚠️ PARTIAL

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| ADM-01 | Frontend | No tenant / workspace management UI | LOW | ✅ |
| ADM-02 | Frontend | No backup / restore functionality | LOW | ✅ |
| ADM-03 | Frontend | No module licensing management | LOW | ✅ |

---

## MODULE 8: EMPLOYEE SELF-SERVICE

**Backend Status:** ✅ (uses HR APIs)  
**Frontend Status:** ⚠️ PARTIAL

### Issues

| # | Layer | Issue | Priority | Status |
|---|-------|-------|----------|--------|
| EMP-01 | Frontend | Task Kanban uses mock data — not connected to HR Task API | HIGH | ✅ |
| EMP-02 | Frontend | No project collaboration features (comments, file sharing) | LOW | ✅ |
| EMP-03 | Frontend | No discussion threads | LOW | ✅ |

---

## CROSS-MODULE ISSUES

| # | Modules | Issue | Priority | Status |
|---|---------|-------|----------|--------|
| X-01 | HR ↔ Finance | Payroll → Finance expense entry connection not verified/tested end-to-end | HIGH | ✅ |
| X-02 | ERP ↔ Finance | Three-way match (PO + Receipt + Invoice) backend complete, but frontend has no exception resolution UI | HIGH | ✅ |
| X-03 | CRM ↔ ERP | Deal → Sales Order link (`CRMERPLinkingService`) not visually confirmed in CRM deal detail | MEDIUM | ✅ |
| X-04 | FieldWork ↔ HR | Engineer assignment in field jobs — no dropdown/lookup from HR employee list in UI | HIGH | ✅ |
| X-05 | Finance ↔ ERP | Goods receipt auto-posting to GL — needs end-to-end verification | MEDIUM | ✅ |
| X-06 | HR ↔ ERP | Reimbursement approval → Finance — connection needs verification | MEDIUM | ✅ |

---

## GLOBAL / INFRASTRUCTURE ISSUES

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| G-01 | Frontend (all) | ~50% of forms lack Zod validation (ERP, Finance, FieldWork) | HIGH | ✅ |
| G-02 | Frontend (all) | Generic error messages: `toast.error('Failed')` — no specific error detail | MEDIUM | ✅ |
| G-03 | Frontend (all) | No retry logic in API layer | MEDIUM | ✅ |
| G-04 | Frontend (all) | No request cancellation on component unmount (memory leak risk) | MEDIUM | ✅ |
| G-05 | Frontend (all) | No real-time notifications (WebSocket / Server-Sent Events) | MEDIUM | ✅ |
| G-06 | Frontend (all) | No bulk operations framework (multi-select + actions) | MEDIUM | ✅ |
| G-07 | Frontend (all) | `console.error()` used in 30+ places — not captured or surfaced to monitoring | LOW | ✅ |
| G-08 | Frontend (all) | No reusable table component — each module builds its own | LOW | ✅ |
| G-09 | Frontend (all) | No reusable modal/dialog component | LOW | ✅ |
| G-10 | Frontend (all) | No file upload component (AWS S3 supported in backend) | MEDIUM | ✅ |
| G-11 | Frontend | `any` type used in 15+ places in API responses | LOW | ✅ |
| G-12 | Frontend | Deal Kanban loads all deals in memory (no virtual scroll / paging) | MEDIUM | ✅ |
| G-13 | Backend | Password change endpoint lacks validation audit | LOW | ✅ |

---

## RECOMMENDED FIX ORDER

```
Priority 1 — CRITICAL / HIGH (fix first):
  FIN-01  Payment create/edit UI
  FIN-03  Financial close implementation
  FIN-04  Payment reconciliation UI
  ERP-04  Service ticket technician assignment UI
  HR-01   Performance page (appraisal form + workflow)
  HR-03   Recruitment page (job posting)
  HR-05   Task Kanban API integration
  EMP-01  Employee task Kanban API integration
  FW-01   Fix localStorage fallback data inconsistency
  X-01    ✅ HR ↔ Finance payroll integration verification
  X-02    ✅ Three-way match exception resolution UI
  X-04    ✅ FieldWork ↔ HR engineer assignment lookup
  G-01    Add Zod validation to ERP, Finance, FieldWork forms

Priority 2 — MEDIUM:
  FIN-02  Three-way match UI
  FIN-07  Invoice form Zod validation
  ERP-02  Inventory stock warnings
  ERP-03  Equipment assessment — related equipment
  ERP-07  ERP form validation
  HR-04   Candidate interview scheduling
  HR-06   Exit/F&F settlement UI
  FW-02   Site assessment forms
  FW-03   Equipment assessment forms
  RPT-01  Scheduled report generation UI
  RPT-02  Email distribution UI
  X-03    ✅ CRM Deal → Sales Order visual link
  X-05    Finance ↔ ERP GL auto-posting verification
  G-02    Specific error messages
  G-03    API retry logic
  G-04    Request cancellation on unmount
  G-10    File upload component

Priority 3 — LOW / NICE-TO-HAVE:
  CRM-01  Bulk operations
  CRM-02  Activity history timeline
  CRM-03  Quote PDF generation
  FW-04   Technician time tracking
  FIN-09  SparePartReorderScheduler email alerts
  RPT-04  PDF export for reports
  G-05    Real-time WebSocket notifications
  G-06    Global bulk operations framework
  G-08    Reusable table component
  G-09    Reusable modal component
```

---

## MODULE STATUS SUMMARY

| Module | Backend | Frontend | Overall |
|--------|---------|----------|---------|
| CRM | ✅ Complete | ✅ 90% | ✅ Good |
| ERP | ✅ Complete | ⚠️ 70% | ⚠️ Needs work |
| Finance | ✅ Complete | ⚠️ 60% | ⚠️ Needs work |
| HR | ✅ Complete | ⚠️ 75% | ⚠️ Has stubs |
| Field Work | ✅ Complete | ⚠️ 55% | ⚠️ Partial |
| Reports | ✅ Complete | ✅ 85% | ✅ Good |
| Admin | ✅ Complete | ⚠️ 80% | ✅ Mostly good |
| Employee Self-Service | ✅ (HR APIs) | ⚠️ 60% | ⚠️ Needs work |
| Auth / Security | ✅ Complete | ✅ Complete | ✅ Solid |
| Platform / Config | ✅ Complete | ✅ Complete | ✅ Solid |
| Insights | ✅ Complete | ✅ Complete | ✅ Solid |
| Reporting Engine | ✅ Complete | ✅ 85% | ✅ Good |
