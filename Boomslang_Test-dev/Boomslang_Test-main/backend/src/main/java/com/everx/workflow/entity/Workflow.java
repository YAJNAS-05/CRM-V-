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

import java.util.List;

@Entity
@Table(name = "workflows", schema = "everx_workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true, exclude = {"steps", "executions"})
public class Workflow extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "created_by_user_id", nullable = false)
    private java.util.UUID createdByUserId;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array of tags

    @Column(name = "trigger_type", nullable = false, length = 50)
    private String triggerType;

    @Column(name = "trigger_config", columnDefinition = "JSON")
    private String triggerConfig;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "execution_count", nullable = false)
    @Builder.Default
    private Long executionCount = 0L;

    @Column(name = "success_count", nullable = false)
    @Builder.Default
    private Long successCount = 0L;

    @Column(name = "failure_count", nullable = false)
    @Builder.Default
    private Long failureCount = 0L;

    @Column(name = "last_executed_at")
    private java.time.LocalDateTime lastExecutedAt;

    @Column(name = "next_execution_at")
    private java.time.LocalDateTime nextExecutionAt;

    @Column(name = "timeout_minutes", nullable = false)
    @Builder.Default
    private Integer timeoutMinutes = 30;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 3;

    @Column(name = "retry_delay_minutes", nullable = false)
    @Builder.Default
    private Integer retryDelayMinutes = 5;

    @Column(name = "variables", columnDefinition = "JSON")
    private String variables; // JSON object of workflow variables

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkflowStep> steps = List.of();

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkflowExecution> executions = List.of();

    // Trigger types
    public static final String TRIGGER_MANUAL = "MANUAL";
    public static final String TRIGGER_SCHEDULED = "SCHEDULED";
    public static final String TRIGGER_EVENT = "EVENT";
    public static final String TRIGGER_WEBHOOK = "WEBHOOK";
    public static final String TRIGGER_API = "API";

    // Workflow statuses
    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";
    public static final String STATUS_PAUSED = "PAUSED";
    public static final String STATUS_ARCHIVED = "ARCHIVED";

    // Helper methods
    public boolean isManualTrigger() {
        return TRIGGER_MANUAL.equals(triggerType);
    }

    public boolean isScheduledTrigger() {
        return TRIGGER_SCHEDULED.equals(triggerType);
    }

    public boolean isEventTrigger() {
        return TRIGGER_EVENT.equals(triggerType);
    }

    public boolean isWebhookTrigger() {
        return TRIGGER_WEBHOOK.equals(triggerType);
    }

    public boolean isApiTrigger() {
        return TRIGGER_API.equals(triggerType);
    }

    public boolean isReadyToExecute() {
        return isActive && isPublished && 
               (isManualTrigger() || 
                (isScheduledTrigger() && nextExecutionAt != null && nextExecutionAt.isBefore(java.time.LocalDateTime.now())) ||
                (isEventTrigger() || isWebhookTrigger() || isApiTrigger()));
    }

    public double getSuccessRate() {
        if (executionCount == 0) return 0.0;
        return (double) successCount / executionCount * 100;
    }

    public void incrementExecutionCount(boolean success) {
        this.executionCount++;
        this.lastExecutedAt = java.time.LocalDateTime.now();
        if (success) {
            this.successCount++;
        } else {
            this.failureCount++;
        }
    }

    public void publish() {
        this.isPublished = true;
        this.isActive = true;
    }

    public void pause() {
        this.isActive = false;
    }

    public void resume() {
        this.isActive = true;
    }

    public void archive() {
        this.isPublished = false;
        this.isActive = false;
    }

    public String getTriggerConfigAsJson() {
        return triggerConfig != null ? triggerConfig : "{}";
    }

    public String getVariablesAsJson() {
        return variables != null ? variables : "{}";
    }

    public String[] getTagsAsArray() {
        if (tags == null || tags.equals("[]")) return new String[0];
        return tags.replaceAll("[\\[\\]\"]", "").split(",");
    }

    public String getStatus() {
        if (!isPublished) return STATUS_DRAFT;
        if (!isActive) return STATUS_PAUSED;
        return STATUS_PUBLISHED;
    }
}
