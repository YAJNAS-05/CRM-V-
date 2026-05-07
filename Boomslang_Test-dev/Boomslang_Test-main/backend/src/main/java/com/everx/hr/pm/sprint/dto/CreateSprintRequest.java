package com.everx.hr.pm.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSprintRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Sprint name is required")
    private String name;

    private String goal;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal capacityHours;
}
