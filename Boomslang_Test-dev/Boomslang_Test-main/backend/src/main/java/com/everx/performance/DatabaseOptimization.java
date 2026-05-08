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
@Table(name = "database_optimizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseOptimization {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "analysis")
    private DatabaseAnalysis analysis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations")
    private List<DatabaseRecommendation> recommendations;

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

    @Column(name = "database_type")
    private String databaseType;

    @Column(name = "database_name")
    private String databaseName;

    @Column(name = "optimization_type")
    private String optimizationType;

    @Column(name = "performance_improvement")
    private Double performanceImprovement;

    @Column(name = "query_time_reduction_ms")
    private Double queryTimeReductionMs;

    @Column(name = "index_usage_improvement")
    private Double indexUsageImprovement;

    @Column(name = "storage_saved_mb")
    private Double storageSavedMb;

    @Column(name = "connection_pool_efficiency")
    private Double connectionPoolEfficiency;

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

    @Column(name = "maintenance_window_required")
    private Boolean maintenanceWindowRequired;

    @Column(name = "maintenance_window_start")
    private LocalDateTime maintenanceWindowStart;

    @Column(name = "maintenance_window_end")
    private LocalDateTime maintenanceWindowEnd;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "backup_required")
    private Boolean backupRequired;

    @Column(name = "backup_taken_at")
    private LocalDateTime backupTakenAt;

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

    public boolean hasQueryTimeImprovement() {
        return queryTimeReductionMs != null && queryTimeReductionMs > 0;
    }

    public boolean hasStorageSavings() {
        return storageSavedMb != null && storageSavedMb > 0;
    }

    public boolean requiresMaintenanceWindow() {
        return maintenanceWindowRequired != null && maintenanceWindowRequired;
    }

    public boolean isHighRisk() {
        return "HIGH".equals(riskLevel) || "CRITICAL".equals(riskLevel);
    }

    public boolean requiresBackup() {
        return backupRequired != null && backupRequired;
    }

    public boolean hasBackup() {
        return backupTakenAt != null;
    }

    public boolean isAutomated() {
        return isAutomated != null && isAutomated;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public boolean isInMaintenanceWindow() {
        if (!requiresMaintenanceWindow() || maintenanceWindowStart == null || maintenanceWindowEnd == null) {
            return true;
        }
        
        LocalDateTime now = LocalDateTime.now();
        return !now.isBefore(maintenanceWindowStart) && !now.isAfter(maintenanceWindowEnd);
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

    public void takeBackup() {
        this.backupTakenAt = LocalDateTime.now();
    }

    public void calculateImprovements() {
        if (beforeMetrics != null && afterMetrics != null) {
            // Calculate query time improvement
            Object beforeQueryTime = beforeMetrics.get("averageQueryTime");
            Object afterQueryTime = afterMetrics.get("averageQueryTime");
            
            if (beforeQueryTime instanceof Number && afterQueryTime instanceof Number) {
                double before = ((Number) beforeQueryTime).doubleValue();
                double after = ((Number) afterQueryTime).doubleValue();
                this.queryTimeReductionMs = before - after;
            }
            
            // Calculate index usage improvement
            Object beforeIndexUsage = beforeMetrics.get("indexUsage");
            Object afterIndexUsage = afterMetrics.get("indexUsage");
            
            if (beforeIndexUsage instanceof Number && afterIndexUsage instanceof Number) {
                double before = ((Number) beforeIndexUsage).doubleValue();
                double after = ((Number) afterIndexUsage).doubleValue();
                this.indexUsageImprovement = after - before;
            }
            
            // Calculate storage savings
            Object beforeStorage = beforeMetrics.get("storageUsage");
            Object afterStorage = afterMetrics.get("storageUsage");
            
            if (beforeStorage instanceof Number && afterStorage instanceof Number) {
                double before = ((Number) beforeStorage).doubleValue();
                double after = ((Number) afterStorage).doubleValue();
                this.storageSavedMb = (before - after) / (1024 * 1024); // Convert to MB
            }
        }
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        ROLLED_BACK,
        SCHEDULED
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseAnalysis {
        private Double totalConnections;
        private Double activeConnections;
        private Double queryLatency;
        private Double throughput;
        private Double indexUsage;
        private Double tableSize;
        private String databaseType;
        private Map<String, Object> detailedMetrics;
        private List<String> slowQueries;
        private List<String> missingIndexes;
        private List<String> unusedIndexes;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseRecommendation {
        private String type;
        private String description;
        private String priority;
        private Double estimatedImprovement;
        private Map<String, Object> parameters;
        private String reasoning;
        private String tableName;
        private String indexName;
        private String queryText;
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
