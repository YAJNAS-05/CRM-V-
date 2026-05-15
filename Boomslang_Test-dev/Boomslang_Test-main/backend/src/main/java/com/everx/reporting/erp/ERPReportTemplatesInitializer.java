package com.everx.reporting.erp;

import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.LinkedHashMap;

/**
 * Initializes pre-built ERP report templates on application startup
 * Provides out-of-the-box reporting for all critical ERP workflows
 */
@Component
@RequiredArgsConstructor
public class ERPReportTemplatesInitializer implements CommandLineRunner {

    private final ReportDefinitionRepository reportRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) {
        initializeEquipmentReports();
        initializeSalesOrderReports();
        initializeWarrantyReports();
        initializeFinanceReports();
        initializeInventoryReports();
        initializeServiceTicketReports();
    }

    private void initializeEquipmentReports() {
        createReportIfNotExists(
            "Equipment Inventory Status",
            "ERP",
            "Equipment",
            "Comprehensive equipment inventory with physical/commercial status, location, condition",
            """
            SELECT e.internal_code as "SKU", e.make, e.model, e.serial_number,
                   e.status as "Physical Status", e.condition_grade as "Condition",
                   e.warehouse_location as "Location", e.asking_price as "Price (USD)",
                   e.year_of_manufacture as "Year", e.software_version
            FROM everx_erp.equipment e
            WHERE e.is_deleted = false
            ORDER BY e.created_at DESC
            """
        );

        createReportIfNotExists(
            "Equipment Valuation Summary",
            "ERP",
            "Equipment",
            "Total inventory valuation by location and status",
            """
            SELECT e.warehouse_location, e.status,
                   COUNT(*) as "Count",
                   SUM(CAST(e.asking_price AS DECIMAL)) as "Total Valuation (USD)",
                   AVG(CAST(e.asking_price AS DECIMAL)) as "Avg Price (USD)"
            FROM everx_erp.equipment e
            WHERE e.is_deleted = false
            GROUP BY e.warehouse_location, e.status
            ORDER BY "Total Valuation (USD)" DESC
            """
        );

        createReportIfNotExists(
            "Equipment Age & Performance Analysis",
            "ERP",
            "Equipment",
            "Equipment performance metrics by age and condition",
            """
            SELECT e.make, e.model, COUNT(*) as "Count",
                   AVG(YEAR(CURRENT_DATE) - e.year_of_manufacture) as "Avg Age (years)",
                   ROUND(100.0 * SUM(CASE WHEN e.condition_grade = 'EXCELLENT' THEN 1 ELSE 0 END) / COUNT(*), 2) as "Excellent %",
                   ROUND(100.0 * SUM(CASE WHEN e.condition_grade = 'GOOD' THEN 1 ELSE 0 END) / COUNT(*), 2) as "Good %",
                   ROUND(100.0 * SUM(CASE WHEN e.condition_grade = 'FAIR' THEN 1 ELSE 0 END) / COUNT(*), 2) as "Fair %"
            FROM everx_erp.equipment e
            WHERE e.is_deleted = false
            GROUP BY e.make, e.model
            ORDER BY "Count" DESC
            """
        );
    }

    private void initializeSalesOrderReports() {
        createReportIfNotExists(
            "Sales Order Pipeline Status",
            "ERP",
            "Sales",
            "Current sales orders by status with revenue tracking",
            """
            SELECT so.so_number, so.status as "Status",
                   a.name as "Account", c.first_name || ' ' || c.last_name as "Contact",
                   so.total_amount as "Amount", so.currency,
                   so.order_date as "Order Date", so.expected_delivery as "Expected Delivery"
            FROM everx_erp.sales_orders so
            LEFT JOIN everx_crm.accounts a ON so.account_id = a.id
            LEFT JOIN everx_crm.contacts c ON a.primary_contact_id = c.id
            WHERE so.is_deleted = false
            ORDER BY so.created_at DESC
            """
        );

        createReportIfNotExists(
            "Sales Order Revenue Analysis",
            "ERP",
            "Sales",
            "Revenue analysis by currency, account, and status",
            """
            SELECT so.currency,
                   so.status as "Status",
                   COUNT(*) as "Count",
                   SUM(CAST(so.total_amount AS DECIMAL)) as "Total Revenue",
                   AVG(CAST(so.total_amount AS DECIMAL)) as "Avg Order Value"
            FROM everx_erp.sales_orders so
            WHERE so.is_deleted = false
            GROUP BY so.currency, so.status
            ORDER BY "Total Revenue" DESC
            """
        );

        createReportIfNotExists(
            "Sales by Country & Destination",
            "ERP",
            "Sales",
            "Sales order distribution by destination country",
            """
            SELECT so.destination_country as "Country",
                   COUNT(*) as "Orders",
                   SUM(CAST(so.total_amount AS DECIMAL)) as "Revenue (USD Equiv)",
                   so.status
            FROM everx_erp.sales_orders so
            WHERE so.is_deleted = false
            GROUP BY so.destination_country, so.status
            ORDER BY "Revenue (USD Equiv)" DESC
            """
        );
    }

    private void initializeWarrantyReports() {
        createReportIfNotExists(
            "Active Warranties Status",
            "ERP",
            "Warranty",
            "Current active warranties with expiry tracking",
            """
            SELECT w.id, e.internal_code as "Equipment SKU",
                   w.status as "Status", w.type as "Coverage Type",
                   w.start_date, w.end_date,
                   DATEDIFF(DAY, CURRENT_DATE, w.end_date) as "Days to Expiry",
                   CASE WHEN DATEDIFF(DAY, CURRENT_DATE, w.end_date) <= 30 THEN 'EXPIRING SOON'
                        WHEN DATEDIFF(DAY, CURRENT_DATE, w.end_date) <= 0 THEN 'EXPIRED'
                        ELSE 'ACTIVE' END as "Alert Status"
            FROM everx_erp.warranties w
            LEFT JOIN everx_erp.equipment e ON w.equipment_id = e.id
            WHERE w.is_deleted = false AND w.status = 'ACTIVE'
            ORDER BY w.end_date ASC
            """
        );

        createReportIfNotExists(
            "Warranty Expiry Alert Report",
            "ERP",
            "Warranty",
            "Warranties expiring within 90 days - action required",
            """
            SELECT w.id, e.internal_code as "Equipment", a.name as "Customer",
                   w.end_date as "Expiry Date",
                   DATEDIFF(DAY, CURRENT_DATE, w.end_date) as "Days Left",
                   w.type as "Coverage Type"
            FROM everx_erp.warranties w
            LEFT JOIN everx_erp.equipment e ON w.equipment_id = e.id
            LEFT JOIN everx_crm.accounts a ON w.account_id = a.id
            WHERE w.is_deleted = false 
              AND w.status = 'ACTIVE'
              AND DATEDIFF(DAY, CURRENT_DATE, w.end_date) BETWEEN 1 AND 90
            ORDER BY w.end_date ASC
            """
        );

        createReportIfNotExists(
            "PPM Schedule Due",
            "ERP",
            "Warranty",
            "Preventive Maintenance (PPM) services due within 30 days",
            """
            SELECT w.id, e.internal_code as "Equipment", a.name as "Customer",
                   w.next_ppm_due as "PPM Due Date",
                   DATEDIFF(DAY, CURRENT_DATE, w.next_ppm_due) as "Days Until Due",
                   w.ppm_schedule, w.last_ppm_date
            FROM everx_erp.warranties w
            LEFT JOIN everx_erp.equipment e ON w.equipment_id = e.id
            LEFT JOIN everx_crm.accounts a ON w.account_id = a.id
            WHERE w.is_deleted = false 
              AND w.status = 'ACTIVE'
              AND w.next_ppm_due IS NOT NULL
              AND DATEDIFF(DAY, CURRENT_DATE, w.next_ppm_due) <= 30
            ORDER BY w.next_ppm_due ASC
            """
        );
    }

    private void initializeFinanceReports() {
        createReportIfNotExists(
            "Invoice Aging Report",
            "ERP",
            "Finance",
            "Outstanding invoices by age - cash flow visibility",
            """
            SELECT i.invoice_number, i.invoice_type as "Type",
                   a.name as "Customer",
                   i.issue_date, i.due_date, i.total_amount,
                   COALESCE(i.paid_amount, 0) as "Paid",
                   (i.total_amount - COALESCE(i.paid_amount, 0)) as "Outstanding",
                   i.currency,
                   DATEDIFF(DAY, i.due_date, CURRENT_DATE) as "Days Overdue",
                   CASE WHEN i.payment_status = 'COMPLETE' THEN 'PAID'
                        WHEN DATEDIFF(DAY, i.due_date, CURRENT_DATE) > 30 THEN 'OVERDUE 30+'
                        WHEN DATEDIFF(DAY, i.due_date, CURRENT_DATE) > 0 THEN 'OVERDUE'
                        ELSE 'CURRENT' END as "Status"
            FROM everx_finance.invoices i
            LEFT JOIN everx_crm.accounts a ON i.account_id = a.id
            WHERE i.is_deleted = false AND i.payment_status != 'COMPLETE'
            ORDER BY i.due_date ASC
            """
        );

        createReportIfNotExists(
            "Multi-Currency Revenue Report",
            "ERP",
            "Finance",
            "Revenue summary by currency with conversion rates",
            """
            SELECT i.currency,
                   COUNT(*) as "Invoice Count",
                   SUM(CAST(i.total_amount AS DECIMAL)) as "Total (Local)",
                   SUM(CAST(i.paid_amount AS DECIMAL)) as "Received (Local)",
                   SUM(CAST(i.total_amount - COALESCE(i.paid_amount, 0) AS DECIMAL)) as "Outstanding"
            FROM everx_finance.invoices i
            WHERE i.is_deleted = false
            GROUP BY i.currency
            ORDER BY "Total (Local)" DESC
            """
        );

        createReportIfNotExists(
            "Sales vs Receivables",
            "ERP",
            "Finance",
            "Sales order to invoice conversion and payment tracking",
            """
            SELECT so.so_number, so.total_amount as "SO Amount",
                   COUNT(i.id) as "Invoice Count",
                   SUM(CAST(i.total_amount AS DECIMAL)) as "Invoiced",
                   SUM(CAST(COALESCE(i.paid_amount, 0) AS DECIMAL)) as "Payments Received",
                   (so.total_amount - SUM(CAST(COALESCE(i.paid_amount, 0) AS DECIMAL))) as "Receivable"
            FROM everx_erp.sales_orders so
            LEFT JOIN everx_finance.invoices i ON so.id = i.so_id AND i.is_deleted = false
            WHERE so.is_deleted = false
            GROUP BY so.so_number, so.total_amount
            ORDER BY "Receivable" DESC
            """
        );
    }

    private void initializeInventoryReports() {
        createReportIfNotExists(
            "Spare Parts Stock Levels",
            "ERP",
            "Inventory",
            "Current spare parts inventory with reorder status",
            """
            SELECT sp.part_number, sp.part_name, sp.part_category,
                   sp.stock_quantity as "On Hand",
                   sp.min_stock_threshold as "Min Level",
                   sp.lead_time_days as "Lead Time (days)",
                   sp.unit_price_usd * sp.stock_quantity as "Stock Value (USD)",
                   CASE WHEN sp.stock_quantity <= sp.min_stock_threshold THEN 'REORDER'
                        WHEN sp.stock_quantity <= (sp.min_stock_threshold * 1.5) THEN 'LOW'
                        ELSE 'OK' END as "Status"
            FROM everx_erp.spare_parts sp
            WHERE sp.is_deleted = false
            ORDER BY sp.stock_quantity ASC
            """
        );

        createReportIfNotExists(
            "Inventory Turnover Analysis",
            "ERP",
            "Inventory",
            "Equipment turnover by make/model and warehouse",
            """
            SELECT e.make, e.model, e.warehouse_location,
                   COUNT(*) as "Total Units",
                   SUM(CASE WHEN e.status = 'SOLD' THEN 1 ELSE 0 END) as "Sold",
                   ROUND(100.0 * SUM(CASE WHEN e.status = 'SOLD' THEN 1 ELSE 0 END) / COUNT(*), 2) as "Turnover %",
                   AVG(DATEDIFF(DAY, e.created_at, CURRENT_DATE)) as "Avg Days in Stock"
            FROM everx_erp.equipment e
            WHERE e.is_deleted = false
            GROUP BY e.make, e.model, e.warehouse_location
            ORDER BY "Turnover %" DESC
            """
        );
    }

    private void initializeServiceTicketReports() {
        createReportIfNotExists(
            "Service Tickets SLA Compliance",
            "ERP",
            "Service",
            "Open tickets and SLA breach status",
            """
            SELECT st.ticket_id, e.internal_code as "Equipment",
                   st.priority, st.status,
                   st.created_date as "Created",
                   w.response_sla_hours as "SLA Hours",
                   DATEDIFF(HOUR, st.created_date, CURRENT_DATE) as "Hours Elapsed",
                   CASE WHEN DATEDIFF(HOUR, st.created_date, CURRENT_TIMESTAMP) > w.response_sla_hours 
                        THEN 'BREACHED' ELSE 'ON TRACK' END as "SLA Status"
            FROM everx_erp.service_tickets st
            LEFT JOIN everx_erp.equipment e ON st.equipment_id = e.id
            LEFT JOIN everx_erp.warranties w ON st.warranty_id = w.id
            WHERE st.is_deleted = false AND st.status IN ('OPEN', 'IN_PROGRESS')
            ORDER BY st.created_date ASC
            """
        );

        createReportIfNotExists(
            "Service Revenue by Warranty Status",
            "ERP",
            "Service",
            "Service ticket billing analysis - warranty vs out-of-warranty",
            """
            SELECT COUNT(*) as "Ticket Count",
                   SUM(CASE WHEN st.billable = true THEN 1 ELSE 0 END) as "Billable Tickets",
                   SUM(CASE WHEN st.billable = true THEN CAST(i.total_amount AS DECIMAL) ELSE 0 END) as "Service Revenue",
                   AVG(CAST(i.total_amount AS DECIMAL)) as "Avg Service Charge"
            FROM everx_erp.service_tickets st
            LEFT JOIN everx_finance.invoices i ON st.id = i.id
            WHERE st.is_deleted = false AND st.status = 'RESOLVED'
            """
        );
    }

    private void createReportIfNotExists(String reportName, String module, String category, 
                                         String description, String sqlDefinition) {
        if (reportRepository.existsByReportName(reportName)) {
            return; // Skip if already exists
        }

        try {
            // Wrap SQL definition in a proper JSON object for JSONB column storage
            Map<String, Object> definitionMap = new LinkedHashMap<>();
            definitionMap.put("type", "SQL");
            definitionMap.put("sql", sqlDefinition);
            
            // Serialize Map to JSON string for Hibernate JSONB binding
            String jsonDefinition = objectMapper.writeValueAsString(definitionMap);

            ReportDefinitionEntity entity = ReportDefinitionEntity.builder()
                .reportName(reportName)
                .reportType("SYSTEM")
                .module(module)
                .description(description)
                .definition(jsonDefinition)
                .createdBy("SYSTEM")
                .ownedBy("ADMIN")
                .isSystem(true)
                .isActive(true)
                .runCount(0)
                .build();

            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            reportRepository.save(entity);
        } catch (Exception e) {
            // Log error but don't fail startup
            System.err.println("Error initializing report '" + reportName + "': " + e.getMessage());
            e.printStackTrace();
        }
    }
}
