package com.everx.platform.config.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowApprovalActionRequest {

    @NotBlank(message = "Action is required")
    private String action;

    private String notes;
}
