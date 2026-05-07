package com.everx.platform.config.dto;

import com.everx.platform.config.entity.WorkflowTransition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTransitionDto {

    private UUID id;
    private UUID workflowDefinitionId;
    private String fromStatus;
    private String toStatus;
    private String actionLabel;
    private Boolean requiresApproval;
    private String approverRole;
    private Integer slaHours;
    private String escalationRole;
    private Integer escalationAfterHours;
    private Boolean isActive;

    public static WorkflowTransitionDto fromEntity(WorkflowTransition transition) {
        return WorkflowTransitionDto.builder()
                .id(transition.getId())
                .workflowDefinitionId(transition.getWorkflowDefinition().getId())
                .fromStatus(transition.getFromStatus())
                .toStatus(transition.getToStatus())
                .actionLabel(transition.getActionLabel())
                .requiresApproval(transition.getRequiresApproval())
                .approverRole(transition.getApproverRole())
                .slaHours(transition.getSlaHours())
                .escalationRole(transition.getEscalationRole())
                .escalationAfterHours(transition.getEscalationAfterHours())
                .isActive(transition.getIsActive())
                .build();
    }
}
