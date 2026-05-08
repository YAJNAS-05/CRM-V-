package com.everx.workflow.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_step_executions", schema = "everx_workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class WorkflowStepExecution extends BaseEntity {

    @Column(name = "workflow_execution_id", nullable = false)
    private java.util.UUID workflowExecutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_execution_id", insertable = false, updatable = false)
    private WorkflowExecution workflowExecution;

    @Column(name = "workflow_step_id", nullable = false)
    private java.util.UUID workflowStepId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_step_id", insertable = false, updatable = false)
    private WorkflowStep workflowStep;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 1;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 3;

    @Column(name = "input_data", columnDefinition = "JSON")
    private String inputData;

    @Column(name = "output_data", columnDefinition = "JSON")
    private String outputData;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_details", columnDefinition = "JSON")
    private String errorDetails;

    @Column(name = "logs", columnDefinition = "TEXT")
    private String logs; // Execution logs

    @Column(name = "timeout_at")
    private LocalDateTime timeoutAt;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    // Step execution statuses
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_RUNNING = "RUNNING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_SKIPPED = "SKIPPED";
    public static final String STATUS_TIMEOUT = "TIMEOUT";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_RETRYING = "RETRYING";

    // Helper methods
    public boolean isPending() {
        return STATUS_PENDING.equals(status);
    }

    public boolean isRunning() {
        return STATUS_RUNNING.equals(status);
    }

    public boolean isCompleted() {
        return STATUS_COMPLETED.equals(status);
    }

    public boolean isFailed() {
        return STATUS_FAILED.equals(status);
    }

    public boolean isSkipped() {
        return STATUS_SKIPPED.equals(status);
    }

    public boolean isTimeout() {
        return STATUS_TIMEOUT.equals(status);
    }

    public boolean isCancelled() {
        return STATUS_CANCELLED.equals(status);
    }

    public boolean isRetrying() {
        return STATUS_RETRYING.equals(status);
    }

    public boolean isFinished() {
        return isCompleted() || isFailed() || isSkipped() || isTimeout() || isCancelled();
    }

    public boolean canRetry() {
        return isFailed() && attemptCount < maxAttempts;
    }

    public boolean isOverdue() {
        return timeoutAt != null && LocalDateTime.now().isAfter(timeoutAt);
    }

    public boolean shouldRetryNow() {
        return isRetrying() && nextRetryAt != null && !LocalDateTime.now().isBefore(nextRetryAt);
    }

    public void start() {
        this.status = STATUS_RUNNING;
        this.startedAt = LocalDateTime.now();
    }

    public void complete(String outputData) {
        this.status = STATUS_COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.outputData = outputData;
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void fail(String errorMessage, String errorDetails) {
        this.status = STATUS_FAILED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = errorMessage;
        this.errorDetails = errorDetails;
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void skip(String reason) {
        this.status = STATUS_SKIPPED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = reason;
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void timeout() {
        this.status = STATUS_TIMEOUT;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = "Step execution timed out";
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void cancel(String reason) {
        this.status = STATUS_CANCELLED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = reason;
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void retry() {
        this.status = STATUS_RETRYING;
        this.attemptCount++;
        this.nextRetryAt = LocalDateTime.now().plusMinutes(5); // Default retry delay
        this.errorMessage = null;
        this.errorDetails = null;
        this.startedAt = null;
        this.completedAt = null;
        this.durationMs = null;
    }

    public void addLog(String logMessage) {
        String timestamp = LocalDateTime.now().toString();
        String newLog = String.format("[%s] %s", timestamp, logMessage);
        
        if (logs == null || logs.isEmpty()) {
            this.logs = newLog;
        } else {
            this.logs = this.logs + "\n" + newLog;
        }
    }

    public void setTimeout(int timeoutSeconds) {
        if (startedAt != null) {
            this.timeoutAt = startedAt.plusSeconds(timeoutSeconds);
        }
    }

    public String getInputDataAsJson() {
        return inputData != null ? inputData : "{}";
    }

    public String getOutputDataAsJson() {
        return outputData != null ? outputData : "{}";
    }

    public String getErrorDetailsAsJson() {
        return errorDetails != null ? errorDetails : "{}";
    }

    public String getLogs() {
        return logs != null ? logs : "";
    }

    public Long getRunningDurationMs() {
        if (startedAt == null) return 0L;
        LocalDateTime endTime = completedAt != null ? completedAt : LocalDateTime.now();
        return java.time.Duration.between(startedAt, endTime).toMillis();
    }

    public String getFormattedDuration() {
        if (durationMs == null) return "N/A";
        
        long seconds = durationMs / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        
        if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes % 60, seconds % 60);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds % 60);
        } else {
            return String.format("%ds", seconds);
        }
    }

    public double getProgressPercentage() {
        if (isCompleted()) return 100.0;
        if (isPending()) return 0.0;
        if (isRunning()) return 50.0; // Running but not completed
        return 0.0; // Failed, skipped, etc.
    }
}
