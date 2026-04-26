package com.everx.erp.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssessmentDto {
    private UUID id;
    private String assessmentNumber;
    private UUID acquisitionId;
    private UUID equipmentId;
    private String assessmentType;
    private LocalDate inspectionDate;
    private String engineerAssigned;
    private Integer tubeLifeRemaining;
    private Integer imageQualityRating;
    private String conditionGrade;
    private String outcome;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
