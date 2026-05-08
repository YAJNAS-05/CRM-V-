package com.everx.integration.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "integration_executions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationExecution {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "config_id", nullable = false)
    private UUID configId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data")
    private Map<String, Object> data;

    @Column(name = "triggered_by", nullable = false)
    private String triggeredBy;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "max_retries")
    private Integer maxRetries;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "estimated_duration")
    private Double estimatedDuration;

    @Column(name = "actual_duration")
    private Double actualDuration;

    @Column(name = "processed_records")
    private Long processedRecords;

    @Column(name = "total_records")
    private Long totalRecords;

    @Column(name = "success_records")
    private Long successRecords;

    @Column(name = "failure_records")
    private Long failureRecords;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "execution_details")
    private Map<String, Object> executionDetails;

    @Column(name = "execution_id")
    private String executionId;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "correlation_id")
    private String correlationId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "timeout_at")
    private LocalDateTime timeoutAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "source_system_response_time")
    private Long sourceSystemResponseTime;

    @Column(name = "target_system_response_time")
    private Long targetSystemResponseTime;

    @Column(name = "data_volume_bytes")
    private Long dataVolumeBytes;

    @Column(name = "transformation_time")
    private Long transformationTime;

    // Helper methods
    public boolean isRunning() {
        return Status.RUNNING.equals(status);
    }

    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean isFailed() {
        return Status.FAILED.equals(status);
    }

    public boolean isCancelled() {
        return Status.CANCELLED.equals(status);
    }

    public boolean isPending() {
        return Status.PENDING.equals(status);
    }

    public boolean isTimedOut() {
        return timeoutAt != null && LocalDateTime.now().isAfter(timeoutAt);
    }

    public boolean canRetry() {
        return isFailed() && 
               (maxRetries == null || retryCount == null || retryCount < maxRetries) &&
               (nextRetryAt == null || LocalDateTime.now().isAfter(nextRetryAt));
    }

    public void complete() {
        this.status = Status.COMPLETED;
        this.completedAt = LocalDateTime.now();
        
        if (startedAt != null) {
            this.actualDuration = java.time.Duration.between(startedAt, completedAt).toMillis() / 1000.0;
        }
    }

    public void fail(String errorMessage) {
        this.status = Status.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = LocalDateTime.now();
        
        if (startedAt != null) {
            this.actualDuration = java.time.Duration.between(startedAt, completedAt).toMillis() / 1000.0;
        }
    }

    public void retry() {
        this.retryCount = (this.retryCount == null ? 0 : this.retryCount) + 1;
        this.status = Status.PENDING;
        this.errorMessage = null;
        
        // Set next retry time (exponential backoff)
        long delayMinutes = (long) Math.pow(2, this.retryCount);
        this.nextRetryAt = LocalDateTime.now().plusMinutes(delayMinutes);
    }

    public void cancel(String cancelledBy) {
        this.status = Status.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancelledBy = cancelledBy;
        this.completedAt = LocalDateTime.now();
    }

    public void incrementProcessedRecords() {
        this.processedRecords = (this.processedRecords == null ? 0L : this.processedRecords) + 1;
    }

    public void incrementSuccessRecords() {
        this.successRecords = (this.successRecords == null ? 0L : this.successRecords) + 1;
    }

    public void incrementFailureRecords() {
        this.failureRecords = (this.failureRecords == null ? 0L : this.failureRecords) + 1;
    }

    public double getSuccessRate() {
        if (processedRecords == null || processedRecords == 0) {
            return 0.0;
        }
        long successes = successRecords == null ? 0L : successRecords;
        return (double) successes / processedRecords;
    }

    public double getCompletionRate() {
        if (totalRecords == null || totalRecords == 0) {
            return 0.0;
        }
        long processed = processedRecords == null ? 0L : processedRecords;
        return (double) processed / totalRecords;
    }

    public boolean hasRemainingRetries() {
        return maxRetries == null || retryCount == null || retryCount < maxRetries;
    }

    public boolean shouldRetryNow() {
        return canRetry() && (nextRetryAt == null || LocalDateTime.now().isAfter(nextRetryAt));
    }

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        TIMEOUT,
        RETRYING
    }
}
