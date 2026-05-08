package com.everx.workflow.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateWorkflowRequest {

    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    private String tags;

    private String triggerType;

    private String triggerConfig;

    private Integer timeoutMinutes;

    private Integer retryCount;

    private Integer retryDelayMinutes;

    private String variables;
}
