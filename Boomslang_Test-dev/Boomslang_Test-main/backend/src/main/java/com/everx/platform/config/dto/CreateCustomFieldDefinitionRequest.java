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
public class CreateCustomFieldDefinitionRequest {

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Data type is required")
    private String dataType;

    private String helpText;
    private String defaultValue;
    private String optionsJson;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    private Boolean isRequired;
    private Boolean isActive;
    private Boolean isSystem;
}
