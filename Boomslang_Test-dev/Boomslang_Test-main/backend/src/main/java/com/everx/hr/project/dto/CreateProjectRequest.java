package com.everx.hr.project.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CreateProjectRequest {

    private String projectCode;

    @NotBlank(message = "Project name is required")
    private String projectName;

    private UUID ownerId;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private String currency;
    private UUID linkedFieldJobId;
}
