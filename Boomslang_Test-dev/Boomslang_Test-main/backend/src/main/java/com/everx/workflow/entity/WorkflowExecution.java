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
import java.util.List;

@Entity
@Table(name = "workflow_executions", schema = "everx_workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true, exclude = {"stepExecutions"})
public class WorkflowExecution extends BaseEntity {

    @Column(name = "workflow_id", nullable = false)
    private java.util.UUID workflowId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", insertable = false, updatable = false)
    private Workflow workflow;

    @Column(name = "execution_id", nullable = false, unique = true, length = 100)
    private String executionId;

    @Column(name = "triggered_by", nullable = false, length = 100)
    private String triggeredBy;

    @Column(name = "trigger_data", columnDefinition = "JSON")
    private String triggerData;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "current_step")
    private Integer currentStep;

    @Column(name = "total_steps")
    private Integer totalSteps;

    @Column(name = "completed_steps")
    @Builder.Default
    private Integer completedSteps = 0;

    @Column(name = "failed_steps")
    @Builder.Default
    private Integer failedSteps = 0;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "max_retries")
    @Builder.Default
    private Integer maxRetries = 3;

    @Column(name = "variables", columnDefinition = "JSON")
    private String variables; // JSON object of execution variables

    @Column(name = "input_data", columnDefinition = "JSON")
    private String inputData; // JSON input data

    @Column(name = "output_data", columnDefinition = "JSON")
    private String outputData; // JSON output data

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_details", columnDefinition = "JSON")
    private String errorDetails;

    @Column(name = "progress_percentage", nullable = false)
    @Builder.Default
    private Double progressPercentage = 0.0;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "timeout_at")
    private LocalDateTime timeoutAt;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @OneToMany(mappedBy = "workflowExecution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkflowStepExecution> stepExecutions = List.of();

    // Execution statuses
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_RUNNING = "RUNNING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_TIMEOUT = "TIMEOUT";
    public static final String STATUS_PAUSED = "PAUSED";
    public static final String STATUS_RETRYING = "RETRYING";

    // Trigger types
    public static final String TRIGGER_USER = "USER";
    public static final String TRIGGER_SCHEDULE = "SCHEDULE";
    public static final String TRIGGER_EVENT = "EVENT";
    public static final String TRIGGER_WEBHOOK = "WEBHOOK";
    public static final String TRIGGER_API = "API";
    public static final String TRIGGER_SYSTEM = "SYSTEM";

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

    public boolean isCancelled() {
        return STATUS_CANCELLED.equals(status);
    }

    public boolean isTimeout() {
        return STATUS_TIMEOUT.equals(status);
    }

    public boolean isPaused() {
        return STATUS_PAUSED.equals(status);
    }

    public boolean isRetrying() {
        return STATUS_RETRYING.equals(status);
    }

    public boolean isFinished() {
        return isCompleted() || isFailed() || isCancelled() || isTimeout();
    }

    public boolean canRetry() {
        return isFailed() && retryCount < maxRetries;
    }

    public boolean isOverdue() {
        return timeoutAt != null && LocalDateTime.now().isAfter(timeoutAt);
    }

    public void start() {
        this.status = STATUS_RUNNING;
        this.startedAt = LocalDateTime.now();
        this.timeoutAt = startedAt.plusMinutes(30); // Default timeout
    }

    public void complete() {
        this.status = STATUS_COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.progressPercentage = 100.0;
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

    public void cancel(String reason) {
        this.status = STATUS_CANCELLED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = reason;
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void timeout() {
        this.status = STATUS_TIMEOUT;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = "Workflow execution timed out";
        if (startedAt != null) {
            this.durationMs = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }

    public void pause() {
        this.status = STATUS_PAUSED;
    }

    public void resume() {
        this.status = STATUS_RUNNING;
    }

    public void retry() {
        this.status = STATUS_RETRYING;
        this.retryCount++;
        this.errorMessage = null;
        this.errorDetails = null;
    }

    public void updateProgress(int completedSteps, int totalSteps) {
        this.completedSteps = completedSteps;
        this.totalSteps = totalSteps;
        if (totalSteps > 0) {
            this.progressPercentage = (double) completedSteps / totalSteps * 100;
        }
    }

    public void incrementFailedSteps() {
        this.failedSteps++;
    }

    public void setCurrentStep(Integer stepNumber) {
        this.currentStep = stepNumber;
    }

    public String getVariablesAsJson() {
        return variables != null ? variables : "{}";
    }

    public String getInputDataAsJson() {
        return inputData != null ? inputData : "{}";
    }

    public String getOutputDataAsJson() {
        return outputData != null ? outputData : "{}";
    }

    public String getTriggerDataAsJson() {
        return triggerData != null ? triggerData : "{}";
    }

    public String getErrorDetailsAsJson() {
        return errorDetails != null ? errorDetails : "{}";
    }

    public boolean wasTriggeredByUser() {
        return TRIGGER_USER.equals(triggeredBy);
    }

    public boolean wasTriggeredBySchedule() {
        return TRIGGER_SCHEDULE.equals(triggeredBy);
    }

    public boolean wasTriggeredByEvent() {
        return TRIGGER_EVENT.equals(triggeredBy);
    }

    public boolean wasTriggeredByWebhook() {
        return TRIGGER_WEBHOOK.equals(triggeredBy);
    }

    public boolean wasTriggeredByApi() {
        return TRIGGER_API.equals(triggeredBy);
    }

    public boolean wasTriggeredBySystem() {
        return TRIGGER_SYSTEM.equals(triggeredBy);
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
}
