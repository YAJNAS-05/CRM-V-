-- Phase 0.1: CRM, ERP, Finance, HR module permissions aligned to PRD
-- Implements full CRUD and workflow authorities required by Enterprise AI-Ready PRD

-- ============================================================================
-- CRM MODULE PERMISSIONS
-- ============================================================================

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CRM_VIEW', 'CRM', 'VIEW', 'View CRM module and records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CRM_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CRM_CREATE', 'CRM', 'CREATE', 'Create CRM records (accounts, contacts, leads, deals, quotes)', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CRM_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CRM_EDIT', 'CRM', 'EDIT', 'Edit existing CRM records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CRM_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CRM_DELETE', 'CRM', 'DELETE', 'Delete CRM records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CRM_DELETE');

-- Accounts
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ACCOUNT_VIEW', 'CRM', 'ACCOUNT_VIEW', 'View accounts', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ACCOUNT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ACCOUNT_CREATE', 'CRM', 'ACCOUNT_CREATE', 'Create new accounts', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ACCOUNT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ACCOUNT_EDIT', 'CRM', 'ACCOUNT_EDIT', 'Edit account details', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ACCOUNT_EDIT');

-- Contacts
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CONTACT_VIEW', 'CRM', 'CONTACT_VIEW', 'View contacts', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CONTACT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CONTACT_CREATE', 'CRM', 'CONTACT_CREATE', 'Create new contacts', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CONTACT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'CONTACT_EDIT', 'CRM', 'CONTACT_EDIT', 'Edit contact details', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'CONTACT_EDIT');

-- Leads
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'LEAD_VIEW', 'CRM', 'LEAD_VIEW', 'View leads', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'LEAD_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'LEAD_CREATE', 'CRM', 'LEAD_CREATE', 'Create new leads', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'LEAD_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'LEAD_CONVERT', 'CRM', 'LEAD_CONVERT', 'Convert leads to opportunities', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'LEAD_CONVERT');

-- Deals
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'DEAL_VIEW', 'CRM', 'DEAL_VIEW', 'View deals and opportunities', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'DEAL_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'DEAL_CREATE', 'CRM', 'DEAL_CREATE', 'Create new deals', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'DEAL_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'DEAL_EDIT', 'CRM', 'DEAL_EDIT', 'Edit deal details', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'DEAL_EDIT');

-- Quotes
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'QUOTE_VIEW', 'CRM', 'QUOTE_VIEW', 'View quotes', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'QUOTE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'QUOTE_CREATE', 'CRM', 'QUOTE_CREATE', 'Create quotes', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'QUOTE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'QUOTE_APPROVE', 'CRM', 'QUOTE_APPROVE', 'Approve quotes', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'QUOTE_APPROVE');

-- ============================================================================
-- ERP MODULE PERMISSIONS
-- ============================================================================

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ERP_VIEW', 'ERP', 'VIEW', 'View ERP module', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ERP_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ERP_CREATE', 'ERP', 'CREATE', 'Create ERP records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ERP_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ERP_EDIT', 'ERP', 'EDIT', 'Edit ERP records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ERP_EDIT');

-- Acquisitions
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ACQUISITION_VIEW', 'ERP', 'ACQUISITION_VIEW', 'View acquisitions', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ACQUISITION_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'ACQUISITION_CREATE', 'ERP', 'ACQUISITION_CREATE', 'Create acquisition opportunities', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'ACQUISITION_CREATE');

-- Equipment
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'EQUIPMENT_VIEW', 'ERP', 'EQUIPMENT_VIEW', 'View equipment records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'EQUIPMENT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'EQUIPMENT_CREATE', 'ERP', 'EQUIPMENT_CREATE', 'Create equipment records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'EQUIPMENT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'EQUIPMENT_EDIT', 'ERP', 'EQUIPMENT_EDIT', 'Edit equipment details', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'EQUIPMENT_EDIT');

-- Inventory
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVENTORY_VIEW', 'ERP', 'INVENTORY_VIEW', 'View inventory', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVENTORY_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVENTORY_TRANSFER', 'ERP', 'INVENTORY_TRANSFER', 'Transfer inventory between locations', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVENTORY_TRANSFER');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVENTORY_COUNT', 'ERP', 'INVENTORY_COUNT', 'Perform inventory counts and audits', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVENTORY_COUNT');

-- Purchase Orders
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PO_VIEW', 'ERP', 'PO_VIEW', 'View purchase orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PO_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PO_CREATE', 'ERP', 'PO_CREATE', 'Create purchase orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PO_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PO_APPROVE', 'ERP', 'PO_APPROVE', 'Approve purchase orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PO_APPROVE');

-- Sales Orders
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SO_VIEW', 'ERP', 'SO_VIEW', 'View sales orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SO_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SO_CREATE', 'ERP', 'SO_CREATE', 'Create sales orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SO_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SO_CONFIRM', 'ERP', 'SO_CONFIRM', 'Confirm and process sales orders', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SO_CONFIRM');

-- Shipments
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SHIPMENT_VIEW', 'ERP', 'SHIPMENT_VIEW', 'View shipments', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SHIPMENT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SHIPMENT_CREATE', 'ERP', 'SHIPMENT_CREATE', 'Create shipments', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SHIPMENT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SHIPMENT_CONFIRM', 'ERP', 'SHIPMENT_CONFIRM', 'Confirm shipment delivery', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SHIPMENT_CONFIRM');

