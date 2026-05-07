package com.everx.hr.pm.risk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateRiskRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Risk title is required")
    private String title;

    private String description;
    private String severity;
    private String status;
    private UUID ownerId;
    private String mitigationPlan;
    private LocalDate dueDate;
}
