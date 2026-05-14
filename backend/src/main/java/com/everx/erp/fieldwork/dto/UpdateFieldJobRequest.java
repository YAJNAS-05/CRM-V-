package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.EngineerType;
import com.everx.erp.fieldwork.FieldJobStatus;
import com.everx.erp.fieldwork.FieldJobType;
import com.everx.erp.fieldwork.JobPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFieldJobRequest {
    private String jobNumber;
    private FieldJobType jobType;
    private FieldJobStatus jobStatus;
    private JobPriority priority;

    private String linkedEntity;
    private String linkedEquipmentSku;
    private UUID linkedLeadId;
    private UUID linkedPoId;
    private UUID linkedSalesOrderId;
    private UUID linkedShipmentId;
    private UUID linkedWarrantyId;
    private UUID linkedInvoiceId;

    private UUID accountId;
    private UUID equipmentId;

    private String clientOrSellerName;
    private String siteContactName;
    private String siteContactPhone;
    private String siteContactEmail;
    private String siteAddressLine1;
    private String siteAddressLine2;
    private String siteCity;
    private String siteCountry;
    private String siteTimezone;

    private OffsetDateTime scheduledStartDate;
    private OffsetDateTime scheduledEndDate;
    private Integer estimatedDurationDays;
    private OffsetDateTime actualStartDate;
    private OffsetDateTime actualEndDate;
    private Integer actualDurationDays;

    private EngineerType primaryEngineerType;
    private UUID primaryEngineerId;
    private String primaryEngineerName;
    private UUID secondaryEngineerId;
    private String secondaryEngineerName;
    private OffsetDateTime engineerAssignedDate;
    private Boolean engineerAccepted;
    private OffsetDateTime engineerAcceptedDate;

    private String internalNotes;
    private String clientBriefNotes;

    private Boolean billable;
    private Boolean underWarranty;
    private BigDecimal costEstimate;
    private BigDecimal costActual;
    private String currency;
}
