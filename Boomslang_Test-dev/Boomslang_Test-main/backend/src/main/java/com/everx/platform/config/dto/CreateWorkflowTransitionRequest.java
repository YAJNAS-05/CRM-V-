package com.everx.platform.config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWorkflowTransitionRequest {

    @NotBlank(message = "From status is required")
    private String fromStatus;

    @NotBlank(message = "To status is required")
    private String toStatus;

    private String actionLabel;

    @NotNull(message = "Requires approval is required")
    private Boolean requiresApproval;

    private String approverRole;
    private Integer slaHours;
    private String escalationRole;
    private Integer escalationAfterHours;
    private Boolean isActive;
}
