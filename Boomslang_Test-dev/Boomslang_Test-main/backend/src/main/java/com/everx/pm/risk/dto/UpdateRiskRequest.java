package com.everx.pm.risk.dto;

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
public class UpdateRiskRequest {

    private String title;
    private String description;
    private String severity;
    private String status;
    private UUID ownerId;
    private String mitigationPlan;
    private LocalDate dueDate;
}
