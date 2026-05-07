package com.everx.platform.config.dto;

import com.everx.platform.config.entity.CustomFieldDefinition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomFieldDefinitionDto {

    private UUID id;
    private String module;
    private String entity;
    private String fieldKey;
    private String label;
    private String dataType;
    private String helpText;
    private String defaultValue;
    private String optionsJson;
    private Integer sortOrder;
    private Boolean isRequired;
    private Boolean isActive;
    private Boolean isSystem;

    public static CustomFieldDefinitionDto fromEntity(CustomFieldDefinition definition) {
        return CustomFieldDefinitionDto.builder()
                .id(definition.getId())
                .module(definition.getModule())
                .entity(definition.getEntity())
                .fieldKey(definition.getFieldKey())
                .label(definition.getLabel())
                .dataType(definition.getDataType())
                .helpText(definition.getHelpText())
                .defaultValue(definition.getDefaultValue())
                .optionsJson(definition.getOptionsJson())
                .sortOrder(definition.getSortOrder())
                .isRequired(definition.getIsRequired())
                .isActive(definition.getIsActive())
                .isSystem(definition.getIsSystem())
                .build();
    }
}
