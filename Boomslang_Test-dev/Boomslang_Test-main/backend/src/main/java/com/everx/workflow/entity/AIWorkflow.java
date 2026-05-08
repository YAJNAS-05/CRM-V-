package com.everx.workflow.entity;

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
@Table(name = "ai_workflows")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIWorkflow {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "workflow_type", nullable = false)
    private WorkflowType workflowType;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    private TriggerType triggerType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trigger_conditions")
    private Map<String, Object> triggerConditions;

    @Column(name = "ai_model")
    private String aiModel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_parameters")
    private Map<String, Object> aiParameters;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "max_executions")
    private Integer maxExecutions;

    @Column(name = "timeout_minutes")
    private Integer timeoutMinutes;

    @Column(name = "retry_policy")
    private String retryPolicy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    @Column(name = "deactivated_by")
    private String deactivatedBy;

    @Column(name = "execution_count")
    private Long executionCount;

    @Column(name = "last_execution_at")
    private LocalDateTime lastExecutionAt;

    @Column(name = "success_count")
    private Long successCount;

    @Column(name = "failure_count")
    private Long failureCount;

    @Column(name = "average_execution_time")
    private Double averageExecutionTime;

    @Column(name = "estimated_duration")
    private Double estimatedDuration;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "version")
    private Integer version;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "is_public")
    private Boolean isPublic;

    @Column(name = "is_system")
    private Boolean isSystem;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isDraft() {
        return Status.DRAFT.equals(status);
    }

    public boolean isReady() {
        return isActive() && triggerConditions != null && !triggerConditions.isEmpty();
    }

    public void activate() {
        this.status = Status.ACTIVE;
        this.activatedAt = LocalDateTime.now();
    }

    public void deactivate(String deactivatedBy) {
        this.status = Status.INACTIVE;
        this.deactivatedAt = LocalDateTime.now();
        this.deactivatedBy = deactivatedBy;
    }

    public void recordExecution(boolean success, double executionTime) {
        this.executionCount = (this.executionCount == null ? 0L : this.executionCount) + 1;
        this.lastExecutionAt = LocalDateTime.now();
        
        if (success) {
            this.successCount = (this.successCount == null ? 0L : this.successCount) + 1;
        } else {
            this.failureCount = (this.failureCount == null ? 0L : this.failureCount) + 1;
        }
        
        // Update average execution time
        if (this.averageExecutionTime == null) {
            this.averageExecutionTime = executionTime;
        } else {
            this.averageExecutionTime = (this.averageExecutionTime + executionTime) / 2;
        }
    }

    public double getSuccessRate() {
        if (executionCount == null || executionCount == 0) {
            return 0.0;
        }
        return (double) (successCount == null ? 0L : successCount) / executionCount;
    }

    public boolean hasReachedMaxExecutions() {
        return maxExecutions != null && executionCount != null && executionCount >= maxExecutions;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public boolean isSystemWorkflow() {
        return isSystem != null && isSystem;
    }

    public void incrementVersion() {
        this.version = (this.version == null ? 1 : this.version + 1);
    }

    public enum WorkflowType {
        AUTOMATION,
        APPROVAL,
        NOTIFICATION,
        DATA_PROCESSING,
        INTEGRATION,
        MONITORING,
        REPORTING,
        CLEANUP,
        BACKUP,
        SECURITY,
        COMPLIANCE,
        ANALYSIS,
        CUSTOM
    }

    public enum TriggerType {
        SCHEDULED,
        EVENT_BASED,
        MANUAL,
        API_CALL,
        WEBHOOK,
        EMAIL,
        FILE_UPLOAD,
        DATA_CHANGE,
        THRESHOLD,
        TIME_BASED,
        CONDITION_BASED,
        EXTERNAL
    }

    public enum Status {
        DRAFT,
        ACTIVE,
        INACTIVE,
        PAUSED,
        ARCHIVED,
        ERROR
    }
}
