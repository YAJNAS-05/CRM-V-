package com.everx.platform.config.repository;

import com.everx.platform.config.entity.WorkflowApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowApprovalRequestRepository extends JpaRepository<WorkflowApprovalRequest, UUID> {

    List<WorkflowApprovalRequest> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(String status);

    List<WorkflowApprovalRequest> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<WorkflowApprovalRequest> findByModuleAndEntityAndEntityIdAndIsDeletedFalse(
            String module, String entity, String entityId);

        Optional<WorkflowApprovalRequest> findTopByModuleAndEntityAndEntityIdAndFromStatusAndToStatusAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(
            String module, String entity, String entityId, String fromStatus, String toStatus, String status);

        Optional<WorkflowApprovalRequest> findTopByModuleAndEntityAndEntityIdAndFromStatusAndToStatusAndStatusAndIsDeletedFalseOrderByResolvedAtDesc(
            String module, String entity, String entityId, String fromStatus, String toStatus, String status);

        List<WorkflowApprovalRequest> findByStatusAndDueAtBeforeAndIsDeletedFalse(String status, OffsetDateTime dueAt);
}
