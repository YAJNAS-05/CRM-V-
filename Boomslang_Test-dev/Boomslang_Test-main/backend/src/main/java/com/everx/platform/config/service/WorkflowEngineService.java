package com.everx.platform.config.service;

import com.everx.platform.config.entity.WorkflowApprovalRequest;
import com.everx.platform.config.entity.WorkflowDefinition;
import com.everx.platform.config.entity.WorkflowTransition;
import com.everx.platform.config.repository.WorkflowApprovalRequestRepository;
import com.everx.platform.config.repository.WorkflowDefinitionRepository;
import com.everx.platform.config.repository.WorkflowTransitionRepository;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkflowEngineService {

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowTransitionRepository transitionRepository;
    private final WorkflowApprovalRequestRepository approvalRepository;
    private final WorkflowNotificationService notificationService;

    @Transactional(readOnly = true)
    public List<WorkflowTransition> getAllowedTransitions(String module, String entity, String fromStatus) {
        Optional<WorkflowDefinition> definition = definitionRepository.findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(module, entity);
        if (definition.isEmpty()) {
            return List.of();
        }
        return transitionRepository.findByWorkflowDefinitionAndIsActiveTrueAndIsDeletedFalseOrderByFromStatusAsc(definition.get())
                .stream()
                .filter(transition -> transition.getFromStatus().equalsIgnoreCase(fromStatus))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<WorkflowTransition> findTransition(String module, String entity, String fromStatus, String toStatus) {
        return getAllowedTransitions(module, entity, fromStatus).stream()
                .filter(transition -> transition.getToStatus().equalsIgnoreCase(toStatus))
                .findFirst();
    }

    @Transactional(readOnly = true)
    public boolean hasWorkflow(String module, String entity) {
        return definitionRepository.findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(module, entity).isPresent();
    }

    public void enforceTransition(String module, String entity, String entityId, String fromStatus, String toStatus) {
        Optional<WorkflowTransition> transition = findTransition(module, entity, fromStatus, toStatus);
        if (transition.isEmpty()) {
            return;
        }

        WorkflowTransition rule = transition.get();
        if (Boolean.TRUE.equals(rule.getRequiresApproval())) {
            if (consumeApprovedRequest(module, entity, entityId, fromStatus, toStatus)) {
                return;
            }
            requestApproval(module, entity, entityId, fromStatus, toStatus, rule);
            throw new ValidationException("Approval required for this transition");
        }
    }

    private boolean consumeApprovedRequest(String module, String entity, String entityId, String fromStatus, String toStatus) {
        return approvalRepository
                .findTopByModuleAndEntityAndEntityIdAndFromStatusAndToStatusAndStatusAndIsDeletedFalseOrderByResolvedAtDesc(
                        module, entity, entityId, fromStatus, toStatus, "APPROVED")
                .filter(approval -> approval.getAppliedAt() == null)
                .map(approval -> {
                    approval.setAppliedAt(OffsetDateTime.now());
                    approvalRepository.save(approval);
                    return true;
                })
                .orElse(false);
    }

    private void requestApproval(String module, String entity, String entityId, String fromStatus, String toStatus, WorkflowTransition transition) {
        Optional<WorkflowApprovalRequest> existing = approvalRepository
                .findTopByModuleAndEntityAndEntityIdAndFromStatusAndToStatusAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(
                        module, entity, entityId, fromStatus, toStatus, "PENDING");
        if (existing.isPresent()) {
            return;
        }

        OffsetDateTime dueAt = transition.getSlaHours() != null
                ? OffsetDateTime.now().plusHours(transition.getSlaHours())
                : null;

        WorkflowApprovalRequest request = WorkflowApprovalRequest.builder()
                .module(module)
                .entity(entity)
                .entityId(entityId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .status("PENDING")
                .approverRole(transition.getApproverRole())
                .escalationRole(transition.getEscalationRole())
                .escalationAfterHours(transition.getEscalationAfterHours())
                .escalationLevel(0)
                .requestedBy(SecurityUserContext.getCurrentUserIdOrNull())
                .dueAt(dueAt)
                .build();

        WorkflowApprovalRequest saved = approvalRepository.save(request);
        notificationService.notifyApprovalRequested(saved);
    }
}
