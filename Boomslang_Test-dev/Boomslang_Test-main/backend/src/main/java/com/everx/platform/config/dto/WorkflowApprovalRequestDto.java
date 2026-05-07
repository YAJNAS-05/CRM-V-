package com.everx.platform.config.dto;

import com.everx.platform.config.entity.WorkflowApprovalRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowApprovalRequestDto {

    private UUID id;
    private String module;
    private String entity;
    private String entityId;
    private String fromStatus;
    private String toStatus;
    private String status;
    private String approverRole;
    private String escalationRole;
    private Integer escalationAfterHours;
    private UUID requestedBy;
    private UUID approvedBy;
    private String notes;
    private OffsetDateTime dueAt;
    private OffsetDateTime slaBreachedAt;
    private OffsetDateTime escalatedAt;
    private Integer escalationLevel;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime appliedAt;

    public static WorkflowApprovalRequestDto fromEntity(WorkflowApprovalRequest request) {
        return WorkflowApprovalRequestDto.builder()
                .id(request.getId())
                .module(request.getModule())
                .entity(request.getEntity())
                .entityId(request.getEntityId())
                .fromStatus(request.getFromStatus())
                .toStatus(request.getToStatus())
                .status(request.getStatus())
                .approverRole(request.getApproverRole())
                .escalationRole(request.getEscalationRole())
                .escalationAfterHours(request.getEscalationAfterHours())
                .requestedBy(request.getRequestedBy())
                .approvedBy(request.getApprovedBy())
                .notes(request.getNotes())
                .dueAt(request.getDueAt())
                .slaBreachedAt(request.getSlaBreachedAt())
                .escalatedAt(request.getEscalatedAt())
                .escalationLevel(request.getEscalationLevel())
                .resolvedAt(request.getResolvedAt())
                .appliedAt(request.getAppliedAt())
                .build();
    }
}
