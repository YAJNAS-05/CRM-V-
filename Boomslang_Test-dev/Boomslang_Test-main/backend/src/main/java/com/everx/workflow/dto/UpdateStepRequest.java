package com.everx.workflow.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStepRequest {

    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String configuration;

    private String conditions;

    private String inputMapping;

    private String outputMapping;

    private Integer timeoutSeconds;

    private Integer retryCount;

    private Integer retryDelaySeconds;

    private Boolean isParallel;

    private Boolean isOptional;

    private String errorHandling;

    private String dependencies;
}
