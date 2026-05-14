-- Create ERP schema
CREATE SCHEMA IF NOT EXISTS everx_erp;

-- Create equipment table
CREATE TABLE everx_erp.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_code VARCHAR(100) UNIQUE NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    category VARCHAR(50),
    slice_config VARCHAR(100),
    field_strength VARCHAR(50),
    condition_grade VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    warehouse_location VARCHAR(50),
    acquisition_cost NUMERIC(15,2),
    acquisition_currency CHAR(3),
    asking_price NUMERIC(15,2),
    asking_currency CHAR(3),
    year_of_manufacture INT,
    hours_of_use INT,
    tga_compliant BOOLEAN DEFAULT false,
    ce_marked BOOLEAN DEFAULT false,
    fda_cleared BOOLEAN DEFAULT false,
    notes TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_equipment_internal_code ON everx_erp.equipment(internal_code);
CREATE INDEX idx_equipment_status ON everx_erp.equipment(status);
CREATE INDEX idx_equipment_category ON everx_erp.equipment(category);
CREATE INDEX idx_equipment_warehouse_location ON everx_erp.equipment(warehouse_location);

-- Create spare_parts table
CREATE TABLE everx_erp.spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    compatible_models TEXT[],
    stock_qty INT DEFAULT 0,
    reorder_point INT,
    unit_cost NUMERIC(15,2),
    currency CHAR(3),
    supplier_id UUID,
    warehouse_location VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_spare_parts_part_number ON everx_erp.spare_parts(part_number);
CREATE INDEX idx_spare_parts_warehouse_location ON everx_erp.spare_parts(warehouse_location);

-- Create suppliers table
CREATE TABLE everx_erp.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    supplier_type VARCHAR(50),
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_suppliers_company_name ON everx_erp.suppliers(company_name);

-- Create purchase_orders table
CREATE TABLE everx_erp.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES everx_erp.suppliers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    order_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    currency CHAR(3),
    total_amount NUMERIC(15,2),
    payment_method VARCHAR(50),
    shipping_docs TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_purchase_orders_po_number ON everx_erp.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON everx_erp.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON everx_erp.purchase_orders(status);

-- Create purchase_order_items table
CREATE TABLE everx_erp.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES everx_erp.purchase_orders(id) ON DELETE CASCADE,
    equipment_id UUID,
    spare_part_id UUID,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(15,2),
    line_total NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_purchase_order_items_po_id ON everx_erp.purchase_order_items(po_id);

-- Create sales_orders table
CREATE TABLE everx_erp.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_number VARCHAR(50) UNIQUE NOT NULL,
    deal_id UUID,
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    order_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    currency CHAR(3),
    total_amount NUMERIC(15,2),
    incoterms VARCHAR(50),
    destination_country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_sales_orders_so_number ON everx_erp.sales_orders(so_number);
CREATE INDEX idx_sales_orders_account_id ON everx_erp.sales_orders(account_id);
CREATE INDEX idx_sales_orders_status ON everx_erp.sales_orders(status);

-- Create sales_order_items table
CREATE TABLE everx_erp.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_id UUID NOT NULL REFERENCES everx_erp.sales_orders(id) ON DELETE CASCADE,
    equipment_id UUID,
    quantity INT NOT NULL,
    unit_price NUMERIC(15,2),
    line_total NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_sales_order_items_so_id ON everx_erp.sales_order_items(so_id);

-- Create shipments table
CREATE TABLE everx_erp.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_id UUID REFERENCES everx_erp.sales_orders(id),
    po_id UUID REFERENCES everx_erp.purchase_orders(id),
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    origin_country VARCHAR(100),
    destination_country VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    shipped_date DATE,
    estimated_arrival DATE,
    actual_arrival DATE,
    bill_of_lading_url TEXT,
    packing_list_url TEXT,
    customs_declaration_url TEXT,
    freight_cost NUMERIC(15,2),
    currency CHAR(3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_shipments_tracking_number ON everx_erp.shipments(tracking_number);
CREATE INDEX idx_shipments_status ON everx_erp.shipments(status);

-- Create subcontractors table
CREATE TABLE everx_erp.subcontractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    coverage_regions TEXT[],
    specialisations TEXT[],
    hourly_rate NUMERIC(10,2),
    currency CHAR(3),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Create service_tickets table
CREATE TABLE everx_erp.service_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id UUID REFERENCES everx_erp.equipment(id),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    reported_date DATE,
    resolved_date DATE,
    assigned_to UUID REFERENCES everx_auth.users(id),
    subcontractor_id UUID REFERENCES everx_erp.subcontractors(id),
    description TEXT,
    resolution_notes TEXT,
    cost NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_service_tickets_ticket_number ON everx_erp.service_tickets(ticket_number);
CREATE INDEX idx_service_tickets_status ON everx_erp.service_tickets(status);
CREATE INDEX idx_service_tickets_assigned_to ON everx_erp.service_tickets(assigned_to);

-- Create warranties table
CREATE TABLE everx_erp.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES everx_erp.equipment(id),
    so_id UUID REFERENCES everx_erp.sales_orders(id),
    account_id UUID NOT NULL REFERENCES everx_crm.accounts(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_warranties_equipment_id ON everx_erp.warranties(equipment_id);
CREATE INDEX idx_warranties_account_id ON everx_erp.warranties(account_id);
CREATE INDEX idx_warranties_end_date ON everx_erp.warranties(end_date);
