# Route to API Ownership Baseline (ERP and Finance Slice)

Scope: Phase 0.1 PRD baseline for ERP asset/commercial operations and Finance modules.

## Frontend Route Ownership

## ERP routes (sampled from App routes)

- Equipment
  - /erp/equipment
  - /erp/equipment/new
  - /erp/equipment/:id/edit
  - /erp/equipment/:id

- Spare parts
  - /erp/spareparts
  - /erp/spareparts/new
  - /erp/spareparts/:id/edit
  - /erp/spareparts/:id

- Suppliers
  - /erp/suppliers
  - /erp/suppliers/new
  - /erp/suppliers/:id/edit
  - /erp/suppliers/:id

- Acquisitions and assessments
  - /erp/acquisitions
  - /erp/acquisitions/new
  - /erp/acquisitions/:id/edit
  - /erp/equipment-assessments
  - /erp/equipment-assessments/new
  - /erp/equipment-assessments/:id/edit
  - /erp/equipment-qc
  - /erp/equipment-qc/new
  - /erp/equipment-qc/:id/edit

- Commercial operations
  - /erp/purchase-orders
  - /erp/purchase-orders/new
  - /erp/purchase-orders/:id/edit
  - /erp/purchase-orders/:id
  - /erp/sales-orders
  - /erp/sales-orders/new
  - /erp/sales-orders/:id/edit
  - /erp/sales-orders/:id
  - /erp/shipments
  - /erp/shipments/new
  - /erp/shipments/:id/edit
  - /erp/shipments/:id

- After-sales and stock control
  - /erp/warranties
  - /erp/warranties/new
  - /erp/warranties/:id/edit
  - /erp/warranties/:id
  - /erp/inventory
  - /erp/inventory/ledger
  - /erp/inventory/transfers
  - /erp/inventory/new
  - /erp/inventory/:id

## Finance routes

- /finance/invoices
- /finance/invoices/new
- /finance/invoices/:id/edit
- /finance/invoices/:id
- /finance/payments
- /finance/currency
- /finance/reports
- /finance/close

## Frontend API Ownership

## ERP API source

Primary file: frontend/src/api/erpApi.ts

- Inventory and stock APIs under /v1/erp/inventory/*
- Equipment APIs under /v1/erp/equipment/*
- Purchase orders under /v1/erp/purchase-orders/*
- Sales orders under /v1/erp/sales-orders/*
- Shipments under /v1/erp/shipments/*
- Spare parts under /v1/erp/spareparts/*
- Subcontractors under /v1/erp/subcontractors/*
- Suppliers under /v1/erp/suppliers/*
- Acquisitions under /v1/erp/acquisitions/*
- Equipment assessments under /v1/erp/equipment-assessments/*
- Site assessments under /v1/erp/site-assessments/*
- Equipment QC under /v1/erp/equipment-qc/*
- Warranties under /v1/erp/warranties/*
- Service tickets under /v1/erp/service-tickets/*

## Finance API source

Primary file: frontend/src/api/financeApi.ts

- Invoice APIs under /v1/finance/invoices/*
- Payment APIs under /v1/finance/payments/*
- Currency APIs under /v1/finance/currency-rates/*
- Finance reports under /v1/finance/reports/*
- Financial close APIs under /v1/finance/close/*

## Findings

- ERP and finance route families are broadly represented and API-backed.
- Remaining validation needed: route-level CTA completeness and backend authority parity.
- The ERP and finance slices are suitable for Phase 0 dead-CTA sweep and Phase 1 workflow hardening.

## Next Slice

1. Produce backend endpoint-to-authority matrix for CRM, ERP, and finance controllers.
2. Run dead CTA sweep on ERP and finance list/detail forms.
3. Add smoke tests for role-gated admin plus one ERP and one finance critical path.
