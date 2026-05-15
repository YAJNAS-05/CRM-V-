package com.everx.reporting.security;

import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class SqlSanitizer {
    // Whitelist of allowed table references
    private static final Set<String> ALLOWED_TABLES = Set.of(
        "everx_crm.leads", "everx_crm.business_partners",
        "everx_crm.deals", "everx_crm.quotes", "everx_crm.activities",
        "everx_erp.equipment", "everx_erp.purchase_orders",
        "everx_erp.sales_orders", "everx_erp.shipments",
        "everx_erp.service_tickets", "everx_erp.warranties",
        "everx_erp.spare_parts", "everx_erp.suppliers",
        "everx_erp.subcontractors",
        "everx_finance.invoices", "everx_finance.invoice_line_items",
        "everx_finance.payments", "everx_finance.fx_rate_history"
    );

    private static final Pattern SAFE_COLUMN_PATTERN =
        Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_.]*$");

    public String sanitizeTableRef(String table) {
        if (!ALLOWED_TABLES.contains(table.toLowerCase())) {
            throw new ReportSecurityException("Table not allowed: " + table);
        }
        return table;
    }

    public String sanitizeColumnRef(String column) {
        if (!SAFE_COLUMN_PATTERN.matcher(column).matches()) {
            throw new ReportSecurityException("Invalid column reference: " + column);
        }
        return column;
    }

    public String sanitizeAlias(String alias) {
        if (!SAFE_COLUMN_PATTERN.matcher(alias).matches()) {
            return "col_" + alias.replaceAll("[^a-zA-Z0-9_]", "_");
        }
        return alias;
    }
}

class ReportSecurityException extends RuntimeException {
    public ReportSecurityException(String message) {
        super(message);
    }
}
