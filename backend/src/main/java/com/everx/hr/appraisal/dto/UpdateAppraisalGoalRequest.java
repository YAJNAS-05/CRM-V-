package com.everx.hr.appraisal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAppraisalGoalRequest {

    private UUID ownerId;
    private String title;
    private String description;
    private LocalDate targetDate;
    private String status;

    @Min(0)
    @Max(100)
    private Integer progress;

    private String parentGoalId;
    private String parentGoalTitle;
    private String ownerName;
}
