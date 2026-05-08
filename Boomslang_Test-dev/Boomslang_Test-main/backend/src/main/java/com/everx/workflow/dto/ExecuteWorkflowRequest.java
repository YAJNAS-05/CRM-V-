package com.everx.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExecuteWorkflowRequest {

    @NotBlank(message = "Triggered by is required")
    private String triggeredBy;

    private String triggerData; // JSON trigger data

    private String inputData; // JSON input data

    private Integer priority = 0;

    private LocalDateTime scheduledAt;
}
