package com.everx.erp.fieldwork;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "field_jobs", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FieldJob extends BaseEntity {

    @Column(name = "job_number", unique = true, nullable = false, length = 50)
    private String jobNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 50)
    private FieldJobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_status", nullable = false, length = 50)
    private FieldJobStatus jobStatus = FieldJobStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 50)
    private JobPriority priority = JobPriority.ROUTINE;

    @Column(name = "linked_entity", length = 100)
    private String linkedEntity;

    @Column(name = "linked_equipment_sku", length = 100)
    private String linkedEquipmentSku;

    @Column(name = "linked_lead_id")
    private UUID linkedLeadId;

    @Column(name = "linked_po_id")
    private UUID linkedPoId;

    @Column(name = "linked_sales_order_id")
    private UUID linkedSalesOrderId;

    @Column(name = "linked_shipment_id")
    private UUID linkedShipmentId;

    @Column(name = "linked_warranty_id")
    private UUID linkedWarrantyId;

    @Column(name = "linked_invoice_id")
    private UUID linkedInvoiceId;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "client_or_seller_name", length = 255)
    private String clientOrSellerName;

    @Column(name = "site_contact_name", length = 255)
    private String siteContactName;

    @Column(name = "site_contact_phone", length = 20)
    private String siteContactPhone;

    @Column(name = "site_contact_email", length = 255)
    private String siteContactEmail;

    @Column(name = "site_address_line1", length = 255)
    private String siteAddressLine1;

    @Column(name = "site_address_line2", length = 255)
    private String siteAddressLine2;

    @Column(name = "site_city", length = 100)
    private String siteCity;

    @Column(name = "site_country", length = 100)
    private String siteCountry;

    @Column(name = "site_timezone", length = 50)
    private String siteTimezone;

    @Column(name = "scheduled_start_date")
    private OffsetDateTime scheduledStartDate;

    @Column(name = "scheduled_end_date")
    private OffsetDateTime scheduledEndDate;

    @Column(name = "estimated_duration_days")
    private Integer estimatedDurationDays;

    @Column(name = "actual_start_date")
    private OffsetDateTime actualStartDate;

    @Column(name = "actual_end_date")
    private OffsetDateTime actualEndDate;

    @Column(name = "actual_duration_days")
    private Integer actualDurationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_engineer_type", length = 50)
    private EngineerType primaryEngineerType;

    @Column(name = "primary_engineer_id")
    private UUID primaryEngineerId;

    @Column(name = "primary_engineer_name", length = 255)
    private String primaryEngineerName;

    @Column(name = "secondary_engineer_id")
    private UUID secondaryEngineerId;

    @Column(name = "secondary_engineer_name", length = 255)
    private String secondaryEngineerName;

    @Column(name = "engineer_assigned_date")
    private OffsetDateTime engineerAssignedDate;

    @Column(name = "engineer_accepted")
    private Boolean engineerAccepted;

    @Column(name = "engineer_accepted_date")
    private OffsetDateTime engineerAcceptedDate;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "client_brief_notes", columnDefinition = "TEXT")
    private String clientBriefNotes;

    @Column(name = "billable", nullable = false)
    private Boolean billable = true;

    @Column(name = "under_warranty", nullable = false)
    private Boolean underWarranty = false;

    @Column(name = "cost_estimate", precision = 15, scale = 2)
    private BigDecimal costEstimate;

    @Column(name = "cost_actual", precision = 15, scale = 2)
    private BigDecimal costActual;

    @Column(name = "currency", length = 3)
    private String currency;
}
