package com.everx.platform.config.service;

import com.everx.platform.config.dto.*;
import com.everx.platform.config.entity.WorkflowDefinition;
import com.everx.platform.config.entity.WorkflowTransition;
import com.everx.platform.config.repository.WorkflowDefinitionRepository;
import com.everx.platform.config.repository.WorkflowTransitionRepository;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkflowConfigService {

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowTransitionRepository transitionRepository;

    @Transactional(readOnly = true)
    public List<WorkflowDefinitionDto> listWorkflows(String module, String entity) {
        return definitionRepository.findByModuleAndEntityAndIsDeletedFalseOrderByNameAsc(module, entity)
                .stream()
                .map(definition -> WorkflowDefinitionDto.fromEntity(
                        definition,
                        transitionRepository.findByWorkflowDefinitionAndIsDeletedFalseOrderByFromStatusAsc(definition)
                                .stream()
                                .map(WorkflowTransitionDto::fromEntity)
                                .toList()))
                .toList();
    }

    public WorkflowDefinitionDto createWorkflow(CreateWorkflowDefinitionRequest request) {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .module(request.getModule())
                .entity(request.getEntity())
                .name(request.getName())
                .description(request.getDescription())
                .initialStatus(request.getInitialStatus())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        WorkflowDefinition saved = definitionRepository.save(definition);
        return WorkflowDefinitionDto.fromEntity(saved, List.of());
    }

    public WorkflowDefinitionDto updateWorkflow(UUID workflowId, UpdateWorkflowDefinitionRequest request) {
        WorkflowDefinition definition = definitionRepository.findById(workflowId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow definition not found"));

        if (request.getName() != null) definition.setName(request.getName());
        if (request.getDescription() != null) definition.setDescription(request.getDescription());
        if (request.getInitialStatus() != null) definition.setInitialStatus(request.getInitialStatus());
        if (request.getIsDefault() != null) definition.setIsDefault(request.getIsDefault());
        if (request.getIsActive() != null) definition.setIsActive(request.getIsActive());

        WorkflowDefinition saved = definitionRepository.save(definition);
        List<WorkflowTransitionDto> transitions = transitionRepository
                .findByWorkflowDefinitionAndIsDeletedFalseOrderByFromStatusAsc(saved)
                .stream()
                .map(WorkflowTransitionDto::fromEntity)
                .toList();

        return WorkflowDefinitionDto.fromEntity(saved, transitions);
    }

    public void deleteWorkflow(UUID workflowId) {
        WorkflowDefinition definition = definitionRepository.findById(workflowId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow definition not found"));
        definition.softDelete();
        definitionRepository.save(definition);
    }

    public WorkflowTransitionDto addTransition(UUID workflowId, CreateWorkflowTransitionRequest request) {
        WorkflowDefinition definition = definitionRepository.findById(workflowId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow definition not found"));

        WorkflowTransition transition = WorkflowTransition.builder()
                .workflowDefinition(definition)
                .fromStatus(request.getFromStatus())
                .toStatus(request.getToStatus())
                .actionLabel(request.getActionLabel())
                .requiresApproval(request.getRequiresApproval())
                .approverRole(request.getApproverRole())
                .slaHours(request.getSlaHours())
                .escalationRole(request.getEscalationRole())
                .escalationAfterHours(request.getEscalationAfterHours())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return WorkflowTransitionDto.fromEntity(transitionRepository.save(transition));
    }

    public WorkflowTransitionDto updateTransition(UUID transitionId, UpdateWorkflowTransitionRequest request) {
        WorkflowTransition transition = transitionRepository.findById(transitionId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow transition not found"));

        if (request.getActionLabel() != null) transition.setActionLabel(request.getActionLabel());
        if (request.getRequiresApproval() != null) transition.setRequiresApproval(request.getRequiresApproval());
        if (request.getApproverRole() != null) transition.setApproverRole(request.getApproverRole());
        if (request.getSlaHours() != null) transition.setSlaHours(request.getSlaHours());
        if (request.getEscalationRole() != null) transition.setEscalationRole(request.getEscalationRole());
        if (request.getEscalationAfterHours() != null) transition.setEscalationAfterHours(request.getEscalationAfterHours());
        if (request.getIsActive() != null) transition.setIsActive(request.getIsActive());

        return WorkflowTransitionDto.fromEntity(transitionRepository.save(transition));
    }

    public void deleteTransition(UUID transitionId) {
        WorkflowTransition transition = transitionRepository.findById(transitionId)
                .orElseThrow(() -> new EntityNotFoundException("Workflow transition not found"));
        transition.softDelete();
        transitionRepository.save(transition);
    }
}
