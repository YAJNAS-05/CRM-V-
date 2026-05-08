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
public class CacheOptimizationDto {
    private UUID id;
    private UUID tenantId;
    private String cacheType;
    private String optimizationType;
    private CacheOptimization.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Double performanceImprovement;
    private Double memorySavedMb;
    private Double latencyReductionMs;
    private Boolean isApplied;

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        ROLLED_BACK
    }
}
