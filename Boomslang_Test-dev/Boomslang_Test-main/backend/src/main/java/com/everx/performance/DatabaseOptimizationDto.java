package com.everx.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseOptimizationDto {
    private UUID id;
    private UUID tenantId;
    private String databaseType;
    private String databaseName;
    private String optimizationType;
    private DatabaseOptimization.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Double performanceImprovement;
    private Double queryTimeReductionMs;
    private Double storageSavedMb;
    private Boolean isApplied;

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        ROLLED_BACK,
        SCHEDULED
    }
}
