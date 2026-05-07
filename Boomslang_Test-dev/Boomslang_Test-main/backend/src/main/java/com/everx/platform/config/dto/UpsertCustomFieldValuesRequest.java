package com.everx.platform.config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpsertCustomFieldValuesRequest {

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Entity ID is required")
    private String entityId;

    @NotNull(message = "Values are required")
    private List<CustomFieldValueInput> values;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomFieldValueInput {
        @NotBlank(message = "Field key is required")
        private String fieldKey;
        private String value;
    }
}
