package com.everx.hr.timeentry.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartTimerRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private UUID taskId;
    private String description;
    private Boolean billable;
    private BigDecimal ratePerHour;
}
