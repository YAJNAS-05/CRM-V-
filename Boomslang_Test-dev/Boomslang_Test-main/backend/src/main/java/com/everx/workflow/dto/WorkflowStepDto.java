package com.everx.workflow.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class WorkflowStepDto {
    private UUID id;
    private UUID workflowId;
    private String name;
    private String description;
    private Integer stepOrder;
    private String stepType;
    private String actionType;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
