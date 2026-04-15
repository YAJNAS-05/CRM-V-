package com.everx.reporting.service;

import com.everx.reporting.model.FilterField;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportMetadataService {

    public Map<String, List<FieldMetadata>> getAllAvailableFields() {
        Map<String, List<FieldMetadata>> fields = new LinkedHashMap<>();

        // CRM Fields
        fields.put("CRM_LEADS", List.of(
            field("l.lead_number", "Lead Number", "STRING"),
            field("l.date_received", "Date Received", "DATE"),
            field("l.contact_first_name", "First Name", "STRING"),
            field("l.contact_last_name", "Last Name", "STRING"),
            field("l.contact_email", "Email", "STRING"),
            field("l.hospital_clinic_name", "Hospital/Clinic", "STRING"),
            field("l.country", "Country", "STRING"),
            field("l.modality_interest", "Modality", "ENUM"),
            field("l.lead_status", "Status", "ENUM"),
            field("l.lead_source", "Source", "ENUM"),
            field("l.account_manager", "Account Manager", "STRING"),
            field("l.assigned_entity", "Entity", "ENUM"),
            field("l.budget_range_min", "Budget Min", "CURRENCY"),
            field("l.budget_range_max", "Budget Max", "CURRENCY")
        ));

        fields.put("CRM_DEALS", List.of(
            field("d.deal_number", "Deal Number", "STRING"),
            field("d.deal_name", "Deal Name", "STRING"),
            field("d.stage", "Stage", "ENUM"),
            field("d.deal_value", "Deal Value", "CURRENCY"),
            field("d.currency", "Currency", "ENUM"),
            field("d.probability", "Probability %", "NUMBER"),
            field("d.expected_close_date", "Expected Close", "DATE"),
            field("d.assigned_sales_rep", "Sales Rep", "STRING")
        ));

        fields.put("CRM_CONTACTS", List.of(
            field("bp.contact_first_name", "First Name", "STRING"),
            field("bp.contact_last_name", "Last Name", "STRING"),
            field("bp.email", "Email", "STRING"),
            field("bp.phone", "Phone", "STRING"),
            field("bp.job_title", "Job Title", "STRING"),
            field("bp.company", "Company", "STRING"),
            field("bp.country", "Country", "STRING"),
            field("bp.contact_type", "Type", "ENUM"),
            field("bp.preferred_contact_method", "Preferred Contact", "ENUM")
        ));

        fields.put("CRM_ACCOUNTS", List.of(
            field("acc.account_name", "Account Name", "STRING"),
            field("acc.trading_name", "Trading Name", "STRING"),
            field("acc.registration_number", "Registration", "STRING"),
            field("acc.tax_id", "Tax ID", "STRING"),
            field("acc.industry", "Industry", "ENUM"),
            field("acc.country", "Country", "STRING"),
            field("acc.total_revenue", "Total Revenue", "CURRENCY"),
            field("acc.rating", "Rating", "ENUM")
        ));

        // ERP Fields
        fields.put("ERP_EQUIPMENT", List.of(
            field("e.sku", "SKU", "STRING"),
            field("e.modality", "Modality", "ENUM"),
            field("e.manufacturer", "Manufacturer", "ENUM"),
            field("e.model", "Model", "STRING"),
            field("e.serial_number", "Serial Number", "STRING"),
            field("e.physical_status", "Physical Status", "ENUM"),
            field("e.commercial_status", "Commercial Status", "ENUM"),
            field("e.purchase_price", "Purchase Price", "CURRENCY"),
            field("e.acquisition_date", "Acquisition Date", "DATE")
        ));

        fields.put("ERP_PURCHASE_ORDERS", List.of(
            field("po.po_number", "PO Number", "STRING"),
            field("po.po_date", "PO Date", "DATE"),
            field("po.po_status", "Status", "ENUM"),
            field("po.modality", "Modality", "ENUM"),
            field("po.agreed_purchase_price", "Purchase Price", "CURRENCY"),
            field("po.destination_warehouse", "Warehouse", "ENUM")
        ));

        fields.put("ERP_SALES_ORDERS", List.of(
            field("so.so_number", "SO Number", "STRING"),
            field("so.decision_date", "Decision Date", "DATE"),
            field("so.final_agreed_price_usd", "Final Price USD", "CURRENCY"),
            field("so.so_status", "Status", "ENUM"),
            field("so.account_manager", "Account Manager", "STRING")
        ));

        // Finance Fields
        fields.put("FIN_INVOICES", List.of(
            field("i.invoice_number", "Invoice Number", "STRING"),
            field("i.invoice_date", "Invoice Date", "DATE"),
            field("i.invoice_type", "Type", "ENUM"),
            field("i.total_amount_due", "Total Amount", "CURRENCY"),
            field("i.balance_due", "Balance Due", "CURRENCY"),
            field("i.payment_status", "Payment Status", "ENUM"),
            field("i.full_payment_due_date", "Due Date", "DATE")
        ));

        return fields;
    }

    public List<ModuleMetadata> getAllModules() {
        return List.of(
            ModuleMetadata.builder().name("CRM").displayName("Customer Relationship Management").build(),
            ModuleMetadata.builder().name("ERP").displayName("Enterprise Resource Planning").build(),
            ModuleMetadata.builder().name("FINANCE").displayName("Finance & Accounting").build()
        );
    }

    private FieldMetadata field(String dbField, String label, String dataType) {
        return FieldMetadata.builder()
            .dbField(dbField)
            .label(label)
            .dataType(dataType)
            .isComputed(false)
            .build();
    }
}

@Data
@Builder
class FieldMetadata {
    private String dbField;
    private String label;
    private String dataType;
    private boolean isComputed;
}

@Data
@Builder
class ModuleMetadata {
    private String name;
    private String displayName;
}
