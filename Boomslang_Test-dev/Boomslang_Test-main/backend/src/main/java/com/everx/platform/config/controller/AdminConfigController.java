package com.everx.platform.config.controller;

import com.everx.platform.config.dto.*;
import com.everx.platform.config.service.CustomFieldService;
import com.everx.platform.config.service.LayoutConfigService;
import com.everx.platform.config.service.OptionSetService;
import com.everx.platform.config.service.WorkflowApprovalService;
import com.everx.platform.config.service.WebhookConfigService;
import com.everx.platform.config.service.WorkflowConfigService;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/config")
@RequiredArgsConstructor
public class AdminConfigController {

    private final OptionSetService optionSetService;
    private final CustomFieldService customFieldService;
    private final LayoutConfigService layoutConfigService;
    private final WorkflowConfigService workflowConfigService;
    private final WorkflowApprovalService workflowApprovalService;
    private final WebhookConfigService webhookConfigService;

    @GetMapping("/option-sets")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<OptionSetDto>>> listOptionSets(
            @RequestParam(required = false) String module) {
        return ResponseEntity.ok(ApiResponse.ok(optionSetService.listOptionSets(module)));
    }

    @PostMapping("/option-sets")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<OptionSetDto>> createOptionSet(
            @Valid @RequestBody CreateOptionSetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(optionSetService.createOptionSet(request), "Option set created"));
    }

    @PutMapping("/option-sets/{optionSetId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<OptionSetDto>> updateOptionSet(
            @PathVariable UUID optionSetId,
            @Valid @RequestBody UpdateOptionSetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(optionSetService.updateOptionSet(optionSetId, request), "Option set updated"));
    }

    @DeleteMapping("/option-sets/{optionSetId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteOptionSet(@PathVariable UUID optionSetId) {
        optionSetService.deleteOptionSet(optionSetId);
        return ResponseEntity.ok(ApiResponse.okMessage("Option set deleted"));
    }

    @PostMapping("/option-sets/{optionSetId}/values")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<OptionValueDto>> addOptionValue(
            @PathVariable UUID optionSetId,
            @Valid @RequestBody CreateOptionValueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(optionSetService.addOptionValue(optionSetId, request), "Option value created"));
    }

    @PutMapping("/option-values/{optionValueId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<OptionValueDto>> updateOptionValue(
            @PathVariable UUID optionValueId,
            @Valid @RequestBody UpdateOptionValueRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(optionSetService.updateOptionValue(optionValueId, request), "Option value updated"));
    }

    @DeleteMapping("/option-values/{optionValueId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteOptionValue(@PathVariable UUID optionValueId) {
        optionSetService.deleteOptionValue(optionValueId);
        return ResponseEntity.ok(ApiResponse.okMessage("Option value deleted"));
    }

    @GetMapping("/custom-fields")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<CustomFieldDefinitionDto>>> listCustomFields(
            @RequestParam String module,
            @RequestParam String entity,
            @RequestParam(defaultValue = "true") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(customFieldService.listDefinitions(module, entity, includeInactive)));
    }

    @PostMapping("/custom-fields")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<CustomFieldDefinitionDto>> createCustomField(
            @Valid @RequestBody CreateCustomFieldDefinitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(customFieldService.createDefinition(request), "Custom field created"));
    }

    @PutMapping("/custom-fields/{definitionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<CustomFieldDefinitionDto>> updateCustomField(
            @PathVariable UUID definitionId,
            @Valid @RequestBody UpdateCustomFieldDefinitionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(customFieldService.updateDefinition(definitionId, request), "Custom field updated"));
    }

    @DeleteMapping("/custom-fields/{definitionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomField(@PathVariable UUID definitionId) {
        customFieldService.deleteDefinition(definitionId);
        return ResponseEntity.ok(ApiResponse.okMessage("Custom field deleted"));
    }

    @GetMapping("/layouts")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<LayoutConfigDto>>> listLayouts(
            @RequestParam String module,
            @RequestParam String entity) {
        return ResponseEntity.ok(ApiResponse.ok(layoutConfigService.listLayouts(module, entity)));
    }

    @PostMapping("/layouts")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<LayoutConfigDto>> createLayout(
            @Valid @RequestBody CreateLayoutConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(layoutConfigService.createLayout(request), "Layout created"));
    }

    @PutMapping("/layouts/{layoutId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<LayoutConfigDto>> updateLayout(
            @PathVariable UUID layoutId,
            @Valid @RequestBody UpdateLayoutConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(layoutConfigService.updateLayout(layoutId, request), "Layout updated"));
    }

    @PostMapping("/layouts/{layoutId}/publish")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<LayoutConfigDto>> publishLayout(@PathVariable UUID layoutId) {
        return ResponseEntity.ok(ApiResponse.ok(layoutConfigService.publishLayout(layoutId), "Layout published"));
    }

    @DeleteMapping("/layouts/{layoutId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteLayout(@PathVariable UUID layoutId) {
        layoutConfigService.deleteLayout(layoutId);
        return ResponseEntity.ok(ApiResponse.okMessage("Layout deleted"));
    }

    @GetMapping("/workflows")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<WorkflowDefinitionDto>>> listWorkflows(
            @RequestParam String module,
            @RequestParam String entity) {
        return ResponseEntity.ok(ApiResponse.ok(workflowConfigService.listWorkflows(module, entity)));
    }

    @PostMapping("/workflows")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WorkflowDefinitionDto>> createWorkflow(
            @Valid @RequestBody CreateWorkflowDefinitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workflowConfigService.createWorkflow(request), "Workflow created"));
    }

    @PutMapping("/workflows/{workflowId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WorkflowDefinitionDto>> updateWorkflow(
            @PathVariable UUID workflowId,
            @Valid @RequestBody UpdateWorkflowDefinitionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workflowConfigService.updateWorkflow(workflowId, request), "Workflow updated"));
    }

    @DeleteMapping("/workflows/{workflowId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkflow(@PathVariable UUID workflowId) {
        workflowConfigService.deleteWorkflow(workflowId);
        return ResponseEntity.ok(ApiResponse.okMessage("Workflow deleted"));
    }

    @PostMapping("/workflows/{workflowId}/transitions")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WorkflowTransitionDto>> addTransition(
            @PathVariable UUID workflowId,
            @Valid @RequestBody CreateWorkflowTransitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workflowConfigService.addTransition(workflowId, request), "Transition created"));
    }

    @PutMapping("/workflow-transitions/{transitionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WorkflowTransitionDto>> updateTransition(
            @PathVariable UUID transitionId,
            @Valid @RequestBody UpdateWorkflowTransitionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workflowConfigService.updateTransition(transitionId, request), "Transition updated"));
    }

    @DeleteMapping("/workflow-transitions/{transitionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteTransition(@PathVariable UUID transitionId) {
        workflowConfigService.deleteTransition(transitionId);
        return ResponseEntity.ok(ApiResponse.okMessage("Transition deleted"));
    }

    @GetMapping("/approvals")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<WorkflowApprovalRequestDto>>> listApprovals(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(workflowApprovalService.listApprovals(status)));
    }

    @PostMapping("/approvals/{approvalId}/action")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WorkflowApprovalRequestDto>> actionApproval(
            @PathVariable UUID approvalId,
            @Valid @RequestBody WorkflowApprovalActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workflowApprovalService.actionApproval(approvalId, request), "Approval updated"));
    }

    @GetMapping("/webhooks")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<WebhookSubscriptionDto>>> listWebhooks() {
        return ResponseEntity.ok(ApiResponse.ok(webhookConfigService.listSubscriptions()));
    }

    @PostMapping("/webhooks")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WebhookSubscriptionDto>> createWebhook(
            @Valid @RequestBody CreateWebhookSubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(webhookConfigService.createSubscription(request), "Webhook created"));
    }

    @PutMapping("/webhooks/{subscriptionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<WebhookSubscriptionDto>> updateWebhook(
            @PathVariable UUID subscriptionId,
            @Valid @RequestBody UpdateWebhookSubscriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(webhookConfigService.updateSubscription(subscriptionId, request), "Webhook updated"));
    }

    @DeleteMapping("/webhooks/{subscriptionId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteWebhook(@PathVariable UUID subscriptionId) {
        webhookConfigService.deleteSubscription(subscriptionId);
        return ResponseEntity.ok(ApiResponse.okMessage("Webhook deleted"));
    }
}
