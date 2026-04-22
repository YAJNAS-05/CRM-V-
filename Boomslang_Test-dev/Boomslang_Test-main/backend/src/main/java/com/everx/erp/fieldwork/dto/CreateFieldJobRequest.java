package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.EngineerType;
import com.everx.erp.fieldwork.FieldJobStatus;
import com.everx.erp.fieldwork.FieldJobType;
import com.everx.erp.fieldwork.JobPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFieldJobRequest {
    @NotBlank(message = "Job number is required")
    @Size(max = 50)
    private String jobNumber;

    @NotNull(message = "Job type is required")
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

    @NotBlank(message = "Client or seller name is required")
    private String clientOrSellerName;

    @NotBlank(message = "Site contact name is required")
    private String siteContactName;

    private String siteContactPhone;

    @NotBlank(message = "Site contact email is required")
    private String siteContactEmail;

    @NotBlank(message = "Site address line 1 is required")
    private String siteAddressLine1;

    private String siteAddressLine2;

    @NotBlank(message = "Site city is required")
    private String siteCity;

    private String siteCountry;
    private String siteTimezone;

    @NotNull(message = "Scheduled start date is required")
    private OffsetDateTime scheduledStartDate;

    @NotNull(message = "Scheduled end date is required")
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
