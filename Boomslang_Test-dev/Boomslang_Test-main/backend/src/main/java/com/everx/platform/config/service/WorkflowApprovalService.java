package com.everx.platform.config.service;

import com.everx.platform.config.dto.WorkflowApprovalActionRequest;
import com.everx.platform.config.dto.WorkflowApprovalRequestDto;
import com.everx.platform.config.entity.WorkflowApprovalRequest;
import com.everx.platform.config.repository.WorkflowApprovalRequestRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkflowApprovalService {

    private final WorkflowApprovalRequestRepository approvalRepository;
    private final WorkflowNotificationService notificationService;

    @Transactional(readOnly = true)
    public List<WorkflowApprovalRequestDto> listApprovals(String status) {
        List<WorkflowApprovalRequest> approvals = status != null && !status.isBlank()
                ? ("ALL".equalsIgnoreCase(status)
                    ? approvalRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                    : approvalRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(status))
                : approvalRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc("PENDING");

        return approvals.stream().map(WorkflowApprovalRequestDto::fromEntity).toList();
    }

    public WorkflowApprovalRequestDto actionApproval(UUID approvalId, WorkflowApprovalActionRequest request) {
        WorkflowApprovalRequest approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new EntityNotFoundException("Approval request not found"));

        if (!"PENDING".equalsIgnoreCase(approval.getStatus())) {
            throw new ValidationException("Approval request is already resolved");
        }

        String action = request.getAction() != null ? request.getAction().trim().toUpperCase() : "";
        String status;
        if ("APPROVE".equals(action) || "APPROVED".equals(action)) {
            status = "APPROVED";
        } else if ("REJECT".equals(action) || "REJECTED".equals(action)) {
            status = "REJECTED";
        } else {
            throw new ValidationException("Invalid approval action");
        }

        approval.setStatus(status);
        approval.setApprovedBy(SecurityUserContext.getCurrentUserIdOrNull());
        approval.setNotes(request.getNotes());
        approval.setResolvedAt(OffsetDateTime.now());

        WorkflowApprovalRequest saved = approvalRepository.save(approval);
        notificationService.notifyApprovalResolved(saved);
        return WorkflowApprovalRequestDto.fromEntity(saved);
    }
}
