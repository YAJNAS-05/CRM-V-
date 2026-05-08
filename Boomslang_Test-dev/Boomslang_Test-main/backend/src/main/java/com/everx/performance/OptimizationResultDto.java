package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResultDto {
    private String ruleName;
    private String status;
    private LocalDateTime appliedAt;
    private Double actualImprovement;
    private String message;
    private String details;
}
