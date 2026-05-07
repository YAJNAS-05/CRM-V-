package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateWorkflowTransitionRequest {

    private String actionLabel;
    private Boolean requiresApproval;
    private String approverRole;
    private Integer slaHours;
    private String escalationRole;
    private Integer escalationAfterHours;
    private Boolean isActive;
}
