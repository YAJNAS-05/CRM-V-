package com.everx.workflow.service;

import com.everx.workflow.dto.*;
import com.everx.workflow.entity.*;
import com.everx.workflow.repository.WorkflowRepository;
import com.everx.workflow.repository.WorkflowStepRepository;
import com.everx.workflow.repository.WorkflowExecutionRepository;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStepRepository workflowStepRepository;
    private final WorkflowExecutionRepository workflowExecutionRepository;
    private final TenantContextService tenantContextService;

    // Workflow Management
    @Transactional
    public WorkflowDto createWorkflow(CreateWorkflowRequest request) {
        log.info("Creating workflow: {} for tenant: {}", request.getName(), request.getTenantId());

        Workflow workflow = Workflow.builder()
                .name(request.getName())
                .description(request.getDescription())
                .tenantId(request.getTenantId())
                .createdByUserId(request.getCreatedByUserId())
                .category(request.getCategory())
                .tags(request.getTags())
                .triggerType(request.getTriggerType())
                .triggerConfig(request.getTriggerConfig())
                .isActive(false)
                .isPublished(false)
                .version(1)
                .timeoutMinutes(request.getTimeoutMinutes() != null ? request.getTimeoutMinutes() : 30)
                .retryCount(request.getRetryCount() != null ? request.getRetryCount() : 3)
                .retryDelayMinutes(request.getRetryDelayMinutes() != null ? request.getRetryDelayMinutes() : 5)
                .variables(request.getVariables())
                .build();

        workflow = workflowRepository.save(workflow);
        return convertToDto(workflow);
    }

    @Transactional
    public WorkflowDto updateWorkflow(UUID workflowId, UpdateWorkflowRequest request) {
        log.info("Updating workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (request.getName() != null) {
            workflow.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workflow.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            workflow.setCategory(request.getCategory());
        }
        if (request.getTags() != null) {
            workflow.setTags(request.getTags());
        }
        if (request.getTriggerType() != null) {
            workflow.setTriggerType(request.getTriggerType());
        }
        if (request.getTriggerConfig() != null) {
            workflow.setTriggerConfig(request.getTriggerConfig());
        }
        if (request.getTimeoutMinutes() != null) {
            workflow.setTimeoutMinutes(request.getTimeoutMinutes());
        }
        if (request.getRetryCount() != null) {
            workflow.setRetryCount(request.getRetryCount());
        }
        if (request.getRetryDelayMinutes() != null) {
            workflow.setRetryDelayMinutes(request.getRetryDelayMinutes());
        }
        if (request.getVariables() != null) {
            workflow.setVariables(request.getVariables());
        }

        workflow = workflowRepository.save(workflow);
        return convertToDto(workflow);
    }

    @Transactional
    public void publishWorkflow(UUID workflowId) {
        log.info("Publishing workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        workflow.publish();
        workflowRepository.save(workflow);
    }

    @Transactional
    public void pauseWorkflow(UUID workflowId) {
        log.info("Pausing workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        workflow.pause();
        workflowRepository.save(workflow);
    }

    @Transactional
    public void resumeWorkflow(UUID workflowId) {
        log.info("Resuming workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        workflow.resume();
        workflowRepository.save(workflow);
    }

    @Transactional
    public void archiveWorkflow(UUID workflowId) {
        log.info("Archiving workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        workflow.archive();
        workflowRepository.save(workflow);
    }

    @Transactional(readOnly = true)
    public WorkflowDto getWorkflowById(UUID workflowId) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        return convertToDto(workflow);
    }

    @Transactional(readOnly = true)
    public List<WorkflowDto> getWorkflowsByTenant(UUID tenantId) {
        return workflowRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WorkflowDto> getWorkflowsByStatus(String status, Pageable pageable) {
        return workflowRepository.findByStatus(status, pageable)
                .map(this::convertToDto);
    }

    // Workflow Steps
    @Transactional
    public WorkflowStepDto createStep(CreateStepRequest request) {
        log.info("Creating workflow step: {} for workflow: {}", request.getName(), request.getWorkflowId());

        WorkflowStep step = WorkflowStep.builder()
                .workflowId(request.getWorkflowId())
                .name(request.getName())
                .description(request.getDescription())
                .stepOrder(request.getStepOrder())
                .stepType(request.getStepType())
                .actionType(request.getActionType())
                .configuration(request.getConfiguration())
                .conditions(request.getConditions())
                .inputMapping(request.getInputMapping())
                .outputMapping(request.getOutputMapping())
                .timeoutSeconds(request.getTimeoutSeconds() != null ? request.getTimeoutSeconds() : 300)
                .retryCount(request.getRetryCount() != null ? request.getRetryCount() : 3)
                .retryDelaySeconds(request.getRetryDelaySeconds() != null ? request.getRetryDelaySeconds() : 60)
                .isParallel(request.getIsParallel() != null ? request.getIsParallel() : false)
                .isOptional(request.getIsOptional() != null ? request.getIsOptional() : false)
                .errorHandling(request.getErrorHandling() != null ? request.getErrorHandling() : "STOP")
                .dependencies(request.getDependencies())
                .build();

        step = workflowStepRepository.save(step);
        return convertStepToDto(step);
    }

    @Transactional(readOnly = true)
    public List<WorkflowStepDto> getStepsByWorkflow(UUID workflowId) {
        return workflowStepRepository.findByWorkflowIdOrderByStepOrderAsc(workflowId)
                .stream()
                .map(this::convertStepToDto)
                .toList();
    }

    // Workflow Execution
    @Transactional
    public WorkflowExecutionDto executeWorkflow(UUID workflowId, ExecuteWorkflowRequest request) {
        log.info("Executing workflow: {}", workflowId);

        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (!workflow.isReadyToExecute()) {
            throw new RuntimeException("Workflow is not ready for execution");
        }

        String executionId = generateExecutionId();
        
        WorkflowExecution execution = WorkflowExecution.builder()
                .workflowId(workflowId)
                .executionId(executionId)
                .triggeredBy(request.getTriggeredBy())
                .triggerData(request.getTriggerData())
                .status(WorkflowExecution.STATUS_PENDING)
                .currentStep(0)
                .totalSteps(workflow.getSteps().size())
                .inputData(request.getInputData())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .scheduledAt(request.getScheduledAt())
                .maxRetries(workflow.getRetryCount())
                .build();

        execution = workflowExecutionRepository.save(execution);

        // Update workflow execution count
        workflow.incrementExecutionCount(true); // Will be updated based on actual result
        workflowRepository.save(workflow);

        // Start execution asynchronously
        startWorkflowExecution(execution.getId());

        return convertExecutionToDto(execution);
    }

    @Transactional
    public void cancelExecution(UUID executionId, String reason) {
        log.info("Cancelling workflow execution: {} with reason: {}", executionId, reason);

        WorkflowExecution execution = workflowExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Workflow execution not found"));

        execution.cancel(reason);
        workflowExecutionRepository.save(execution);

        // Cancel all running step executions
        List<WorkflowStepExecution> stepExecutions = workflowStepExecutionRepository
                .findByWorkflowExecutionIdAndStatus(executionId, WorkflowStepExecution.STATUS_RUNNING);
        
        for (WorkflowStepExecution stepExecution : stepExecutions) {
            stepExecution.cancel("Workflow execution cancelled: " + reason);
            workflowStepExecutionRepository.save(stepExecution);
        }
    }

    @Transactional
    public void retryExecution(UUID executionId) {
        log.info("Retrying workflow execution: {}", executionId);

        WorkflowExecution execution = workflowExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Workflow execution not found"));

        if (!execution.canRetry()) {
            throw new RuntimeException("Execution cannot be retried");
        }

        execution.retry();
        workflowExecutionRepository.save(execution);

        // Restart execution
        startWorkflowExecution(executionId);
    }

    @Transactional(readOnly = true)
    public WorkflowExecutionDto getExecutionById(UUID executionId) {
        WorkflowExecution execution = workflowExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Workflow execution not found"));
        return convertExecutionToDto(execution);
    }

    @Transactional(readOnly = true)
    public List<WorkflowExecutionDto> getExecutionsByWorkflow(UUID workflowId) {
        return workflowExecutionRepository.findByWorkflowIdOrderByStartedAtDesc(workflowId)
                .stream()
                .map(this::convertExecutionToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WorkflowExecutionDto> getExecutionsByStatus(String status, Pageable pageable) {
        return workflowExecutionRepository.findByStatus(status, pageable)
                .map(this::convertExecutionToDto);
    }

    // Workflow Processing
    @Transactional
    public void processPendingExecutions() {
        log.info("Processing pending workflow executions");

        List<WorkflowExecution> pendingExecutions = workflowExecutionRepository
                .findByStatusOrderByScheduledAtAsc(WorkflowExecution.STATUS_PENDING);

        for (WorkflowExecution execution : pendingExecutions) {
            if (execution.getScheduledAt() == null || execution.getScheduledAt().isBefore(LocalDateTime.now())) {
                startWorkflowExecution(execution.getId());
            }
        }
    }

    @Transactional
    public void processRetryExecutions() {
        log.info("Processing retry workflow executions");

        List<WorkflowExecution> retryingExecutions = workflowExecutionRepository
                .findByStatusAndNextRetryAtBefore(WorkflowExecution.STATUS_RETRYING, LocalDateTime.now());

        for (WorkflowExecution execution : retryingExecutions) {
            startWorkflowExecution(execution.getId());
        }
    }

    @Transactional
    public void processTimeoutExecutions() {
        log.info("Processing timeout workflow executions");

        List<WorkflowExecution> runningExecutions = workflowExecutionRepository
                .findByStatus(WorkflowExecution.STATUS_RUNNING);

        for (WorkflowExecution execution : runningExecutions) {
            if (execution.isOverdue()) {
                execution.timeout();
                workflowExecutionRepository.save(execution);
                
                // Cancel all running step executions
                List<WorkflowStepExecution> stepExecutions = workflowStepExecutionRepository
                        .findByWorkflowExecutionIdAndStatus(execution.getId(), WorkflowStepExecution.STATUS_RUNNING);
                
                for (WorkflowStepExecution stepExecution : stepExecutions) {
                    stepExecution.timeout();
                    workflowStepExecutionRepository.save(stepExecution);
                }
            }
        }
    }

    // Private helper methods
    private void startWorkflowExecution(UUID executionId) {
        // This would start the actual workflow execution
        // For now, we'll just update the status
        WorkflowExecution execution = workflowExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Workflow execution not found"));

        execution.start();
        workflowExecutionRepository.save(execution);

        log.info("Started workflow execution: {}", executionId);
    }

    private String generateExecutionId() {
        return "exec_" + UUID.randomUUID().toString().replace("-", "");
    }

    private WorkflowDto convertToDto(Workflow workflow) {
        return WorkflowDto.builder()
                .id(workflow.getId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .tenantId(workflow.getTenantId())
                .createdByUserId(workflow.getCreatedByUserId())
                .category(workflow.getCategory())
                .tags(workflow.getTags())
                .triggerType(workflow.getTriggerType())
                .triggerConfig(workflow.getTriggerConfig())
                .isActive(workflow.getIsActive())
                .isPublished(workflow.getIsPublished())
                .version(workflow.getVersion())
                .executionCount(workflow.getExecutionCount())
                .successCount(workflow.getSuccessCount())
                .failureCount(workflow.getFailureCount())
                .successRate(workflow.getSuccessRate())
                .lastExecutedAt(workflow.getLastExecutedAt())
                .nextExecutionAt(workflow.getNextExecutionAt())
                .timeoutMinutes(workflow.getTimeoutMinutes())
                .retryCount(workflow.getRetryCount())
                .retryDelayMinutes(workflow.getRetryDelayMinutes())
                .variables(workflow.getVariables())
                .status(workflow.getStatus())
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .build();
    }

    private WorkflowStepDto convertStepToDto(WorkflowStep step) {
        return WorkflowStepDto.builder()
                .id(step.getId())
                .workflowId(step.getWorkflowId())
                .name(step.getName())
                .description(step.getDescription())
                .stepOrder(step.getStepOrder())
                .stepType(step.getStepType())
                .actionType(step.getActionType())
                .configuration(step.getConfiguration())
                .conditions(step.getConditions())
                .inputMapping(step.getInputMapping())
                .outputMapping(step.getOutputMapping())
                .timeoutSeconds(step.getTimeoutSeconds())
                .retryCount(step.getRetryCount())
                .retryDelaySeconds(step.getRetryDelaySeconds())
                .isParallel(step.getIsParallel())
                .isOptional(step.getIsOptional())
                .errorHandling(step.getErrorHandling())
                .dependencies(step.getDependencies())
                .createdAt(step.getCreatedAt())
                .updatedAt(step.getUpdatedAt())
                .build();
    }

    private WorkflowExecutionDto convertExecutionToDto(WorkflowExecution execution) {
        return WorkflowExecutionDto.builder()
                .id(execution.getId())
                .workflowId(execution.getWorkflowId())
                .executionId(execution.getExecutionId())
                .triggeredBy(execution.getTriggeredBy())
                .triggerData(execution.getTriggerData())
                .status(execution.getStatus())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .durationMs(execution.getDurationMs())
                .currentStep(execution.getCurrentStep())
                .totalSteps(execution.getTotalSteps())
                .completedSteps(execution.getCompletedSteps())
                .failedSteps(execution.getFailedSteps())
                .retryCount(execution.getRetryCount())
                .maxRetries(execution.getMaxRetries())
                .variables(execution.getVariables())
                .inputData(execution.getInputData())
                .outputData(execution.getOutputData())
                .errorMessage(execution.getErrorMessage())
                .errorDetails(execution.getErrorDetails())
                .progressPercentage(execution.getProgressPercentage())
                .priority(execution.getPriority())
                .timeoutAt(execution.getTimeoutAt())
                .scheduledAt(execution.getScheduledAt())
                .createdAt(execution.getCreatedAt())
                .updatedAt(execution.getUpdatedAt())
                .build();
    }
}
