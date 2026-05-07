package com.everx.platform.config.dto;

import com.everx.platform.config.entity.WorkflowDefinition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDefinitionDto {

    private UUID id;
    private String module;
    private String entity;
    private String name;
    private String description;
    private String initialStatus;
    private Boolean isDefault;
    private Boolean isActive;
    private List<WorkflowTransitionDto> transitions;

    public static WorkflowDefinitionDto fromEntity(WorkflowDefinition definition, List<WorkflowTransitionDto> transitions) {
        return WorkflowDefinitionDto.builder()
                .id(definition.getId())
                .module(definition.getModule())
                .entity(definition.getEntity())
                .name(definition.getName())
                .description(definition.getDescription())
                .initialStatus(definition.getInitialStatus())
                .isDefault(definition.getIsDefault())
                .isActive(definition.getIsActive())
                .transitions(transitions)
                .build();
    }
}
