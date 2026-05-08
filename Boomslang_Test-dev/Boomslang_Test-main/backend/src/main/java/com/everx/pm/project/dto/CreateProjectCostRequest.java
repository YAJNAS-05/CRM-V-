package com.everx.pm.project.dto;

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
public class CreateProjectCostRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Cost type is required")
    private String costType;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;
    private LocalDate recordedDate;
}
