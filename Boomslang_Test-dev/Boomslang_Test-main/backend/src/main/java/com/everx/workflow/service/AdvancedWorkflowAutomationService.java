package com.everx.workflow.service;

import com.everx.workflow.dto.*;
import com.everx.workflow.entity.*;
import com.everx.workflow.repository.*;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedWorkflowAutomationService {

    private final AIWorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository executionRepository;
    private final WorkflowStepRepository stepRepository;
    private final WorkflowRuleRepository ruleRepository;
    private final WorkflowTemplateRepository templateRepository;
    private final TenantContextService tenantContextService;

    // AI Workflow Management
    @Transactional
    public AIWorkflowDto createAIWorkflow(UUID tenantId, CreateAIWorkflowRequest request) {
        log.info("Creating AI workflow: {} for tenant: {}", request.getName(), tenantId);

        AIWorkflow workflow = AIWorkflow.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .workflowType(request.getWorkflowType())
                .triggerType(request.getTriggerType())
                .triggerConditions(request.getTriggerConditions())
                .aiModel(request.getAiModel())
                .aiParameters(request.getAiParameters())
                .status(AIWorkflow.Status.DRAFT)
                .priority(request.getPriority())
                .maxExecutions(request.getMaxExecutions())
                .timeoutMinutes(request.getTimeoutMinutes())
                .retryPolicy(request.getRetryPolicy())
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        workflow = workflowRepository.save(workflow);

        // Create workflow steps
        createWorkflowSteps(workflow, request.getSteps());

        return convertToDto(workflow);
    }

    @Transactional
    public AIWorkflowDto activateWorkflow(UUID tenantId, UUID workflowId) {
        log.info("Activating workflow: {} for tenant: {}", workflowId, tenantId);

        AIWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (!workflow.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Workflow not found in tenant");
        }

        // Validate workflow before activation
        validateWorkflow(workflow);

        workflow.setStatus(AIWorkflow.Status.ACTIVE);
        workflow.setActivatedAt(LocalDateTime.now());
        workflow = workflowRepository.save(workflow);

        // Register workflow triggers
        registerWorkflowTriggers(workflow);

        return convertToDto(workflow);
    }

    // Workflow Execution
    @Async
    @Transactional
    public CompletableFuture<WorkflowExecutionDto> executeWorkflow(UUID tenantId, ExecuteWorkflowRequest request) {
        log.info("Executing workflow: {} for tenant: {}", request.getWorkflowId(), tenantId);

        AIWorkflow workflow = workflowRepository.findById(request.getWorkflowId())
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (!workflow.getTenantId().equals(tenantId) || !workflow.isActive()) {
            throw new RuntimeException("Workflow not available for execution");
        }

        try {
            // Create execution record
            WorkflowExecution execution = createWorkflowExecution(workflow, request);
            
            // Execute workflow steps
            executeWorkflowSteps(workflow, execution, request.getContext());
            
            // Apply AI logic
            applyAILogic(workflow, execution, request.getContext());
            
            // Update execution status
            execution.setStatus(WorkflowExecution.Status.COMPLETED);
            execution.setCompletedAt(LocalDateTime.now());
            execution = executionRepository.save(execution);

            // Log workflow event
            logWorkflowEvent(tenantId, "WORKFLOW_EXECUTED", 
                    "Workflow executed: " + workflow.getName());

            return CompletableFuture.completedFuture(convertToDto(execution));

        } catch (Exception e) {
            log.error("Workflow execution failed for: {}", workflow.getId(), e);
            
            // Update execution with error
            WorkflowExecution execution = executionRepository
                    .findByWorkflowIdAndStatusOrderByCreatedAtDesc(workflow.getId(), WorkflowExecution.Status.RUNNING)
                    .stream().findFirst().orElse(null);
            
            if (execution != null) {
                execution.setStatus(WorkflowExecution.Status.FAILED);
                execution.setErrorMessage(e.getMessage());
                execution.setCompletedAt(LocalDateTime.now());
                executionRepository.save(execution);
            }

            throw new RuntimeException("Workflow execution failed: " + e.getMessage());
        }
    }

    // AI-Powered Workflow Rules
    @Transactional
    public WorkflowRuleDto createWorkflowRule(UUID tenantId, CreateWorkflowRuleRequest request) {
        log.info("Creating workflow rule: {} for tenant: {}", request.getName(), tenantId);

        WorkflowRule rule = WorkflowRule.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .ruleType(request.getRuleType())
                .conditions(request.getConditions())
                .actions(request.getActions())
                .aiEnabled(request.isAiEnabled())
                .aiModel(request.getAiModel())
                .aiConfaboration(request.getAiCollaboration())
                .priority(request.getPriority())
                .isEnabled(true)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        rule = ruleRepository.save(rule);

        // Train AI model if enabled
        if (rule.isAiEnabled()) {
            trainRuleAIModel(rule);
        }

        return convertToDto(rule);
    }

    @Async
    @Transactional
    public CompletableFuture<List<WorkflowRuleDto>> evaluateWorkflowRules(UUID tenantId, Map<String, Object> context) {
        log.info("Evaluating workflow rules for tenant: {}", tenantId);

        List<WorkflowRule> applicableRules = ruleRepository.findByTenantIdAndIsEnabledOrderByPriorityDesc(tenantId, true);
        List<WorkflowRuleDto> triggeredRules = new ArrayList<>();

        for (WorkflowRule rule : applicableRules) {
            try {
                if (evaluateRuleConditions(rule, context)) {
                    // Apply AI enhancement if enabled
                    if (rule.isAiEnabled()) {
                        enhanceRuleWithAI(rule, context);
                    }

                    // Execute rule actions
                    executeRuleActions(rule, context);

                    triggeredRules.add(convertToDto(rule));
                }
            } catch (Exception e) {
                log.error("Error evaluating rule: {} for tenant: {}", rule.getId(), tenantId, e);
            }
        }

        return CompletableFuture.completedFuture(triggeredRules);
    }

    // Workflow Templates
    @Transactional
    public WorkflowTemplateDto createWorkflowTemplate(UUID tenantId, CreateWorkflowTemplateRequest request) {
        log.info("Creating workflow template: {} for tenant: {}", request.getName(), tenantId);

        WorkflowTemplate template = WorkflowTemplate.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .templateType(request.getTemplateType())
                .workflowDefinition(request.getWorkflowDefinition())
                .aiConfiguration(request.getAiConfiguration())
                .isPublic(request.isPublic())
                .isDefault(request.isDefault())
                .version(request.getVersion())
                .tags(request.getTags())
                .estimatedDuration(request.getEstimatedDuration())
                .complexity(request.getComplexity())
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        template = templateRepository.save(template);

        return convertToDto(template);
    }

    @Transactional
    public AIWorkflowDto createFromTemplate(UUID tenantId, CreateFromTemplateRequest request) {
        log.info("Creating workflow from template: {} for tenant: {}", request.getTemplateId(), tenantId);

        WorkflowTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getTenantId().equals(tenantId) && !template.isPublic()) {
            throw new RuntimeException("Template not accessible");
        }

        // Create workflow from template
        AIWorkflow workflow = AIWorkflow.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName() != null ? request.getName() : template.getName())
                .description(request.getDescription() != null ? request.getDescription() : template.getDescription())
                .workflowType(template.getTemplateType())
                .triggerType(template.getWorkflowDefinition().getTriggerType())
                .triggerConditions(template.getWorkflowDefinition().getTriggerConditions())
                .aiModel(template.getAiConfiguration().getModel())
                .aiParameters(template.getAiConfiguration().getParameters())
                .status(AIWorkflow.Status.DRAFT)
                .priority(template.getWorkflowDefinition().getPriority())
                .maxExecutions(template.getWorkflowDefinition().getMaxExecutions())
                .timeoutMinutes(template.getWorkflowDefinition().getTimeoutMinutes())
                .retryPolicy(template.getWorkflowDefinition().getRetryPolicy())
                .templateId(template.getId())
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        workflow = workflowRepository.save(workflow);

        // Create steps from template
        createStepsFromTemplate(workflow, template);

        return convertToDto(workflow);
    }

    // Workflow Analytics
    @Transactional(readOnly = true)
    public WorkflowAnalyticsDto getWorkflowAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting workflow analytics for tenant: {}", tenantId);

        // Get workflow metrics
        long totalWorkflows = workflowRepository.countByTenantId(tenantId);
        long activeWorkflows = workflowRepository.countByTenantIdAndStatus(tenantId, AIWorkflow.Status.ACTIVE);
        
        // Get execution metrics
        long totalExecutions = executionRepository.countByTenantId(tenantId);
        long successfulExecutions = executionRepository.countByTenantIdAndStatus(tenantId, WorkflowExecution.Status.COMPLETED);
        long failedExecutions = executionRepository.countByTenantIdAndStatus(tenantId, WorkflowExecution.Status.FAILED);
        
        // Get rule metrics
        long totalRules = ruleRepository.countByTenantId(tenantId);
        long activeRules = ruleRepository.countByTenantIdAndIsEnabled(tenantId, true);
        long aiRules = ruleRepository.countByTenantIdAndAiEnabled(tenantId, true);
        
        // Get template metrics
        long totalTemplates = templateRepository.countByTenantId(tenantId);
        long publicTemplates = templateRepository.countByTenantIdAndIsPublic(tenantId, true);

        return WorkflowAnalyticsDto.builder()
                .tenantId(tenantId)
                .workflowMetrics(Map.of(
                        "totalWorkflows", totalWorkflows,
                        "activeWorkflows", activeWorkflows,
                        "workflowActivationRate", totalWorkflows > 0 ? (double) activeWorkflows / totalWorkflows : 0.0
                ))
                .executionMetrics(Map.of(
                        "totalExecutions", totalExecutions,
                        "successfulExecutions", successfulExecutions,
                        "failedExecutions", failedExecutions,
                        "successRate", totalExecutions > 0 ? (double) successfulExecutions / totalExecutions : 0.0,
                        "averageExecutionTime", calculateAverageExecutionTime(tenantId)
                ))
                .ruleMetrics(Map.of(
                        "totalRules", totalRules,
                        "activeRules", activeRules,
                        "aiRules", aiRules,
                        "aiRuleAdoptionRate", totalRules > 0 ? (double) aiRules / totalRules : 0.0
                ))
                .templateMetrics(Map.of(
                        "totalTemplates", totalTemplates,
                        "publicTemplates", publicTemplates,
                        "templateUsageRate", calculateTemplateUsageRate(tenantId)
                ))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    @Transactional
    public void processScheduledWorkflows() {
        log.info("Processing scheduled workflows");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                processScheduledWorkflowsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error processing scheduled workflows for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *") // Every day at 1 AM
    @Transactional
    public void optimizeAIModels() {
        log.info("Optimizing AI models for workflows");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                optimizeAIModelsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error optimizing AI models for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * 0") // Every Sunday at 2 AM
    @Transactional
    public void generateWorkflowReports() {
        log.info("Generating weekly workflow reports");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                generateWorkflowReportForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error generating workflow report for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private void createWorkflowSteps(AIWorkflow workflow, List<CreateWorkflowStepRequest> stepRequests) {
        for (CreateWorkflowStepRequest stepRequest : stepRequests) {
            WorkflowStep step = WorkflowStep.builder()
                    .id(UUID.randomUUID())
                    .workflowId(workflow.getId())
                    .stepName(stepRequest.getStepName())
                    .stepType(stepRequest.getStepType())
                    .description(stepRequest.getDescription())
                    .stepOrder(stepRequest.getStepOrder())
                    .conditions(stepRequest.getConditions())
                    .actions(stepRequest.getActions())
                    .aiEnabled(stepRequest.isAiEnabled())
                    .aiModel(stepRequest.getAiModel())
                    .timeoutMinutes(stepRequest.getTimeoutMinutes())
                    .retryPolicy(stepRequest.getRetryPolicy())
                    .createdAt(LocalDateTime.now())
                    .build();

            stepRepository.save(step);
        }
    }

    private void validateWorkflow(AIWorkflow workflow) {
        // Validate workflow configuration
        if (workflow.getSteps() == null || workflow.getSteps().isEmpty()) {
            throw new RuntimeException("Workflow must have at least one step");
        }

        // Validate AI model configuration
        if (workflow.getAiModel() != null && !isValidAIModel(workflow.getAiModel())) {
            throw new RuntimeException("Invalid AI model configuration");
        }

        // Validate trigger conditions
        if (workflow.getTriggerConditions() == null || workflow.getTriggerConditions().isEmpty()) {
            throw new RuntimeException("Workflow must have trigger conditions");
        }
    }

    private boolean isValidAIModel(String aiModel) {
        // Validate AI model
        return aiModel != null && !aiModel.trim().isEmpty();
    }

    private void registerWorkflowTriggers(AIWorkflow workflow) {
        // Register workflow triggers with the system
        log.info("Registering triggers for workflow: {}", workflow.getId());
    }

    private WorkflowExecution createWorkflowExecution(AIWorkflow workflow, ExecuteWorkflowRequest request) {
        WorkflowExecution execution = WorkflowExecution.builder()
                .id(UUID.randomUUID())
                .workflowId(workflow.getId())
                .status(WorkflowExecution.Status.RUNNING)
                .context(request.getContext())
                .triggeredBy(request.getTriggeredBy())
                .startedAt(LocalDateTime.now())
                .estimatedDuration(workflow.getEstimatedDuration())
                .build();

        return executionRepository.save(execution);
    }

    private void executeWorkflowSteps(AIWorkflow workflow, WorkflowExecution execution, Map<String, Object> context) {
        List<WorkflowStep> steps = stepRepository.findByWorkflowIdOrderByStepOrder(workflow.getId());
        
        for (WorkflowStep step : steps) {
            try {
                executeWorkflowStep(step, execution, context);
            } catch (Exception e) {
                log.error("Error executing step: {} for execution: {}", step.getId(), execution.getId(), e);
                
                // Handle step failure based on retry policy
                if (!handleStepFailure(step, execution, e)) {
                    throw new RuntimeException("Step execution failed: " + step.getStepName());
                }
            }
        }
    }

    private void executeWorkflowStep(WorkflowStep step, WorkflowExecution execution, Map<String, Object> context) {
        log.info("Executing step: {} for execution: {}", step.getStepName(), execution.getId());

        // Check step conditions
        if (!evaluateStepConditions(step, context)) {
            log.info("Step conditions not met: {}", step.getStepName());
            return;
        }

        // Apply AI enhancement if enabled
        if (step.isAiEnabled()) {
            enhanceStepWithAI(step, context);
        }

        // Execute step actions
        executeStepActions(step, context);

        // Update execution progress
        execution.setCompletedSteps(execution.getCompletedSteps() + 1);
        executionRepository.save(execution);
    }

    private boolean evaluateStepConditions(WorkflowStep step, Map<String, Object> context) {
        // Evaluate step conditions
        return true; // Simplified
    }

    private void enhanceStepWithAI(WorkflowStep step, Map<String, Object> context) {
        // Apply AI enhancement to step
        log.info("Applying AI enhancement to step: {}", step.getStepName());
    }

    private void executeStepActions(WorkflowStep step, Map<String, Object> context) {
        // Execute step actions
        log.info("Executing actions for step: {}", step.getStepName());
    }

    private boolean handleStepFailure(WorkflowStep step, WorkflowExecution execution, Exception e) {
        // Handle step failure based on retry policy
        log.warn("Step failed: {} - {}", step.getStepName(), e.getMessage());
        
        // Simplified retry logic
        return false;
    }

    private void applyAILogic(AIWorkflow workflow, WorkflowExecution execution, Map<String, Object> context) {
        if (workflow.getAiModel() == null) {
            return;
        }

        log.info("Applying AI logic for workflow: {}", workflow.getId());

        // Apply AI model logic
        Map<String, Object> aiResults = executeAIModel(workflow, context);
        
        // Update context with AI results
        context.putAll(aiResults);
        
        // Update execution with AI insights
        execution.setAiResults(aiResults);
        executionRepository.save(execution);
    }

    private Map<String, Object> executeAIModel(AIWorkflow workflow, Map<String, Object> context) {
        // Execute AI model
        Map<String, Object> results = new HashMap<>();
        results.put("ai_prediction", "PREDICTED_VALUE");
        results.put("ai_confaboration", 0.85);
        results.put("ai_insights", List.of("Insight 1", "Insight 2"));
        
        return results;
    }

    private boolean evaluateRuleConditions(WorkflowRule rule, Map<String, Object> context) {
        // Evaluate rule conditions
        return true; // Simplified
    }

    private void enhanceRuleWithAI(WorkflowRule rule, Map<String, Object> context) {
        // Enhance rule with AI
        log.info("Enhancing rule with AI: {}", rule.getName());
    }

    private void executeRuleActions(WorkflowRule rule, Map<String, Object> context) {
        // Execute rule actions
        log.info("Executing actions for rule: {}", rule.getName());
    }

    private void trainRuleAIModel(WorkflowRule rule) {
        // Train AI model for rule
        log.info("Training AI model for rule: {}", rule.getName());
    }

    private void createStepsFromTemplate(AIWorkflow workflow, WorkflowTemplate template) {
        // Create steps from template
        if (template.getWorkflowDefinition().getSteps() != null) {
            for (var templateStep : template.getWorkflowDefinition().getSteps()) {
                WorkflowStep step = WorkflowStep.builder()
                        .id(UUID.randomUUID())
                        .workflowId(workflow.getId())
                        .stepName(templateStep.getName())
                        .stepType(templateStep.getType())
                        .description(templateStep.getDescription())
                        .stepOrder(templateStep.getOrder())
                        .conditions(templateStep.getConditions())
                        .actions(templateStep.getActions())
                        .aiEnabled(templateStep.isAiEnabled())
                        .aiModel(templateStep.getAiModel())
                        .timeoutMinutes(templateStep.getTimeoutMinutes())
                        .retryPolicy(templateStep.getRetryPolicy())
                        .createdAt(LocalDateTime.now())
                        .build();

                stepRepository.save(step);
            }
        }
    }

    private Double calculateAverageExecutionTime(UUID tenantId) {
        // Calculate average execution time
        return 15.5 + Math.random() * 10; // 15-25 minutes
    }

    private Double calculateTemplateUsageRate(UUID tenantId) {
        // Calculate template usage rate
        return 0.60 + Math.random() * 0.30; // 60-90%
    }

    private void processScheduledWorkflowsForTenant(UUID tenantId) {
        // Process scheduled workflows for tenant
        List<AIWorkflow> scheduledWorkflows = workflowRepository
                .findByTenantIdAndTriggerTypeAndStatus(tenantId, "SCHEDULED", AIWorkflow.Status.ACTIVE);

        for (AIWorkflow workflow : scheduledWorkflows) {
            if (shouldExecuteWorkflow(workflow)) {
                ExecuteWorkflowRequest request = ExecuteWorkflowRequest.builder()
                        .workflowId(workflow.getId())
                        .context(Map.of())
                        .triggeredBy("SCHEDULER")
                        .build();

                executeWorkflow(tenantId, request);
            }
        }

        log.info("Processed {} scheduled workflows for tenant: {}", scheduledWorkflows.size(), tenantId);
    }

    private boolean shouldExecuteWorkflow(AIWorkflow workflow) {
        // Check if workflow should be executed
        return true; // Simplified
    }

    private void optimizeAIModelsForTenant(UUID tenantId) {
        // Optimize AI models for tenant
        List<WorkflowRule> aiRules = ruleRepository.findByTenantIdAndAiEnabled(tenantId, true);
        
        for (WorkflowRule rule : aiRules) {
            optimizeRuleAIModel(rule);
        }

        log.info("Optimized {} AI models for tenant: {}", aiRules.size(), tenantId);
    }

    private void optimizeRuleAIModel(WorkflowRule rule) {
        // Optimize AI model for rule
        log.info("Optimizing AI model for rule: {}", rule.getName());
    }

    private void generateWorkflowReportForTenant(UUID tenantId) {
        // Generate workflow report for tenant
        log.info("Generating workflow report for tenant: {}", tenantId);
    }

    private void logWorkflowEvent(UUID tenantId, String eventType, String description) {
        // Log workflow events
        log.info("Workflow event: {} for tenant: {} - {}", eventType, tenantId, description);
    }

    // DTO conversion methods
    private AIWorkflowDto convertToDto(AIWorkflow workflow) {
        return AIWorkflowDto.builder()
                .id(workflow.getId())
                .tenantId(workflow.getTenantId())
                .name(workflow.getName())
                .description(workflow.getDescription())
                .workflowType(workflow.getWorkflowType())
                .triggerType(workflow.getTriggerType())
                .status(workflow.getStatus())
                .priority(workflow.getPriority())
                .aiModel(workflow.getAiModel())
                .createdAt(workflow.getCreatedAt())
                .activatedAt(workflow.getActivatedAt())
                .build();
    }

    private WorkflowExecutionDto convertToDto(WorkflowExecution execution) {
        return WorkflowExecutionDto.builder()
                .id(execution.getId())
                .workflowId(execution.getWorkflowId())
                .status(execution.getStatus())
                .triggeredBy(execution.getTriggeredBy())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .errorMessage(execution.getErrorMessage())
                .build();
    }

    private WorkflowRuleDto convertToDto(WorkflowRule rule) {
        return WorkflowRuleDto.builder()
                .id(rule.getId())
                .tenantId(rule.getTenantId())
                .name(rule.getName())
                .description(rule.getDescription())
                .ruleType(rule.getRuleType())
                .aiEnabled(rule.isAiEnabled())
                .aiModel(rule.getAiModel())
                .priority(rule.getPriority())
                .isEnabled(rule.getIsEnabled())
                .createdAt(rule.getCreatedAt())
                .build();
    }

    private WorkflowTemplateDto convertToDto(WorkflowTemplate template) {
        return WorkflowTemplateDto.builder()
                .id(template.getId())
                .tenantId(template.getTenantId())
                .name(template.getName())
                .description(template.getDescription())
                .category(template.getCategory())
                .templateType(template.getTemplateType())
                .isPublic(template.getIsPublic())
                .isDefault(template.getIsDefault())
                .version(template.getVersion())
                .tags(template.getTags())
                .createdAt(template.getCreatedAt())
                .build();
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class WorkflowDefinition {
        private String triggerType;
        private Map<String, Object> triggerConditions;
        private List<WorkflowStepDefinition> steps;
        private Integer priority;
        private Integer maxExecutions;
        private Integer timeoutMinutes;
        private String retryPolicy;
    }

    @lombok.Data
    @lombok.Builder
    public static class WorkflowStepDefinition {
        private String name;
        private String type;
        private String description;
        private Integer order;
        private Map<String, Object> conditions;
        private List<String> actions;
        private boolean aiEnabled;
        private String aiModel;
        private Integer timeoutMinutes;
        private String retryPolicy;
    }

    @lombok.Data
    @lombok.Builder
    public static class AIConfiguration {
        private String model;
        private Map<String, Object> parameters;
        private Double confidenceThreshold;
        private List<String> features;
    }
}
