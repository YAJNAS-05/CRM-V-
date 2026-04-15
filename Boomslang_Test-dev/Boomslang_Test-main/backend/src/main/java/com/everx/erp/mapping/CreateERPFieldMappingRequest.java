package com.everx.erp.mapping;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateERPFieldMappingRequest {

    @NotBlank(message = "Source module is required")
    private String sourceModule;

    @NotBlank(message = "Target module is required")
    private String targetModule;

    @NotBlank(message = "Source field is required")
    private String sourceField;

    @NotBlank(message = "Target field is required")
    private String targetField;

    private Boolean isRequired;

    private Boolean isAutoPopulated;

    private String mappingType; // DIRECT, LOOKUP, FORMULA, STATIC

    private String lookupValues; // JSON array of available options

    private String description;
}
