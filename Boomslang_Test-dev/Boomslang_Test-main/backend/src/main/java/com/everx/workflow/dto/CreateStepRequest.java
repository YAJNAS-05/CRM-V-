package com.everx.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateStepRequest {

    @NotNull(message = "Workflow ID is required")
    private UUID workflowId;

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Step order is required")
    private Integer stepOrder;

    @NotBlank(message = "Step type is required")
    private String stepType;

    @NotBlank(message = "Action type is required")
    private String actionType;

    private String configuration; // JSON configuration

    private String conditions; // JSON conditions

    private String inputMapping; // JSON input mapping

    private String outputMapping; // JSON output mapping

    private Integer timeoutSeconds = 300;

    private Integer retryCount = 3;

    private Integer retryDelaySeconds = 60;

    private Boolean isParallel = false;

    private Boolean isOptional = false;

    private String errorHandling = "STOP";

    private String dependencies; // JSON array of dependencies
}
