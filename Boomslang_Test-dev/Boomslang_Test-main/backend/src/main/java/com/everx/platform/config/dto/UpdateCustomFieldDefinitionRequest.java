package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomFieldDefinitionRequest {

    private String label;
    private String dataType;
    private String helpText;
    private String defaultValue;
    private String optionsJson;
    private Integer sortOrder;
    private Boolean isRequired;
    private Boolean isActive;
}