-- ============================================================================
-- FINANCE MODULE PERMISSIONS
-- ============================================================================

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FINANCE_VIEW', 'FINANCE', 'VIEW', 'View finance module', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FINANCE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FINANCE_CREATE', 'FINANCE', 'CREATE', 'Create finance records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FINANCE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FINANCE_EDIT', 'FINANCE', 'EDIT', 'Edit finance records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FINANCE_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FINANCE_DELETE', 'FINANCE', 'DELETE', 'Delete finance records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FINANCE_DELETE');

-- Invoices
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVOICE_VIEW', 'FINANCE', 'INVOICE_VIEW', 'View invoices', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVOICE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVOICE_CREATE', 'FINANCE', 'INVOICE_CREATE', 'Create invoices', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVOICE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'INVOICE_APPROVE', 'FINANCE', 'INVOICE_APPROVE', 'Approve invoices', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'INVOICE_APPROVE');

-- Payments
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PAYMENT_VIEW', 'FINANCE', 'PAYMENT_VIEW', 'View payments', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PAYMENT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PAYMENT_RECORD', 'FINANCE', 'PAYMENT_RECORD', 'Record payment receipts', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PAYMENT_RECORD');

-- AR/AP
INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'AR_VIEW', 'FINANCE', 'AR_VIEW', 'View accounts receivable', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'AR_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'AP_VIEW', 'FINANCE', 'AP_VIEW', 'View accounts payable', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'AP_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'AP_APPROVE', 'FINANCE', 'AP_APPROVE', 'Approve payables for payment', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'AP_APPROVE');

-- ============================================================================
-- WARRANTY AND SERVICE MODULE PERMISSIONS
-- ============================================================================

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'WARRANTY_VIEW', 'SERVICE', 'WARRANTY_VIEW', 'View warranties', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'WARRANTY_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'WARRANTY_CREATE', 'SERVICE', 'WARRANTY_CREATE', 'Create warranties', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'WARRANTY_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SERVICE_TICKET_VIEW', 'SERVICE', 'SERVICE_TICKET_VIEW', 'View service tickets', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SERVICE_TICKET_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SERVICE_TICKET_CREATE', 'SERVICE', 'SERVICE_TICKET_CREATE', 'Create service tickets', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SERVICE_TICKET_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'SERVICE_TICKET_RESOLVE', 'SERVICE', 'SERVICE_TICKET_RESOLVE', 'Resolve service tickets', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'SERVICE_TICKET_RESOLVE');

-- ============================================================================
-- FIELDWORK MODULE PERMISSIONS
-- ============================================================================

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FIELDWORK_VIEW', 'FIELDWORK', 'VIEW', 'View fieldwork jobs', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FIELDWORK_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'FIELDWORK_EXECUTE', 'FIELDWORK', 'EXECUTE', 'Execute and sign off field jobs', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'FIELDWORK_EXECUTE');

-- ============================================================================
-- ASSIGN CRM, ERP, FINANCE PERMISSIONS TO CORE ROLES
-- ============================================================================

-- Sales Representative: CRM View, Create, Quotes
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN ('CRM_VIEW', 'CRM_CREATE', 'DEAL_VIEW', 'DEAL_CREATE', 'QUOTE_VIEW', 'QUOTE_CREATE', 'ACCOUNT_VIEW', 'CONTACT_VIEW', 'CONTACT_CREATE')
WHERE r.name = 'SALES_REPRESENTATIVE'
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Sales Manager: CRM full + Approve Quotes
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN ('CRM_VIEW', 'CRM_CREATE', 'CRM_EDIT', 'DEAL_VIEW', 'DEAL_CREATE', 'DEAL_EDIT', 'QUOTE_VIEW', 'QUOTE_CREATE', 'QUOTE_APPROVE', 'ACCOUNT_VIEW', 'ACCOUNT_CREATE', 'CONTACT_VIEW', 'CONTACT_CREATE')
WHERE r.name = 'SALES_MANAGER'
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Finance Manager: Finance full + AR/AP + Approvals
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN ('FINANCE_VIEW', 'FINANCE_CREATE', 'FINANCE_EDIT', 'FINANCE_DELETE', 'INVOICE_VIEW', 'INVOICE_CREATE', 'INVOICE_APPROVE', 'PAYMENT_VIEW', 'PAYMENT_RECORD', 'AR_VIEW', 'AP_VIEW', 'AP_APPROVE')
WHERE r.name IN ('FINANCE_MANAGER', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Warehouse Manager: ERP full (Inventory, PO, SO, Shipments)
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN ('ERP_VIEW', 'ERP_CREATE', 'ERP_EDIT', 'EQUIPMENT_VIEW', 'EQUIPMENT_CREATE', 'EQUIPMENT_EDIT', 'INVENTORY_VIEW', 'INVENTORY_TRANSFER', 'INVENTORY_COUNT', 'PO_VIEW', 'PO_CREATE', 'SO_VIEW', 'SO_CREATE', 'SHIPMENT_VIEW', 'SHIPMENT_CREATE', 'SHIPMENT_CONFIRM', 'ACQUISITION_VIEW', 'ACQUISITION_CREATE')
WHERE r.name IN ('WAREHOUSE_MANAGER', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Service Technician: Fieldwork + Service Tickets + Warranty View
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN ('FIELDWORK_VIEW', 'FIELDWORK_EXECUTE', 'SERVICE_TICKET_VIEW', 'SERVICE_TICKET_CREATE', 'SERVICE_TICKET_RESOLVE', 'WARRANTY_VIEW', 'EQUIPMENT_VIEW')
WHERE r.name = 'SERVICE_TECHNICIAN'
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Super Admin: All permissions
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON true
WHERE r.name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
