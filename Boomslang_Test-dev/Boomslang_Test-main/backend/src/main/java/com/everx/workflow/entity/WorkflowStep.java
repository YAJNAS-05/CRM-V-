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

@Entity
@Table(name = "workflow_steps", schema = "everx_workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class WorkflowStep extends BaseEntity {

    @Column(name = "workflow_id", nullable = false)
    private java.util.UUID workflowId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", insertable = false, updatable = false)
    private Workflow workflow;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_type", nullable = false, length = 50)
    private String stepType;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;

    @Column(name = "configuration", columnDefinition = "JSON")
    private String configuration;

    @Column(name = "conditions", columnDefinition = "JSON")
    private String conditions; // JSON conditions for step execution

    @Column(name = "input_mapping", columnDefinition = "JSON")
    private String inputMapping; // JSON mapping for input data

    @Column(name = "output_mapping", columnDefinition = "JSON")
    private String outputMapping; // JSON mapping for output data

    @Column(name = "timeout_seconds", nullable = false)
    @Builder.Default
    private Integer timeoutSeconds = 300;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 3;

    @Column(name = "retry_delay_seconds", nullable = false)
    @Builder.Default
    private Integer retryDelaySeconds = 60;

    @Column(name = "is_parallel", nullable = false)
    @Builder.Default
    private Boolean isParallel = false;

    @Column(name = "is_optional", nullable = false)
    @Builder.Default
    private Boolean isOptional = false;

    @Column(name = "error_handling", length = 50)
    @Builder.Default
    private String errorHandling = "STOP"; // STOP, CONTINUE, RETRY

    @Column(name = "dependencies", columnDefinition = "JSON")
    private String dependencies; // JSON array of dependent step IDs

    // Step types
    public static final String TYPE_ACTION = "ACTION";
    public static final String TYPE_CONDITION = "CONDITION";
    public static final String TYPE_LOOP = "LOOP";
    public static final String TYPE_PARALLEL = "PARALLEL";
    public static final String TYPE_DELAY = "DELAY";
    public static final String TYPE_NOTIFICATION = "NOTIFICATION";
    public static final String TYPE_APPROVAL = "APPROVAL";
    public static final String TYPE_WEBHOOK = "WEBHOOK";
    public static final String TYPE_SCRIPT = "SCRIPT";

    // Action types
    public static final String ACTION_SEND_EMAIL = "SEND_EMAIL";
    public static final String ACTION_CREATE_RECORD = "CREATE_RECORD";
    public static final String ACTION_UPDATE_RECORD = "UPDATE_RECORD";
    public static final String ACTION_DELETE_RECORD = "DELETE_RECORD";
    public static final String ACTION_CALL_API = "CALL_API";
    public static final String ACTION_EXECUTE_SCRIPT = "EXECUTE_SCRIPT";
    public static final String ACTION_SEND_NOTIFICATION = "SEND_NOTIFICATION";
    public static final String ACTION_ASSIGN_TASK = "ASSIGN_TASK";
    public static final String ACTION_GENERATE_REPORT = "GENERATE_REPORT";

    // Error handling types
    public static final String ERROR_STOP = "STOP";
    public static final String ERROR_CONTINUE = "CONTINUE";
    public static final String ERROR_RETRY = "RETRY";
    public static final String ERROR_SKIP = "SKIP";

    // Helper methods
    public boolean isActionStep() {
        return TYPE_ACTION.equals(stepType);
    }

    public boolean isConditionStep() {
        return TYPE_CONDITION.equals(stepType);
    }

    public boolean isLoopStep() {
        return TYPE_LOOP.equals(stepType);
    }

    public boolean isParallelStep() {
        return TYPE_PARALLEL.equals(stepType);
    }

    public boolean isDelayStep() {
        return TYPE_DELAY.equals(stepType);
    }

    public boolean isNotificationStep() {
        return TYPE_NOTIFICATION.equals(stepType);
    }

    public boolean isApprovalStep() {
        return TYPE_APPROVAL.equals(stepType);
    }

    public boolean isWebhookStep() {
        return TYPE_WEBHOOK.equals(stepType);
    }

    public boolean isScriptStep() {
        return TYPE_SCRIPT.equals(stepType);
    }

    public boolean shouldStopOnError() {
        return ERROR_STOP.equals(errorHandling);
    }

    public boolean shouldContinueOnError() {
        return ERROR_CONTINUE.equals(errorHandling);
    }

    public boolean shouldRetryOnError() {
        return ERROR_RETRY.equals(errorHandling);
    }

    public boolean shouldSkipOnError() {
        return ERROR_SKIP.equals(errorHandling);
    }

    public String getConfigurationAsJson() {
        return configuration != null ? configuration : "{}";
    }

    public String getConditionsAsJson() {
        return conditions != null ? conditions : "[]";
    }

    public String getInputMappingAsJson() {
        return inputMapping != null ? inputMapping : "{}";
    }

    public String getOutputMappingAsJson() {
        return outputMapping != null ? outputMapping : "{}";
    }

    public String[] getDependenciesAsArray() {
        if (dependencies == null || dependencies.equals("[]")) return new String[0];
        return dependencies.replaceAll("[\\[\\]\"]", "").split(",");
    }

    public boolean hasDependencies() {
        return dependencies != null && !dependencies.equals("[]") && !dependencies.equals("null");
    }

    public void updateConfiguration(String newConfig) {
        this.configuration = newConfig;
    }

    public void addDependency(String stepId) {
        // This would add a step ID to the dependencies JSON array
        // Implementation depends on JSON library used
    }

    public void removeDependency(String stepId) {
        // This would remove a step ID from the dependencies JSON array
        // Implementation depends on JSON library used
    }
}
