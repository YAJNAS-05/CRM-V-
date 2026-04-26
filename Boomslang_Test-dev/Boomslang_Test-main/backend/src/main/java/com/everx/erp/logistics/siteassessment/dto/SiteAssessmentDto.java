package com.everx.erp.logistics.siteassessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteAssessmentDto {
    private UUID id;
    private String assessmentNumber;
    private UUID salesOrderId;
    private UUID accountId;
    private String assessmentMethod;
    private String roomDimensions;
    private Boolean powerCompliant;
    private String shieldingType;
    private String coolingCapacity;
    private String networkReadiness;
    private String overallReadiness;
    private String remediationRequired;
    private LocalDate assessedDate;
    private LocalDate roomSignOffDate;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
