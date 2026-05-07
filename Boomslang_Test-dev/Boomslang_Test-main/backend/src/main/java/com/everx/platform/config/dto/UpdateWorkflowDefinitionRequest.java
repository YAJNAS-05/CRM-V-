package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateWorkflowDefinitionRequest {

    private String name;
    private String description;
    private String initialStatus;
    private Boolean isDefault;
    private Boolean isActive;
}
