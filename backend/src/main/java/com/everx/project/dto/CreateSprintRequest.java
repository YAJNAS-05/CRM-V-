package com.everx.project.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSprintRequest {
    private UUID projectId;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
}
