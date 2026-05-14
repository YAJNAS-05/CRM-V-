package com.everx.hr.appraisal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class CreateAppraisalGoalRequest {

    private UUID ownerId;

    @NotBlank(message = "Goal title is required")
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
