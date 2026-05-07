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
public class CreateOptionSetRequest {

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Field name is required")
    private String fieldName;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private Boolean isActive;
    private Boolean isSystem;
}
