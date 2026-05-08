package com.everx.performance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "cache_optimizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CacheOptimization {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "analysis")
    private CacheAnalysis analysis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations")
    private List<CacheRecommendation> recommendations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "results")
    private List<OptimizationResult> results;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(name = "applied_by")
    private String appliedBy;

    @Column(name = "cache_type")
    private String cacheType;

    @Column(name = "cache_name")
    private String cacheName;

    @Column(name = "optimization_type")
    private String optimizationType;

    @Column(name = "performance_improvement")
    private Double performanceImprovement;

    @Column(name = "memory_saved_mb")
    private Double memorySavedMb;

    @Column(name = "hit_rate_improvement")
    private Double hitRateImprovement;

    @Column(name = "latency_reduction_ms")
    private Double latencyReductionMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_metrics")
    private Map<String, Object> beforeMetrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_metrics")
    private Map<String, Object> afterMetrics;

    @Column(name = "rollback_available")
    private Boolean rollbackAvailable;

    @Column(name = "rollback_at")
    private LocalDateTime rollbackAt;

    @Column(name = "rollback_by")
    private String rollbackBy;

    @Column(name = "rollback_reason")
    private String rollbackReason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "actual_duration_minutes")
    private Double actualDurationMinutes;

    @Column(name = "cost_savings")
    private Double costSavings;

    @Column(name = "is_automated")
    private Boolean isAutomated;

    @Column(name = "schedule")
    private String schedule;

    // Helper methods
    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean isPending() {
        return Status.PENDING.equals(status);
    }

    public boolean isRunning() {
        return Status.RUNNING.equals(status);
    }

    public boolean isFailed() {
        return Status.FAILED.equals(status);
    }

    public boolean isApplied() {
        return appliedAt != null;
    }

    public boolean isRolledBack() {
        return rollbackAt != null;
    }

    public boolean canRollback() {
        return rollbackAvailable != null && rollbackAvailable && !isRolledBack();
    }

    public boolean hasSignificantImprovement() {
        return performanceImprovement != null && performanceImprovement > 5.0; // 5% threshold
    }

    public boolean hasMemorySavings() {
        return memorySavedMb != null && memorySavedMb > 0;
    }

    public boolean hasLatencyImprovement() {
        return latencyReductionMs != null && latencyReductionMs > 0;
    }

    public boolean isAutomated() {
        return isAutomated != null && isAutomated;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.completedAt = LocalDateTime.now();
        
        if (createdAt != null && completedAt != null) {
            this.actualDurationMinutes = java.time.Duration.between(createdAt, completedAt).toMinutes() / 60.0;
        }
    }

    public void apply(String appliedBy) {
        this.appliedAt = LocalDateTime.now();
        this.appliedBy = appliedBy;
    }

    public void rollback(String rollbackBy, String reason) {
        this.rollbackAt = LocalDateTime.now();
        this.rollbackBy = rollbackBy;
        this.rollbackReason = reason;
    }

    public void calculateImprovements() {
        if (beforeMetrics != null && afterMetrics != null) {
            // Calculate hit rate improvement
            Object beforeHitRate = beforeMetrics.get("hitRate");
            Object afterHitRate = afterMetrics.get("hitRate");
            
            if (beforeHitRate instanceof Number && afterHitRate instanceof Number) {
                double before = ((Number) beforeHitRate).doubleValue();
                double after = ((Number) afterHitRate).doubleValue();
                this.hitRateImprovement = after - before;
            }
            
            // Calculate latency reduction
            Object beforeLatency = beforeMetrics.get("averageLatency");
            Object afterLatency = afterMetrics.get("averageLatency");
            
            if (beforeLatency instanceof Number && afterLatency instanceof Number) {
                double before = ((Number) beforeLatency).doubleValue();
                double after = ((Number) afterLatency).doubleValue();
                this.latencyReductionMs = before - after;
            }
            
            // Calculate memory savings
            Object beforeMemory = beforeMetrics.get("memoryUsage");
            Object afterMemory = afterMetrics.get("memoryUsage");
            
            if (beforeMemory instanceof Number && afterMemory instanceof Number) {
                double before = ((Number) beforeMemory).doubleValue();
                double after = ((Number) afterMemory).doubleValue();
                this.memorySavedMb = (before - after) / (1024 * 1024); // Convert to MB
            }
        }
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        ROLLED_BACK
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CacheAnalysis {
        private Double totalCacheSize;
        private Double hitRate;
        private Double missRate;
        private Double evictionRate;
        private Double averageAccessTime;
        private Double memoryUsage;
        private String cacheType;
        private Map<String, Object> detailedMetrics;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CacheRecommendation {
        private String type;
        private String description;
        private String priority;
        private Double estimatedImprovement;
        private Map<String, Object> parameters;
        private String reasoning;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimizationResult {
        private String type;
        private Status status;
        private LocalDateTime appliedAt;
        private Double actualImprovement;
        private String message;
        private Map<String, Object> details;
    }
}
