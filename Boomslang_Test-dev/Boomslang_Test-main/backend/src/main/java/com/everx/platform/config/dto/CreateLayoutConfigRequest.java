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
public class CreateLayoutConfigRequest {

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Layout JSON is required")
    private String layoutJson;

    private String status;
    private String appliesToRoles;
    private Boolean isDefault;
    private Boolean isActive;
}
