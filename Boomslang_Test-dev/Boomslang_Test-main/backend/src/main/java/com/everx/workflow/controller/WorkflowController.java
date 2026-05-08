package com.everx.workflow.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.workflow.dto.*;
import com.everx.workflow.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workflow Automation", description = "APIs for workflow automation and orchestration")
public class WorkflowController {

    private final WorkflowService workflowService;

    // Workflow Management
    @PostMapping
    @Operation(summary = "Create workflow", description = "Creates a new workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #request.tenantId)")
    public ResponseEntity<ApiResponse<WorkflowDto>> createWorkflow(
            @Valid @RequestBody CreateWorkflowRequest request) {
        
        log.info("Creating workflow: {} for tenant: {}", request.getName(), request.getTenantId());
        WorkflowDto workflow = workflowService.createWorkflow(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(workflow, "Workflow created successfully"));
    }

    @GetMapping("/{workflowId}")
    @Operation(summary = "Get workflow by ID", description = "Retrieves workflow details by ID")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<WorkflowDto>> getWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        WorkflowDto workflow = workflowService.getWorkflowById(workflowId);
        return ResponseEntity.ok(ApiResponse.success(workflow));
    }

    @PutMapping("/{workflowId}")
    @Operation(summary = "Update workflow", description = "Updates an existing workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<WorkflowDto>> updateWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId,
            @Valid @RequestBody UpdateWorkflowRequest request) {
        
        log.info("Updating workflow: {}", workflowId);
        WorkflowDto workflow = workflowService.updateWorkflow(workflowId, request);
        return ResponseEntity.ok(ApiResponse.success(workflow, "Workflow updated successfully"));
    }

    @PostMapping("/{workflowId}/publish")
    @Operation(summary = "Publish workflow", description = "Publishes a workflow for execution")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<Void>> publishWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        log.info("Publishing workflow: {}", workflowId);
        workflowService.publishWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow published successfully"));
    }

    @PostMapping("/{workflowId}/pause")
    @Operation(summary = "Pause workflow", description = "Pauses a workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<Void>> pauseWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        log.info("Pausing workflow: {}", workflowId);
        workflowService.pauseWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow paused successfully"));
    }

    @PostMapping("/{workflowId}/resume")
    @Operation(summary = "Resume workflow", description = "Resumes a paused workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<Void>> resumeWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        log.info("Resuming workflow: {}", workflowId);
        workflowService.resumeWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow resumed successfully"));
    }

    @PostMapping("/{workflowId}/archive")
    @Operation(summary = "Archive workflow", description = "Archives a workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<Void>> archiveWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        log.info("Archiving workflow: {}", workflowId);
        workflowService.archiveWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow archived successfully"));
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get workflows by tenant", description = "Retrieves all workflows for a tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #tenantId)")
    public ResponseEntity<ApiResponse<List<WorkflowDto>>> getWorkflowsByTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        List<WorkflowDto> workflows = workflowService.getWorkflowsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(workflows));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get workflows by status", description = "Retrieves workflows by status")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<WorkflowDto>>> getWorkflowsByStatus(
            @Parameter(description = "Status") @PathVariable String status,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<WorkflowDto> workflows = workflowService.getWorkflowsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(workflows));
    }

    // Workflow Steps
    @PostMapping("/{workflowId}/steps")
    @Operation(summary = "Create workflow step", description = "Creates a new workflow step")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<WorkflowStepDto>> createStep(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId,
            @Valid @RequestBody CreateStepRequest request) {
        
        log.info("Creating workflow step: {} for workflow: {}", request.getName(), workflowId);
        request.setWorkflowId(workflowId);
        WorkflowStepDto step = workflowService.createStep(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(step, "Workflow step created successfully"));
    }

    @GetMapping("/{workflowId}/steps")
    @Operation(summary = "Get workflow steps", description = "Retrieves all steps for a workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<List<WorkflowStepDto>>> getStepsByWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        List<WorkflowStepDto> steps = workflowService.getStepsByWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(steps));
    }

    // Workflow Execution
    @PostMapping("/{workflowId}/execute")
    @Operation(summary = "Execute workflow", description = "Executes a workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canExecuteWorkflow(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<WorkflowExecutionDto>> executeWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId,
            @Valid @RequestBody ExecuteWorkflowRequest request) {
        
        log.info("Executing workflow: {}", workflowId);
        WorkflowExecutionDto execution = workflowService.executeWorkflow(workflowId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(execution, "Workflow execution started"));
    }

    @PostMapping("/executions/{executionId}/cancel")
    @Operation(summary = "Cancel workflow execution", description = "Cancels a running workflow execution")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #executionId)")
    public ResponseEntity<ApiResponse<Void>> cancelExecution(
            @Parameter(description = "Execution ID") @PathVariable UUID executionId,
            @Parameter(description = "Cancellation reason") @RequestParam String reason) {
        
        log.info("Cancelling workflow execution: {} with reason: {}", executionId, reason);
        workflowService.cancelExecution(executionId, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow execution cancelled"));
    }

    @PostMapping("/executions/{executionId}/retry")
    @Operation(summary = "Retry workflow execution", description = "Retries a failed workflow execution")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #executionId)")
    public ResponseEntity<ApiResponse<Void>> retryExecution(
            @Parameter(description = "Execution ID") @PathVariable UUID executionId) {
        
        log.info("Retrying workflow execution: {}", executionId);
        workflowService.retryExecution(executionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Workflow execution retry started"));
    }

    @GetMapping("/executions/{executionId}")
    @Operation(summary = "Get workflow execution", description = "Retrieves workflow execution details")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #executionId)")
    public ResponseEntity<ApiResponse<WorkflowExecutionDto>> getExecution(
            @Parameter(description = "Execution ID") @PathVariable UUID executionId) {
        
        WorkflowExecutionDto execution = workflowService.getExecutionById(executionId);
        return ResponseEntity.ok(ApiResponse.success(execution));
    }

    @GetMapping("/{workflowId}/executions")
    @Operation(summary = "Get workflow executions", description = "Retrieves all executions for a workflow")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #workflowId)")
    public ResponseEntity<ApiResponse<List<WorkflowExecutionDto>>> getExecutionsByWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {
        
        List<WorkflowExecutionDto> executions = workflowService.getExecutionsByWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.success(executions));
    }

    @GetMapping("/executions/status/{status}")
    @Operation(summary = "Get executions by status", description = "Retrieves executions by status")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<WorkflowExecutionDto>>> getExecutionsByStatus(
            @Parameter(description = "Status") @PathVariable String status,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<WorkflowExecutionDto> executions = workflowService.getExecutionsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(executions));
    }

    // Workflow Management
    @PostMapping("/process-pending")
    @Operation(summary = "Process pending executions", description = "Processes pending workflow executions")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> processPendingExecutions() {
        log.info("Processing pending workflow executions");
        workflowService.processPendingExecutions();
        return ResponseEntity.ok(ApiResponse.success(null, "Pending executions processed"));
    }

    @PostMapping("/process-retries")
    @Operation(summary = "Process retry executions", description = "Processes workflow executions ready for retry")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> processRetryExecutions() {
        log.info("Processing retry workflow executions");
        workflowService.processRetryExecutions();
        return ResponseEntity.ok(ApiResponse.success(null, "Retry executions processed"));
    }

    @PostMapping("/process-timeouts")
    @Operation(summary = "Process timeout executions", description = "Processes timed out workflow executions")
    @PreAuthorize("hasRole('SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> processTimeoutExecutions() {
        log.info("Processing timeout workflow executions");
        workflowService.processTimeoutExecutions();
        return ResponseEntity.ok(ApiResponse.success(null, "Timeout executions processed"));
    }

    // Workflow Analytics
    @GetMapping("/analytics/overview")
    @Operation(summary = "Get workflow analytics overview", description = "Retrieves workflow analytics overview")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkflowAnalyticsOverview() {
        Map<String, Object> overview = Map.of(
                "totalWorkflows", 0,
                "activeWorkflows", 0,
                "publishedWorkflows", 0,
                "totalExecutions", 0,
                "runningExecutions", 0,
                "completedExecutions", 0,
                "failedExecutions", 0
        );
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/analytics/metrics")
    @Operation(summary = "Get workflow metrics", description = "Retrieves detailed workflow metrics")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWorkflowMetrics() {
        Map<String, Object> metrics = Map.of(
                "averageExecutionTime", 0,
                "successRate", 0,
                "failureRate", 0,
                "mostUsedWorkflows", List.of(),
                "slowestWorkflows", List.of()
        );
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }
}
