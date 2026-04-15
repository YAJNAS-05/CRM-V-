package com.everx.config;

import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Initializes template reports on application startup
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReportInitializer implements ApplicationRunner {

    private final ReportDefinitionRepository reportDefRepo;
    private final ObjectMapper objectMapper;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            // Check if reports already exist
            long count = reportDefRepo.count();
            if (count > 0) {
                log.info("Reports already exist in database. Skipping initialization.");
                return;
            }

            log.info("Initializing template reports...");
            
            // Create inventory report
            createReport(
                "Inventory Stock Report",
                "ERP",
                "List of current inventory items with stock levels and status",
                "INVENTORY_STOCK",
                buildInventoryDefinition()
            );

            // Create sales report
            createReport(
                "Monthly Sales Summary",
                "ERP",
                "Monthly sales totals and order count by customer",
                "SALES_MONTHLY",
                buildSalesDefinition()
            );

            // Create warranty report
            createReport(
                "Equipment Warranty Status",
                "ERP",
                "Active and expiring equipment warranties",
                "WARRANTY_ACTIVE",
                buildWarrantyDefinition()
            );

            // Create invoice report
            createReport(
                "Outstanding Invoices",
                "ERP",
                "Invoices with pending payment status",
                "INVOICE_OUTSTANDING",
                buildInvoiceDefinition()
            );

            // Create service tickets report
            createReport(
                "Service Tickets by Status",
                "ERP",
                "Service tickets grouped by current status and priority",
                "SERVICE_TICKETS",
                buildServiceTicketsDefinition()
            );

            log.info("Template reports initialized successfully");

        } catch (Exception e) {
            log.error("Error initializing reports", e);
        }
    }

    private void createReport(String name, String module, String description, String reportKey, Map<String, Object> definition) {
        try {
            ReportDefinitionEntity report = ReportDefinitionEntity.builder()
                .reportName(name)
                .module(module)
                .description(description)
                .reportKey(reportKey)
                .reportType("TEMPLATE")
                .definition(definition)
                .createdBy("SYSTEM")
                .ownedBy("SYSTEM")
                .isSystem(true)
                .isActive(true)
                .runCount(0)
                .build();

            reportDefRepo.save(report);
            log.info("Created template report: {}", name);
        } catch (Exception e) {
            log.error("Failed to create template report: {}", name, e);
        }
    }

    private Map<String, Object> buildInventoryDefinition() {
        Map<String, Object> def = new HashMap<>();
        def.put("description", "Inventory stock levels and status");
        def.put("jasperTemplate", "InventoryStockReport");
        def.put("columns", new Object[]{
            createColumn("item_code", "Item Code", "STRING"),
            createColumn("name", "Item Name", "STRING"),
            createColumn("category", "Category", "STRING"),
            createColumn("current_stock", "Current Stock", "INTEGER"),
            createColumn("location", "Location", "STRING"),
            createColumn("status", "Status", "STRING"),
            createColumn("unit_cost", "Unit Cost", "DECIMAL")
        });
        def.put("chartType", "bar");
        def.put("chartField", "current_stock");
        return def;
    }

    private Map<String, Object> buildSalesDefinition() {
        Map<String, Object> def = new HashMap<>();
        def.put("description", "Monthly sales summary and trends");
        def.put("jasperTemplate", "MonthlySalesReport");
        def.put("columns", new Object[]{
            createColumn("month", "Month", "STRING"),
            createColumn("total_orders", "Total Orders", "INTEGER"),
            createColumn("total_revenue", "Total Revenue", "DECIMAL"),
            createColumn("customer_count", "Customers", "INTEGER"),
            createColumn("avg_order_value", "Avg Order Value", "DECIMAL")
        });
        def.put("chartType", "line");
        def.put("chartField", "total_revenue");
        return def;
    }

    private Map<String, Object> buildWarrantyDefinition() {
        Map<String, Object> def = new HashMap<>();
        def.put("description", "Equipment warranty coverage and expiry dates");
        def.put("jasperTemplate", "WarrantyStatusReport");
        def.put("columns", new Object[]{
            createColumn("equipment_id", "Equipment ID", "STRING"),
            createColumn("equipment_name", "Equipment", "STRING"),
            createColumn("warranty_type", "Type", "STRING"),
            createColumn("start_date", "Start Date", "DATE"),
            createColumn("end_date", "End Date", "DATE"),
            createColumn("status", "Status", "STRING"),
            createColumn("days_remaining", "Days Remaining", "INTEGER")
        });
        def.put("chartType", "pie");
        def.put("chartField", "status");
        return def;
    }

    private Map<String, Object> buildInvoiceDefinition() {
        Map<String, Object> def = new HashMap<>();
        def.put("description", "Outstanding and overdue invoices");
        def.put("jasperTemplate", "InvoiceReport");
        def.put("columns", new Object[]{
            createColumn("invoice_number", "Invoice #", "STRING"),
            createColumn("account_name", "Account", "STRING"),
            createColumn("issue_date", "Issue Date", "DATE"),
            createColumn("due_date", "Due Date", "DATE"),
            createColumn("total_amount", "Total Amount", "DECIMAL"),
            createColumn("paid_amount", "Paid Amount", "DECIMAL"),
            createColumn("status", "Status", "STRING")
        });
        def.put("chartType", "bar");
        def.put("chartField", "total_amount");
        return def;
    }

    private Map<String, Object> buildServiceTicketsDefinition() {
        Map<String, Object> def = new HashMap<>();
        def.put("description", "Service tickets by status and priority");
        def.put("jasperTemplate", "ServiceTicketsReport");
        def.put("columns", new Object[]{
            createColumn("ticket_number", "Ticket #", "STRING"),
            createColumn("equipment", "Equipment", "STRING"),
            createColumn("type", "Type", "STRING"),
            createColumn("status", "Status", "STRING"),
            createColumn("priority", "Priority", "STRING"),
            createColumn("reported_date", "Reported", "DATE"),
            createColumn("cost", "Cost", "DECIMAL")
        });
        def.put("chartType", "bar");
        def.put("chartField", "cost");
        return def;
    }

    private Map<String, Object> createColumn(String field, String label, String type) {
        Map<String, Object> column = new HashMap<>();
        column.put("field", field);
        column.put("label", label);
        column.put("dataType", type);
        column.put("visible", true);
        column.put("sortable", true);
        column.put("aggregatable", !type.equals("STRING"));
        return column;
    }
}
