package com.everx.erp.workflow;

import com.everx.erp.salesorder.SalesOrder;

/**
 * Boundary for invoice generation used by ERP sales order workflows.
 */
public interface SalesOrderInvoiceGateway {

    void createFinalInvoiceForSalesOrder(SalesOrder so, String invoiceType);
}
