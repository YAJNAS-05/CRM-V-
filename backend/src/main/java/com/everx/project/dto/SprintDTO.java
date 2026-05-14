package com.everx.project.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintDTO {
    private UUID id;
    private UUID projectId;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private BigDecimal velocity;
    private BigDecimal capacity;
    private String retrospectiveNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
