package com.everx.project.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSprintRequest {
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private BigDecimal velocity;
    private BigDecimal capacity;
    private String retrospectiveNotes;
}
