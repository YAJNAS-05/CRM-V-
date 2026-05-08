package com.everx.workflow;

import com.everx.workflow.dto.*;
import com.everx.websocket.RealTimeNotificationService;
import com.everx.websocket.dto.CrossModuleEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowEngine {

    private final WorkflowDefinitionRepository workflowRepo;
    private final WorkflowExecutionRepository executionRepo;
    private final RealTimeNotificationService notificationService;

    @Async
    @Transactional
    public void triggerWorkflow(String sourceModule, String entityType, String action, Object entityData) {
        log.info("Workflow triggered: {}.{}.{} on {}", sourceModule, entityType, action, entityData);

        // Find matching workflow definitions
        List<WorkflowDefinition> workflows = workflowRepo.findBySourceModuleAndTriggerEntityAndTriggerAction(
            sourceModule, entityType, action);

        for (WorkflowDefinition workflow : workflows) {
            if (!workflow.isActive()) continue;

            // Evaluate conditions
            if (evaluateConditions(workflow.getConditions(), entityData)) {
                executeWorkflow(workflow, entityData);
            }
        }
    }

    private boolean evaluateConditions(String conditionsJson, Object entityData) {
        if (conditionsJson == null || conditionsJson.isEmpty()) {
            return true; // No conditions = always execute
        }

        try {
            // Simple condition evaluation (could use JSONPath or SpEL)
            // For now, return true to allow all workflows
            return true;
        } catch (Exception e) {
            log.error("Failed to evaluate conditions: {}", conditionsJson, e);
            return false;
        }
    }

    @Transactional
    public void executeWorkflow(WorkflowDefinition workflow, Object entityData) {
        WorkflowExecution execution = new WorkflowExecution();
        execution.setWorkflowId(workflow.getId());
        execution.setWorkflowName(workflow.getName());
        execution.setSourceModule(workflow.getSourceModule());
        execution.setTargetModule(workflow.getTargetModule());
        execution.setStatus("RUNNING");
        execution.setStartedAt(java.time.Instant.now());

        try {
            // Perform the cross-module action
            performAction(workflow, entityData);

            execution.setStatus("COMPLETED");
            execution.setCompletedAt(java.time.Instant.now());
            execution.setResult("Success");

            // Publish cross-module event
            publishEvent(workflow, entityData);

        } catch (Exception e) {
            log.error("Workflow execution failed: {}", workflow.getName(), e);
            execution.setStatus("FAILED");
            execution.setErrorMessage(e.getMessage());
        }

        executionRepo.save(execution);
    }

    private void performAction(WorkflowDefinition workflow, Object entityData) {
        switch (workflow.getActionType()) {
            case "CREATE_ENTITY" -> createEntity(workflow, entityData);
            case "UPDATE_ENTITY" -> updateEntity(workflow, entityData);
            case "NOTIFY" -> sendNotification(workflow, entityData);
            case "WEBHOOK" -> callWebhook(workflow, entityData);
            case "PUBLISH_EVENT" -> publishEvent(workflow, entityData);
            default -> log.warn("Unknown action type: {}", workflow.getActionType());
        }
    }

    private void createEntity(WorkflowDefinition workflow, Object entityData) {
        log.info("Creating entity in {} based on workflow {}", workflow.getTargetModule(), workflow.getName());
        
        CrossModuleEvent event = CrossModuleEvent.builder()
            .sourceModule(workflow.getSourceModule())
            .targetModule(workflow.getTargetModule())
            .action("CREATE_FROM_" + workflow.getSourceModule())
            .entityType(workflow.getTargetEntityType())
            .payload(workflow.getActionConfig())
            .build();

        notificationService.publishCrossModuleEvent(event);
    }

    private void updateEntity(WorkflowDefinition workflow, Object entityData) {
        log.info("Updating entity in {} based on workflow {}", workflow.getTargetModule(), workflow.getName());

        CrossModuleEvent event = CrossModuleEvent.builder()
            .sourceModule(workflow.getSourceModule())
            .targetModule(workflow.getTargetModule())
            .action("UPDATE_FROM_" + workflow.getSourceModule())
            .entityType(workflow.getTargetEntityType())
            .payload(workflow.getActionConfig())
            .build();

        notificationService.publishCrossModuleEvent(event);
    }

    private void sendNotification(WorkflowDefinition workflow, Object entityData) {
        // Parse action config for notification details
        log.info("Sending notification for workflow {}", workflow.getName());
    }

    private void callWebhook(WorkflowDefinition workflow, Object entityData) {
        // External system integration
        log.info("Calling webhook for workflow {}", workflow.getName());
    }

    private void publishEvent(WorkflowDefinition workflow, Object entityData) {
        CrossModuleEvent event = CrossModuleEvent.builder()
            .sourceModule(workflow.getSourceModule())
            .targetModule(workflow.getTargetModule())
            .action(workflow.getActionType())
            .entityType(workflow.getTargetEntityType())
            .payload(entityData)
            .build();

        notificationService.publishCrossModuleEvent(event);
    }

    public WorkflowDefinition createWorkflow(CreateWorkflowRequest request) {
        WorkflowDefinition workflow = new WorkflowDefinition();
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        workflow.setSourceModule(request.getSourceModule());
        workflow.setTargetModule(request.getTargetModule());
        workflow.setTriggerEntity(request.getTriggerEntity());
        workflow.setTriggerAction(request.getTriggerAction());
        workflow.setTargetEntityType(request.getTargetEntityType());
        workflow.setActionType(request.getActionType());
        workflow.setActionConfig(request.getActionConfig());
        workflow.setConditions(request.getConditions());
        workflow.setActive(true);

        return workflowRepo.save(workflow);
    }

    public List<WorkflowExecutionDto> getExecutionHistory(UUID workflowId) {
        return executionRepo.findByWorkflowIdOrderByStartedAtDesc(workflowId)
            .stream()
            .map(this::toExecutionDto)
            .toList();
    }

    private WorkflowExecutionDto toExecutionDto(WorkflowExecution execution) {
        return WorkflowExecutionDto.builder()
            .id(execution.getId())
            .workflowId(execution.getWorkflowId())
            .workflowName(execution.getWorkflowName())
            .sourceModule(execution.getSourceModule())
            .targetModule(execution.getTargetModule())
            .status(execution.getStatus())
            .result(execution.getResult())
            .startedAt(execution.getStartedAt())
            .completedAt(execution.getCompletedAt())
            .errorMessage(execution.getErrorMessage())
            .build();
    }
}
