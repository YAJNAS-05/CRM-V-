package com.everx.erp.logistics.siteassessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSiteAssessmentRequest {

    @Size(max = 50)
    private String assessmentNumber;

    private UUID salesOrderId;

    private UUID accountId;

    @Size(max = 50)
    private String assessmentMethod;

    @Size(max = 100)
    private String roomDimensions;

    private Boolean powerCompliant;

    @Size(max = 50)
    private String shieldingType;

    @Size(max = 100)
    private String coolingCapacity;

    @Size(max = 100)
    private String networkReadiness;

    @NotBlank(message = "Overall readiness is required")
    @Size(max = 50)
    private String overallReadiness;

    private String remediationRequired;
    private LocalDate assessedDate;
    private LocalDate roomSignOffDate;
    private String notes;
}
