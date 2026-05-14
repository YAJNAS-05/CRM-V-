package com.everx.erp.assessment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class CreateEquipmentAssessmentRequest {

    @Size(max = 50)
    private String assessmentNumber;

    private UUID acquisitionId;
    private UUID equipmentId;

    @NotBlank(message = "Assessment type is required")
    @Size(max = 50)
    private String assessmentType;

    private LocalDate inspectionDate;

    @Size(max = 255)
    private String engineerAssigned;

    private Integer tubeLifeRemaining;

    @Min(1)
    @Max(5)
    private Integer imageQualityRating;

    @Size(max = 20)
    private String conditionGrade;

    @NotBlank(message = "Outcome is required")
    @Size(max = 50)
    private String outcome;

    private String notes;
}
